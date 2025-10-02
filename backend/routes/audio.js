const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// Text-to-Speech endpoint
router.post('/tts', (req, res) => audioController.textToSpeech(req, res));

// Get audio file
router.get('/file/:filename', (req, res) => audioController.getAudioFile(req, res));

// Get TTS audio file
router.get('/file/tts/:filename', (req, res) => audioController.getTTSAudioFile(req, res));

// Generate pronunciation audio
router.post('/pronunciation', (req, res) => audioController.generatePronunciation(req, res));

module.exports = router;