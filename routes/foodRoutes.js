import express from 'express';
import Food from '../models/Food.js';

const router = express.Router();

// Create a new food item
router.post('/', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat } = req.body;
    const newFood = new Food(name, calories, protein, carbs, fat);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all food items
router.get('/', async (req, res) => {
  try {
    const foods = await Food.findAll();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single food item by ID
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a food item by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedFood = await Food.updateById(req.params.id, req.body);
    if (updatedFood.matchedCount === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json({ message: 'Food updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a food item by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedFood = await Food.deleteById(req.params.id);
    if (deletedFood.deletedCount === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json({ message: 'Food deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
