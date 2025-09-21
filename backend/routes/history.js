const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Get user's search history
router.get('/:userId', historyController.getHistory);

// Add search to history
router.post('/:userId', historyController.addToHistory);

// Clear user's history
router.delete('/:userId', historyController.clearHistory);

// Remove specific history item
router.delete('/:userId/:historyId', historyController.removeHistoryItem);

module.exports = router;