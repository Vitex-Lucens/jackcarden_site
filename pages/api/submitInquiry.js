import { addContact } from '../../utils/sendinblue';

// This API endpoint handles form submissions to SendinBlue/Brevo with spam protection
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Check for honeypot field - if filled, silently accept but don't process
    if (data.phoneExtension) {
      console.log('Honeypot field triggered - likely spam submission');
      // Return success response to avoid alerting bots
      return res.status(200).json({ success: true, message: 'Thank you for your inquiry.' });
    }
    
    // Verify reCAPTCHA token if present and in production
    if (process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY && data.recaptchaToken) {
      try {
        const recaptchaVerification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY,
            response: data.recaptchaToken
          })
        });
        
        const recaptchaResult = await recaptchaVerification.json();
        
        // Score threshold - 0.5 is moderate and recommended by Google
        if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
          console.log('reCAPTCHA verification failed:', recaptchaResult);
          return res.status(400).json({ error: 'Spam protection triggered. Please try again.' });
        }
      } catch (recaptchaError) {
        console.error('Error verifying reCAPTCHA:', recaptchaError);
        // Continue processing in case of reCAPTCHA verification error
        // This is optional; you could also reject the submission here
      }
    }
    
    // Remove spam protection fields before sending to marketing service
    const { recaptchaToken, phoneExtension, ...cleanData } = data;
    
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
