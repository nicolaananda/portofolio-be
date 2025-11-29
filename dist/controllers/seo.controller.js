"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortfolioSeo = exports.getBlogSeo = void 0;
const blog_model_1 = require("../models/blog.model");
const portfolio_model_1 = require("../models/portfolio.model");
const BASE_URL = 'https://nicola.id';
const generateSeoHtml = (title, description, image, url, type = 'website') => {
    const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${fullImageUrl}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${fullImageUrl}">
    
    <!-- Redirect users who might accidentally land here to the actual page -->
    <script>window.location.href = "${url}";</script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${fullImageUrl}" alt="${title}" style="max-width: 100%;" />
</body>
</html>`;
};
const getBlogSeo = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const blog = await blog_model_1.Blog.findOne({ slug });
        if (!blog) {
            res.status(404).send('Blog post not found');
            return;
        }
        const title = `${blog.title} - Nicola Ananda`;
        const rawDescription = blog.excerpt || blog.content;
        const description = rawDescription
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 160);
        const url = `${BASE_URL}/blog/${blog.slug}`;
        const image = blog.coverImage || '/profile_hero.webp';
        const html = generateSeoHtml(title, description, image, url, 'article');
        res.send(html);
    }
    catch (error) {
        next(error);
    }
};
exports.getBlogSeo = getBlogSeo;
const getPortfolioSeo = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const portfolio = await portfolio_model_1.Portfolio.findOne({ slug });
        if (!portfolio) {
            res.status(404).send('Portfolio item not found');
            return;
        }
        const title = `${portfolio.title} - Nicola Ananda`;
        const description = portfolio.description
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 160);
        const url = `${BASE_URL}/portfolio/${portfolio.slug}`;
        const image = (portfolio.imageUrls && portfolio.imageUrls.length > 0)
            ? portfolio.imageUrls[0]
            : '/profile_hero.webp';
        const html = generateSeoHtml(title, description, image, url, 'article');
        res.send(html);
    }
    catch (error) {
        next(error);
    }
};
exports.getPortfolioSeo = getPortfolioSeo;
//# sourceMappingURL=seo.controller.js.map