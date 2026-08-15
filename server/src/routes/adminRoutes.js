import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadAudioFiles,
  startFolderScan,
  getScanStatus,
  getMissingMetadataSongs,
  updateSongMetadata,
  bulkUpdateSongs,
  deleteSong,
  getDuplicates,
  resolveDuplicate,
  getStats,
  createArtist,
  updateArtist,
  deleteArtist,
  createAlbum,
  updateAlbum,
  deleteAlbum
} from '../controllers/adminController.js';

const uploadDir = path.resolve(process.cwd(), 'storage/music/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${cleanName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // Up to 250MB per audio file
});

const router = express.Router();

// Direct Audio Upload (Drag-and-Drop / Multi-file / Folder picker)
router.post('/upload', upload.array('audioFiles', 200), uploadAudioFiles);

// Scan & Import from local folder path
router.post('/scan', startFolderScan);
router.get('/scan/status', getScanStatus);

// Missing Metadata & Batch Editor
router.get('/songs/missing-metadata', getMissingMetadataSongs);
router.put('/songs/:id/metadata', updateSongMetadata);
router.post('/songs/bulk-update', bulkUpdateSongs);
router.delete('/songs/:id', deleteSong);

// Duplicate Detection & Resolution
router.get('/duplicates', getDuplicates);
router.post('/duplicates/resolve', resolveDuplicate);

// System Stats
router.get('/stats', getStats);

// Artist & Album Management
router.post('/artists', createArtist);
router.put('/artists/:id', updateArtist);
router.delete('/artists/:id', deleteArtist);

router.post('/albums', createAlbum);
router.put('/albums/:id', updateAlbum);
router.delete('/albums/:id', deleteAlbum);

export default router;
