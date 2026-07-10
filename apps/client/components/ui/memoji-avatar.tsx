'use client';
import { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemojiAvatarProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

export function MemojiAvatar({ name, size = 64, className, alt }: MemojiAvatarProps) {
  const [error, setError] = useState(false);
  const seed = encodeURIComponent(name?.trim().toLowerCase() || 'user');
  const src = `https://tapback.co/api/avatar/${seed}.webp`;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted shrink-0 transition-transform duration-200 ease-out',
        className
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title={alt || name}
    >
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <User size={Math.max(size / 3, 12)} />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          unoptimized
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
