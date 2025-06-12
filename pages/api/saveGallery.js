import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a production environment, you would implement proper authentication here
    // This is a simplified version for demonstration purposes
    
    const galleryData = req.body;
    
    // Validate that we have the required data
    if (!galleryData || !Array.isArray(galleryData.works)) {
      return res.status(400).json({ error: 'Invalid gallery data format' });
    }
    
    // Create the path to the gallery.json file
    const filePath = path.join(process.cwd(), 'data', 'gallery.json');
    
    // Write the updated gallery data to the file
    await fs.promises.writeFile(
      filePath,
      JSON.stringify({ works: galleryData.works }, null, 2),
      'utf8'
    );
    
    res.status(200).json({ success: true, message: 'Gallery data saved successfully' });
  } catch (error) {
    console.error('Error saving gallery data:', error);
    res.status(500).json({ error: 'Failed to save gallery data' });
  }
}
