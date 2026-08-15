import express from 'express';
import {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylist
} from '../controllers/playlistController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Run authenticate on all playlist routes
router.use(authenticate);

router.get('/', getUserPlaylists);
router.get('/:id', getPlaylistById);
router.post('/', requireAuth, createPlaylist);
router.put('/:id', requireAuth, updatePlaylist);
router.delete('/:id', requireAuth, deletePlaylist);
router.post('/:id/songs', requireAuth, addSongToPlaylist);
router.delete('/:id/songs/:songId', requireAuth, removeSongFromPlaylist);
router.put('/:id/reorder', requireAuth, reorderPlaylist);

export default router;
