import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">JACK CARDEN</Link>
      </div>
      
      {/* Hamburger icon for mobile */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
        <Link href="/" 
          className={`${styles.navLink} ${router.pathname === '/' ? styles.active : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          HOME
        </Link>
        <Link href="/gallery" 
          className={`${styles.navLink} ${router.pathname === '/gallery' ? styles.active : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          GALLERY
        </Link>
        <Link href="/about" 
          className={`${styles.navLink} ${router.pathname === '/about' ? styles.active : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          ABOUT
        </Link>
      </nav>
      
      {/* Overlay for mobile navigation */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)}></div>}
    </header>
  );
}
