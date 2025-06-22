import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styles from '../../styles/Admin.module.css';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getApiBase, getImagePath } from '../../utils/api';
import SafeImage from '../../components/SafeImage';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('gallery');
  
  // About page data state
  const [aboutData, setAboutData] = useState({
    artistImage: getImagePath('/images/placeholder.jpg'), // Always include /images/ prefix
    bio: [],
    exhibitions: [],
    contact: {
      email: '',
      message: ''
    }
  });
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    year: '',
    medium: '',
    dimensions: '',
    category: '',
    description: '',
    imageUrl: '',
    status: 'available',
    price: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  // Loading data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Load gallery data
      try {
        // In production, we'd fetch this from an API
        const gallery = require('../../data/gallery.json');
        setArtworks(gallery.works);
      } catch (error) {
        setMessage('Error loading gallery data');
      }
      
      // Load about page data
      try {
        const about = require('../../data/about.json');
        setAboutData(about);
      } catch (error) {
        console.error('Error loading about data:', error);
      }
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, this would be a secure authentication
    if (password === 'admin123') { // Default password for demo purposes
      setIsLoggedIn(true);
      setMessage('');
    } else {
      setMessage('Incorrect password');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // State for tracking uploaded image URL before it's added to an artwork
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Handle image file upload
  const handleImageUpload = async (e) => {
    console.log('Starting image upload...');
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File to upload:', file.name, file.type, file.size);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image file size must be less than 5MB');
      return;
    }
    
    setUploadError('');
    
    try {
      setUploadingImage(true);
      setUploadProgress(0);
      setMessage('Uploading image...');
      
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Sending upload request...');
    const response = await axios.post(`${getApiBase()}/uploadImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      
      console.log('Upload API response:', response);
      
      if (response.data && response.data.success) {
        console.log('Upload success, response:', response.data);
        
        // Get raw path from response (e.g., "/images/work-abc123.jpg")
        const rawFilePath = response.data.filePath.startsWith('/') ? 
          response.data.filePath : `/${response.data.filePath}`;
        
        // Store both the raw path and the full path with basePath
        // The raw path is what we'll save to the artwork object
        console.log('Raw path from server:', rawFilePath);
        
        // This is just for preview purposes
        const displayPath = getImagePath(rawFilePath);
        console.log('Display path with basePath:', displayPath);
        
        // Important: Store the RAW path without basePath in the uploadedImageUrl
        // This ensures it will work with getImagePath() later when needed
        setUploadedImageUrl(rawFilePath);
        console.log('Set uploadedImageUrl to raw path:', rawFilePath);
        setMessage('Image uploaded successfully! Click "Apply To Artwork" to use this image for the artwork.');
        
        // Debug - try to preload the image to ensure it's accessible
        const img = new Image();
        img.onload = () => console.log('Image preloaded successfully:', displayPath);
        img.onerror = (err) => console.error('Failed to preload image:', displayPath, err);
        // Use the display path with proper base path for preview
        img.src = displayPath;
      } else {
        throw new Error('Upload response did not indicate success');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(`Upload failed: ${error.response?.data?.error || error.message}`);
      setMessage(`Error uploading image: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Apply uploaded image to the current artwork form
  const applyUploadedImage = () => {
    if (uploadedImageUrl) {
      setFormData(prev => ({
        ...prev,
        imageUrl: uploadedImageUrl
      }));
      setMessage('Image applied to artwork! Remember to click "Add Artwork" and then "Save Gallery".');
    }
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      setMessage('Title and category are required');
      return;
    }
    
    // If an image was uploaded but not saved to the form data yet, show a warning
    if (uploadedImageUrl && (!formData.imageUrl || formData.imageUrl !== uploadedImageUrl)) {
      if (confirm('You have an uploaded image that hasn\'t been applied to this artwork. Would you like to use this image?')) {
        setFormData(prev => ({
          ...prev,
          imageUrl: uploadedImageUrl
        }));
        // Continue with the save after setting the image URL
      }
    }

    if (editMode) {
      // Update existing artwork
      const updatedArtworks = artworks.map(artwork => 
        artwork.id === formData.id ? formData : artwork
      );
      setArtworks(updatedArtworks);
      setMessage('Artwork updated successfully');
    } else {
      // Add new artwork with a generated ID
      const newArtwork = {
        ...formData,
        id: `work-${String(artworks.length + 1).padStart(3, '0')}`
      };
      setArtworks([...artworks, newArtwork]);
      setMessage('New artwork added successfully');
    }

    // In a real app, we would save to a file or database here
    // For demo purposes, we're just updating state

    // Reset form
    setFormData({
      id: '',
      title: '',
      year: '',
      medium: '',
      dimensions: '',
      category: '',
      description: '',
      imageUrl: '',
      status: 'available',
      price: ''
    });
    setEditMode(false);
  };

  const handleEdit = (artwork) => {
    setFormData(artwork);
    setEditMode(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this artwork?')) {
      const updatedArtworks = artworks.filter(artwork => artwork.id !== id);
      setArtworks(updatedArtworks);
      setMessage('Artwork deleted successfully');
      
      // In a real app, we would update the file or database here
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
  };

  // Handle updating a bio paragraph
  const handleBioChange = (index, value) => {
    const updatedBio = [...aboutData.bio];
    updatedBio[index] = value;
    setAboutData({
      ...aboutData,
      bio: updatedBio
    });
  };
  
  // Handle adding a new bio paragraph
  const handleAddBioParagraph = () => {
    setAboutData({
      ...aboutData,
      bio: [...aboutData.bio, '']
    });
  };
  
  // Handle removing a bio paragraph
  const handleRemoveBioParagraph = (index) => {
    const updatedBio = [...aboutData.bio];
    updatedBio.splice(index, 1);
    setAboutData({
      ...aboutData,
      bio: updatedBio
    });
  };
  
  // Handle updating an exhibition
  const handleExhibitionChange = (index, field, value) => {
    const updatedExhibitions = [...aboutData.exhibitions];
    updatedExhibitions[index] = {
      ...updatedExhibitions[index],
      [field]: value
    };
    setAboutData({
      ...aboutData,
      exhibitions: updatedExhibitions
    });
  };
  
  // Handle adding a new exhibition
  const handleAddExhibition = () => {
    setAboutData({
      ...aboutData,
      exhibitions: [...aboutData.exhibitions, { year: '', details: '' }]
    });
  };
  
  // Handle removing an exhibition
  const handleRemoveExhibition = (index) => {
    const updatedExhibitions = [...aboutData.exhibitions];
    updatedExhibitions.splice(index, 1);
    setAboutData({
      ...aboutData,
      exhibitions: updatedExhibitions
    });
  };
  
  // Handle contact info changes
  const handleContactChange = (field, value) => {
    setAboutData({
      ...aboutData,
      contact: {
        ...aboutData.contact,
        [field]: value
      }
    });
  };
  
  // Handle saving about page data
  const handleSaveAbout = async () => {
    try {
      setMessage('Saving about page data...');
      const apiUrl = `${getApiBase()}/saveAbout`;
      console.log('Using About API URL:', apiUrl);
      const response = await axios.post(apiUrl, aboutData);
      
      if (response.data.success) {
        setMessage('About page data saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      setMessage(`Error saving about data: ${error.message}`);
    }
  };
  
  // Handle about page image upload
  const handleAboutImageUpload = async (e) => {
    console.log('Starting about image upload...');
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image file size must be less than 5MB');
      return;
    }
    
    try {
      setUploadingImage(true);
      setUploadProgress(0);
      setMessage('Uploading about image...');
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(`${getApiBase()}/uploadImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      if (response.data && response.data.success) {
        // Get raw path from response
        const rawFilePath = response.data.filePath.startsWith('/') ? 
          response.data.filePath : `/${response.data.filePath}`;
        
        // Ensure the path includes /images/ prefix (convention for site images)
        let normalizedPath = rawFilePath;
        if (!normalizedPath.includes('/images/')) {
          // Extract filename
          const filename = normalizedPath.split('/').pop();
          normalizedPath = `/images/${filename}`;
          console.log('Normalized image path to include /images/:', normalizedPath);
        }
        
        // Apply proper base path using our utility
        const filePath = getImagePath(normalizedPath);
        
        console.log('Raw about image path from server:', rawFilePath);
        console.log('Setting about image with basePath:', filePath);
        
        setAboutData({
          ...aboutData,
          artistImage: filePath
        });
        
        // Add image preload test
        const img = new Image();
        img.onload = () => console.log('About image preloaded successfully:', filePath);
        img.onerror = (err) => console.error('Failed to preload about image:', filePath, err);
        img.src = filePath;
        
        setMessage('About image uploaded successfully!');
      } else {
        setMessage(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error uploading about image:', error);
      setMessage(`Error uploading image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSaveGallery = async () => {
    try {
      // First check if there are any artworks with uploadedImageUrl that haven't been saved
      if (uploadedImageUrl && !artworks.some(art => art.imageUrl === uploadedImageUrl)) {
        if (confirm('You have an uploaded image that hasn\'t been added to any artwork. Do you still want to save?')) {
          // User chose to continue anyway
        } else {
          return; // User canceled
        }
      }

      // Log the gallery data being saved
      console.log('Saving gallery with artworks:', artworks);
      
      const apiUrl = `${getApiBase()}/saveGallery`;
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ works: artworks }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save gallery data');
      }
      
      const data = await response.json();
      setMessage(data.message || 'Gallery saved successfully! Changes will appear in the gallery.');
      
      // After saving successfully, reset the uploadedImageUrl but keep the form data
      // so the user can see what they've just saved
      setUploadedImageUrl('');
      
      // Force a reload of the gallery page data cache
      const refreshUrl = `${getApiBase()}/getGallery?forceRefresh=true`;
      console.log('Refreshing gallery cache:', refreshUrl);
      fetch(refreshUrl).catch(err => {
        console.error('Failed to refresh gallery cache:', err);
      });
    } catch (error) {
      console.error('Error saving gallery data:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Admin | Jack Carden</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <main className={styles.loginContainer}>
          <h1>Admin Login</h1>
          {message && <div className={styles.message}>{message}</div>}
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Login</button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Gallery Admin | Jack Carden</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <header className={styles.header}>
        <h1>Gallery Admin</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </header>

      <main className={styles.main}>
        {message && <div className={styles.message}>{message}</div>}

        <section className={styles.formSection}>
          <h2>{editMode ? 'Edit Artwork' : 'Add New Artwork'}</h2>
          <form onSubmit={handleAddOrUpdate} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="year">Year</label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="medium">Medium</label>
                <input
                  type="text"
                  id="medium"
                  name="medium"
                  value={formData.medium}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="dimensions">Dimensions</label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <h3>Image Upload</h3>
                <div className={styles.uploadInstructions}>
                  <p>1. Upload an image using the button below</p>
                  <p>2. Once uploaded, click "Use This Image" to apply it to this artwork</p>
                  <p>3. Don't forget to click "Save Gallery" when finished to save all changes</p>
                </div>
                <label htmlFor="imageUpload" className={styles.fileInputLabel}>
                  {uploadingImage ? `Uploading (${uploadProgress}%)` : 'Choose Image'}
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  onChange={handleImageUpload}
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  className={styles.fileInput}
                  ref={fileInputRef}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className={styles.uploadProgress}>Uploading: {uploadProgress}%</div>
                )}

                {/* Debug Information */}
                <div className={styles.debug}>
                  <p>Upload state: {uploadingImage ? 'Uploading' : 'Ready'}</p>
                  <p>Upload progress: {uploadProgress}%</p>
                  <p>Upload URL: {uploadedImageUrl || 'None'}</p>
                </div>

                {/* Upload Error Display */}
                {uploadError && (
                  <div className={styles.errorMessage}>
                    <p>Error: {uploadError}</p>
                  </div>
                )}

                {/* Uploaded Image Preview */}
                <div className={styles.uploadPreviewSection}>
                  {uploadedImageUrl ? (
                    <div className={styles.imagePreviewContainer}>
                      <div className={styles.imageWrapper}>
                        <SafeImage
                          src={uploadedImageUrl} /* SafeImage already applies getImagePath() internally */
                          alt="Uploaded image preview"
                          className={styles.imagePreview}
                        />
                      </div>
                      <div className={styles.imageActions}>
                        <button
                          type="button"
                          onClick={applyUploadedImage}
                          className={styles.useImageButton}
                          title="Apply this image to the current artwork form"
                        >
                          Apply To Artwork
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadedImageUrl('')}
                          className={styles.removeImageButton}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.noImagePreview}>
                      <p>No image uploaded yet</p>
                    </div>
                  )}
                </div>
                
                {/* Current Artwork Image (if different from uploaded) */}
                {formData.imageUrl && formData.imageUrl !== uploadedImageUrl && (
                  <div className={styles.currentImageContainer}>
                    <h4>Current Artwork Image:</h4>
                    <div className={styles.imageWrapper}>
                      <SafeImage
                        src={formData.imageUrl}
                        alt="Current artwork"
                        className={styles.imagePreview}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="price">Price (if available)</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  disabled={formData.status === 'sold'}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.button}>
                {editMode ? 'Update Artwork' : 'Add Artwork'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      id: '',
                      title: '',
                      year: '',
                      medium: '',
                      dimensions: '',
                      category: '',
                      description: '',
                      imageUrl: '',
                      status: 'available',
                      price: ''
                    });
                    setEditMode(false);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'gallery' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery Management
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'about' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About Page
          </button>
        </div>

        {activeTab === 'gallery' && (
          <>
            <section className={styles.gallerySection}>
              <div className={styles.sectionHeader}>
                <h2>Gallery Items ({artworks.length})</h2>
                <button onClick={handleSaveGallery} className={styles.saveButton}>
                  Save Gallery
                </button>
              </div>
          
          <div className={styles.artworkGrid}>
            {artworks.map(artwork => (
              <div key={artwork.id} className={styles.artworkCard}>
                <div className={styles.artworkImageContainer}>
                  {artwork.imageUrl ? (
                    <SafeImage 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className={styles.artworkImage} 
                    />
                  ) : (
                    <div className={styles.placeholderImage}>No Image</div>
                  )}
                </div>
                <div className={styles.artworkInfo}>
                  <h3>{artwork.title}</h3>
                  <p>{artwork.year} • {artwork.medium}</p>
                  <p className={artwork.status === 'sold' ? styles.soldStatus : styles.availableStatus}>
                    {artwork.status === 'sold' ? 'SOLD' : `Available • ${artwork.price || 'Price on request'}`}
                  </p>
                </div>
                <div className={styles.artworkActions}>
                  <button onClick={() => handleEdit(artwork)} className={styles.editButton}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(artwork.id)} className={styles.deleteButton}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
            </section>
          </>
        )}

        {activeTab === 'about' && (
          <section className={styles.aboutSection}>
            <div className={styles.sectionHeader}>
              <h2>About Page Content</h2>
              <button onClick={handleSaveAbout} className={styles.saveButton}>
                Save About Page
              </button>
            </div>
            
            <div className={styles.aboutForm}>
              <div className={styles.formGroup}>
                <label>Artist Image</label>
                <div className={styles.imageUploadContainer}>
                  {aboutData.artistImage && (
                    <div className={styles.previewContainer}>
                      <SafeImage 
                        src={aboutData.artistImage} 
                        alt="Artist" 
                        className={styles.previewImage}
                        onError={(e) => {
                          e.target.src = getImagePath('/placeholder.jpg');
                        }}
                      />
                    </div>
                  )}
                  <div className={styles.uploadControls}>
                    <input
                      type="file"
                      id="aboutImageInput"
                      accept="image/*"
                      onChange={handleAboutImageUpload}
                      style={{ display: 'none' }}
                    />
                    <button 
                      onClick={() => document.getElementById('aboutImageInput').click()}
                      className={styles.uploadButton}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? `Uploading... ${uploadProgress}%` : 'Upload Artist Image'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Bio</label>
                <div className={styles.bioParagraphs}>
                  {aboutData.bio.map((paragraph, index) => (
                    <div key={`bio-${index}`} className={styles.paragraphContainer}>
                      <textarea
                        value={paragraph}
                        onChange={(e) => handleBioChange(index, e.target.value)}
                        rows="3"
                        className={styles.bioTextarea}
                      />
                      <button 
                        onClick={() => handleRemoveBioParagraph(index)}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddBioParagraph}
                    className={styles.addButton}
                  >
                    Add Paragraph
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Exhibitions</label>
                <div className={styles.exhibitions}>
                  {aboutData.exhibitions.map((exhibition, index) => (
                    <div key={`exhibition-${index}`} className={styles.exhibitionContainer}>
                      <div className={styles.exhibitionInputs}>
                        <input
                          type="text"
                          value={exhibition.year}
                          onChange={(e) => handleExhibitionChange(index, 'year', e.target.value)}
                          placeholder="Year"
                          className={styles.yearInput}
                        />
                        <input
                          type="text"
                          value={exhibition.details}
                          onChange={(e) => handleExhibitionChange(index, 'details', e.target.value)}
                          placeholder="Exhibition details"
                          className={styles.detailsInput}
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveExhibition(index)}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddExhibition}
                    className={styles.addButton}
                  >
                    Add Exhibition
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Contact Information</label>
                <div className={styles.contactInputs}>
                  <div>
                    <label>Contact Message</label>
                    <textarea
                      value={aboutData.contact.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      rows="2"
                      className={styles.contactTextarea}
                      placeholder="Message before contact email"
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      value={aboutData.contact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="Contact email"
                      className={styles.emailInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
