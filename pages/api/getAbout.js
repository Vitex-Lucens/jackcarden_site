import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the about JSON file
    const filePath = path.join(process.cwd(), 'data', 'about.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // Parse the JSON data
    const aboutData = JSON.parse(fileContents);
    
    // Return the data
    return res.status(200).json(aboutData);
  } catch (error) {
    console.error('Error reading about data:', error);
    return res.status(500).json({ 
      error: 'Error reading about data', 
      details: error.message 
    });
  }
}
