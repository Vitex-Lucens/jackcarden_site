# Jack Carden's Artist Portfolio Website

A minimalist, elegant website for artist Jack Carden featuring:

- Clean, typography-focused design
- Art gallery with easy content management
- Admin interface for updating site content
- Multi-step acquisition inquiry form 
- Mailing list integration with SendinBlue/Brevo

## Features
- **Gallery Management**: Drag-and-drop reordering with JSON-based storage
- **About Page Management**: Rich text editor for artist information and exhibitions
- **Secure Admin Area**: Server-side bcrypt authentication with token-based sessions
- **Responsive Design**: Mobile-optimized layout
- **Acquisition Form**: GDPR-compliant multi-step questionnaire for art inquiries
- **Image Handling**: Secure upload system with SafeImage component for cross-environment path resolution
- **Contact System**: Integrated form with email notifications
- **Mailing List**: Integration with SendinBlue/Brevo for subscriber management
- **SEO Optimization**: Title tags, meta descriptions, Open Graph and Twitter card integration
- **Hybrid Deployment**: Compatible with Next.js development and traditional cPanel hosting
- **Path Resolution**: Automatic handling of URLs across development and production environments

## Technology Stack
- **Frontend**: Next.js with React 
- **Backend**: PHP API endpoints for GreenGeeks cPanel compatibility
- **Styling**: CSS Modules with responsive design
- **Authentication**: Server-side bcrypt password protection with token-based auth
- **Data Storage**: JSON files for content, PHP for API handling
- **Deployment**: Static export to root domain (jackcarden.art)


### PHP API Endpoints
When deployed on GreenGeeks cPanel hosting, the site uses these PHP endpoints:
- `verifyAdmin.php` - Handles admin authentication
- `saveGallery.php` - Saves gallery updates
- `uploadImage.php` - Handles image uploads
- `getGallery.php` - Fetches gallery data
- `saveAbout.php` - Updates about page content
- `submitInquiry.php` - Processes contact form submissions
- `checkUploads.php` - Checks for uploaded files

### Admin Authentication
The admin interface uses server-side password authentication with bcrypt hashing and token-based sessions:
1. Admin enters password on the admin page
2. Password is verified against a secure bcrypt hash 
3. On success, a secure random token is provided with 24-hour expiry
4. This token is required for all admin API requests

## Project Structure
```
/
├── components/      # Reusable React components
├── data/           # JSON data files for content
├── pages/          # Next.js pages and API routes
│   ├── api/        # API endpoints (development only)
│   └── admin/      # Admin interface
├── php_api/        # PHP API files for production
├── public/         # Static assets
├── styles/         # CSS modules
└── utils/          # Utility functions
```

## Dependencies
- **Next.js & React**: Frontend framework
- **CSS Modules**: Component styling
- **Formik & Yup**: Form handling and validation
- **Axios**: HTTP client for API calls
- **PHP**: Server-side API implementation
- **SendinBlue/Brevo API**: Email marketing

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment

```bash
# Generate deployment package
npm run build-prod-zip
```

This creates `jackcarden_site.zip` containing:
- Static Next.js export with optimized assets
- All required PHP API endpoints
- Root domain configuration for jackcarden.art
- .htaccess for proper routing on Apache

### Deployment Steps:
1. Upload `jackcarden_site.zip` to GreenGeeks cPanel
2. Extract to the webroot directory
3. Ensure PHP files have proper permissions (644 or 755)


### Gallery Management
Use the admin interface at `/admin` to:
- Add, edit and remove artwork entries
- Reorder gallery items using up/down controls
- Upload and manage artwork images
- Set artwork details and availability status

### Changing Admin Password
1. Upload the site including the `generate_password_hash.php` utility
2. Access the tool at `https://jackcarden.art/api/generate_password_hash.php`
3. Enter your desired new password and generate a hash
4. Copy the generated bcrypt hash
5. Update the hash in `php_api/verifyAdmin.php`
6. Rebuild and redeploy the site
7. **Important:** Delete the password generator file from your server
