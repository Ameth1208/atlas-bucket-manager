export const flags = { 
    en: 'flagpack:us', 
    es: 'flagpack:es', 
    fr: 'flagpack:fr', 
    pt: 'flagpack:br', 
    ja: 'flagpack:jp', 
    zh: 'flagpack:cn' 
};

export const translations = {
    en: { 
        title: "Storage Buckets", subtitle: "Manage visibility and lifecycle.", create: "Create", logout: "Logout", 
        emptyTitle: "No buckets found", emptyDesc: "Start by creating a new container.", 
        publicAccess: "Public", privateAccess: "Private", 
        deleteTitle: "Delete Bucket", deleteConfirm: "Confirm deletion?", deleteWarning: "Bucket must be empty.", deleteBtn: "Delete", cancelBtn: "Cancel", 
        explore: "Explore", toastCreated: "Bucket created", toastDeleted: "Bucket removed", toastUpdated: "Visibility updated", errorEmpty: "Bucket not empty or error", readOnly: "Secure Access" 
    },
    es: { 
        title: "Buckets", subtitle: "Gestión de almacenamiento.", create: "Crear", logout: "Salir", 
        emptyTitle: "Sin buckets", emptyDesc: "Crea tu primer contenedor arriba.", 
        publicAccess: "Público", privateAccess: "Privado", 
        deleteTitle: "Eliminar Bucket", deleteConfirm: "¿Eliminar bucket?", deleteWarning: "El bucket debe estar vacío.", deleteBtn: "Eliminar", cancelBtn: "Cerrar", 
        explore: "Explorar", toastCreated: "Bucket creado", toastDeleted: "Bucket eliminado", toastUpdated: "Visibilidad actualizada", errorEmpty: "El bucket no está vacío", readOnly: "Acceso Seguro" 
    },
    pt: { 
        title: "Buckets", subtitle: "Gestão eficiente de armazenamento.", create: "Criar", logout: "Sair", 
        emptyTitle: "Nenhum bucket", emptyDesc: "Crie o seu primeiro bucket.", 
        publicAccess: "Público", privateAccess: "Privado", 
        deleteTitle: "Excluir Bucket", deleteConfirm: "Confirmar exclusão de", deleteWarning: "O bucket deve estar vazio.", deleteBtn: "Excluir", cancelBtn: "Fechar", 
        explore: "Explorar", toastCreated: "Bucket criado", toastDeleted: "Bucket excluído", toastUpdated: "Visibilidade atualizada", errorEmpty: "O bucket não está vazio", readOnly: "Acesso Seguro" 
    },
    fr: { 
        title: "Buckets", subtitle: "Gestion du stockage.", create: "Créer", logout: "Sortir", 
        emptyTitle: "Aucun bucket", emptyDesc: "Créez votre premier bucket.", 
        publicAccess: "Public", privateAccess: "Privé", 
        deleteTitle: "Supprimer", deleteConfirm: "Supprimer?", deleteWarning: "Le bucket doit être vide.", deleteBtn: "Supprimer", cancelBtn: "Fermer", 
        explore: "Explorer", toastCreated: "Bucket créé", toastDeleted: "Bucket supprimé", toastUpdated: "Visibilité mise à jour", errorEmpty: "Bucket non vide", readOnly: "Accès Sécurisé" 
    },
    ja: { 
        title: "バケット", subtitle: "ストレージ管理。", create: "作成", logout: "終了", 
        emptyTitle: "バケットなし", emptyDesc: "最初のバケットを作成。", 
        publicAccess: "公開", privateAccess: "非公開", 
        deleteTitle: "削除", deleteConfirm: "削除の確認", deleteWarning: "バケットは空である必要があります。", deleteBtn: "削除", cancelBtn: "閉じる", 
        explore: "探検", toastCreated: "作成完了", toastDeleted: "削除完了", toastUpdated: "更新完了", errorEmpty: "バケットが空ではありません", readOnly: "安全な読み取り専用" 
    },
    zh: { 
        title: "存储桶", subtitle: "存储管理。", create: "创建", logout: "退出", 
        emptyTitle: "无存储桶", emptyDesc: "创建一个新桶。", 
        publicAccess: "公开", privateAccess: "私有", 
        deleteTitle: "删除", deleteConfirm: "确认删除", deleteWarning: "存储桶必须为空。", deleteBtn: "删除", cancelBtn: "关闭", 
        explore: "探索", toastCreated: "创建成功", toastDeleted: "删除成功", toastUpdated: "更新成功", errorEmpty: "存储桶不为空", readOnly: "安全只读访问" 
    }
};

export function initLanguage(defaultLang = 'en') {
    const saved = localStorage.getItem('lang') || defaultLang;
    setLanguage(saved);
    return saved;
}

export function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    const flagIcon = document.getElementById('currentFlag');
    const langLabel = document.getElementById('currentLangLabel');
    const dropdown = document.getElementById('langDropdown');

    if (flagIcon) flagIcon.setAttribute('icon', flags[lang]);
    if (langLabel) langLabel.innerText = lang.toUpperCase();
    if (dropdown) dropdown.classList.add('hidden');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT') el.placeholder = translations[lang][key];
            else el.innerText = translations[lang][key];
        }
    });
    
    // Trigger custom event so components can re-render if needed
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

export function t(key) {
    const lang = localStorage.getItem('lang') || 'en';
    return translations[lang][key] || key;
}
