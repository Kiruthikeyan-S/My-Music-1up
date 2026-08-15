import express from 'express';
import { getRecommendations, getSimilarSongs } from '../controllers/recommendationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getRecommendations);
router.get('/similar/:id', authenticate, getSimilarSongs);

export default router;
