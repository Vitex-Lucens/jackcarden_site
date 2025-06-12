import Head from 'next/head';

/**
 * Reusable component for consistent site metadata
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.ogImage - Open Graph image URL (optional)
 */
export default function SiteHead({ 
  title, 
  description = "Official website of artist Jack Carden",
  ogImage = "/images/og-image.jpg" 
}) {
  const fullTitle = title ? `${title} | Jack Carden` : "Jack Carden | Artist";
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      
      {/* Open Graph / Social */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Responsive */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
