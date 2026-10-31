"""Exercise static site in installed Chrome with no package or build dependencies."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
import argparse,json,os,shutil,subprocess,tempfile,threading
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--base-url');p.add_argument('--output',default='browser-review');args=p.parse_args()
chrome=next((shutil.which(x) for x in ('google-chrome','chromium','chromium-browser') if shutil.which(x)),None)
if not chrome:raise SystemExit('UNAVAILABLE: installed Chrome/Chromium required')
output=Path(args.output).resolve();output.mkdir(parents=True,exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
local=f'http://127.0.0.1:{server.server_port}'
base=(args.base_url or local).rstrip('/')
# The harness is served locally. When validating production, each target is opened
# directly for screenshots; DOM assertions use an equivalent same-origin harness
# only for the local candidate. Production HTTP/byte validation is separate.
if args.base_url:raise SystemExit('Use the production HTTP validator plus direct browser review for remote sites')
harness='''<!doctype html><html><body><pre id="result">RUNNING</pre><iframe id="site" style="border:0;height:1000px"></iframe><script>
(async()=>{const results=[];const f=document.querySelector('iframe');try{
for(const width of [390,768,1440]) for(const path of ['/index.html','/projects.html','/skills.html','/projects/grafana-entra-sso/index.html']){
 f.style.width=width+'px';await new Promise((resolve,reject)=>{f.onload=resolve;f.onerror=reject;f.src=path});
 const d=f.contentDocument;const w=f.contentWindow;let issues=[];
 if(d.documentElement.scrollWidth>w.innerWidth+1)issues.push('horizontal overflow');
 if(d.querySelectorAll('h1').length!==1)issues.push('h1 count');
 const ids=[...d.querySelectorAll('[id]')].map(x=>x.id);if(new Set(ids).size!==ids.length)issues.push('duplicate IDs');
 if(!d.querySelector('a.skip')||!d.querySelector('nav[aria-label="Primary"]'))issues.push('navigation landmarks');
 if(path.includes('grafana-entra')){
 const images=[...d.querySelectorAll('#evidence img')];if(images.length!==19)issues.push('gallery count');
 for(const im of images)im.loading='eager';
 for(let attempt=0;attempt<100&&!images.every(im=>im.complete);attempt++)await new Promise(resolve=>setTimeout(resolve,100));
 for(const im of images)if(!im.complete||!im.naturalWidth||!im.alt)issues.push('invalid or undecoded image '+im.src);
 for(const heading of d.querySelectorAll('#evidence h4'))if(heading.getBoundingClientRect().width>w.innerWidth)issues.push('heading overflow');
 }
 if(path==='/skills.html'){
  const card=d.querySelector('#cap-application-sso');
  if(!card||!card.querySelector('a[href="projects/grafana-entra-sso/index.html"]')||!card.querySelector('a[href$="P14-12-Grafana-Entra-Role-Assignment-Verified.png"]'))issues.push('missing SSO skill/proof association');
  if(!d.querySelector('#cap-linux-https'))issues.push('missing Linux/HTTPS skills');
 }
 if(path==='/projects.html'&&!d.body.innerText.includes('14 projects shown'))issues.push('project count');
 if(width===390){const button=d.querySelector('.nav-toggle');button.click();if(button.getAttribute('aria-expanded')!=='true')issues.push('mobile menu');}
 results.push({width,path,issues});
}
const failed=results.some(r=>r.issues.length);document.getElementById('result').textContent=(failed?'FAIL':'PASS')+' '+JSON.stringify(results);
}catch(e){document.getElementById('result').textContent='FAIL '+e.stack}})();</script></body></html>'''
# A temporary harness in the site root is removed even on a failed browser check.
with tempfile.NamedTemporaryFile(mode='w',suffix='.html',prefix='qa-browser-',dir=ROOT,delete=False) as f:f.write(harness);harness_path=Path(f.name)
common=[chrome,'--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars','--disable-background-timer-throttling','--disable-renderer-backgrounding','--run-all-compositor-stages-before-draw','--force-prefers-reduced-motion']
try:
 with tempfile.TemporaryDirectory() as profile:
  result=subprocess.run(common+['--user-data-dir='+profile,'--virtual-time-budget=30000','--dump-dom',local+'/'+harness_path.name],capture_output=True,text=True,timeout=90)
  (output/'browser-dom.html').write_text(result.stdout)
  if '<pre id="result">PASS ' not in result.stdout:
   print(result.stdout[-6000:]);print(result.stderr[-1500:]);raise SystemExit('FAIL: responsive browser assertions')
  print('PASS: 12 page/viewport combinations; PNG decoding; unique IDs; overflow; landmarks; mobile menu; 14-project count')
 for width in (390,768,1440):
  for label,route in [('case-study','/projects/grafana-entra-sso/index.html'),('gallery','/projects/grafana-entra-sso/index.html'),('skills','/skills.html')]:
   with tempfile.TemporaryDirectory() as profile:
    cmd=common+['--user-data-dir='+profile,'--window-size='+str(width)+(','+('25000' if label=='gallery' else ('8000' if label=='skills' else '1100'))),'--virtual-time-budget=5000','--screenshot='+str(output/f'{label}-{width}.png'),base+route]
    subprocess.run(cmd,capture_output=True,text=True,timeout=45,check=True)
 print('Screenshots:',output)
finally:
 harness_path.unlink(missing_ok=True);server.shutdown()
