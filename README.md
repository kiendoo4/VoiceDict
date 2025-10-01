# Từ Điển Đa Ngữ - Dành cho Người Khiếm Thị

Một ứng dụng web từ điển đa ngữ được thiết kế đặc biệt cho người khiếm thị, với giao diện thân thiện và hỗ trợ accessibility tốt.

## 🌟 Tính năng chính

### ✅ Đã hoàn thành

- **Trang chủ với audio giới thiệu**: Audio tự động phát khi vào trang chủ
- **Trang từ điển riêng biệt**: Giao diện chuyên dụng cho tra cứu từ vựng
- **Giao diện đẹp mắt**: Thiết kế glassmorphism với gradient background
- **Tìm kiếm đa ngôn ngữ**: Hỗ trợ 8 ngôn ngữ (Việt, Anh, Nhật, Hàn, Trung, Pháp, Đức, Tây Ban Nha)
- **Điều khiển kích thước chữ**: 3 nút điều khiển (nhỏ, bình thường, to)
- **Pause audio**: Nút tạm dừng tất cả audio
- **Lịch sử tra cứu**: Lưu trữ 20 từ tra cứu gần nhất
- **Tìm kiếm nhanh**: Các nút từ vựng thông dụng
- **Responsive design**: Tối ưu cho mọi thiết bị
- **Accessibility**: Hỗ trợ screen reader, keyboard navigation, high contrast mode
- **Cấu trúc FE/BE**: Tách biệt frontend và backend

### 🔄 Đang phát triển

- **Text-to-Speech (TTS)**: Đọc từ và định nghĩa bằng giọng nói
- **Speech-to-Text (STT)**: Nhập từ bằng giọng nói
- **API từ điển thực**: Kết nối với các dịch vụ từ điển online
- **PWA**: Cài đặt như ứng dụng native

## 🚀 Cách sử dụng

### Khởi chạy load data

npx http-server ./ -p 8080 --cors

### Khởi chạy Frontend

1. Mở file `frontend/index.html` trong trình duyệt web
2. Hoặc sử dụng live server:

   ```bash
   cd frontend
   # Nếu có Python
   python -m http.server 8080

   # Nếu có Node.js
   npx live-server --port=8080
   ```

### Khởi chạy Backend

1. Cài đặt dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Tạo file `.env` từ `env.example`:

   ```bash
   cp env.example .env
   ```

3. Chạy server:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### Sử dụng cơ bản

1. **Trang chủ**: Audio giới thiệu tự động phát, sử dụng phím tắt để điều hướng
2. **Tra từ điển**: Chọn ngôn ngữ, nhập từ, xem kết quả với định nghĩa
3. **Điều khiển**: Sử dụng 4 nút ở góc phải màn hình

### Phím tắt

- `D`: Chuyển đến trang từ điển
- `P`: Phát/pause audio giới thiệu
- `H`: Hiển thị phím tắt
- `+`: Tăng kích thước chữ
- `-`: Giảm kích thước chữ
- `0`: Kích thước chữ bình thường
- `Escape`: Đóng modal/ẩn kết quả

## 🛠️ Công nghệ sử dụng

### Frontend

- **HTML5**: Semantic markup với ARIA attributes
- **CSS3**: Flexbox, Grid, CSS Variables, Media queries, Glassmorphism
- **Vanilla JavaScript**: ES6+ features, Local Storage API
- **Font Awesome**: Icons
- **Google Fonts**: Inter font family

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Morgan**: Logging middleware
- **Joi**: Data validation
- **Node-cache**: In-memory caching

## 📁 Cấu trúc dự án

```
SpeechRecognition_Final/
├── frontend/                 # Frontend application
│   ├── index.html           # Trang chủ
│   ├── pages/
│   │   └── dictionary.html  # Trang từ điển
│   ├── css/
│   │   ├── home.css         # Styles cho trang chủ
│   │   └── dictionary.css   # Styles cho từ điển
│   ├── js/
│   │   ├── home.js          # Logic trang chủ
│   │   └── dictionary.js    # Logic từ điển
│   └── assets/
│       └── audio/
│           └── intro.txt    # Text giới thiệu
├── backend/                 # Backend API
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── routes/             # API routes
│   │   ├── dictionary.js   # Dictionary endpoints
│   │   ├── audio.js        # Audio/TTS endpoints
│   │   └── history.js      # History endpoints
│   ├── controllers/        # Business logic
│   │   ├── dictionaryController.js
│   │   ├── audioController.js
│   │   └── historyController.js
│   ├── middleware/         # Custom middleware
│   │   └── validation.js
│   └── models/             # Data models (future)
└── README.md               # This file
```

## 🎨 Thiết kế

### Màu sắc chủ đạo

- **Primary**: #667eea (Blue gradient)
- **Secondary**: #764ba2 (Purple gradient)
- **Accent**: #f093fb (Pink gradient)
- **Success**: #48bb78 (Green)
- **Warning**: #ed8936 (Orange)
- **Error**: #e53e3e (Red)

### Typography

- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive từ 0.875rem đến 3rem
- **Weights**: 300, 400, 500, 600, 700, 800

### Layout

- **Container**: Max-width 1400px, centered
- **Grid**: CSS Grid cho responsive layout
- **Spacing**: Consistent 1rem, 1.5rem, 2rem, 3rem scale
- **Glassmorphism**: Backdrop blur effects

## 🔧 API Endpoints

### Dictionary

- `POST /api/dictionary/search` - Tìm kiếm từ
- `GET /api/dictionary/languages` - Lấy danh sách ngôn ngữ
- `GET /api/dictionary/word/:word` - Chi tiết từ
- `GET /api/dictionary/pronunciation/:word/:lang` - Phát âm

### Audio

- `POST /api/audio/tts` - Text-to-Speech
- `GET /api/audio/file/:filename` - Lấy file audio
- `POST /api/audio/pronunciation` - Tạo phát âm

### History

- `GET /api/history/:userId` - Lấy lịch sử
- `POST /api/history/:userId` - Thêm vào lịch sử
- `DELETE /api/history/:userId` - Xóa lịch sử
- `DELETE /api/history/:userId/:historyId` - Xóa item cụ thể

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance

- **Color Contrast**: Tỷ lệ tương phản tối thiểu 4.5:1
- **Keyboard Navigation**: Tất cả interactive elements có thể truy cập bằng keyboard
- **Screen Reader**: ARIA labels, roles, và live regions
- **Focus Management**: Clear focus indicators và logical tab order

### Supported Assistive Technologies

- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Voice Control**: Dragon NaturallySpeaking
- **Switch Navigation**: Có thể sử dụng với switch devices

## 🚧 Roadmap

### Phase 1: Core Features ✅

- [x] Basic UI/UX design
- [x] Multi-language support
- [x] Search functionality
- [x] History management
- [x] Accessibility features
- [x] Home page with audio
- [x] Text size controls
- [x] FE/BE separation

### Phase 2: Voice Features 🔄

- [ ] Text-to-Speech integration
- [ ] Speech-to-Text integration
- [ ] Voice commands
- [ ] Audio pronunciation

### Phase 3: Advanced Features 📋

- [ ] Real dictionary API integration
- [ ] Offline support (PWA)
- [ ] User preferences
- [ ] Advanced search filters
- [ ] Word of the day
- [ ] Favorites system

### Phase 4: Enhancement 📋

- [ ] Dark mode
- [ ] Custom themes
- [ ] Export history
- [ ] Share functionality
- [ ] Multi-user support

## 🚀 Quick Start

### Frontend Only

```bash
# Mở frontend/index.html trong trình duyệt
open frontend/index.html
```

### Full Stack

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npx live-server --port=8080
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Đặc biệt:

- Cải thiện accessibility
- Thêm ngôn ngữ mới
- Tối ưu performance
- Bug fixes

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue trên GitHub repository.

---

**Lưu ý**: Đây là phiên bản demo với mock data. Để sử dụng thực tế, cần tích hợp với API từ điển thực và thêm các tính năng TTS/STT.

# VoiceDict Node.js Server

## Yêu cầu

- Node.js >= 14
- npm
- Tài khoản Google Cloud (để lấy credentials cho Text-to-Speech)
- API key OpenAI

## Cài đặt

1. Cài dependencies:

   ```bash
   npm install
   ```

2. Tạo file `credentials.json` (service account) từ Google Cloud Console và đặt vào cùng thư mục với `server.js`.

   - Hướng dẫn: https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries

3. Đặt biến môi trường `OPENAI_API_KEY`:
   - Trên Linux/macOS:
     ```bash
     export OPENAI_API_KEY=your_openai_api_key
     ```
   - Trên Windows (cmd):
     ```cmd
     set OPENAI_API_KEY=your_openai_api_key
     ```

## Chạy server

```bash
node server.js
```

Server sẽ chạy ở http://localhost:3001

## Các endpoint

### 1. Proxy OpenAI Chat

- URL: `POST /openai`
- Body: giống như API OpenAI Chat (https://platform.openai.com/docs/api-reference/chat/create)
- Header: Không cần gửi API key, server sẽ tự động thêm.

### 2. Google Cloud Text-to-Speech

- URL: `POST /tts`
- Body (JSON):
  ```json
  {
    "text": "Hello world!",
    "lang": "en-US" // tuỳ chọn, mặc định en-US
  }
  ```
- Trả về: audio/mp3

---

Liên hệ: huonglam (nếu cần hỗ trợ)
