import { Request, Response, NextFunction } from 'express';
import { Portfolio } from '../models/portfolio.model';
import { AppError } from '../middleware/errorHandler';

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
    const portfolio = await Portfolio.create(req.body);
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

// Get single portfolio item
export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return next(new AppError('No portfolio found with that ID', 404));
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
    const portfolio = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!portfolio) {
      return next(new AppError('No portfolio found with that ID', 404));
    }

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

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
