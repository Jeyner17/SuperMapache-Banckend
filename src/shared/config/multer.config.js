const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta absoluta: SuperMapache-Backend/uploads/
const UPLOADS_ROOT = path.resolve(__dirname, '../../../uploads');

const createStorage = (subdir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(UPLOADS_ROOT, subdir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (_req, _file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${subdir}-${unique}.jpg`);
    }
  });

const imageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const validMime = allowed.test(file.mimetype);
  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
  }
};

const createUploader = (subdir, maxSizeMB = 2) =>
  multer({
    storage: createStorage(subdir),
    fileFilter: imageFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 }
  });

module.exports = { createUploader, UPLOADS_ROOT };
