import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
        userId: decoded.userId,
        role: 'user'
    };  // Now `req.user` contains user ID and role

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default auth;
