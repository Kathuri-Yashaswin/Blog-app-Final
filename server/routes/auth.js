const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');
const router = express.Router();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const otp = generateOTP();
    const otpSent = await sendOTPEmail(email, otp);

    if (!otpSent) {
      return res.status(500).json({ error: 'Failed to send OTP. Check email configuration.' });
    }

    await OTP.findOneAndUpdate(
      { email },
      { email, otp },
      { upsert: true }
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    req.session.signupData = {
      username,
      email,
      password: hashedPassword,
      authType: 'manual'
    };

    res.json({
      message: 'OTP sent to email',
      email,
      requiresOTP: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.authType = 'manual';
      await user.save();
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const otp = generateOTP();
    const otpSent = await sendOTPEmail(email, otp);

    if (!otpSent) {
      return res.status(500).json({ error: 'Failed to send OTP. Check email configuration.' });
    }

    await OTP.findOneAndUpdate(
      { email },
      { email, otp },
      { upsert: true }
    );

    req.session.loginData = {
      userId: user._id
    };

    res.json({
      message: 'OTP sent to email',
      email,
      requiresOTP: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    if (req.session.signupData) {
      const userData = req.session.signupData;
      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.username,
        authType: 'manual'
      });

      await newUser.save();
      await OTP.deleteOne({ email });
      delete req.session.signupData;

      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      req.login(newUser, (err) => {
        res.json({
          message: 'Signup successful',
          token,
          user: {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            name: newUser.name
          }
        });
      });
    } else if (req.session.loginData) {
      const userId = req.session.loginData.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      await OTP.deleteOne({ email });
      delete req.session.loginData;

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      req.login(user, (err) => {
        res.json({
          message: 'Login successful',
          token,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name
          }
        });
      });
    } else {
      return res.status(400).json({ error: 'Invalid session. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
}), (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/google-callback?token=${token}&user=${JSON.stringify({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    name: req.user.name
  })}`);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/`);
  });
});

router.get('/user', async (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        return res.json(user);
      }
      return res.status(401).json({ error: 'User not found' });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  res.status(401).json({ error: 'Not authenticated' });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email not registered' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'This email is registered with Google OAuth. Cannot reset password.' });
    }

    const otp = generateOTP();
    const otpSent = await sendOTPEmail(email, otp);

    if (!otpSent) {
      return res.status(500).json({ error: 'Failed to send OTP. Check email configuration.' });
    }

    await OTP.findOneAndUpdate(
      { email },
      { email, otp },
      { upsert: true }
    );

    req.session.resetData = { email };

    res.json({
      message: 'OTP sent to email',
      email,
      requiresOTP: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ email });
    delete req.session.resetData;

    res.json({
      message: 'Password reset successful',
      email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
