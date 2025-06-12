import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // In a production environment, you should validate that the user is authenticated
    const aboutData = req.body;
    
    // Validate the data structure
    if (!aboutData || typeof aboutData !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data format' 
      });
    }

    // Ensure the data folder exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the updated about data to the file
    const filePath = path.join(dataDir, 'about.json');
    fs.writeFileSync(filePath, JSON.stringify(aboutData, null, 2), 'utf8');

    return res.status(200).json({ 
      success: true, 
      message: 'About data saved successfully' 
    });
  } catch (error) {
    console.error('Error saving about data:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Error saving about data: ${error.message}` 
    });
  }
}
