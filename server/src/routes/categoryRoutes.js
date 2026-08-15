import express from 'express';
import { getGenres, getLanguages, getSongTypes } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/genres', getGenres);
router.get('/languages', getLanguages);
router.get('/song-types', getSongTypes);

export default router;
