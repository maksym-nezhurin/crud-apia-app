import User from '../models/User.mjs';
import RefreshToken from '../models/RefreshToken.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import {tryCatch} from "../utils/tryCatch.mjs";
import {signIn} from '../services/authServices.mjs';
import AppError from "../utils/AppError.mjs";

const TOKEN_TIME = '1h'; // token expires in
const REFRESH_TOKEN_TIME = '7d'; // Refresh token expires in 7 days

export const registerUser = tryCatch(async (req, res) => {
    const {name, email, role, password, confirmPassword} = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            data: {
                message: 'Passwords do not match!'
            }
        });
    }

    try {
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({
                data: {
                    message: 'User already exists'
                }
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            role,
            password: hashedPassword,
        });

        await newUser.save();

        const payload = {
            id: newUser.id,
            role: newUser.role,
            name: newUser.name
        };

        res.status(201).json({
            data: {
                message: 'You are successfully registered, please login!',
                payload,
            }
        });
    } catch (err) {
        console.log('err', err);
        res.status(500).send('Server error');
    }
});

export const loginUser = tryCatch(async (req, res) => {
    const { email, password } = req.body;
    const cookies = req.cookies;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(404, "Email address not found. Please check your email and try again.", 404);
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError(401, "Incorrect password. Please double-check your password and try again.", 401);
    }

    // Token management
    let refreshToken;
    if (cookies?.jwt && user.refreshtoken.includes(cookies.jwt)) {
        refreshToken = cookies.jwt; // Use existing refresh token if it's valid
    } else {
        const response = await signIn(user, []);
        refreshToken = response.token.refreshtoken; // Get a new refresh token
        // Save new refresh token to user if needed
        user.refreshtoken.push(refreshToken);
        await user.save();
    }

    // Generate a new access token
    const accessToken = user.generateAuthToken().accesstoken;

    // Send tokens to the client with HttpOnly cookie for refresh token
    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({
        data: {
            accessToken: accessToken,
            userId: user._id,
            profilePic: user.profilePic
        }
    });
});

export const refreshToken = async (req, res) => {
    // const { refreshToken } = req.body;
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    try {

        const user = await User.findOne({ refreshtoken: { $in: [refreshToken] } });
        if (!user) {
            return res.status(401).json({ message: 'Refresh token is invalid' });
        }
        // console.log('user', user)
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        console.log('decoded', decoded)
        const newTokens = user.generateAuthToken();

        // Optionally remove the old refresh token and save the new one
        user.refreshtoken = user.refreshtoken.filter(token => token !== refreshToken);
        user.refreshtoken.push(newTokens.refreshtoken);
        await user.save();

        res.json({ accessToken: newTokens.accesstoken, refreshToken: newTokens.refreshtoken });
    } catch (error) {
        res.status(500).json({ message: 'Could not refresh the token', error: error.message });
    }
}

export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json(user);
    } catch (err) {
        res.status(500).send(error);
    }
};

export const logoutUser = tryCatch(async (req, res) => {
    // const {refreshToken} = req.body;
    const cookies = req.cookies;
    console.log('coockie22 2 ', cookies)
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;
    console.log('cookies', cookies)
    // Check if refreshToken is provided
    if (!refreshToken) {
        return res.status(400).json({message: 'Refresh token is required for logout!'});
    }

    const foundUser = await User.findOne({refreshtoken: refreshToken});
    if (!foundUser) {
        res.clearCookie("jwt", {httpOnly: true});
        return res.sendStatus(204);
    }

    // Delete the refresh token from the database
    foundUser.refreshtoken = foundUser.refreshtoken.filter(
        (rt) => rt !== refreshToken
    );
    await foundUser.save();
    console.log('after save', foundUser)
    res.clearCookie("jwt", {httpOnly: true});

    // You could also clear httpOnly cookies if refresh tokens are stored in cookies
    res.status(200).json({ data: {message: 'Successfully logged out!', messageType: 'warning'}});
})

export const resetPassword = async (req, res) => {
    const {token, newPassword} = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({message: 'User not found'});

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({message: 'Password has been reset successfully.'});
    } catch (error) {
        res.status(400).json({message: 'Invalid or expired token'});
    }
};

// Helper function to generate a 6-digit code
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const requestPasswordResetCode = async (req, res) => {
    const {email} = req.body;
    console.log('email', email)

    try {
        const user = await User.findOne({email});

        if (!user) return res.status(404).json({
            data: {message: 'User not found', status: false }
        });

        // Generate a 6-digit reset code
        const resetCode = generateResetCode();
        const expirationTime = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes

        // Store the reset code and expiration time in the user's document
        user.resetCode = resetCode;
        user.resetCodeExpiration = expirationTime;

        await user.save();

        // Send email with the code
        const transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey', // В SendGrid це завжди "apikey"
                pass: process.env.SENDGRID_API_KEY, // використовуйте API Key з .env
            },
        });

        try {
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: email,
                subject: 'Your Password Reset Code',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                        <h2 style="color: #4CAF50;">Password Reset Request</h2>
                        <p>Hi there,</p>
                        <p>You recently requested to reset your password. Use the code below to reset it:</p>
                        
                        <div style="padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; display: inline-block; font-size: 1.5em; font-weight: bold; color: #333; margin: 20px 0;">
                            ${resetCode}
                        </div>
                        
                        <p>If you prefer, you can also reset your password by clicking the button below:</p>
                        
                        <a href="https://maksym-nezhurin.github.io/react-app-test-crud-api-app/login/reset-password?code=${resetCode}" 
                           style="display: inline-block; padding: 12px 25px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">
                           Reset Password
                        </a>
                        
                        <p style="margin-top: 20px;">If you didn’t request this, you can ignore this email.</p>
                        
                        <p style="color: #888; margin-top: 30px;">Best regards,<br>Your Company Team</p>
                    </div>
                `,
            });

        } catch (sendError) {
            return res.status(500).json({
                data: {message: 'Failed to send email'}
            });
        }

        res.json({
            data: {
                message: `Password reset code sent to your email: ${email}.`,
                status: true
            }
        });
    } catch (error) {
        res.status(500).json({message: 'Could not process request'});
    }
};

export const verifyResetCode = async (req, res) => {
    const {email, resetCode, password} = req.body;

    try {
        const user = await User.findOne({email});
        console.log(user.resetCode, resetCode)
        if (!user || user.resetCode !== resetCode) {
            return res.status(400).json({message: 'Invalid code or email'});
        }

        if (Date.now() > user.resetCodeExpiration) {
            return res.status(400).json({message: 'Reset code has expired'});
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Clear the reset code and expiration after successful reset
        user.resetCode = undefined;
        user.resetCodeExpiration = undefined;

        await user.save();

        res.status(200).json({message: 'Password has been reset successfully.'});
    } catch (error) {
        console.log('e', error);
        res.status(500).json({message: 'Could not process request'});
    }
};
