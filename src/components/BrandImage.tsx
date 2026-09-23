import { useState } from 'react';
import type { ImageAsset } from '../types/content';

interface BrandImageProps {
  image: ImageAsset;
  className?: string;
  fallbackLabel?: string;
  eager?: boolean;
}

export function BrandImage({ image, className, fallbackLabel, eager }: BrandImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return fallbackLabel ? (
      <span className={`${className ?? ''} image-fallback`} role="img" aria-label={fallbackLabel}>
        {fallbackLabel.slice(0, 1)}
      </span>
    ) : null;
  }

  return (
    <img
      alt={image.alt}
      className={className}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      src={image.src}
    />
  );
}
