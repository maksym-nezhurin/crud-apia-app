import jwt from 'jsonwebtoken';
import {AUTH_HEADER} from "../constants/auth.mjs";

const auth = (req, res, next) => {
  const token = req.header(AUTH_HEADER);

  console.log('auth', token)
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    console.log('vefore decode', )
    console.log('dec', jwt.verify(token, process.env.JWT_SECRET))
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('--- decoded --- ', decoded)
    req.user = {
        userId: decoded._id,
        role: decoded.role
    };  // Now `req.user` contains user ID and role

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid', err });
  }
};

export default auth;
