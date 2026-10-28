/* Progressive enhancement only: all content and proof links exist in HTML. */
'use strict';
const menu = document.querySelector('.nav-toggle');
const navigation = document.getElementById('primary-nav');
if (menu && navigation) {
  menu.hidden = false;
  const narrow = window.matchMedia('(max-width: 800px)');
  const syncMenu = () => {
    navigation.dataset.collapsed = String(narrow.matches);
    menu.setAttribute('aria-expanded', String(!narrow.matches));
  };
  syncMenu();
  narrow.addEventListener('change', syncMenu);
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    navigation.dataset.collapsed = String(expanded);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && narrow.matches && menu.getAttribute('aria-expanded') === 'true') {
      menu.setAttribute('aria-expanded', 'false');
      navigation.dataset.collapsed = 'true';
      menu.focus();
    }
  });
  navigation.querySelectorAll('a').forEach(link => {
    if (link.href === window.location.href.split('#')[0]) link.setAttribute('aria-current', 'page');
  });
}
const search = document.getElementById('evidence-search');
if (search) {
  document.querySelector('.filter-tools').hidden = false;
  const items = Array.from(document.querySelectorAll('[data-search-item]'));
  const count = document.getElementById('search-count');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    items.forEach(item => {
      item.hidden = !item.textContent.toLocaleLowerCase().includes(query);
      if (!item.hidden) visible += 1;
    });
    count.textContent = `${visible} evidence groups shown`;
  });
}

// Project category filtering. All project cards remain visible without JavaScript.
const projectFilters = document.querySelectorAll('[data-project-filter]');
if (projectFilters.length) {
  const cards = Array.from(document.querySelectorAll('.project-directory [data-category]'));
  const projectCount = document.getElementById('project-count');
  projectFilters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.projectFilter;
    let visible = 0;
    cards.forEach(card => {
      card.hidden = category !== 'All projects' && card.dataset.category !== category;
      if (!card.hidden) visible++;
    });
    projectFilters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    if (projectCount) projectCount.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown`;
  }));
}
