import React, { useRef, useState, useEffect } from 'react';

function PhotoUploader() {
  const videoRef = useRef();
  const [, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [topName, setTopName] = useState('');
  const [bottomName, setBottomName] = useState('');
  const [font, setFont] = useState('Arial');
  const [showAndSymbol, setShowAndSymbol] = useState(true);
  const [headingTitle, setHeadingTitle] = useState('');
  const [headingSubtitle, setHeadingSubtitle] = useState('');
  const [headingFont, setHeadingFont] = useState('Cairo');

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
        setShowAndSymbol(data.showAndSymbol ?? true);
      } catch (err) {
        console.error('Failed to fetch names:', err);
      }
    };

    const fetchHeading = async () => {
      try {
        const res = await fetch('https://saycheese-0cp0.onrender.com/api/heading');
        const data = await res.json();
        setHeadingTitle(data.title);
        setHeadingSubtitle(data.subtitle);
        setHeadingFont(data.font || 'Cairo');
      } catch (err) {
        console.error('Failed to fetch heading:', err);
      }
    };

    fetchBackground();
    fetchNames();
    fetchHeading();
  }, []);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('https://saycheese-0cp0.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await res.json();
        alert('📸 Image uploaded successfully!');
      } else {
        alert('❌ Failed to upload image.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ An error occurred during upload.');
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Camera access error:', error);
      alert('❌ Unable to access camera.');
    }
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
      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.6);
          }
        }

        @media (max-width: 768px) {
          .responsive-heading {
            font-size: 1.5rem !important;
            padding: 6px 12px !important;
          }
          .responsive-names {
            font-size: 1.8rem !important;
          }
        }
      `}</style>

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

      {/* Arabic Heading at Bottom Center */}
      <div
        className="responsive-heading"
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          fontFamily: `"${headingFont}", sans-serif`,
          color: '#fff',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          animation: 'pulseGlow 3s ease-in-out infinite',
          zIndex: 10
        }}
      >
        <div style={{ fontSize: '2.2rem', marginBottom: '5px' }}>{headingTitle || 'Say cheese'}</div>
        <div style={{ fontSize: '1.8rem' }}>{headingSubtitle || 'لنوثق معاً ذكريات لا تنسى'}</div>
      </div>

      {topName && bottomName && (
        <div
          className="responsive-names"
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

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 20,
          color: 'white',
        }}
      >
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
