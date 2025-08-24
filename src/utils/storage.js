
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import { config } from '../config.js';

let cloudConfigured = false;
if(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)){
  cloudinary.v2.config(process.env.CLOUDINARY_URL || {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  cloudConfigured = true;
}

export const uploadReceipt = async (file) => {
  if(!file) return null;
  if(cloudConfigured){
    return new Promise((resolve, reject) => {
      const upload_stream = cloudinary.v2.uploader.upload_stream({ folder: 'receipts' }, (error, result) => {
        if(result) resolve(result.secure_url);
        else reject(error);
      });
      streamifier.createReadStream(file.buffer).pipe(upload_stream);
    });
  } else {
    // fallback: return data URL
    const b64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${b64}`;
  }
};
