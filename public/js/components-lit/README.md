# Lit Components - Atlas Bucket Manager

Componentes Web modernos con Lit + TypeScript para una mejor mantenibilidad y escalabilidad.

## 🎯 Objetivos

1. **Modularidad** - Componentes reutilizables e independientes
2. **Type Safety** - TypeScript para detectar errores en desarrollo
3. **Reactividad** - State management automático
4. **Paginación** - Soporte nativo para listas grandes (100 items por página)
5. **Fácil Actualización** - Cada componente es independiente

## 📦 Componentes Disponibles

### `<bucket-card>`
Tarjeta individual de bucket con acciones y toggle de privacidad.

**Props:**
- `bucket` (Object) - Datos del bucket
- `lang` (String) - Idioma para formateo de fechas

**Events:**
- `explore` - Al hacer click en explorar
- `delete` - Al hacer click en eliminar
- `refresh-stats` - Al solicitar actualizar estadísticas
- `policy-change` - Al cambiar público/privado

**Uso:**
```html
<bucket-card
  .bucket=${bucketData}
  lang="es"
  @explore=${handleExplore}
  @delete=${handleDelete}
  @policy-change=${handlePolicyChange}>
</bucket-card>
```

### `<pagination-controls>`
Controles de paginación con información de items.

**Props:**
- `total` (Number) - Total de items
- `page` (Number) - Página actual
- `pageSize` (Number) - Items por página (default: 100)

**Events:**
- `page-change` - Al cambiar de página

**Uso:**
```html
<pagination-controls
  .total=${1000}
  .page=${currentPage}
  .pageSize=${100}
  @page-change=${handlePageChange}>
</pagination-controls>
```

## 🚀 Desarrollo

### Ejecutar Vite Dev Server
```bash
npm run dev:frontend
```

Esto abrirá el servidor en `http://localhost:3001` con:
- Hot Module Replacement (HMR)
- Proxy a backend en puerto 3000
- TypeScript compilation

### Desarrollo Completo (Backend + Frontend)
```bash
npm run dev:all
```

## 🏗️ Build para Producción

```bash
npm run build:frontend
```

Esto generará archivos optimizados en `dist-frontend/`:
- Minificación
- Tree-shaking
- Code splitting
- TypeScript compilado

## 📁 Estructura

```
components-lit/
├── bucket/
│   └── bucket-card.ts        # Componente de tarjeta de bucket
├── explorer/
│   └── (próximamente)
├── shared/
│   └── pagination-controls.ts # Controles de paginación
├── ui/
│   └── (próximamente)
└── index.ts                   # Export central
```

## 🔧 Cómo Migrar un Componente

### 1. Crear el archivo .ts
```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('mi-componente')
export class MiComponente extends LitElement {
  @property({ type: String }) myProp = '';

  static styles = css`
    /* Tus estilos CSS */
  `;

  render() {
    return html`
      <!-- Tu HTML -->
    `;
  }
}
```

### 2. Exportar en index.ts
```typescript
export { MiComponente } from './folder/mi-componente.js';
```

### 3. Usar en manager.html
```html
<script type="module">
  import '/js/components-lit/index.js';
</script>

<mi-componente myProp="valor"></mi-componente>
```

## 🎨 CSS Variables

Los componentes usan CSS variables para theming:

```css
--bg-card: white
--bg-secondary: #f1f5f9
--border-color: #e2e8f0
--text-primary: #1e293b
--text-muted: #64748b
--color-rose-500: #f43f5e
--color-indigo-500: #6366f1
--color-green-500: #22c55e
--color-amber-500: #f59e0b
```

## 📚 Recursos

- [Lit Docs](https://lit.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## ✅ Próximos Componentes

- [ ] `<file-list>` - Lista de archivos con paginación
- [ ] `<file-item>` - Item individual de archivo
- [ ] `<search-bar>` - Barra de búsqueda global
- [ ] `<modal-base>` - Modal reutilizable
- [ ] `<theme-toggle>` - Toggle de tema
- [ ] `<language-selector>` - Selector de idioma
