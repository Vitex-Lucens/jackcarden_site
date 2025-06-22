import { useState, useEffect } from 'react';
import { getImagePath } from '../utils/api';

/**
 * SafeImage component with advanced multi-level fallback system
 * Handles image paths correctly across environments and tries multiple
 * placeholder paths when the primary image fails to load
 */
export default function SafeImage({ src, alt, className, onLoad, style, width, height, fallbackComponent }) {
  // Track the current image we're trying to display
  const [currentSrc, setCurrentSrc] = useState('');
  // Track if the image has successfully loaded
  const [isLoaded, setIsLoaded] = useState(false);
  // Track the fallback attempt index
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  
  // Define all possible fallback image paths
  const fallbackUrls = [
    // Try paths with /jackcarden/ prefix first (production)
    '/jackcarden/images/placeholder.svg',
    '/jackcarden/images/placeholder.jpg',
    '/jackcarden/placeholder.svg',
    '/jackcarden/placeholder.jpg',
    // Then try paths without the prefix (dev and alternative locations)
    '/images/placeholder.svg',
    '/images/placeholder.jpg',
    '/placeholder.svg',
    '/placeholder.jpg',
    // Last resort - an inline SVG data URL
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhIj5JbWFnZTwvdGV4dD48L3N2Zz4='
  ];
  
  // Process the source on component mount and when src changes
  useEffect(() => {
    if (!src) {
      // If no source provided, start with first fallback
      setFallbackIndex(0);
      setCurrentSrc(fallbackUrls[0]);
    } else if (src.startsWith('http') || src.startsWith('data:')) {
      // If it's already an absolute URL or data URL, use as is
      setFallbackIndex(-1); // -1 indicates we're using the primary source
      setCurrentSrc(src);
    } else {
      // Otherwise apply the correct base path using getImagePath
      setFallbackIndex(-1);
      setCurrentSrc(getImagePath(src));
    }
  }, [src]);

  // Handle successful image load
  const handleImageLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Handle image load error with cascade fallback
  const handleImageError = () => {
    const nextIndex = fallbackIndex + 1;
    
    // If we have more fallbacks to try
    if (nextIndex < fallbackUrls.length) {
      // Try next fallback
      console.log(`Image failed to load: ${currentSrc}\nTrying fallback #${nextIndex + 1}`);
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackUrls[nextIndex]);
    } else {
      // We've exhausted all fallbacks - show inline SVG as last resort
      console.error(`All image fallbacks failed for: ${src}`);
    }
  };
  
  // If custom fallback component provided and we've exhausted all fallbacks, use custom component
  if (fallbackIndex >= fallbackUrls.length - 1 && fallbackComponent) {
    return fallbackComponent;
  }
  
  // Return the image with proper handlers
  return (
    <img
      src={currentSrc}
      alt={alt || 'Image'}
      className={className}
      style={{
        ...(style || {}),
        // Hide image until loaded to prevent layout shifts
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s'
      }}
      width={width}
      height={height}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}
