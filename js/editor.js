const STORAGE_KEY = 'abdul-rafeh-site-config';

function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return base;
  const output = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(override).forEach((key) => {
    const value = override[key];
    if (Array.isArray(value)) output[key] = value;
    else if (value && typeof value === 'object') output[key] = deepMerge(output[key] && typeof output[key] === 'object' ? output[key] : {}, value);
    else output[key] = value;
  });
  return output;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

const baseConfig = clone(window.SITE_CONFIG || {});
let config = (() => {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? deepMerge(baseConfig, JSON.parse(local)) : clone(baseConfig);
  } catch {
    return clone(baseConfig);
  }
})();

let historyReady = false;
let historyStack = [JSON.stringify(config)];
let historyIndex = 0;
let historyDebounce = null;

function syncHistoryButtons() {
  const undo = document.getElementById('undoChange');
  const redo = document.getElementById('redoChange');
  if (undo) undo.disabled = historyIndex <= 0;
  if (redo) redo.disabled = historyIndex >= historyStack.length - 1;
}

function commitHistory() {
  if (!historyReady) return;
  const snapshot = JSON.stringify(config);
  if (historyStack[historyIndex] === snapshot) return;

  historyStack = historyStack.slice(0, historyIndex + 1);
  historyStack.push(snapshot);

  if (historyStack.length > 80) {
    historyStack.shift();
  } else {
    historyIndex += 1;
  }

  syncHistoryButtons();
}

function restoreHistory(direction) {
  const nextIndex = historyIndex + direction;
  if (nextIndex < 0 || nextIndex >= historyStack.length) return;

  historyIndex = nextIndex;
  config = JSON.parse(historyStack[historyIndex]);

  bindBasicInputs();
  renderServices();
  renderProjects();
  updateOutput(false);
  refreshPreview();
  syncHistoryButtons();
}

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let target = obj;
  parts.slice(0, -1).forEach((part) => {
    if (!target[part] || typeof target[part] !== 'object') target[part] = {};
    target = target[part];
  });
  target[parts.at(-1)] = value;
}

function asLines(value) {
  if (Array.isArray(value)) return value.join('\n');
  return value || '';
}

function fromLines(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function configCode() {
  return `window.SITE_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
}

function parseImportedConfig(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/window\.SITE_CONFIG\s*=\s*([\s\S]*?);?\s*$/);
  if (match) {
    return JSON.parse(match[1]);
  }

  const equalIndex = trimmed.indexOf('=');
  if (equalIndex !== -1) {
    let possibleJSON = trimmed.slice(equalIndex + 1).trim();
    if (possibleJSON.endsWith(';')) possibleJSON = possibleJSON.slice(0, -1);
    return JSON.parse(possibleJSON);
  }

  throw new Error('Could not read config. Please upload site-config.js or a valid JSON config.');
}

function loadConfigIntoEditor(nextConfig, shouldSave = true) {
  config = deepMerge(clone(baseConfig), nextConfig);

  bindBasicInputs();
  renderServices();
  renderProjects();
  updateOutput(false);

  historyStack = [JSON.stringify(config)];
  historyIndex = 0;
  syncHistoryButtons();

  if (shouldSave) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    refreshPreview();
  }
}

async function importConfigFile(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const imported = parseImportedConfig(text);
    loadConfigIntoEditor(imported, true);
    toast('Config imported. You can keep editing now.');
  } catch (error) {
    console.error(error);
    alert(error.message || 'Could not import this config file.');
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  updateOutput();
  refreshPreview();
  toast('Saved preview in this browser.');
}

function downloadConfig() {
  updateFromInputs();
  const blob = new Blob([configCode()], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'site-config.js';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toast(message) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:9999;background:#f6f3ec;color:#000;padding:12px 16px;border-radius:999px;font:600 13px Inter,sans-serif;box-shadow:0 18px 60px rgba(0,0,0,.35)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function bindBasicInputs() {
  $$('[data-path]').forEach((input) => {
    const path = input.dataset.path;
    const value = getByPath(config, path);

    if (input.dataset.lines === 'true') input.value = asLines(value);
    else if (input.dataset.boolean === 'true') input.value = String(value !== false);
    else input.value = value ?? '';

    input.addEventListener('input', () => {
      let newValue;
      if (input.dataset.lines === 'true') newValue = fromLines(input.value);
      else if (input.dataset.boolean === 'true') newValue = input.value === 'true';
      else newValue = input.value;

      setByPath(config, path, newValue);
      updateOutput();
    });
  });
}

function serviceCard(item, index) {
  const card = document.createElement('article');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="item-top">
      <strong>Service ${String(index + 1).padStart(2, '0')}</strong>
      <div class="mini-actions">
        <button data-action="service-up">↑</button>
        <button data-action="service-down">↓</button>
        <button data-action="service-remove">Remove</button>
      </div>
    </div>
    <div class="grid two">
      <label>Title <input data-field="title" value="${escapeAttr(item.title || '')}"></label>
      <label>Description <textarea data-field="text">${escapeText(item.text || '')}</textarea></label>
    </div>
  `;

  card.querySelector('[data-field="title"]').addEventListener('input', (event) => {
    config.services.items[index].title = event.target.value;
    updateOutput();
  });
  card.querySelector('[data-field="text"]').addEventListener('input', (event) => {
    config.services.items[index].text = event.target.value;
    updateOutput();
  });
  card.querySelector('[data-action="service-up"]').addEventListener('click', () => moveItem(config.services.items, index, index - 1, renderServices));
  card.querySelector('[data-action="service-down"]').addEventListener('click', () => moveItem(config.services.items, index, index + 1, renderServices));
  card.querySelector('[data-action="service-remove"]').addEventListener('click', () => {
    config.services.items.splice(index, 1);
    renderServices();
    updateOutput();
    commitHistory();
  });

  return card;
}

function renderServices() {
  const root = $('#serviceEditor');
  root.innerHTML = '';
  (config.services.items || []).forEach((item, index) => root.appendChild(serviceCard(item, index)));
}

function projectCard(project, index) {
  const card = document.createElement('article');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="item-top">
      <strong>${String(index + 1).padStart(2, '0')} / ${escapeText(project.title || 'Untitled Project')}</strong>
      <div class="mini-actions">
        <button data-action="project-up">↑</button>
        <button data-action="project-down">↓</button>
        <button data-action="project-duplicate">Duplicate</button>
        <button data-action="project-remove">Remove</button>
      </div>
    </div>

    <div class="grid two">
      <label>Visible
        <select data-project-field="visible">
          <option value="true">Visible</option>
          <option value="false">Hidden</option>
        </select>
      </label>
      <label>Slug <input data-project-field="slug" value="${escapeAttr(project.slug || '')}"></label>
      <label>Title <input data-project-field="title" value="${escapeAttr(project.title || '')}"></label>
      <label>Type <input data-project-field="type" value="${escapeAttr(project.type || '')}"></label>
      <label>Project copy <textarea data-project-field="copy" data-lines="true">${escapeText(asLines(project.copy || []))}</textarea></label>
    </div>

    <div class="stack media-editor"></div>
    <button data-action="add-media">Add image/video</button>
  `;

  card.querySelector('[data-project-field="visible"]').value = project.visible === false ? 'false' : 'true';

  card.querySelectorAll('[data-project-field]').forEach((field) => {
    field.addEventListener('input', () => {
      const key = field.dataset.projectField;
      if (key === 'copy') project[key] = fromLines(field.value);
      else if (key === 'visible') project[key] = field.value === 'true';
      else project[key] = field.value;
      updateOutput();
    });
  });

  card.querySelector('[data-action="project-up"]').addEventListener('click', () => moveItem(config.projects, index, index - 1, renderProjects));
  card.querySelector('[data-action="project-down"]').addEventListener('click', () => moveItem(config.projects, index, index + 1, renderProjects));
  card.querySelector('[data-action="project-duplicate"]').addEventListener('click', () => {
    const copy = clone(project);
    copy.title = `${copy.title || 'Project'} Copy`;
    copy.slug = `${copy.slug || 'project'}-copy`;
    config.projects.splice(index + 1, 0, copy);
    renderProjects();
    updateOutput();
    commitHistory();
  });
  card.querySelector('[data-action="project-remove"]').addEventListener('click', () => {
    config.projects.splice(index, 1);
    renderProjects();
    updateOutput();
    commitHistory();
  });
  card.querySelector('[data-action="add-media"]').addEventListener('click', () => {
    project.media = project.media || [];
    project.media.push({
      kind: 'image',
      size: 'normal',
      path: 'assets/images/new-image.jpg',
      alt: project.title || 'Project image',
      caption: 'Image Placeholder / new-image.jpg',
    });
    renderProjects();
    updateOutput();
    commitHistory();
  });

  const mediaRoot = card.querySelector('.media-editor');
  (project.media || []).forEach((media, mediaIndex) => {
    mediaRoot.appendChild(mediaCard(media, project, index, mediaIndex));
  });

  return card;
}

function mediaCard(media, project, projectIndex, mediaIndex) {
  const row = document.createElement('div');
  row.className = 'media-row';
  row.innerHTML = `
    <label>Type
      <select data-media-field="kind">
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
    </label>
    <label>Size
      <select data-media-field="size">
        <option value="normal">Normal</option>
        <option value="wide">Wide</option>
        <option value="tall">Tall</option>
      </select>
    </label>
    <label>Path / YouTube URL <input data-media-field="path" placeholder="assets/videos/video.mp4 or https://youtu.be/..." value="${escapeAttr(media.path || '')}"></label>
    <label>Caption <input data-media-field="caption" value="${escapeAttr(media.caption || '')}"></label>
    <label>Alt text <input data-media-field="alt" value="${escapeAttr(media.alt || '')}"></label>
    <label>Pick file for preview
      <input type="file" data-media-upload accept="image/*,video/*">
      <span class="asset-note">For MP4, pick a local file and upload it to GitHub later. For YouTube, set Type to Video and paste the YouTube link in Path / YouTube URL.</span>
    </label>
    <div class="mini-actions">
      <button data-action="media-up">↑</button>
      <button data-action="media-down">↓</button>
      <button data-action="media-remove">Remove media</button>
    </div>
  `;

  row.querySelector('[data-media-field="kind"]').value = media.kind || 'image';
  row.querySelector('[data-media-field="size"]').value = media.size || 'normal';

  row.querySelectorAll('[data-media-field]').forEach((field) => {
    field.addEventListener('input', () => {
      media[field.dataset.mediaField] = field.value;
      updateOutput();
    });
  });

  row.querySelector('[data-media-upload]').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const folder = file.type.startsWith('video/') ? 'assets/videos' : 'assets/images';
    media.kind = file.type.startsWith('video/') ? 'video' : 'image';
    media.path = `${folder}/${file.name}`;
    media.caption = `${media.kind === 'video' ? 'Video' : 'Image'} / ${file.name}`;

    renderProjects();
    updateOutput();
    commitHistory();
    toast(`Path set. Upload ${file.name} to ${folder}.`);
  });

  row.querySelector('[data-action="media-up"]').addEventListener('click', () => moveItem(project.media, mediaIndex, mediaIndex - 1, renderProjects));
  row.querySelector('[data-action="media-down"]').addEventListener('click', () => moveItem(project.media, mediaIndex, mediaIndex + 1, renderProjects));
  row.querySelector('[data-action="media-remove"]').addEventListener('click', () => {
    project.media.splice(mediaIndex, 1);
    renderProjects();
    updateOutput();
    commitHistory();
  });

  return row;
}

function renderProjects() {
  const root = $('#projectEditor');
  root.innerHTML = '';
  (config.projects || []).forEach((project, index) => root.appendChild(projectCard(project, index)));
}

function moveItem(array, from, to, renderFn) {
  if (to < 0 || to >= array.length) return;
  const [item] = array.splice(from, 1);
  array.splice(to, 0, item);
  renderFn();
  updateOutput();
}

function updateFromInputs() {
  $$('[data-path]').forEach((input) => {
    let value;
    if (input.dataset.lines === 'true') value = fromLines(input.value);
    else if (input.dataset.boolean === 'true') value = input.value === 'true';
    else value = input.value;

    setByPath(config, input.dataset.path, value);
  });
}

function updateOutput(shouldCommit = true) {
  if (shouldCommit && historyReady) {
    clearTimeout(historyDebounce);
    historyDebounce = setTimeout(() => commitHistory(), 450);
  }

  const output = $('#configOutput');
  if (output) output.value = configCode();

  const assets = new Set();
  (config.projects || []).forEach((project) => {
    (project.media || []).forEach((media) => {
      const path = media.path || media.youtube;
      if (path && !/(youtube\.com|youtu\.be)/i.test(path)) assets.add(path);
    });
  });
  if (config.about?.portrait?.path) assets.add(config.about.portrait.path);

  const assetList = $('#assetList');
  if (assetList) assetList.textContent = [...assets].sort().join('\n') || 'No assets yet.';
}

function refreshPreview() {
  const frame = $('#previewFrame');
  if (frame) frame.src = `index.html?preview=${Date.now()}`;
}

function applyPreset(name) {
  const presets = {
    pureBlack: {
      dark: { bg: '#000000', panel: '#000000', panelSoft: '#000000', text: '#f6f3ec', muted: '#9e9a90' },
      light: { bg: '#f3f0e8', panel: '#fbfaf5', panelSoft: '#ede8dc', text: '#11100e', muted: '#625f58' }
    },
    warmBlack: {
      dark: { bg: '#080705', panel: '#0d0b08', panelSoft: '#14110c', text: '#f4efe5', muted: '#a49b8e' },
      light: { bg: '#f4efe5', panel: '#fffaf0', panelSoft: '#eee4d4', text: '#120f0a', muted: '#6a6257' }
    },
    whiteEditorial: {
      dark: { bg: '#050505', panel: '#080808', panelSoft: '#111111', text: '#f7f7f7', muted: '#9b9b9b' },
      light: { bg: '#ffffff', panel: '#f8f8f8', panelSoft: '#eeeeee', text: '#050505', muted: '#595959' }
    },
    cream: {
      dark: { bg: '#0c0a06', panel: '#12100b', panelSoft: '#1a150e', text: '#f7ead4', muted: '#aa9981' },
      light: { bg: '#efe6d5', panel: '#fff7e9', panelSoft: '#e2d4be', text: '#15100a', muted: '#665946' }
    }
  };

  const preset = presets[name];
  if (!preset) return;
  config.design.colors.dark = { ...config.design.colors.dark, ...preset.dark };
  config.design.colors.light = { ...config.design.colors.light, ...preset.light };
  bindBasicInputs();
  updateOutput();
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, '&quot;');
}

$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach((item) => item.classList.remove('active'));
    $$('.tab-panel').forEach((panel) => panel.classList.remove('active'));
    tab.classList.add('active');
    $(`#${tab.dataset.tab}`)?.classList.add('active');
  });
});

$('#addService')?.addEventListener('click', () => {
  config.services.items.push({ title: 'New service', text: 'Describe this service.' });
  renderServices();
  updateOutput();
});

$('#addProject')?.addEventListener('click', () => {
  config.projects.push({
    visible: true,
    slug: `new-project-${config.projects.length + 1}`,
    title: 'New Project',
    type: 'Still Renders / Video',
    copy: ['Write the project description here.'],
    media: [
      { kind: 'image', size: 'wide', path: 'assets/images/new-project-01.jpg', alt: 'New project image', caption: 'Image Placeholder / new-project-01.jpg' }
    ]
  });
  renderProjects();
  updateOutput();
});

$$('[data-preset]').forEach((button) => {
  button.addEventListener('click', () => applyPreset(button.dataset.preset));
});

$('#saveLocal')?.addEventListener('click', () => { updateFromInputs(); saveLocal(); });
$('#saveLocal2')?.addEventListener('click', () => { updateFromInputs(); saveLocal(); });
$('#downloadConfig')?.addEventListener('click', () => { updateFromInputs(); downloadConfig(); });
$('#downloadConfig2')?.addEventListener('click', () => { updateFromInputs(); downloadConfig(); });
$('#refreshPreview')?.addEventListener('click', refreshPreview);
$('#resetLocal')?.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  config = clone(baseConfig);
  bindBasicInputs();
  renderServices();
  renderProjects();
  updateOutput();
  refreshPreview();
});
$('#copyConfig')?.addEventListener('click', async () => {
  updateFromInputs();
  await navigator.clipboard.writeText(configCode());
  toast('Config copied.');
});


const aboutPortraitUpload = $('#aboutPortraitUpload');
aboutPortraitUpload?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!config.about) config.about = {};
  if (!config.about.portrait) config.about.portrait = {};

  config.about.portrait.path = `assets/images/${file.name}`;
  config.about.portrait.alt = config.about.portrait.alt || 'Abdul Rafeh portrait';

  const pathInput = $('[data-path="about.portrait.path"]');
  if (pathInput) pathInput.value = config.about.portrait.path;

  updateOutput();
  commitHistory();
  refreshPreview();
  toast(`About image path set. Upload ${file.name} to assets/images.`);
});

$('#importConfig')?.addEventListener('change', (event) => importConfigFile(event.target.files?.[0]));
$('#importConfig2')?.addEventListener('change', (event) => importConfigFile(event.target.files?.[0]));

$('#undoChange')?.addEventListener('click', () => restoreHistory(-1));
$('#redoChange')?.addEventListener('click', () => restoreHistory(1));

bindBasicInputs();
renderServices();
renderProjects();
updateOutput(false);
historyReady = true;
historyStack = [JSON.stringify(config)];
historyIndex = 0;
syncHistoryButtons();
