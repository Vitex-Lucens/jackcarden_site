import { useState } from 'react';
import { getImagePath } from '../utils/api';

/**
 * SafeImage component to handle image paths correctly across environments
 * Automatically applies correct base paths in production/development
 * and provides graceful fallback for missing images
 */
export default function SafeImage({ src, alt, className, onLoad, style, width, height, fallbackComponent }) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Local development helper for debugging image paths
  const isDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // Use SVG placeholder which will work in all environments
  // Ensure placeholder path always includes /images/ prefix
  const placeholderUrl = getImagePath('/images/placeholder.svg');
  // Backup placeholders in case the primary one fails
  const fallbackUrls = [
    getImagePath('/images/placeholder.svg'),
    getImagePath('/images/placeholder.jpg'),
    getImagePath('/placeholder.svg'),
    getImagePath('/placeholder.jpg')
  ];
  
  // Process the image source URL
  let processedSrc;
  
  if (error) {
    // If there was an error loading the image, use placeholder
    processedSrc = placeholderUrl;
    // If we're using fallbacks because of errors, log it
    if (isDev) {
      console.log(`SafeImage: Using fallback for ${src}`);
    }
  } else if (!src) {
    // If no source provided, use placeholder
    processedSrc = placeholderUrl;
  } else if (src.startsWith('http')) {
    // If it's already an absolute URL, use as is
    processedSrc = src;
  } else {
    // Otherwise apply the correct base path
    processedSrc = getImagePath(src);
  }
  
  if (isDev) {
    if (!isLoaded && !error) {
      console.log(`SafeImage: Loading ${src} → ${processedSrc}`);
    }
    
    // Add more debug info about the environment
    console.log(`SafeImage: Environment - ${typeof window !== 'undefined' ? window.location.hostname : 'server'}, ${processedSrc.includes('/jackcarden/') ? 'Production path' : 'Development path'}`);
  }

  // If custom fallback component provided and we have an error, use that
  if (error && fallbackComponent) {
    return fallbackComponent;
  }

  return (
    <img
      src={processedSrc}
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
      onLoad={(e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
      }}
      onError={(e) => {
        // Only log the error once
        if (!error) {
          console.error(`Image failed to load: ${src}`);
          console.log(`Falling back to ${fallbackComponent ? 'custom component' : 'placeholder'}`);
          setError(true);
        }
      }}
    />
  );
}
