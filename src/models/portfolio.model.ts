import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
  title: string;
  category: string;
  client: string;
  completionDate: string;
  technologies: string[];
  description: string;
  challenge: string;
  solution: string;
  imageUrls: string[];
  liveUrl?: string;
  githubUrl?: string;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    client: {
      type: String,
      required: [true, 'Please provide a client name'],
      trim: true,
    },
    completionDate: {
      type: String,
      required: [true, 'Please provide a completion date'],
    },
    technologies: [
      {
        type: String,
        required: [true, 'Please provide at least one technology'],
      },
    ],
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    challenge: {
      type: String,
      required: [true, 'Please provide a challenge description'],
    },
    solution: {
      type: String,
      required: [true, 'Please provide a solution description'],
    },
    imageUrls: [
      {
        type: String,
        required: [true, 'Please provide at least one image URL'],
      },
    ],
    liveUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better search performance
portfolioSchema.index({ title: 'text', category: 'text', client: 'text' });

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema);
