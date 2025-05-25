require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// File paths
const GALLERY_PATH = path.join(__dirname, 'gallery.json');
const BACKGROUND_PATH = path.join(__dirname, 'background.json');
const NAMES_PATH = path.join(__dirname, 'names.json');

// Ensure files exist
if (!fs.existsSync(GALLERY_PATH)) fs.writeFileSync(GALLERY_PATH, JSON.stringify([]));
if (!fs.existsSync(BACKGROUND_PATH)) fs.writeFileSync(BACKGROUND_PATH, JSON.stringify({ url: '' }));
if (!fs.existsSync(NAMES_PATH)) fs.writeFileSync(NAMES_PATH, JSON.stringify({ topName: '', bottomName: '', font: 'Arial' }));

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

// Middleware
app.use(cors());
app.use(express.json());

// 📤 Upload user photo
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    const localPath = req.file.path;
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'saycheese/uploads'
    });
    fs.unlinkSync(localPath);

    const id = Date.now().toString();
    const photoData = {
      id,
      url: result.secure_url,
      uploadedAt: new Date()
    };

    const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
    gallery.push(photoData);
    fs.writeFileSync(GALLERY_PATH, JSON.stringify(gallery, null, 2));

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).send('Upload failed');
  }
});

// 📥 Get all uploaded photos
app.get('/api/photos', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  res.json(gallery);
});

// 🗑 Delete photo
app.delete('/api/photos/:id', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  const updated = gallery.filter(p => p.id !== req.params.id);
  fs.writeFileSync(GALLERY_PATH, JSON.stringify(updated, null, 2));
  res.sendStatus(200);
});

// 🌄 Upload background
app.post('/api/background', upload.single('photo'), async (req, res) => {
  try {
    const localPath = req.file.path;
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'saycheese/backgrounds'
    });
    fs.unlinkSync(localPath);

    const background = { url: result.secure_url };
    fs.writeFileSync(BACKGROUND_PATH, JSON.stringify(background, null, 2));

    res.json(background);
  } catch (err) {
    console.error('Background upload error:', err);
    res.status(500).send('Background upload failed');
  }
});

// 🌄 Get background
app.get('/api/background', (req, res) => {
  const data = JSON.parse(fs.readFileSync(BACKGROUND_PATH));
  res.json(data);
});

// 🧑‍❤️‍🧑 Names & Font API
app.get('/api/names', (req, res) => {
  const data = JSON.parse(fs.readFileSync(NAMES_PATH));
  res.json(data);
});

app.post('/api/names', express.json(), (req, res) => {
  const { topName, bottomName, font } = req.body;
  fs.writeFileSync(NAMES_PATH, JSON.stringify({ topName, bottomName, font }, null, 2));
  res.sendStatus(200);
});

// ✅ Start server
app.listen(PORT, () => {
  const base = process.env.BASE_URL || `http://localhost:${PORT}`;
  console.log(`✅ Server running at ${base}`);
});
