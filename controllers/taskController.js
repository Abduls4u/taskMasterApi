const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const task = new Task({
      title,
      description,
      deadline,
      priority,
      user: req.user.id, // From auth middleware
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    const updates = req.body;
    Object.assign(task, updates);
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get filtered and searched tasks
exports.getFilteredTasks = async (req, res) => {
    try {
      const { priority, dueDate, search } = req.query;
      const filter = { user: req.user.id }; // Only fetch tasks for the logged-in user
  
      // Add priority filter if specified
      if (priority) {
        filter.priority = priority; // e.g., { priority: 'high' }
      }
  
      // Add due date filter if specified
      if (dueDate) {
        const date = new Date(dueDate);
        filter.deadline = {
          $gte: date.setHours(0, 0, 0, 0), // Start of the day
          $lte: date.setHours(23, 59, 59, 999), // End of the day
        };
      }
  
      // Add search filter if specified
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } }, // Case-insensitive search in title
          { description: { $regex: search, $options: 'i' } }, // Case-insensitive search in description
        ];
      }
  
      const tasks = await Task.find(filter);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};