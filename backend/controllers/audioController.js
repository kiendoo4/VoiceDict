const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');
const axios = require('axios');
const { gTTS } = require('gtts');

// Cache for 24 hours
const cache = new NodeCache({ stdTTL: 86400 });

class AudioController {
    async textToSpeech(req, res) {
        try {
            const { text, lang = 'vi-VN', voice = 'default' } = req.body;
            
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Text is required'
                });
            }

            const cacheKey = `tts_${text}_${lang}_${voice}`;
            const cachedResult = cache.get(cacheKey);
            
            if (cachedResult) {
                return res.json({
                    success: true,
                    data: {
                        audioUrl: cachedResult.audioUrl,
                        duration: cachedResult.duration,
                        text: text,
                        lang: lang
                    },
                    cached: true
                });
            }

            // For now, return mock audio URL
            // In production, this would generate actual TTS audio
            const audioUrl = await this.generateMockTTS(text, lang, voice);
            
            const result = {
                audioUrl: audioUrl,
                duration: this.estimateDuration(text),
                text: text,
                lang: lang
            };
            
            cache.set(cacheKey, result);
            
            res.json({
                success: true,
                data: result,
                cached: false
            });
        } catch (error) {
            console.error('TTS error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate TTS',
                message: error.message
            });
        }
    }

    async getAudioFile(req, res) {
        try {
            const { filename } = req.params;
            
            // Security check - prevent directory traversal
            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid filename'
                });
            }
            
            const filePath = path.join(__dirname, '../assets/audio', filename);
            
            try {
                await fs.access(filePath);
                res.sendFile(filePath);
            } catch (error) {
                res.status(404).json({
                    success: false,
                    error: 'Audio file not found'
                });
            }
        } catch (error) {
            console.error('Get audio file error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get audio file',
                message: error.message
            });
        }
    }

    async generatePronunciation(req, res) {
        try {
            const { word, lang = 'vi-VN' } = req.body;
            
            if (!word) {
                return res.status(400).json({
                    success: false,
                    error: 'Word is required'
                });
            }

            const cacheKey = `pronunciation_${word}_${lang}`;
            const cachedResult = cache.get(cacheKey);
            
            if (cachedResult) {
                return res.json({
                    success: true,
                    data: cachedResult,
                    cached: true
                });
            }

            // Mock pronunciation generation
            const pronunciation = await this.generateMockPronunciation(word, lang);
            
            cache.set(cacheKey, pronunciation);
            
            res.json({
                success: true,
                data: pronunciation,
                cached: false
            });
        } catch (error) {
            console.error('Generate pronunciation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate pronunciation',
                message: error.message
            });
        }
    }

    // Helper methods
    async generateMockTTS(text, lang, voice) {
        try {
            // Create output directory if it doesn't exist
            const outputDir = path.join(__dirname, '../assets/audio/tts');
            await fs.mkdir(outputDir, { recursive: true });
            
            // Generate filename
            const filename = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
            const filePath = path.join(outputDir, filename);
            
            // Use Google TTS
            const tts = new gTTS(text, lang === 'vi-VN' ? 'vi' : lang);
            
            // Save to file
            await new Promise((resolve, reject) => {
                tts.save(filePath, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            
            return `/api/audio/file/tts/${filename}`;
        } catch (error) {
            console.error('Google TTS error:', error);
            // Fallback to mock URL
            const filename = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
            return `/api/audio/file/${filename}`;
        }
    }

    async generateMockPronunciation(word, lang) {
        // Simulate pronunciation generation delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const pronunciations = {
            'vi-VN': `/${word}/`,
            'en-US': `/${word}/`,
            'ja-JP': `/${word}/`,
            'ko-KR': `/${word}/`,
            'zh-CN': `/${word}/`,
            'fr-FR': `/${word}/`,
            'de-DE': `/${word}/`,
            'es-ES': `/${word}/`
        };
        
        const pronunciation = pronunciations[lang] || `/${word}/`;
        const filename = `pronunciation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
        
        return {
            word: word,
            pronunciation: pronunciation,
            audioUrl: `/api/audio/file/${filename}`,
            lang: lang
        };
    }

    estimateDuration(text) {
        // Rough estimation: 150 words per minute
        const wordsPerMinute = 150;
        const wordCount = text.split(' ').length;
        return Math.max(1, Math.ceil((wordCount / wordsPerMinute) * 60));
    }
}

module.exports = new AudioController();