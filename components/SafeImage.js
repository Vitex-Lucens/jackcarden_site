import { useState } from 'react';
import { getImagePath } from '../utils/api';

/**
 * SafeImage component to handle image paths correctly across environments
 * Automatically applies correct base paths in production/development
 * and provides fallback to placeholder with correct path
 */
export default function SafeImage({ src, alt, className, onLoad, style, width, height }) {
  const [error, setError] = useState(false);
  // Use SVG placeholder which will work in all environments
  const placeholderUrl = getImagePath('/images/placeholder.svg');
  
  // Only process paths that aren't already absolute URLs
  const processedSrc = error ? placeholderUrl : 
    (src && src.startsWith('http')) ? src : getImagePath(src);

  return (
    <img
      src={processedSrc}
      alt={alt || 'Image'}
      className={className}
      style={style}
      width={width}
      height={height}
      onLoad={(e) => {
        if (onLoad) onLoad(e);
      }}
      onError={(e) => {
        console.error('Image failed to load:', src);
        if (!error) {
          console.log('Falling back to placeholder image');
          setError(true);
        }
      }}
    />
  );
}
