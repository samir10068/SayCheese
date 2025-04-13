import React, { useRef, useState } from 'react';
import './App.css'; // You'll add the styles below

function App() {
  const videoRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setPhoto] = useState(null);
  const [uploadedURL, setUploadedURL] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleGalleryUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch('https://saycheese-0cp0.onrender.com/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setUploadedURL(data.url);
  };

  const startCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    });
    videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(() => startCamera(), 300);
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx || !videoRef.current) return;
    ctx.drawImage(videoRef.current, 0, 0, 400, 300);
    canvas.toBlob(blob => {
      if (blob) {
        setPhoto(blob);
        uploadFile(blob);
        stopCamera();
        setShowCamera(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="app-container">
      <h1>Say Cheese 📸</h1>

      {uploadedURL && (
        <div>
          <h2>Uploaded Image:</h2>
          <img src={uploadedURL} alt="Uploaded" width="300" />
        </div>
      )}

      {showCamera && (
        <div className="camera-container">
          <video ref={videoRef} autoPlay playsInline width="400" height="300" />
          <div className="camera-buttons">
            <button onClick={takePhoto}>📸 Take Photo</button>
            <button onClick={switchCamera}>🔄 Switch Camera</button>
            <button onClick={() => { stopCamera(); setShowCamera(false); }}>❌ Close</button>
          </div>
        </div>
      )}

      <div className="fab-wrapper">
        <button className={`fab-button ${menuOpen ? 'spin' : ''}`} onClick={toggleMenu}>
          ➕
        </button>
        {menuOpen && (
          <div className="fab-menu">
            <label className="fab-option">
              📁 Upload from Gallery
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleGalleryUpload}
              />
            </label>
            <button className="fab-option" onClick={startCamera}>
              📷 Take Picture
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
