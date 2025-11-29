"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogPostSEO = exports.updateBlogPostSEO = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const BASE_URL = 'https://nicola.id';
const updateBlogPostSEO = async (blog) => {
    try {
        const templatePath = path_1.default.join(process.cwd(), '../dist/index.html');
        if (!fs_1.default.existsSync(templatePath)) {
            console.warn('Template index.html not found in dist. Skipping SEO generation.');
            return;
        }
        let html = fs_1.default.readFileSync(templatePath, 'utf-8');
        const title = `${blog.title} - Nicola Ananda`;
        const rawDescription = blog.excerpt || blog.content;
        const description = rawDescription
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 160);
        const url = `${BASE_URL}/blog/${blog.slug}`;
        const image = blog.coverImage || `${BASE_URL}/profile_hero.webp`;
        const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`);
        html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
        html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`);
        html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${fullImageUrl}" />`);
        html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`);
        html = html.replace(/<meta property="og:type" content=".*?" \/>/, `<meta property="og:type" content="article" />`);
        html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`);
        html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`);
        html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${fullImageUrl}" />`);
        const outputDir = path_1.default.join(process.cwd(), `../dist/blog/${blog.slug}`);
        const outputPath = path_1.default.join(outputDir, 'index.html');
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        fs_1.default.writeFileSync(outputPath, html);
        console.log(`Generated SEO HTML for blog: ${blog.slug}`);
    }
    catch (error) {
        console.error('Error generating SEO HTML:', error);
    }
};
exports.updateBlogPostSEO = updateBlogPostSEO;
const deleteBlogPostSEO = (slug) => {
    try {
        const dirPath = path_1.default.join(process.cwd(), `../dist/blog/${slug}`);
        if (fs_1.default.existsSync(dirPath)) {
            fs_1.default.rmSync(dirPath, { recursive: true, force: true });
            console.log(`Deleted SEO HTML for blog: ${slug}`);
        }
    }
    catch (error) {
        console.error('Error deleting SEO HTML:', error);
    }
};
exports.deleteBlogPostSEO = deleteBlogPostSEO;
//# sourceMappingURL=seoUtils.js.map