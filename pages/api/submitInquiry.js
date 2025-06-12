import { addContact } from '../../utils/sendinblue';

// This API endpoint handles form submissions to SendinBlue/Brevo
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.email || !data.firstName || !data.lastName) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, firstName, and lastName are required' 
      });
    }
    
    // Use our utility function to add the contact to SendinBlue
    // In development mode, we'll wrap this in try/catch and log instead of making the actual API call
    if (process.env.NODE_ENV === 'production' && process.env.SENDINBLUE_API_KEY) {
      try {
        await addContact(data);
      } catch (apiError) {
        console.error('SendinBlue API error:', apiError);
        // Continue anyway to provide a good user experience
        // In a real app, you might want to log this to a monitoring service
      }
    } else {
      // In development, just log the data
      console.log('Form submission data that would be sent to SendinBlue:', data);
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Thank you for your inquiry. We will be in touch soon.'
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({ 
      error: 'Failed to process form submission',
      message: 'There was a problem submitting your inquiry. Please try again later.'
    });
  }
}
