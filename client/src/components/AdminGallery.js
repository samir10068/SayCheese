import React, { useEffect, useState } from 'react';

function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backgroundURL, setBackgroundURL] = useState('');
  const [bgUploading, setBgUploading] = useState(false);

  const [topName, setTopName] = useState('');
  const [bottomName, setBottomName] = useState('');
  const [font, setFont] = useState('Arial');

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

  const fetchBackground = async () => {
    try {
      const res = await fetch('https://saycheese-0cp0.onrender.com/api/background');
      const data = await res.json();
      setBackgroundURL(data.url);
    } catch (err) {
      console.error('Failed to load background');
    }
  };

  const fetchNames = async () => {
    try {
      const res = await fetch('https://saycheese-0cp0.onrender.com/api/names');
      const data = await res.json();
      setTopName(data.topName);
      setBottomName(data.bottomName);
      setFont(data.font);
    } catch (err) {
      console.error('Failed to load names');
    }
  };

  const updateNames = async () => {
    try {
      await fetch('https://saycheese-0cp0.onrender.com/api/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topName, bottomName, font }),
      });
      alert('Names and font updated!');
    } catch (err) {
      alert('Failed to update names');
    }
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

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBgUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('https://saycheese-0cp0.onrender.com/api/background', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setBackgroundURL(data.url);
      alert('Background updated successfully!');
    } catch (err) {
      alert('Failed to upload background');
    }
    setBgUploading(false);
  };

  useEffect(() => {
    fetchPhotos();
    fetchBackground();
    fetchNames();
  }, []);

  return (
    <div className="admin-gallery" style={{ padding: 20 }}>
      <h1>📁 Admin Gallery</h1>

      {/* Background uploader */}
      <div style={{ marginBottom: 40 }}>
        <h2>🌄 Change Homepage Background</h2>
        <input type="file" accept="image/*" onChange={handleBackgroundUpload} />
        {bgUploading && <p>Uploading...</p>}
        {backgroundURL && (
          <div style={{ marginTop: 10 }}>
            <p>Current Background:</p>
            <img src={backgroundURL} alt="Background" style={{ width: 300, borderRadius: 8 }} />
          </div>
        )}
      </div>

      {/* Name/Font editor */}
      <div style={{ marginBottom: 40 }}>
        <h2>💍 Customize Names and Font</h2>
        <input
          type="text"
          placeholder="Top Name"
          value={topName}
          onChange={e => setTopName(e.target.value)}
          style={{ marginRight: 10, padding: 6 }}
        />
        <input
          type="text"
          placeholder="Bottom Name"
          value={bottomName}
          onChange={e => setBottomName(e.target.value)}
          style={{ marginRight: 10, padding: 6 }}
        />
        <select value={font} onChange={e => setFont(e.target.value)} style={{ padding: 6 }}>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Pacifico">Pacifico</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
        <button onClick={updateNames} style={{ marginLeft: 10, padding: '6px 12px' }}>
          💾 Save Names
        </button>
      </div>

      {/* Gallery */}
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
