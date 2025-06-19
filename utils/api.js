/**
 * API utility functions that work in both development and production
 * In development, calls go to Next.js API routes
 * In production (static export), calls go to PHP endpoints
 */

// Ensure API_CONFIG exists even if the external script fails to load
if (typeof window !== 'undefined' && !window.API_CONFIG) {
  console.warn('API_CONFIG not found, creating default configuration');
  window.API_CONFIG = {
    apiBase: '/jackcarden/api',
    isStaticDeploy: true,
    createdAt: new Date().toISOString(),
    isDefaultConfig: true
  };
}

// Determine if we're in static export mode
const isStaticExport = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && 
   window.location.hostname !== '127.0.0.1');

// Get the base path for URLs (empty in development, /jackcarden in production)
export const getBasePath = () => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Check hostname to determine if we need a subpath
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/jackcarden';
    }
  }
  return '';
};

// Get the correct path for images accounting for basePath
export const getImagePath = (imagePath) => {
  // If the path already includes the base path or is an absolute URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('/jackcarden/')) {
    return imagePath;
  }
  
  // Otherwise, prepend the base path
  return `${getBasePath()}${imagePath}`;
};

// Get the base URL for API calls
export const getApiBase = () => {
  // Enhanced logging to help debug API path resolution
  const debug = () => {
    if (typeof window !== 'undefined') {
      console.group('API Path Resolution Debug');
      console.log('Window location:', window.location.href);
      console.log('Hostname:', window.location.hostname);
      console.log('Protocol:', window.location.protocol);
      console.log('API_CONFIG available:', !!window.API_CONFIG);
      if (window.API_CONFIG) {
        console.log('API_CONFIG:', JSON.stringify(window.API_CONFIG));
      }
      console.groupEnd();
    }
  };
  
  try {
    // Always log debug info
    debug();
    
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // In production environment (not localhost)
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        console.log('PRODUCTION MODE: Using base path: /jackcarden/api');
        return '/jackcarden/api';
      } else {
        // In development
        console.log('DEVELOPMENT MODE: Using base path: /api');
        return '/api';
      }
    }
  } catch (err) {
    console.error('Error in getApiBase:', err);
  }
  
  // Ultimate fallback
  console.log('FALLBACK: Using default API base path: /api');
  return '/api';
};

/**
 * Get gallery data from the server
 */
export async function fetchGallery() {
  try {
    const response = await fetch(`${getApiBase()}/getGallery`);
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
}

/**
 * Save gallery data to the server
 */
export async function saveGallery(galleryData) {
  try {
    const response = await fetch(`${getApiBase()}/saveGallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(galleryData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save gallery (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving gallery:', error);
    throw error;
  }
}

/**
 * Upload an image to the server
 */
export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${getApiBase()}/uploadImage`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload image (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Check uploads on the server
 */
export async function checkUploads() {
  try {
    const response = await fetch(`${getApiBase()}/checkUploads`);
    
    if (!response.ok) {
      throw new Error(`Failed to check uploads (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking uploads:', error);
    throw error;
  }
}

/**
 * Save about page data to the server
 */
export async function saveAbout(aboutData) {
  try {
    const response = await fetch(`${getApiBase()}/saveAbout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aboutData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save about data (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving about data:', error);
    throw error;
  }
}

/**
 * Submit an inquiry form
 */
export async function submitInquiry(formData) {
  try {
    const response = await fetch(`${getApiBase()}/submitInquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit inquiry (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    throw error;
  }
}
