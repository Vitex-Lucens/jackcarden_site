import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">JACK CARDEN</Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navLink} ${router.pathname === '/' ? styles.active : ''}`}>
          HOME
        </Link>
        <Link href="/gallery" className={`${styles.navLink} ${router.pathname === '/gallery' ? styles.active : ''}`}>
          GALLERY
        </Link>
        <Link href="/about" className={`${styles.navLink} ${router.pathname === '/about' ? styles.active : ''}`}>
          ABOUT
        </Link>
      </nav>
    </header>
  );
}
