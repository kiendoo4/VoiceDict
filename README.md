## VoiceDict

Một ứng dụng web từ điển đa ngữ được thiết kế đặc biệt cho người khiếm thị với giao diện thân thiện!

### Yêu cầu

- Node.js 18+
- npm

### Chuẩn bị môi trường

1) Vào thư mục `backend/` và tạo file `.env` từ mẫu:

```bash
cd backend
cp env.example .env
```

2) Mở `backend/.env`, điền API key Gemini:

```
GEMINI_API_KEY=your_api_key_here
```

### Cài đặt và chạy

Terminal 1 (Backend):

```bash
cd backend
npm install
npm start
```

Terminal 2 (Frontend):

```bash
cd frontend
npx http-server . -p 8080 --cors
```

Mở trình duyệt tại: http://localhost:8080

### Ghi chú

- Backend mặc định chạy ở http://localhost:3000
- Frontend gọi LLM qua `POST /api/llm/translate` và TTS qua `POST /api/audio/tts`
- Nếu đổi cổng hoặc domain frontend, cập nhật `FRONTEND_URL` trong `backend/.env`
