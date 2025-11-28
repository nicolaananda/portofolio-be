import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { Blog, IBlog } from '../models/blog.model';
import { AppError } from '../middleware/errorHandler';
import { generateUniqueSlug } from '../utils/slugUtils';

const BLOG_SLUG_FALLBACK = 'blog-post';

interface BlogQuery {
  category?: string;
  search?: string;
  featured?: string;
  page?: string;
  limit?: string;
}

import { User } from '../models/user.model';

export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user details for author field
    const user = await User.findById(req.user?.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    let slug = req.body.slug;
    if (!slug && req.body.title) {
      slug = await generateUniqueSlug(req.body.title, null, Blog, BLOG_SLUG_FALLBACK);
    } else if (!slug) {
      return next(new AppError('Please provide a title for the blog post', 400));
    } else {
      slug = await generateUniqueSlug(slug, null, Blog, BLOG_SLUG_FALLBACK);
    }

    const blog = await Blog.create({
      ...req.body,
      slug,
      author: {
        name: 'Nicola Ananda',
        avatar: (user.avatar && user.avatar !== 'default.jpg') ? user.avatar : 'https://ui-avatars.com/api/?name=Nicola+Ananda',
        bio: user.bio || 'Full Stack Developer'
      }
    });

    res.status(201).json({
      status: 'success',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (
  req: Request<unknown, unknown, unknown, BlogQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<IBlog> = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: regex },
        { excerpt: regex },
        { content: regex },
        { category: regex },
        { 'author.name': regex },
      ];
    }

    const blogs = await Blog.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Blog.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identifier = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    const blog = isObjectId ? await Blog.findById(identifier) : await Blog.findOne({ slug: identifier });

    if (!blog) {
      return next(new AppError('No blog found with that identifier', 404));
    }

    res.status(200).json({
      status: 'success',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingBlog = await Blog.findById(req.params.id);

    if (!existingBlog) {
      return next(new AppError('No blog found with that ID', 404));
    }

    const updateData: Record<string, unknown> = { ...req.body };

    if (req.body.title && !req.body.slug) {
      updateData.slug = await generateUniqueSlug(req.body.title, req.params.id, Blog, BLOG_SLUG_FALLBACK);
    } else if (req.body.slug) {
      updateData.slug = await generateUniqueSlug(req.body.slug, req.params.id, Blog, BLOG_SLUG_FALLBACK);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return next(new AppError('No blog found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Post deleted',
    });
  } catch (error) {
    next(error);
  }
};

