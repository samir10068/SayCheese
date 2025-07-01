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
  const [showAndSymbol, setShowAndSymbol] = useState(true);
  const [headingTitle, setHeadingTitle] = useState('');
  const [headingSubtitle, setHeadingSubtitle] = useState('');
  const [headingFont, setHeadingFont] = useState('Cairo');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const checkLogin = async () => {
    const res = await fetch('https://saycheese-0cp0.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      setIsLoggedIn(true);
    } else {
      alert('Login failed');
    }
  };

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
      setShowAndSymbol(data.showAndSymbol ?? true);
    } catch (err) {
      console.error('Failed to load names');
    }
  };

  const fetchHeading = async () => {
    try {
      const res = await fetch('https://saycheese-0cp0.onrender.com/api/heading');
      const data = await res.json();
      setHeadingTitle(data.title);
      setHeadingSubtitle(data.subtitle);
      setHeadingFont(data.font);
    } catch (err) {
      console.error('Failed to load heading');
    }
  };

  const updateNames = async () => {
    try {
      await fetch('https://saycheese-0cp0.onrender.com/api/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topName, bottomName, font, showAndSymbol }),
      });
      alert('Updated!');
    } catch (err) {
      alert('Failed to update names');
    }
  };

  const updateHeading = async () => {
    try {
      await fetch('https://saycheese-0cp0.onrender.com/api/heading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: headingTitle, subtitle: headingSubtitle, font: headingFont }),
      });
      alert('Heading updated!');
    } catch (err) {
      alert('Failed to update heading');
    }
  };

  const deletePhoto = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      await fetch(`https://saycheese-0cp0.onrender.com/api/photos/${id}`, {
        method: 'DELETE',
      });
      setPhotos(photos.filter(photo => photo.id !== id));
    } catch (err) {
      alert('Failed to delete photo');
    }
  };

  const deleteAllPhotos = async () => {
    if (!window.confirm('Are you sure you want to delete all photos?')) return;
    if (!window.confirm('This will remove all uploaded images permanently. Continue?')) return;

    try {
      await fetch('https://saycheese-0cp0.onrender.com/api/photos', {
        method: 'DELETE',
      });
      setPhotos([]);
      alert('All photos deleted successfully.');
    } catch (err) {
      alert('Failed to delete all photos');
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

  const deleteBackground = async () => {
    const confirm = window.confirm('Are you sure you want to remove the background photo?');
    if (!confirm) return;

    try {
      await fetch('https://saycheese-0cp0.onrender.com/api/background', {
        method: 'DELETE',
      });
      setBackgroundURL('');
      alert('✅ Background photo removed.');
    } catch (err) {
      alert('❌ Failed to remove background photo.');
    }
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
    if (isLoggedIn) {
      fetchPhotos();
      fetchBackground();
      fetchNames();
      fetchHeading();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div style={{ padding: 40 }}>
        <h2>🔐 Admin Login</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={checkLogin}>Login</button>
      </div>
    );
  }

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
            <button onClick={deleteBackground} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Remove Background</button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2>💍 Customize Names and Font</h2>
        <input placeholder="Top Name" value={topName} onChange={e => setTopName(e.target.value)} />
        <input placeholder="Bottom Name" value={bottomName} onChange={e => setBottomName(e.target.value)} />
        <select value={font} onChange={e => setFont(e.target.value)}>
          {[ 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Pacifico', 'Playfair Display', 'Lobster', 'Dancing Script' ].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <label style={{ display: 'block', marginTop: 10 }}>
          <input
            type="checkbox"
            checked={showAndSymbol}
            onChange={() => setShowAndSymbol(!showAndSymbol)}
          /> Show "&" symbol
        </label>
        <button onClick={updateNames}>💾 Save Names</button>
        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: font, fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
          <div>{topName || 'Your Name'}</div>
          {showAndSymbol && <div style={{ fontSize: '2.5rem' }}>&</div>}
          <div>{bottomName || 'Partner Name'}</div>
        </div>
      </div>

      {/* The rest of the component remains unchanged */}
    </div>
  );
}

export default AdminGallery;
