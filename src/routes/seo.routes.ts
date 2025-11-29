import express from 'express';
import { getBlogSeo, getPortfolioSeo } from '../controllers/seo.controller';

const router = express.Router();

router.get('/blog/:slug', getBlogSeo);
router.get('/portfolio/:slug', getPortfolioSeo);

export default router;
