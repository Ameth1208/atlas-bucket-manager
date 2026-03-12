# Lit Web Components - Developer Guide

## 🎯 Overview

Atlas Bucket Manager uses **Lit v3.2.1** for building modern, reusable Web Components with TypeScript. This document serves as a reference guide for creating new components following the established patterns.

---

## ✅ Current Architecture

### Tech Stack
- **Lit v3.2.1** - Web Components framework
- **Vite v7.3.1** - Build tool with HMR
- **TypeScript v5.9.3** - Type safety
- **Tailwind CSS v3.4.17** - Utility-first CSS (compiled, ~15KB)

### Build Configuration
- ✅ `vite.config.ts` - Build and dev server
- ✅ `tsconfig.frontend.json` - TypeScript for frontend
- ✅ `tailwind.config.js` - Tailwind purge and production config
- ✅ Scripts: `build:frontend`, `build:css`, `build:css:watch`

---

## 📦 Component Structure

```
public/js/components-lit/
├── forms/
│   └── login-form.ts                # Login component
├── bucket/
│   └── bucket-card.ts               # Bucket card with stats/actions
├── explorer/
│   ├── explorer-header.ts           # Navigation header
│   ├── file-list.ts                 # File browser with pagination
│   └── pagination-controls.ts       # Reusable pagination
├── shared/
│   └── toggle-switch.ts             # Reusable toggle
├── modals/
│   ├── preview-modal.ts             # File preview
│   ├── share-modal.ts               # Share links
│   ├── folder-modal.ts              # Create folder
│   └── delete-modal.ts              # Delete confirmation
├── styles/
│   ├── index.ts                     # Main export
│   ├── tailwind-classes.ts          # TW namespace
│   ├── base.tw.ts                   # Forms, buttons
│   ├── layout.tw.ts                 # Cards, spacing
│   ├── modal.tw.ts                  # All modals
│   ├── bucket.tw.ts                 # Bucket cards
│   ├── explorer.tw.ts               # Explorer header
│   ├── file-list.tw.ts              # File list
│   ├── pagination.tw.ts             # Pagination
│   └── login.tw.ts                  # Login form
├── index.ts                         # Main entry point
└── main.ts                          # Vite entry (registers all)
```

**Total: 11 Lit Components + 10 Tailwind Style Modules**

---

## 🏗️ How to Create a New Component

### 1. Component File Structure

```typescript
// public/js/components-lit/[category]/my-component.ts
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

@customElement('my-component')
export class MyComponent extends LitElement {
  // Public properties (reactive)
  @property({ type: String }) title = '';
  @property({ type: Boolean }) disabled = false;
  
  // Internal state (reactive)
  @state() private _loading = false;

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  // Event handlers (private methods with underscore)
  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent('my-event', {
        detail: { value: 'data' },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Render method
  render() {
    return html`
      <div class="${TW.myComponent.container}">
        <h1 class="${TW.myComponent.title}">${this.title}</h1>
        <button 
          class="${TW.myComponent.button}"
          ?disabled="${this.disabled}"
          @click="${this._handleClick}">
          Click Me
        </button>
      </div>
    `;
  }
}

// TypeScript declaration
declare global {
  interface HTMLElementTagNameMap {
    'my-component': MyComponent;
  }
}
```

### 2. Create Tailwind Style Module

```typescript
// public/js/components-lit/styles/my-component.tw.ts
export const myComponentStyles = {
  container: "p-4 bg-white dark:bg-dark-900 rounded-lg",
  title: "text-xl font-bold text-slate-900 dark:text-white",
  button: "px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 disabled:opacity-50",
};
```

### 3. Add to Tailwind Classes Namespace

```typescript
// public/js/components-lit/styles/tailwind-classes.ts
import { myComponentStyles } from './my-component.tw';

export const TW = {
  // ... existing styles
  myComponent: myComponentStyles,
};
```

### 4. Register Component

```typescript
// public/js/main.ts
import './components-lit/[category]/my-component.js';
```

### 5. Build

```bash
# Build frontend (TypeScript → JavaScript)
npm run build:frontend

# Build CSS (Tailwind compilation)
npm run build:css

# Or watch mode for development
npm run build:css:watch
```

---

## 🎨 Styling Guidelines

### Why No Shadow DOM?

We **disable Shadow DOM** with `createRenderRoot()` to use Tailwind CSS directly:

```typescript
createRenderRoot(): HTMLElement | DocumentFragment {
  return this as unknown as HTMLElement;
}
```

**Benefits:**
- ✅ Direct Tailwind class usage
- ✅ No style duplication
- ✅ Smaller bundle size
- ✅ Dark mode works automatically

### Tailwind Class Organization

**Modular approach** (10 style files):

- `base.tw.ts` - Forms, buttons, inputs, labels
- `layout.tw.ts` - Cards, containers, spacing
- `modal.tw.ts` - All modal components (shared styles)
- `bucket.tw.ts` - Bucket card specific
- `explorer.tw.ts` - Explorer header
- `file-list.tw.ts` - File list and items
- `pagination.tw.ts` - Pagination controls
- `login.tw.ts` - Login form

### Naming Convention

```typescript
export const componentNameStyles = {
  container: "classes-here",
  title: "classes-here",
  button: "classes-here",
  buttonPrimary: "additional-classes", // Modifiers
};
```

---

## 🔄 Component Patterns

### Pattern 1: Event Emission

```typescript
private _handleAction() {
  this.dispatchEvent(
    new CustomEvent('action-name', {
      detail: { data: 'value' },
      bubbles: true,     // Event bubbles up DOM
      composed: true,    // Crosses shadow boundaries
    })
  );
}
```

### Pattern 2: Reactive Properties

```typescript
@property({ type: String }) name = '';           // Public prop
@property({ type: Boolean }) open = false;       // Public prop
@state() private _internalState = 0;             // Private state
```

### Pattern 3: Conditional Rendering

```typescript
render() {
  return html`
    ${this.loading ? html`
      <div>Loading...</div>
    ` : html`
      <div>Content</div>
    `}
  `;
}
```

### Pattern 4: List Rendering

```typescript
render() {
  return html`
    <ul>
      ${this.items.map(item => html`
        <li key="${item.id}">${item.name}</li>
      `)}
    </ul>
  `;
}
```

### Pattern 5: Public API Methods

```typescript
// Public method (no underscore)
public clearSelection() {
  this._selectedItems = [];
  this.requestUpdate();
}

// Private method (with underscore)
private _handleClick() {
  // ...
}
```

---

## 🧪 Integration with Vanilla JS

### Usage in HTML

```html
<!-- manager.html -->
<script type="module" src="/js/main.ts"></script>

<!-- Use component -->
<my-component 
  title="Hello"
  .data="${complexObject}"
  @my-event="${handleEvent}">
</my-component>
```

### Usage in Vanilla JS Orchestrators

```javascript
// public/js/components/MyOrchestrator.js
export function renderWithLit(data) {
  const container = document.getElementById('container');
  
  data.forEach(item => {
    const component = document.createElement('my-component');
    
    // Set properties
    component.title = item.title;
    component.disabled = item.disabled;
    
    // Listen to events
    component.addEventListener('my-event', (e) => {
      console.log('Event data:', e.detail);
    });
    
    container.appendChild(component);
  });
}
```

---

## 📊 Component Examples

### Example 1: Simple Button Component

```typescript
@customElement('app-button')
export class AppButton extends LitElement {
  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';
  @property({ type: Boolean }) loading = false;
  
  createRenderRoot() { return this; }
  
  render() {
    return html`
      <button 
        class="${this._getButtonClasses()}"
        ?disabled="${this.loading}"
        @click="${this._handleClick}">
        ${this.loading ? 'Loading...' : html`<slot></slot>`}
      </button>
    `;
  }
  
  private _getButtonClasses() {
    const base = "px-4 py-2 rounded font-medium transition-colors";
    const variants = {
      primary: "bg-rose-500 hover:bg-rose-600 text-white",
      secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",
    };
    return `${base} ${variants[this.variant]}`;
  }
  
  private _handleClick() {
    this.dispatchEvent(new CustomEvent('click'));
  }
}
```

### Example 2: Modal Component

```typescript
@customElement('app-modal')
export class AppModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) title = '';
  
  createRenderRoot() { return this; }
  
  render() {
    if (!this.open) return html``;
    
    return html`
      <div class="${TW.modal.backdrop}" @click="${this._handleClose}">
        <div class="${TW.modal.content}" @click="${(e: Event) => e.stopPropagation()}">
          <h2 class="${TW.modal.title}">${this.title}</h2>
          <div class="${TW.modal.body}">
            <slot></slot>
          </div>
          <div class="${TW.modal.footer}">
            <button @click="${this._handleClose}">Close</button>
          </div>
        </div>
      </div>
    `;
  }
  
  private _handleClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close'));
  }
}
```

---

## 🚀 Development Workflow

### Commands

```bash
# Start backend
npm run dev

# Watch Tailwind CSS (in separate terminal)
npm run build:css:watch

# Build for production
npm run build
```

### Hot Module Replacement

Vite provides **instant HMR** for Lit components in development mode:

1. Save `.ts` file
2. Browser updates automatically
3. Component state preserved

---

## ✅ Best Practices

### DO ✅
- ✅ Use `@customElement` decorator for registration
- ✅ Disable Shadow DOM with `createRenderRoot()`
- ✅ Use Tailwind classes from `TW` namespace
- ✅ Prefix private methods with underscore (`_handleClick`)
- ✅ Use `@property` for reactive public props
- ✅ Use `@state` for reactive private state
- ✅ Emit custom events with `bubbles: true, composed: true`
- ✅ Add TypeScript declarations (`HTMLElementTagNameMap`)

### DON'T ❌
- ❌ Don't use inline styles (use Tailwind classes)
- ❌ Don't use Shadow DOM (breaks Tailwind)
- ❌ Don't forget to build CSS after style changes
- ❌ Don't use `any` type in TypeScript
- ❌ Don't import CSS files (use Tailwind classes only)

---

## 📚 References

- [Lit Documentation](https://lit.dev/)
- [Lit Decorators](https://lit.dev/docs/components/decorators/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📝 Component Checklist

When creating a new component:

- [ ] Create `.ts` file in appropriate category folder
- [ ] Add `@customElement` decorator with kebab-case name
- [ ] Disable Shadow DOM with `createRenderRoot()`
- [ ] Create style module in `styles/` folder
- [ ] Add styles to `TW` namespace in `tailwind-classes.ts`
- [ ] Use reactive `@property` and `@state` decorators
- [ ] Emit events with `bubbles: true, composed: true`
- [ ] Add TypeScript declaration for `HTMLElementTagNameMap`
- [ ] Register in `main.ts`
- [ ] Build frontend and CSS
- [ ] Test in browser

---

**Version 0.0.8** - Lit Web Components Architecture  
**Last Updated**: 2026-03-09  
**Status**: ✅ **PRODUCTION READY** - 11 components deployed
