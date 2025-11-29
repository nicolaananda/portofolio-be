import fs from 'fs';
import path from 'path';
import { Blog } from '../models/blog.model';
import { Portfolio } from '../models/portfolio.model';

const BASE_URL = 'https://nicola.id';

export const generateSitemap = async () => {
    try {
        console.log('Generating sitemap...');

        // Fetch all blogs and portfolios
        const blogs = await Blog.find({}).select('slug updatedAt');
        const portfolios = await Portfolio.find({}).select('slug updatedAt');

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

        // Add Portfolio Items
        portfolios.forEach((portfolio) => {
            const lastMod = new Date(portfolio.updatedAt as any).toISOString().split('T')[0];
            sitemap += `
  <url>
    <loc>${BASE_URL}/portfolio/${portfolio.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Add Blog Posts
        blogs.forEach((blog) => {
            const lastMod = new Date(blog.updatedAt as any).toISOString().split('T')[0];
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

        // Define paths
        // process.cwd() is expected to be portofolio-be root
        const publicPath = path.join(process.cwd(), '../public/sitemap.xml');
        const distPath = path.join(process.cwd(), '../dist/sitemap.xml');

        // Write to public folder
        fs.writeFileSync(publicPath, sitemap);
        console.log(`Sitemap written to ${publicPath}`);

        // Write to dist folder if it exists
        if (fs.existsSync(path.dirname(distPath))) {
            fs.writeFileSync(distPath, sitemap);
            console.log(`Sitemap written to ${distPath}`);
        }

    } catch (error) {
        console.error('Error generating sitemap:', error);
    }
};
