import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
}

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better search performance
contactSchema.index({ email: 1, createdAt: -1 });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
