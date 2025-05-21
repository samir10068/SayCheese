require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;
const GALLERY_PATH = path.join(__dirname, 'gallery.json');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());

// Ensure gallery.json exists
if (!fs.existsSync(GALLERY_PATH)) {
  fs.writeFileSync(GALLERY_PATH, JSON.stringify([]));
}

// Multer temp storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = 'temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload and save to Cloudinary + gallery
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    const localPath = req.file.path;
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'saycheese'
    });

    // Remove temp file
    fs.unlinkSync(localPath);

    const id = Date.now().toString();
    const photoUrl = result.secure_url;

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
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Upload failed');
  }
});

// Get all uploaded photos
app.get('/api/photos', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  res.json(gallery);
});

// Delete a photo by ID (from JSON only)
app.delete('/api/photos/:id', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  const updatedGallery = gallery.filter(p => p.id !== req.params.id);
  fs.writeFileSync(GALLERY_PATH, JSON.stringify(updatedGallery, null, 2));
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  const base = process.env.BASE_URL || `http://localhost:${PORT}`;
  console.log(`✅ Server running at ${base}`);
});
