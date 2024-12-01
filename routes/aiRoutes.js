import express from 'express';
import {createImage, getAvailability, getImages} from '../controllers/aiController.mjs'
import auth from '../middleware/auth.mjs';  // Assuming you want to protect some routes

const router = express.Router();

router.get('/availability', getAvailability)
router.get('/images', getImages);
router.post('/generate-image', createImage);

export default router;