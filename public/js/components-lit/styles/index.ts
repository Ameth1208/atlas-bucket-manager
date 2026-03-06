/**
 * Tailwind CSS Classes - Main Export
 * 
 * Modular approach: import specific styles from individual files
 * or use this main export for convenience.
 * 
 * Usage:
 *   import { TW } from './styles';           // All styles
 *   import { baseStyles as B } from './styles/base.tw';  // Just base
 *   import { loginStyles as L } from './styles/login.tw'; // Just login
 */

import { baseStyles } from './base.tw';
import { layoutStyles } from './layout.tw';
import { modalStyles } from './modal.tw';
import { loginStyles } from './login.tw';
import { bucketCardStyles } from './bucket.tw';
import { fileListStyles } from './file-list.tw';

// Combine all styles into a single TW object
export const TW = {
  ...baseStyles,
  ...layoutStyles,
  ...modalStyles,
  login: loginStyles,
  bucketCard: bucketCardStyles,
  fileList: fileListStyles,
};

// Alias for backward compatibility
export const TAILWIND_CLASSES = TW;

// Export individual modules for tree-shaking
export { baseStyles } from './base.tw';
export { layoutStyles } from './layout.tw';
export { modalStyles } from './modal.tw';
export { loginStyles } from './login.tw';
export { bucketCardStyles } from './bucket.tw';
export { fileListStyles } from './file-list.tw';
