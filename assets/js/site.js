document.addEventListener('DOMContentLoaded',()=>{
  const headerLinks=[
    {href:'/',label:'Home',key:'home'},
    {href:'/systems-administration.html',label:'Readiness',key:'readiness'},
    {href:'/projects.html',label:'Projects',key:'projects'},
    {href:'/proof.html',label:'Proof',key:'proof'},
    {href:'/resume.html',label:'Resume',key:'resume'},
    {href:'/contact.html',label:'Contact',key:'contact'}
  ];

  const path=window.location.pathname.toLowerCase();
  let active='projects';
  if(path==='/'||path.endsWith('/index.html')) active='home';
  else if(path.endsWith('/systems-administration.html')) active='readiness';
  else if(path.endsWith('/projects.html')) active='projects';
  else if(path.endsWith('/proof.html')) active='proof';
  else if(path.endsWith('/resume.html')) active='resume';
  else if(path.endsWith('/contact.html')) active='contact';

  const menu=document.querySelector('.nav-links');
  if(menu){
    menu.innerHTML=headerLinks.map(link=>`<a href="${link.href}"${link.key===active?' aria-current="page"':''}>${link.label}</a>`).join('');
  }

  const footerLinks=[...headerLinks,{href:'/sitemap.xml',label:'Sitemap',key:'sitemap'}];
  let footerContainers=[...document.querySelectorAll('.footer-links,.compact-footer-links')];
  if(footerContainers.length===0){
    const footer=document.querySelector('.site-footer');
    if(footer){
      const footerNav=document.createElement('nav');
      footerNav.className='footer-links';
      footerNav.setAttribute('aria-label','Footer navigation');
      footer.prepend(footerNav);
      footerContainers=[footerNav];
    }
  }
  footerContainers.forEach(container=>{
    container.innerHTML=footerLinks.map(link=>`<a href="${link.href}">${link.label}</a>`).join('');
  });

  const button=document.querySelector('.nav-toggle');
  if(button&&menu){
    if(!menu.id) menu.id='site-navigation';
    button.setAttribute('aria-controls',menu.id);
    button.setAttribute('aria-expanded','false');
    const closeMenu=()=>{
      menu.classList.remove('is-open');
      button.setAttribute('aria-expanded','false');
    };
    button.addEventListener('click',()=>{
      const open=menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded',String(open));
    });
    menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu();});
    window.addEventListener('resize',()=>{if(window.innerWidth>1080) closeMenu();});
  }

  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
});
