import express from 'express';

import {
  getSlots,
  getSlotsByDate,
  createSlot,
  updateSlot
} from '../controllers/slotController.mjs';
import auth from '../middleware/auth.mjs';  // Assuming you want to protect some routes

const router = express.Router();

// Route to create a new article
router.post('/', auth, createSlot);

// Route to get all articles (optional filter by status)
router.get('/', getSlots);

router.get('/:date', getSlotsByDate);

// Route to get a single article by ID
// router.get('/:id', getBookingById);

// Route to update an article by ID
router.put('/:id', auth, updateSlot);

// Route to delete an article by ID
// router.delete('/:id', auth, deleteBooking);

export default router;