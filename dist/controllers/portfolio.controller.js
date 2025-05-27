"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePortfolio = exports.updatePortfolio = exports.getPortfolio = exports.getAllPortfolios = exports.createPortfolio = void 0;
const portfolio_model_1 = require("../models/portfolio.model");
const errorHandler_1 = require("../middleware/errorHandler");
const createPortfolio = async (req, res, next) => {
    try {
        const portfolio = await portfolio_model_1.Portfolio.create(req.body);
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
        const portfolio = await portfolio_model_1.Portfolio.findById(req.params.id);
        if (!portfolio) {
            return next(new errorHandler_1.AppError('No portfolio found with that ID', 404));
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
        const portfolio = await portfolio_model_1.Portfolio.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!portfolio) {
            return next(new errorHandler_1.AppError('No portfolio found with that ID', 404));
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