import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminGallery from './components/AdminGallery';
import PhotoUploader from './components/PhotoUploader';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PhotoUploader />} />
        <Route path="/admin" element={<AdminGallery />} />
      </Routes>
    </Router>
  );
}

export default App;
