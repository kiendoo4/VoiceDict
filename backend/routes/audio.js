const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// Text-to-Speech endpoint
router.post('/tts', audioController.textToSpeech);

// Get audio file
router.get('/file/:filename', audioController.getAudioFile);

// Generate pronunciation audio
router.post('/pronunciation', audioController.generatePronunciation);

module.exports = router;