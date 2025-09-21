const NodeCache = require('node-cache');
const axios = require('axios');

// Cache for 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

// Mock data for demonstration
const mockDictionaryData = {
    'hello': {
        'vi': {
            word: 'hello',
            pronunciation: '/həˈloʊ/',
            definitions: [
                {
                    text: 'Lời chào hỏi thân thiện',
                    example: 'Hello, how are you? - Xin chào, bạn có khỏe không?',
                    partOfSpeech: 'noun'
                }
            ]
        },
        'en': {
            word: 'hello',
            pronunciation: '/həˈloʊ/',
            definitions: [
                {
                    text: 'A friendly greeting',
                    example: 'Hello, how are you?',
                    partOfSpeech: 'noun'
                }
            ]
        }
    },
    'xin chào': {
        'en': {
            word: 'xin chào',
            pronunciation: '/sin tʃaʊ/',
            definitions: [
                {
                    text: 'Hello, greeting',
                    example: 'Xin chào, bạn có khỏe không? - Hello, how are you?',
                    partOfSpeech: 'noun'
                }
            ]
        },
        'vi': {
            word: 'xin chào',
            pronunciation: '/sin tʃaʊ/',
            definitions: [
                {
                    text: 'Lời chào hỏi',
                    example: 'Xin chào, bạn có khỏe không?',
                    partOfSpeech: 'noun'
                }
            ]
        }
    }
};

const supportedLanguages = {
    'vi': 'Tiếng Việt',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español'
};

class DictionaryController {
    async searchWord(req, res) {
        try {
            const { word, fromLang, toLang } = req.body;
            const cacheKey = `${word}_${fromLang}_${toLang}`;
            
            // Check cache first
            const cachedResult = cache.get(cacheKey);
            if (cachedResult) {
                return res.json({
                    success: true,
                    data: cachedResult,
                    cached: true
                });
            }

            // For now, return mock data
            // In production, this would call external dictionary APIs
            const result = await this.getMockTranslation(word, fromLang, toLang);
            
            // Cache the result
            cache.set(cacheKey, result);
            
            res.json({
                success: true,
                data: result,
                cached: false
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to search word',
                message: error.message
            });
        }
    }

    async getSupportedLanguages(req, res) {
        try {
            res.json({
                success: true,
                data: supportedLanguages
            });
        } catch (error) {
            console.error('Get languages error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get supported languages',
                message: error.message
            });
        }
    }

    async getWordDetails(req, res) {
        try {
            const { word } = req.params;
            const { lang } = req.query;
            
            const cacheKey = `word_${word}_${lang}`;
            const cachedResult = cache.get(cacheKey);
            
            if (cachedResult) {
                return res.json({
                    success: true,
                    data: cachedResult,
                    cached: true
                });
            }

            // Mock word details
            const wordDetails = this.getMockWordDetails(word, lang);
            
            cache.set(cacheKey, wordDetails);
            
            res.json({
                success: true,
                data: wordDetails,
                cached: false
            });
        } catch (error) {
            console.error('Get word details error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get word details',
                message: error.message
            });
        }
    }

    async getPronunciation(req, res) {
        try {
            const { word, lang } = req.params;
            
            const cacheKey = `pronunciation_${word}_${lang}`;
            const cachedResult = cache.get(cacheKey);
            
            if (cachedResult) {
                return res.json({
                    success: true,
                    data: cachedResult,
                    cached: true
                });
            }

            // Mock pronunciation
            const pronunciation = this.getMockPronunciation(word, lang);
            
            cache.set(cacheKey, pronunciation);
            
            res.json({
                success: true,
                data: pronunciation,
                cached: false
            });
        } catch (error) {
            console.error('Get pronunciation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get pronunciation',
                message: error.message
            });
        }
    }

    // Helper methods
    async getMockTranslation(word, fromLang, toLang) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const normalizedWord = word.toLowerCase().trim();
        
        if (mockDictionaryData[normalizedWord] && mockDictionaryData[normalizedWord][toLang]) {
            return mockDictionaryData[normalizedWord][toLang];
        }
        
        // Return generic translation if not found
        return {
            word: word,
            pronunciation: `/${word}/`,
            definitions: [
                {
                    text: `Translation of "${word}" from ${supportedLanguages[fromLang]} to ${supportedLanguages[toLang]}`,
                    example: `Example sentence with "${word}"`,
                    partOfSpeech: 'unknown'
                }
            ]
        };
    }

    getMockWordDetails(word, lang) {
        return {
            word: word,
            pronunciation: this.getMockPronunciation(word, lang),
            definitions: [
                {
                    text: `Detailed definition of "${word}" in ${supportedLanguages[lang] || lang}`,
                    example: `Example usage of "${word}"`,
                    partOfSpeech: 'noun',
                    synonyms: ['synonym1', 'synonym2'],
                    antonyms: ['antonym1', 'antonym2']
                }
            ],
            etymology: `Etymology of "${word}"`,
            frequency: Math.floor(Math.random() * 100)
        };
    }

    getMockPronunciation(word, lang) {
        const pronunciations = {
            'vi': `/${word}/`,
            'en': `/${word}/`,
            'ja': `/${word}/`,
            'ko': `/${word}/`,
            'zh': `/${word}/`,
            'fr': `/${word}/`,
            'de': `/${word}/`,
            'es': `/${word}/`
        };
        return pronunciations[lang] || `/${word}/`;
    }
}

module.exports = new DictionaryController();