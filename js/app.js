const root = document.documentElement;
const loader = document.getElementById('loader');
const year = document.getElementById('year');
const localTime = document.getElementById('localTime');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const themeToggle = document.getElementById('themeToggle');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const hero = document.querySelector('.hero');
const pageDots = [...document.querySelectorAll('.page-dots a')];
const sections = [...document.querySelectorAll('section[id]')];
const header = document.querySelector('.site-header');

function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return base;
  const output = Array.isArray(base) ? [...base] : { ...base };

  Object.keys(override).forEach((key) => {
    const value = override[key];
    if (Array.isArray(value)) {
      output[key] = value;
    } else if (value && typeof value === 'object') {
      output[key] = deepMerge(output[key] && typeof output[key] === 'object' ? output[key] : {}, value);
    } else {
      output[key] = value;
    }
  });

  return output;
}

function cloneConfig(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function resolveSiteConfig() {
  const baseConfig = cloneConfig(window.SITE_CONFIG || {});

  try {
    const localConfig = localStorage.getItem('abdul-rafeh-site-config');
    if (localConfig) {
      return deepMerge(baseConfig, JSON.parse(localConfig));
    }
  } catch (error) {
    console.warn('Could not read local site config.', error);
  }

  return baseConfig;
}

const siteConfig = resolveSiteConfig();

function cssVar(name, value) {
  if (value !== undefined && value !== null && value !== '') {
    root.style.setProperty(name, value);
  }
}

function applyConfiguredThemeVars(theme) {
  const colors = siteConfig?.design?.colors?.[theme] || {};
  cssVar('--bg', colors.bg);
  cssVar('--panel', colors.panel);
  cssVar('--panel-soft', colors.panelSoft);
  cssVar('--text', colors.text);
  cssVar('--muted', colors.muted);
  cssVar('--line', colors.line);
  cssVar('--glass', colors.glass);
}

function applyDesignVars() {
  const typography = siteConfig?.design?.typography || {};
  const spacing = siteConfig?.design?.spacing || {};
  const animations = siteConfig?.design?.animations || {};
  const layout = siteConfig?.design?.layout || {};
  const media = siteConfig?.design?.media || {};

  document.body.classList.toggle('captions-hidden', media.showCaptions === false);

  cssVar('--cfg-hero-size', typography.heroSize);
  cssVar('--cfg-hero-line-height', typography.heroLineHeight);
  cssVar('--cfg-hero-letter-spacing', typography.heroLetterSpacing);
  cssVar('--cfg-heading-size', typography.headingSize);
  cssVar('--cfg-heading-line-height', typography.headingLineHeight);
  cssVar('--cfg-heading-letter-spacing', typography.headingLetterSpacing);
  cssVar('--cfg-project-title-size', typography.projectTitleSize);
  cssVar('--cfg-project-line-height', typography.projectLineHeight);
  cssVar('--cfg-project-letter-spacing', typography.projectLetterSpacing);
  cssVar('--cfg-body-size', typography.bodySize);
  cssVar('--cfg-body-line-height', typography.bodyLineHeight);
  cssVar('--cfg-section-padding-top', spacing.sectionPaddingTop);
  cssVar('--cfg-section-padding-bottom', spacing.sectionPaddingBottom);
  cssVar('--pad', spacing.pagePadding);
  cssVar('--cfg-line-duration', animations.lineDuration);
  cssVar('--cfg-stack-duration', animations.stackDuration);
  cssVar('--cfg-line-delay', animations.lineDelay);

  document.body.classList.toggle('project-layout-grid', layout.projectLayout === 'grid');
  document.body.classList.toggle('project-layout-compact', layout.projectLayout === 'compact');
  document.body.classList.toggle('project-layout-editorial', !layout.projectLayout || layout.projectLayout === 'list');
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function lineHTML(lines) {
  const safeLines = Array.isArray(lines) ? lines : [lines];
  return safeLines.map((line) => `<span class="line"><span>${escapeHTML(line)}</span></span>`).join('');
}

function setLineHTML(selector, lines) {
  const element = document.querySelector(selector);
  if (element && lines !== undefined) element.innerHTML = lineHTML(lines);
}

function setPlainText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.textContent = value;
}

function slugify(value) {
  return String(value || 'project')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'project';
}

function getYouTubeId(url = '') {
  const value = String(url || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || '';
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v') || '';
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0])) return parts[1] || '';
    }
  } catch {
    const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([^?&/]+)/);
    return match?.[1] || '';
  }

  return '';
}

function isYouTubeURL(value = '') {
  return /(?:youtube\.com|youtu\.be)/i.test(String(value || '')) && Boolean(getYouTubeId(value));
}

function youtubeEmbedURL(url = '') {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` : '';
}

function youtubeWatchURL(url = '') {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : String(url || '');
}

function youtubeThumbnailURL(url = '') {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : '';
}

function isLocalFilePreview() {
  return window.location.protocol === 'file:';
}

function mediaHTML(mediaItem = {}) {
  const kind = mediaItem.kind === 'video' ? 'video' : 'image';
  const size = ['wide', 'tall'].includes(mediaItem.size) ? mediaItem.size : '';
  const rawVideoPath = mediaItem.youtube || mediaItem.path || '';
  const path = mediaItem.path || (kind === 'video' ? rawVideoPath || 'assets/videos/placeholder.mp4' : 'assets/images/placeholder.jpg');
  const labelSource = kind === 'video' ? (rawVideoPath || path) : path;
  const caption = mediaItem.caption || `${kind === 'video' ? 'Video' : 'Image'} Placeholder / ${labelSource.split('/').pop()}`;

  if (kind === 'video') {
    const youtubeURL = mediaItem.youtube || (isYouTubeURL(path) ? path : '');
    const embedURL = youtubeEmbedURL(youtubeURL);

    if (embedURL) {
      const watchURL = youtubeWatchURL(youtubeURL);
      const thumbURL = youtubeThumbnailURL(youtubeURL);

      if (isLocalFilePreview()) {
        return `
          <figure class="media-slot video-slot youtube-video-slot youtube-local-preview ${size}" data-label="${escapeHTML(youtubeURL)}" data-youtube-src="${escapeHTML(embedURL)}">
            <a class="youtube-local-preview-link" href="${escapeHTML(watchURL)}" target="_blank" rel="noopener" style="background-image:url('${escapeHTML(thumbURL)}')">
              <span class="youtube-local-preview-overlay">
                <strong>Open YouTube Video</strong>
                <small>YouTube embeds need localhost or a live website. This link works in local file preview.</small>
              </span>
            </a>
            <figcaption>${escapeHTML(caption)}</figcaption>
          </figure>`;
      }

      return `
        <figure class="media-slot video-slot youtube-video-slot ${size}" data-label="${escapeHTML(youtubeURL)}" data-youtube-src="${escapeHTML(embedURL)}">
          <iframe src="${escapeHTML(embedURL)}" title="${escapeHTML(caption)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          <figcaption>${escapeHTML(caption)}</figcaption>
        </figure>`;
    }

    return `
      <figure class="media-slot video-slot ${size}" data-label="${escapeHTML(path)}">
        <video src="${escapeHTML(path)}" muted loop playsinline preload="metadata"></video>
        <figcaption>${escapeHTML(caption)}</figcaption>
      </figure>`;
  }

  return `
    <figure class="media-slot image-slot ${size}" data-label="${escapeHTML(path)}">
      <img src="${escapeHTML(path)}" alt="${escapeHTML(mediaItem.alt || caption)}" loading="lazy">
      <figcaption>${escapeHTML(caption)}</figcaption>
    </figure>`;
}

function projectHTML(project = {}, index = 0) {
  const slug = project.slug || slugify(project.title);
  const visibleMedia = (project.media || []).filter((item) => item.visible !== false);
  const imageMedia = visibleMedia.filter((item) => item.kind !== 'video');
  const videoMedia = visibleMedia.filter((item) => item.kind === 'video');

  return `
    <article class="project-card" data-project="${escapeHTML(slug)}">
      <button class="project-trigger magnet" type="button" aria-expanded="${index === 0 ? 'true' : 'false'}">
        <span class="project-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="project-title">${escapeHTML(project.title || 'Untitled Project')}</span>
        <span class="project-type">${escapeHTML(project.type || 'Still Renders / Video')}</span>
        <span class="project-arrow">↗</span>
      </button>
      <div class="project-panel">
        <div class="project-media-grid">
          ${imageMedia.map(mediaHTML).join('')}
        </div>
        ${videoMedia.length ? `<div class="project-video-stack">${videoMedia.map(mediaHTML).join('')}</div>` : ''}
        <div class="project-copy line-reveal" data-stagger="0.05">
          ${lineHTML(project.copy || ['Project description coming soon.'])}
        </div>
      </div>
    </article>`;
}

function applySiteContent(config) {
  if (!config) return;

  if (config.meta?.siteTitle) document.title = config.meta.siteTitle;

  document.querySelectorAll('.brand').forEach((brand) => {
    brand.textContent = config.brand?.name || brand.textContent;
  });

  const email = config.brand?.email || 'hello@rafeh3d.com';
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = `mailto:${email}`;
  });

  const contactBtn = document.querySelector('.contact-btn');
  if (contactBtn) contactBtn.textContent = 'Contact Now ↗';

  const navigation = config.navigation || [];

  const mobileMenuEl = document.querySelector('.mobile-menu');
  if (mobileMenuEl) {
    mobileMenuEl.innerHTML = [
      ...navigation.map((item) => `<a href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a>`),
      `<a href="mailto:${escapeHTML(email)}">Email ↗</a>`
    ].join('');
  }

  const navLinksEl = document.querySelector('.nav-links');
  if (navLinksEl) {
    navLinksEl.innerHTML = navigation
      .map((item) => `<a class="magnet" href="${escapeHTML(item.href)}">/${escapeHTML(item.label)}</a>`)
      .join('');
  }

  setLineHTML('.hero-topline', config.hero?.topline);
  setLineHTML('.hero-title', config.hero?.title);
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) heroTitle.setAttribute('aria-label', (config.hero?.title || []).join(' '));
  setLineHTML('.hero-description', config.hero?.description);

  setPlainText('.hero-aside .aside-block:nth-child(1) span', config.hero?.servicesLabel);
  const serviceList = document.querySelector('.hero-aside .aside-block:nth-child(1) ul');
  if (serviceList && config.hero?.services) {
    serviceList.innerHTML = config.hero.services.map((item) => `<li>${escapeHTML(item)}</li>`).join('');
  }
  setPlainText('.hero-aside .aside-block:nth-child(2) span', config.hero?.locationLabel);
  setPlainText('.hero-aside .aside-block:nth-child(2) p', config.hero?.location);
  const scrollCueText = document.querySelector('.scroll-cue .line span');
  if (scrollCueText && config.hero?.scrollCue) scrollCueText.textContent = config.hero.scrollCue;

  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack && config.intro?.marquee) {
    const items = [...config.intro.marquee, ...config.intro.marquee];
    marqueeTrack.innerHTML = items.map((item) => `<span>${escapeHTML(item)}</span>`).join('');
  }

  setLineHTML('.intro-text', config.intro?.text);
  setLineHTML('#work .eyebrow', config.work?.eyebrow);
  setLineHTML('#work .section-heading h2', config.work?.heading);

  setLineHTML('#services .eyebrow', config.services?.eyebrow);
  setLineHTML('#services .section-heading h2', config.services?.heading);
  const serviceRows = document.querySelector('.service-list');
  if (serviceRows && config.services?.items) {
    serviceRows.innerHTML = config.services.items.map((item, index) => `
      <article class="service-row">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.text)}</p>
      </article>`).join('');
  }

  setLineHTML('#about .eyebrow', config.about?.eyebrow);
  setLineHTML('#about .about-heading h2', config.about?.heading);
  setLineHTML('#about .about-copy', config.about?.copy);

  const aboutPortrait = document.querySelector('.about-portrait');
  const aboutImage = document.querySelector('.about-portrait img');
  const aboutCaption = document.querySelector('.about-portrait figcaption');
  if (config.about?.portrait?.path) {
    aboutPortrait?.setAttribute('data-label', config.about.portrait.path);
    if (aboutImage) {
      aboutImage.src = config.about.portrait.path;
      aboutImage.alt = config.about.portrait.alt || 'Portrait';
    }
    if (aboutCaption) aboutCaption.textContent = config.about.portrait.caption || config.about.portrait.path;
  }

  setLineHTML('#contact .eyebrow', config.contact?.eyebrow);
  setLineHTML('.contact-title', config.contact?.heading);
  setLineHTML('.contact-note', config.contact?.note);

  const emailCard = document.querySelector('.email-card');
  if (emailCard) {
    emailCard.href = `mailto:${email}`;
    emailCard.querySelector('span').textContent = config.contact?.emailLabel || 'Email';
    emailCard.querySelector('strong').textContent = email;
    emailCard.querySelector('em').textContent = config.contact?.emailCTA || 'Start a project ↗';
  }

  const socialCards = document.querySelectorAll('.social-card');
  if (socialCards[0]) {
    socialCards[0].href = config.brand?.instagram || '#';
    socialCards[0].querySelector('span').textContent = config.contact?.instagramLabel || 'Instagram';
    socialCards[0].querySelector('strong').textContent = `${config.brand?.instagramLabel || 'Instagram'} ↗`;
  }
  if (socialCards[1]) {
    socialCards[1].href = config.brand?.artstation || '#';
    socialCards[1].querySelector('span').textContent = config.contact?.artstationLabel || 'ArtStation';
    socialCards[1].querySelector('strong').textContent = `${config.brand?.artstationLabel || 'Portfolio'} ↗`;
  }

  const backTop = document.querySelector('.back-top');
  if (backTop && config.contact?.backTop) backTop.textContent = config.contact.backTop;

  const projectList = document.getElementById('projectList');
  if (projectList && config.projects) {
    const projects = config.projects.filter((project) => project.visible !== false);
    projectList.innerHTML = projects.map(projectHTML).join('');
  }

  applyDesignVars();
}



if (year) year.textContent = new Date().getFullYear();

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('abdul-rafeh-theme', theme);

  applyConfiguredThemeVars(theme);
  applyDesignVars();

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const themeBg = siteConfig?.design?.colors?.[theme]?.bg || (theme === 'light' ? '#f3f0e8' : '#000000');
  if (metaTheme) metaTheme.setAttribute('content', themeBg);

  const label = themeToggle?.querySelector('.theme-toggle-text');
  if (label) label.textContent = theme === 'light' ? 'Dark' : 'Light';

  window.dispatchEvent(new CustomEvent('site-theme-change'));
}

const savedTheme = localStorage.getItem('abdul-rafeh-theme');
setTheme(savedTheme || 'dark');

themeToggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') || 'dark';
  setTheme(current === 'light' ? 'dark' : 'light');
});

window.addEventListener('load', () => {
  setTimeout(() => loader?.classList.add('hidden'), 520);
});

function updateKarachiTime() {
  if (!localTime) return;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  localTime.textContent = formatter.format(new Date());
}

updateKarachiTime();
setInterval(updateKarachiTime, 1000 * 30);

function prepareLineStaggers() {
  document.querySelectorAll('.line-reveal').forEach((block) => {
    const customDelay = block.dataset.stagger;
    if (customDelay) block.style.setProperty('--line-delay', `${customDelay}s`);

    block.querySelectorAll('.line').forEach((line, index) => {
      line.style.setProperty('--line-index', index);
    });
  });

  document.querySelectorAll('.reveal-stack').forEach((stack) => {
    [...stack.children].forEach((child, index) => {
      child.style.setProperty('--stack-index', index);
    });
  });

  document.querySelectorAll('.service-list').forEach((list) => {
    [...list.children].forEach((child, index) => {
      child.style.setProperty('--stack-index', index);
    });
  });
}

applySiteContent(siteConfig);
prepareLineStaggers();

menuBtn?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  mobileMenu?.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuBtn?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('aria-hidden', 'true');
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980 && mobileMenu?.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.observe, .project-card, .line-reveal, .reveal-stack, .service-row, .about-portrait').forEach((el) => revealObserver.observe(el));

const activeSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    pageDots.forEach((dot) => dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`));
  });
}, { threshold: 0.48 });

sections.forEach((section) => activeSectionObserver.observe(section));

function setActiveProject(card, isActive) {
  const trigger = card.querySelector('.project-trigger');
  card.classList.toggle('active', isActive);
  trigger?.setAttribute('aria-expanded', String(isActive));

  card.querySelectorAll('video').forEach((video) => {
    if (isActive && video.getAttribute('src')) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

document.querySelectorAll('.project-card').forEach((card, index) => {
  if (index === 0) setActiveProject(card, true);

  const trigger = card.querySelector('.project-trigger');
  trigger?.addEventListener('click', () => {
    const isActive = !card.classList.contains('active');
    setActiveProject(card, isActive);
  });
});

function markMediaState() {
  document.querySelectorAll('.media-slot img').forEach((img) => {
    const slot = img.closest('.media-slot');
    const loaded = () => slot?.classList.add('loaded');
    const missing = () => slot?.classList.remove('loaded');

    img.addEventListener('load', loaded);
    img.addEventListener('error', missing);

    if (img.complete && img.naturalWidth > 0) loaded();
  });

  document.querySelectorAll('.media-slot video').forEach((video) => {
    const slot = video.closest('.media-slot');
    video.addEventListener('loadedmetadata', () => slot?.classList.add('loaded'));
    video.addEventListener('error', () => slot?.classList.remove('loaded'));
  });

  document.querySelectorAll('.media-slot iframe').forEach((iframe) => {
    iframe.closest('.media-slot')?.classList.add('loaded');
  });
}

markMediaState();

function initHeroCanvasGrid() {
  class dotGrid {
    constructor(container = "heroGridCanvas") {
      this.canvasElement = document.getElementById(container);
      if (!this.canvasElement) return;

      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.drawable = this.canvasElement.getBoundingClientRect();

      this.canvasWidth = this.drawable.width * this.dpr;
      this.canvasHeight = this.drawable.height * this.dpr;

      this.canvasElement.width = this.canvasWidth;
      this.canvasElement.height = this.canvasHeight;

      this.mouseX = this.drawable.width / 2;
      this.mouseY = this.drawable.height / 2;
      this.pendingFrame = false;

      this.canvas = this.canvasElement.getContext("2d", { alpha: true });
      this.canvas.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.theme = root.getAttribute("data-theme") || "dark";
      this.dotColor = this.theme === "light" ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.26)";
    }

    resize() {
      if (!this.canvasElement) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.drawable = this.canvasElement.getBoundingClientRect();

      this.canvasWidth = this.drawable.width * this.dpr;
      this.canvasHeight = this.drawable.height * this.dpr;

      this.canvasElement.width = this.canvasWidth;
      this.canvasElement.height = this.canvasHeight;
      this.canvas.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.requestDraw();
    }

    updateTheme() {
      this.theme = root.getAttribute("data-theme") || "dark";
      this.dotColor = this.theme === "light" ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.26)";
      this.requestDraw();
    }

    onMouseUpdate(e) {
      this.mouseX = e.clientX - this.drawable.left;
      this.mouseY = e.clientY - this.drawable.top;

      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", `${e.clientX - heroRect.left}px`);
        hero.style.setProperty("--my", `${e.clientY - heroRect.top}px`);
      }

      this.requestDraw();
    }

    requestDraw() {
      if (this.pendingFrame) return;
      this.pendingFrame = true;

      window.requestAnimationFrame(() => {
        this.pendingFrame = false;
        this.draw();
      });
    }

    init() {
      this.requestDraw();

      hero?.addEventListener("mousemove", this.onMouseUpdate.bind(this), false);
      hero?.addEventListener("touchmove", (e) => {
        const touch = e.touches?.[0];
        if (!touch) return;
        this.onMouseUpdate(touch);
      }, { passive: true });

      window.addEventListener("resize", this.resize.bind(this));
      window.addEventListener("site-theme-change", this.updateTheme.bind(this));
    }

    draw() {
      if (!this.canvas) return;
      this.canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawDots();
    }

    drawDots() {
      let size = 1;
      let gridSize = 20;
      let width = this.canvasWidth / this.dpr;
      let height = this.canvasHeight / this.dpr;

      for (var i = 2; i < width / gridSize - 1; i++) {
        for (var j = 2; j < height / gridSize - 1; j++) {
          let x = i * gridSize;
          let y = j * gridSize;
          let dist = this.pythag(x, y, this.mouseX, this.mouseY);

          this.canvas.beginPath();
          this.canvas.arc(
            x + ((x - this.mouseX) / dist) * gridSize,
            y + ((y - this.mouseY) / dist) * gridSize,
            size,
            size,
            Math.PI,
            true
          );
          this.canvas.fillStyle = this.dotColor;
          this.canvas.fill();
        }
      }
    }

    pythag(ellipseX, ellipseY, mouseX, mouseY) {
      let x = mouseX;
      let y = mouseY;

      if (Number.isNaN(x) || Number.isNaN(y)) {
        return 1;
      } else {
        let leg1 = Math.abs(x - ellipseX);
        let leg2 = Math.abs(y - ellipseY);
        let pyth = Math.pow(leg1, 2) + Math.pow(leg2, 2);
        return Math.max(Math.sqrt(pyth), 1);
      }
    }
  }

  const grid = new dotGrid("heroGridCanvas");
  grid.init();
}

initHeroCanvasGrid();

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (finePointer) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, { passive: true });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.135;
    ringY += (mouseY - ringY) * 0.135;
    if (cursorRing) cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  const setLinkCursor = (active) => cursorRing?.classList.toggle('link-hover', active);
  const setProjectCursor = (active) => cursorRing?.classList.toggle('project-hover', active);

  document.querySelectorAll('a, button, .media-slot').forEach((item) => {
    item.addEventListener('mouseenter', () => setLinkCursor(true));
    item.addEventListener('mouseleave', () => setLinkCursor(false));
  });

  document.querySelectorAll('.project-card, .project-trigger, .project-panel, .media-slot').forEach((item) => {
    item.addEventListener('mouseenter', () => setProjectCursor(true));
    item.addEventListener('mouseleave', () => setProjectCursor(false));
  });

  document.querySelectorAll('.magnet').forEach((item) => {
    item.addEventListener('mousemove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    }, { passive: true });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translate(0, 0)';
    });
  });

}


function initProjectLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'project-lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <button class="project-lightbox__close" type="button" aria-label="Close image viewer">×</button>
    <button class="project-lightbox__arrow project-lightbox__arrow--prev" type="button" aria-label="Previous image">‹</button>
    <div class="project-lightbox__stage" role="dialog" aria-modal="true" aria-label="Project media viewer">
      <div class="project-lightbox__media"></div>
    </div>
    <button class="project-lightbox__arrow project-lightbox__arrow--next" type="button" aria-label="Next image">›</button>
  `;
  document.body.appendChild(lightbox);

  const mediaMount = lightbox.querySelector('.project-lightbox__media');
  const closeBtn = lightbox.querySelector('.project-lightbox__close');
  const prevBtn = lightbox.querySelector('.project-lightbox__arrow--prev');
  const nextBtn = lightbox.querySelector('.project-lightbox__arrow--next');

  let projectItems = [];
  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function getMediaInfo(slot) {
    const image = slot.querySelector('img');
    const video = slot.querySelector('video');
    const iframe = slot.querySelector('iframe');

    if (iframe) {
      return {
        type: 'youtube',
        src: slot.dataset.youtubeSrc || iframe.getAttribute('src'),
      };
    }

    if (video) {
      return {
        type: 'video',
        src: video.currentSrc || video.getAttribute('src'),
      };
    }

    if (image) {
      return {
        type: 'image',
        src: image.currentSrc || image.getAttribute('src'),
        alt: image.getAttribute('alt') || '',
      };
    }

    return null;
  }

  function renderCurrent() {
    const item = projectItems[currentIndex];
    if (!item) return;

    mediaMount.innerHTML = '';

    if (item.type === 'youtube') {
      const iframe = document.createElement('iframe');
      iframe.src = item.src;
      iframe.title = 'Project video';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.className = 'project-lightbox__youtube';
      mediaMount.appendChild(iframe);
    } else if (item.type === 'video') {
      const wrap = document.createElement('div');
      wrap.className = 'project-lightbox__video-wrap';

      const video = document.createElement('video');
      video.src = item.src;
      video.controls = false;
      video.autoplay = false;
      video.loop = false;
      video.muted = false;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('disablepictureinpicture', '');
      video.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback nofullscreen');

      const playButton = document.createElement('button');
      playButton.className = 'project-lightbox__play';
      playButton.type = 'button';
      playButton.setAttribute('aria-label', 'Play video');
      playButton.innerHTML = '<span></span>';

      playButton.addEventListener('click', () => {
        video.play();
        playButton.hidden = true;
        wrap.classList.add('is-playing');
      });

      video.addEventListener('pause', () => {
        if (!video.ended) video.play();
      });

      video.addEventListener('ended', () => {
        playButton.hidden = false;
        wrap.classList.remove('is-playing');
        video.currentTime = 0;
      });

      wrap.appendChild(video);
      wrap.appendChild(playButton);
      mediaMount.appendChild(wrap);
    } else {
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt || '';
      mediaMount.appendChild(image);
    }

    prevBtn.hidden = currentIndex <= 0;
    nextBtn.hidden = currentIndex >= projectItems.length - 1;
  }

  function openLightbox(slot) {
    const projectCard = slot.closest('.project-card');
    if (!projectCard) return;

    const slots = [...projectCard.querySelectorAll('.media-slot')];
    projectItems = slots.map(getMediaInfo).filter((item) => item && item.src);
    currentIndex = slots.indexOf(slot);

    if (currentIndex < 0 || !projectItems[currentIndex]) return;

    renderCurrent();

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    mediaMount.innerHTML = '';
  }

  function go(direction) {
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= projectItems.length) return;
    currentIndex = nextIndex;
    renderCurrent();
  }

  document.addEventListener('click', (event) => {
    const slot = event.target.closest('.media-slot');
    if (!slot) return;
    openLightbox(slot);
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.classList.contains('project-lightbox__stage')) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  });

  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches?.[0]?.clientX || 0;
  }, { passive: true });

  lightbox.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches?.[0]?.clientX || 0;
    const delta = touchEndX - touchStartX;

    if (Math.abs(delta) < 48) return;
    if (delta > 0) go(-1);
    if (delta < 0) go(1);
  }, { passive: true });
}

initProjectLightbox();


let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  const goingDown = currentScroll > lastScroll && currentScroll > 140;
  if (header) header.style.transform = goingDown ? 'translate(-50%, -120%)' : 'translate(-50%, 0)';
  lastScroll = currentScroll;
}, { passive: true });
