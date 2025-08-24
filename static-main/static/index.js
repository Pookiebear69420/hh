"use strict";

// Global variables
const form = document.getElementById("uv-form");
const address = document.getElementById("uv-address");
const searchEngine = document.getElementById("uv-search-engine");
const error = document.getElementById("uv-error");
const errorCode = document.getElementById("uv-error-code");
const tabBar = document.getElementById("tab-bar");
const content = document.getElementById("content");

// Section management
const sections = {
  proxy: 'proxy-view',
  welcome: 'welcome-screen',
  games: 'games-screen',
  ai: 'ai-screen',
  music: 'music-screen',
  settings: 'settings-screen'
};

// Theme configurations
const themes = {
  red: {
    name: 'Red Cyber',
    primary: '#ff0000',
    secondary: '#cc0000',
    bg: '#000000',
    bgGradient: 'linear-gradient(180deg, #111 0%, #000 100%)',
    animation: 'cyber'
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#0080ff',
    secondary: '#0066cc',
    bg: '#001122',
    bgGradient: 'linear-gradient(180deg, #003366 0%, #001122 100%)',
    animation: 'wave'
  },
  purple: {
    name: 'Neon Purple',
    primary: '#8a2be2',
    secondary: '#6a1b9a',
    bg: '#1a0d26',
    bgGradient: 'linear-gradient(180deg, #2d1b3d 0%, #1a0d26 100%)',
    animation: 'pulse'
  },
  green: {
    name: 'Matrix Green',
    primary: '#00ff41',
    secondary: '#00cc33',
    bg: '#0d1b0f',
    bgGradient: 'linear-gradient(180deg, #1a331d 0%, #0d1b0f 100%)',
    animation: 'matrix'
  },
  gold: {
    name: 'Golden Luxury',
    primary: '#ffd700',
    secondary: '#ffb700',
    bg: '#1a1a0d',
    bgGradient: 'linear-gradient(180deg, #333322 0%, #1a1a0d 100%)',
    animation: 'shine'
  }
};

/* ----------------- ERROR HANDLER ----------------- */
function displayError(message, code = "") {
  if (error && errorCode) {
    error.textContent = message;
    errorCode.textContent = code;
    setTimeout(() => {
      error.textContent = "";
      errorCode.textContent = "";
    }, 5000);
  } else {
    console.error(`Error: ${message} (${code})`);
  }
}

/* ----------------- SERVICE WORKER ----------------- */
window.addEventListener("load", async () => {
  try {
    if (typeof registerSW === 'function') {
      await registerSW();
    } else {
      console.warn("Service worker registration function not found.");
    }
  } catch (err) {
    displayError("Failed to register service worker.", err.toString());
  }
});

/* ----------------- SEARCH HANDLER ----------------- */
function search(query, engine) {
  try {
    let url = query.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (!url.includes(".")) {
        return engine.replace("%s", encodeURIComponent(url));
      }
      url = "https://" + url;
    }
    return url;
  } catch (err) {
    throw new Error("Invalid URL or query");
  }
}

/* ----------------- NAVIGATION SECTION HANDLER ----------------- */
function switchSection(sectionName) {
  document.querySelectorAll('.welcome-screen').forEach(screen => {
    screen.style.display = 'none';
  });
  
  const browserUI = document.getElementById('browser-ui');
  const proxyContent = document.getElementById('proxy-content');
  
  if (sectionName === 'proxy') {
    if (browserUI) browserUI.style.display = 'block';
    if (proxyContent) proxyContent.style.display = 'block';
    updateAddressFromIframe();
  } else {
    if (browserUI) browserUI.style.display = 'none';
    if (proxyContent) proxyContent.style.display = 'none';
    
    const sectionId = sections[sectionName];
    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) section.style.display = 'flex';
    }
  }
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const navItem = document.querySelector(`[data-section="${sectionName}"]`);
  if (navItem) navItem.classList.add('active');
}

function switchToProxy() {
  switchSection('proxy');
}

function openSettings() {
  switchSection('settings');
}

/* ----------------- SETTINGS FUNCTIONS ----------------- */
function loadSettings() {
  const savedTheme = localStorage.getItem('selectedTheme') || 'green'; // Default to green based on screenshot
  const savedTitle = localStorage.getItem('customTitle') || 'ZenZUltraFast';
  const savedIcon = localStorage.getItem('customIcon') || 'logo.png';
  const autoAboutBlank = localStorage.getItem('autoAboutBlank') === 'true';
  const autoBlob = localStorage.getItem('autoBlob') === 'true';
  
  applyTheme(savedTheme);
  document.title = savedTitle;
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.href = savedIcon;
  
  if (document.getElementById('theme-select')) {
    document.getElementById('theme-select').value = savedTheme;
  }
  if (document.getElementById('custom-title')) {
    document.getElementById('custom-title').value = savedTitle;
  }
  if (document.getElementById('custom-icon')) {
    document.getElementById('custom-icon').value = savedIcon;
  }
  if (document.getElementById('auto-aboutblank')) {
    document.getElementById('auto-aboutblank').checked = autoAboutBlank;
  }
  if (document.getElementById('auto-blob')) {
    document.getElementById('auto-blob').checked = autoBlob;
  }
}

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;
  
  const root = document.documentElement;
  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--secondary-color', theme.secondary);
  root.style.setProperty('--bg-color', theme.bg);
  root.style.setProperty('--bg-gradient', theme.bgGradient);
  
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${themeName}`);
  
  localStorage.setItem('selectedTheme', themeName);
}

function openInAboutBlank() {
  const newWindow = window.open('about:blank', '_blank');
  if (newWindow) {
    newWindow.document.write(document.documentElement.outerHTML);
    newWindow.document.close();
  } else {
    displayError("Failed to open about:blank window.");
  }
}

function openInBlob() {
  const bodyContent = document.body.innerHTML;
  const jsContent = document.querySelector('script:not([src])')?.textContent || '';
  
  let cssContent = '';
  document.querySelectorAll('style').forEach(style => {
    cssContent += style.textContent + '\n';
  });
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    cssContent += `/* Styles from ${link.href} */\n`;
  });
  
  const themeName = localStorage.getItem('selectedTheme') || 'green';
  const theme = themes[themeName] || themes.green;
  cssContent += `
    :root {
      --primary-color: ${theme.primary};
      --secondary-color: ${theme.secondary};
      --bg-color: ${theme.bg};
      --bg-gradient: ${theme.bgGradient};
    }
    body {
      background: var(--bg-gradient);
      color: #ffffff;
      font-family: 'Open Sans', sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
    }
    .main-container {
      display: flex;
      width: 100%;
      height: 100vh;
    }
    .nav-sidebar {
      width: 250px;
      background: var(--bg-color);
      padding: 20px;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
    }
    .nav-sidebar h3 {
      color: #ffffff;
      font-family: 'Oswald', sans-serif;
      margin-bottom: 20px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px;
      margin: 5px 0;
      background: var(--secondary-color);
      border-radius: 5px;
      color: #ffffff;
      cursor: pointer;
    }
    .nav-item.active {
      background: var(--primary-color);
    }
    .nav-item i {
      margin-right: 10px;
    }
    .browser-content {
      flex: 1;
      background: var(--bg-color);
      padding: 20px;
      overflow: auto;
    }
    #browser-ui {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .tab-bar {
      display: flex;
      gap: 5px;
      overflow-x: auto;
      background: var(--bg-color);
      padding: 5px;
    }
    .tab {
      background: var(--secondary-color);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tab.active {
      background: var(--primary-color);
    }
    .close-btn {
      font-size: 16px;
      cursor: pointer;
    }
    .nav-bar {
      display: flex;
      align-items: center;
      background: var(--bg-color);
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    }
    .nav-buttons i {
      font-size: 18px;
      margin-right: 10px;
      cursor: pointer;
      color: #ffffff;
    }
    #uv-form {
      flex: 1;
      display: flex;
      gap: 10px;
    }
    #uv-address {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--primary-color);
      background: #222;
      color: #ffffff;
      border-radius: 4px;
    }
    .profile-icon i {
      font-size: 24px;
      color: #ffffff;
    }
    #proxy-content {
      flex: 1;
      position: relative;
    }
    #proxy-content iframe {
      width: 100%;
      height: calc(100vh - 150px);
      border: none;
      position: absolute;
      top: 0;
      left: 0;
      display: none;
    }
    #proxy-content iframe[style*="display: block"] {
      display: block !important;
    }
    .welcome-screen {
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 20px;
    }
    .welcome-screen h1 {
      color: #ffffff;
      font-family: 'Oswald', sans-serif;
    }
    .settings-container {
      max-width: 600px;
      margin: 0 auto;
    }
    .settings-section h2 {
      color: #ffffff;
      margin-top: 20px;
    }
    .setting-item {
      margin: 10px 0;
    }
    .settings-input {
      padding: 8px;
      width: 100%;
      border: 1px solid var(--primary-color);
      background: #222;
      color: #ffffff;
      border-radius: 4px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      color: #ffffff;
    }
    .checkmark {
      height: 20px;
      width: 20px;
      background: #222;
      border: 1px solid var(--primary-color);
      border-radius: 4px;
      margin-right: 10px;
      cursor: pointer;
    }
    .setting-btn, .action-btn {
      padding: 8px 16px;
      background: var(--primary-color);
      color: #ffffff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    .action-btn.danger {
      background: #ff4444;
    }
    .theme-preview {
      margin: 20px 0;
    }
    .preview-box {
      background: var(--bg-color);
      padding: 20px;
      border-radius: 5px;
      text-align: center;
    }
    .preview-button {
      padding: 8px 16px;
      background: var(--primary-color);
      color: #ffffff;
      display: inline-block;
      border-radius: 4px;
    }
    #uv-error, #uv-error-code {
      color: #ff4444;
      text-align: center;
    }
    .phone-ui #browser-ui, .phone-ui #proxy-content {
      display: block;
    }
    .pc-ui .welcome-screen {
      display: none;
    }
  `;
  
  const blobHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${document.title}</title>
      <link rel="icon" href="${document.querySelector('link[rel="icon"]')?.href || 'logo.png'}">
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Oswald&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <style>${cssContent}</style>
      <script>
        // Mock UV config (replace with actual content if available)
        window.__uv$config = {
          prefix: '/uv/service/',
          encodeUrl: (url) => btoa(url),
          decodeUrl: (url) => atob(url)
        };
        // Placeholder for external scripts (inline if possible)
        // Example: window.uv = { ... }; // Include uv.bundle.js content here
      </script>
    </head>
    <body class="theme-${themeName}">
      ${bodyContent}
      <script>
        ${jsContent}
        document.addEventListener("DOMContentLoaded", () => {
          loadSettings();
          applyDeviceUI();
          document.querySelectorAll(".tab").forEach(setupTabListeners);
          switchSection('welcome');
          if (document.getElementById('browser-ui')) document.getElementById('browser-ui').style.display = 'none';
          console.log("Blob page initialized");
        });
      </script>
    </body>
    </html>
  `;
  
  try {
    const blob = new Blob([blobHTML], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow) {
      displayError("Failed to open Blob window.");
    }
  } catch (err) {
    displayError("Error creating Blob.", err.toString());
  }
}

function saveSettings() {
  const theme = document.getElementById('theme-select')?.value;
  const title = document.getElementById('custom-title')?.value;
  const icon = document.getElementById('custom-icon')?.value;
  const autoAboutBlank = document.getElementById('auto-aboutblank')?.checked;
  const autoBlob = document.getElementById('auto-blob')?.checked;
  
  if (theme) {
    applyTheme(theme);
  }
  
  if (title) {
    document.title = title;
    localStorage.setItem('customTitle', title);
  }
  
  if (icon) {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = icon;
    localStorage.setItem('customIcon', icon);
  }
  
  localStorage.setItem('autoAboutBlank', autoAboutBlank);
  localStorage.setItem('autoBlob', autoBlob);
  
  const saveBtn = document.getElementById('save-settings');
  if (saveBtn) {
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = 'var(--primary-color)';
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = '';
    }, 2000);
  }
}

/* ----------------- TAB SYSTEM ----------------- */
function createIframe(iframeId) {
  const iframe = document.createElement("iframe");
  iframe.name = iframeId;
  iframe.src = "/static/main.html";
  const proxyContent = document.getElementById('proxy-content');
  if (proxyContent) {
    proxyContent.appendChild(iframe);
  }
  return iframe;
}

function setupTabListeners(tab) {
  const closeBtn = tab.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const tabs = document.querySelectorAll(".tab");
      if (tabs.length > 1) {
        const iframeId = tab.dataset.iframeId;
        const iframe = document.querySelector(`iframe[name="${iframeId}"]`);
        if (iframe) iframe.remove();
        tab.remove();
        if (tab.classList.contains("active")) {
          const newActiveTab = document.querySelector(".tab");
          if (newActiveTab) setActiveTab(newActiveTab);
        }
      }
    });
  }
  tab.addEventListener("click", () => setActiveTab(tab));
}

function setActiveTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#proxy-content iframe").forEach(i => i.style.display = "none");
  
  tab.classList.add("active");
  const iframeId = tab.dataset.iframeId;
  const iframe = document.querySelector(`#proxy-content iframe[name="${iframeId}"]`);
  if (iframe) {
    iframe.style.display = "block";
    updateAddressFromIframe();
  }
}

function updateTabTitle(tab, url) {
  const span = tab.querySelector("span");
  if (span) {
    try {
      const urlObj = new URL(url);
      span.textContent = urlObj.hostname || "New Tab";
    } catch {
      span.textContent = "New Tab";
    }
  }
}

function updateAddressFromIframe() {
  const activeIframe = document.querySelector("#proxy-content iframe[style*='display: block']");
  if (activeIframe && address) {
    address.value = activeIframe.src.replace(window.__uv$config.prefix + window.__uv$config.encodeUrl(''), '');
    try {
      const urlObj = new URL(activeIframe.src.replace(window.__uv$config.prefix, 'https://'));
      address.value = window.__uv$config.decodeUrl(urlObj.pathname.slice(1)) || address.value;
    } catch (e) {
      console.warn("Failed to decode URL:", e);
    }
  }
}

/* ----------------- PROXY NAVIGATION ----------------- */
function setupNavigationButtons() {
  const backBtn = document.querySelector(".nav-buttons .fa-arrow-left");
  const forwardBtn = document.querySelector(".nav-buttons .fa-arrow-right");
  const reloadBtn = document.querySelector(".nav-buttons .fa-rotate-right");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const activeIframe = document.querySelector("#proxy-content iframe[style*='display: block']");
      if (activeIframe && activeIframe.contentWindow.history.length > 1) {
        activeIframe.contentWindow.history.back();
      }
    });
  }

  if (forwardBtn) {
    forwardBtn.addEventListener("click", () => {
      const activeIframe = document.querySelector("#proxy-content iframe[style*='display: block']");
      if (activeIframe && activeIframe.contentWindow.history.length > 1) {
        activeIframe.contentWindow.history.forward();
      }
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      const activeIframe = document.querySelector("#proxy-content iframe[style*='display: block']");
      if (activeIframe) {
        activeIframe.contentWindow.location.reload();
      }
    });
  }
}

/* ----------------- EVENT LISTENERS ----------------- */
const newTabBtn = document.getElementById("new-tab");
if (newTabBtn) {
  newTabBtn.addEventListener("click", () => {
    const iframeId = `iframe-${Date.now()}`;
    const newTab = document.createElement("div");
    newTab.className = "tab";
    newTab.dataset.iframeId = iframeId;
    newTab.innerHTML = `<span>New Tab</span><span class="close-btn">&times;</span>`;
    if (tabBar) {
      tabBar.insertBefore(newTab, newTabBtn);
      createIframe(iframeId);
      setupTabListeners(newTab);
      setActiveTab(newTab);
      switchSection('proxy');
    }
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!window.__uv$config) {
      displayError("Ultraviolet configuration not loaded.");
      return;
    }
    try {
      const url = search(address.value, searchEngine.value);
      
      const autoAboutBlank = localStorage.getItem('autoAboutBlank') === 'true';
      const autoBlob = localStorage.getItem('autoBlob') === 'true';
      
      if (autoAboutBlank) {
        openInAboutBlank();
        return;
      }
      
      if (autoBlob) {
        openInBlob();
        return;
      }
      
      const activeTab = document.querySelector(".tab.active");
      if (activeTab) {
        const iframeId = activeTab.dataset.iframeId;
        const iframe = document.querySelector(`#proxy-content iframe[name="${iframeId}"]`);
        if (iframe) {
          iframe.src = __uv$config.prefix + __uv$config.encodeUrl(url);
          updateTabTitle(activeTab, url);
          switchSection('proxy');
        } else {
          displayError("Main iframe not found.");
        }
      } else {
        displayError("No active tab found.");
      }
    } catch (err) {
      displayError("Error processing URL.", err.toString());
    }
  });
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;
    switchSection(section);
  });
});

document.querySelectorAll(".tab").forEach(setupTabListeners);

/* ----------------- DEVICE UI DETECTION ----------------- */
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function applyDeviceUI() {
  if (isMobileDevice()) {
    document.body.classList.add("phone-ui");
    document.body.classList.remove("pc-ui");
  } else {
    document.body.classList.add("pc-ui");
    document.body.classList.remove("phone-ui");
  }
}

/* ----------------- AUTOFILL FUNCTION ----------------- */
function autofill(url) {
  if (document.getElementById("uv-address") && document.getElementById("uv-form")) {
    document.getElementById("uv-address").value = url;
    document.getElementById("uv-form").submit();
  }
}

/* ----------------- INITIALIZATION ----------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  applyDeviceUI();
  setupNavigationButtons();
  
  document.addEventListener('click', (e) => {
    if (e.target.id === 'save-settings') {
      saveSettings();
    }
    
    if (e.target.id === 'open-aboutblank-once') {
      openInAboutBlank();
    }
    
    if (e.target.id === 'open-blob-once') {
      openInBlob();
    }
    
    if (e.target.id === 'reset-settings') {
      if (confirm('Are you sure you want to reset all settings?')) {
        localStorage.clear();
        location.reload();
      }
    }
  });
  
  document.addEventListener('change', (e) => {
    if (e.target.id === 'theme-select') {
      applyTheme(e.target.value);
    }
  });
  
  if (localStorage.getItem('autoAboutBlank') === 'true') {
    setTimeout(openInAboutBlank, 1000);
  } else if (localStorage.getItem('autoBlob') === 'true') {
    setTimeout(openInBlob, 1000);
  }
});

window.addEventListener("load", applyDeviceUI);
window.addEventListener("resize", applyDeviceUI);

switchSection('welcome');
