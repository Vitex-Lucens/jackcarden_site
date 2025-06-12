# Jack Carden's Artist Portfolio Website

A minimalist, elegant website for artist Jack Carden featuring:

- Clean, typography-focused design
- Art gallery with easy content management
- Multi-step acquisition inquiry form
- Mailing list integration with SendinBlue/Brevo

## Features

- **Gallery Management**: Simple JSON-based content management without complex CMS
- **Acquisition Form**: GDPR-compliant multi-step questionnaire for art inquiries
- **Mailing List**: Full integration with SendinBlue/Brevo API for contact management
- **Admin Interface**: Password-protected area for the artist to update content
- **Responsive Design**: Fully responsive layout optimized for all device sizes
- **SEO Ready**: Optimized metadata and structured content

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

## Deployment

This site can be deployed on any platform that supports Next.js, such as Vercel, Netlify, or a custom server.

## Content Management

The gallery is managed through the admin interface at `/admin`. Log in with the password set in your environment variables to add, edit, or remove artwork.
