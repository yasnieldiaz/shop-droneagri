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
}

export function ProductImage({ src, alt, className = '', fill = false, width, height }: ProductImageProps) {
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
          className={`object-contain p-4 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity ${className}`}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
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
        className={`object-contain ${isLoading ? 'hidden' : ''} ${className}`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}
