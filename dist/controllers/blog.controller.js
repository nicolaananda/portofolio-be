"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlog = exports.getAllBlogs = exports.createBlog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blog_model_1 = require("../models/blog.model");
const errorHandler_1 = require("../middleware/errorHandler");
const slugUtils_1 = require("../utils/slugUtils");
const BLOG_SLUG_FALLBACK = 'blog-post';
const createBlog = async (req, res, next) => {
    try {
        let slug = req.body.slug;
        if (!slug && req.body.title) {
            slug = await (0, slugUtils_1.generateUniqueSlug)(req.body.title, null, blog_model_1.Blog, BLOG_SLUG_FALLBACK);
        }
        else if (!slug) {
            return next(new errorHandler_1.AppError('Please provide a title for the blog post', 400));
        }
        else {
            slug = await (0, slugUtils_1.generateUniqueSlug)(slug, null, blog_model_1.Blog, BLOG_SLUG_FALLBACK);
        }
        const blog = await blog_model_1.Blog.create({
            ...req.body,
            slug,
        });
        res.status(201).json({
            status: 'success',
            data: blog,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBlog = createBlog;
const getAllBlogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const query = {};
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
        const blogs = await blog_model_1.Blog.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await blog_model_1.Blog.countDocuments(query);
        res.status(200).json({
            status: 'success',
            results: blogs.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: blogs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBlogs = getAllBlogs;
const getBlog = async (req, res, next) => {
    try {
        const identifier = req.params.id;
        const isObjectId = mongoose_1.default.Types.ObjectId.isValid(identifier);
        const blog = isObjectId ? await blog_model_1.Blog.findById(identifier) : await blog_model_1.Blog.findOne({ slug: identifier });
        if (!blog) {
            return next(new errorHandler_1.AppError('No blog found with that identifier', 404));
        }
        res.status(200).json({
            status: 'success',
            data: blog,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBlog = getBlog;
const updateBlog = async (req, res, next) => {
    try {
        const existingBlog = await blog_model_1.Blog.findById(req.params.id);
        if (!existingBlog) {
            return next(new errorHandler_1.AppError('No blog found with that ID', 404));
        }
        const updateData = { ...req.body };
        if (req.body.title && !req.body.slug) {
            updateData.slug = await (0, slugUtils_1.generateUniqueSlug)(req.body.title, req.params.id, blog_model_1.Blog, BLOG_SLUG_FALLBACK);
        }
        else if (req.body.slug) {
            updateData.slug = await (0, slugUtils_1.generateUniqueSlug)(req.body.slug, req.params.id, blog_model_1.Blog, BLOG_SLUG_FALLBACK);
        }
        const blog = await blog_model_1.Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: blog,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res, next) => {
    try {
        const blog = await blog_model_1.Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return next(new errorHandler_1.AppError('No blog found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Post deleted',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBlog = deleteBlog;
//# sourceMappingURL=blog.controller.js.map