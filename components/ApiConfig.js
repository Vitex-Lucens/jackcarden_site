import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ApiConfig() {
  const router = useRouter();
  
  // Now that we're on the root domain, basePath is always empty
  const basePath = '';
  
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
