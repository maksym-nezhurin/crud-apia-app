import express from 'express';

import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  getBookingByDate,
  deleteBooking
} from '../controllers/bookingController.mjs';
import auth from '../middleware/auth.mjs';  // Assuming you want to protect some routes

const router = express.Router();

// Route to create a new article
router.post('/', createBooking);

// Route to get all articles (optional filter by status)
router.get('/', getBookings);

router.get('/:date', getBookingByDate);

router.get('/item/:id', getBookingById);

router.delete('/:id', deleteBooking)

// Route to get a single article by ID
// router.get('/:id', getBookingById);

// Route to update an article by ID
router.put('/:id', auth, updateBooking);

// Route to delete an article by ID
// router.delete('/:id', auth, deleteBooking);

export default router;