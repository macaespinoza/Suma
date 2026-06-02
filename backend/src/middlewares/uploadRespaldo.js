// =============================================================================
// SUMA — Middleware de Upload para Comprobantes de Egresos
// =============================================================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurarse de que el directorio uploads existe localmente
const dir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const ALMACEN = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const FILTRO = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const permitidas = ['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.xlsx', '.xls', '.csv'];
  if (permitidas.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Formatos válidos: PNG, JPG, JPEG, PDF, DOCX, XLSX, XLS, CSV'), false);
  }
};

const uploadRespaldo = multer({
  storage: ALMACEN,
  fileFilter: FILTRO,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

export default uploadRespaldo;
