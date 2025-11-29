import fs from 'fs';
import path from 'path';
import { IBlog } from '../models/blog.model';

const BASE_URL = 'https://nicola.id';

export const updateBlogPostSEO = async (blog: IBlog) => {
    try {
        // Path to the main index.html template in dist
        // Assuming process.cwd() is portofolio-be root
        const templatePath = path.join(process.cwd(), '../dist/index.html');

        if (!fs.existsSync(templatePath)) {
            console.warn('Template index.html not found in dist. Skipping SEO generation.');
            return;
        }

        let html = fs.readFileSync(templatePath, 'utf-8');

        // Prepare data
        const title = `${blog.title} - Nicola Ananda`;
        // Strip HTML tags from content/excerpt for description
        const rawDescription = blog.excerpt || blog.content;
        const description = rawDescription
            .replace(/<[^>]*>?/gm, '') // Remove HTML tags
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim()
            .substring(0, 160);        // Limit length

        const url = `${BASE_URL}/blog/${blog.slug}`;
        const image = blog.coverImage || `${BASE_URL}/profile_hero.webp`;
        const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

        // Replace Title
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

        // Replace Meta Description
        html = html.replace(
            /<meta name="description" content=".*?" \/>/,
            `<meta name="description" content="${description}" />`
        );

        // Replace Open Graph Tags
        html = html.replace(
            /<meta property="og:title" content=".*?" \/>/,
            `<meta property="og:title" content="${title}" />`
        );
        html = html.replace(
            /<meta property="og:description" content=".*?" \/>/,
            `<meta property="og:description" content="${description}" />`
        );
        html = html.replace(
            /<meta property="og:image" content=".*?" \/>/,
            `<meta property="og:image" content="${fullImageUrl}" />`
        );
        html = html.replace(
            /<meta property="og:url" content=".*?" \/>/,
            `<meta property="og:url" content="${url}" />`
        );
        html = html.replace(
            /<meta property="og:type" content=".*?" \/>/,
            `<meta property="og:type" content="article" />`
        );

        // Replace Twitter Card Tags
        html = html.replace(
            /<meta name="twitter:title" content=".*?" \/>/,
            `<meta name="twitter:title" content="${title}" />`
        );
        html = html.replace(
            /<meta name="twitter:description" content=".*?" \/>/,
            `<meta name="twitter:description" content="${description}" />`
        );
        html = html.replace(
            /<meta name="twitter:image" content=".*?" \/>/,
            `<meta name="twitter:image" content="${fullImageUrl}" />`
        );

        // Define output path: ../dist/blog/<slug>/index.html
        const outputDir = path.join(process.cwd(), `../dist/blog/${blog.slug}`);
        const outputPath = path.join(outputDir, 'index.html');

        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write file
        fs.writeFileSync(outputPath, html);
        console.log(`Generated SEO HTML for blog: ${blog.slug}`);

    } catch (error) {
        console.error('Error generating SEO HTML:', error);
    }
};

export const deleteBlogPostSEO = (slug: string) => {
    try {
        const dirPath = path.join(process.cwd(), `../dist/blog/${slug}`);
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`Deleted SEO HTML for blog: ${slug}`);
        }
    } catch (error) {
        console.error('Error deleting SEO HTML:', error);
    }
};
