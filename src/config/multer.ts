import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const TMP_FOLDER = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: TMP_FOLDER,
  storage: multer.diskStorage({
    destination: TMP_FOLDER,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
