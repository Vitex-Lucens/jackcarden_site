/**
 * SendinBlue/Brevo API utilities
 * Handles contact creation, updating, and list management
 */

// Base URL for SendinBlue API
const API_URL = 'https://api.sendinblue.com/v3';

/**
 * Add a contact to SendinBlue including all form data as attributes
 * @param {Object} data - Contact data including email and all form attributes
 * @returns {Promise} - API response
 */
export async function addContact(data) {
  const { email, firstName, lastName, phone, ...otherAttributes } = data;
  
  // Format attributes to match SendinBlue's expected format
  const attributes = {
    FIRSTNAME: firstName,
    LASTNAME: lastName,
    PHONE: phone || ''
  };
  
  // Add other form data as attributes
  Object.keys(otherAttributes).forEach(key => {
    // Convert camelCase to SNAKE_CASE for SendinBlue
    const attributeName = key
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase();
    
    attributes[attributeName] = otherAttributes[key];
  });
  
  // Prepare the request payload
  const contactData = {
    email,
    attributes,
    listIds: [parseInt(process.env.SENDINBLUE_LIST_ID)], 
    updateEnabled: true // Update the contact if it already exists
  };

  try {
    const response = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.SENDINBLUE_API_KEY
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SendinBlue API Error: ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('SendinBlue API Error:', error);
    throw error;
  }
}

/**
 * Get all lists from SendinBlue
 * @returns {Promise} - API response with list data
 */
export async function getLists() {
  try {
    const response = await fetch(`${API_URL}/contacts/lists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.SENDINBLUE_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lists');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching lists:', error);
    throw error;
  }
}
