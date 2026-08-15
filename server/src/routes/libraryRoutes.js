import express from 'express';
import {
  getLikedSongs,
  toggleLikeSong,
  getRecentlyPlayed,
  getContinueListening,
  savePlaybackPosition
} from '../controllers/libraryController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/liked', requireAuth, getLikedSongs);
router.post('/like', requireAuth, toggleLikeSong);
router.get('/recent', getRecentlyPlayed);
router.get('/continue', getContinueListening);
router.post('/playback-position', savePlaybackPosition);

export default router;
