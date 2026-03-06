/**
 * Tailwind CSS Classes - Re-export for backward compatibility
 * 
 * DEPRECATED: Import from './index.ts' instead
 * 
 * This file is kept for backward compatibility.
 * New code should import from specific modules:
 * 
 *   import { TW } from './styles/index.ts';           // All styles
 *   import { baseStyles as B } from './styles/base.tw.ts';  
 *   import { loginStyles as L } from './styles/login.tw.ts'; 
 *   import { bucketCardStyles } from './styles/bucket.tw.ts'; 
 *   import { modalStyles } from './styles/modal.tw.ts'; 
 */

export * from './index';

// Backward compatible default export
import { TW } from './index';
export { TW };
export const TAILWIND_CLASSES = TW;
