const NodeCache = require('node-cache');

// Cache for 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

// In-memory storage for demo purposes
// In production, this would be a database
const userHistory = new Map();

class HistoryController {
    async getHistory(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 20, offset = 0 } = req.query;
            
            const cacheKey = `history_${userId}_${limit}_${offset}`;
            const cachedResult = cache.get(cacheKey);
            
            if (cachedResult) {
                return res.json({
                    success: true,
                    data: cachedResult,
                    cached: true
                });
            }

            const history = userHistory.get(userId) || [];
            const paginatedHistory = history.slice(offset, offset + parseInt(limit));
            
            const result = {
                items: paginatedHistory,
                total: history.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            };
            
            cache.set(cacheKey, result);
            
            res.json({
                success: true,
                data: result,
                cached: false
            });
        } catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get history',
                message: error.message
            });
        }
    }

    async addToHistory(req, res) {
        try {
            const { userId } = req.params;
            const { word, fromLang, toLang, timestamp } = req.body;
            
            if (!word || !fromLang || !toLang) {
                return res.status(400).json({
                    success: false,
                    error: 'Word, fromLang, and toLang are required'
                });
            }

            const historyItem = {
                id: Date.now().toString(),
                word: word,
                fromLang: fromLang,
                toLang: toLang,
                timestamp: timestamp || new Date().toISOString()
            };

            // Get existing history or create new array
            const history = userHistory.get(userId) || [];
            
            // Remove existing entry if it exists (to move to top)
            const filteredHistory = history.filter(item => 
                !(item.word === word && item.fromLang === fromLang && item.toLang === toLang)
            );
            
            // Add new item to beginning
            filteredHistory.unshift(historyItem);
            
            // Keep only last 50 items
            const limitedHistory = filteredHistory.slice(0, 50);
            
            // Update storage
            userHistory.set(userId, limitedHistory);
            
            // Clear cache for this user
            this.clearUserCache(userId);
            
            res.json({
                success: true,
                data: historyItem
            });
        } catch (error) {
            console.error('Add to history error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to add to history',
                message: error.message
            });
        }
    }

    async clearHistory(req, res) {
        try {
            const { userId } = req.params;
            
            userHistory.set(userId, []);
            
            // Clear cache for this user
            this.clearUserCache(userId);
            
            res.json({
                success: true,
                message: 'History cleared successfully'
            });
        } catch (error) {
            console.error('Clear history error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to clear history',
                message: error.message
            });
        }
    }

    async removeHistoryItem(req, res) {
        try {
            const { userId, historyId } = req.params;
            
            const history = userHistory.get(userId) || [];
            const filteredHistory = history.filter(item => item.id !== historyId);
            
            userHistory.set(userId, filteredHistory);
            
            // Clear cache for this user
            this.clearUserCache(userId);
            
            res.json({
                success: true,
                message: 'History item removed successfully'
            });
        } catch (error) {
            console.error('Remove history item error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove history item',
                message: error.message
            });
        }
    }

    // Helper method to clear user-specific cache
    clearUserCache(userId) {
        const keys = cache.keys();
        keys.forEach(key => {
            if (key.includes(`history_${userId}`)) {
                cache.del(key);
            }
        });
    }
}

module.exports = new HistoryController();