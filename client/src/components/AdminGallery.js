import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
      alert('Updated!');
    } catch (err) {
      alert('Failed to update names');
    }
  };
const deleteAllPhotos = async () => {
  const firstConfirm = window.confirm('⚠️ Are you sure you want to delete ALL photos?');
  if (!firstConfirm) return;

  const secondConfirm = window.confirm('This action is irreversible. Confirm delete all?');
  if (!secondConfirm) return;

  try {
    await fetch('https://saycheese-0cp0.onrender.com/api/photos', {
      method: 'DELETE',
    });
    setPhotos([]);
    alert('✅ All photos deleted.');
  } catch (err) {
    alert('❌ Failed to delete all photos.');
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

  const downloadAllPhotos = async () => {
    const zip = new JSZip();
    const folder = zip.folder('gallery');

    await Promise.all(
      photos.map(async (photo, idx) => {
        const res = await fetch(photo.url);
        const blob = await res.blob();
        folder.file(`photo-${idx + 1}.jpg`, blob);
      })
    );

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'gallery.zip');
    });
  };

  useEffect(() => {
    fetchPhotos();
    fetchBackground();
    fetchNames();
  }, []);

  return (
    <div className="admin-gallery" style={{ padding: 20 }}>
      <h1>📁 Admin Gallery</h1>

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

      <div style={{ marginBottom: 40 }}>
        <h2>💍 Names + Symbol</h2>
        <input placeholder="Top Name" value={topName} onChange={e => setTopName(e.target.value)} />
        <input placeholder="Bottom Name" value={bottomName} onChange={e => setBottomName(e.target.value)} />
        <select value={font} onChange={e => setFont(e.target.value)}>
          <option value="Arial">Arial</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Pacifico">Pacifico</option>
          <option value="Georgia">Georgia</option>
        </select>
        <button onClick={updateNames}>💾 Save Names</button>
      </div>

      <button
        onClick={downloadAllPhotos}
        style={{
          marginBottom: 20,
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        ⬇️ Download All Photos
      </button>
<button
  onClick={deleteAllPhotos}
  style={{
    marginBottom: 20,
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }}
>
  🗑️ Delete All Photos
</button>
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
