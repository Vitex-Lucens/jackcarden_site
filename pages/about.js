import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '../styles/About.module.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SiteHead from '../components/SiteHead';
import SafeImage from '../components/SafeImage';
import { getImagePath } from '../utils/api';

export default function About() {
  const [aboutData, setAboutData] = useState({
    // Default to a placeholder image with proper path handling
    artistImage: getImagePath('/images/placeholder.jpg'),
    bio: [],
    exhibitions: [],
    contact: {
      email: '',
      message: ''
    }
  });
  
  // Track if the artist image is available
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Load about data from JSON file
    try {
      const data = require('../data/about.json');
      setAboutData(data);
    } catch (error) {
      console.error('Error loading about data:', error);
    }
  }, []);

  return (
    <div className={styles.container}>
      <SiteHead 
        title="About"
        description="Learn about contemporary artist Jack Carden, his background, artistic approach, and exhibition history."
      />

      <Navigation />

      <main className={styles.main}>
        <div className={styles.aboutContainer}>
          {/* Image section - will be repositioned via CSS on mobile */}
          <div className={styles.imageSection}>
            <div className={styles.artistImage}>
              <SafeImage 
                src={aboutData.artistImage} 
                alt="Jack Carden" 
                className={styles.actualImage}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  width: '100%',
                  height: '100%'
                }}
                onLoad={() => console.log('Artist image loaded successfully')}
                fallbackComponent={
                  <div className={styles.imagePlaceholder}>Artist Photo</div>
                }
                priority={true}
              />
            </div>
          </div>
          
          {/* Text section */}
          <div className={styles.textSection}>
            <h1>ABOUT JACK CARDEN</h1>
            
            <div className={styles.bio}>
              {aboutData.bio && aboutData.bio.map((paragraph, index) => (
                <p key={`bio-${index}`}>{paragraph}</p>
              ))}
            </div>
            
            <div className={styles.exhibitions}>
              <h2>SELECTED EXHIBITIONS</h2>
              <ul>
                {aboutData.exhibitions && aboutData.exhibitions.map((exhibition, index) => (
                  <li key={`exhibition-${index}`}>
                    <span className={styles.year}>{exhibition.year}</span>
                    <span className={styles.details}>{exhibition.details}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={styles.contact}>
              <h2>CONTACT</h2>
              <p>{aboutData.contact && aboutData.contact.message} <Link href="/">acquisition inquiry form</Link> or contact the studio directly:</p>
              <p>{aboutData.contact && aboutData.contact.email}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
