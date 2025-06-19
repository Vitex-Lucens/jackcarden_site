import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ApiConfig() {
  const router = useRouter();
  
  // In production, we know the base path is '/jackcarden'
  // In development, it's empty
  const isProduction = process.env.NODE_ENV === 'production';
  const basePath = isProduction ? '/jackcarden' : '';
  
  // Add script with debugging info
  return (
    <Head>
      <script src={`${basePath}/js/api-config.js`} />
      <script dangerouslySetInnerHTML={{ __html: `
        // Log API configuration info for debugging
        console.log('API Config environment:', '${process.env.NODE_ENV}');
        console.log('API Config using basePath:', '${basePath}');
      `}} />
    </Head>
  );
}
