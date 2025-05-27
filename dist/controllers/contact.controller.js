"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.markAsRead = exports.getContact = exports.getAllContacts = exports.submitContact = void 0;
const contact_model_1 = require("../models/contact.model");
const errorHandler_1 = require("../middleware/errorHandler");
const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return next(new errorHandler_1.AppError('Please provide a valid email address', 400));
        }
        const contact = await contact_model_1.Contact.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.submitContact = submitContact;
const getAllContacts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (req.query.isRead) {
            query.isRead = req.query.isRead === 'true';
        }
        if (req.query.email) {
            query.email = { $regex: req.query.email, $options: 'i' };
        }
        const contacts = await contact_model_1.Contact.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await contact_model_1.Contact.countDocuments(query);
        res.status(200).json({
            status: 'success',
            results: contacts.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: contacts,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllContacts = getAllContacts;
const getContact = async (req, res, next) => {
    try {
        const contact = await contact_model_1.Contact.findById(req.params.id);
        if (!contact) {
            return next(new errorHandler_1.AppError('No contact message found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: contact,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getContact = getContact;
const markAsRead = async (req, res, next) => {
    try {
        const contact = await contact_model_1.Contact.findByIdAndUpdate(req.params.id, { isRead: true }, {
            new: true,
            runValidators: true,
        });
        if (!contact) {
            return next(new errorHandler_1.AppError('No contact message found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: contact,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const deleteContact = async (req, res, next) => {
    try {
        const contact = await contact_model_1.Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return next(new errorHandler_1.AppError('No contact message found with that ID', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteContact = deleteContact;
//# sourceMappingURL=contact.controller.js.map