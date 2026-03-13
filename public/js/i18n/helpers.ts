/**
 * i18n Helper Functions
 */
import { flags } from './flags';
import { translations } from './index';

/**
 * Initialize language from localStorage or use default
 */
export function initLanguage(defaultLang = 'en') {
  const saved = localStorage.getItem('lang') || defaultLang;
  setLanguage(saved);
  return saved;
}

/**
 * Set active language and update UI
 */
export function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  const flagIcon = document.getElementById('currentFlag');
  const langLabel = document.getElementById('currentLangLabel');
  const dropdown = document.getElementById('langDropdown');

  if (flagIcon) flagIcon.setAttribute('icon', flags[lang]);
  if (langLabel) langLabel.innerText = lang.toUpperCase();
  if (dropdown) dropdown.classList.add('hidden');

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const langData = translations[lang] || translations['en'];
    if (key && langData[key]) {
      if (el.tagName === 'INPUT') {
        el.placeholder = langData[key];
      } else {
        el.textContent = langData[key];
      }
    }
  });
  
  // Dispatch event for reactive components (Lit, etc.)
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

/**
 * Render language selector dropdown
 */
export function renderLanguageSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentLang = localStorage.getItem('lang') || 'en';
  const flag = flags[currentLang];

  container.innerHTML = `
    <div class="relative" id="langMenu">
      <button id="langToggleBtn" class="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg px-2.5 py-1.5 transition-all text-xs font-bold border border-transparent hover:border-slate-200 dark:hover:border-dark-700">
        <iconify-icon id="currentFlag" icon="${flag}" width="18"></iconify-icon>
        <span id="currentLangLabel">${currentLang.toUpperCase()}</span>
      </button>
      <div id="langDropdown" class="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-200 dark:border-dark-700 hidden py-1.5 z-50">
        ${Object.keys(flags).map(lang => `
          <button onclick="window.app.setLanguage('${lang}')" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-dark-700 text-sm transition-colors text-left">
            <iconify-icon icon="${flags[lang]}" width="18"></iconify-icon> 
            <span class="capitalize">${new Intl.DisplayNames([lang], {type: 'language'}).of(lang)}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById('langToggleBtn');
  if (toggleBtn) {
    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById('langDropdown');
      if (dropdown) dropdown.classList.toggle('hidden');
    };
  }

  document.addEventListener('click', () => {
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  });
}

/**
 * Translation function - get translated string by key
 */
export function t(key: string): string {
  const lang = localStorage.getItem('lang') || 'en';
  return (translations[lang] && translations[lang][key]) 
    || (translations['en'] && translations['en'][key]) 
    || key;
}
