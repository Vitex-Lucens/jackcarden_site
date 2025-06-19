import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} Jack Carden. All rights reserved.
        </div>
        <div className={styles.social}>
          <a href="https://instagram.com/jackcarden.art" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            @jackcarden.art
          </a>
        </div>
      </div>
    </footer>
  );
}
