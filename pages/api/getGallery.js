import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the gallery JSON file
    const filePath = path.join(process.cwd(), 'data', 'gallery.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // Parse the JSON data
    const galleryData = JSON.parse(fileContents);
    
    // Return the data
    return res.status(200).json(galleryData);
  } catch (error) {
    console.error('Error reading gallery data:', error);
    return res.status(500).json({ 
      error: 'Error reading gallery data', 
      details: error.message 
    });
  }
}
