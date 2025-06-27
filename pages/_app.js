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
      isStaticDeploy: true
    };
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
