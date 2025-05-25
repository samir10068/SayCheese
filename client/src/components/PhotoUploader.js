import React, { useRef, useState, useEffect } from 'react';

function PhotoUploader() {
  const videoRef = useRef();
  const [, setPhoto] = useState(null);
  const [uploadedURL, setUploadedURL] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [topName, setTopName] = useState('');
  const [bottomName, setBottomName] = useState('');
  const [font, setFont] = useState('Arial');

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

    const fetchNames = async () => {
      try {
        const res = await fetch('https://saycheese-0cp0.onrender.com/api/names');
        const data = await res.json();
        setTopName(data.topName);
        setBottomName(data.bottomName);
        setFont(data.font || 'Arial');
      } catch (err) {
        console.error('Failed to fetch names:', err);
      }
    };

    fetchBackground();
    fetchNames();
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
      {/* Background Image */}
      {backgroundUrl && (
        <div
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(0px)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
      )}

      {/* Dark Overlay */}
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

      {/* Centered Names & Symbol */}
      {topName && bottomName && (
        <div
          style={{
            textAlign: 'center',
            fontFamily: font,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textShadow: '0 0 8px rgba(0,0,0,0.8)',
            zIndex: 3,
          }}
        >
          <div>{topName}</div>
          <div style={{ fontSize: '3rem' }}>&</div>
          <div>{bottomName}</div>
        </div>
      )}

      {/* Arabic Animated Heading */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 0 8px rgba(0,0,0,0.8)',
          zIndex: 5,
          opacity: 0,
          animation: 'fadeSlideIn 1.5s ease-out forwards'
        }}
      >
        ومن هون بتبلش الذكريات
      </div>

      {/* Foreground Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 20,
          color: 'white',
        }}
      >
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

        {/* Floating Upload Button */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              fontSize: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
          >
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
        </div>
      </div>
    </div>
  );
}

export default PhotoUploader;
