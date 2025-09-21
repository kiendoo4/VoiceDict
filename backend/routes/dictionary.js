const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionaryController');
const { validateSearchRequest } = require('../middleware/validation');

// Search for word translation
router.post('/search', validateSearchRequest, dictionaryController.searchWord);

// Get supported languages
router.get('/languages', dictionaryController.getSupportedLanguages);

// Get word details
router.get('/word/:word', dictionaryController.getWordDetails);

// Get pronunciation
router.get('/pronunciation/:word/:lang', dictionaryController.getPronunciation);

module.exports = router;