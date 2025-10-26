import { Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

// Configure multer with memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Check file type - only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400));
    }
  },
});

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

// Helper function to upload file to R2
const uploadToR2 = async (file: Express.Multer.File, filename: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || 'portfolio-images',
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // Return public URL
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
  return publicUrl;
};

// Upload controller
export const uploadImage = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Generate unique filename with UUID
    const fileExtension = req.file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;

    // Upload to R2
    const publicUrl = await uploadToR2(req.file, filename);

    return res.json({
      success: true,
      url: publicUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
    });
  }
};
