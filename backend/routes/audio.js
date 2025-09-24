const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// Text-to-Speech endpoint
router.post('/tts', audioController.textToSpeech);

// Get audio file
router.get('/file/:filename', audioController.getAudioFile);

// Get TTS audio file
router.get('/file/tts/:filename', audioController.getTTSAudioFile);

// Generate pronunciation audio
router.post('/pronunciation', audioController.generatePronunciation);

module.exports = router;