"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePortfolio = exports.updatePortfolio = exports.getPortfolio = exports.getAllPortfolios = exports.createPortfolio = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const portfolio_model_1 = require("../models/portfolio.model");
const errorHandler_1 = require("../middleware/errorHandler");
const slugUtils_1 = require("../utils/slugUtils");
const createPortfolio = async (req, res, next) => {
    try {
        let slug = req.body.slug;
        if (!slug && req.body.title) {
            slug = await (0, slugUtils_1.generateUniqueSlug)(req.body.title);
        }
        else if (!slug) {
            return next(new errorHandler_1.AppError('Please provide a title for the portfolio', 400));
        }
        else {
            slug = await (0, slugUtils_1.generateUniqueSlug)(slug);
        }
        const portfolio = await portfolio_model_1.Portfolio.create({
            ...req.body,
            slug,
        });
        res.status(201).json({
            status: 'success',
            data: portfolio,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPortfolio = createPortfolio;
const getAllPortfolios = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (req.query.category)
            query.category = req.query.category;
        if (req.query.client)
            query.client = req.query.client;
        if (req.query.technologies) {
            query.technologies = { $in: req.query.technologies.split(',') };
        }
        const portfolios = await portfolio_model_1.Portfolio.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await portfolio_model_1.Portfolio.countDocuments(query);
        res.status(200).json({
            status: 'success',
            results: portfolios.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: portfolios,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPortfolios = getAllPortfolios;
const getPortfolio = async (req, res, next) => {
    try {
        const identifier = req.params.id;
        const isObjectId = mongoose_1.default.Types.ObjectId.isValid(identifier);
        let portfolio;
        if (isObjectId) {
            portfolio = await portfolio_model_1.Portfolio.findById(identifier);
        }
        else {
            portfolio = await portfolio_model_1.Portfolio.findOne({ slug: identifier });
        }
        if (!portfolio) {
            return next(new errorHandler_1.AppError('No portfolio found with that identifier', 404));
        }
        res.status(200).json({
            status: 'success',
            data: portfolio,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPortfolio = getPortfolio;
const updatePortfolio = async (req, res, next) => {
    try {
        const existingPortfolio = await portfolio_model_1.Portfolio.findById(req.params.id);
        if (!existingPortfolio) {
            return next(new errorHandler_1.AppError('No portfolio found with that ID', 404));
        }
        const updateData = { ...req.body };
        if (req.body.title && !req.body.slug) {
            updateData.slug = await (0, slugUtils_1.generateUniqueSlug)(req.body.title, req.params.id);
        }
        else if (req.body.slug) {
            updateData.slug = await (0, slugUtils_1.generateUniqueSlug)(req.body.slug, req.params.id);
        }
        const portfolio = await portfolio_model_1.Portfolio.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: portfolio,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePortfolio = updatePortfolio;
const deletePortfolio = async (req, res, next) => {
    try {
        const portfolio = await portfolio_model_1.Portfolio.findByIdAndDelete(req.params.id);
        if (!portfolio) {
            return next(new errorHandler_1.AppError('No portfolio found with that ID', 404));
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
exports.deletePortfolio = deletePortfolio;
//# sourceMappingURL=portfolio.controller.js.map