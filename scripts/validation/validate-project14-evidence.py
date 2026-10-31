"""Validate the published Project 14 provenance, PNG bytes and gallery contract."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re,struct,zlib,csv
ROOT=Path(__file__).resolve().parents[2]
PROJECT=ROOT/'projects/grafana-entra-sso'
class Gallery(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.images={};self.links=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='img':self.images[a.get('src')]=a
        if tag=='a':self.links.append(a.get('href'))
def png_dimensions(data):
    assert data[:8]==b'\x89PNG\r\n\x1a\n','Invalid PNG signature'
    offset=8;size=None;ended=False
    while offset<len(data):
        length=struct.unpack('>I',data[offset:offset+4])[0]
        tag=data[offset+4:offset+8];chunk=data[offset+8:offset+8+length]
        crc=struct.unpack('>I',data[offset+8+length:offset+12+length])[0]
        assert zlib.crc32(tag+chunk)&0xffffffff==crc,'Invalid PNG CRC'
        if tag==b'IHDR':size=struct.unpack('>II',chunk[:8])
        if tag==b'IEND':ended=True;break
        offset+=length+12
    assert size and ended,'Incomplete PNG'
    return size
m=json.loads((PROJECT/'evidence-manifest.json').read_text());g=Gallery((PROJECT/'index.html').read_text())
assert len(g.ids)==len(set(g.ids)),'Duplicate HTML IDs'
assert len(m['files'])==19,'Expected nineteen reviewed screenshot records'
assert {p.name for p in (PROJECT/'evidence').glob('*.png')}=={r['published_filename'] for r in m['files']},'Unregistered image'
inventory=list(csv.DictReader((PROJECT/'SOURCE-SCREENSHOT-INVENTORY.csv').open()))
assert len(inventory)==82 and sum(r['publication_state']=='published' for r in inventory)==19,'Incomplete source review inventory'
site=set(json.loads((ROOT/'docs/static-release/site-files.json').read_text()))
for r in m['files']:
    path=PROJECT/'evidence'/r['published_filename'];data=path.read_bytes()
    assert len(data)==r['size_bytes']>0,path
    assert hashlib.sha256(data).hexdigest()==r['sha256'],path
    assert png_dimensions(data)==(r['width'],r['height']),path
    assert not r['modified'] and not r['redacted'],path
    assert r['source_member']=='Original-Chat-Screenshots/'+r['original_filename'],path
    assert r['url']=='https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/'+path.name,path
    rel='evidence/'+path.name
    assert rel in g.links and rel in g.images,path
    assert g.images[rel].get('alt') and g.images[rel].get('loading')=='lazy',path
    assert str(path.relative_to(ROOT)) in site,path
for path in [PROJECT/'index.html',*PROJECT.glob('*.md'),PROJECT/'evidence-manifest.json']:
    text=path.read_text()
    for pattern in (r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'(?i)Bearer\s+[A-Za-z0-9_.-]{20,}',r'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.',r'(?i)(?:client_secret|api_token|password)\s*[=:]\s*[\"\x27]?[A-Za-z0-9_+/-]{16,}'):
        assert not re.search(pattern,text),'Potential credential in '+str(path)
print('PASS: 19 PNGs, CRCs, dimensions, SHA-256, provenance, gallery links, alt text, lazy loading, unique IDs, site-manifest coverage, and credential-pattern scan')
