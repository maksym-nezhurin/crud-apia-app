import User from '../models/User.mjs';
import RefreshToken from '../models/RefreshToken.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import speakeasy from "speakeasy";
import qrcode from "qrcode";

const TOKEN_TIME = '1h'; // token expires in
const REFRESH_TOKEN_TIME = '7d'; // Refresh token expires in 7 days

export const registerUser = async (req, res) => {
    const {name, email, role, password, confirmPassword} = req.body;
    console.log(password, confirmPassword)
    if (password !== confirmPassword) {
        return res.status(400).json({message: 'Passwords do not match'});
    }

    try {
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({msg: 'User already exists'});
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
};

export const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Find user by email
        const user = await User.findOne({email});

        if (!user) {
            return res.status(401).json({message: 'Email is wrong'});
        }

        // Check if password is correct
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const accessToken = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET, {
            expiresIn: TOKEN_TIME,  // Access token expires in 15 minutes
        });

        // Generate refresh token (long-lived)
        const refreshToken = jwt.sign({userId: user._id}, process.env.JWT_REFRESH_SECRET, {
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
            data: {
                accessToken,
                refreshToken,
                userId: user._id
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
}

export const refreshToken = async (req, res) => {
    try {
        const {refreshToken} = req.body;

        if (!refreshToken) {
            return res.status(403).json({message: 'Refresh token required'});
        }

        // Find the refresh token in the database
        const storedToken = await RefreshToken.findOne({token: refreshToken});

        if (!storedToken) {
            return res.status(403).json({message: 'Invalid refresh token'});
        }

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({message: 'Invalid refresh token'});
            }

            // Generate a new access token
            const newAccessToken = jwt.sign({userId: user.userId, role: user.role}, process.env.JWT_SECRET, {
                expiresIn: TOKEN_TIME,
            });

            res.json({accessToken: newAccessToken});
        });
    } catch (error) {
        res.status(500).send(error);
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

export const logoutUser = async (req, res) => {
    const existingUser = await User.findById(req.user.userId);
    // Check if refreshToken is provided
    if (!existingUser) {
        return res.status(400).json({message: 'user should be logged, it is required for logout!'});
    }

    // Delete the refresh token from the database
    const token = await RefreshToken.findOneAndDelete({userId: req.user.userId});
    console.log('token', token)
    if (!token) {
        return res.status(400).json({message: 'Provided refresh token is not exist!'});
    }

    // You could also clear httpOnly cookies if refresh tokens are stored in cookies
    res.status(200).json({message: 'Successfully logged out!'});
}

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

// Helper function to generate a 6-digit code
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const requestPasswordResetCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });

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
            console.log('Email successfully sent');
        } catch (sendError) {
            console.error('Error while sending email:', sendError);
            return res.status(500).json({ message: 'Failed to send email' });
        }

        res.json({
            message: `Password reset code sent to your email: ${email}.`,
            status: "success"
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not process request' });
    }
};

export const verifyResetCode = async (req, res) => {
    const { email, resetCode, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log(user.resetCode, resetCode)
        if (!user || user.resetCode !== resetCode) {
            return res.status(400).json({ message: 'Invalid code or email' });
        }

        if (Date.now() > user.resetCodeExpiration) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Clear the reset code and expiration after successful reset
        user.resetCode = undefined;
        user.resetCodeExpiration = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.'});
    } catch (error) {
        console.log('e', error);
        res.status(500).json({ message: 'Could not process request' });
    }
};

export const setup2FA = async (req, res) => {
    console.log('setup2FA')
    const secret = speakeasy.generateSecret({ name: "Super Piper App" });
    //
    // console.log('secret', secret)
    //
    qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        return res.json({
            data: { secret: secret.base32, qrCode: dataUrl }
        });
    });
}

export const sendOPT2FA = async (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey', // В SendGrid це завжди "apikey"
            pass: process.env.SENDGRID_API_KEY, // використовуйте API Key з .env
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: req.body.email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    });

    res.json({ otp });
}

export const verify2FA = async (req, res) => {
    const { token, secret } = req.body;

    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
    });

    if (verified) {
        res.status(200).send({
            data: { success: true, message: "2FA Verified" }
        });
    } else {
        res.status(200).send({
            data: { success: false, message: "Invalid OTP" }
        });
    }
}

