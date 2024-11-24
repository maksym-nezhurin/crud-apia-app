import jwt from 'jsonwebtoken';
import {AUTH_HEADER} from "../constants/auth.mjs";
import {verifyToken} from "../controllers/userController.mjs";

const auth = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    console.log('before decoded')
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('--- decoded --- ', decoded)
    req.user = {
      userId: decoded._id,
      role: decoded.role
    };  // Now `req.user` contains user ID and role
    // console.log('vefore decode', token, ' -- ::: --' , process.env.JWT_SECRET)
    // verifyToken(req, res, next).then(res => {
    //   console.log('middleware', res)
    // })
    // console.log('dec', jwt.verify(token, process.env.JWT_SECRET))
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // jwt.verify(
    //     token,
    //     process.env.JWT_SECRET,
    //     (err, decoded) => {
    //       if (err) {
    //         console.error('Token verification failed:', err);
    //       } else {
    //         console.log('Decoded payload:', decoded);
    //       }
    //     }
    // );
    console.log('wowow')
    // console.log('--- decoded --- ', decoded)
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
