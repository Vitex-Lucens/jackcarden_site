/**
 * API utility functions that work in both development and production
 * In development, calls go to Next.js API routes
 * In production (static export), calls go to PHP endpoints
 */

// Ensure API_CONFIG exists even if the external script fails to load
if (typeof window !== 'undefined' && !window.API_CONFIG) {
  console.warn('API_CONFIG not found, creating default configuration');
  window.API_CONFIG = {
    apiBase: '/api',
    isStaticDeploy: true,
    createdAt: new Date().toISOString(),
    isDefaultConfig: true
  };
}

// Determine if we're in static export mode
const isStaticExport = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && 
   window.location.hostname !== '127.0.0.1');

// Get the base path for URLs (always empty now that we're on root domain)
export const getBasePath = () => {
  // No subdirectory needed anymore as site is at root domain
  return '';
};

// Get the correct path for images accounting for basePath
export const getImagePath = (imagePath) => {
  // If the path is an absolute URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Now that we're on root domain, just ensure the path starts with /
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

// Get the base URL for API calls
export const getApiBase = () => {
  // Add debugging information for production troubleshooting
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const apiBase = '/api';
    
    // Log important information for debugging
    console.log('API Base Debug:', {
      hostname,
      protocol,
      apiBase,
      apiConfig: window.API_CONFIG,
      fullApiPath: `${protocol}//${hostname}${apiBase}`
    });
  }
  
  // Simplified API base path resolution for production
  // Now that we're on the root domain, we always use /api
  return '/api';
};

import axios from 'axios';

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
export const saveGallery = async (gallery, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(`${getApiBase()}/saveGallery.php`, gallery, { headers });
    return response.data;
  } catch (error) {
    // Return a wrapped error
    throw new Error(`Failed to save gallery: ${error.message}`);
  }
}

/**
 * Upload an image to the server
 */
export const uploadImage = async (file, onProgress, token) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const headers = { 'Content-Type': 'multipart/form-data' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${getApiBase()}/uploadImage.php`,
      formData,
      {
        headers,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
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
export const saveAbout = async (aboutData, token) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(
      `${getApiBase()}/saveAbout.php`, 
      aboutData, 
      { headers }
    );
    
    return response.data;
  } catch (error) {
    // Return a wrapped error
    throw new Error(`Failed to save about page: ${error.message}`);
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
