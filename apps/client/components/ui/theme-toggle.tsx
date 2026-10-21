'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-8 rounded-full" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Cambiar tema"
      className={`text-muted-foreground hover:text-foreground relative overflow-hidden size-8 rounded-full ${className ?? ''}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ y: -16, opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: 16, opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            mass: 0.7,
          }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon size={15} strokeWidth={2} className="text-amber-300" />
          ) : (
            <Sun size={15} strokeWidth={2} className="text-amber-500" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
