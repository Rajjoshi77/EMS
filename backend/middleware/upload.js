const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});


function checkFileType(file, cb) {
  
  const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images, PDFs, and Word documents only!'));
  }
}


const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
