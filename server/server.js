// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import textToSpeech from "@google-cloud/text-to-speech";

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// Proxy OpenAI Chat
// =========================
app.post("/openai", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

// =========================
// Google Cloud TTS
// =========================
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: "credentials.json", // file service account bạn tải từ Google Cloud
});

app.post("/tts", async (req, res) => {
  try {
    const { text, lang = "en-US" } = req.body;

    const request = {
      input: { text },
      voice: { languageCode: lang, ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    res.set("Content-Type", "audio/mpeg");
    res.send(response.audioContent);
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "TTS failed" });
  }
});

// =========================
// Server listen
// =========================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`- OpenAI proxy: http://localhost:${PORT}/openai`);
  console.log(`- Google TTS:   http://localhost:${PORT}/tts`);
});
