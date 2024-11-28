import express from 'express';
import {
    registerUser,
    getUserDetails,
    refreshToken,
    loginUser,
    logoutUser,
    resetPassword,
    requestPasswordResetCode,
    verifyResetCode,
    setup2FA,
    sendOPT2FA,
    verify2FA
} from '../controllers/userController.mjs';
import auth from '../middleware/auth.mjs';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refreshToken', refreshToken);
router.post('/reset-password', resetPassword);
router.get('/2fa/setup', setup2FA);
router.post('/2fa/send-otp', sendOPT2FA);
router.post('/2fa/verify', verify2FA);
router.post('/request-password-reset-code', requestPasswordResetCode);
router.post('/verify-reset-code', verifyResetCode);
router.get('/me', auth, getUserDetails);

export default router;
