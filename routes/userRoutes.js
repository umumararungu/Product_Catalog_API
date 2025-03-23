const express = require('express');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Register a new user (only admins can create admin accounts)
router.post('/register', auth, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Create a new user
    const user = new User({ username, password, role });
    await user.save();

    res.status(201).send({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).send(error);
  }
});

// User login
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).send('Invalid username or password');
      }
  
      // Compare passwords
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).send('Invalid username or password');
      }
  
      // Generate a JWT token
      const token = jwt.sign({ _id: user._id, role: user.role }, 'your-secret-key', { expiresIn: '1h' });
  
      res.send({ message: 'Logged in successfully', token });
    } catch (error) {
      res.status(400).send(error);
    }
  });

module.exports = router;