import express from 'express';
import { getSongs, getSongById, streamSong, recordPlay } from '../controllers/songController.js';
import { updateSongMetadata, deleteSong } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getSongs);
router.get('/:id', authenticate, getSongById);
router.get('/:id/stream', streamSong);
router.post('/:id/play', authenticate, recordPlay);
router.put('/:id', updateSongMetadata);
router.delete('/:id', deleteSong);

export default router;
