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
- [x] Documentación básica

### Próximos Pasos 📋
- [ ] Componente `<search-bar>` con debounce
- [ ] Componente `<modal-base>` reutilizable
- [ ] Componente `<theme-toggle>`
- [ ] Componente `<language-selector>`
- [ ] Integrar componentes en `manager.html`
- [ ] Tests unitarios con Web Test Runner
- [ ] Actualizar AGENTS.md

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

---

**Última actualización:** 2026-03-06  
**Estado:** En desarrollo (3/10 componentes completados)
