// Guide Page JavaScript
class GuideApp {
    constructor() {
        this.currentTextSize = 'normal';
        this.textSizeLevels = ['normal', 'small', 'large', 'extra-large', 'huge', 'giant'];
        this.currentTextSizeIndex = 1; // normal is index 1
        this.isPlaying = false;
        this.currentAudioSection = null;
        this.audioTexts = {};
        this.audioPlayers = {};
        
        this.initializeElements();
        this.bindEvents();
        this.setupAccessibility();
        this.loadAudioTexts();
        this.initializeAudioPlayers();
        this.setupScrollAudioSync();
    }

    initializeElements() {
        // Control panel elements
        this.decreaseTextBtn = document.getElementById('decrease-text');
        this.normalTextBtn = document.getElementById('normal-text');
        this.increaseTextBtn = document.getElementById('increase-text');
        this.pauseAudioBtn = document.getElementById('pause-audio');
        this.audioPlayer = document.getElementById('audio-player');
    }

    bindEvents() {
        // Text size controls
        this.decreaseTextBtn.addEventListener('click', () => this.decreaseTextSize());
        this.normalTextBtn.addEventListener('click', () => this.normalTextSize());
        this.increaseTextBtn.addEventListener('click', () => this.increaseTextSize());
        this.pauseAudioBtn.addEventListener('click', () => this.pauseAllAudio());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupAccessibility() {
        // Add ARIA labels and roles
        this.pauseAudioBtn.setAttribute('role', 'button');
        
        // Announce page load
        this.announceToScreenReader('Trang hướng dẫn sử dụng đã tải xong. Cuộn xuống để nghe hướng dẫn chi tiết.');
    }

    handleKeyboardShortcuts(e) {
        // Prevent default for our shortcuts
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        switch (e.key.toLowerCase()) {
            case 'h':
                e.preventDefault();
                window.location.href = '../index.html';
                break;
            case 'd':
                e.preventDefault();
                window.location.href = 'dictionary.html';
                break;
            case 'escape':
                e.preventDefault();
                this.pauseAllAudio();
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.increaseTextSize();
                break;
            case '-':
                e.preventDefault();
                this.decreaseTextSize();
                break;
            case '0':
                e.preventDefault();
                this.normalTextSize();
                break;
            case ' ':
                e.preventDefault();
                this.pauseAllAudio();
                break;
        }
    }

    loadAudioTexts() {
        this.audioTexts = {
            'intro': `Chào mừng đến với hướng dẫn sử dụng Từ Điển Đa Ngữ. Trang này sẽ hướng dẫn bạn cách sử dụng ứng dụng một cách hiệu quả nhất.`,
            
            'basic-usage': `Cách sử dụng cơ bản. Nhập từ cần tra cứu vào ô tìm kiếm và chọn ngôn ngữ nguồn và đích. Nhấn nút loa để nghe phát âm của từ vựng. Kiểm tra các từ đã tra cứu trước đó trong phần lịch sử.`,
            
            'shortcuts': `Phím tắt hữu ích. Phím D để chuyển đến trang từ điển. Phím H để về trang chủ. Phím G để mở hướng dẫn sử dụng. Phím P để phát hoặc tạm dừng audio. Phím cộng để tăng kích thước chữ. Phím trừ để giảm kích thước chữ. Phím 0 để đặt kích thước chữ về bình thường.`,
            
            'features': `Tính năng nổi bật. Hỗ trợ 8 ngôn ngữ bao gồm tiếng Việt, tiếng Anh, tiếng Nhật, tiếng Hàn, tiếng Trung, tiếng Pháp, tiếng Đức, tiếng Tây Ban Nha. Phát âm tự động bằng giọng nói tiếng Việt tự nhiên. Lưu trữ 20 từ tra cứu gần nhất. 6 cấp độ kích thước chữ từ nhỏ đến khổng lồ. Thân thiện với screen reader và có thể sử dụng hoàn toàn bằng bàn phím.`,
            
            'tips': `Mẹo sử dụng. Sử dụng phím tắt để điều hướng nhanh chóng và hiệu quả hơn. Luôn nghe phát âm để học cách đọc từ vựng chính xác. Tăng kích thước chữ nếu cần thiết để dễ đọc hơn. Kiểm tra lịch sử để ôn lại các từ đã học.`
        };
    }

    initializeAudioPlayers() {
        const audioSections = [
            { id: 'intro', title: 'Giới thiệu' },
            { id: 'basic-usage', title: 'Cách sử dụng cơ bản' },
            { id: 'shortcuts', title: 'Phím tắt' },
            { id: 'features', title: 'Tính năng nổi bật' },
            { id: 'tips', title: 'Mẹo sử dụng' }
        ];

        audioSections.forEach(section => {
            const container = document.getElementById(`audio-player-${section.id}`);
            if (container) {
                this.audioPlayers[section.id] = new AudioPlayer(container, section.id, section.title);
            }
        });

        // Auto-play first audio (intro) immediately
        if (this.audioPlayers['intro']) {
            this.audioPlayers['intro'].play();
        }
    }


    setupScrollAudioSync() {
        const sections = Array.from(document.querySelectorAll('[data-audio]'));
        if (!sections.length) return;

        const visibilityMap = new Map();

        const setActiveSection = (audioId) => {
            if (!audioId || this.currentAudioSection === audioId) return;

            // Pause all other sections
            Object.entries(this.audioPlayers).forEach(([id, player]) => {
                if (id !== audioId && player && player.isAudioPlaying && player.isAudioPlaying()) {
                    player.pause();
                }
            });

            const targetPlayer = this.audioPlayers[audioId];
            if (targetPlayer && targetPlayer.play) {
                this.currentAudioSection = audioId;
                targetPlayer.play();
                this.isPlaying = true;
                this.updateAudioButton();
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const audioId = entry.target.getAttribute('data-audio');
                visibilityMap.set(audioId, entry.isIntersecting ? entry.intersectionRatio : 0);
            });

            // Pick the most visible intersecting section
            let bestId = null;
            let bestRatio = 0;
            visibilityMap.forEach((ratio, id) => {
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    bestId = id;
                }
            });

            // Only switch when visibility is meaningful
            if (bestId && bestRatio > 0.25) {
                setActiveSection(bestId);
            }
        }, {
            root: null,
            rootMargin: '0px 0px -35% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        });

        sections.forEach((sec) => observer.observe(sec));
    }

    pauseAllAudio() {
        // Pause all audio players
        Object.values(this.audioPlayers).forEach(player => {
            if (player.isAudioPlaying()) {
                player.pause();
            }
        });
        
        // Cancel any speech synthesis
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        this.isPlaying = false;
        this.updateAudioButton();
        this.announceToScreenReader('Đã tạm dừng tất cả audio');
    }

    updateAudioButton() {
        const icon = this.pauseAudioBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            this.pauseAudioBtn.setAttribute('aria-label', 'Tạm dừng audio');
        } else {
            icon.className = 'fas fa-pause';
            this.pauseAudioBtn.setAttribute('aria-label', 'Tạm dừng audio');
        }
    }

    decreaseTextSize() {
        if (this.currentTextSizeIndex > 0) {
            this.currentTextSizeIndex--;
            this.updateTextSize();
            this.announceToScreenReader(`Kích thước chữ: ${this.getTextSizeName()}`);
        }
    }

    normalTextSize() {
        this.currentTextSizeIndex = 1; // normal
        this.updateTextSize();
        this.announceToScreenReader('Đã đặt kích thước chữ về bình thường');
    }

    increaseTextSize() {
        if (this.currentTextSizeIndex < this.textSizeLevels.length - 1) {
            this.currentTextSizeIndex++;
            this.updateTextSize();
            this.announceToScreenReader(`Kích thước chữ: ${this.getTextSizeName()}`);
        }
    }

    updateTextSize() {
        // Remove all text size classes
        document.body.classList.remove('text-small', 'text-large', 'text-extra-large', 'text-huge', 'text-giant');
        
        // Add current text size class
        const currentSize = this.textSizeLevels[this.currentTextSizeIndex];
        this.currentTextSize = currentSize;
        
        if (currentSize !== 'normal') {
            document.body.classList.add(`text-${currentSize}`);
        }
    }

    getTextSizeName() {
        const names = {
            'small': 'Nhỏ',
            'normal': 'Bình thường',
            'large': 'Lớn',
            'extra-large': 'Rất lớn',
            'huge': 'Cực lớn',
            'giant': 'Khổng lồ'
        };
        return names[this.currentTextSize] || 'Bình thường';
    }

    announceToScreenReader(message) {
        // Create a temporary element for screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.guideApp = new GuideApp();
    
    // Add some additional accessibility features
    document.addEventListener('keydown', (e) => {
        // Alt + H to go home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = '../index.html';
        }
        
        // Alt + D to go to dictionary
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            window.location.href = 'dictionary.html';
        }
    });
    
    // Announce keyboard shortcuts
    console.log('Keyboard shortcuts: H (home), D (dictionary), +/- (text size), 0 (normal size), Space (pause audio)');
});

// Service Worker registration for future PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker will be added in future updates
        console.log('Service Worker support detected');
    });
}