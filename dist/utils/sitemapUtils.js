"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSitemap = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const blog_model_1 = require("../models/blog.model");
const portfolio_model_1 = require("../models/portfolio.model");
const BASE_URL = 'https://nicola.id';
const generateSitemap = async () => {
    try {
        console.log('Generating sitemap...');
        const blogs = await blog_model_1.Blog.find({}).select('slug updatedAt');
        const portfolios = await portfolio_model_1.Portfolio.find({}).select('slug updatedAt');
        const today = new Date().toISOString().split('T')[0];
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/profile.webp</image:loc>
      <image:title>Nicola Ananda - Data Analyst &amp; Web Developer</image:title>
    </image:image>
  </url>

  <!-- About Page -->
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Portfolio Page -->
  <url>
    <loc>${BASE_URL}/portfolio</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Blog Page -->
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Contact Page -->
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        portfolios.forEach((portfolio) => {
            const lastMod = new Date(portfolio.updatedAt).toISOString().split('T')[0];
            sitemap += `
  <url>
    <loc>${BASE_URL}/portfolio/${portfolio.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
        blogs.forEach((blog) => {
            const lastMod = new Date(blog.updatedAt).toISOString().split('T')[0];
            sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${blog.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
        sitemap += `
</urlset>`;
        const publicPath = path_1.default.join(process.cwd(), '../public/sitemap.xml');
        const distPath = path_1.default.join(process.cwd(), '../dist/sitemap.xml');
        fs_1.default.writeFileSync(publicPath, sitemap);
        console.log(`Sitemap written to ${publicPath}`);
        if (fs_1.default.existsSync(path_1.default.dirname(distPath))) {
            fs_1.default.writeFileSync(distPath, sitemap);
            console.log(`Sitemap written to ${distPath}`);
        }
    }
    catch (error) {
        console.error('Error generating sitemap:', error);
    }
};
exports.generateSitemap = generateSitemap;
//# sourceMappingURL=sitemapUtils.js.map