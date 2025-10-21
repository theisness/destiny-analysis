const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'files');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}_${Math.floor(Math.random() * 100000)}${ext}`;
    cb(null, name);
  }
});

// 仅允许图片，单文件大小限制 2MB
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('仅允许上传图片文件'));
  }
});

/**
 * @route   POST /api/upload
 * @desc    上传文件
 * @access  Private
 */
router.post('/', upload.array('files', 10), (req, res) => {
  const files = (req.files || []).map(f => ({
    filename: f.filename,
    url: `/files/${f.filename}`,
    size: f.size,
    mimetype: f.mimetype
  }));
  res.json({ success: true, files });
});

module.exports = router;