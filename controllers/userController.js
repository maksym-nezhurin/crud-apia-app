const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const TOKEN_TIME = '30s'; // token expires in
const REFRESH_TOKEN_TIME = '7d'; // Refresh token expires in 7 days

export const registerUser = async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      role,
      email,
      password: bcrypt.hashSync(password, 10),
    });

    await user.save();

    const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

    res.json({
        message: 'You are successfully registered, please login!',
        payload,
    });
  } catch (err) {
    console.log('err', err);
    res.status(500).send('Server error');
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

      // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
        return res.status(401).json({ message: 'Email is wrong' });
    }

    // Check if password is correct
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_TIME,  // Access token expires in 15 minutes
    });

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_TIME
    });


    // Store the refresh token in MongoDB
    const newRefreshToken = new RefreshToken({
        token: refreshToken,
        userId: user._id,
    });
    await newRefreshToken.save();

    // Send tokens to the client
    res.json({
        accessToken,
        refreshToken,
    });
}

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
          return res.status(403).json({ message: 'Refresh token required' });
        }
      
        // Find the refresh token in the database
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        
        if (!storedToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Generate a new access token
            const newAccessToken = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: TOKEN_TIME,
            });

            res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        res.status(500).send(error);
    }
}

export const getUserDetails = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      res.status(500).send(error);
    }
  };

export const logoutUser = async (req, res) => {
    const { refreshToken } = req.body;
    
    // Check if refreshToken is provided
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required for logout!' });
    }
  
    // Delete the refresh token from the database
    const token = await RefreshToken.findOneAndDelete({ token: refreshToken });

    if (!token) {
        return res.status(400).json({ message: 'Provided refresh token is not exist!' });
    }
    console.log('token', token);
    // You could also clear httpOnly cookies if refresh tokens are stored in cookies
    res.status(200).json({ message: 'Successfully logged out!' });
}

  