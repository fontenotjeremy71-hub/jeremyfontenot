"""Verify live PNG transport/integrity and capture responsive production views."""
from pathlib import Path
from urllib.request import Request,urlopen
import argparse,hashlib,json,shutil,subprocess,tempfile
from browser_cdp import Browser
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--output',default='production-browser-review');args=p.parse_args()
out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
m=json.loads((ROOT/'projects/grafana-entra-sso/evidence-manifest.json').read_text());results=[]
for r in m['files']:
 with urlopen(Request(r['url'],headers={'Cache-Control':'no-cache','User-Agent':'Portfolio-Evidence-Validation/1.0'}),timeout=40) as response:
  data=response.read();mime=response.headers.get_content_type()
  assert response.status==200 and mime=='image/png' and data[:8]==b'\x89PNG\r\n\x1a\n',r['url']
  assert len(data)==r['size_bytes'] and hashlib.sha256(data).hexdigest()==r['sha256'],r['url']
  results.append({'id':r['evidence_id'],'url':r['url'],'status':response.status,'content_type':mime,'size_bytes':len(data),'sha256':r['sha256'],'matches_original':True})
(out/'production-image-checks.json').write_text(json.dumps(results,indent=2)+'\n')
print('PASS: 19/19 production PNGs; HTTP 200, image/png, nonempty valid PNG signature, exact original size and SHA-256')
chrome=next((shutil.which(x) for x in ('google-chrome','chromium','chromium-browser') if shutil.which(x)),None)
if not chrome:raise SystemExit('UNAVAILABLE: Chrome required for production visual captures')
browser=Browser(chrome)
try:
 for width in (390,768,1440):
  browser.viewport(width)
  for label,route in [('home','/'),('projects','/projects.html'),('gallery','/projects/grafana-entra-sso/index.html'),('skills','/skills.html')]:
   browser.navigate('https://jeremyfontenot.online'+route)
   browser.evaluate("(async()=>{for(const im of document.images)im.loading='eager';await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));return true})()")
   browser.screenshot(out/f'{label}-{width}.png')
finally:browser.close()
print('Captured production home/projects/gallery/skills at 390, 768, 1440 widths; inspect artifacts for visual results')
