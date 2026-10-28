"""Validate literal static pages and byte integrity; no site build or dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote, urljoin
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, sys, posixpath, xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[2]
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links=[]; self.ids=set(); self.refresh=[]; self.h1=0; self.text=[]; self.ignored=0
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ('script','style'): self.ignored+=1
        if tag=='script' and a.get('src','').startswith('https://static.cloudflareinsights.com/'): return
        if 'id' in a: self.ids.add(a['id'])
        if tag=='h1': self.h1+=1
        for key in ('href','src'):
            if key in a: self.links.append(a[key])
        if tag=='meta' and a.get('http-equiv','').lower()=='refresh':
            self.refresh.append(a.get('content','').split('url=',1)[-1])
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.ignored=max(0,self.ignored-1)
    def handle_data(self, data):
        if not self.ignored: self.text.append(data)
    def signature(self):
        return (sorted(self.links), self.ids, self.refresh, self.h1, ' '.join(' '.join(self.text).split()))
files=json.loads((ROOT/'docs/static-release/site-files.json').read_text())
manifest=json.loads((ROOT/'docs/static-release/original-files.json').read_text())
errors=[]; targets=set(files); download_targets=set(); pages={}
for row in manifest['files']:
    p=ROOT/row['retained_path']
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:
        errors.append('Original integrity: '+row['original_path'])
for name in files:
    if name.endswith('.html'): pages[name]=Page((ROOT/name).read_text())
for name,page in pages.items():
    for href in page.links+page.refresh:
        u=urlsplit(href)
        if u.scheme or u.netloc: continue
        target=posixpath.normpath(posixpath.join(posixpath.dirname(name),unquote(u.path))) if u.path else name
        if target.startswith('/'): target=target[1:]
        if target=='.': target='index.html'
        if (ROOT/target).is_dir(): target=target.rstrip('/')+'/index.html'
        if not (ROOT/target).is_file(): errors.append(name+' -> missing '+href);continue
        targets.add(target)
        if target.startswith('evidence/') and not target.endswith('.html'):download_targets.add(target)
        if u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:
            errors.append(name+' -> missing fragment '+href)
project_pages=[p for p in files if p.startswith('projects/') and p.endswith('/index.html')]
if len(project_pages)!=13:errors.append('Expected 13 project case studies')
for p in project_pages:
    if pages[p].h1!=1:errors.append(p+' must have one h1')
if (ROOT/'CNAME').read_text().strip()!='jeremyfontenot.online':errors.append('CNAME changed')
if not (ROOT/'.nojekyll').exists():errors.append('Missing .nojekyll')
css=(ROOT/'assets/css/style.css').read_text().lower()
for color in ('#080d16','#49c2c8','#b44ca5','#8adde3'):
    if color not in css: errors.append('Missing brand color '+color)
for url in ET.parse(ROOT/'sitemap.xml').getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
    target=urlsplit(url.text).path.lstrip('/') or 'index.html'
    if (ROOT/target).is_dir():target=target.rstrip('/')+'/index.html'
    if not (ROOT/target).is_file():errors.append('Sitemap missing '+target)
if '--base-url' in sys.argv:
    base=sys.argv[sys.argv.index('--base-url')+1].rstrip('/')+'/'
    # Cloudflare may minify HTML and inject its existing analytics beacon.
    # Compare HTML content/links/IDs/redirects; require exact bytes for all other assets.
    live_targets=set(files)|download_targets|{'CNAME'}
    def check(name):
        try:
            with urlopen(Request(urljoin(base,name),headers={'User-Agent':'Portfolio-Release-Validation/1.0','Cache-Control':'no-cache'}),timeout=40) as response:
                data=response.read()
                if response.status!=200:return name+': HTTP '+str(response.status)
                if name.endswith('.html'):
                    actual=Page(data.decode('utf-8'))
                    expected=Page((ROOT/name).read_text())
                    if actual.signature()!=expected.signature():
                        fields=('links','IDs','redirects','h1 count','text')
                        changed=[label for label,a,b in zip(fields,actual.signature(),expected.signature()) if a!=b]
                        return name+': HTML differs in '+', '.join(changed)
                elif data!=(ROOT/name).read_bytes():return name+': response differs from released bytes'
        except Exception as e:return name+': '+str(e)
    with ThreadPoolExecutor(max_workers=6) as pool:
        errors.extend(x for x in pool.map(check,sorted(live_targets)) if x)
    print('Production HTTP/byte checks:',len(live_targets))
print('Case studies:',len(project_pages),'HTML pages:',len(pages),'Linked targets:',len(targets),'Direct proof downloads:',len(download_targets),'Originals:',len(manifest['files']))
if errors:
    print('\n'.join(errors));sys.exit(1)
print('PASS: static routes, fragments, sitemap, branding, custom domain, and original integrity')
