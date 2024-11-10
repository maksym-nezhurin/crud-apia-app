import express from 'express';
import multer from 'multer';

import {
    checkoutUserData,
    createPayment
} from '../controllers/paymentController.mjs';

// import auth from '../middleware/auth.mjs';  // Assuming you want to protect some routes
const upload = multer();
const router = express.Router();

// Route to create a new article
router.post('/address-details', upload.none(), checkoutUserData);
router.post('/create-payment-intent', createPayment);

export default router;