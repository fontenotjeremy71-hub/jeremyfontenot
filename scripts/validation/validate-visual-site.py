"""Audit every linked/current route and redirect; render every page at three widths."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,urljoin,unquote
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from concurrent.futures import ThreadPoolExecutor
import argparse,json,posixpath,re,shutil,threading,time,traceback
from browser_cdp import Browser
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--base-url');p.add_argument('--static-only',action='store_true');p.add_argument('--output',default='visual-site-review');args=p.parse_args()
out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
routes=json.loads((ROOT/'docs/static-release/visual-routes.json').read_text())['routes'];names={r['path']for r in routes}
originals=json.loads((ROOT/'docs/static-release/original-files.json').read_text());immutable={r['retained_path']for r in originals['files']}
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.ids=[];self.links=[];self.footers=0;self.h1=0;self.css=[];self.feed(text)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id'in a:self.ids.append(a['id'])
  if t=='h1':self.h1+=1
  if t=='footer'and'site-footer'in a.get('class',''):self.footers+=1
  if t=='a':self.links.append((a.get('href',''),'download'in a))
  if t=='link'and a.get('rel')=='stylesheet':self.css.append(a.get('href',''))
errors=[];source_downloads=set()
for route in routes:
 n=route['path'];text=(ROOT/n).read_text();page=Page(text)
 if len(set(page.ids))!=len(page.ids):errors.append(n+': duplicate IDs')
 if page.h1!=1:errors.append(n+': expected one primary heading')
 if page.footers!=1 or 'top'not in page.ids or page.links.count(('#top',False))<2:errors.append(n+': footer/top control contract')
 if not any('style.css?v=signature-1'in x for x in page.css):errors.append(n+': current branded stylesheet missing')
 for href,download in page.links:
  u=urlsplit(href)
  if u.scheme or u.netloc or not u.path:continue
  target=posixpath.normpath(posixpath.join(posixpath.dirname(n),unquote(u.path)))
  if (ROOT/target).is_dir():target+='/index.html'
  if target.endswith(('.html','.htm')):
   if target in immutable:
    if not download:errors.append(n+': source HTML must be an explicit original download: '+target)
    source_downloads.add(target)
   elif target not in names:errors.append(n+': unaudited HTML route '+target)
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(routes)} route sources, shared branded footers/top controls, complete internal HTML coverage, {len(source_downloads)} preserved HTML downloads',flush=True)
if args.static_only:raise SystemExit(0)
chrome=next((shutil.which(x)for x in ('google-chrome','chromium','chromium-browser')if shutil.which(x)),None)
if not chrome:raise SystemExit('Installed Chrome required for visual audit')
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=None
if args.base_url:base=args.base_url.rstrip('/')+'/'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}/'
checks=r'''(async()=>{
 const issues=[];const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
 if(new Set(ids).size!==ids.length)issues.push('duplicate IDs');
 if(document.querySelectorAll('h1').length!==1)issues.push('primary heading');
 if(document.documentElement.scrollWidth>innerWidth+1)issues.push('horizontal overflow '+document.documentElement.scrollWidth+'/'+innerWidth);
 if(!document.querySelector('main')||!document.querySelector('a.skip')||!document.querySelector('nav[aria-label="Primary"]'))issues.push('landmarks');
 const footer=document.querySelector('footer.site-footer');if(!footer||getComputedStyle(footer.querySelector('.footer-directory')).display!=='grid')issues.push('unbranded footer');
 if(!document.querySelector('footer a.footer-top[href="#top"]'))issues.push('footer top control');
 if(getComputedStyle(document.documentElement).getPropertyValue('--accent-cyan').trim()!=='#49c2c8')issues.push('brand palette');
 const images=[...document.images];for(const im of images)im.loading='eager';
 await Promise.race([Promise.all(images.map(im=>im.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,10000))]);
 for(const im of images)if(!im.complete||!im.naturalWidth)issues.push('image '+im.getAttribute('src'));
 const menu=document.querySelector('.nav-toggle');if(innerWidth<=800){menu.click();if(menu.getAttribute('aria-expanded')!=='true')issues.push('mobile menu');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));if(menu.getAttribute('aria-expanded')!=='false')issues.push('menu escape');}
 const search=document.querySelector('#evidence-search');if(search){search.value='Grafana';search.dispatchEvent(new Event('input',{bubbles:true}));const feature=document.querySelector('#grafana-entra-proof');if(!feature||feature.hidden||!feature.classList.contains('panel')||!feature.classList.contains('evidence-feature'))issues.push('SSO evidence styling/search');if(!document.querySelector('#search-count').textContent.startsWith('1 '))issues.push('evidence count');search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
 const source=document.querySelector('[data-source-list]');if(source){if([...source.children].filter(x=>!x.hidden).length!==50)issues.push('inventory pagination');const input=document.querySelector('#source-search');input.value='grafana';input.dispatchEvent(new Event('input',{bubbles:true}));const shown=[...source.children].filter(x=>!x.hidden);if(shown.some(x=>!x.textContent.toLowerCase().includes('grafana')))issues.push('inventory search');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}
 scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,70));if(scrollY>550&&document.querySelector('[data-back-to-top]').dataset.visible!=='true')issues.push('floating top control');footer.querySelector('.footer-top').click();await new Promise(r=>setTimeout(r,100));if(scrollY>2)issues.push('back to top behavior');
 return {url:location.href,title:document.title,width:innerWidth,height:document.documentElement.scrollHeight,images:images.length,issues};
})()'''
def lane(width):
 browser=Browser(chrome);browser.viewport(width);results=[];directory=out/str(width);directory.mkdir(exist_ok=True)
 try:
  for route in routes:
   n=route['path'];browser.events=[]
   try:
    browser.navigate(urljoin(base,n));result=browser.evaluate(checks)
    if route['redirect_to']:
     expected=urlsplit(urljoin(urljoin(base,n),route['redirect_to'])).path
     actual=urlsplit(result['url']).path
     if args.base_url and n=='powershell-automation.html'and actual=='/projects.html':expected=actual
     if actual!=expected:result['issues'].append('redirect destination '+actual+' != '+expected)
    if browser.events:result['issues'].append('uncaught script exception')
    if route['kind']!='redirect':browser.screenshot(directory/(n.replace('/','--')+'.png'))
    result['source_route']=n;results.append(result)
    if result['issues']:print('FAIL',width,n,result['issues'],flush=True)
   except Exception as error:results.append({'source_route':n,'width':width,'issues':[str(error)]});print('FAIL',width,n,str(error),flush=True)
  (out/f'checks-{width}.json').write_text(json.dumps(results,indent=2)+'\n');print('Reviewed',width,len(results),'routes',flush=True);return results
 finally:browser.close()
try:
 with ThreadPoolExecutor(max_workers=3) as pool:results=[row for lane_rows in pool.map(lane,[360,768,1440])for row in lane_rows]
 summary={'base_url':base,'route_sources':len(routes),'content_pages':sum(r['kind']!='redirect'for r in routes),'redirects':sum(r['kind']=='redirect'for r in routes),'preserved_source_html_downloads':len(source_downloads),'checks':len(results),'failures':[r for r in results if r['issues']]}
 (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
 if summary['failures']:raise SystemExit('Visual/browser audit failures: '+str(len(summary['failures'])))
 print('PASS:',len(results),'route/viewport checks; all linked pages and redirects; screenshots, footer, menu, evidence search, source inventory, back to top',flush=True)
finally:
 if server:server.shutdown()
