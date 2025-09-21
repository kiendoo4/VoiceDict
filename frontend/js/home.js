// Home Page JavaScript
class HomeApp {
    constructor() {
        this.audioElement = null; // No longer needed, using AudioPlayer
        this.isPlaying = false;
        this.currentTextSize = 'normal';
        this.textSizeLevels = ['normal', 'small', 'large', 'extra-large', 'huge', 'giant'];
        this.currentTextSizeIndex = 1; // normal is index 1
        
        this.initializeElements();
        this.bindEvents();
        this.setupAccessibility();
        this.initializeAudioPlayer();
    }

    initializeElements() {
        // Main elements
        this.playIntroBtn = document.getElementById('play-intro');
        this.goToDictionaryBtn = document.getElementById('go-to-dictionary');
        this.learnShortcutsBtn = document.getElementById('learn-shortcuts');
        this.shortcutsModal = document.getElementById('shortcuts-modal');
        this.closeModalBtn = document.getElementById('close-modal');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Control panel elements
        this.decreaseTextBtn = document.getElementById('decrease-text');
        this.normalTextBtn = document.getElementById('normal-text');
        this.increaseTextBtn = document.getElementById('increase-text');
        this.pauseAudioBtn = document.getElementById('pause-audio');
    }

    bindEvents() {
        // Audio controls
        if (this.playIntroBtn) {
            this.playIntroBtn.addEventListener('click', () => this.toggleAudio());
        }
        if (this.pauseAudioBtn) {
            this.pauseAudioBtn.addEventListener('click', () => this.pauseAudio());
        }

        // Navigation
        if (this.goToDictionaryBtn) {
            this.goToDictionaryBtn.addEventListener('click', () => this.goToDictionary());
        }
        if (this.learnShortcutsBtn) {
            this.learnShortcutsBtn.addEventListener('click', () => this.showShortcuts());
        }

        // Modal controls
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.hideShortcuts());
        }
        if (this.shortcutsModal) {
            this.shortcutsModal.addEventListener('click', (e) => {
                if (e.target === this.shortcutsModal) {
                    this.hideShortcuts();
                }
            });
        }

        // Text size controls
        if (this.decreaseTextBtn) {
            this.decreaseTextBtn.addEventListener('click', () => this.decreaseTextSize());
        }
        if (this.normalTextBtn) {
            this.normalTextBtn.addEventListener('click', () => this.normalTextSize());
        }
        if (this.increaseTextBtn) {
            this.increaseTextBtn.addEventListener('click', () => this.increaseTextSize());
        }

        // Audio events
        if (this.audioElement) {
            this.audioElement.addEventListener('play', () => this.onAudioPlay());
            this.audioElement.addEventListener('pause', () => this.onAudioPause());
            this.audioElement.addEventListener('ended', () => this.onAudioEnded());
            this.audioElement.addEventListener('error', () => this.onAudioError());
        }
    }

    setupAccessibility() {
        // Add ARIA labels and roles
        if (this.playIntroBtn) {
            this.playIntroBtn.setAttribute('role', 'button');
        }
        if (this.goToDictionaryBtn) {
            this.goToDictionaryBtn.setAttribute('role', 'button');
        }
        if (this.learnShortcutsBtn) {
            this.learnShortcutsBtn.setAttribute('role', 'button');
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Announce page load
        const isMac = this.isMacOS();
        const modifier = isMac ? 'Cmd' : 'Ctrl';
        this.announceToScreenReader(`Trang chủ đã tải xong. Nhấn ${modifier}+D để chuyển đến từ điển, ${modifier}+P để phát audio giới thiệu, ${modifier}+H để xem phím tắt.`);
        
        // Note: Auto-play is disabled due to browser restrictions
        // User needs to click the play button to start audio
    }

    isMacOS() {
        return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }

    handleKeyboardShortcuts(e) {
        const isMac = this.isMacOS();
        
        // Handle platform-specific shortcuts
        if (isMac) {
            // macOS shortcuts (Cmd + key)
            if (e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'd':
                        e.preventDefault();
                        if (this.goToDictionary) this.goToDictionary();
                        break;
                    case 'p':
                        e.preventDefault();
                        console.log('Cmd+P pressed, audioPlayer:', this.audioPlayer);
                        if (this.audioPlayer) {
                            if (this.audioPlayer.isPlaying) {
                                console.log('Pausing audio');
                                this.audioPlayer.pause();
                            } else {
                                console.log('Playing audio');
                                this.audioPlayer.play();
                            }
                        } else if (this.toggleAudio) {
                            console.log('Calling toggleAudio()');
                            this.toggleAudio();
                        }
                        break;
                    case 'h':
                        e.preventDefault();
                        if (this.showShortcuts) this.showShortcuts();
                        break;
                    case 'g':
                        e.preventDefault();
                        window.location.href = 'pages/guide.html';
                        break;
                    case 'c':
                        e.preventDefault();
                        window.location.href = 'pages/contact.html';
                        break;
                    case '+':
                    case '=':
                        e.preventDefault();
                        if (this.increaseTextSize) this.increaseTextSize();
                        break;
                    case '-':
                        e.preventDefault();
                        if (this.decreaseTextSize) this.decreaseTextSize();
                        break;
                    case '0':
                        e.preventDefault();
                        if (this.normalTextSize) this.normalTextSize();
                        break;
                }
            }
        } else {
            // Windows shortcuts (Alt + key)
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'd':
                        e.preventDefault();
                        if (this.goToDictionary) this.goToDictionary();
                        break;
                    case 'p':
                        e.preventDefault();
                        console.log('Ctrl+P pressed, audioPlayer:', this.audioPlayer);
                        if (this.audioPlayer) {
                            if (this.audioPlayer.isPlaying) {
                                console.log('Pausing audio');
                                this.audioPlayer.pause();
                            } else {
                                console.log('Playing audio');
                                this.audioPlayer.play();
                            }
                        } else if (this.toggleAudio) {
                            console.log('Calling toggleAudio()');
                            this.toggleAudio();
                        }
                        break;
                    case 'h':
                        e.preventDefault();
                        if (this.showShortcuts) this.showShortcuts();
                        break;
                    case 'g':
                        e.preventDefault();
                        window.location.href = 'pages/guide.html';
                        break;
                    case 'c':
                        e.preventDefault();
                        window.location.href = 'pages/contact.html';
                        break;
                    case '+':
                    case '=':
                        e.preventDefault();
                        if (this.increaseTextSize) this.increaseTextSize();
                        break;
                    case '-':
                        e.preventDefault();
                        if (this.decreaseTextSize) this.decreaseTextSize();
                        break;
                    case '0':
                        e.preventDefault();
                        if (this.normalTextSize) this.normalTextSize();
                        break;
                }
            }
        }

        // Handle single key shortcuts (no modifier)
        if (!e.altKey && !e.ctrlKey && !e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'escape':
                    e.preventDefault();
                    if (this.hideShortcuts) this.hideShortcuts();
                    break;
            }
        }
    }


    initializeAudioPlayer() {
        console.log('Initializing audio player...');
        const container = document.getElementById('audio-player-home-intro');
        console.log('Container found:', container);
        
        if (container) {
            console.log('Creating AudioPlayer...');
            try {
                this.audioPlayer = new AudioPlayer(container, 'home-intro', 'Giới thiệu trang chủ');
                console.log('AudioPlayer created:', this.audioPlayer);
                
               // Auto-play audio after user interaction
               this.setupFirstAudioPlay();
            } catch (error) {
                console.error('Error creating AudioPlayer:', error);
            }
        } else {
            console.error('Audio player container not found!');
        }
    }

    setupFirstAudioPlay() {
        // Auto-play audio after user interaction
        const playIntro = () => {
            if (this.audioPlayer) {
                console.log('Auto-playing audio after user interaction...');
                this.audioPlayer.play().catch(error => {
                    console.log('Auto-play blocked by browser. Click play button or press Cmd+P (Mac) / Alt+P (Windows) to start.');
                });
            }
            // Remove event listeners after first play
            document.removeEventListener('click', playIntro);
            document.removeEventListener('keydown', playIntro);
        };

        // Listen for first user interaction
        document.addEventListener('click', playIntro, { once: true });
        document.addEventListener('keydown', playIntro, { once: true });
        
        console.log('Audio ready. Click anywhere or press any key to start auto-play.');
    }

    isMacOS() {
        return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }

    async toggleAudio() {
        try {
            if (this.audioPlayer) {
                if (this.audioPlayer.isPlaying) {
                    this.audioPlayer.pause();
                } else {
                    this.audioPlayer.play();
                }
            }
        } catch (error) {
            console.error('Audio error:', error);
            if (this.announceToScreenReader) {
                this.announceToScreenReader('Không thể phát audio.');
            }
        }
    }


    pauseAudio() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
        }
        this.isPlaying = false;
        if (this.updateAudioButton) this.updateAudioButton();
        if (this.announceToScreenReader) this.announceToScreenReader('Đã tạm dừng audio');
    }

    onAudioPlay() {
        this.isPlaying = true;
        if (this.updateAudioButton) this.updateAudioButton();
        if (this.announceToScreenReader) this.announceToScreenReader('Đang phát audio giới thiệu');
    }

    onAudioPause() {
        this.isPlaying = false;
        if (this.updateAudioButton) this.updateAudioButton();
        if (this.announceToScreenReader) this.announceToScreenReader('Đã tạm dừng audio');
    }

    onAudioEnded() {
        this.isPlaying = false;
        if (this.updateAudioButton) this.updateAudioButton();
        if (this.announceToScreenReader) this.announceToScreenReader('Audio giới thiệu đã kết thúc');
    }

    onAudioError() {
        this.isPlaying = false;
        if (this.updateAudioButton) this.updateAudioButton();
        if (this.announceToScreenReader) this.announceToScreenReader('Lỗi khi phát audio.');
    }

    updateAudioButton() {
        if (this.playIntroBtn) {
            const icon = this.playIntroBtn.querySelector('i');
            if (icon) {
                const isPlaying = this.audioPlayer ? this.audioPlayer.isPlaying : false;
                if (isPlaying) {
                    icon.className = 'fas fa-pause';
                    this.playIntroBtn.setAttribute('aria-label', 'Tạm dừng audio giới thiệu');
                } else {
                    icon.className = 'fas fa-play';
                    this.playIntroBtn.setAttribute('aria-label', 'Phát audio giới thiệu');
                }
            }
        }
    }

    goToDictionary() {
        if (this.showLoading) this.showLoading();
        if (this.announceToScreenReader) this.announceToScreenReader('Đang chuyển đến trang từ điển');
        
        // Simulate loading time
        setTimeout(() => {
            window.location.href = 'pages/dictionary.html';
        }, 1000);
    }

    showShortcuts() {
        if (this.shortcutsModal) {
            this.shortcutsModal.style.display = 'flex';
            
            // Update shortcut display based on platform
            this.updateShortcutDisplay();
        }
        if (this.announceToScreenReader) {
            this.announceToScreenReader('Đã mở danh sách phím tắt');
        }
        
        // Focus on close button
        setTimeout(() => {
            if (this.closeModalBtn) {
                this.closeModalBtn.focus();
            }
        }, 100);
    }

    updateShortcutDisplay() {
        const isMac = this.isMacOS();
        const modifier = isMac ? 'Cmd' : 'Alt';
        
        // Update shortcut keys display
        const shortcuts = {
            'shortcut-d': `${modifier}+D`,
            'shortcut-p': `${modifier}+P`,
            'shortcut-h': `${modifier}+H`,
            'shortcut-g': `${modifier}+G`,
            'shortcut-c': `${modifier}+C`,
            'shortcut-plus': `${modifier}++`,
            'shortcut-minus': `${modifier}+-`,
            'shortcut-zero': `${modifier}+0`,
            'shortcut-space': 'Space'
        };
        
        Object.entries(shortcuts).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = key;
            }
        });
    }

    hideShortcuts() {
        if (this.shortcutsModal) {
            this.shortcutsModal.style.display = 'none';
        }
        if (this.announceToScreenReader) {
            this.announceToScreenReader('Đã đóng danh sách phím tắt');
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

    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
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
    window.homeApp = new HomeApp();
    
    // Add some additional accessibility features
    document.addEventListener('keydown', (e) => {
        // Alt + D to go to dictionary
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            window.homeApp.goToDictionary();
        }
        
        // Alt + H to show shortcuts
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.homeApp.showShortcuts();
        }
    });
    
        // Announce keyboard shortcuts
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? 'Cmd' : 'Alt';
        console.log(`Keyboard shortcuts: ${modifier}+D (dictionary), ${modifier}+P (play audio), ${modifier}+H (help), ${modifier}+/+/- (text size), ${modifier}+0 (normal size)`);
});

// Service Worker registration for future PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker will be added in future updates
        console.log('Service Worker support detected');
    });
}