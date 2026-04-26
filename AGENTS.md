# AGENTS.md - Atlas Bucket Manager

## Build Commands

```bash
# Development (must run css first)
npm run build:css && npm run dev

# Production build
npm run build && npm start

# CSS only (required before dev/prod)
npm run build:css

# Tests
npm test
```

## UI/Design Workflow

**REQUIRED**: Before ANY UI changes, design in Pencil first:

1. Open `designs/atlas-apple-design.pen` (Apple-style premium design)
2. Reuse components from library (00 - Components Library)
3. Implement from design with exact tokens

**Design System**: Apple Pro Apps aesthetic (apple.com + Final Cut style)
**Components**: Modular library in Pencil (buttons, cards, inputs, modals)
**Spec**: See `designs/APPLE-DESIGN-README.md` for tokens & guidelines

This ensures consistent Apple-quality product that users deserve.

## Architecture

- **Backend**: Express.js + TypeScript, Clean Architecture
- **Frontend**: Vanilla JS + Tailwind CSS
- **Entry**: `src/server.ts`

## Key Files

- `public/login.html` - Login screen (from Pencil design)
- `public/manager.html` - Dashboard (from Pencil design)
- `public/js/app.js` - Application logic
- `designs/atlas-apple-design.pen` - Pencil design source

## Design Tokens (Apple)

### Colors
- Primary: `#0071e3` (Apple Blue)
- Success: `#34c759` (Apple Green)
- Warning: `#ff9500` (Apple Orange)
- Error: `#ff3b30` (Apple Red)
- Text: `#1d1d1f` (Light), `#f5f5f7` (Dark)

### Radius
- Pill: `980px` (buttons)
- MD: `12px` (inputs)
- XL: `18px` (cards)
- 2XL: `24px` (modals)

### Components
- Buttons: Pill-style, 44px height
- Cards: 18px radius, hover scale 1.02
- Toggle: iOS-style switch (52x32px)
- Navbar: Glass morphism, 56px height

## Environment

Copy `.env.example` to `.env` before running.

## See Also

- `README.md` - Product overview
- `designs/APPLE-DESIGN-README.md` - Apple design spec
- `designs/atlas-apple-design.pen` - Pencil design file
