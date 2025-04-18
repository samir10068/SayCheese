import React, { useEffect, useState } from 'react';

function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://saycheese-0cp0.onrender.com/api/photos');
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      setError('Failed to load photos');
    }
    setLoading(false);
  };

  const deletePhoto = async (id) => {
    try {
      await fetch(`https://saycheese-0cp0.onrender.com/api/photos/${id}`, {
        method: 'DELETE',
      });
      setPhotos(photos.filter(photo => photo.id !== id));
    } catch (err) {
      alert('Failed to delete photo');
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="admin-gallery" style={{ padding: 20 }}>
      <h1>📁 Admin Gallery</h1>
      {loading && <p>Loading photos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {photos.map(photo => (
          <div key={photo.id} style={{ border: '1px solid #ccc', padding: 10 }}>
            <img src={photo.url} alt="Uploaded" width="200" />
            <div style={{ marginTop: 10 }}>
              <button onClick={() => window.open(photo.url, '_blank')}>⬇️ Download</button>
              <button onClick={() => deletePhoto(photo.id)} style={{ marginLeft: 10 }}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminGallery;
