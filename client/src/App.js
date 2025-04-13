import React, { useRef, useState } from 'react';

function App() {
  const videoRef = useRef();
  const [photo, setPhoto] = useState(null);
  const [uploadedURL, setUploadedURL] = useState('');

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera not supported in this browser or not using HTTPS.");
        return;
      }
  
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Make sure you're using HTTPS and a supported browser.");
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 400, 300);
    canvas.toBlob(blob => setPhoto(blob), 'image/jpeg');
  };

  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append('photo', photo);

    const res = await fetch('https://saycheese-0cp0.onrender.com/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setUploadedURL(data.url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Take a Photo</h1>
      <video ref={videoRef} autoPlay width="400" height="300" />
      <br />
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={takePhoto}>Take Photo</button>
      <button onClick={uploadPhoto} disabled={!photo}>Upload</button>
      <br />
      {uploadedURL && (
        <div>
          <h2>Uploaded:</h2>
          <img src={uploadedURL} alt="Uploaded" width="400" />
        </div>
      )}
    </div>
  );
}

export default App;