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
  const host=page==='home'?document.querySelector('.hero-grid > div:nth-child(2)'):page==='about'?document.querySelector('.page-heading'):null;
  if(!host||host.querySelector('.portfolio-portrait'))return;
  host.classList.add('with-portrait');
  if(page==='home'){
    const diagram=host.querySelector('.blueprint');
    const caption=host.querySelector('.hero-caption');
    const hero=host.closest('.hero');
    if(diagram&&hero&&!document.querySelector('.portfolio-lab-overview')){
      const overview=document.createElement('section');
      overview.className='portfolio-lab-overview';
      overview.setAttribute('aria-label','Documented home lab architecture');
      overview.append(diagram);
      if(caption)overview.append(caption);
      hero.insertAdjacentElement('afterend',overview);
    }
  }
  const figure=document.createElement('figure');
  figure.className='portfolio-portrait';
  const photo=document.createElement('img');
  photo.src='/assets/images/jeremy-fontenot-ear-corrected.svg';
  photo.alt='Jeremy C. Fontenot, professional portrait';
  photo.width=736;photo.height=752;photo.loading=page==='home'?'eager':'lazy';
  photo.decoding='async';
  figure.append(photo);
  host.append(figure);
}
addPortfolioPortrait();

/* Reuse existing issuer badges and source-recorded verification links on the certifications page. */
function enhanceCertificationBadges(){
  if(document.body.dataset.current!=='certifications')return;
  const badges={
    'Azure Fundamentals':['microsoft-azure-fundamentals.avif','https://www.credly.com/badges/8838aad9-8b5f-49c1-b86c-ebc18dc9c78e/public_url'],
    'IT Fundamentals+':['comptia-itf+.avif','https://www.credly.com/badges/e507d3b8-ea86-41e0-850a-13125c605600/public_url'],
    'A+':['comptia-a+.avif','https://www.credly.com/badges/ed5a8406-ac3c-452e-b16a-7391121a9017/public_url'],
    'Server+':['comptia-server+.avif','https://www.credly.com/badges/b66d70df-dc88-41d0-a6ab-69121db024cb/public_url'],
    'MTA Windows Server Administration Fundamentals':['mta-windows-server.avif','https://www.credly.com/badges/5d2fc462-e31b-4a19-84ba-879b482702c8/public_url'],
    'MTA Networking Fundamentals':['mta-networking.avif','https://www.credly.com/badges/e04b2e18-a633-4888-8ca3-7c29b11cc5e1/public_url'],
    'MTA Security Fundamentals':['mta-security.avif','https://www.credly.com/badges/55677dea-a367-4d81-9797-cfb7acc303f2/public_url'],
    'Linux Essentials':['lpi_badge.png','https://www.credly.com/badges/e04654a2-97ae-4fdf-a0fb-0b6781fa15da/public_url'],
    'IT Support Professional Certificate':['google-it-support.avif','https://coursera.org/share/7c60238042c8b222b94183692de1d75b'],
    'Introduction to Cybersecurity':['cisco.avif','https://www.credly.com/badges/612a8588-58c0-46f3-b68c-c10de91dcbdc/public_url']
  };
  for(const card of document.querySelectorAll('.credential')){
    const name=card.querySelector('h3')?.textContent.trim();
    const match=badges[name];if(!match)continue;
    const mark=card.querySelector('.credential-mark');if(!mark)continue;
    const link=document.createElement('a');
    link.className='credential-badge-link';
    link.href=match[1];link.target='_blank';link.rel='noopener noreferrer';
    link.setAttribute('aria-label','View credential for '+name);
    const img=document.createElement('img');
    img.src='/assets/certifications/badges/'+match[0];
    img.alt=name+' credential badge';
    img.width=88;img.height=88;img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>{link.replaceWith(mark);});
    link.append(img);mark.replaceWith(link);
    const details=card.querySelector('div:last-child');
    if(details){
      const source=details.querySelector('p:last-child');
      if(source?.textContent.includes('Listed in verified source resume'))source.textContent='Credential recorded in portfolio resume';
      const verify=document.createElement('a');
      verify.className='credential-verify';
      verify.href=match[1];verify.target='_blank';verify.rel='noopener noreferrer';
      verify.textContent='View credential ↗';details.append(verify);
    }
  }
  const school=[...document.querySelectorAll('.panel')].find(x=>x.textContent.includes('MyComputerCareer'));
  if(school && !school.querySelector('.school-badge')){
    const a=document.createElement('a');a.className='school-badge';
    a.href='/assets/certifications/badges/Jeremy_Chant_Fontenot_WCITP1_thumb_web.png';
    a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label','View WCITP award image');
    const img=document.createElement('img');
    img.src='/assets/certifications/badges/Jeremy_Chant_Fontenot_WCITP1_thumb_web.avif';
    img.alt='WCITP award';img.width=85;img.height=85;img.loading='lazy';
    a.append(img);school.append(a);
  }
  const introduction=document.querySelector('.page-heading .lead');
  if(introduction)introduction.textContent='Education and credentials are supported by the repository resume. Existing issuer badge images and previously recorded credential links are displayed where available; current expiration and renewal status remain subject to independent confirmation.';
  const disclaimer=document.querySelector('.reference-snapshot');
  if(disclaimer)disclaimer.textContent='Official credential badge images and previously recorded credential links are shown where available. Current expiration or renewal status has not been independently rechecked. Credentials without a matching badge retain text labels.';
}
enhanceCertificationBadges();


function evidenceRender(){if(!$('#evidence-results'))return;const list=filterEvidence(window.EVIDENCE||[],$('#evidence-search').value,$('#evidence-project').value,$('#evidence-type').value,$('#evidence-technology')?.value||'',$('#evidence-skill')?.value||'');const page=pageSlice(list,evidencePage,16);evidencePage=page.page;$('#evidence-count').textContent=list.length.toLocaleString()+' source references';$('#evidence-page').textContent='Page '+(page.page+1)+' of '+page.total;$('#evidence-prev').disabled=page.page===0;$('#evidence-next').disabled=page.page===page.total-1;$('#evidence-results').innerHTML=page.items.length?page.items.map(e=>`<article class="evidence-row"><div><div class="tags"><span class="tag">${escapeHTML(e.type)}</span><span class="tag">${escapeHTML(e.technology)}</span></div><h3 style="margin-top:12px">${escapeHTML(e.name)}</h3><p>${escapeHTML(e.description)}</p>${e.result?`<p><strong>Recorded result:</strong> ${escapeHTML(e.result)}</p>`:''}<details><summary>Scope & provenance</summary><div class="document"><p><strong>Skill:</strong> ${escapeHTML(e.skill)}</p><p><strong>Project:</strong> ${escapeHTML(e.project)}</p><p>${escapeHTML(e.limitations||'Inspect the original record for its exact scope. A file listing does not establish new technical validation.')}</p><p><code>${escapeHTML(e.path)}</code></p></div></details></div><div class="evidence-actions"><a href="${escapeHTML(e.url)}" target="_blank" rel="noopener noreferrer" class="text-link">Open source ↗</a></div></article>`).join(''):'<p class="empty">No evidence matches these filters. Try a broader search or choose All projects.</p>';}
function projectRender(){const cards=$$('[data-project]');const filtered=new Set(filterProjects(cards.map((el,i)=>({i,category:el.dataset.category,search:el.dataset.search})),$('#project-search')?.value||'',category).map(x=>x.i));cards.forEach((el,i)=>el.hidden=!filtered.has(i));if($('#project-count'))$('#project-count').textContent=filtered.size+' of '+cards.length+' projects';if($('#project-empty'))$('#project-empty').hidden=filtered.size!==0;}
function closeMenu(){const menu=$('#primary-nav'),toggle=$('.nav-toggle');if(menu)menu.classList.remove('open');if(toggle)toggle.setAttribute('aria-expanded','false');}
function repairProjectNavigation(){
  const page=document.body.dataset.current;
  // The generated macOS evidence gallery contains a nested anchor: HTML parser
  // leaves an empty clickable parent before the descriptive screenshot link.
  if(page==='projects/macos-abm-intune-runbook'){
    for(const a of document.querySelectorAll('a[href*="evidence-board-security.webp"]')){
      if(!a.textContent.trim()&&!a.querySelector('img'))a.remove();
    }
  }
  // A section jump is not direct evidence; distinguish narrative analysis from
  // retained artifacts so link text makes an accurate promise.
  for(const a of document.querySelectorAll('a[href="#validation"]')){
    if(a.textContent.trim()==='Validation & results')a.textContent='Results and discussion';
  }
  if(page==='projects/windows-autopilot-intune'){
    for(const a of document.querySelectorAll('a[href="/macos-abm-intune-runbook.html"]')){
      if(a.textContent.includes('Read case study'))a.textContent='Explore related macOS project ↗';
    }
  }
}
function setupPage(){
 repairProjectNavigation();
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
