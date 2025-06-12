import Link from 'next/link';
import styles from '../styles/404.module.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SiteHead from '../components/SiteHead';

export default function Custom404() {
  return (
    <div className={styles.container}>
      <SiteHead 
        title="Page Not Found"
        description="The page you are looking for does not exist."
      />

      <Navigation />
      
      <main className={styles.main}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.description}>
          The page you are looking for does not exist.
        </p>
        <Link href="/" className={styles.button}>
          Return Home
        </Link>
      </main>
      
      <Footer />
    </div>
  );
}
