const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const dictionaryRoutes = require('./routes/dictionary');
const audioRoutes = require('./routes/audio');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
}));
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://127.0.0.1:8080'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Handle preflight for all routes
app.options('*', cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/history', historyRoutes);

// LLM (Gemini) translate endpoint (uses GOOGLE_API_KEY in .env)
app.post('/api/llm/translate', async (req, res) => {
    try {
        const { word, fromLang, toLang, seedResults = [] } = req.body || {};
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'Missing GEMINI_API_KEY (or GOOGLE_API_KEY) in .env' });
        }

        const prompt = `You are a multilingual dictionary formatter. Return ONLY a JSON array of senses for the input word/phrase.\n\nSTRICT REQUIREMENTS:\n- All content MUST be 100% in the TARGET LANGUAGE (${toLang}). Do NOT use English. Do NOT include Latin romanization unless the target language natively uses Latin.\n- Each array item MUST be: { word, pronunciation|null, definitions: [{ text, example, partOfSpeech }], audioUrl|null, refined: true }.\n- pronunciation: use a native phonetic system if appropriate; do NOT add romanization unless essential.\n- example: a natural sentence in the TARGET LANGUAGE only (no translation).\n- If unsure, return an empty array [].\n\nCONTEXT:\n- Source language: ${fromLang}\n- Target language: ${toLang}\n- Query: ${word}\n- Seed results (may be empty):\n${JSON.stringify(seedResults || [], null, 2)}\n\nOUTPUT: Print ONLY the JSON array, with no extra text.`;

        // Try multiple Gemini models for robustness
        const modelCandidates = [
            'gemini-2.0-flash',
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash'
        ];

        const payload = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024
            }
        };
        const axios = require('axios');
        let results = [];
        let lastError;
        for (const model of modelCandidates) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
                const resp = await axios.post(url, payload, {
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey
                    },
                    params: { key: apiKey }
                });

                const candidates = resp.data?.candidates || [];
                const text = candidates[0]?.content?.parts?.[0]?.text || '';

                try {
                    if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
                        results = JSON.parse(text.trim());
                    } else {
                        const match = text.match(/\[([\s\S]*)\]/);
                        if (match) {
                            results = JSON.parse(`[${match[1]}]`);
                        }
                    }
                } catch (e) {
                    results = [];
                }

                if (Array.isArray(results) && results.length > 0) {
                    return res.json({ success: true, results, modelUsed: model });
                }
                // If empty, try next model
                lastError = 'Empty results';
            } catch (err) {
                lastError = err?.response?.data || err.message;
                continue;
            }
        }

        return res.status(502).json({ success: false, error: 'LLM models returned no results', details: lastError });
    } catch (err) {
        const details = err?.response?.data || err.message || 'Unknown error';
        console.error('LLM translate error:', details);
        return res.status(500).json({ success: false, error: 'LLM translate failed', details });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Dictionary API ready for requests`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});

module.exports = app;