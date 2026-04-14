const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// Validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  done: z.boolean().optional()
});

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get one task
const getTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await prisma.task.findUnique({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { title } = taskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: { title, userId: req.userId }
    });

    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const data = taskSchema.partial().parse(req.body);

    const task = await prisma.task.update({
      where: { id, userId: req.userId },
      data
    });

    res.json(task);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(404).json({ error: 'Task not found' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    await prisma.task.delete({
      where: { id, userId: req.userId }
    });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(404).json({ error: 'Task not found' });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };