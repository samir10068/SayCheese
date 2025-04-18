import React, { useRef, useState } from 'react';
import './App.css';

function App() {
  const videoRef = useRef();
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedURL, setUploadedURL] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

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
        setPhotoBlob(blob);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
        setShowCamera(false);
      }
    }, 'image/jpeg');
  };

  const uploadPhoto = async () => {
    if (!photoBlob) return;
    const formData = new FormData();
    formData.append('photo', photoBlob);

    const res = await fetch('https://saycheese-0cp0.onrender.com/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setUploadedURL(data.url);
    setPhotoBlob(null);
    setPhotoPreview(null);
  };

  const retakePhoto = () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    startCamera();
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

      {!showCamera && !photoPreview && !uploadedURL && (
        <label className="fab-button">
          ➕
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onClick={startCamera}
          />
        </label>
      )}

      {photoPreview && (
        <div>
          <h2>Preview:</h2>
          <img src={photoPreview} alt="Preview" width="300" />
          <div style={{ marginTop: '10px' }}>
            <button onClick={uploadPhoto}>✅ Upload</button>
            <button onClick={retakePhoto}>🔁 Retake</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
