import express from 'express';
import {
    registerUser,
    getUserDetails,
    refreshToken,
    loginUser,
    logoutUser,
    resetPassword,
    requestPasswordResetCode,
    verifyResetCode
} from '../controllers/userController.mjs';
import auth from '../middleware/auth.mjs';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refreshToken', refreshToken);
router.post('/reset-password', resetPassword);
router.post('/request-password-reset-code', requestPasswordResetCode);
router.post('/verify-reset-code', verifyResetCode);
router.get('/me', auth, getUserDetails);

export default router;
