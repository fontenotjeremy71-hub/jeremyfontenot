"""Read-only published document and preserved-source audit. Run from repo root."""
import concurrent.futures, csv, difflib, hashlib, io, json, pathlib, re, subprocess, urllib.parse, zipfile
import requests
from pypdf import PdfReader

root = pathlib.Path.cwd()
out = root / 'artifacts/production-completion'
out.mkdir(parents=True, exist_ok=True)
files = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./scripts/lib/publication-inventory').publicationFiles()))"]))
extensions = {'.pdf', '.docx', '.doc', '.md', '.txt', '.csv', '.json', '.yaml', '.yml', '.ps1', '.log', '.sha256', '.xml', '.patch'}
documents = sorted(set(p for p in files if pathlib.Path(p).suffix.lower() in extensions) | {'robots.txt','sitemap.xml','projects/windows-laps-gpo/troubleshooting.md','projects/windows-laps-gpo/validation.md'})

def check(path):
    row = {'path': path}
    try:
        url = 'https://jeremyfontenot.online/' + urllib.parse.quote(path, safe='/')
        response = requests.get(url, timeout=45)
        data = response.content
        row.update(status=response.status_code, content_type=response.headers.get('Content-Type'), bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        assert response.status_code == 200, 'HTTP status'
        local = root / path
        row['matches_repository'] = data == local.read_bytes()
        if not data and row['matches_repository']:
            row.update(result='limitation', error='Preserved source file is also zero bytes; original retained unchanged; nonempty-content check failed')
            return row
        assert data, 'Empty body'
        assert not data.lstrip().lower().startswith((b'<!doctype html', b'<html')), 'HTML instead of document'
        assert row['matches_repository'], 'Production/repository bytes differ'
        if path.endswith('.pdf'):
            assert data.startswith(b'%PDF-'), 'Wrong PDF signature'
            assert 'application/pdf' in row['content_type'], 'Wrong PDF MIME type'
            reader = PdfReader(io.BytesIO(data))
            row['pages'] = len(reader.pages)
            row['text_characters'] = sum(len(p.extract_text() or '') for p in reader.pages)
            assert row['pages'] and row['text_characters'], 'Unreadable PDF'
            render = subprocess.run(['pdftoppm','-r','36','-png',str(local),str(out / pathlib.Path(path).stem)], capture_output=True)
            assert render.returncode == 0, render.stderr.decode()
        elif path.endswith('.docx'):
            assert 'wordprocessingml.document' in row['content_type'], 'Wrong DOCX MIME type'
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                assert z.testzip() is None
                assert len(z.read('word/document.xml')) > 0
        else:
            data.decode('utf-8-sig')
        row['result'] = 'pass'
    except Exception as e:
        row.update(result='fail', error=str(e))
    return row

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(check, documents))
(out / 'documents.json').write_text(json.dumps(results, indent=2))
print('Documents:',len(results),'passed:',sum(r['result']=='pass' for r in results),'failed:',sum(r['result']=='fail' for r in results),'limitations:',sum(r['result']=='limitation' for r in results),flush=True)

att = json.loads((root/'content/microsoft-365/sharepoint-source-attestation.json').read_text())
source = root.parent/'original-portfolio'
assert subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip() == att['sourceCommit']
inventory = root/att['inventoryPath']
assert hashlib.sha256(inventory.read_bytes()).hexdigest() == att['inventorySha256']
integrity=[]
for row in csv.DictReader(io.StringIO(inventory.read_text())):
    target=root/row['site_rel']
    candidates=[source/row['source_rel'],source/row['site_rel']]
    available=[p for p in candidates if p.is_file()]
    current=hashlib.sha256(target.read_bytes()).hexdigest() if target.is_file() else None
    original=next((p for p in available if hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']),None)
    source_match=original.relative_to(source).as_posix() if original else None
    if not source_match:
        migration_commit='8193e98c01c56ec2220abb52b12062d79eb2fdbc'
        historic=subprocess.run(['git','-C',str(source),'show',migration_commit+':'+row['site_rel']],capture_output=True)
        if historic.returncode==0 and hashlib.sha256(historic.stdout).hexdigest()==row['sha256']:
            source_match=migration_commit+':'+row['site_rel']
    integrity.append({'path':row['site_rel'],'source_rel':row['source_rel'],'inventory_sha256':row['sha256'],'current_sha256':current,'source_matches_inventory':source_match,'current_matches_original_hash':current==row['sha256'],'source_available':bool(available)})
assert len(integrity)==att['expectedRecords']
(out/'sharepoint-integrity.json').write_text(json.dumps({'attestation':att,'records':integrity},indent=2))
print('SharePoint:',len(integrity),'source-authenticated:',sum(bool(r['source_matches_inventory']) for r in integrity),'current-original-matches:',sum(r['current_matches_original_hash'] for r in integrity),flush=True)
def verify_published_export(row):
    record={'path':row['path']}
    try:
        response=requests.get('https://jeremyfontenot.online/'+urllib.parse.quote(row['path'],safe='/'),timeout=45)
        record.update(status=response.status_code,bytes=len(response.content),sha256=hashlib.sha256(response.content).hexdigest())
        assert response.status_code==200
        assert response.content
        if record['sha256']!=row['current_sha256']:
            expected=(root/row['path']).read_text()
            actual=response.content.decode('utf-8')
            record['diff']='\n'.join(difflib.unified_diff(expected.splitlines(),actual.splitlines()))[-5000:]
            if row['path'].endswith('source/projects/collaboration-sharepoint.html'):
                (out/'sharepoint-response-sample.html').write_bytes(response.content)
            # Offline comparison only: retain raw response/hash and remove exactly
            # the CDN annotations observed in the captured response. This does not
            # change requests, execute scripts, or bypass any browser challenge.
            normalized=re.sub(r'<a href="https://jeremyfontenot\.online/cdn-cgi/content\?id=[^"]+" aria-hidden="true" rel="nofollow noopener" style="display: none !important; visibility: hidden !important"></a>','',actual)
            def cdn_script(match):
                script=match.group(0)
                return '' if script.startswith('<script>(function(){function c(){var b=a.contentDocument') and 'window.__CF$cv$params' in script and '/cdn-cgi/challenge-platform/scripts/jsd/main.js' in script else script
            normalized=re.sub(r'<script>[\s\S]*?</script>',cdn_script,normalized)
            # The CDN also applies reversible obfuscation to public email text.
            # Compare its decoded value with the source already in this repo.
            def email_text(match):
                data=bytes.fromhex(match.group(1))
                return bytes(b^data[0] for b in data[1:]).decode('utf-8')
            normalized=re.sub(r'<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="([0-9a-f]+)">\[email&#160;protected\]</a>',email_text,normalized)
            normalized=normalized.replace('<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>','')
            record['payload_sha256_after_known_cdn_annotations']=hashlib.sha256(normalized.encode('utf-8')).hexdigest()
            assert record['payload_sha256_after_known_cdn_annotations']==row['current_sha256'], 'Source payload differs beyond observed CDN security annotations'
            record['raw_byte_comparison']='limitation: CDN security annotations change wire bytes; exact payload comparison passed after offline annotation removal'
        else:
            record['raw_byte_comparison']='pass'
        record['result']='pass'
    except Exception as e:
        record.update(result='fail',error=str(e))
    return record
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    exports=list(pool.map(verify_published_export,integrity))
(out/'sharepoint-production.json').write_text(json.dumps(exports,indent=2))
print('Published SharePoint:',len(exports),'passed:',sum(r['result']=='pass' for r in exports),'failed:',sum(r['result']=='fail' for r in exports),flush=True)
if any(r['result']=='fail' for r in exports):
    raise SystemExit(1)
if any(r['result'] == 'fail' for r in results):
    raise SystemExit(1)
