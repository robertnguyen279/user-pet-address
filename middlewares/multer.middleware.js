const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads');
  },
  filename: (req, file, callback) => {
    const match = ['image/png', 'image/jpeg'];
    if (match.indexOf(file.mimetype) === -1) {
      const message = `${file.originalname} is invalid. Only accept png/jpeg.`;
      return callback(message, null);
    }
    const filename = `${file.originalname}-${Date.now()}.${
      file.mimetype.split('/')[1]
    }`;
    callback(null, filename);
  },
});
const uploadFiles = multer({ storage: storage }).array('images', 10);
// const uploadFilesMiddleware = util.promisify(uploadFiles);

module.exports = uploadFiles;
