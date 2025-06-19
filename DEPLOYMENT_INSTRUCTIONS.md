# Jack Carden Artist Portfolio - Deployment Instructions

This document provides step-by-step instructions for deploying the Jack Carden artist portfolio site to GreenGeeks cPanel hosting.

## Pre-Deployment Steps

1. **Build the Static Export**
   ```bash
   npm install
   npm run build
   ```

2. **Prepare Files for Upload**
   - Copy PHP API files to the `out/api/` directory
   - Copy `.htaccess` file to the `out/` directory 
   - Ensure data files are copied to `out/data/` directory
   - Create a ZIP archive of the `out/` directory for easier uploading:
     ```bash
     zip -r jackcarden_site.zip out/
     ```

## GreenGeeks cPanel Deployment

1. **Log in to your GreenGeeks cPanel account**

2. **Upload the Files**
   - **Option 1: Using File Manager**
     - Open the File Manager in cPanel
     - Navigate to your website's public directory (usually `public_html`)
     - Upload the `jackcarden_site.zip` file
     - Extract the ZIP file contents directly into the public directory
     - Move all files from the `out` directory to the root of your public directory
     
   - **Option 2: Using FTP/SFTP**
     - Use an FTP client like FileZilla
     - Upload all files from the `out` directory to your website's root directory

3. **Set File Permissions**
   - Make sure these directories have proper write permissions:
     - `data` directory: 755 for directory, 644 for files
     - `uploads` directory: 755 for directory, 644 for files 
     - `images` directory: 755 for directory, 644 for files

4. **Test Your Website**
   - Visit your domain to ensure the site loads correctly
   - Test the gallery to make sure images display properly
   - Try the contact form to verify it works

## Important Configuration Notes

### Admin Area Security
To add password protection to the admin area:

1. Use cPanel's "Password Protect Directories" tool
2. Select the `/admin` directory
3. Create a username/password

### SendinBlue/Brevo Integration
If using SendinBlue/Brevo for contact forms:

1. Create an API key in your SendinBlue/Brevo account
2. Set it as an environment variable in cPanel (PHP Configuration)
   OR
3. Edit `api/submitInquiry.php` to include your API key directly

### PHP Configuration
- Ensure PHP version is set to 7.4 or higher in cPanel
- Check that file upload limits are sufficient (in php.ini)

## File Structure Overview

```
public_html/               # Root directory on server
├── _next/                 # Next.js static assets
├── api/                   # PHP API endpoints
│   ├── getGallery.php     # Fetches gallery data
│   ├── saveGallery.php    # Updates gallery data
│   ├── uploadImage.php    # Handles image uploads
│   ├── checkUploads.php   # Lists uploaded files
│   ├── saveAbout.php      # Updates about page content
│   └── submitInquiry.php  # Handles contact form
├── data/                  # Data storage
│   ├── gallery.json       # Gallery artwork data
│   └── about.json         # About page content
├── images/                # Artwork images
├── uploads/               # Temporary uploaded files
├── js/                    # JavaScript files
│   └── api-config.js      # API configuration
├── .htaccess              # Apache configuration
├── index.html             # Home page
└── other HTML pages...    # Other static pages
```

## Maintenance and Updates

To update the site in the future:

1. Make changes to your local Next.js project
2. Build a new static export: `npm run build`
3. Follow the deployment steps above, uploading only the changed files

## Troubleshooting

If you encounter issues with the PHP API endpoints:
- Check error logs in cPanel
- Verify file permissions
- Ensure PHP version is 7.4+
- Check that `.htaccess` file is properly uploaded

For any additional assistance, please contact support.
