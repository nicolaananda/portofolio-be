import slugify from 'slugify';
import { Portfolio } from '../models/portfolio.model';

/**
 * Generate a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug string
 */
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    locale: 'id', // Support Indonesian characters
  });
}

/**
 * Generate a unique slug from a title, ensuring uniqueness in the database
 * @param title - The title to convert to a slug
 * @param existingId - Optional: ID of the current portfolio (to exclude from uniqueness check)
 * @returns A unique URL-friendly slug string
 */
export async function generateUniqueSlug(
  title: string,
  existingId: string | null = null
): Promise<string> {
  let baseSlug = generateSlug(title);

  // If slug is empty after generation, use a default
  if (!baseSlug || baseSlug.trim().length === 0) {
    baseSlug = 'portfolio-item';
  }

  let slug = baseSlug;
  let counter = 1;

  // Check for uniqueness, incrementing counter if needed
  while (true) {
    const query: { slug: string; _id?: { $ne: string } } = { slug };

    if (existingId) {
      query._id = { $ne: existingId };
    }

    const existing = await Portfolio.findOne(query);

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit to prevent infinite loops
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

