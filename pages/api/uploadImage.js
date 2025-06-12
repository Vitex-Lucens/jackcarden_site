import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('Upload API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const imagesDir = path.join(process.cwd(), 'public/images');
    
    console.log('Creating directories if needed...');
    
    try {
      await fs.access(uploadsDir);
    } catch (error) {
      console.log('Creating uploads directory');
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    
    try {
      await fs.access(imagesDir);
    } catch (error) {
      console.log('Creating images directory');
      await fs.mkdir(imagesDir, { recursive: true });
    }
    
    console.log('Parsing form data...');
    
    const options = {
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: false,
    };
    
    const form = new IncomingForm(options);
    
    // Custom promise wrapper for formidable
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error('Form parse error:', err);
            return reject(err);
          }
          resolve({ fields, files });
        });
      });
    };
    
    // Parse the form
    const { fields, files } = await parseForm();
    console.log('Form parsed, files:', files ? Object.keys(files) : 'none');
    
    // Check if we have an image file
    if (!files || !files.image) {
      console.error('No image file found in request');
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Handle the file - in newer formidable versions, this might be an array or object
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    console.log('File received:', file.originalFilename, file.mimetype, file.size, 'bytes');
    
    // Generate a unique filename for the gallery
    const fileExt = path.extname(file.originalFilename || '.jpg').toLowerCase();
    const timestamp = new Date().getTime();
    const uniqueId = timestamp.toString(36) + Math.random().toString(36).substring(2, 5);
    const fileName = `work-${uniqueId}${fileExt}`;
    const destPath = path.join(imagesDir, fileName);
    
    console.log('Reading temp file from:', file.filepath);
    console.log('Destination:', destPath);
    
    try {
      // Read the uploaded file
      const data = await fs.readFile(file.filepath);
      
      // Write to destination directory
      await fs.writeFile(destPath, data);
      console.log('File written successfully');
      
      // Clean up temp file
      try {
        await fs.unlink(file.filepath);
        console.log('Temp file cleaned up');
      } catch (unlinkError) {
        console.warn('Could not delete temp file:', unlinkError.message);
      }
      
      // Return success with relative path
      const relativePath = `/images/${fileName}`;
      console.log('Success! Returning path:', relativePath);
      
      return res.status(200).json({
        success: true,
        filePath: relativePath
      });
    } catch (fileError) {
      console.error('File operation error:', fileError);
      return res.status(500).json({ error: `File operation failed: ${fileError.message}` });
    }
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ 
      error: `Failed to upload file: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
