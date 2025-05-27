import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/contact.model';
import { AppError } from '../middleware/errorHandler';

interface ContactQuery {
  isRead?: string;
  email?: string;
  page?: string;
  limit?: string;
}

// Submit contact form
export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// Get all contact messages (admin only)
export const getAllContacts = async (
  req: Request<unknown, unknown, unknown, ContactQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.isRead) {
      query.isRead = req.query.isRead === 'true';
    }
    if (req.query.email) {
      query.email = { $regex: req.query.email, $options: 'i' };
    }

    const contacts = await Contact.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: contacts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// Get single contact message (admin only)
export const getContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return next(new AppError('No contact message found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// Mark contact message as read (admin only)
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!contact) {
      return next(new AppError('No contact message found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// Delete contact message (admin only)
export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return next(new AppError('No contact message found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
