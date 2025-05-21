import React, { useRef, useState, useEffect } from 'react';

function PhotoUploader() {
  const videoRef = useRef();
  const [, setPhoto] = useState(null);
  const [uploadedURL, setUploadedURL] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [backgroundUrl, setBackgroundUrl] = useState('');

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const res = await fetch('https://saycheese-0cp0.onrender.com/api/background');
        const data = await res.json();
        setBackgroundUrl(data.url);
      } catch (err) {
        console.error('Failed to fetch background:', err);
      }
    };
    fetchBackground();
  }, []);

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
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* 🔳 Background Image Layer */}
      {backgroundUrl && (
        <div
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
      )}

      {/* 🌓 Optional Dark Overlay */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* 🔲 Foreground Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 20,
          color: 'white',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 20 }}>
          Say Cheese 📸
        </h1>

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

        <div className="fab-wrapper mt-4">
          <label className="fab-button">
            ➕
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPhoto(file);
                  uploadFile(file);
                }
              }}
            />
          </label>
          <button onClick={startCamera} style={{ marginLeft: 10 }}>📷 Use Camera</button>
        </div>
      </div>
    </div>
  );
}

export default PhotoUploader;
