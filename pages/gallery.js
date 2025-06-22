import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Gallery.module.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SiteHead from '../components/SiteHead';
import { getImagePath, getApiBase } from '../utils/api';
import SafeImage from '../components/SafeImage';

export default function Gallery() {
  const [selectedWork, setSelectedWork] = useState(null);
  const [artworks, setArtworks] = useState([]);
  
  // Load gallery data on each page load to ensure fresh data
  useEffect(() => {
    // Use a dynamic import to always get the latest version
    // This prevents Next.js from caching the import
    const apiUrl = `${getApiBase()}/getGallery`;
    console.log('Fetching gallery data from:', apiUrl);
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.works) {
          console.log('Gallery data loaded:', data.works.length, 'works');
          setArtworks(data.works);
        }
      })
      .catch(err => {
        console.error('Error loading gallery data:', err);
      });
  }, []);

  return (
    <div className={styles.container}>
      <SiteHead 
        title="Gallery"
        description="Explore Jack Carden's artwork collection - paintings, sculptures, and mixed media pieces."
      />

      <Navigation />

      <main className={styles.main}>
        <div className={styles.galleryHeader}>
          <h1>GALLERY</h1>
        </div>

        <div className={styles.galleryGrid}>
          {artworks.map((work, index) => (
            <div 
              key={index} 
              className={styles.galleryItem}
              onClick={() => setSelectedWork(work)}
            >
              <div className={styles.imageContainer}>
                <SafeImage 
                  src={work.imageUrl} 
                  alt={work.title} 
                  className={styles.galleryImage}
                  onLoad={(e) => e.target.classList.add(styles.imageLoaded)}
                />
              </div>
              <h3 className={styles.workTitle}>{work.title}</h3>
              <p className={styles.workDetails}>{work.year} · {work.medium}</p>
            </div>
          ))}
        </div>
      </main>

      {selectedWork && (
        <div className={styles.modalOverlay} onClick={() => setSelectedWork(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedWork(null)}>×</button>
            <div className={styles.modalImageContainer}>
              <SafeImage 
                src={selectedWork.imageUrl} 
                alt={selectedWork.title} 
                className={styles.modalImage} 
              />
            </div>
            <div className={styles.modalInfo}>
              <h2>{selectedWork.title}</h2>
              <p className={styles.modalYear}>{selectedWork.year}</p>
              <p className={styles.modalMedium}>{selectedWork.medium}</p>
              <p className={styles.modalDimensions}>{selectedWork.dimensions}</p>
              <p className={styles.modalDescription}>{selectedWork.description}</p>
              {selectedWork.status === 'available' && (
                <Link href="/" className={styles.inquireButton}>
                  INQUIRE
                </Link>
              )}
              {selectedWork.status === 'sold' && (
                <div className={styles.soldBadge}>SOLD</div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
