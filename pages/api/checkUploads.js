import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Path to uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Check if directory exists
    try {
      await fs.access(uploadsDir);
    } catch (error) {
      return res.status(200).json({ 
        exists: false, 
        files: [],
        error: 'Uploads directory does not exist'
      });
    }
    
    // Read directory
    const files = await fs.readdir(uploadsDir);
    
    // Return list of files
    return res.status(200).json({
      exists: true,
      files
    });
  } catch (error) {
    console.error('Error checking uploads:', error);
    return res.status(500).json({ error: 'Error checking uploads directory' });
  }
}
