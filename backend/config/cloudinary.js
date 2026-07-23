import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product images storage
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'castncart/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Study materials storage
const materialStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'castncart/materials',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'docx', 'ppt', 'pptx'],
  },
});

// Thumbnail storage
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'castncart/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ width: 640, height: 360, crop: 'fill', quality: 'auto' }],
  },
});

// Recording storage
const recordingStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'castncart/recordings',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov'],
  },
});

// Profile photo storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'castncart/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

export const uploadProductImages = multer({ storage: productStorage }).array('images', 10);
export const uploadMaterial = multer({ storage: materialStorage }).single('file');
export const uploadThumbnail = multer({ storage: thumbnailStorage }).single('thumbnail');
export const uploadRecording = multer({ storage: recordingStorage }).single('recording');
export const uploadProfilePhoto = multer({ storage: profileStorage }).single('photo');

export { cloudinary };
