const express = require("express");
const router = express.Router();
const db = require("../models");
const auth = require("../middleware/authMiddleware");
const { Todo } = require('../models');

// Add a new todo
router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const todo = await db.Todo.create({
      title,
      userId: req.user.id,
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all todos for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const todos = await db.Todo.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle is_complete
router.patch("/toggle/:id", auth, async (req, res) => {
  try {
    const todo = await db.Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.is_complete = !todo.is_complete;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete todo
router.delete("/:id", auth, async (req, res) => {
  try {
    const rowsDeleted = await db.Todo.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!rowsDeleted) return res.status(404).json({ message: "Todo not found" });

    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single Todo
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Todo
router.put('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    await todo.update(req.body);
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
