const Joi = require('joi');

const searchRequestSchema = Joi.object({
    word: Joi.string().min(1).max(100).required(),
    fromLang: Joi.string().valid('vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de', 'es').required(),
    toLang: Joi.string().valid('vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de', 'es').required()
});

const ttsRequestSchema = Joi.object({
    text: Joi.string().min(1).max(1000).required(),
    lang: Joi.string().pattern(/^[a-z]{2}-[A-Z]{2}$/).optional(),
    voice: Joi.string().optional()
});

const historyRequestSchema = Joi.object({
    word: Joi.string().min(1).max(100).required(),
    fromLang: Joi.string().valid('vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de', 'es').required(),
    toLang: Joi.string().valid('vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de', 'es').required(),
    timestamp: Joi.string().isoDate().optional()
});

const validateSearchRequest = (req, res, next) => {
    const { error, value } = searchRequestSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.details.map(detail => detail.message)
        });
    }
    
    req.body = value;
    next();
};

const validateTTSRequest = (req, res, next) => {
    const { error, value } = ttsRequestSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.details.map(detail => detail.message)
        });
    }
    
    req.body = value;
    next();
};

const validateHistoryRequest = (req, res, next) => {
    const { error, value } = historyRequestSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.details.map(detail => detail.message)
        });
    }
    
    req.body = value;
    next();
};

module.exports = {
    validateSearchRequest,
    validateTTSRequest,
    validateHistoryRequest
};