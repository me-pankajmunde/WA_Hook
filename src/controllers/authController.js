const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const { phoneNumber, name, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { phoneNumber } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Create user
      const user = await User.create({
        phoneNumber,
        name,
        email,
        password: hashedPassword,
        isActive: true
      });

      // Generate token
      const token = generateToken(user.id);

      logger.info(`User registered: ${phoneNumber}`);

      res.status(201).json({
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { phoneNumber, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { phoneNumber } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      // Verify password if user has one
      if (user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }

      // Generate token
      const token = generateToken(user.id);

      // Update last seen
      await user.update({ lastSeenAt: new Date() });

      logger.info(`User logged in: ${phoneNumber}`);

      res.json({
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;

      res.json({
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = req.user;
      const { name, email, preferences } = req.body;

      await user.update({
        ...(name && { name }),
        ...(email && { email }),
        ...(preferences && { preferences })
      });

      logger.info(`Profile updated: ${user.phoneNumber}`);

      res.json({
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

module.exports = new AuthController();
