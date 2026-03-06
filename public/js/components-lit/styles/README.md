# Shared Styles - Atlas Bucket Manager

Este archivo contiene estilos reutilizables para todos los componentes Lit del proyecto.

## Uso

### Importar estilos individuales

```typescript
import { inputStyles, buttonPrimaryStyles, labelStyles } from '../styles/shared-styles';

@customElement('my-component')
export class MyComponent extends LitElement {
  static styles = [
    inputStyles,
    buttonPrimaryStyles,
    labelStyles,
    css`
      /* Tus estilos específicos aquí */
    `
  ];
}
```

### Importar todos los estilos base

```typescript
import { baseStyles } from '../styles/shared-styles';

@customElement('my-component')
export class MyComponent extends LitElement {
  static styles = [
    ...baseStyles,
    css`
      /* Tus estilos específicos aquí */
    `
  ];
}
```

## Estilos Disponibles

### Formularios

- **`inputStyles`** - Campos de texto, password, etc.
- **`labelStyles`** - Labels con estilo uppercase y tracking
- **`buttonPrimaryStyles`** - Botón primario (rose/pink)
- **`buttonSecondaryStyles`** - Botón secundario (outline)
- **`buttonIconStyles`** - Botones de iconos pequeños

### Alertas

- **`errorBoxStyles`** - Caja de error (roja)
- **`successBoxStyles`** - Caja de éxito (verde)

### Contenedores

- **`cardStyles`** - Tarjetas con borde y sombra
- **`modalStyles`** - Overlay y contenido de modales

### Utilidades

- **`spacingStyles`** - Clases de espaciado (.space-y-*, .gap-*)
- **`textStyles`** - Clases de texto (.text-center, .text-sm, etc.)
- **`flexStyles`** - Clases de flexbox (.flex, .items-center, etc.)

## Ejemplo Completo

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { 
  inputStyles, 
  labelStyles, 
  buttonPrimaryStyles,
  errorBoxStyles 
} from '../styles/shared-styles';

@customElement('my-form')
export class MyForm extends LitElement {
  @state() private email = '';
  @state() private error = '';

  static styles = [
    inputStyles,
    labelStyles,
    buttonPrimaryStyles,
    errorBoxStyles,
    css`
      :host {
        display: block;
        max-width: 400px;
        margin: 0 auto;
      }
    `
  ];

  render() {
    return html`
      <form @submit="${this.handleSubmit}">
        <div>
          <label>Email</label>
          <input 
            type="email" 
            .value="${this.email}"
            @input="${(e: any) => this.email = e.target.value}"
          >
        </div>

        ${this.error ? html`
          <div class="error-box">
            <span>${this.error}</span>
          </div>
        ` : ''}

        <button type="submit">Submit</button>
      </form>
    `;
  }
}
```

## Ventajas

✅ **Consistencia visual** - Todos los componentes usan los mismos estilos  
✅ **DRY** - No repetir código CSS  
✅ **Mantenibilidad** - Cambiar un estilo afecta todos los componentes  
✅ **Pequeño bundle** - Lit combina y optimiza los estilos  
✅ **Tipado** - TypeScript verifica las importaciones  

## Personalización

Si necesitas modificar un estilo compartido para un componente específico, simplemente sobrescríbelo:

```typescript
static styles = [
  inputStyles,
  css`
    /* Sobrescribir para este componente */
    input {
      border-radius: 0.5rem; /* Más pequeño que el default (1rem) */
    }
  `
];
```

## Soporte de Temas

Todos los estilos soportan **dark mode** usando `:host-context(html.dark)`:

```css
/* Light mode */
input {
  background: #f8fafc;
  color: #1e293b;
}

/* Dark mode */
:host-context(html.dark) input {
  background: #1e293b;
  color: white;
}
```

El tema se cambia agregando/quitando la clase `dark` del elemento `<html>`.
