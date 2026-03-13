var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// public/js/i18n/types.ts
var require_types = __commonJS({
  "public/js/i18n/types.ts"() {
    "use strict";
  }
});

// public/js/i18n-bundle.ts
var i18n_bundle_exports = {};
__export(i18n_bundle_exports, {
  flags: () => flags,
  initLanguage: () => initLanguage,
  renderLanguageSelector: () => renderLanguageSelector,
  setLanguage: () => setLanguage,
  t: () => t,
  translations: () => translations
});

// public/js/i18n/index.ts
var i18n_exports = {};
__export(i18n_exports, {
  flags: () => flags,
  initLanguage: () => initLanguage,
  renderLanguageSelector: () => renderLanguageSelector,
  setLanguage: () => setLanguage,
  t: () => t,
  translations: () => translations
});

// public/js/i18n/flags.ts
var flags = {
  en: "flagpack:us",
  es: "flagpack:es",
  fr: "flagpack:fr",
  pt: "flagpack:br",
  ja: "flagpack:jp",
  zh: "flagpack:cn",
  de: "flagpack:de",
  it: "flagpack:it",
  ru: "flagpack:ru",
  he: "flagpack:il"
};

// public/js/i18n/index.ts
__reExport(i18n_exports, __toESM(require_types()));

// public/js/i18n/helpers.ts
function initLanguage(defaultLang = "en") {
  const saved = localStorage.getItem("lang") || defaultLang;
  setLanguage(saved);
  return saved;
}
function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  const flagIcon = document.getElementById("currentFlag");
  const langLabel = document.getElementById("currentLangLabel");
  const dropdown = document.getElementById("langDropdown");
  if (flagIcon) flagIcon.setAttribute("icon", flags[lang]);
  if (langLabel) langLabel.innerText = lang.toUpperCase();
  if (dropdown) dropdown.classList.add("hidden");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const langData = translations[lang] || translations["en"];
    if (key && langData[key]) {
      if (el.tagName === "INPUT") {
        el.placeholder = langData[key];
      } else {
        el.textContent = langData[key];
      }
    }
  });
  window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }));
}
function renderLanguageSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const currentLang = localStorage.getItem("lang") || "en";
  const flag = flags[currentLang];
  container.innerHTML = `
    <div class="relative" id="langMenu">
      <button id="langToggleBtn" class="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg px-2.5 py-1.5 transition-all text-xs font-bold border border-transparent hover:border-slate-200 dark:hover:border-dark-700">
        <iconify-icon id="currentFlag" icon="${flag}" width="18"></iconify-icon>
        <span id="currentLangLabel">${currentLang.toUpperCase()}</span>
      </button>
      <div id="langDropdown" class="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-200 dark:border-dark-700 hidden py-1.5 z-50">
        ${Object.keys(flags).map((lang) => `
          <button onclick="window.app.setLanguage('${lang}')" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-dark-700 text-sm transition-colors text-left">
            <iconify-icon icon="${flags[lang]}" width="18"></iconify-icon> 
            <span class="capitalize">${new Intl.DisplayNames([lang], { type: "language" }).of(lang)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
  const toggleBtn = document.getElementById("langToggleBtn");
  if (toggleBtn) {
    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById("langDropdown");
      if (dropdown) dropdown.classList.toggle("hidden");
    };
  }
  document.addEventListener("click", () => {
    const dropdown = document.getElementById("langDropdown");
    if (dropdown) dropdown.classList.add("hidden");
  });
}
function t(key) {
  const lang = localStorage.getItem("lang") || "en";
  return translations[lang] && translations[lang][key] || translations["en"] && translations["en"][key] || key;
}

// public/js/i18n/translations/common.i18n.ts
var commonTranslations = {
  en: {
    title: "Storage Buckets",
    subtitle: "Manage visibility and lifecycle.",
    create: "Create",
    logout: "Logout",
    emptyTitle: "No buckets found",
    emptyDesc: "Start by creating a new container.",
    publicAccess: "Public",
    privateAccess: "Private",
    deleteTitle: "Delete Bucket",
    deleteConfirm: "Confirm deletion?",
    deleteWarning: "Bucket must be empty.",
    deleteBtn: "Delete",
    cancelBtn: "Cancel",
    explore: "Explore",
    toastCreated: "Bucket created",
    toastDeleted: "Bucket removed",
    toastUpdated: "Visibility updated",
    errorEmpty: "Bucket not empty or error",
    readOnly: "Secure Access",
    loginTitle: "Atlas Manager",
    loginSubtitle: "Manage visibility and lifecycle.",
    loginBtn: "Sign In",
    username: "Username",
    password: "Password",
    errBucketExists: "The requested bucket name is not available.",
    errInvalidCredentials: "Invalid credentials.",
    errGeneral: "An unexpected error occurred.",
    supportBtn: "Support",
    versionLabel: "Version",
    appName: "Atlas Bucket Manager",
    authorLabel: "by"
  },
  es: {
    title: "Buckets",
    subtitle: "Gesti\xF3n de almacenamiento.",
    create: "Crear",
    logout: "Salir",
    emptyTitle: "Sin buckets",
    emptyDesc: "Crea tu primer contenedor arriba.",
    publicAccess: "P\xFAblico",
    privateAccess: "Privado",
    deleteTitle: "Eliminar Bucket",
    deleteConfirm: "\xBFEliminar bucket?",
    deleteWarning: "El bucket debe estar vac\xEDo.",
    deleteBtn: "Eliminar",
    cancelBtn: "Cerrar",
    explore: "Explorar",
    toastCreated: "Bucket creado",
    toastDeleted: "Bucket eliminado",
    toastUpdated: "Visibilidad actualizada",
    errorEmpty: "El bucket no est\xE1 vac\xEDo",
    readOnly: "Acceso Seguro",
    loginTitle: "Atlas Manager",
    loginSubtitle: "Gesti\xF3n de visibilidad y ciclo de vida.",
    loginBtn: "Entrar",
    username: "Usuario",
    password: "Clave",
    errBucketExists: "El nombre del bucket no est\xE1 disponible.",
    errInvalidCredentials: "Credenciales inv\xE1lidas.",
    errGeneral: "Ocurri\xF3 un error inesperado.",
    supportBtn: "Apoyar",
    versionLabel: "Versi\xF3n",
    appName: "Atlas Bucket Manager",
    authorLabel: "por"
  },
  pt: {
    title: "Buckets",
    subtitle: "Gest\xE3o eficiente de almacenamiento.",
    create: "Criar",
    logout: "Sair",
    emptyTitle: "Nenhum bucket",
    emptyDesc: "Crie o seu primeiro bucket.",
    publicAccess: "P\xFAblico",
    privateAccess: "Privado",
    deleteTitle: "Excluir Bucket",
    deleteConfirm: "Confirmar exclus\xE3o de",
    deleteWarning: "O bucket debe estar vazio.",
    deleteBtn: "Excluir",
    cancelBtn: "Fechar",
    explore: "Explorar",
    toastCreated: "Bucket creado",
    toastDeleted: "Bucket exclu\xEDdo",
    toastUpdated: "Visibilidade atualizada",
    errorEmpty: "O bucket n\xE3o est\xE1 vazio",
    readOnly: "Acesso Seguro",
    loginTitle: "Atlas Manager",
    loginSubtitle: "Gest\xE3o de visibilidad e ciclo de vida.",
    loginBtn: "Entrar",
    username: "Usu\xE1rio",
    password: "Senha",
    errBucketExists: "O nome do bucket n\xE3o est\xE1 disponible.",
    errInvalidCredentials: "Credenciais inv\xE1lidas.",
    errGeneral: "Ocorreu um erro inesperado.",
    supportBtn: "Apoiar",
    versionLabel: "Vers\xE3o",
    appName: "Atlas Bucket Manager",
    authorLabel: "por"
  },
  fr: {
    title: "Buckets",
    subtitle: "Gestion du stockage.",
    create: "Cr\xE9er",
    logout: "Sortir",
    emptyTitle: "Aucun bucket",
    emptyDesc: "Cr\xE9ez votre premier bucket.",
    publicAccess: "Public",
    privateAccess: "Priv\xE9",
    deleteTitle: "Supprimer",
    deleteConfirm: "Supprimer?",
    deleteWarning: "Le bucket debe estar vac\xEDo.",
    deleteBtn: "Supprimer",
    cancelBtn: "Fermer",
    explore: "Explorer",
    toastCreated: "Bucket cr\xE9\xE9",
    toastDeleted: "Bucket supprim\xE9",
    toastUpdated: "Visibilit\xE9 mise \xE0 jour",
    errorEmpty: "Bucket non vide",
    readOnly: "Acc\xE8s S\xE9curis\xE9",
    loginTitle: "Atlas Manager",
    loginSubtitle: "G\xE9rez la visibilit\xE9 et le ciclo de vie.",
    loginBtn: "Connexion",
    username: "Utilisateur",
    password: "Mot de passe",
    errBucketExists: "Le nom du bucket n'est pas disponible.",
    errInvalidCredentials: "Identifiants invalides.",
    errGeneral: "Une erreur inattendue est survenue.",
    supportBtn: "Soutenir",
    versionLabel: "Version",
    appName: "Atlas Bucket Manager",
    authorLabel: "par"
  },
  ja: {
    title: "\u30D0\u30B1\u30C3\u30C8",
    subtitle: "\u30B9\u30C8\u30EC\u30FC\u30B8\u7BA1\u7406\u3002",
    create: "\u4F5C\u6210",
    logout: "\u7D42\u4E86",
    emptyTitle: "\u30D0\u30B1\u30C3\u30C8\u306A\u3057",
    emptyDesc: "\u6700\u521D\u306E\u30D0\u30B1\u30C3\u30C8\u3092\u4F5C\u6210\u3002",
    publicAccess: "\u516C\u958B",
    privateAccess: "\u975E\u516C\u958B",
    deleteTitle: "\u524A\u9664",
    deleteConfirm: "\u524A\u9664\u306E\u78BA\u8A8D",
    deleteWarning: "\u30D0\u30B1\u30C3\u30C8\u306F\u7A7A\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
    deleteBtn: "\u524A\u9664",
    cancelBtn: "\u9589\u3058\u308B",
    explore: "\u63A2\u691C",
    toastCreated: "\u4F5C\u6210\u5B8C\u4E86",
    toastDeleted: "\u524A\u9664\u5B8C\u4E86",
    toastUpdated: "\u66F4\u65B0\u5B8C\u4E86",
    errorEmpty: "\u30D0\u30B1\u30C3\u30C8\u304C\u7A7A\u3067\u306F\u3042\u308A\u307E\u305B\u3093",
    readOnly: "\u5B89\u5168\u306A\u8AAD\u307F\u53D6\u308A\u5C02\u7528",
    loginTitle: "Atlas Manager",
    loginSubtitle: "\u53EF\u8996\u6027\u3068\u30E9\u30A4\u30D5\u30B5\u30A4\u30AF\u30EB\u306E\u7BA1\u7406\u3002",
    loginBtn: "\u30ED\u30B0\u30A4\u30F3",
    username: "\u30E6\u30FC\u30B6\u30FC\u540D",
    password: "\u30D1\u30B9\u30EF\u30FC\u30C9",
    errBucketExists: "\u30EA\u30AF\u30A8\u30B9\u30C8\u3055\u308C\u305F\u30D0\u30B1\u30C3\u30C8\u540D\u306F\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3002",
    errInvalidCredentials: "\u8CC7\u683C\u60C5\u5831\u304C\u7121\u52B9\u3067\u3059\u3002",
    errGeneral: "\u4E88\u671F\u3057\u306A\u3044\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
    supportBtn: "\u652F\u63F4\u3059\u308B",
    versionLabel: "\u30D0\u30FC\u30B8\u30E7\u30F3",
    appName: "Atlas Bucket Manager",
    authorLabel: "\u4F5C\u8005"
  },
  zh: {
    title: "\u5B58\u50A8\u6876",
    subtitle: "\u5B58\u50A8\u7BA1\u7406\u3002",
    create: "\u521B\u5EFA",
    logout: "\u9000\u51FA",
    emptyTitle: "\u65E0\u5B58\u50A8\u6876",
    emptyDesc: "\u521B\u5EFA\u4E00\u4E2A\u65B0\u6876\u3002",
    publicAccess: "\u516C\u5F00",
    privateAccess: "\u79C1\u6709",
    deleteTitle: "\u5220\u9664",
    deleteConfirm: "\u786E\u8BA4\u5220\u9664",
    deleteWarning: "\u5B58\u50A8\u6876\u5FC5\u987B\u4E3A\u7A7A\u3002",
    deleteBtn: "\u5220\u9664",
    cancelBtn: "\u5173\u95ED",
    explore: "\u63A2\u7D22",
    toastCreated: "\u521B\u5EFA\u6210\u529F",
    toastDeleted: "\u5220\u9664\u6210\u529F",
    toastUpdated: "\u66F4\u65B0\u6210\u529F",
    errorEmpty: "\u5B58\u50A8\u6876\u4E0D\u4E3A\u7A7A",
    readOnly: "\u5B89\u5168\u53EA\u8BFB\u8BBF\u95EE",
    loginTitle: "Atlas Manager",
    loginSubtitle: "\u7BA1\u7406\u53EF\u89C1\u6027\u548C\u751F\u547D\u5468\u671F\u3002",
    loginBtn: "\u767B\u5F55",
    username: "\u7528\u6237\u540D",
    password: "\u5BC6\u7801",
    errBucketExists: "\u8BF7\u6C42\u7684\u5B58\u50A8\u6876\u540D\u79F0\u4E0D\u53EF\u7528\u3002",
    errInvalidCredentials: "\u51ED\u636E\u65E0\u6548\u3002",
    errGeneral: "\u53D1\u751F\u4E86\u610F\u5916\u9519\u8BEF\u3002",
    supportBtn: "\u652F\u6301",
    versionLabel: "\u7248\u672C",
    appName: "Atlas Bucket Manager",
    authorLabel: "\u4F5C\u8005"
  },
  de: {
    title: "Speicher-Buckets",
    subtitle: "Sichtbarkeit und Lebenszyklus verwalten.",
    create: "Erstellen",
    logout: "Abmelden",
    emptyTitle: "Keine Buckets gefunden",
    emptyDesc: "Erstellen Sie einen neuen Container.",
    publicAccess: "\xD6ffentlich",
    privateAccess: "Privat",
    deleteTitle: "Bucket l\xF6schen",
    deleteConfirm: "L\xF6schen best\xE4tigen?",
    deleteWarning: "Bucket muss leer sein.",
    deleteBtn: "L\xF6schen",
    cancelBtn: "Abbrechen",
    explore: "Erkunden",
    toastCreated: "Bucket erstellt",
    toastDeleted: "Bucket entfernt",
    toastUpdated: "Sichtbarkeit aktualisiert",
    errorEmpty: "Bucket nicht leer oder Fehler",
    readOnly: "Sicherer Zugriff",
    loginTitle: "Atlas Manager",
    loginSubtitle: "Sichtbarkeit und Lebenszyklus verwalten.",
    loginBtn: "Anmelden",
    username: "Benutzername",
    password: "Passwort",
    errBucketExists: "Der angeforderte Bucket-Name ist nicht verf\xFCgbar.",
    errInvalidCredentials: "Ung\xFCltige Anmeldedaten.",
    errGeneral: "Ein unerwarteter Fehler ist aufgetreten.",
    supportBtn: "Unterst\xFCtzen",
    versionLabel: "Version",
    appName: "Atlas Bucket Manager",
    authorLabel: "von"
  },
  it: {
    title: "Bucket di archiviazione",
    subtitle: "Gestisci visibilit\xE0 e ciclo di vita.",
    create: "Crea",
    logout: "Esci",
    emptyTitle: "Nessun bucket trovato",
    emptyDesc: "Inizia creando un nuovo contenitore.",
    publicAccess: "Pubblico",
    privateAccess: "Privato",
    deleteTitle: "Elimina Bucket",
    deleteConfirm: "Confermare l'eliminazione?",
    deleteWarning: "Il bucket deve essere vuoto.",
    deleteBtn: "Elimina",
    cancelBtn: "Annulla",
    explore: "Esplora",
    toastCreated: "Bucket creato",
    toastDeleted: "Bucket rimosso",
    toastUpdated: "Visibilit\xE0 aggiornata",
    errorEmpty: "Bucket non vuoto o errore",
    readOnly: "Accesso sicuro",
    loginTitle: "Atlas Manager",
    loginSubtitle: "Gestisci visibilit\xE0 e ciclo di vita.",
    loginBtn: "Accedi",
    username: "Nome utente",
    password: "Password",
    errBucketExists: "Il nome del bucket richiesto non \xE8 disponibile.",
    errInvalidCredentials: "Credenziali non valide.",
    errGeneral: "Si \xE8 verificato un errore imprevisto.",
    supportBtn: "Supporta",
    versionLabel: "Versione",
    appName: "Atlas Bucket Manager",
    authorLabel: "di"
  },
  ru: {
    title: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430",
    subtitle: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0432\u0438\u0434\u0438\u043C\u043E\u0441\u0442\u044C\u044E \u0438 \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u044B\u043C \u0446\u0438\u043A\u043B\u043E\u043C.",
    create: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C",
    logout: "\u0412\u044B\u0439\u0442\u0438",
    emptyTitle: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B",
    emptyDesc: "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043D\u043E\u0432\u043E\u0433\u043E \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430.",
    publicAccess: "\u041F\u0443\u0431\u043B\u0438\u0447\u043D\u044B\u0439",
    privateAccess: "\u041F\u0440\u0438\u0432\u0430\u0442\u043D\u044B\u0439",
    deleteTitle: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435",
    deleteConfirm: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435?",
    deleteWarning: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C.",
    deleteBtn: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
    cancelBtn: "\u041E\u0442\u043C\u0435\u043D\u0430",
    explore: "\u041E\u0431\u0437\u043E\u0440",
    toastCreated: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E",
    toastDeleted: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0443\u0434\u0430\u043B\u0435\u043D\u043E",
    toastUpdated: "\u0412\u0438\u0434\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430",
    errorEmpty: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u043D\u0435 \u043F\u0443\u0441\u0442\u043E\u0435 \u0438\u043B\u0438 \u043E\u0448\u0438\u0431\u043A\u0430",
    readOnly: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F",
    loginTitle: "Atlas Manager",
    loginSubtitle: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0432\u0438\u0434\u0438\u043C\u043E\u0441\u0442\u044C\u044E \u0438 \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u044B\u043C \u0446\u0438\u043A\u043B\u043E\u043C.",
    loginBtn: "\u0412\u043E\u0439\u0442\u0438",
    username: "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F",
    password: "\u041F\u0430\u0440\u043E\u043B\u044C",
    errBucketExists: "\u0417\u0430\u043F\u0440\u043E\u0448\u0435\u043D\u043D\u043E\u0435 \u0438\u043C\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E.",
    errInvalidCredentials: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0443\u0447\u0435\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435.",
    errGeneral: "\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043D\u0435\u043E\u0436\u0438\u0434\u0430\u043D\u043D\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430.",
    supportBtn: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u0442\u044C",
    versionLabel: "\u0412\u0435\u0440\u0441\u0438\u044F",
    appName: "Atlas Bucket Manager",
    authorLabel: "\u043E\u0442"
  },
  he: {
    title: "\u05D3\u05DC\u05D9 \u05D0\u05D7\u05E1\u05D5\u05DF",
    subtitle: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E0\u05E8\u05D0\u05D5\u05EA \u05D5\u05DE\u05D7\u05D6\u05D5\u05E8 \u05D7\u05D9\u05D9\u05DD.",
    create: "\u05E6\u05D5\u05E8",
    logout: "\u05D4\u05EA\u05E0\u05EA\u05E7",
    emptyTitle: "\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05D3\u05DC\u05D9\u05D9\u05DD",
    emptyDesc: "\u05D4\u05EA\u05D7\u05DC \u05E2\u05DC \u05D9\u05D3\u05D9 \u05D9\u05E6\u05D9\u05E8\u05EA \u05DE\u05DB\u05D5\u05DC\u05D4 \u05D7\u05D3\u05E9\u05D4.",
    publicAccess: "\u05E6\u05D9\u05D1\u05D5\u05E8\u05D9",
    privateAccess: "\u05E4\u05E8\u05D8\u05D9",
    deleteTitle: "\u05DE\u05D7\u05E7 \u05D3\u05DC\u05D9",
    deleteConfirm: "\u05D0\u05E9\u05E8 \u05DE\u05D7\u05D9\u05E7\u05D4?",
    deleteWarning: "\u05D4\u05D3\u05DC\u05D9 \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05E8\u05D9\u05E7.",
    deleteBtn: "\u05DE\u05D7\u05E7",
    cancelBtn: "\u05D1\u05D9\u05D8\u05D5\u05DC",
    explore: "\u05D7\u05E7\u05D5\u05E8",
    toastCreated: "\u05D3\u05DC\u05D9 \u05E0\u05D5\u05E6\u05E8",
    toastDeleted: "\u05D3\u05DC\u05D9 \u05D4\u05D5\u05E1\u05E8",
    toastUpdated: "\u05E0\u05E8\u05D0\u05D5\u05EA \u05E2\u05D5\u05D3\u05DB\u05E0\u05D4",
    errorEmpty: "\u05D4\u05D3\u05DC\u05D9 \u05DC\u05D0 \u05E8\u05D9\u05E7 \u05D0\u05D5 \u05E9\u05D2\u05D9\u05D0\u05D4",
    readOnly: "\u05D2\u05D9\u05E9\u05D4 \u05DE\u05D0\u05D5\u05D1\u05D8\u05D7\u05EA",
    loginTitle: "Atlas Manager",
    loginSubtitle: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E0\u05E8\u05D0\u05D5\u05EA \u05D5\u05DE\u05D7\u05D6\u05D5\u05E8 \u05D7\u05D9\u05D9\u05DD.",
    loginBtn: "\u05D4\u05EA\u05D7\u05D1\u05E8",
    username: "\u05E9\u05DD \u05DE\u05E9\u05EA\u05DE\u05E9",
    password: "\u05E1\u05D9\u05E1\u05DE\u05D4",
    errBucketExists: "\u05E9\u05DD \u05D4\u05D3\u05DC\u05D9 \u05D4\u05DE\u05D1\u05D5\u05E7\u05E9 \u05D0\u05D9\u05E0\u05D5 \u05D6\u05DE\u05D9\u05DF.",
    errInvalidCredentials: "\u05E4\u05E8\u05D8\u05D9\u05DD \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9\u05D9\u05DD.",
    errGeneral: "\u05D0\u05D9\u05E8\u05E2\u05D4 \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05DC\u05EA\u05D9 \u05E6\u05E4\u05D5\u05D9\u05D4.",
    supportBtn: "\u05EA\u05DE\u05D5\u05DA",
    versionLabel: "\u05D2\u05E8\u05E1\u05D4",
    appName: "Atlas Bucket Manager",
    authorLabel: "\u05DE\u05D0\u05EA"
  }
};

// public/js/i18n/translations/copy-modal.i18n.ts
var copyModalTranslations = {
  en: {
    copyTitle: "Copy Bucket",
    copyDescription: "Create a complete backup of your bucket to another provider",
    sourceLabel: "Source",
    targetLabel: "Target",
    targetProviderLabel: "Target Provider",
    selectProvider: "Select a provider",
    targetBucketLabel: "Target Bucket",
    bucketSearchPlaceholder: "bucket-destination",
    bucketNameRules: "Lowercase letters, numbers, and hyphens only",
    willCreateNew: "Will create new bucket",
    optionsLabel: "Options",
    skipExistingLabel: "Skip existing files",
    skipExistingDesc: "Don't copy files that already exist in target",
    overwriteLabel: "Overwrite existing",
    overwriteDesc: "Replace files in target if they exist",
    cancelBtn: "Cancel",
    startCopyBtn: "Start Copy",
    filesCount: "files",
    errorRequired: "Please fill all required fields",
    errorInvalidName: "Invalid bucket name. Use lowercase letters, numbers, and hyphens only"
  },
  es: {
    copyTitle: "Copiar Bucket",
    copyDescription: "Crear una copia completa de tu bucket a otro proveedor",
    sourceLabel: "Origen",
    targetLabel: "Destino",
    targetProviderLabel: "Proveedor Destino",
    selectProvider: "Selecciona un proveedor",
    targetBucketLabel: "Bucket Destino",
    bucketSearchPlaceholder: "bucket-destino",
    bucketNameRules: "Solo min\xFAsculas, n\xFAmeros y guiones",
    willCreateNew: "Crear\xE1 un nuevo bucket",
    optionsLabel: "Opciones",
    skipExistingLabel: "Omitir archivos existentes",
    skipExistingDesc: "No copiar archivos que ya existen en destino",
    overwriteLabel: "Sobrescribir existentes",
    overwriteDesc: "Reemplazar archivos en destino si existen",
    cancelBtn: "Cancelar",
    startCopyBtn: "Iniciar Copia",
    filesCount: "archivos",
    errorRequired: "Por favor completa todos los campos requeridos",
    errorInvalidName: "Nombre de bucket inv\xE1lido. Usa solo min\xFAsculas, n\xFAmeros y guiones"
  },
  pt: {
    copyTitle: "Copiar Bucket",
    copyDescription: "Criar uma c\xF3pia completa do seu bucket para outro provedor",
    sourceLabel: "Origem",
    targetLabel: "Destino",
    targetProviderLabel: "Provedor Destino",
    selectProvider: "Selecione um provedor",
    targetBucketLabel: "Bucket Destino",
    bucketSearchPlaceholder: "bucket-destino",
    bucketNameRules: "Apenas min\xFAsculas, n\xFAmeros e h\xEDfens",
    willCreateNew: "Vai criar novo bucket",
    optionsLabel: "Op\xE7\xF5es",
    skipExistingLabel: "Pular arquivos existentes",
    skipExistingDesc: "N\xE3o copiar arquivos que j\xE1 existem no destino",
    overwriteLabel: "Sobrescrever existentes",
    overwriteDesc: "Substituir arquivos no destino se existirem",
    cancelBtn: "Cancelar",
    startCopyBtn: "Iniciar C\xF3pia",
    filesCount: "arquivos",
    errorRequired: "Por favor preencha todos os campos obrigat\xF3rios",
    errorInvalidName: "Nome de bucket inv\xE1lido. Use apenas min\xFAsculas, n\xFAmeros e h\xEDfens"
  },
  fr: {
    copyTitle: "Copier le Bucket",
    copyDescription: "Cr\xE9er une copie compl\xE8te de votre bucket vers un autre fournisseur",
    sourceLabel: "Source",
    targetLabel: "Destination",
    targetProviderLabel: "Fournisseur de Destination",
    selectProvider: "S\xE9lectionner un fournisseur",
    targetBucketLabel: "Bucket de Destination",
    bucketSearchPlaceholder: "bucket-destination",
    bucketNameRules: "Lettres minuscules, chiffres et tirets uniquement",
    willCreateNew: "Va cr\xE9er un nouveau bucket",
    optionsLabel: "Options",
    skipExistingLabel: "Ignorer les fichiers existants",
    skipExistingDesc: "Ne pas copier les fichiers qui existent d\xE9j\xE0 dans la destination",
    overwriteLabel: "\xC9craser les existants",
    overwriteDesc: "Remplacer les fichiers dans la destination s'ils existent",
    cancelBtn: "Annuler",
    startCopyBtn: "D\xE9marrer la Copie",
    filesCount: "fichiers",
    errorRequired: "Veuillez remplir tous les champs obligatoires",
    errorInvalidName: "Nom de bucket invalide. Utilisez uniquement des minuscules, chiffres et tirets"
  },
  ja: {
    copyTitle: "\u30D0\u30B1\u30C3\u30C8\u3092\u30B3\u30D4\u30FC",
    copyDescription: "\u5225\u306E\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306B\u30D0\u30B1\u30C3\u30C8\u306E\u5B8C\u5168\u306A\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u4F5C\u6210",
    sourceLabel: "\u30BD\u30FC\u30B9",
    targetLabel: "\u30BF\u30FC\u30B2\u30C3\u30C8",
    targetProviderLabel: "\u30BF\u30FC\u30B2\u30C3\u30C8\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC",
    selectProvider: "\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3092\u9078\u629E",
    targetBucketLabel: "\u30BF\u30FC\u30B2\u30C3\u30C8\u30D0\u30B1\u30C3\u30C8",
    bucketSearchPlaceholder: "\u30BF\u30FC\u30B2\u30C3\u30C8\u30D0\u30B1\u30C3\u30C8",
    bucketNameRules: "\u5C0F\u6587\u5B57\u3001\u6570\u5B57\u3001\u30CF\u30A4\u30D5\u30F3\u306E\u307F",
    willCreateNew: "\u65B0\u3057\u3044\u30D0\u30B1\u30C3\u30C8\u3092\u4F5C\u6210\u3057\u307E\u3059",
    optionsLabel: "\u30AA\u30D7\u30B7\u30E7\u30F3",
    skipExistingLabel: "\u65E2\u5B58\u30D5\u30A1\u30A4\u30EB\u3092\u30B9\u30AD\u30C3\u30D7",
    skipExistingDesc: "\u30BF\u30FC\u30B2\u30C3\u30C8\u306B\u65E2\u306B\u5B58\u5728\u3059\u308B\u30D5\u30A1\u30A4\u30EB\u306F\u30B3\u30D4\u30FC\u3057\u306A\u3044",
    overwriteLabel: "\u65E2\u5B58\u3092\u4E0A\u66F8\u304D",
    overwriteDesc: "\u30BF\u30FC\u30B2\u30C3\u30C8\u306B\u30D5\u30A1\u30A4\u30EB\u304C\u5B58\u5728\u3059\u308B\u5834\u5408\u306F\u7F6E\u304D\u63DB\u3048\u308B",
    cancelBtn: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    startCopyBtn: "\u30B3\u30D4\u30FC\u958B\u59CB",
    filesCount: "\u30D5\u30A1\u30A4\u30EB",
    errorRequired: "\u5FC5\u9808\u30D5\u30A3\u30FC\u30EB\u30C9\u3092\u3059\u3079\u3066\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
    errorInvalidName: "\u30D0\u30B1\u30C3\u30C8\u540D\u304C\u7121\u52B9\u3067\u3059\u3002\u5C0F\u6587\u5B57\u3001\u6570\u5B57\u3001\u30CF\u30A4\u30D5\u30F3\u306E\u307F\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044"
  },
  zh: {
    copyTitle: "\u590D\u5236\u5B58\u50A8\u6876",
    copyDescription: "\u521B\u5EFA\u5B58\u50A8\u6876\u7684\u5B8C\u6574\u5907\u4EFD\u5230\u53E6\u4E00\u4E2A\u63D0\u4F9B\u5546",
    sourceLabel: "\u6E90",
    targetLabel: "\u76EE\u6807",
    targetProviderLabel: "\u76EE\u6807\u63D0\u4F9B\u5546",
    selectProvider: "\u9009\u62E9\u63D0\u4F9B\u5546",
    targetBucketLabel: "\u76EE\u6807\u5B58\u50A8\u6876",
    bucketSearchPlaceholder: "\u76EE\u6807\u5B58\u50A8\u6876",
    bucketNameRules: "\u4EC5\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u8FDE\u5B57\u7B26",
    willCreateNew: "\u5C06\u521B\u5EFA\u65B0\u5B58\u50A8\u6876",
    optionsLabel: "\u9009\u9879",
    skipExistingLabel: "\u8DF3\u8FC7\u73B0\u6709\u6587\u4EF6",
    skipExistingDesc: "\u4E0D\u590D\u5236\u76EE\u6807\u4E2D\u5DF2\u5B58\u5728\u7684\u6587\u4EF6",
    overwriteLabel: "\u8986\u76D6\u73B0\u6709",
    overwriteDesc: "\u5982\u679C\u6587\u4EF6\u5B58\u5728\u5219\u66FF\u6362\u76EE\u6807\u4E2D\u7684\u6587\u4EF6",
    cancelBtn: "\u53D6\u6D88",
    startCopyBtn: "\u5F00\u59CB\u590D\u5236",
    filesCount: "\u6587\u4EF6",
    errorRequired: "\u8BF7\u586B\u5199\u6240\u6709\u5FC5\u586B\u5B57\u6BB5",
    errorInvalidName: "\u5B58\u50A8\u6876\u540D\u79F0\u65E0\u6548\u3002\u4EC5\u4F7F\u7528\u5C0F\u5199\u5B57\u6BCD\uFF0C\u6570\u5B57\u548C\u8FDE\u5B57\u7B26"
  },
  de: {
    copyTitle: "Bucket kopieren",
    copyDescription: "Erstellen Sie eine vollst\xE4ndige Sicherung Ihres Buckets zu einem anderen Anbieter",
    sourceLabel: "Quelle",
    targetLabel: "Ziel",
    targetProviderLabel: "Zielanbieter",
    selectProvider: "Anbieter ausw\xE4hlen",
    targetBucketLabel: "Ziel-Bucket",
    bucketSearchPlaceholder: "bucket-ziel",
    bucketNameRules: "Nur Kleinbuchstaben, Zahlen und Bindestriche",
    willCreateNew: "Neues Bucket wird erstellt",
    optionsLabel: "Optionen",
    skipExistingLabel: "Vorhandene Dateien \xFCberspringen",
    skipExistingDesc: "Dateien nicht kopieren, die bereits im Ziel vorhanden sind",
    overwriteLabel: "Vorhandene \xFCberschreiben",
    overwriteDesc: "Dateien im Ziel ersetzen, falls vorhanden",
    cancelBtn: "Abbrechen",
    startCopyBtn: "Kopie starten",
    filesCount: "Dateien",
    errorRequired: "Bitte f\xFCllen Sie alle erforderlichen Felder aus",
    errorInvalidName: "Ung\xFCltiger Bucket-Name. Verwenden Sie nur Kleinbuchstaben, Zahlen und Bindestriche"
  },
  it: {
    copyTitle: "Copia Bucket",
    copyDescription: "Crea un backup completo del tuo bucket su un altro provider",
    sourceLabel: "Sorgente",
    targetLabel: "Destinazione",
    targetProviderLabel: "Provider di destinazione",
    selectProvider: "Seleziona un provider",
    targetBucketLabel: "Bucket di destinazione",
    bucketSearchPlaceholder: "bucket-destinazione",
    bucketNameRules: "Solo lettere minuscole, numeri e trattini",
    willCreateNew: "Creer\xE0 un nuovo bucket",
    optionsLabel: "Opzioni",
    skipExistingLabel: "Salta file esistenti",
    skipExistingDesc: "Non copiare file gi\xE0 presenti nella destinazione",
    overwriteLabel: "Sovrascrivi esistenti",
    overwriteDesc: "Sostituisci i file nella destinazione se esistono",
    cancelBtn: "Annulla",
    startCopyBtn: "Avvia copia",
    filesCount: "file",
    errorRequired: "Per favore compila tutti i campi richiesti",
    errorInvalidName: "Nome bucket non valido. Usa solo lettere minuscole, numeri e trattini"
  },
  ru: {
    copyTitle: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435",
    copyDescription: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043F\u043E\u043B\u043D\u0443\u044E \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E \u0432\u0430\u0448\u0435\u0433\u043E \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0443 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430",
    sourceLabel: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A",
    targetLabel: "\u0426\u0435\u043B\u044C",
    targetProviderLabel: "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440",
    selectProvider: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430",
    targetBucketLabel: "\u0426\u0435\u043B\u0435\u0432\u043E\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435",
    bucketSearchPlaceholder: "\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435- \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435",
    bucketNameRules: "\u0422\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u0440\u043E\u0447\u043D\u044B\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B \u0438 \u0434\u0435\u0444\u0438\u0441\u044B",
    willCreateNew: "\u0411\u0443\u0434\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u043D\u043E\u0432\u043E\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435",
    optionsLabel: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B",
    skipExistingLabel: "\u041F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0444\u0430\u0439\u043B\u044B",
    skipExistingDesc: "\u041D\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0444\u0430\u0439\u043B\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0442 \u0432 \u0446\u0435\u043B\u0438",
    overwriteLabel: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435",
    overwriteDesc: "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C \u0444\u0430\u0439\u043B\u044B \u0432 \u0446\u0435\u043B\u0438, \u0435\u0441\u043B\u0438 \u043E\u043D\u0438 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0442",
    cancelBtn: "\u041E\u0442\u043C\u0435\u043D\u0430",
    startCopyBtn: "\u041D\u0430\u0447\u0430\u0442\u044C \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",
    filesCount: "\u0444\u0430\u0439\u043B\u043E\u0432",
    errorRequired: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0432\u0441\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043F\u043E\u043B\u044F",
    errorInvalidName: "\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0438\u043C\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u0440\u043E\u0447\u043D\u044B\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B \u0438 \u0434\u0435\u0444\u0438\u0441\u044B"
  },
  he: {
    copyTitle: "\u05D4\u05E2\u05EA\u05E7 \u05D3\u05DC\u05D9",
    copyDescription: "\u05E6\u05D5\u05E8 \u05D2\u05D9\u05D1\u05D5\u05D9 \u05DE\u05DC\u05D0 \u05E9\u05DC \u05D4\u05D3\u05DC\u05D9 \u05E9\u05DC\u05DA \u05DC\u05E1\u05E4\u05E7 \u05D0\u05D7\u05E8",
    sourceLabel: "\u05DE\u05E7\u05D5\u05E8",
    targetLabel: "\u05D9\u05E2\u05D3",
    targetProviderLabel: "\u05E1\u05E4\u05E7 \u05D9\u05E2\u05D3",
    selectProvider: "\u05D1\u05D7\u05E8 \u05E1\u05E4\u05E7",
    targetBucketLabel: "\u05D3\u05DC\u05D9 \u05D9\u05E2\u05D3",
    bucketSearchPlaceholder: "\u05D3\u05DC\u05D9-\u05D9\u05E2\u05D3",
    bucketNameRules: "\u05D0\u05D5\u05EA\u05D9\u05D5\u05EA \u05E7\u05D8\u05E0\u05D5\u05EA, \u05DE\u05E1\u05E4\u05E8\u05D9\u05DD \u05D5\u05DE\u05E7\u05E4\u05D9\u05DD \u05D1\u05DC\u05D1\u05D3",
    willCreateNew: "\u05D9\u05D9\u05E6\u05D5\u05E8 \u05D3\u05DC\u05D9 \u05D7\u05D3\u05E9",
    optionsLabel: "\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA",
    skipExistingLabel: "\u05D3\u05DC\u05D2 \u05E2\u05DC \u05E7\u05D1\u05E6\u05D9\u05DD \u05E7\u05D9\u05D9\u05DE\u05D9\u05DD",
    skipExistingDesc: "\u05D0\u05DC \u05EA\u05E2\u05EA\u05D9\u05E7 \u05E7\u05D1\u05E6\u05D9\u05DD \u05E9\u05DB\u05D1\u05E8 \u05E7\u05D9\u05D9\u05DE\u05D9\u05DD \u05D1\u05D9\u05E2\u05D3",
    overwriteLabel: "\u05D4\u05D7\u05DC\u05E3 \u05E7\u05D9\u05D9\u05DE\u05D9\u05DD",
    overwriteDesc: "\u05D4\u05D7\u05DC\u05E3 \u05E7\u05D1\u05E6\u05D9\u05DD \u05D1\u05D9\u05E2\u05D3 \u05D0\u05DD \u05D4\u05DD \u05E7\u05D9\u05D9\u05DE\u05D9\u05DD",
    cancelBtn: "\u05D1\u05D9\u05D8\u05D5\u05DC",
    startCopyBtn: "\u05D4\u05EA\u05D7\u05DC \u05D4\u05E2\u05EA\u05E7\u05D4",
    filesCount: "\u05E7\u05D1\u05E6\u05D9\u05DD",
    errorRequired: "\u05D0\u05E0\u05D0 \u05DE\u05DC\u05D0 \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05D3\u05D5\u05EA \u05D4\u05E0\u05D3\u05E8\u05E9\u05D9\u05DD",
    errorInvalidName: "\u05E9\u05DD \u05D3\u05DC\u05D9 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9. \u05D4\u05E9\u05EA\u05DE\u05E9 \u05D1\u05D0\u05D5\u05EA\u05D9\u05D5\u05EA \u05E7\u05D8\u05E0\u05D5\u05EA, \u05DE\u05E1\u05E4\u05E8\u05D9\u05DD \u05D5\u05DE\u05E7\u05E4\u05D9\u05DD \u05D1\u05DC\u05D1\u05D3"
  }
};

// public/js/i18n/translations/delete-modal.i18n.ts
var deleteModalTranslations = {
  en: {
    deleteTitle: "Delete",
    deleteBucketTitle: "Delete Bucket",
    deleteItemTitle: "Delete Item",
    deleteBucketDesc: "This action is irreversible. Type the bucket name to confirm deletion.",
    deleteItemDesc: "Confirm deletion? This action cannot be undone.",
    deleteConfirmLabel: "Type bucket name to confirm:",
    deleteConfirmPlaceholder: "bucket-name",
    deleteErrorConfirm: "Bucket name does not match",
    deleteErrorEmpty: "Please enter the bucket name",
    cancelBtn: "Cancel",
    deleteBtn: "Delete",
    bucketName: "Bucket"
  },
  es: {
    deleteTitle: "Eliminar",
    deleteBucketTitle: "Eliminar Bucket",
    deleteItemTitle: "Eliminar Elemento",
    deleteBucketDesc: "Esta acci\xF3n es irreversible. Escribe el nombre del bucket para confirmar.",
    deleteItemDesc: "\xBFConfirmar eliminaci\xF3n? Esta acci\xF3n no se puede deshacer.",
    deleteConfirmLabel: "Escribe el nombre del bucket para confirmar:",
    deleteConfirmPlaceholder: "nombre-bucket",
    deleteErrorConfirm: "El nombre del bucket no coincide",
    deleteErrorEmpty: "Por favor ingresa el nombre del bucket",
    cancelBtn: "Cancelar",
    deleteBtn: "Eliminar",
    bucketName: "Bucket"
  },
  pt: {
    deleteTitle: "Excluir",
    deleteBucketTitle: "Excluir Bucket",
    deleteItemTitle: "Excluir Item",
    deleteBucketDesc: "Esta a\xE7\xE3o \xE9 irrevers\xEDvel. Digite o nome do bucket para confirmar.",
    deleteItemDesc: "Confirmar exclus\xE3o? Esta a\xE7\xE3o n\xE3o pode ser desfeita.",
    deleteConfirmLabel: "Digite o nome do bucket para confirmar:",
    deleteConfirmPlaceholder: "nome-bucket",
    deleteErrorConfirm: "Nome do bucket n\xE3o corresponde",
    deleteErrorEmpty: "Por favor digite o nome do bucket",
    cancelBtn: "Cancelar",
    deleteBtn: "Excluir",
    bucketName: "Bucket"
  },
  fr: {
    deleteTitle: "Supprimer",
    deleteBucketTitle: "Supprimer le Bucket",
    deleteItemTitle: "Supprimer l'\xE9l\xE9ment",
    deleteBucketDesc: "Cette action est irr\xE9versible. Tapez le nom du bucket pour confirmer.",
    deleteItemDesc: "Confirmer la suppression? Cette action ne peut pas \xEAtre annul\xE9e.",
    deleteConfirmLabel: "Tapez le nom du bucket pour confirmer:",
    deleteConfirmPlaceholder: "nom-du-bucket",
    deleteErrorConfirm: "Le nom du bucket ne correspond pas",
    deleteErrorEmpty: "Veuillez entrer le nom du bucket",
    cancelBtn: "Annuler",
    deleteBtn: "Supprimer",
    bucketName: "Bucket"
  },
  ja: {
    deleteTitle: "\u524A\u9664",
    deleteBucketTitle: "\u30D0\u30B1\u30C3\u30C8\u3092\u524A\u9664",
    deleteItemTitle: "\u30A2\u30A4\u30C6\u30E0\u3092\u524A\u9664",
    deleteBucketDesc: "\u3053\u306E\u64CD\u4F5C\u306F\u5143\u306B\u623B\u305B\u307E\u305B\u3093\u3002\u30D0\u30B1\u30C3\u30C8\u540D\u3092\u5165\u529B\u3057\u3066\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    deleteItemDesc: "\u524A\u9664\u3092\u78BA\u8A8D\u3057\u307E\u3059\u304B\uFF1F\u3053\u306E\u64CD\u4F5C\u306F\u5143\u306B\u623B\u305B\u307E\u305B\u3093\u3002",
    deleteConfirmLabel: "\u30D0\u30B1\u30C3\u30C8\u540D\u3092\u5165\u529B\u3057\u3066\u78BA\u8A8D:",
    deleteConfirmPlaceholder: "\u30D0\u30B1\u30C3\u30C8\u540D",
    deleteErrorConfirm: "\u30D0\u30B1\u30C3\u30C8\u540D\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093",
    deleteErrorEmpty: "\u30D0\u30B1\u30C3\u30C8\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
    cancelBtn: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    deleteBtn: "\u524A\u9664",
    bucketName: "\u30D0\u30B1\u30C3\u30C8"
  },
  zh: {
    deleteTitle: "\u5220\u9664",
    deleteBucketTitle: "\u5220\u9664\u5B58\u50A8\u6876",
    deleteItemTitle: "\u5220\u9664\u9879\u76EE",
    deleteBucketDesc: "\u6B64\u64CD\u4F5C\u4E0D\u53EF\u9006\u3002\u8BF7\u8F93\u5165\u5B58\u50A8\u6876\u540D\u79F0\u786E\u8BA4\u3002",
    deleteItemDesc: "\u786E\u8BA4\u5220\u9664\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u6D88\u3002",
    deleteConfirmLabel: "\u8F93\u5165\u5B58\u50A8\u6876\u540D\u79F0\u786E\u8BA4:",
    deleteConfirmPlaceholder: "\u5B58\u50A8\u6876\u540D\u79F0",
    deleteErrorConfirm: "\u5B58\u50A8\u6876\u540D\u79F0\u4E0D\u5339\u914D",
    deleteErrorEmpty: "\u8BF7\u8F93\u5165\u5B58\u50A8\u6876\u540D\u79F0",
    cancelBtn: "\u53D6\u6D88",
    deleteBtn: "\u5220\u9664",
    bucketName: "\u5B58\u50A8\u6876"
  },
  de: {
    deleteTitle: "L\xF6schen",
    deleteBucketTitle: "Bucket l\xF6schen",
    deleteItemTitle: "Element l\xF6schen",
    deleteBucketDesc: "Diese Aktion ist irreversibel. Geben Sie den Bucket-Namen zur Best\xE4tigung ein.",
    deleteItemDesc: "L\xF6schen best\xE4tigen? Diese Aktion kann nicht r\xFCckg\xE4ngig gemacht werden.",
    deleteConfirmLabel: "Bucket-Namen zur Best\xE4tigung eingeben:",
    deleteConfirmPlaceholder: "bucket-name",
    deleteErrorConfirm: "Bucket-Name stimmt nicht \xFCberein",
    deleteErrorEmpty: "Bitte geben Sie den Bucket-Namen ein",
    cancelBtn: "Abbrechen",
    deleteBtn: "L\xF6schen",
    bucketName: "Bucket"
  },
  it: {
    deleteTitle: "Elimina",
    deleteBucketTitle: "Elimina Bucket",
    deleteItemTitle: "Elimina elemento",
    deleteBucketDesc: "Questa azione \xE8 irreversibile. Digita il nome del bucket per confermare.",
    deleteItemDesc: "Confermare eliminazione? Questa azione non pu\xF2 essere annullata.",
    deleteConfirmLabel: "Digita il nome del bucket per confermare:",
    deleteConfirmPlaceholder: "nome-bucket",
    deleteErrorConfirm: "Il nome del bucket non corrisponde",
    deleteErrorEmpty: "Per favore inserisci il nome del bucket",
    cancelBtn: "Annulla",
    deleteBtn: "Elimina",
    bucketName: "Bucket"
  },
  ru: {
    deleteTitle: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
    deleteBucketTitle: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435",
    deleteItemTitle: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u044D\u043B\u0435\u043C\u0435\u043D\u0442",
    deleteBucketDesc: "\u042D\u0442\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043D\u0435\u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E. \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0434\u043B\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F.",
    deleteItemDesc: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435? \u042D\u0442\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043D\u0435\u043B\u044C\u0437\u044F \u043E\u0442\u043C\u0435\u043D\u0438\u0442\u044C.",
    deleteConfirmLabel: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0434\u043B\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F:",
    deleteConfirmPlaceholder: "\u0438\u043C\u044F-\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430",
    deleteErrorConfirm: "\u0418\u043C\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0435\u0442",
    deleteErrorEmpty: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430",
    cancelBtn: "\u041E\u0442\u043C\u0435\u043D\u0430",
    deleteBtn: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
    bucketName: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435"
  },
  he: {
    deleteTitle: "\u05DE\u05D7\u05E7",
    deleteBucketTitle: "\u05DE\u05D7\u05E7 \u05D3\u05DC\u05D9",
    deleteItemTitle: "\u05DE\u05D7\u05E7 \u05E4\u05E8\u05D9\u05D8",
    deleteBucketDesc: "\u05E4\u05E2\u05D5\u05DC\u05D4 \u05D6\u05D5 \u05D4\u05D9\u05D0 \u05D1\u05DC\u05EA\u05D9 \u05D4\u05E4\u05D9\u05DB\u05D4. \u05D4\u05E7\u05DC\u05D3 \u05D0\u05EA \u05E9\u05DD \u05D4\u05D3\u05DC\u05D9 \u05DB\u05D3\u05D9 \u05DC\u05D0\u05E9\u05E8 \u05DE\u05D7\u05D9\u05E7\u05D4.",
    deleteItemDesc: "\u05D0\u05E9\u05E8 \u05DE\u05D7\u05D9\u05E7\u05D4? \u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D1\u05D8\u05DC \u05E4\u05E2\u05D5\u05DC\u05D4 \u05D6\u05D5.",
    deleteConfirmLabel: "\u05D4\u05E7\u05DC\u05D3 \u05D0\u05EA \u05E9\u05DD \u05D4\u05D3\u05DC\u05D9 \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8:",
    deleteConfirmPlaceholder: "\u05E9\u05DD-\u05D3\u05DC\u05D9",
    deleteErrorConfirm: "\u05E9\u05DD \u05D4\u05D3\u05DC\u05D9 \u05DC\u05D0 \u05EA\u05D5\u05D0\u05DD",
    deleteErrorEmpty: "\u05D0\u05E0\u05D0 \u05D4\u05D6\u05DF \u05D0\u05EA \u05E9\u05DD \u05D4\u05D3\u05DC\u05D9",
    cancelBtn: "\u05D1\u05D9\u05D8\u05D5\u05DC",
    deleteBtn: "\u05DE\u05D7\u05E7",
    bucketName: "\u05D3\u05DC\u05D9"
  }
};

// public/js/i18n/translations/share-modal.i18n.ts
var shareModalTranslations = {
  en: {
    shareTitle: "Share File",
    shareDescription: "Generate a temporary download link for",
    expiryLabel: "EXPIRATION TIME",
    expiry1min: "1 Minute",
    expiry1hour: "1 Hour",
    expiry24hours: "24 Hours",
    expiry7days: "7 Days",
    urlLabel: "GENERATED LINK",
    cancelBtn: "Cancel",
    generateBtn: "Generate Link",
    copyBtn: "Copy Link",
    toastCopied: "Copied!"
  },
  es: {
    shareTitle: "Compartir Archivo",
    shareDescription: "Generar enlace temporal de descarga para",
    expiryLabel: "TIEMPO DE EXPIRACI\xD3N",
    expiry1min: "1 Minuto",
    expiry1hour: "1 Hora",
    expiry24hours: "24 Horas",
    expiry7days: "7 D\xEDas",
    urlLabel: "ENLACE GENERADO",
    cancelBtn: "Cancelar",
    generateBtn: "Generar Enlace",
    copyBtn: "Copiar Enlace",
    toastCopied: "Copiado!"
  },
  pt: {
    shareTitle: "Compartilhar Arquivo",
    shareDescription: "Gerar link tempor\xE1rio de download para",
    expiryLabel: "TEMPO DE EXPIRA\xC7\xC3O",
    expiry1min: "1 Minuto",
    expiry1hour: "1 Hora",
    expiry24hours: "24 Horas",
    expiry7days: "7 Dias",
    urlLabel: "LINK GERADO",
    cancelBtn: "Cancelar",
    generateBtn: "Gerar Link",
    copyBtn: "Copiar Link",
    toastCopied: "Copiado!"
  },
  fr: {
    shareTitle: "Partager le Fichier",
    shareDescription: "G\xE9n\xE9rer un lien de t\xE9l\xE9chargement temporaire pour",
    expiryLabel: "TEMPS D'EXPIRATION",
    expiry1min: "1 Minute",
    expiry1hour: "1 Heure",
    expiry24hours: "24 Heures",
    expiry7days: "7 Jours",
    urlLabel: "LIEN G\xC9N\xC9R\xC9",
    cancelBtn: "Annuler",
    generateBtn: "G\xE9n\xE9rer le Lien",
    copyBtn: "Copier le Lien",
    toastCopied: "Copi\xE9!"
  },
  ja: {
    shareTitle: "\u30D5\u30A1\u30A4\u30EB\u3092\u5171\u6709",
    shareDescription: "\u4E00\u6642\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u30EA\u30F3\u30AF\u3092\u751F\u6210",
    expiryLabel: "\u6709\u52B9\u671F\u9650",
    expiry1min: "1\u5206",
    expiry1hour: "1\u6642\u9593",
    expiry24hours: "24\u6642\u9593",
    expiry7days: "7\u65E5\u9593",
    urlLabel: "\u751F\u6210\u3055\u308C\u305F\u30EA\u30F3\u30AF",
    cancelBtn: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    generateBtn: "\u30EA\u30F3\u30AF\u3092\u751F\u6210",
    copyBtn: "\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC",
    toastCopied: "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!"
  },
  zh: {
    shareTitle: "\u5206\u4EAB\u6587\u4EF6",
    shareDescription: "\u751F\u6210\u4E34\u65F6\u4E0B\u8F7D\u94FE\u63A5",
    expiryLabel: "\u8FC7\u671F\u65F6\u95F4",
    expiry1min: "1\u5206\u949F",
    expiry1hour: "1\u5C0F\u65F6",
    expiry24hours: "24\u5C0F\u65F6",
    expiry7days: "7\u5929",
    urlLabel: "\u751F\u6210\u7684\u94FE\u63A5",
    cancelBtn: "\u53D6\u6D88",
    generateBtn: "\u751F\u6210\u94FE\u63A5",
    copyBtn: "\u590D\u5236\u94FE\u63A5",
    toastCopied: "\u5DF2\u590D\u5236!"
  },
  de: {
    shareTitle: "Datei teilen",
    shareDescription: "Erstelle einen tempor\xE4ren Download-Link f\xFCr",
    expiryLabel: "ABLAUFZEIT",
    expiry1min: "1 Minute",
    expiry1hour: "1 Stunde",
    expiry24hours: "24 Stunden",
    expiry7days: "7 Tage",
    urlLabel: "GENERIERTER LINK",
    cancelBtn: "Abbrechen",
    generateBtn: "Link generieren",
    copyBtn: "Link kopieren",
    toastCopied: "Kopiert!"
  },
  it: {
    shareTitle: "Condividi file",
    shareDescription: "Genera un link di download temporaneo per",
    expiryLabel: "TEMPO DI SCADENZA",
    expiry1min: "1 Minuto",
    expiry1hour: "1 Ora",
    expiry24hours: "24 Ore",
    expiry7days: "7 Giorni",
    urlLabel: "LINK GENERATO",
    cancelBtn: "Annulla",
    generateBtn: "Genera link",
    copyBtn: "Copia link",
    toastCopied: "Copiato!"
  },
  ru: {
    shareTitle: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F \u0444\u0430\u0439\u043B\u043E\u043C",
    shareDescription: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u0443\u044E \u0441\u0441\u044B\u043B\u043A\u0443 \u0434\u043B\u044F \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u044F",
    expiryLabel: "\u0412\u0420\u0415\u041C\u042F \u0418\u0421\u0422\u0415\u0427\u0415\u041D\u0418\u042F",
    expiry1min: "1 \u043C\u0438\u043D\u0443\u0442\u0430",
    expiry1hour: "1 \u0447\u0430\u0441",
    expiry24hours: "24 \u0447\u0430\u0441\u0430",
    expiry7days: "7 \u0434\u043D\u0435\u0439",
    urlLabel: "\u0421\u0421\u042B\u041B\u041A\u0410 \u0421\u041E\u0417\u0414\u0410\u041D\u0410",
    cancelBtn: "\u041E\u0442\u043C\u0435\u043D\u0430",
    generateBtn: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443",
    copyBtn: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443",
    toastCopied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!"
  },
  he: {
    shareTitle: "\u05E9\u05EA\u05E3 \u05E7\u05D5\u05D1\u05E5",
    shareDescription: "\u05E6\u05D5\u05E8 \u05E7\u05D9\u05E9\u05D5\u05E8 \u05D4\u05D5\u05E8\u05D3\u05D4 \u05D6\u05DE\u05E0\u05D9 \u05E2\u05D1\u05D5\u05E8",
    expiryLabel: "\u05D6\u05DE\u05DF \u05EA\u05E4\u05D5\u05D2\u05D4",
    expiry1min: "\u05D3\u05E7\u05D4 \u05D0\u05D7\u05EA",
    expiry1hour: "\u05E9\u05E2\u05D4",
    expiry24hours: "24 \u05E9\u05E2\u05D5\u05EA",
    expiry7days: "7 \u05D9\u05DE\u05D9\u05DD",
    urlLabel: "\u05E7\u05D9\u05E9\u05D5\u05E8 \u05E9\u05E0\u05D5\u05E6\u05E8",
    cancelBtn: "\u05D1\u05D9\u05D8\u05D5\u05DC",
    generateBtn: "\u05E6\u05D5\u05E8 \u05E7\u05D9\u05E9\u05D5\u05E8",
    copyBtn: "\u05D4\u05E2\u05EA\u05E7 \u05E7\u05D9\u05E9\u05D5\u05E8",
    toastCopied: "\u05D4\u05D5\u05E2\u05EA\u05E7!"
  }
};

// public/js/i18n/translations/folder-modal.i18n.ts
var folderModalTranslations = {
  en: {
    folderTitle: "New Folder",
    folderDescription: "Enter a name for the new folder.",
    folderPlaceholder: "folder-name",
    cancelBtn: "Cancel",
    createBtn: "Create"
  },
  es: {
    folderTitle: "Nueva Carpeta",
    folderDescription: "Ingresa un nombre para la nueva carpeta.",
    folderPlaceholder: "nombre-carpeta",
    cancelBtn: "Cancelar",
    createBtn: "Crear"
  },
  pt: {
    folderTitle: "Nova Pasta",
    folderDescription: "Digite um nome para a nova pasta.",
    folderPlaceholder: "nome-pasta",
    cancelBtn: "Cancelar",
    createBtn: "Criar"
  },
  fr: {
    folderTitle: "Nouveau Dossier",
    folderDescription: "Entrez un nom pour le nouveau dossier.",
    folderPlaceholder: "nom-dossier",
    cancelBtn: "Annuler",
    createBtn: "Cr\xE9er"
  },
  ja: {
    folderTitle: "\u65B0\u3057\u3044\u30D5\u30A9\u30EB\u30C0",
    folderDescription: "\u65B0\u3057\u3044\u30D5\u30A9\u30EB\u30C0\u306E\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    folderPlaceholder: "\u30D5\u30A9\u30EB\u30C0\u540D",
    cancelBtn: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    createBtn: "\u4F5C\u6210"
  },
  zh: {
    folderTitle: "\u65B0\u6587\u4EF6\u5939",
    folderDescription: "\u8F93\u5165\u65B0\u6587\u4EF6\u5939\u7684\u540D\u79F0\u3002",
    folderPlaceholder: "\u6587\u4EF6\u5939\u540D\u79F0",
    cancelBtn: "\u53D6\u6D88",
    createBtn: "\u521B\u5EFA"
  },
  de: {
    folderTitle: "Neuer Ordner",
    folderDescription: "Geben Sie einen Namen f\xFCr den neuen Ordner ein.",
    folderPlaceholder: "ordner-name",
    cancelBtn: "Abbrechen",
    createBtn: "Erstellen"
  },
  it: {
    folderTitle: "Nuova cartella",
    folderDescription: "Inserisci un nome per la nuova cartella.",
    folderPlaceholder: "nome-cartella",
    cancelBtn: "Annulla",
    createBtn: "Crea"
  },
  ru: {
    folderTitle: "\u041D\u043E\u0432\u0430\u044F \u043F\u0430\u043F\u043A\u0430",
    folderDescription: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0434\u043B\u044F \u043D\u043E\u0432\u043E\u0439 \u043F\u0430\u043F\u043A\u0438.",
    folderPlaceholder: "\u0438\u043C\u044F-\u043F\u0430\u043F\u043A\u0438",
    cancelBtn: "\u041E\u0442\u043C\u0435\u043D\u0430",
    createBtn: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C"
  },
  he: {
    folderTitle: "\u05EA\u05D9\u05E7\u05D9\u05D4 \u05D7\u05D3\u05E9\u05D4",
    folderDescription: "\u05D4\u05D6\u05DF \u05E9\u05DD \u05E2\u05D1\u05D5\u05E8 \u05D4\u05EA\u05D9\u05E7\u05D9\u05D4 \u05D4\u05D7\u05D3\u05E9\u05D4.",
    folderPlaceholder: "\u05E9\u05DD-\u05EA\u05D9\u05E7\u05D9\u05D4",
    cancelBtn: "\u05D1\u05D9\u05D8\u05D5\u05DC",
    createBtn: "\u05E6\u05D5\u05E8"
  }
};

// public/js/i18n/translations/preview-modal.i18n.ts
var previewModalTranslations = {
  en: {
    downloadBtn: "Download",
    apkTitle: "Android Package (APK)",
    apkMessage: "Preview not available for binaries.",
    noPreviewTitle: "No Preview Available",
    noPreviewMessage: "This file type cannot be previewed."
  },
  es: {
    downloadBtn: "Descargar",
    apkTitle: "Paquete Android (APK)",
    apkMessage: "Vista previa no disponible para binarios.",
    noPreviewTitle: "Vista Previa No Disponible",
    noPreviewMessage: "Este tipo de archivo no se puede previsualizar."
  },
  pt: {
    downloadBtn: "Baixar",
    apkTitle: "Pacote Android (APK)",
    apkMessage: "Pr\xE9-visualiza\xE7\xE3o n\xE3o dispon\xEDvel para bin\xE1rios.",
    noPreviewTitle: "Pr\xE9-visualiza\xE7\xE3o N\xE3o Dispon\xEDvel",
    noPreviewMessage: "Este tipo de arquivo n\xE3o pode ser pr\xE9-visualizado."
  },
  fr: {
    downloadBtn: "T\xE9l\xE9charger",
    apkTitle: "Package Android (APK)",
    apkMessage: "Aper\xE7u non disponible pour les binaires.",
    noPreviewTitle: "Aper\xE7u Non Disponible",
    noPreviewMessage: "Ce type de fichier ne peut pas \xEAtre pr\xE9visualis\xE9."
  },
  ja: {
    downloadBtn: "\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
    apkTitle: "Android\u30D1\u30C3\u30B1\u30FC\u30B8 (APK)",
    apkMessage: "\u30D0\u30A4\u30CA\u30EA\u30D5\u30A1\u30A4\u30EB\u306E\u30D7\u30EC\u30D3\u30E5\u30FC\u306F\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3002",
    noPreviewTitle: "\u30D7\u30EC\u30D3\u30E5\u30FC\u4E0D\u53EF",
    noPreviewMessage: "\u3053\u306E\u30D5\u30A1\u30A4\u30EB\u30BF\u30A4\u30D7\u306F\u30D7\u30EC\u30D3\u30E5\u30FC\u3067\u304D\u307E\u305B\u3093\u3002"
  },
  zh: {
    downloadBtn: "\u4E0B\u8F7D",
    apkTitle: "Android\u5305 (APK)",
    apkMessage: "\u4E8C\u8FDB\u5236\u6587\u4EF6\u65E0\u6CD5\u9884\u89C8\u3002",
    noPreviewTitle: "\u65E0\u6CD5\u9884\u89C8",
    noPreviewMessage: "\u6B64\u6587\u4EF6\u7C7B\u578B\u65E0\u6CD5\u9884\u89C8\u3002"
  },
  de: {
    downloadBtn: "Herunterladen",
    apkTitle: "Android-Paket (APK)",
    apkMessage: "Vorschau f\xFCr Bin\xE4rdateien nicht verf\xFCgbar.",
    noPreviewTitle: "Keine Vorschau verf\xFCgbar",
    noPreviewMessage: "Dieser Dateityp kann nicht in der Vorschau angezeigt werden."
  },
  it: {
    downloadBtn: "Scarica",
    apkTitle: "Pacchetto Android (APK)",
    apkMessage: "Anteprima non disponibile per file binari.",
    noPreviewTitle: "Nessuna anteprima disponibile",
    noPreviewMessage: "Questo tipo di file non pu\xF2 essere visualizzato in anteprima."
  },
  ru: {
    downloadBtn: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C",
    apkTitle: "Android \u043F\u0430\u043A\u0435\u0442 (APK)",
    apkMessage: "\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0434\u043B\u044F \u0431\u0438\u043D\u0430\u0440\u043D\u044B\u0445 \u0444\u0430\u0439\u043B\u043E\u0432 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D.",
    noPreviewTitle: "\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D",
    noPreviewMessage: "\u042D\u0442\u043E\u0442 \u0442\u0438\u043F \u0444\u0430\u0439\u043B\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043D."
  },
  he: {
    downloadBtn: "\u05D4\u05D5\u05E8\u05D3",
    apkTitle: "\u05D7\u05D1\u05D9\u05DC\u05EA Android (APK)",
    apkMessage: "\u05EA\u05E6\u05D5\u05D2\u05D4 \u05DE\u05E7\u05D3\u05D9\u05DE\u05D4 \u05DC\u05D0 \u05D6\u05DE\u05D9\u05E0\u05D4 \u05E2\u05D1\u05D5\u05E8 \u05E7\u05D1\u05E6\u05D9\u05DD \u05D1\u05D9\u05E0\u05D0\u05E8\u05D9\u05D9\u05DD.",
    noPreviewTitle: "\u05D0\u05D9\u05DF \u05EA\u05E6\u05D5\u05D2\u05D4 \u05DE\u05E7\u05D3\u05D9\u05DE\u05D4",
    noPreviewMessage: "\u05E1\u05D5\u05D2 \u05E7\u05D5\u05D1\u05E5 \u05D6\u05D4 \u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05EA\u05E6\u05D5\u05D2\u05D4 \u05DE\u05E7\u05D3\u05D9\u05DE\u05D4."
  }
};

// public/js/i18n/translations/explorer.i18n.ts
var explorerTranslations = {
  en: {
    rootLabel: "root",
    newFolderTooltip: "New Folder",
    uploadBtn: "Upload",
    deleteBtn: "Delete",
    deleteSelectedBtn: "Delete"
  },
  es: {
    rootLabel: "ra\xEDz",
    newFolderTooltip: "Nueva Carpeta",
    uploadBtn: "Subir",
    deleteBtn: "Eliminar",
    deleteSelectedBtn: "Eliminar"
  },
  pt: {
    rootLabel: "raiz",
    newFolderTooltip: "Nova Pasta",
    uploadBtn: "Enviar",
    deleteBtn: "Excluir",
    deleteSelectedBtn: "Excluir"
  },
  fr: {
    rootLabel: "racine",
    newFolderTooltip: "Nouveau Dossier",
    uploadBtn: "T\xE9l\xE9charger",
    deleteBtn: "Supprimer",
    deleteSelectedBtn: "Supprimer"
  },
  ja: {
    rootLabel: "\u30EB\u30FC\u30C8",
    newFolderTooltip: "\u65B0\u3057\u3044\u30D5\u30A9\u30EB\u30C0",
    uploadBtn: "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
    deleteBtn: "\u524A\u9664",
    deleteSelectedBtn: "\u524A\u9664"
  },
  zh: {
    rootLabel: "\u6839\u76EE\u5F55",
    newFolderTooltip: "\u65B0\u6587\u4EF6\u5939",
    uploadBtn: "\u4E0A\u4F20",
    deleteBtn: "\u5220\u9664",
    deleteSelectedBtn: "\u5220\u9664"
  },
  de: {
    rootLabel: "Stammverzeichnis",
    newFolderTooltip: "Neuer Ordner",
    uploadBtn: "Hochladen",
    deleteBtn: "L\xF6schen",
    deleteSelectedBtn: "L\xF6schen"
  },
  it: {
    rootLabel: "radice",
    newFolderTooltip: "Nuova cartella",
    uploadBtn: "Carica",
    deleteBtn: "Elimina",
    deleteSelectedBtn: "Elimina"
  },
  ru: {
    rootLabel: "\u043A\u043E\u0440\u0435\u043D\u044C",
    newFolderTooltip: "\u041D\u043E\u0432\u0430\u044F \u043F\u0430\u043F\u043A\u0430",
    uploadBtn: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",
    deleteBtn: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
    deleteSelectedBtn: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"
  },
  he: {
    rootLabel: "\u05E9\u05D5\u05E8\u05E9",
    newFolderTooltip: "\u05EA\u05D9\u05E7\u05D9\u05D4 \u05D7\u05D3\u05E9\u05D4",
    uploadBtn: "\u05D4\u05E2\u05DC\u05D4",
    deleteBtn: "\u05DE\u05D7\u05E7",
    deleteSelectedBtn: "\u05DE\u05D7\u05E7"
  }
};

// public/js/i18n/index.ts
var translations = {
  en: {
    ...commonTranslations.en,
    ...copyModalTranslations.en,
    ...deleteModalTranslations.en,
    ...shareModalTranslations.en,
    ...folderModalTranslations.en,
    ...previewModalTranslations.en,
    ...explorerTranslations.en
  },
  es: {
    ...commonTranslations.es,
    ...copyModalTranslations.es,
    ...deleteModalTranslations.es,
    ...shareModalTranslations.es,
    ...folderModalTranslations.es,
    ...previewModalTranslations.es,
    ...explorerTranslations.es
  },
  pt: {
    ...commonTranslations.pt,
    ...copyModalTranslations.pt,
    ...deleteModalTranslations.pt,
    ...shareModalTranslations.pt,
    ...folderModalTranslations.pt,
    ...previewModalTranslations.pt,
    ...explorerTranslations.pt
  },
  fr: {
    ...commonTranslations.fr,
    ...copyModalTranslations.fr,
    ...deleteModalTranslations.fr,
    ...shareModalTranslations.fr,
    ...folderModalTranslations.fr,
    ...previewModalTranslations.fr,
    ...explorerTranslations.fr
  },
  ja: {
    ...commonTranslations.ja,
    ...copyModalTranslations.ja,
    ...deleteModalTranslations.ja,
    ...shareModalTranslations.ja,
    ...folderModalTranslations.ja,
    ...previewModalTranslations.ja,
    ...explorerTranslations.ja
  },
  zh: {
    ...commonTranslations.zh,
    ...copyModalTranslations.zh,
    ...deleteModalTranslations.zh,
    ...shareModalTranslations.zh,
    ...folderModalTranslations.zh,
    ...previewModalTranslations.zh,
    ...explorerTranslations.zh
  },
  de: {
    ...commonTranslations.de,
    ...copyModalTranslations.de,
    ...deleteModalTranslations.de,
    ...shareModalTranslations.de,
    ...folderModalTranslations.de,
    ...previewModalTranslations.de,
    ...explorerTranslations.de
  },
  it: {
    ...commonTranslations.it,
    ...copyModalTranslations.it,
    ...deleteModalTranslations.it,
    ...shareModalTranslations.it,
    ...folderModalTranslations.it,
    ...previewModalTranslations.it,
    ...explorerTranslations.it
  },
  ru: {
    ...commonTranslations.ru,
    ...copyModalTranslations.ru,
    ...deleteModalTranslations.ru,
    ...shareModalTranslations.ru,
    ...folderModalTranslations.ru,
    ...previewModalTranslations.ru,
    ...explorerTranslations.ru
  },
  he: {
    ...commonTranslations.he,
    ...copyModalTranslations.he,
    ...deleteModalTranslations.he,
    ...shareModalTranslations.he,
    ...folderModalTranslations.he,
    ...previewModalTranslations.he,
    ...explorerTranslations.he
  }
};
if (typeof window !== "undefined") {
  window.translations = translations;
}

// public/js/i18n-bundle.ts
__reExport(i18n_bundle_exports, i18n_exports);
export {
  flags,
  initLanguage,
  renderLanguageSelector,
  setLanguage,
  t,
  translations
};
//# sourceMappingURL=i18n.js.map
