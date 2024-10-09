import express from 'express';
import { registerUser, getUserDetails, refreshToken, loginUser, logoutUser } from '../controllers/userController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refreshToken', refreshToken);
router.get('/me', auth, getUserDetails);

export default router;
