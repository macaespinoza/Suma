// =============================================================================
// SUMA — Middleware de Upload para archivos Excel
// =============================================================================

import multer from 'multer';
import path from 'path';

const ALMACEN = multer.memoryStorage();

const FILTRO = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos .xlsx, .xls o .csv.'), false);
  }
};

const upload = multer({
  storage: ALMACEN,
  fileFilter: FILTRO,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default upload;