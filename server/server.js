require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// Setup storage folders
const GALLERY_PATH = path.join(__dirname, 'gallery.json');
const BACKGROUND_PATH = path.join(__dirname, 'background.json');

// Create files if not exist
if (!fs.existsSync(GALLERY_PATH)) fs.writeFileSync(GALLERY_PATH, JSON.stringify([]));
if (!fs.existsSync(BACKGROUND_PATH)) fs.writeFileSync(BACKGROUND_PATH, JSON.stringify({ url: '' }));

// Multer for temp storage
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

// 🗑 Delete photo from gallery.json (not from Cloudinary)
app.delete('/api/photos/:id', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  const updated = gallery.filter(p => p.id !== req.params.id);
  fs.writeFileSync(GALLERY_PATH, JSON.stringify(updated, null, 2));
  res.sendStatus(200);
});

// 🌄 Upload background image
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

// 🌄 Get current background image
app.get('/api/background', (req, res) => {
  const data = JSON.parse(fs.readFileSync(BACKGROUND_PATH));
  res.json(data);
});

// ✅ Start server
app.listen(PORT, () => {
  const base = process.env.BASE_URL || `http://localhost:${PORT}`;
  console.log(`✅ Server running at ${base}`);
});
