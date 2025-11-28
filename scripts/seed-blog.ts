import mongoose, { Types } from 'mongoose';
import { config } from 'dotenv';
import { Blog } from '../src/models/blog.model';
import { generateUniqueSlug } from '../src/utils/slugUtils';

config();

async function seedBlog() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const title = 'Membangun Data Journal Dashboard untuk Insight Harian';
    const slug = await generateUniqueSlug(title, null, Blog, 'blog-post');

    const blogPayload = {
      title,
      slug,
      excerpt:
        'Studi kasus bagaimana saya merancang jurnal data interaktif yang menyatukan KPI harian, insight AI, dan catatan tim dalam satu dashboard ringan.',
      content: `
<p>Proyek jurnal data ini berangkat dari kebutuhan founder untuk melihat performa harian tanpa harus membuka banyak tools. Saya menggabungkan data operasional, metrik marketing, serta insight AI yang dihasilkan otomatis setiap pagi.</p>
<h2>Arsitektur Ringkas</h2>
<ul>
  <li>ETL menggunakan Airbyte ke warehouse ringan berbasis PostgreSQL.</li>
  <li>Notebook dbt menyiapkan mart harian untuk setiap stakeholder.</li>
  <li>Dashboard dibuat di Metabase, lengkap dengan mode jurnal untuk menyisipkan catatan manual.</li>
</ul>
<p>Hasil akhirnya adalah pengalaman membaca jurnal yang familiar, namun dengan data real-time dan rekomendasi prioritas pekerjaan tiap hari.</p>
      `.trim(),
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
      category: 'Data Analyst',
      featured: true,
      readTime: '6 min read',
      author: {
        name: 'Nicola Ananda Dwiervantoro',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39',
        bio: 'Data storyteller yang fokus pada insight operasional untuk founder.',
      },
    };

    const existing = await Blog.findOne({ slug });
    if (existing) {
      console.warn(`⚠️  Blog with slug "${slug}" already exists. Skipping creation.`);
    } else {
      const blog = await Blog.create(blogPayload);
      const blogId = blog._id instanceof Types.ObjectId ? blog._id.toString() : String(blog._id);
      console.log(`📝 Blog created dengan slug "${blog.slug}" dan id ${blogId}`);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Failed to seed blog:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedBlog();

