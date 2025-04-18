require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const GALLERY_PATH = path.join(__dirname, 'gallery.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure gallery.json exists
if (!fs.existsSync(GALLERY_PATH)) {
  fs.writeFileSync(GALLERY_PATH, JSON.stringify([]));
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload and save to gallery
app.post('/api/upload', upload.single('photo'), (req, res) => {
  const id = Date.now().toString();
  const photoUrl = `${BASE_URL}/uploads/${req.file.filename}`;
  const photoData = {
    id,
    url: photoUrl,
    uploadedAt: new Date()
  };

  const gallery = fs.existsSync(GALLERY_PATH)
    ? JSON.parse(fs.readFileSync(GALLERY_PATH))
    : [];

  gallery.push(photoData);
  fs.writeFileSync(GALLERY_PATH, JSON.stringify(gallery, null, 2));

  res.json({ url: photoUrl });
});

// Get all uploaded photos
app.get('/api/photos', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  res.json(gallery);
});

// Delete a photo by ID
app.delete('/api/photos/:id', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  const photo = gallery.find(p => p.id === req.params.id);
  if (!photo) return res.status(404).send('Photo not found');

  const filePath = path.join(__dirname, 'uploads', path.basename(photo.url));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const updatedGallery = gallery.filter(p => p.id !== req.params.id);
  fs.writeFileSync(GALLERY_PATH, JSON.stringify(updatedGallery, null, 2));

  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at ${BASE_URL}`);
});
