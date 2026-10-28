"""Read-only published document and preserved-source audit. Run from repo root."""
import concurrent.futures, csv, hashlib, io, json, pathlib, subprocess, urllib.parse, zipfile
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
        assert data, 'Empty body'
        assert not data.lstrip().lower().startswith((b'<!doctype html', b'<html')), 'HTML instead of document'
        local = root / path
        row['matches_repository'] = data == local.read_bytes()
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
print('Documents:',len(results),'passed:',sum(r['result']=='pass' for r in results),'failed:',sum(r['result']=='fail' for r in results),flush=True)

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
    integrity.append({'path':row['site_rel'],'source_rel':row['source_rel'],'inventory_sha256':row['sha256'],'current_sha256':current,'source_matches_inventory':original.relative_to(source).as_posix() if original else None,'current_matches_original_hash':current==row['sha256'],'source_available':bool(available)})
assert len(integrity)==att['expectedRecords']
(out/'sharepoint-integrity.json').write_text(json.dumps({'attestation':att,'records':integrity},indent=2))
print('SharePoint:',len(integrity),'source-authenticated:',sum(bool(r['source_matches_inventory']) for r in integrity),'current-original-matches:',sum(r['current_matches_original_hash'] for r in integrity),flush=True)
if any(r['result'] == 'fail' for r in results):
    raise SystemExit(1)
