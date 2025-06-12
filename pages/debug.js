import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Debug() {
  const [galleryData, setGalleryData] = useState(null);
  const [uploadsList, setUploadsList] = useState([]);
  const [imageStatus, setImageStatus] = useState({});

  useEffect(() => {
    // Load the gallery data
    try {
      const gallery = require('../data/gallery.json');
      setGalleryData(gallery);
    } catch (error) {
      console.error('Error loading gallery data:', error);
    }

    // Check uploads directory (in a real app, you'd use an API call)
    fetch('/api/checkUploads')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setUploadsList(data.files);
        }
      })
      .catch(err => console.error('Error checking uploads:', err));
  }, []);

  const checkImage = (src) => {
    const img = new Image();
    img.onload = () => {
      setImageStatus(prev => ({ ...prev, [src]: 'loaded' }));
    };
    img.onerror = () => {
      setImageStatus(prev => ({ ...prev, [src]: 'error' }));
    };
    img.src = src;
  };

  useEffect(() => {
    if (galleryData && galleryData.works) {
      galleryData.works.forEach(work => {
        if (work.imageUrl) {
          checkImage(work.imageUrl);
        }
      });
    }
  }, [galleryData]);

  return (
    <div style={{ padding: '2rem' }}>
      <Head>
        <title>Image Debug - Jack Carden</title>
      </Head>

      <h1>Image Debug Tool</h1>
      
      <h2>Test Images</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h3>Placeholder Image</h3>
          <img 
            src="/placeholder.jpg" 
            alt="Placeholder" 
            style={{ width: 200, height: 'auto', border: '1px solid #ccc' }}
            onLoad={() => console.log('Placeholder loaded')}
            onError={() => console.log('Placeholder failed')}
          />
        </div>
        <div>
          <h3>Test Upload</h3>
          <img 
            src="/uploads/test.jpg" 
            alt="Test Upload" 
            style={{ width: 200, height: 'auto', border: '1px solid #ccc' }}
            onLoad={() => console.log('Test upload loaded')}
            onError={() => console.log('Test upload failed')}
          />
        </div>
      </div>

      <h2>Gallery Images</h2>
      {galleryData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {galleryData.works.map(work => (
            <div key={work.id} style={{ border: '1px solid #eee', padding: '1rem' }}>
              <h3>{work.title}</h3>
              <div style={{ position: 'relative', aspectRatio: '3/4' }}>
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    backgroundColor: '#f8f8f8',
                    border: imageStatus[work.imageUrl] === 'error' ? '2px solid red' : 
                           imageStatus[work.imageUrl] === 'loaded' ? '2px solid green' : 
                           '2px solid #ccc'
                  }}
                />
              </div>
              <p>Path: {work.imageUrl}</p>
              <p>Status: {imageStatus[work.imageUrl] || 'checking...'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading gallery data...</p>
      )}

      <h2>Uploads Directory</h2>
      {uploadsList.length > 0 ? (
        <ul>
          {uploadsList.map(file => (
            <li key={file}>
              {file} - 
              <a href={`/uploads/${file}`} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No uploads found or checking uploads...</p>
      )}
    </div>
  );
}
