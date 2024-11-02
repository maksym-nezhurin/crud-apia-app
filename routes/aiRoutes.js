import express from 'express';
import { createImage } from '../controllers/aiController.mjs'
import auth from '../middleware/auth.mjs';  // Assuming you want to protect some routes

const router = express.Router();

router.post('/generate-image', createImage);

export default router;