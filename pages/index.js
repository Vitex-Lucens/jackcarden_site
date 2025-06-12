import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import AcquisitionModal from '../components/AcquisitionModal';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SiteHead from '../components/SiteHead';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.container}>
      <SiteHead 
        title="Artist"
        description="Official website of contemporary artist Jack Carden. Explore his work and inquire about acquisitions."
      />

      <Navigation />

      <main className={styles.main}>
        <h1 className={styles.title}>WEBSITE</h1>
        <p className={styles.subtitle}>*BY JACK CARDEN</p>

        <div className={styles.buttons}>
          <button 
            onClick={() => setShowModal(true)} 
            className={styles.button}
          >
            OBTAIN WORK
          </button>
          
          <Link href="/gallery" className={styles.button}>
            VIEW WORK
          </Link>
        </div>
      </main>

      <Footer />

      {showModal && (
        <AcquisitionModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
