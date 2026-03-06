# Frontend Migration to Lit + TypeScript

## 🎯 Objetivo

Modernizar el frontend de Atlas Bucket Manager con Web Components (Lit) + TypeScript para mejorar:
1. **Mantenibilidad** - Componentes modulares e independientes
2. **Escalabilidad** - Paginación nativa (100 items por página)
3. **Developer Experience** - TypeScript + Hot Module Replacement
4. **Facilidad de actualización** - Cada componente es autocontenido

## ✅ Estado Actual

### Instalado
- ✅ Lit v3.3.2
- ✅ Vite v7.3.1
- ✅ TypeScript v5.9.3

### Configuración
- ✅ `vite.config.ts` - Build y dev server configurado
- ✅ `tsconfig.frontend.json` - TypeScript para frontend
- ✅ Scripts npm actualizados

### Componentes Creados (3)

#### 1. `<bucket-card>` ✅
**Ubicación:** `public/js/components-lit/bucket/bucket-card.ts`

**Features:**
- Card individual de bucket
- Toggle público/privado
- Acciones: Explore, Delete, Refresh Stats
- Estilos encapsulados con Shadow DOM
- Type-safe con TypeScript

**Props:**
```typescript
bucket: Bucket  // Datos del bucket
lang: string    // Idioma para formateo
```

**Events:**
```typescript
'explore'        // Al explorar bucket
'delete'         // Al eliminar bucket
'refresh-stats'  // Al refrescar estadísticas
'policy-change'  // Al cambiar público/privado
```

#### 2. `<pagination-controls>` ✅
**Ubicación:** `public/js/components-lit/shared/pagination-controls.ts`

**Features:**
- Controles de paginación inteligentes
- Muestra rango de items (ej: "Showing 1-100 of 500")
- Números de página con ellipsis (...)
- Responsive (móvil-friendly)

**Props:**
```typescript
total: number     // Total de items
page: number      // Página actual
pageSize: number  // Items por página (default: 100)
```

**Events:**
```typescript
'page-change'  // { detail: { page: number } }
```

#### 3. `<file-list>` ✅
**Ubicación:** `public/js/components-lit/explorer/file-list.ts`

**Features:**
- Lista de archivos con paginación integrada
- Selección múltiple con checkboxes
- Iconos por tipo de archivo (imagen, video, código, etc.)
- Acciones: Preview, Share, Download, Delete
- Formato inteligente de tamaño y fecha
- Auto-scroll al cambiar página

**Props:**
```typescript
items: FileObject[]  // Array de archivos/carpetas
pageSize: number     // Items por página (default: 100)
```

**Events:**
```typescript
'navigate'          // Al click en carpeta
'preview'           // Al click en archivo
'selection-change'  // Al seleccionar/deseleccionar
'share'             // Acción compartir
'download'          // Acción descargar  
'delete'            // Acción eliminar
```

**API Pública:**
```typescript
clearSelection()     // Limpiar selección
getSelected()        // Obtener archivos seleccionados
```

## 📦 Estructura Creada

```
public/js/components-lit/
├── bucket/
│   └── bucket-card.ts           ✅ Componente de bucket
├── explorer/
│   └── file-list.ts             ✅ Lista con paginación
├── shared/
│   └── pagination-controls.ts   ✅ Controles de paginación
├── ui/
│   └── (pending)
├── index.ts                      ✅ Export central
└── README.md                     ✅ Documentación
```

## 🚀 Cómo Usar

### 1. Desarrollo (Con Hot Reload)

```bash
# Frontend only
npm run dev:frontend  # http://localhost:3001

# Backend + Frontend simultáneo
npm run dev:all
```

### 2. Build para Producción

```bash
npm run build:frontend
```

Genera archivos optimizados en `dist-frontend/`:
- Minificación automática
- Tree-shaking
- Code splitting
- TypeScript → JavaScript

### 3. Integrar en HTML

```html
<!-- Importar componentes -->
<script type="module" src="/js/components-lit/index.js"></script>

<!-- Usar componentes -->
<bucket-card
  .bucket="${bucketData}"
  lang="es"
  @explore="${handleExplore}"
  @delete="${handleDelete}"
  @policy-change="${handlePolicyChange}">
</bucket-card>

<file-list
  .items="${files}"
  .pageSize="${100}"
  @navigate="${handleNavigate}"
  @preview="${handlePreview}"
  @selection-change="${handleSelection}">
</file-list>
```

## 🎨 Theming

Los componentes usan CSS Variables para theming compatible con dark mode:

```css
--bg-card: white
--bg-secondary: #f1f5f9
--bg-hover: #f8fafc
--border-color: #e2e8f0
--text-primary: #1e293b
--text-muted: #64748b
--color-rose-500: #f43f5e
--color-indigo-500: #6366f1
--color-green-500: #22c55e
--color-amber-500: #f59e0b
```

## 📊 Beneficios vs Vanilla JS

| Aspecto | Vanilla JS (Antes) | Lit (Ahora) |
|---------|-------------------|-------------|
| **Código** | 95 líneas (BucketList.js) | 40 líneas (bucket-card.ts) |
| **Reactividad** | ❌ Manual (innerHTML) | ✅ Automático (reactive properties) |
| **Tipos** | ❌ No | ✅ TypeScript |
| **Paginación** | ❌ No implementada | ✅ Integrada (100 items/página) |
| **Encapsulación** | ⚠️ CSS global | ✅ Shadow DOM |
| **Reusabilidad** | ⚠️ Limitada | ✅ Total (Web Components) |
| **Testing** | ❌ Difícil | ✅ Fácil (componentes aislados) |
| **Hot Reload** | ❌ No | ✅ Con Vite |

## 🔄 Migración Incremental

### Completado ✅
- [x] Setup de Lit + Vite + TypeScript
- [x] Componente `<bucket-card>`
- [x] Componente `<pagination-controls>`
- [x] Componente `<file-list>` con paginación
- [x] **Integración en `manager.html`** ✨ NUEVO
- [x] **Actualización de `BucketList.js`** con Lit/Vanilla fallback
- [x] **Actualización de `Explorer.js`** con Lit/Vanilla fallback
- [x] **Entry point Vite** (`public/js/main.ts`)
- [x] Documentación básica

### Próximos Pasos 📋
- [ ] Componente `<search-bar>` con debounce
- [ ] Componente `<modal-base>` reutilizable
- [ ] Componente `<theme-toggle>`
- [ ] Componente `<language-selector>`
- [ ] Tests unitarios con Web Test Runner
- [ ] Actualizar AGENTS.md con info de Lit

## ⚡ Cómo Funciona la Integración

### Arquitectura Híbrida

El sistema ahora soporta **dos modos** de renderizado:

1. **Lit Components (Modo Dev)** - Cuando accedes via `http://localhost:3001` (Vite)
2. **Vanilla JS (Fallback)** - Cuando accedes via `http://localhost:3000` (Express)

### Detección Automática

Ambos archivos (`BucketList.js` y `Explorer.js`) detectan automáticamente si Lit está disponible:

```javascript
// Detectar si los componentes Lit están registrados
const useLitComponents = customElements.get('bucket-card'); // o 'file-list'

if (useLitComponents) {
  // 🔥 Usar Lit Web Components con paginación
  renderWithLit(...);
} else {
  // 📦 Usar implementación Vanilla JS original
  renderVanilla(...);
}
```

### Archivos Modificados

#### 1. `manager.html`
Agregado script que carga componentes Lit solo en modo dev:

```javascript
<script type="module">
  const isDev = window.location.port === '3001' || window.location.hostname === 'localhost';
  if (isDev) {
    import('/js/main.ts').catch(err => console.warn('Lit components not loaded:', err));
  }
</script>
```

#### 2. `public/js/main.ts` ✨ NUEVO
Entry point de Vite que registra todos los componentes Lit:

```typescript
// Import Lit components (auto-register via @customElement decorators)
import './components-lit/bucket/bucket-card.js';
import './components-lit/explorer/file-list.js';
import './components-lit/shared/pagination-controls.js';
```

#### 3. `BucketList.js`
Ahora incluye dos implementaciones:

- **`renderBucketsWithLit()`** - Usa `<bucket-card>` con eventos
- **`renderBucketsVanilla()`** - Código original (58% más código)

#### 4. `Explorer.js`
Ahora incluye dos implementaciones:

- **`renderExplorerWithLit()`** - Usa `<file-list>` con **PAGINACIÓN** (100 items/página)
- **`renderExplorerVanilla()`** - Código original SIN paginación

### Ventajas de Este Enfoque

✅ **Zero Breaking Changes** - La app funciona igual en producción
✅ **Progressive Enhancement** - Lit solo se carga en desarrollo
✅ **Easy Testing** - Prueba ambos modos lado a lado
✅ **Gradual Migration** - Puedes migrar componente por componente
✅ **Production Ready** - Vanilla JS sigue siendo el fallback

## 🐛 Notas de TypeScript

Los errores de LSP sobre decorators son **esperados** hasta que se compile con Vite. Los decorators de Lit (`@property`, `@state`) usan TypeScript experimental y funcionan correctamente en runtime.

Para desarrollo, ejecuta:
```bash
npm run dev:frontend
```

Vite compilará TypeScript correctamente y los errores desaparecerán.

## 📚 Referencias

- [Lit Documentation](https://lit.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## 🚀 Testing the Integration

### Option 1: Vite Dev Server (Lit Components + Pagination)
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend with Vite
npm run dev:frontend

# Open: http://localhost:3001
```

**What you'll see:**
- ✨ Lit Web Components (`<bucket-card>`, `<file-list>`)
- 📄 **Pagination** in file lists (100 items per page)
- ⚡ Hot Module Replacement (HMR)
- 🎨 TypeScript errors in browser console (if any)

### Option 2: Express Server (Vanilla JS Fallback)
```bash
npm run dev

# Open: http://localhost:3000
```

**What you'll see:**
- 📦 Original Vanilla JS components
- ❌ No pagination (all items shown)
- ✅ Proven stable code

### Verify Lit Components are Working

Open browser console and check:
```javascript
customElements.get('bucket-card')  // Should return class definition
customElements.get('file-list')    // Should return class definition
```

If these return `undefined`, Lit components aren't loaded.

---

**Última actualización:** 2026-03-06  
**Estado:** ✅ **INTEGRATED** - 3/10 componentes creados, 2/2 integrados en app
