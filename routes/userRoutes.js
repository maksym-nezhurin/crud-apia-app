const express = require('express');
const { registerUser, getUserDetails } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);
router.get('/me', auth, getUserDetails);

module.exports = router;
