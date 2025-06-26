import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  // Define API config directly in the app
  const apiConfig = `
    // API configuration for static deployment
    window.API_CONFIG = {
      // Base URL for API requests - now at root domain
      apiBase: '/api',
      
      // Environment flag
      isStaticDeploy: true,
      
      // Debug info
      loadTime: new Date().toISOString()
    };
    console.log('API Config loaded directly:', window.API_CONFIG);
  `;
  
  return (
    <>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: apiConfig }} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
