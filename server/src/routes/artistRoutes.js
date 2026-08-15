import express from 'express';
import { getArtists, getArtistById } from '../controllers/artistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getArtists);
router.get('/:id', authenticate, getArtistById);

export default router;
