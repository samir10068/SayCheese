require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const basicAuth = require('express-basic-auth');
const archiver = require('archiver');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// 🔐 Protect /admin route
app.use('/admin', basicAuth({
  users: { [process.env.ADMIN_USER]: process.env.ADMIN_PASS },
  challenge: true,
}));

// File paths
const GALLERY_PATH = path.join(__dirname, 'gallery.json');
const BACKGROUND_PATH = path.join(__dirname, 'background.json');
const NAMES_PATH = path.join(__dirname, 'names.json');
const HEADING_PATH = path.join(__dirname, 'heading.json');

// Ensure files exist
if (!fs.existsSync(GALLERY_PATH)) fs.writeFileSync(GALLERY_PATH, JSON.stringify([]));
if (!fs.existsSync(BACKGROUND_PATH)) fs.writeFileSync(BACKGROUND_PATH, JSON.stringify({ url: '' }));
if (!fs.existsSync(NAMES_PATH)) fs.writeFileSync(NAMES_PATH, JSON.stringify({ topName: '', bottomName: '', font: 'Arial' }));
if (!fs.existsSync(HEADING_PATH)) fs.writeFileSync(HEADING_PATH, JSON.stringify({ title: 'Say cheese', subtitle: 'لنوثق معاً ذكريات لا تنسى', font: 'Cairo' }));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = 'temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// Upload image
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    const localPath = req.file.path;
    const result = await cloudinary.uploader.upload(localPath, { folder: 'saycheese/uploads' });
    fs.unlinkSync(localPath);

    const id = Date.now().toString();
    const photoData = { id, url: result.secure_url, uploadedAt: new Date() };

    const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
    gallery.push(photoData);
    fs.writeFileSync(GALLERY_PATH, JSON.stringify(gallery, null, 2));

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).send('Upload failed');
  }
});

// Get all uploaded photos
app.get('/api/photos', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  res.json(gallery);
});

// Delete photo by ID
app.delete('/api/photos/:id', (req, res) => {
  const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
  const updated = gallery.filter(p => p.id !== req.params.id);
  fs.writeFileSync(GALLERY_PATH, JSON.stringify(updated, null, 2));
  res.sendStatus(200);
});

// Delete all photos
app.delete('/api/photos', (req, res) => {
  fs.writeFileSync(GALLERY_PATH, JSON.stringify([], null, 2));
  res.sendStatus(200);
});

// Download all photos as ZIP
app.get('/api/photos/download-zip', async (req, res) => {
  try {
    const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH));
    const archive = archiver('zip');

    res.setHeader('Content-Disposition', 'attachment; filename=gallery.zip');
    res.setHeader('Content-Type', 'application/zip');

    archive.pipe(res);

    let count = 1;
    for (const photo of gallery) {
      const response = await axios.get(photo.url, { responseType: 'arraybuffer' });
      archive.append(response.data, { name: `photo-${count++}.jpg` });
    }

    await archive.finalize();
  } catch (err) {
    console.error('ZIP download error:', err);
    res.status(500).send('Failed to download photos');
  }
});

// Upload background image
app.post('/api/background', upload.single('photo'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'saycheese/backgrounds'
    });
    fs.unlinkSync(req.file.path);

    const background = { url: result.secure_url };
    fs.writeFileSync(BACKGROUND_PATH, JSON.stringify(background, null, 2));

    res.json(background);
  } catch (err) {
    console.error('Background upload error:', err);
    res.status(500).send('Background upload failed');
  }
});

// Get current background
app.get('/api/background', (req, res) => {
  const data = JSON.parse(fs.readFileSync(BACKGROUND_PATH));
  res.json(data);
});

// Delete background
app.delete('/api/background', (req, res) => {
  fs.writeFileSync(BACKGROUND_PATH, JSON.stringify({ url: '' }, null, 2));
  res.sendStatus(200);
});

// Get names and font
app.get('/api/names', (req, res) => {
  const data = JSON.parse(fs.readFileSync(NAMES_PATH));
  res.json(data);
});

// Update names and font
app.post('/api/names', (req, res) => {
  const { topName, bottomName, font } = req.body;
  fs.writeFileSync(NAMES_PATH, JSON.stringify({ topName, bottomName, font }, null, 2));
  res.sendStatus(200);
});

// Get heading (title + subtitle + font)
app.get('/api/heading', (req, res) => {
  const data = JSON.parse(fs.readFileSync(HEADING_PATH));
  res.json(data);
});

// Update heading
app.post('/api/heading', (req, res) => {
  const { title, subtitle, font } = req.body;
  fs.writeFileSync(HEADING_PATH, JSON.stringify({ title, subtitle, font }, null, 2));
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
