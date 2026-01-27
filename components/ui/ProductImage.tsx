'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Simple blur placeholder
const shimmer = `data:image/svg+xml;base64,${Buffer.from(
  `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="#f1f5f9"/>
    <text x="50%" y="45%" text-anchor="middle" fill="#94a3b8" font-size="48" font-weight="bold" font-family="system-ui">XAG</text>
    <text x="50%" y="55%" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="system-ui">Spare Part</text>
  </svg>`
).toString('base64')}`;

export function ProductImage({ src, alt, className = '', fill = false, width, height, priority = false }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Show placeholder if no src or if image failed to load
  if (!src || hasError) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}>
        <span className="text-2xl font-bold text-slate-400 tracking-wider">XAG</span>
        <span className="text-xs text-slate-400 mt-1">Spare Part</span>
      </div>
    );
  }

  if (fill) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-2xl font-bold text-slate-400 tracking-wider">XAG</span>
            <span className="text-xs text-slate-400 mt-1">Loading...</span>
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          className={`object-contain p-4 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
          priority={priority}
          placeholder="blur"
          blurDataURL={shimmer}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200" style={{ width, height }}>
          <span className="text-xl font-bold text-slate-400 tracking-wider">XAG</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={`object-contain ${isLoading ? 'hidden' : ''} ${className}`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        priority={priority}
        placeholder="blur"
        blurDataURL={shimmer}
      />
    </>
  );
}
