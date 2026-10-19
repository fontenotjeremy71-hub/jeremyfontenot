/* Buildless enhancement layer. No network submissions, tracking, or script execution. */
(function(){
'use strict';
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function filterProjects(items,query,category){const q=query.trim().toLowerCase();return items.filter(p=>(!category||category==='All'||p.category===category)&&p.search.toLowerCase().includes(q));}
function filterEvidence(items,query,project,type,technology,skill){const q=query.trim().toLowerCase();return items.filter(e=>(!project||e.project===project)&&(!type||e.type===type)&&(!technology||e.technology===technology)&&(!skill||e.skill===skill)&&(!q||[e.name,e.path,e.description,e.result,e.skill,e.technology,e.project].join(' ').toLowerCase().includes(q)));}
function pageSlice(items,page,size){const total=Math.max(1,Math.ceil(items.length/size));const current=Math.max(0,Math.min(page,total-1));return {items:items.slice(current*size,(current+1)*size),page:current,total};}
if(typeof module!=='undefined')module.exports={filterProjects,filterEvidence,pageSlice,escapeHTML};
if(typeof document==='undefined')return;
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
let evidencePage=0,category='All',lastImageTrigger=null;
// Owner-provided portrait: added to the home and about pages without altering evidence or lab claims.
function addPortfolioPortrait(){
  const page=document.body.dataset.current;
  const host=page==='home'?document.querySelector('.hero-grid > div:first-child'):page==='about'?document.querySelector('.page-heading'):null;
  if(!host||host.querySelector('.portfolio-portrait'))return;
  const figure=document.createElement('figure');
  figure.className='portfolio-portrait';
  const photo=document.createElement('img');
  photo.src='/assets/images/jeremy-fontenot-professional-portrait.svg';
  photo.alt='Professional portrait of Jeremy C. Fontenot';
  photo.width=720;photo.height=960;photo.loading=page==='home'?'eager':'lazy';
  photo.decoding='async';
  figure.append(photo);
  if(page==='home')host.insertBefore(figure,host.firstChild);
  else host.append(figure);
}
addPortfolioPortrait();

function evidenceRender(){if(!$('#evidence-results'))return;const list=filterEvidence(window.EVIDENCE||[],$('#evidence-search').value,$('#evidence-project').value,$('#evidence-type').value,$('#evidence-technology')?.value||'',$('#evidence-skill')?.value||'');const page=pageSlice(list,evidencePage,16);evidencePage=page.page;$('#evidence-count').textContent=list.length.toLocaleString()+' source references';$('#evidence-page').textContent='Page '+(page.page+1)+' of '+page.total;$('#evidence-prev').disabled=page.page===0;$('#evidence-next').disabled=page.page===page.total-1;$('#evidence-results').innerHTML=page.items.length?page.items.map(e=>`<article class="evidence-row"><div><div class="tags"><span class="tag">${escapeHTML(e.type)}</span><span class="tag">${escapeHTML(e.technology)}</span></div><h3 style="margin-top:12px">${escapeHTML(e.name)}</h3><p>${escapeHTML(e.description)}</p>${e.result?`<p><strong>Recorded result:</strong> ${escapeHTML(e.result)}</p>`:''}<details><summary>Scope & provenance</summary><div class="document"><p><strong>Skill:</strong> ${escapeHTML(e.skill)}</p><p><strong>Project:</strong> ${escapeHTML(e.project)}</p><p>${escapeHTML(e.limitations||'Inspect the original record for its exact scope. A file listing does not establish new technical validation.')}</p><p><code>${escapeHTML(e.path)}</code></p></div></details></div><div class="evidence-actions"><a href="${escapeHTML(e.url)}" target="_blank" rel="noopener noreferrer" class="text-link">Open source ↗</a></div></article>`).join(''):'<p class="empty">No evidence matches these filters. Try a broader search or choose All projects.</p>';}
function projectRender(){const cards=$$('[data-project]');const filtered=new Set(filterProjects(cards.map((el,i)=>({i,category:el.dataset.category,search:el.dataset.search})),$('#project-search')?.value||'',category).map(x=>x.i));cards.forEach((el,i)=>el.hidden=!filtered.has(i));if($('#project-count'))$('#project-count').textContent=filtered.size+' of '+cards.length+' projects';if($('#project-empty'))$('#project-empty').hidden=filtered.size!==0;}
function closeMenu(){const menu=$('#primary-nav'),toggle=$('.nav-toggle');if(menu)menu.classList.remove('open');if(toggle)toggle.setAttribute('aria-expanded','false');}
function setupPage(){
 const current=document.body.dataset.current;$$('#primary-nav a').forEach(a=>{const active=window.PAGES?.[current]?.active;const staticActive=current.startsWith('projects/')||current.startsWith('automation')||current.startsWith('documentation')||current.startsWith('troubleshooting')||current.startsWith('additional')?'Projects':current==='architecture'?'Home Lab':current==='gallery'?'Evidence':null;const yes=active?a.textContent===active:staticActive?a.textContent===staticActive:a.dataset.route===current;if(yes)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 category='All';evidencePage=0;
 if($('#project-search')){$('#project-search').addEventListener('input',projectRender);$$('[data-category-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.categoryFilter;$$('[data-category-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));projectRender();}));projectRender();}
 if($('#evidence-search')){
  const toolbar=$('#evidence-search').closest('.toolbar');for(const [key,label] of [['technology','Technology'],['skill','Skill domain']]){let field=document.createElement('div');field.className='field';let lab=document.createElement('label');lab.htmlFor='evidence-'+key;lab.textContent=label;let select=document.createElement('select');select.id=lab.htmlFor;select.add(new Option('All '+label.toLowerCase()+'s',''));[...new Set((window.EVIDENCE||[]).map(x=>x[key]))].sort().forEach(v=>select.add(new Option(v,v)));field.append(lab,select);toolbar.append(field);}
  ['evidence-search','evidence-project','evidence-type','evidence-technology','evidence-skill'].forEach(id=>$('#'+id).addEventListener(id==='evidence-search'?'input':'change',()=>{evidencePage=0;evidenceRender();}));$('#evidence-prev').addEventListener('click',()=>{evidencePage--;evidenceRender();$('#evidence-count').scrollIntoView({block:'start'});});$('#evidence-next').addEventListener('click',()=>{evidencePage++;evidenceRender();$('#evidence-count').scrollIntoView({block:'start'});});evidenceRender();
 }
 if($('#doc-search')){const render=()=>{const q=$('#doc-search').value.toLowerCase().trim(),rows=$$('#doc-list a');let count=0;rows.forEach(a=>{a.hidden=!a.textContent.toLowerCase().includes(q);if(!a.hidden)count++;});$('#doc-count').textContent=count+' documents';};$('#doc-search').addEventListener('input',render);render();}
 $$('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
 $$('[data-image]').forEach(b=>b.addEventListener('click',()=>{lastImageTrigger=b;$('#dialog-image').src=b.dataset.image;$('#dialog-image').alt=b.dataset.caption;$('#dialog-caption').textContent=b.dataset.caption;$('#image-dialog').showModal();}));
}
function renderRoute(key,focus=true){if(!window.PAGES||!window.PAGES[key])return;const p=window.PAGES[key];document.body.dataset.current=key;document.title=p.title+' | Jeremy Fontenot';$('meta[name=description]').content=p.description;$('meta[property="og:title"]').content=p.title;$('meta[property="og:description"]').content=p.description;const can=$('link[rel=canonical]');if(can)can.remove();const crumb=key==='home'?'':`<div class="breadcrumb" aria-label="Breadcrumb"><a href="#home" data-route="home">Home</a><span>/</span>${key.startsWith('projects/')?'<a href="#projects" data-route="projects">Projects</a><span>/</span>':''}<span>${escapeHTML(p.title)}</span></div>`;$('#page-content').innerHTML=crumb+p.body;closeMenu();setupPage();window.scrollTo(0,0);if(focus)$('#main').focus({preventScroll:true});}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;if(a.dataset.anchor){e.preventDefault();const el=document.getElementById(a.dataset.anchor);if(el)el.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;}if(window.OFFLINE&&a.dataset.route){e.preventDefault();const key=a.dataset.route;if(window.PAGES[key]){if(location.hash.slice(1)===key)renderRoute(key);else location.hash=key;}}});
$('.nav-toggle')?.addEventListener('click',()=>{const open=$('#primary-nav').classList.toggle('open');$('.nav-toggle').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#primary-nav')?.classList.contains('open')){closeMenu();$('.nav-toggle').focus();}});
$('.back-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
$('#close-image')?.addEventListener('click',()=>$('#image-dialog').close());$('#image-dialog')?.addEventListener('close',()=>{if(lastImageTrigger)lastImageTrigger.focus();});
if(window.OFFLINE){window.addEventListener('hashchange',()=>{const key=location.hash.slice(1);if(window.PAGES[key])renderRoute(key);});const first=location.hash.slice(1);if(first&&window.PAGES[first])renderRoute(first,false);else setupPage();}else setupPage();
})();
