const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Model, where } = require("sequelize");
const db = require("../models");
const User = db.User;
const authenticate = require('../middleware/authMiddleware');


// /Routes/Auth.js

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check all fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration Failed", error: err.message || "internal error" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'mysecret',
      { expiresIn: '1h' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.json({ message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Get all users (excluding passwords)
router.get('/users', async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt']
    });

    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Get a single user by ID (excluding password)
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db.User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// /Routes/Auth.js

router.post('/update-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;  // Get the userId from the authenticated user (this assumes the user is logged in)

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new passwords are required" });
  }

  try {
    // Step 1: Fetch the user from the database by userId
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Check if the current password is correct
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Step 3: Ensure the new password is different from the current one
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the current password" });
    }

    // Step 4: Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Error updating password:', err);
    return res.status(500).json({ message: 'Failed to update password', error: err.message });
  }
});


module.exports = router;