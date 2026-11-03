const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('primaryMenu');
const currentYear = document.getElementById('currentYear');
const progressBar = document.querySelector('.scroll-progress');

const updateThemeButton = () => {
  if (!themeToggle) return;
  const isLight = root.dataset.theme === 'light';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  themeToggle.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  themeToggle.innerHTML = isLight
    ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8.75 8.75 0 0 1 8.8 3.5 8.76 8.76 0 1 0 20.5 15.2Z"></path></svg>'
    : '<svg class="theme-icon sun-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
};

updateThemeButton();
if (currentYear) currentYear.textContent = new Date().getFullYear();

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
  if (nextTheme === 'light') root.dataset.theme = 'light';
  else delete root.dataset.theme;
  try { localStorage.setItem('theme', nextTheme); } catch (error) { /* Storage may be unavailable. */ }
  updateThemeButton();
});

const closeMenu = () => {
  navMenu?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation menu');
};

menuToggle?.addEventListener('click', () => {
  const isOpen = navMenu?.classList.toggle('open') ?? false;
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

document.querySelectorAll('.nav-menu a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const updateScrollProgress = () => {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const updateActiveNav = () => {
  const marker = window.scrollY + window.innerHeight * 0.35;
  let current = sections[0]?.id || 'home';
  sections.forEach((section) => {
    if (marker >= section.offsetTop) current = section.id;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);
updateActiveNav();

// Rotate the short professional role line, starting with the aspiring full-stack role.
const roleText = document.getElementById('roleText');
const roles = [
  'Aspiring Full-Stack Developer',
  'Junior Front-End Developer',
  'Full-Time Student at SMP Susteran'
];
if (roleText) {
  let roleIndex = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    window.setInterval(() => {
      roleText.classList.add('role-changing');
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleText.textContent = roles[roleIndex];
        roleText.classList.remove('role-changing');
      }, 220);
    }, 2800);
  }
}

// Search and category filtering work together; category values are explicit per card.
const projectSearch = document.getElementById('projectSearch');
const projectGrid = document.getElementById('projectGrid');
const projectCards = [...(projectGrid?.querySelectorAll('.project-card') || [])];
const filterButtons = [...document.querySelectorAll('.filter-btn')];
const projectCount = document.getElementById('projectCount');
const projectEmpty = document.getElementById('projectEmpty');
let activeCategory = 'all';

const filterProjects = () => {
  const query = (projectSearch?.value || '').trim().toLocaleLowerCase();
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const name = card.querySelector('h4')?.textContent.toLocaleLowerCase() || '';
    const category = card.dataset.category || 'web';
    const matchesName = name.includes(query);
    const matchesCategory = activeCategory === 'all' || category === activeCategory;
    const visible = matchesName && matchesCategory;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (projectCount) projectCount.textContent = `${visibleCount} of ${projectCards.length} projects`;
  if (projectEmpty) projectEmpty.hidden = visibleCount !== 0;
};

projectSearch?.addEventListener('input', filterProjects);
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.filter || 'all';
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    filterProjects();
  });
});

// "/" focuses project search unless the user is already typing in a field.
document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (event.key === '/' && !isTyping && projectSearch) {
    event.preventDefault();
    projectSearch.focus();
  }
});
filterProjects();

// Reveal-on-scroll with a safe fallback for older browsers.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((element) => observer.observe(element));
} else {
  revealItems.forEach((element) => element.classList.add('visible'));
}
