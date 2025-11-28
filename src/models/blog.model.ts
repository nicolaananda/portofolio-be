import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogAuthor {
  name: string;
  avatar?: string;
  bio?: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  featured: boolean;
  readTime?: string;
  author: IBlogAuthor;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IBlogAuthor>(
  {
    name: {
      type: String,
      required: [true, 'Please provide the author name'],
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Please provide an excerpt'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide the content'],
    },
    coverImage: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: String,
      trim: true,
    },
    author: {
      type: authorSchema,
      required: [true, 'Please provide author information'],
    },
  },
  {
    timestamps: true,
  },
);

blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', category: 'text' });

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);

