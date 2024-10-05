const express = require('express');
const { registerUser, getUserDetails, refreshToken, loginUser, logoutUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refreshToken', refreshToken);
router.get('/me', auth, getUserDetails);

module.exports = router;
