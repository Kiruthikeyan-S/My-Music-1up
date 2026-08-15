import express from 'express';
import { getAlbums, getAlbumById } from '../controllers/albumController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAlbums);
router.get('/:id', authenticate, getAlbumById);

export default router;
