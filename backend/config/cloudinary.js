import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = multer.memoryStorage();

export const uploadProductImages = multer({ storage }).array('images', 10);
export const uploadMaterial = multer({ storage }).single('file');
export const uploadThumbnail = multer({ storage }).single('thumbnail');
export const uploadRecording = multer({ storage }).single('recording');
export const uploadProfilePhoto = multer({ storage }).single('photo');

export const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary credentials missing/incomplete in .env (skipping file upload)');
      return resolve(null);
    }

    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.warn('Cloudinary upload warning:', error.message || error);
          return resolve(null);
        }
        resolve(result);
      });
      stream.end(fileBuffer);
    } catch (err) {
      console.warn('Cloudinary upload exception:', err.message || err);
      resolve(null);
    }
  });
};

export { cloudinary };
