import { css } from "lit";

/**
 * Shared styles for Atlas Bucket Manager components
 * These styles maintain consistency across all Lit components
 */

// Input fields (text, password, etc.)
export const inputStyles = css`
  input {
    width: 100%;
    padding: 1rem;
    background: #f8fafc;
    border: none;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    outline: none;
    transition: all 0.2s;
    color: #1e293b;
  }

  :host-context(html.dark) input {
    background: #1e293b;
    color: white;
  }

  input:focus {
    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2);
  }

  input::placeholder {
    color: #94a3b8;
  }
`;

// Labels
export const labelStyles = css`
  label {
    display: block;
    font-size: 0.625rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    margin-left: 0.25rem;
  }
`;

// Primary button (rose/pink theme)
export const buttonPrimaryStyles = css`
  button[type="submit"],
  .btn-primary {
    width: 100%;
    background: #e11d48;
    color: white;
    font-weight: 700;
    padding: 1rem;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.2);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  button[type="submit"]:hover,
  .btn-primary:hover {
    background: #be123c;
  }

  button[type="submit"]:active,
  .btn-primary:active {
    transform: scale(0.98);
  }

  button[type="submit"]:disabled,
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Secondary button (ghost/outline)
export const buttonSecondaryStyles = css`
  .btn-secondary {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 0.1rem;
    color: #64748b;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  :host-context(html.dark) .btn-secondary {
    border-color: #334155;
    color: #94a3b8;
  }

  .btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  :host-context(html.dark) .btn-secondary:hover {
    background: #1e293b;
    border-color: #475569;
  }
`;

// Icon button (small, transparent)
export const buttonIconStyles = css`
  .btn-icon {
    padding: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
    border-radius: 0.5rem;
  }

  .btn-icon:hover {
    color: #f43f5e;
    background: #fef2f2;
  }

  :host-context(html.dark) .btn-icon:hover {
    background: rgba(244, 63, 94, 0.1);
  }
`;

// Error/Alert box
export const errorBoxStyles = css`
  .error-box,
  .alert-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fee2e2;
    border-radius: 0.75rem;
    color: #dc2626;
    font-size: 0.75rem;
    font-weight: 700;
  }

  :host-context(html.dark) .error-box,
  :host-context(html.dark) .alert-error {
    background: rgba(220, 38, 38, 0.125);
    border-color: rgba(220, 38, 38, 0.3);
    color: #fca5a5;
  }
`;

// Success box
export const successBoxStyles = css`
  .success-box,
  .alert-success {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f0fdf4;
    border: 1px solid #dcfce7;
    border-radius: 0.75rem;
    color: #16a34a;
    font-size: 0.75rem;
    font-weight: 700;
  }

  :host-context(html.dark) .success-box,
  :host-context(html.dark) .alert-success {
    background: rgba(22, 163, 74, 0.125);
    border-color: rgba(22, 163, 74, 0.3);
    color: #86efac;
  }
`;

// Card/Container
export const cardStyles = css`
  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  :host-context(html.dark) .card {
    background: #0f172a;
    border-color: #1e293b;
  }
`;

// Modal overlay
export const modalStyles = css`
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    max-width: 32rem;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  :host-context(html.dark) .modal-content {
    background: #0f172a;
    border: 1px solid #1e293b;
  }
`;

// Utility: spacing
export const spacingStyles = css`
  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }
  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  .space-y-5 > * + * {
    margin-top: 1.25rem;
  }
  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }

  .gap-2 {
    gap: 0.5rem;
  }
  .gap-3 {
    gap: 0.75rem;
  }
  .gap-4 {
    gap: 1rem;
  }
`;

// Utility: text
export const textStyles = css`
  .text-center {
    text-align: center;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-xs {
    font-size: 0.75rem;
  }
  .text-lg {
    font-size: 1.125rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .text-2xl {
    font-size: 1.5rem;
  }

  .font-bold {
    font-weight: 700;
  }
  .font-semibold {
    font-weight: 600;
  }
  .font-medium {
    font-weight: 500;
  }

  .text-muted {
    color: #64748b;
  }
  :host-context(html.dark) .text-muted {
    color: #94a3b8;
  }
`;

// Utility: flexbox
export const flexStyles = css`
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-between {
    justify-content: space-between;
  }
`;

// Complete bundle (import all at once)
export const baseStyles = [
  inputStyles,
  labelStyles,
  buttonPrimaryStyles,
  buttonSecondaryStyles,
  buttonIconStyles,
  errorBoxStyles,
  successBoxStyles,
  cardStyles,
  modalStyles,
  spacingStyles,
  textStyles,
  flexStyles,
];
