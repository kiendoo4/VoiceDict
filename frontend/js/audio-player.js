// Simple Audio Player Component
class AudioPlayer {
    constructor(container, audioFile, title) {
        console.log('AudioPlayer constructor called with:', { container, audioFile, title });
        
        if (!container) {
            console.error('Container is null or undefined!');
            return;
        }
        
        this.container = container;
        this.audioFile = audioFile;
        this.title = title;
        this.audio = null;
        this.isPlaying = false;
        this.isLoading = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.8;
        this.playbackRate = 1.0;
        
        try {
            this.initializeElements();
            this.bindEvents();
            this.loadAudio();
        } catch (error) {
            console.error('Error in AudioPlayer constructor:', error);
        }
    }

    initializeElements() {
        // Create simple audio player HTML
        this.container.innerHTML = `
            <div class="audio-player">
                <div class="audio-controls">
                    <button class="play-pause-btn" id="play-pause-${this.audioFile}" aria-label="Phát/Tạm dừng">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="audio-progress" id="progress-${this.audioFile}">
                        <div class="audio-progress-bar" id="progress-bar-${this.audioFile}"></div>
                    </div>
                    <div class="audio-time" id="audio-time-${this.audioFile}">0:00 / 0:00</div>
                    <div class="volume-control">
                        <i class="fas fa-volume-up"></i>
                        <input type="range" class="volume-slider" id="volume-${this.audioFile}" 
                               min="0" max="1" step="0.1" value="0.8">
                    </div>
                    <div class="speed-control">
                        <i class="fas fa-tachometer-alt"></i>
                        <input type="range" class="speed-slider" id="speed-${this.audioFile}" 
                               min="0.5" max="2" step="0.1" value="1.0">
                    </div>
                </div>
            </div>
        `;

        // Get references to elements
        this.playerElement = this.container.querySelector('.audio-player');
        this.playPauseBtn = this.container.querySelector(`#play-pause-${this.audioFile}`);
        this.progressContainer = this.container.querySelector(`#progress-${this.audioFile}`);
        this.progressBar = this.container.querySelector(`#progress-bar-${this.audioFile}`);
        this.audioTime = this.container.querySelector(`#audio-time-${this.audioFile}`);
        this.volumeSlider = this.container.querySelector(`#volume-${this.audioFile}`);
        this.speedSlider = this.container.querySelector(`#speed-${this.audioFile}`);

        // Create audio element
        this.audio = new Audio();
        this.audio.preload = 'metadata';
        this.audio.volume = this.volume;
        this.audio.playbackRate = this.playbackRate;
    }

    bindEvents() {
        console.log('Binding events...');
        console.log('PlayPauseBtn:', this.playPauseBtn);
        console.log('ProgressContainer:', this.progressContainer);
        console.log('VolumeSlider:', this.volumeSlider);
        console.log('SpeedSlider:', this.speedSlider);
        
        // Play/Pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        } else {
            console.error('PlayPauseBtn not found!');
        }

        // Progress bar
        if (this.progressContainer) {
            this.progressContainer.addEventListener('click', (e) => this.seekTo(e));
        } else {
            console.error('ProgressContainer not found!');
        }

        // Volume control
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        } else {
            console.error('VolumeSlider not found!');
        }

        // Speed control
        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', (e) => this.setPlaybackRate(e.target.value));
        } else {
            console.error('SpeedSlider not found!');
        }

        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('error', (e) => this.onError(e));
    }

    async loadAudio() {
        try {
            // Load MP3 file only
            const mp3Path = `../assets/audio/mp3/${this.audioFile}.mp3`;
            console.log(`Loading audio from: ${mp3Path}`);
            this.audio.src = mp3Path;
            
            // Set up error handling for MP3
            this.audio.addEventListener('error', (e) => {
                console.error(`Failed to load MP3 for ${this.audioFile}:`, e);
                this.onError(e);
            }, { once: true });
            
        } catch (error) {
            console.error('Error loading audio:', error);
            this.onError(error);
        }
    }



    togglePlayPause() {
        if (this.isLoading) return;

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    async play() {
        try {
            if (!this.audio.src) {
                await this.loadAudio();
            }
            
            await this.audio.play();
            this.isPlaying = true;
            this.updateUI();
        } catch (error) {
            console.error('Error playing audio:', error);
            this.onError(error);
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
    }

    seekTo(event) {
        if (!this.duration) return;

        const rect = this.progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * this.duration;

        this.audio.currentTime = newTime;
        this.updateProgress();
    }

    setVolume(value) {
        this.volume = parseFloat(value);
        this.audio.volume = this.volume;
    }

    setPlaybackRate(value) {
        this.playbackRate = parseFloat(value);
        this.audio.playbackRate = this.playbackRate;
    }

    updateProgress() {
        if (this.duration && this.progressBar) {
            const percentage = (this.currentTime / this.duration) * 100;
            this.progressBar.style.width = percentage + '%';
            // progressHandle is not implemented in current template
            // if (this.progressHandle) {
            //     this.progressHandle.style.left = percentage + '%';
            // }
        }
    }

    updateTimeDisplay() {
        if (!this.audioTime) return;
        
        const currentMinutes = Math.floor(this.currentTime / 60);
        const currentSeconds = Math.floor(this.currentTime % 60);
        const durationMinutes = Math.floor((this.duration || 0) / 60);
        const durationSeconds = Math.floor((this.duration || 0) % 60);

        this.audioTime.textContent = 
            `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    }

    updateUI() {
        const icon = this.playPauseBtn.querySelector('i');
        
        if (this.isLoading) {
            this.playerElement.classList.add('loading');
            icon.className = 'fas fa-spinner fa-spin';
            this.playPauseBtn.disabled = true;
        } else if (this.isPlaying) {
            this.playerElement.classList.remove('loading');
            icon.className = 'fas fa-pause';
            this.playPauseBtn.disabled = false;
            this.playPauseBtn.classList.add('playing');
        } else {
            this.playerElement.classList.remove('loading');
            icon.className = 'fas fa-play';
            this.playPauseBtn.disabled = false;
            this.playPauseBtn.classList.remove('playing');
        }
    }

    handleKeyboard(event) {
        switch (event.key) {
            case ' ':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.audio.currentTime = Math.min(this.duration, this.audio.currentTime + 10);
                break;
        }
    }

    // Event handlers
    onLoadStart() {
        this.isLoading = true;
        this.updateUI();
    }

    onLoadedMetadata() {
        this.duration = this.audio.duration;
        this.isLoading = false;
        this.updateUI();
        this.updateTimeDisplay();
    }

    onTimeUpdate() {
        this.currentTime = this.audio.currentTime;
        this.updateProgress();
        this.updateTimeDisplay();
    }

    onEnded() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.updateUI();
        this.updateProgress();
        this.updateTimeDisplay();
    }

    onError(error) {
        console.error('Audio error:', error);
        this.isLoading = false;
        this.isPlaying = false;
        this.playerElement.classList.add('error');
        this.updateUI();
    }

    onCanPlay() {
        this.isLoading = false;
        this.updateUI();
    }

    // Public methods
    destroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
        }
        this.container.innerHTML = '';
    }

    getCurrentTime() {
        return this.currentTime;
    }

    getDuration() {
        return this.duration;
    }

    isAudioPlaying() {
        return this.isPlaying;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioPlayer;
}