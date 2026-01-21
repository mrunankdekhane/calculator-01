const express = require('express');
const router = express.Router();
const Calculation = require('../models/calculation');

// Home route - Calculator page
router.get('/', (req, res) => {
    res.render('calculator');
});

// History route
router.get('/history', async (req, res) => {
    try {
        const calculations = await Calculation.find().sort({ createdAt: -1 }).limit(50);
        res.render('history', { calculations });
    } catch (error) {
        res.status(500).send('Error fetching history');
    }
});

// API - Save calculation
router.post('/api/calculate', async (req, res) => {
    try {
        const { expression, result } = req.body;
        
        const calculation = new Calculation({
            expression,
            result: parseFloat(result)
        });
        
        await calculation.save();
        res.json({ success: true, calculation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API - Get recent calculations
router.get('/api/history', async (req, res) => {
    try {
        const calculations = await Calculation.find().sort({ createdAt: -1 }).limit(10);
        res.json(calculations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API - Clear history
router.delete('/api/history', async (req, res) => {
    try {
        await Calculation.deleteMany({});
        res.json({ success: true, message: 'History cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;