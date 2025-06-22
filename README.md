# Jack Carden's Artist Portfolio Website

A minimalist, elegant website for artist Jack Carden featuring:

- Clean, typography-focused design
- Art gallery with easy content management
- Multi-step acquisition inquiry form 
- Mailing list integration with SendinBlue/Brevo

## Features

- **Gallery Management**: Simple JSON-based content management using data/gallery.json
- **Acquisition Form**: GDPR-compliant multi-step questionnaire for art inquiries
- **Mailing List**: Full integration with SendinBlue/Brevo API for contact management
- **Admin Interface**: Password-protected area for the artist to update content
- **Responsive Design**: Fully responsive layout optimized for all device sizes, including mobile-optimized navigation
- **SEO Ready**: Optimized metadata and structured content
- **Hybrid Deployment**: Compatible with both Next.js development and traditional cPanel hosting
- **SafeImage Component**: Cross-environment image path resolution for consistent display

## Technology Stack

- **Frontend**: Next.js with React
- **Backend**: PHP API endpoints for production (cPanel compatibility)
- **Styling**: CSS Modules with responsive design
- **Data Storage**: JSON files for content, PHP for API handling
- **Deployment**: Static export to GreenGeeks cPanel hosting

## Deployment Setup

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  output: 'export',  // Creates static export for cPanel hosting
  basePath: process.env.NODE_ENV === 'production' ? '/jackcarden' : '',
  // other config options...
}
```

### PHP API Integration

The site uses PHP alternatives for all Next.js API routes when deployed to cPanel:
- `getGallery.php` - Fetches gallery data
- `saveGallery.php` - Saves gallery updates
- `uploadImage.php` - Handles image uploads
- `checkUploads.php` - Checks for uploaded files
- `saveAbout.php` - Updates about page content
- `submitInquiry.php` - Processes contact form submissions

## Mobile Optimizations

### Header & Navigation
- Mobile hamburger menu for screens below 768px width
- Removed header bottom border on mobile for a cleaner look
- Adjusted spacing above navigation items in mobile menu

### Footer
- Increased spacing above footer on mobile (2rem margin)
- Moved Instagram link above copyright text on mobile
- Made social links more prominent with centered alignment

### About Page
- Moved artist image to bottom of page on mobile using CSS flexbox order
- Applied consistent Helvetica font styling to headings
- Implemented vertical exhibition layout on mobile
- Centered headings and contact information for better balance

### Home Page
- Adjusted vertical spacing between elements
- Improved button styling with larger touch targets
- Consistent typography with Helvetica and proper letter spacing

### Questionnaire Modal
- Fixed button text colors on mobile (black text on white backgrounds)
- Removed decorative ticks from checkboxes for minimalist design
- Improved form control spacing on mobile
- Customizable price tier options with four tiers:
  - $50K — $250K+
  - $25K — $50K
  - $5K — $25K
  - Up to $5K
- Enhanced multi-step form flow with GDPR-compliant consent checkbox
- Two-step submission process with clear "NEXT" and "COMPLETE" buttons
- Optional comments field for additional information
- Custom post-submission message: "Due to high demand, each applicant is considered carefully. We'll be in touch if we feel it's the right fit."

## Technology Stack

- **Framework**: Next.js & React for server-side rendering and SEO benefits
- **Styling**: CSS Modules for component-scoped styling
- **Forms**: Formik with Yup validation for a smooth form experience
- **Content**: JSON for simple, file-based data storage
- **API**: SendinBlue/Brevo for email marketing and contact management
- **Authentication**: Simple password protection for admin area

## Project Structure

```
/
├── components/       # Reusable React components
├── data/            # JSON data files for content
├── pages/           # Next.js pages and API routes
│   ├── api/         # API endpoints
│   └── admin/       # Admin interface
├── public/          # Static assets
├── styles/          # CSS modules
└── utils/           # Utility functions
```

## Environment Setup

Create a `.env.local` file in the root directory with:

```
SENDINBLUE_API_KEY=your_api_key_here
SENDINBLUE_LIST_ID=your_list_id_here
ADMIN_PASSWORD=your_admin_password_here
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Build & Deployment

The project includes specialized build scripts for deploying to GreenGeeks cPanel hosting:

```bash
# Standard development build
npm run build

# Production build with PHP API files and proper directory structure
npm run build-prod

# Production build + create deployment ZIP package
npm run build-prod-zip
```

The `build-prod-zip` command creates a complete deployment package with:
- Static Next.js export
- PHP API alternatives for all endpoints
- Proper subdirectory configuration (/jackcarden)
- .htaccess for Apache routing
- Placeholder images in all required locations
- JSON data files

To deploy:
1. Run `npm run build-prod-zip` to generate `jackcarden_site.zip`
2. Upload the ZIP file to GreenGeeks cPanel
3. Extract to the webroot (or appropriate subdirectory)

## Content Management

The gallery is managed through the admin interface at `/admin`. Log in with the password set in your environment variables to add, edit, or remove artwork.
