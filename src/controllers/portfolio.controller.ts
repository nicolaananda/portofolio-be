import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Portfolio } from '../models/portfolio.model';
import { AppError } from '../middleware/errorHandler';
import { generateUniqueSlug } from '../utils/slugUtils';
import { generateSitemap } from '../utils/sitemapUtils';

interface PortfolioQuery {
  category?: string;
  client?: string;
  technologies?: string;
  page?: string;
  limit?: string;
}

// Create new portfolio item
export const createPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Auto-generate slug from title if not provided
    let slug = req.body.slug;
    if (!slug && req.body.title) {
      slug = await generateUniqueSlug(req.body.title);
    } else if (!slug) {
      return next(new AppError('Please provide a title for the portfolio', 400));
    } else {
      // Validate provided slug is unique
      slug = await generateUniqueSlug(slug);
    }

    const portfolio = await Portfolio.create({
      ...req.body,
      slug,
    });

    // Regenerate sitemap
    generateSitemap();

    res.status(201).json({
      status: 'success',
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

// Get all portfolio items with pagination and filtering
export const getAllPortfolios = async (
  req: Request<unknown, unknown, unknown, PortfolioQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.client) query.client = req.query.client;
    if (req.query.technologies) {
      query.technologies = { $in: (req.query.technologies as string).split(',') };
    }

    const portfolios = await Portfolio.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

    const total = await Portfolio.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: portfolios.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: portfolios,
    });
  } catch (error) {
    next(error);
  }
};

// Get single portfolio item (supports both slug and _id)
export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identifier = req.params.id;

    // Check if identifier is a valid MongoDB ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    let portfolio;
    if (isObjectId) {
      // Query by _id for backward compatibility
      portfolio = await Portfolio.findById(identifier);
    } else {
      // Query by slug
      portfolio = await Portfolio.findOne({ slug: identifier });
    }

    if (!portfolio) {
      return next(new AppError('No portfolio found with that identifier', 404));
    }

    res.status(200).json({
      status: 'success',
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

// Update portfolio item
export const updatePortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find the portfolio first to check if it exists
    const existingPortfolio = await Portfolio.findById(req.params.id);
    if (!existingPortfolio) {
      return next(new AppError('No portfolio found with that ID', 404));
    }

    // If title is being updated, auto-generate new slug (unless slug is explicitly provided)
    const updateData: any = { ...req.body };

    if (req.body.title && !req.body.slug) {
      // Title changed and no explicit slug provided, regenerate slug
      updateData.slug = await generateUniqueSlug(req.body.title, req.params.id);
    } else if (req.body.slug) {
      // Slug explicitly provided, ensure uniqueness
      updateData.slug = await generateUniqueSlug(req.body.slug, req.params.id);
    }

    const portfolio = await Portfolio.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Regenerate sitemap
    generateSitemap();

    res.status(200).json({
      status: 'success',
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

// Delete portfolio item
export const deletePortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);

    if (!portfolio) {
      return next(new AppError('No portfolio found with that ID', 404));
    }

    // Regenerate sitemap
    generateSitemap();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
