// Dictionary Page JavaScript
class DictionaryApp {
  constructor() {
    this.searchHistory = JSON.parse(localStorage.getItem("dictionaryHistory") || "[]");
    this.currentSearch = "";
    this.isVoiceEnabled = false;
    this.currentTextSize = "normal";
    this.textSizeLevels = ["normal", "small", "large", "extra-large", "huge", "giant"];
    this.currentTextSizeIndex = 1; // normal is index 1

    // Flow state
    this.currentStep = 1;
    this.selectedSourceLang = "vi";
    this.selectedTargetLang = "en";
    this.selectedInputMethod = "keyboard"; // 'keyboard' or 'voice'
    this.languageNames = {
      vi: "Tiếng Việt",
      en: "Tiếng Anh",
      ja: "Tiếng Nhật",
      ko: "Tiếng Hàn",
      zh: "Tiếng Trung",
      fr: "Tiếng Pháp",
      de: "Tiếng Đức",
      es: "Tiếng Tây Ban Nha",
    };

    this.initializeElements();
    this.bindEvents();
    this.loadHistory();
    this.setupAccessibility();
    this.initializeFlow();
    this.initializeAudioPlayer();

    // Auto-enable mock data if running from file:// protocol
    this.checkProtocolAndEnableMockData();
  }

  initializeElements() {
    // Flow elements
    this.flowSteps = document.querySelectorAll(".flow-step");
    this.progressSteps = document.querySelectorAll(".progress-step");
    this.languageOptions = document.querySelectorAll(".language-option");
    this.backButtons = document.querySelectorAll(".back-btn");

    // Main elements
    this.searchInput = document.getElementById("search-input");
    this.searchButton = document.getElementById("search-button");
    this.voiceButton = document.getElementById("voice-input-button"); // This might not exist in new layout
    this.resultsSection = document.getElementById("results-section");
    this.resultsContent = document.getElementById("results-content");
    this.historyList = document.getElementById("history-list");
    this.clearHistoryBtn = document.getElementById("clear-history");
    this.loadingOverlay = document.getElementById("loading-overlay");
    this.audioPlayer = document.getElementById("audio-player");

    // Navigation elements (not present in new flow design)
    // this.backToHomeBtn = document.getElementById('back-to-home');
    // this.helpBtn = document.getElementById('help-btn');
    // this.helpModal = document.getElementById('help-modal');
    // this.closeHelpModalBtn = document.getElementById('close-help-modal');

    // Control panel elements
    this.decreaseTextBtn = document.getElementById("decrease-text");
    this.normalTextBtn = document.getElementById("normal-text");
    this.increaseTextBtn = document.getElementById("increase-text");
    this.pauseAudioBtn = document.getElementById("pause-audio");

    // Quick search buttons
    this.quickButtons = document.querySelectorAll(".quick-btn");

    // Flow specific elements
    this.selectedSourceLangName = document.getElementById("selected-source-lang-name");
    this.translationFrom = document.getElementById("translation-from");
    this.translationTo = document.getElementById("translation-to");
    this.translationFromStep3 = document.getElementById("translation-from-step3");
    this.translationToStep3 = document.getElementById("translation-to-step3");
    this.step4Description = document.getElementById("step4-description");

    // Voice input elements
    this.keyboardLayout = document.getElementById("keyboard-layout");
    this.voiceLayout = document.getElementById("voice-layout");
    this.voiceToggleButton = document.getElementById("voice-toggle-button");
    this.voiceSearchButton = document.getElementById("voice-search-button");
    this.voiceClearButton = document.getElementById("voice-clear-button");
    this.voiceStatus = document.getElementById("voice-status");
    this.voiceResult = document.getElementById("voice-result");
    this.voiceContent = document.getElementById("voice-content");
    this.voiceText = document.getElementById("voice-text");
    this.voiceIcon = document.getElementById("voice-icon");
    this.voiceToggleIcon = document.getElementById("voice-toggle-icon");
    this.voiceToggleText = document.getElementById("voice-toggle-text");

    // Voice recording state
    this.isRecording = false;
  }

  // Bind input method events dynamically
  bindInputMethodEvents() {
    // Query for input method options every time this is called
    const inputMethodOptions = document.querySelectorAll(".input-method-option");
    console.log("Binding input method events, found options:", inputMethodOptions.length);

    inputMethodOptions.forEach((option) => {
      console.log("Binding events to option:", option);

      // Remove existing listeners to prevent duplicates
      option.removeEventListener("click", this.inputMethodClickHandler);
      option.removeEventListener("keypress", this.inputMethodKeyHandler);

      // Add new listeners
      this.inputMethodClickHandler = (e) => this.selectInputMethod(e);
      this.inputMethodKeyHandler = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectInputMethod(e);
        }
      };

      option.addEventListener("click", this.inputMethodClickHandler);
      option.addEventListener("keypress", this.inputMethodKeyHandler);
    });
  }

  bindEvents() {
    // Flow events
    this.languageOptions.forEach((option) => {
      option.addEventListener("click", (e) => this.selectLanguage(e));
      option.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectLanguage(e);
        }
      });
    });

    // Input method options - QUAN TRỌNG: Bind events dynamically vì có thể chưa có trong DOM
    this.bindInputMethodEvents();

    // Back button events
    this.backButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.goBack(e));
    });

    if (this.searchButton) {
      this.searchButton.addEventListener("click", () => this.handleCustomSearch());
    }
    if (this.searchInput) {
      this.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleCustomSearch();
        }
      });
    }

    // Voice input (placeholder for future STT integration)
    // Note: voiceButton might not exist in new layout
    if (this.voiceButton) {
      this.voiceButton.addEventListener("click", () => this.toggleVoiceInput());
    }

    // Quick search buttons
    if (this.quickButtons && this.quickButtons.length > 0) {
      this.quickButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const word = e.target.getAttribute("data-word");
          if (this.searchInput) {
            this.searchInput.value = word;
            this.handleCustomSearch();
          }
        });
      });
    }

    // Clear history
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener("click", () => this.clearHistory());
    }

    // Navigation
    if (this.backToHomeBtn) {
      this.backToHomeBtn.addEventListener("click", () => this.goToHome());
    }
    if (this.helpBtn) {
      this.helpBtn.addEventListener("click", () => this.showHelp());
    }
    if (this.closeHelpModalBtn) {
      this.closeHelpModalBtn.addEventListener("click", () => this.hideHelp());
    }
    if (this.helpModal) {
      this.helpModal.addEventListener("click", (e) => {
        if (e.target === this.helpModal) {
          this.hideHelp();
        }
      });
    }

    // Text size controls
    if (this.decreaseTextBtn) {
      this.decreaseTextBtn.addEventListener("click", () => this.decreaseTextSize());
    }
    if (this.normalTextBtn) {
      this.normalTextBtn.addEventListener("click", () => this.normalTextSize());
    }
    if (this.increaseTextBtn) {
      this.increaseTextBtn.addEventListener("click", () => this.increaseTextSize());
    }
    if (this.pauseAudioBtn) {
      this.pauseAudioBtn.addEventListener("click", () => this.pauseAllAudio());
    }

    // Input validation
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.validateInput(e.target.value);
      });
    }

    // Voice input events
    if (this.voiceToggleButton) {
      this.voiceToggleButton.addEventListener("click", () => this.toggleVoiceRecording());
    }
    if (this.voiceSearchButton) {
      this.voiceSearchButton.addEventListener("click", () => this.searchVoiceInput());
    }
    if (this.voiceClearButton) {
      this.voiceClearButton.addEventListener("click", () => this.clearVoiceInput());
    }
  }

  setupAccessibility() {
    // Add ARIA labels and roles
    if (this.searchInput) {
      this.searchInput.setAttribute("role", "searchbox");
    }
    if (this.resultsSection) {
      this.resultsSection.setAttribute("role", "region");
      this.resultsSection.setAttribute("aria-live", "polite");
      this.resultsSection.setAttribute("aria-label", "Kết quả tra cứu từ điển");
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  handleKeyboardShortcuts(e) {
    // Prevent default for our shortcuts
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    // If user is typing in input field, only allow Escape to blur
    if (document.activeElement === this.searchInput) {
      if (e.key === "Escape") {
        e.preventDefault();
        this.searchInput.blur();
        this.announceToScreenReader("Đã thoát khỏi ô nhập liệu");
      }
      return; // Disable all other shortcuts when typing
    }

    // Flow-specific shortcuts
    if (this.currentStep === 1 || this.currentStep === 2) {
      // Number keys 1-8 for language selection
      if (e.key >= "1" && e.key <= "8") {
        e.preventDefault();
        const keyNum = parseInt(e.key);
        console.log(`Key ${keyNum} pressed in step ${this.currentStep}`);

        // Find language option in the current step
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const languageOption = currentStepElement
          ? currentStepElement.querySelector(`[data-key="${keyNum}"]`)
          : document.querySelector(`[data-key="${keyNum}"]`);

        if (languageOption) {
          console.log(`Found language option:`, languageOption);
          this.selectLanguage({ target: languageOption });
        } else {
          console.log(`Language option with key ${keyNum} not found in step ${this.currentStep}`);
        }
        return;
      }

      // Enter to confirm selection - CHỈ khi có selection
      if (e.key === "Enter") {
        e.preventDefault();
        console.log(`Enter pressed in step ${this.currentStep}`);

        // Kiểm tra xem có ngôn ngữ nào được chọn không
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const selectedOption = currentStepElement
          ? currentStepElement.querySelector(".language-option.selected")
          : null;

        if (selectedOption) {
          console.log(`Confirming selection in step ${this.currentStep}`);
          this.confirmLanguageSelection();
        } else {
          console.log(`No language selected in step ${this.currentStep}, not confirming`);
          this.announceToScreenReader("Vui lòng chọn một ngôn ngữ trước khi nhấn Enter");
        }
        return;
      }
    }

    if (this.currentStep === 3) {
      // Number keys 1-2 for input method selection
      if (e.key >= "1" && e.key <= "2") {
        e.preventDefault();
        const keyNum = parseInt(e.key);
        console.log(`Key ${keyNum} pressed in step ${this.currentStep}`);

        // Find input method option in the current step
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const inputMethodOption = currentStepElement
          ? currentStepElement.querySelector(`[data-key="${keyNum}"]`)
          : document.querySelector(`[data-key="${keyNum}"]`);

        if (inputMethodOption) {
          console.log(`Found input method option:`, inputMethodOption);
          this.selectInputMethod({ target: inputMethodOption });
        } else {
          console.log(`Input method option with key ${keyNum} not found in step ${this.currentStep}`);
        }
        return;
      }

      // Enter to confirm selection - CHỈ khi có selection
      if (e.key === "Enter") {
        e.preventDefault();
        console.log(`Enter pressed in step ${this.currentStep}`);

        // Kiểm tra xem có input method nào được chọn không
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const selectedOption = currentStepElement
          ? currentStepElement.querySelector(".input-method-option.selected")
          : null;

        if (selectedOption) {
          console.log(`Confirming input method selection in step ${this.currentStep}`);
          this.confirmInputMethodSelection();
        } else {
          console.log(`No input method selected in step ${this.currentStep}, not confirming`);
          this.announceToScreenReader("Vui lòng chọn phương thức nhập trước khi nhấn Enter");
        }
        return;
      }
    }

    if (this.currentStep === 4) {
      // Voice input shortcuts
      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        // Toggle voice recording
        if (this.voiceToggleButton) {
          this.voiceToggleButton.click();
        }
        return;
      }

      // Voice input control shortcuts
      if (this.isRecording) {
        if (e.key === "Escape") {
          e.preventDefault();
          // Stop recording
          if (this.voiceToggleButton) {
            this.voiceToggleButton.click();
          }
          return;
        }
      }

      // Quick search shortcuts (only for keyboard input when not typing)
      if (this.selectedInputMethod === "keyboard" && ["q", "w", "e", "r"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        const quickBtn = document.querySelector(`[data-key="${e.key.toLowerCase()}"]`);
        if (quickBtn) {
          const word = quickBtn.getAttribute("data-word");
          this.searchInput.value = word;
          this.handleCustomSearch();
        }
        return;
      }

      // Enter trong step 4 chỉ để search, KHÔNG quay về step 1
      if (e.key === "Enter") {
        // CHỈ xử lý Enter nếu focus không ở search input (đã được xử lý ở trên)
        if (document.activeElement !== this.searchInput) {
          e.preventDefault();
          console.log(`Enter pressed in step 4, focusing search input`);
          if (this.searchInput) {
            this.searchInput.focus();
          }
        }
        return;
      }
    }

    // Audio player arrow keys
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (this.audioPlayer && this.audioPlayer.audio) {
        // Seek backward 10 seconds
        const newTime = Math.max(0, this.audioPlayer.audio.currentTime - 10);
        this.audioPlayer.audio.currentTime = newTime;
      } else {
        this.goBack();
      }
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (this.audioPlayer && this.audioPlayer.audio) {
        // Seek forward 10 seconds
        const newTime = Math.min(this.audioPlayer.audio.duration || 0, this.audioPlayer.audio.currentTime + 10);
        this.audioPlayer.audio.currentTime = newTime;
      }
      return;
    }

    // Back button shortcut
    if (e.key === "Backspace") {
      e.preventDefault();
      this.goBack();
      return;
    }

    // Audio player shortcuts
    if (e.key === " ") {
      e.preventDefault();
      if (this.audioPlayer) {
        if (this.audioPlayer.isPlaying) {
          this.audioPlayer.pause();
        } else {
          this.audioPlayer.play();
        }
      }
      return;
    }

    // Global shortcuts (không specific theo step)
    switch (e.key.toLowerCase()) {
      case "h":
        e.preventDefault();
        this.goToHome();
        break;
      case "escape":
        e.preventDefault();
        this.hideResults();
        this.hideHelp();
        break;
      case "+":
      case "=":
        e.preventDefault();
        this.increaseTextSize();
        break;
      case "-":
        e.preventDefault();
        this.decreaseTextSize();
        break;
      case "0":
        e.preventDefault();
        this.normalTextSize();
        break;
    }
  }

  validateInput(value) {
    // Basic input validation
    const cleanValue = value.trim();
    if (cleanValue.length > 0) {
      this.searchButton.disabled = false;
      this.searchButton.setAttribute("aria-label", `Tìm kiếm từ "${cleanValue}"`);
    } else {
      this.searchButton.disabled = true;
      this.searchButton.setAttribute("aria-label", "Tìm kiếm");
    }
  }

  // Custom search handler that searches from dictionary files
  async handleCustomSearch() {
    const searchTerm = this.searchInput ? this.searchInput.value.trim() : "";

    console.log("=== THÔNG TIN TÌM KIẾM ===");
    console.log(
      "Ngôn ngữ nguồn:",
      this.selectedSourceLang ? this.getLanguageName(this.selectedSourceLang) : "Chưa chọn"
    );
    console.log(
      "Ngôn ngữ đích:",
      this.selectedTargetLang ? this.getLanguageName(this.selectedTargetLang) : "Chưa chọn"
    );
    console.log(
      "Phương thức nhập:",
      this.selectedInputMethod ? (this.selectedInputMethod === "keyboard" ? "Bàn phím" : "Giọng nói") : "Chưa chọn"
    );
    console.log("Từ cần tìm:", searchTerm || "Chưa nhập");
    console.log("Mã ngôn ngữ nguồn:", this.selectedSourceLang);
    console.log("Mã ngôn ngữ đích:", this.selectedTargetLang);
    console.log("========================");

    // Kiểm tra điều kiện trước khi tìm kiếm
    if (!this.selectedSourceLang) {
      alert("Vui lòng chọn ngôn ngữ nguồn trước!");
      return;
    }

    if (!this.selectedTargetLang) {
      alert("Vui lòng chọn ngôn ngữ đích trước!");
      return;
    }

    if (!this.selectedInputMethod) {
      alert("Vui lòng chọn phương thức nhập trước!");
      return;
    }

    if (!searchTerm) {
      alert("Vui lòng nhập từ cần tìm kiếm!");
      if (this.searchInput) this.searchInput.focus();
      return;
    }

    // Thực hiện tìm kiếm từ dictionary files
    console.log("🔍 Đang tìm kiếm...");
    console.log(
      `Tìm từ "${searchTerm}" từ ${this.getLanguageName(this.selectedSourceLang)} sang ${this.getLanguageName(
        this.selectedTargetLang
      )}`
    );

    await this.searchFromDictionaryFiles(searchTerm);
  }

  // Search from dictionary files in data/dictionaries
  async searchFromDictionaryFiles(searchTerm) {
    this.showLoading();

    try {
      // Sử dụng path đã test thành công
      const basePath = `http://127.0.0.1:8080/data/dictionaries/`;
      const excelFileName = `${this.selectedSourceLang}-${this.selectedTargetLang}.xlsx`;
      let results = null;

      const excelPath = `${basePath}${excelFileName}`;
      console.log(`📂 Trying primary file: ${excelPath}`);
      results = await this.loadFromExcel(excelPath, searchTerm);

      if (results && results.length > 0) {
        console.log(`✅ Found ${results.length} results from Excel files`);
        this.displayResults(results);
        this.addToHistory(searchTerm, this.selectedSourceLang, this.selectedTargetLang);
        this.announceToScreenReader(`Tìm thấy ${results.length} kết quả cho từ "${searchTerm}"`);
      } else {
        console.log(`📋 No results from Excel files, trying mock data...`);
        // Thử mock data nếu không tìm thấy file
        const mockResults = await this.searchWithMockData(searchTerm, this.selectedSourceLang, this.selectedTargetLang);

        if (mockResults && mockResults.length > 0) {
          console.log(`✅ Found ${mockResults.length} results from mock data`);
          this.displayResults(mockResults);
          this.addToHistory(searchTerm, this.selectedSourceLang, this.selectedTargetLang);
          this.announceToScreenReader(`Tìm thấy ${mockResults.length} kết quả cho từ "${searchTerm}"`);
        } else {
          console.log(`❌ No results found anywhere for "${searchTerm}"`);
          this.showError(`
            Không tìm thấy từ điển cho ${this.getLanguageName(this.selectedSourceLang)} - ${this.getLanguageName(
            this.selectedTargetLang
          )}
            <br><br>
            <strong>Tìm kiếm:</strong> "${searchTerm}"<br>
            <strong>File cần:</strong> ${excelFileName}<br><br>
            
            <button onclick="app.useMockData()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              🔄 Sử dụng Mock Data
            </button>
          `);
          this.displayResults([]);
          this.announceToScreenReader(`Không tìm thấy kết quả cho từ "${searchTerm}"`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      this.showError(`Không thể tìm kiếm từ này. Lỗi: ${error.message}`);
      this.announceToScreenReader("Lỗi khi tìm kiếm từ");
    } finally {
      this.hideLoading();
    }
  }

  // Load and search from Excel file
  async loadFromExcel(filePath, searchTerm, isReverse = false) {
    try {
      if (typeof XLSX === "undefined") {
        console.log("⚠️ Thư viện XLSX chưa được load");
        return null;
      }

      console.log(`🔍 Attempting to load: ${filePath}`);
      console.log(`📍 Full URL would be: ${new URL(filePath, window.location.href).href}`);

      const response = await fetch(filePath);
      console.log(`📡 Response status: ${response.status} - ${response.statusText}`);
      console.log(`📡 Response ok: ${response.ok}`);
      console.log(`📡 Response headers:`, response.headers);

      if (!response.ok) {
        console.log(`❌ File not accessible: ${filePath} (${response.status})`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`📊 File size: ${arrayBuffer.byteLength} bytes`);

      if (arrayBuffer.byteLength === 0) {
        console.log(`❌ File is empty: ${filePath}`);
        return null;
      }

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      console.log(`📋 Workbook sheets:`, workbook.SheetNames);

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log(`📊 Data rows: ${jsonData.length}`);
      if (jsonData.length > 0) {
        console.log(`📋 Sample row:`, jsonData[0]);
      }

      if (jsonData.length === 0) {
        console.log(`❌ No data in Excel file: ${filePath}`);
        return null;
      }

      const results = this.searchInExcelData(jsonData, searchTerm, isReverse);
      console.log(`🎯 Search results: ${results ? results.length : 0} found`);
      return results;
    } catch (error) {
      console.log(`❌ Error loading Excel: ${error.message}`);
      console.log(`❌ Error stack:`, error.stack);
      return null;
    }
  }

  // Search in Excel data
  searchInExcelData(rows, searchTerm, isReverse = false) {
    const results = [];
    const searchLower = searchTerm.toLowerCase();

    // Tự động detect cột source và target
    const possibleSourceCols = ["Source", "source", "từ_nguồn", "tu_nguon", "headword", "word", "Từ nguồn"];
    const possibleTargetCols = ["Target", "target", "từ_đích", "tu_dich", "definition", "nghia", "nghĩa", "Từ đích"];
    const possibleTypeCols = ["Type", "type", "từ_loại", "tu_loai", "pos", "Từ loại"];
    const possiblePronunCols = ["Pronunciation", "pronunciation", "phát_âm", "phat_am", "Phát âm"];

    const headers = Object.keys(rows[0]);
    const sourceCol = possibleSourceCols.find((col) => headers.includes(col)) || headers[0];
    const targetCol = possibleTargetCols.find((col) => headers.includes(col)) || headers[1];
    const typeCol = possibleTypeCols.find((col) => headers.includes(col)) || headers[2];
    const pronunCol = possiblePronunCols.find((col) => headers.includes(col)) || "";

    for (const row of rows) {
      let sourceText = String(row[sourceCol] || "");
      let targetText = String(row[targetCol] || "");

      // Nếu là reverse search, đổi chỗ
      if (isReverse) {
        [sourceText, targetText] = [targetText, sourceText];
      }

      // Tìm kiếm (case-insensitive, partial match)
      if (sourceText.toLowerCase().includes(searchLower)) {
        results.push({
          word: sourceText,
          pronunciation: String(row[pronunCol] || "") || `/${sourceText}/`,
          definitions: [
            {
              text: targetText,
              example: "",
              partOfSpeech: String(row[typeCol] || ""),
            },
          ],
          audioUrl: null,
          score: this.calculateMatchScore(sourceText, searchTerm),
        });
      }
    }

    // Sort theo điểm số (exact match trước, partial match sau)
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10); // Giới hạn 10 kết quả đầu tiên
  }

  // Calculate match score for sorting
  calculateMatchScore(sourceText, searchTerm) {
    const source = sourceText.toLowerCase();
    const search = searchTerm.toLowerCase();

    if (source === search) return 100; // Exact match
    if (source.startsWith(search)) return 80; // Starts with
    if (source.endsWith(search)) return 60; // Ends with
    if (source.includes(search)) return 40; // Contains
    return 0; // No match
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) {
      this.announceToScreenReader("Vui lòng nhập từ cần tra cứu");
      return;
    }

    this.currentSearch = query;
    this.showLoading();

    try {
      // Simulate API call (replace with actual dictionary API)
      const results = await this.mockDictionarySearch(query, this.selectedSourceLang, this.selectedTargetLang);

      this.displayResults(results);
      this.addToHistory(query, this.selectedSourceLang, this.selectedTargetLang);
      this.announceToScreenReader(`Tìm thấy ${results.length} kết quả cho từ "${query}"`);
    } catch (error) {
      this.showError("Không thể tìm thấy từ này. Vui lòng thử lại.");
      this.announceToScreenReader("Lỗi khi tìm kiếm từ");
    } finally {
      this.hideLoading();
    }
  }

  async mockDictionarySearch(query, fromLang, toLang) {
    // Mock data for demonstration
    // In real implementation, this would call a dictionary API
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    const mockResults = [
      {
        word: query,
        pronunciation: this.getMockPronunciation(query, fromLang),
        definitions: [
          {
            text: this.getMockDefinition(query, fromLang, toLang),
            example: this.getMockExample(query, fromLang, toLang),
            partOfSpeech: "noun",
          },
        ],
        audioUrl: null, // Will be populated when TTS is implemented
      },
    ];

    return mockResults;
  }

  getMockPronunciation(word, lang) {
    const pronunciations = {
      vi: `/${word}/`,
      en: `/${word}/`,
      ja: `/${word}/`,
      ko: `/${word}/`,
      zh: `/${word}/`,
      fr: `/${word}/`,
      de: `/${word}/`,
      es: `/${word}/`,
    };
    return pronunciations[lang] || `/${word}/`;
  }

  getMockDefinition(word, fromLang, toLang) {
    const definitions = {
      hello: {
        vi: "Lời chào hỏi thân thiện",
        en: "A friendly greeting",
        ja: "親しみやすい挨拶",
        ko: "친근한 인사",
        zh: "友好的问候",
        fr: "Une salutation amicale",
        de: "Ein freundlicher Gruß",
        es: "Un saludo amigable",
      },
      "xin chào": {
        en: "Hello, greeting",
        vi: "Lời chào hỏi",
        ja: "こんにちは、挨拶",
        ko: "안녕하세요, 인사",
        zh: "你好，问候",
        fr: "Bonjour, salutation",
        de: "Hallo, Gruß",
        es: "Hola, saludo",
      },
    };

    return definitions[word.toLowerCase()]?.[toLang] || `Definition of ${word} in ${toLang}`;
  }

  getMockExample(word, fromLang, toLang) {
    const examples = {
      hello: {
        vi: "Xin chào, bạn có khỏe không?",
        en: "Hello, how are you?",
        ja: "こんにちは、元気ですか？",
        ko: "안녕하세요, 어떻게 지내세요?",
        zh: "你好，你好吗？",
        fr: "Bonjour, comment allez-vous ?",
        de: "Hallo, wie geht es dir?",
        es: "Hola, ¿cómo estás?",
      },
    };

    return examples[word.toLowerCase()]?.[toLang] || `Example sentence with ${word}`;
  }

  displayResults(results, searchTerm = "") {
    this.resultsContent.innerHTML = "";
    if (results.length === 0) {
      this.resultsContent.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" aria-hidden="true"></i>
          <h3>Không tìm thấy kết quả</h3>
          <p>Vui lòng thử với từ khóa khác hoặc kiểm tra chính tả.</p>
        </div>
      `;
    } else {
      results.forEach((result) => {
        const resultElement = this.createResultElement(result, searchTerm);
        this.resultsContent.appendChild(resultElement);
      });
    }
    this.resultsSection.style.display = "block";
    this.resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  createResultElement(result, searchTerm = "") {
    const div = document.createElement("div");
    div.className = "word-result";
    div.setAttribute("role", "article");

    // Highlight searchTerm in result.word
    let wordHtml = result.word;
    if (searchTerm && result.word.toLowerCase().includes(searchTerm.toLowerCase())) {
      const re = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      wordHtml = result.word.replace(re, "<mark>$1</mark>");
    }
    div.innerHTML = `
      <div class="word-title">
        <span class="result-word" tabindex="0" title="Bấm để copy">${wordHtml}</span>
        ${
          result.audioUrl
            ? `<button class="audio-button" onclick="app.playAudio('${result.audioUrl}')" aria-label="Phát âm">
                <i class="fas fa-volume-up"></i>
            </button>`
            : `<button class="audio-button" onclick="app.speakText('${result.word}')" aria-label="Đọc từ">
                <i class="fas fa-volume-up"></i>
            </button>`
        }
      </div>
      <div class="pronunciation">${result.pronunciation}</div>
      <div class="definitions">
        ${result.definitions
          .map(
            (def) => `
              <div class="definition-item">
                <div class="definition-text">${def.text}</div>
                ${def.example ? `<div class="definition-example">Ví dụ: ${def.example}</div>` : ""}
              </div>
            `
          )
          .join("")}
      </div>
    `;
    div.querySelector(".result-word").addEventListener("click", (e) => {
      navigator.clipboard.writeText(result.word);
      e.target.classList.add("copied");
      e.target.title = "Đã copy!";
      setTimeout(() => {
        e.target.classList.remove("copied");
        e.target.title = "Bấm để copy";
      }, 1000);
    });
    return div;
  }

  getLanguageName(code) {
    return this.languageNames[code] || code;
  }

  addToHistory(word, fromLang, toLang) {
    const historyItem = {
      word,
      fromLang,
      toLang,
      timestamp: new Date().toISOString(),
    };

    // Remove existing entry if it exists
    this.searchHistory = this.searchHistory.filter(
      (item) => !(item.word === word && item.fromLang === fromLang && item.toLang === toLang)
    );

    // Add to beginning
    this.searchHistory.unshift(historyItem);

    // Keep only last 20 items
    this.searchHistory = this.searchHistory.slice(0, 20);

    localStorage.setItem("dictionaryHistory", JSON.stringify(this.searchHistory));
    this.loadHistory();
  }

  loadHistory() {
    // History section removed, so this method is no longer needed
    // But we keep the search history in memory for future use
    return;
  }

  createHistoryElement(item) {
    const div = document.createElement("div");
    div.className = "history-item";
    div.setAttribute("role", "button");
    div.setAttribute("tabindex", "0");

    div.innerHTML = `
            <div class="history-word">${item.word}</div>
            <div class="history-languages">
                ${this.getLanguageName(item.fromLang)} → ${this.getLanguageName(item.toLang)}
            </div>
        `;

    div.addEventListener("click", () => {
      this.searchInput.value = item.word;
      this.fromLangSelect.value = item.fromLang;
      this.toLangSelect.value = item.toLang;
      this.performSearch();
    });

    div.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        div.click();
      }
    });

    return div;
  }

  clearHistory() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu?")) {
      this.searchHistory = [];
      localStorage.removeItem("dictionaryHistory");
      this.loadHistory();
      this.announceToScreenReader("Đã xóa lịch sử tra cứu");
    }
  }

  toggleVoiceInput() {
    if (!this.isVoiceEnabled) {
      this.announceToScreenReader("Chức năng nhập bằng giọng nói sẽ được thêm vào trong phiên bản sau");
      // Placeholder for future STT integration
      this.voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      this.voiceButton.setAttribute("aria-label", "Tắt nhập bằng giọng nói");
    } else {
      this.voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
      this.voiceButton.setAttribute("aria-label", "Nhập bằng giọng nói");
    }

    this.isVoiceEnabled = !this.isVoiceEnabled;
  }

  // Voice input methods
  toggleVoiceRecording() {
    if (!this.isRecording) {
      this.startVoiceInput();
    } else {
      this.stopVoiceInput();
    }
  }

  startVoiceInput() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      this.announceToScreenReader("Trình duyệt không hỗ trợ nhận dạng giọng nói");
      return;
    }

    const langMap = {
      vi: "vi-VN",
      en: "en-US",
      ja: "ja-JP",
      ko: "ko-KR",
      zh: "zh-CN",
      fr: "fr-FR",
      de: "de-DE",
      es: "es-ES",
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = langMap[this.selectedSourceLang] || "en-US";

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.voiceStatus.classList.add("recording");
      this.voiceText.textContent = "Đang nghe...";
      this.voiceToggleButton.classList.add("recording");
      this.voiceToggleIcon.className = "fas fa-stop";
      this.voiceToggleText.textContent = "Dừng ghi âm";
      this.voiceSearchButton.style.display = "none";
      this.voiceClearButton.style.display = "none";
      this.announceToScreenReader("Bắt đầu ghi âm");
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.voiceContent.textContent = transcript;
      this.voiceResult.style.display = "block";
      this.voiceStatus.classList.remove("recording");
      this.voiceStatus.classList.add("success");
      this.voiceText.textContent = "Đã ghi âm xong";
      this.voiceToggleButton.classList.remove("recording");
      this.voiceToggleIcon.className = "fas fa-microphone";
      this.voiceToggleText.textContent = "Ghi âm lại";
      this.voiceSearchButton.style.display = "flex";
      this.voiceClearButton.style.display = "flex";
      this.isRecording = false;
      this.announceToScreenReader(`Đã ghi âm: ${transcript}`);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      this.voiceStatus.classList.remove("recording");
      this.voiceText.textContent = "Lỗi khi ghi âm";
      this.voiceToggleButton.classList.remove("recording");
      this.voiceToggleIcon.className = "fas fa-microphone";
      this.voiceToggleText.textContent = "Bắt đầu nói";
      this.isRecording = false;
      this.announceToScreenReader("Lỗi khi ghi âm");
    };

    this.recognition.onend = () => {
      this.voiceStatus.classList.remove("recording");
      this.voiceToggleButton.classList.remove("recording");
      this.voiceToggleIcon.className = "fas fa-microphone";
      this.voiceToggleText.textContent = "Bắt đầu nói";
      this.isRecording = false;
    };

    this.recognition.start();
  }

  stopVoiceInput() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
  }

  searchVoiceInput() {
    const transcript = this.voiceContent.textContent;
    if (transcript) {
      this.searchInput.value = transcript;
      this.handleCustomSearch();
    }
  }

  clearVoiceInput() {
    this.voiceResult.style.display = "none";
    this.voiceContent.textContent = "";
    this.voiceStatus.classList.remove("success");
    this.voiceText.textContent = "Nhấn nút để bắt đầu nói";
    this.voiceToggleIcon.className = "fas fa-microphone";
    this.voiceToggleText.textContent = "Bắt đầu nói";
    this.voiceSearchButton.style.display = "none";
    this.voiceClearButton.style.display = "none";
    this.announceToScreenReader("Đã xóa và sẵn sàng ghi âm mới");
  }

  speakText(text) {
    // Use pre-generated Google TTS audio files
    this.speakWithPreGeneratedAudio(text);
  }

  speakWithPreGeneratedAudio(text) {
    // Map text to pre-generated audio files
    const audioMap = {
      "Tiếng Việt": "lang-vietnamese.mp3",
      "Tiếng Anh": "lang-english.mp3",
      "Tiếng Nhật": "lang-japanese.mp3",
      "Tiếng Hàn": "lang-korean.mp3",
      "Tiếng Trung": "lang-chinese.mp3",
      "Tiếng Pháp": "lang-french.mp3",
      "Tiếng Đức": "lang-german.mp3",
      "Tiếng Tây Ban Nha": "lang-spanish.mp3",
      "Nhập bằng bàn phím": "input-keyboard.mp3",
      "Nhập bằng giọng nói": "input-voice.mp3",
    };

    const audioFile = audioMap[text];

    if (audioFile) {
      // Play pre-generated audio
      const audio = new Audio(`/assets/audio/mp3/${audioFile}`);
      audio.volume = 0.8;

      audio
        .play()
        .then(() => {
          this.announceToScreenReader(`Đang đọc: ${text}`);
        })
        .catch((error) => {
          console.error("Error playing pre-generated audio:", error);
          // Fallback to browser TTS
          this.speakWithBrowserTTS(text);
        });

      // Clean up after audio ends
      audio.addEventListener("ended", () => {
        audio.remove();
      });
    } else {
      // For other text, use browser TTS
      this.speakWithBrowserTTS(text);
    }
  }

  speakWithBrowserTTS(text) {
    // Use browser speech synthesis with optimized Vietnamese voice
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      // Wait for voices to load
      const speakWithVoice = () => {
        const voices = window.speechSynthesis.getVoices();

        // Try to find the best Vietnamese voice
        let vietnameseVoice = voices.find((voice) => voice.lang === "vi-VN" || voice.lang === "vi");

        // If no Vietnamese voice, try to find any voice that supports Vietnamese
        if (!vietnameseVoice) {
          vietnameseVoice = voices.find(
            (voice) =>
              voice.lang.includes("vi") ||
              voice.name.toLowerCase().includes("vietnamese") ||
              voice.name.toLowerCase().includes("vietnam")
          );
        }

        // If still no Vietnamese voice, use default voice
        if (!vietnameseVoice) {
          vietnameseVoice = voices.find((voice) => voice.default === true);
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Set language and voice
        utterance.lang = "vi-VN";
        utterance.rate = 0.9; // Slightly slower for better pronunciation
        utterance.pitch = 1.0;
        utterance.volume = 0.9;

        if (vietnameseVoice) {
          utterance.voice = vietnameseVoice;
        }

        utterance.onstart = () => {
          this.announceToScreenReader(`Đang đọc: ${text}`);
        };

        utterance.onend = () => {
          this.announceToScreenReader("Đã đọc xong");
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          this.announceToScreenReader("Lỗi khi đọc từ");
        };

        window.speechSynthesis.speak(utterance);
      };

      // Check if voices are loaded
      if (window.speechSynthesis.getVoices().length > 0) {
        speakWithVoice();
      } else {
        // Wait for voices to load
        window.speechSynthesis.addEventListener("voiceschanged", speakWithVoice, { once: true });
      }
    } else {
      this.announceToScreenReader("Trình duyệt không hỗ trợ text-to-speech");
    }
  }

  playAudio(audioUrl) {
    if (audioUrl) {
      this.audioPlayer.src = audioUrl;
      this.audioPlayer.play().catch((e) => {
        console.error("Error playing audio:", e);
        this.announceToScreenReader("Không thể phát âm thanh");
      });
    }
  }

  pauseAllAudio() {
    // Pause any playing audio
    this.audioPlayer.pause();

    // Cancel any speech synthesis
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    this.announceToScreenReader("Đã tạm dừng tất cả audio");
  }

  goToHome() {
    this.announceToScreenReader("Đang chuyển về trang chủ");
    window.location.href = "../index.html";
  }

  showHelp() {
    if (this.helpModal) {
      this.helpModal.style.display = "flex";
      this.announceToScreenReader("Đã mở trợ giúp");

      // Focus on close button
      setTimeout(() => {
        if (this.closeHelpModalBtn) {
          this.closeHelpModalBtn.focus();
        }
      }, 100);
    }
  }

  hideHelp() {
    if (this.helpModal) {
      this.helpModal.style.display = "none";
      this.announceToScreenReader("Đã đóng trợ giúp");
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
    this.announceToScreenReader("Đã đặt kích thước chữ về bình thường");
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
    document.body.classList.remove("text-small", "text-large", "text-extra-large", "text-huge", "text-giant");

    // Add current text size class
    const currentSize = this.textSizeLevels[this.currentTextSizeIndex];
    this.currentTextSize = currentSize;

    if (currentSize !== "normal") {
      document.body.classList.add(`text-${currentSize}`);
    }
  }

  getTextSizeName() {
    const names = {
      small: "Nhỏ",
      normal: "Bình thường",
      large: "Lớn",
      "extra-large": "Rất lớn",
      huge: "Cực lớn",
      giant: "Khổng lồ",
    };
    return names[this.currentTextSize] || "Bình thường";
  }

  showLoading() {
    this.loadingOverlay.style.display = "flex";
    this.searchButton.disabled = true;
  }

  hideLoading() {
    this.loadingOverlay.style.display = "none";
    this.searchButton.disabled = false;
  }

  showError(message) {
    this.resultsContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <h3>Lỗi</h3>
                <p>${message}</p>
            </div>
        `;
    this.resultsSection.style.display = "block";
  }

  hideResults() {
    this.resultsSection.style.display = "none";
  }

  announceToScreenReader(message) {
    // Create a temporary element for screen reader announcements
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  // Flow methods
  initializeFlow() {
    this.showStep(1);
    this.updateProgressIndicator();
    this.announceToScreenReader(
      "Chào mừng đến với tra từ điển. Bước 1: Chọn ngôn ngữ nguồn. Nhấn phím số từ 1-8 để chọn ngôn ngữ. Nhấn Space để nghe hướng dẫn audio."
    );

    // Auto-play intro audio after initialization
    setTimeout(() => {
      this.playStepAudio(1); // Play intro audio (index 0)
    }, 1000);
  }

  showStep(stepNumber) {
    // Stop any playing audio before changing steps
    this.stopCurrentAudio();

    // Hide all steps
    this.flowSteps.forEach((step) => {
      step.classList.remove("active");
    });

    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
      currentStepElement.classList.add("active");
      this.currentStep = stepNumber;
    }

    // Always re-bind events for dynamic elements
    setTimeout(() => {
      this.bindEvents();
    }, 100);

    // Update progress indicator
    this.updateProgressIndicator();

    // Focus management
    this.focusCurrentStep();

    // Auto-play audio for the current step
    this.playStepAudio(stepNumber);

    console.log(`Showing step ${stepNumber}, audio player should be initialized`);
  }

  updateProgressIndicator() {
    this.progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.remove("active", "completed");

      if (stepNumber === this.currentStep) {
        step.classList.add("active");
      } else if (stepNumber < this.currentStep) {
        step.classList.add("completed");
      }
    });
  }

  focusCurrentStep() {
    // Focus on the first interactive element in the current step
    const currentStepElement = document.getElementById(`step-${this.currentStep}`);
    if (currentStepElement) {
      const firstInteractive = currentStepElement.querySelector("button, input, select");
      if (firstInteractive) {
        setTimeout(() => {
          firstInteractive.focus();
        }, 100);
      }
    }
  }

  selectLanguage(event) {
    const button = event.target.closest(".language-option");
    if (!button) return;

    const langCode = button.getAttribute("data-lang");
    const langName = this.languageNames[langCode];

    // Stop current audio before speaking language name
    this.stopCurrentAudio();

    // Remove previous selection
    const currentStepElement = document.getElementById(`step-${this.currentStep}`);
    const previousSelected = currentStepElement.querySelector(".language-option.selected");
    if (previousSelected) {
      previousSelected.classList.remove("selected");
    }

    // Add selection to clicked button
    button.classList.add("selected");

    // Play audio for language name
    this.speakText(langName);

    // Announce selection
    this.announceToScreenReader(`Đã chọn ${langName}. Nhấn Enter để xác nhận.`);

    // Store selection - Cập nhật logic này
    if (this.currentStep === 1) {
      this.selectedSourceLang = langCode;
      console.log("Đã chọn ngôn ngữ nguồn:", langName);
    } else if (this.currentStep === 2) {
      this.selectedTargetLang = langCode;
      console.log("Đã chọn ngôn ngữ đích:", langName);
    }

    console.log(`Selected language: ${langName} (${langCode}) in step ${this.currentStep}`);
  }

  confirmLanguageSelection() {
    // Kiểm tra xem có đang ở step đúng không
    if (this.currentStep !== 1 && this.currentStep !== 2) {
      console.log(`confirmLanguageSelection called from wrong step: ${this.currentStep}`);
      return;
    }

    if (this.currentStep === 1) {
      // Kiểm tra có chọn ngôn ngữ nguồn chưa
      if (!this.selectedSourceLang) {
        console.log("No source language selected, cannot confirm");
        this.announceToScreenReader("Vui lòng chọn ngôn ngữ nguồn trước");
        return;
      }

      // Move to step 2
      this.updateSourceLanguageInfo();
      this.showStep(2);
      this.announceToScreenReader(
        `Bước 2: Chọn ngôn ngữ đích. Đang dịch từ ${
          this.languageNames[this.selectedSourceLang]
        }. Nhấn phím số từ 1-8 để chọn ngôn ngữ đích. Nhấn Space để nghe hướng dẫn audio.`
      );
      console.log("Moved to step 2, keyboard shortcuts should work for language selection");
    } else if (this.currentStep === 2) {
      // Kiểm tra có chọn ngôn ngữ đích chưa
      if (!this.selectedTargetLang) {
        console.log("No target language selected, cannot confirm");
        this.announceToScreenReader("Vui lòng chọn ngôn ngữ đích trước");
        return;
      }

      // Move to step 3
      this.updateTranslationInfo();
      this.updateTranslationInfoStep3();
      this.showStep(3);
      this.announceToScreenReader(
        `Bước 3: Chọn cách nhập từ. Dịch từ ${this.languageNames[this.selectedSourceLang]} sang ${
          this.languageNames[this.selectedTargetLang]
        }. Nhấn phím 1 để nhập bằng bàn phím, phím 2 để nhập bằng giọng nói. Nhấn Space để nghe hướng dẫn audio.`
      );
      console.log("Moved to step 3, keyboard shortcuts should work for input method selection");
    }
  }

  confirmInputMethodSelection() {
    // Kiểm tra xem có đang ở step 3 không
    if (this.currentStep !== 3) {
      console.log(`confirmInputMethodSelection called from wrong step: ${this.currentStep}`);
      return;
    }

    // Kiểm tra có chọn input method chưa
    if (!this.selectedInputMethod) {
      console.log("No input method selected, cannot confirm");
      this.announceToScreenReader("Vui lòng chọn phương thức nhập trước");
      return;
    }

    // Move to step 4
    this.updateStep4Description();
    this.showStep(4);
    this.announceToScreenReader(
      `Bước 4: Nhập từ cần tra. Dịch từ ${this.languageNames[this.selectedSourceLang]} sang ${
        this.languageNames[this.selectedTargetLang]
      }. ${
        this.selectedInputMethod === "keyboard" ? "Nhập từ bằng bàn phím" : "Nói từ cần tra cứu"
      }. Nhấn Space để nghe hướng dẫn audio.`
    );
    console.log("Moved to step 4, input method:", this.selectedInputMethod);
  }

  selectInputMethod(event) {
    const button = event.target.closest(".input-method-option");
    if (!button) return;

    console.log("selectInputMethod called, current step:", this.currentStep);
    console.log("Button found:", button);

    const method = button.getAttribute("data-method");
    const methodName = method === "keyboard" ? "Nhập bằng bàn phím" : "Nhập bằng giọng nói";

    console.log("Method:", method, "Method name:", methodName);

    // Stop current audio before speaking method name
    this.stopCurrentAudio();

    // Remove previous selection
    const currentStepElement = document.getElementById(`step-${this.currentStep}`);
    const previousSelected = currentStepElement
      ? currentStepElement.querySelector(".input-method-option.selected")
      : null;
    if (previousSelected) {
      previousSelected.classList.remove("selected");
      console.log("Removed previous selection");
    }

    // Add selection to clicked button
    button.classList.add("selected");
    console.log("Added selected class to button");

    // Play audio for method name
    this.speakText(methodName);

    // Announce selection
    this.announceToScreenReader(`Đã chọn ${methodName}. Nhấn Enter để xác nhận.`);

    // Store selection và log
    this.selectedInputMethod = method;
    console.log("Đã chọn phương thức nhập:", methodName);
    console.log("selectedInputMethod now:", this.selectedInputMethod);

    console.log(`Selected input method: ${methodName} (${method}) in step ${this.currentStep}`);
  }

  updateSourceLanguageInfo() {
    if (this.selectedSourceLangName) {
      this.selectedSourceLangName.textContent = this.languageNames[this.selectedSourceLang];
    }
  }

  updateTranslationInfo() {
    if (this.translationFrom) {
      this.translationFrom.textContent = this.languageNames[this.selectedSourceLang];
    }
    if (this.translationTo) {
      this.translationTo.textContent = this.languageNames[this.selectedTargetLang];
    }
  }

  updateTranslationInfoStep3() {
    if (this.translationFromStep3) {
      this.translationFromStep3.textContent = this.languageNames[this.selectedSourceLang];
    }
    if (this.translationToStep3) {
      this.translationToStep3.textContent = this.languageNames[this.selectedTargetLang];
    }
  }

  updateStep4Description() {
    if (this.step4Description) {
      if (this.selectedInputMethod === "keyboard") {
        this.step4Description.textContent = "Nhập từ bạn muốn tra cứu bằng bàn phím";
      } else {
        this.step4Description.textContent = "Nói từ bạn muốn tra cứu bằng giọng nói";
      }
    }

    // Show/hide appropriate layout
    if (this.selectedInputMethod === "keyboard") {
      if (this.keyboardLayout) this.keyboardLayout.style.display = "block";
      if (this.voiceLayout) this.voiceLayout.style.display = "none";
    } else {
      if (this.keyboardLayout) this.keyboardLayout.style.display = "none";
      if (this.voiceLayout) this.voiceLayout.style.display = "block";
    }
  }

  goBack(event) {
    if (event) {
      event.preventDefault();
    }

    // Stop any playing audio before going back
    this.stopCurrentAudio();

    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);

      // Announce step change
      const stepMessages = {
        1: "Bước 1: Chọn ngôn ngữ nguồn. Nhấn phím số từ 1-8 để chọn ngôn ngữ. Nhấn Space để nghe hướng dẫn audio.",
        2: `Bước 2: Chọn ngôn ngữ đích. Đang dịch từ ${
          this.languageNames[this.selectedSourceLang]
        }. Nhấn phím số từ 1-8 để chọn ngôn ngữ đích. Nhấn Space để nghe hướng dẫn audio.`,
        3: `Bước 3: Chọn cách nhập từ. Dịch từ ${this.languageNames[this.selectedSourceLang]} sang ${
          this.languageNames[this.selectedTargetLang]
        }. Nhấn phím 1 để nhập bằng bàn phím, phím 2 để nhập bằng giọng nói. Nhấn Space để nghe hướng dẫn audio.`,
        4: `Bước 4: Nhập từ cần tra. Dịch từ ${this.languageNames[this.selectedSourceLang]} sang ${
          this.languageNames[this.selectedTargetLang]
        }. ${
          this.selectedInputMethod === "keyboard" ? "Nhập từ bằng bàn phím" : "Nói từ cần tra cứu"
        }. Nhấn Space để nghe hướng dẫn audio.`,
      };

      this.announceToScreenReader(stepMessages[this.currentStep]);
    }
  }

  // Auto-play audio for each step
  playStepAudio(stepNumber) {
    console.log(`Playing audio for step ${stepNumber}`);

    // Stop any currently playing audio first
    this.stopCurrentAudio();

    if (this.audioFiles && this.audioFiles[stepNumber]) {
      // Create new AudioPlayer for the specific step
      setTimeout(() => {
        // Prefer the audio container inside the currently active step
        const currentStepElement = document.getElementById(`step-${stepNumber}`);
        const container = currentStepElement
          ? currentStepElement.querySelector("#audio-player-dictionary")
          : document.getElementById("audio-player-dictionary");

        if (container) {
          const audioFile = this.audioFiles[stepNumber];
          const titles = [
            "Hướng dẫn sử dụng tra từ điển",
            "Bước 1: Chọn ngôn ngữ nguồn",
            "Bước 2: Chọn ngôn ngữ đích",
            "Bước 3: Chọn cách nhập từ",
            "Bước 4: Nhập từ cần tra",
            "Phím tắt hữu ích",
          ];

          this.audioPlayer = new AudioPlayer(container, audioFile, titles[stepNumber]);
          this.currentAudioIndex = stepNumber;

          // Auto-play the audio
          setTimeout(() => {
            if (this.audioPlayer) {
              this.audioPlayer.play();
            }
          }, 200);
        }
      }, 500); // 500ms delay to allow UI to settle
    }
  }

  // Stop current audio method
  stopCurrentAudio() {
    // Stop audio player
    if (this.audioPlayer) {
      if (typeof this.audioPlayer.pause === "function") {
        this.audioPlayer.pause();
      } else if (typeof this.audioPlayer.pause === "function") {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      }
    }

    // Stop any speech synthesis
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Stop any HTML5 audio elements
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  // Audio Player methods
  initializeAudioPlayer() {
    // Initialize audio player for dictionary guide
    if (typeof AudioPlayer !== "undefined") {
      const container = document.getElementById("audio-player-dictionary");

      if (container) {
        // Start with intro audio
        this.audioPlayer = new AudioPlayer(container, "dictionary-intro", "Hướng dẫn tra từ điển");
        this.currentAudioIndex = 0;

        // Dictionary guide audio files
        this.audioFiles = [
          "dictionary-intro",
          "dictionary-step1",
          "dictionary-step2",
          "dictionary-step3",
          "dictionary-step4",
          "dictionary-shortcuts",
        ];

        // Auto-play audio after user interaction
        this.setupFirstAudioPlay();

        this.announceToScreenReader("Audio player đã được khởi tạo. Sử dụng phím Space để phát/pause audio hướng dẫn.");
      }
    }
  }

  setupFirstAudioPlay() {
    // Auto-play audio after user interaction
    const playIntro = () => {
      if (this.audioPlayer) {
        console.log("Auto-playing dictionary audio after user interaction...");
        this.audioPlayer.play().catch((error) => {
          console.log("Auto-play blocked by browser. Click play button to start.");
        });
      }
      // Remove event listeners after first play
      document.removeEventListener("click", playIntro);
      document.removeEventListener("keydown", playIntro);
    };

    // Listen for first user interaction
    document.addEventListener("click", playIntro, { once: true });
    document.addEventListener("keydown", playIntro, { once: true });

    console.log("Dictionary audio ready. Click anywhere or press any key to start auto-play.");
  }

  // Mock data method for when files are not accessible
  useMockData() {
    console.log("🔄 Sử dụng Mock Data...");

    const mockDictionary = {
      "vi-en": {
        "xin chào": { target: "hello", type: "interjection", pronunciation: "/sin tʃaʊ/" },
        "cảm ơn": { target: "thank you", type: "interjection", pronunciation: "/kɑmən/" },
        "tạm biệt": { target: "goodbye", type: "interjection", pronunciation: "/tɑm biət/" },
        bạn: { target: "you", type: "pronoun", pronunciation: "/bɑn/" },
        tôi: { target: "I", type: "pronoun", pronunciation: "/toj/" },
        làm: { target: "do", type: "verb", pronunciation: "/lɑm/" },
        ăn: { target: "eat", type: "verb", pronunciation: "/ɑn/" },
        uống: { target: "drink", type: "verb", pronunciation: "/uəŋ/" },
        nước: { target: "water", type: "noun", pronunciation: "/nuək/" },
        cơm: { target: "rice", type: "noun", pronunciation: "/kəm/" },
      },
      "vi-fr": {
        "xin chào": { target: "bonjour", type: "interjection", pronunciation: "/sin tʃaʊ/" },
        "cảm ơn": { target: "merci", type: "interjection", pronunciation: "/kɑmən/" },
        "tạm biệt": { target: "au revoir", type: "interjection", pronunciation: "/tɑm biət/" },
        bạn: { target: "vous", type: "pronoun", pronunciation: "/bɑn/" },
        tôi: { target: "je", type: "pronoun", pronunciation: "/toj/" },
        nước: { target: "eau", type: "noun", pronunciation: "/nuək/" },
        cơm: { target: "riz", type: "noun", pronunciation: "/kəm/" },
      },
      "vi-ja": {
        "xin chào": { target: "こんにちは", type: "interjection", pronunciation: "/sin tʃaʊ/" },
        "cảm ơn": { target: "ありがとう", type: "interjection", pronunciation: "/kɑm èn/" },
        "tạm biệt": { target: "さようなら", type: "interjection", pronunciation: "/tɑm biət/" },
      },
    };

    // Store mock data globally
    window.mockDictionary = mockDictionary;

    this.showError(`
      <div style="color: green;">
        <i class="fas fa-check-circle"></i>
        <strong>✅ Mock Data đã được kích hoạt!</strong><br><br>
        
        <strong>📚 Dữ liệu mẫu bao gồm:</strong><br>
        • Việt - Anh: 10 từ<br>
        • Việt - Pháp: 7 từ<br>
        • Việt - Nhật: 3 từ<br><br>
        
        <strong>💡 Thử tìm kiếm:</strong><br>
        "xin chào", "cảm ơn", "tạm biệt", "bạn", "tôi", "nước", "cơm"<br><br>
        
        <button onclick="document.querySelector('.error-message').style.display='none'" 
                style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          🚀 Bắt đầu tìm kiếm
        </button>
      </div>
    `);

    this.announceToScreenReader("Mock data đã được kích hoạt. Có thể bắt đầu tìm kiếm từ mẫu.");
  }

  // Check protocol and auto-enable mock data
  checkProtocolAndEnableMockData() {
    if (window.location.protocol === "file:") {
      // Auto-enable mock data silently
      const mockDictionary = {
        "vi-en": {
          "xin chào": { target: "hello", type: "interjection", pronunciation: "/sin tʃaʊ/" },
          "cảm ơn": { target: "thank you", type: "interjection", pronunciation: "/kɑmən/" },
          "tạm biệt": { target: "goodbye", type: "interjection", pronunciation: "/tɑm biệt/" },
          bạn: { target: "you", type: "pronoun", pronunciation: "/bɑn/" },
          tôi: { target: "I", type: "pronoun", pronunciation: "/toj/" },
          làm: { target: "do", type: "verb", pronunciation: "/lɑm/" },
          ăn: { target: "eat", type: "verb", pronunciation: "/ɑn/" },
          uống: { target: "drink", type: "verb", pronunciation: "/uəŋ/" },
          nước: { target: "water", type: "noun", pronunciation: "/nuək/" },
          cơm: { target: "rice", type: "noun", pronunciation: "/kəm/" },
          yêu: { target: "love", type: "verb", pronunciation: "/jeu/" },
          học: { target: "study", type: "verb", pronunciation: "/hɔk/" },
          đi: { target: "go", type: "verb", pronunciation: "/ɗi/" },
          đến: { target: "come", type: "verb", pronunciation: "/ɗen/" },
          nhà: { target: "house", type: "noun", pronunciation: "/ɲɑ/" },
        },
        "vi-fr": {
          "xin chào": { target: "bonjour", type: "interjection", pronunciation: "/sin tʃaʊ/" },
          "cảm ơn": { target: "merci", type: "interjection", pronunciation: "/kɑmən/" },
          "tạm biệt": { target: "au revoir", type: "interjection", pronunciation: "/tɑm biệt/" },
          bạn: { target: "vous", type: "pronoun", pronunciation: "/bɑn/" },
          tôi: { target: "je", type: "pronoun", pronunciation: "/toj/" },
          nước: { target: "eau", type: "noun", pronunciation: "/nuək/" },
          cơm: { target: "riz", type: "noun", pronunciation: "/kəm/" },
          yêu: { target: "aimer", type: "verb", pronunciation: "/jeu/" },
          nhà: { target: "maison", type: "noun", pronunciation: "/ɲɑ/" },
        },
        "vi-ja": {
          "xin chào": { target: "こんにちは", type: "interjection", pronunciation: "/sin tʃaʊ/" },
          "cảm ơn": { target: "ありがとう", type: "interjection", pronunciation: "/kɑm èn/" },
          "tạm biệt": { target: "さようなら", type: "interjection", pronunciation: "/tɑm biệt/" },
          bạn: { target: "あなた", type: "pronoun", pronunciation: "/bɑn/" },
          tôi: { target: "私", type: "pronoun", pronunciation: "/toj/" },
        },
      };

      // Store mock data globally
      window.mockDictionary = mockDictionary;

      // Show notification after a delay
      setTimeout(() => {
        this.showMockDataNotification();
      }, 2000);
    }
  }

  // Show notification that mock data is enabled
  showMockDataNotification() {
    // Create a temporary notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 350px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-check-circle" style="font-size: 18px;"></i>
        <div>
          <strong>✅ Mock Data đã sẵn sàng!</strong><br>
          <small>Thử tìm: "xin chào", "cảm ơn", "tôi", "bạn"</small>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: auto;">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Enhanced search with mock data fallback
  async searchWithMockData(searchTerm, fromLang, toLang) {
    const dictKey = `${fromLang}-${toLang}`;
    const reverseDictKey = `${toLang}-${fromLang}`;

    if (!window.mockDictionary) {
      return null;
    }

    const searchLower = searchTerm.toLowerCase();
    let results = [];

    // Search in forward direction
    const dict = window.mockDictionary[dictKey];
    if (dict) {
      for (const [source, data] of Object.entries(dict)) {
        if (source.toLowerCase().includes(searchLower)) {
          results.push({
            word: source,
            pronunciation: data.pronunciation || `/${source}/`,
            definitions: [
              {
                text: data.target,
                example: "",
                partOfSpeech: data.type || "",
              },
            ],
            audioUrl: null,
            score: this.calculateMatchScore(source, searchTerm),
          });
        }
      }
    }

    // Search in reverse direction
    const reverseDict = window.mockDictionary[reverseDictKey];
    if (reverseDict && results.length === 0) {
      for (const [source, data] of Object.entries(reverseDict)) {
        if (data.target.toLowerCase().includes(searchLower)) {
          results.push({
            word: data.target,
            pronunciation: `/${data.target}/`,
            definitions: [
              {
                text: source,
                example: "",
                partOfSpeech: data.type || "",
              },
            ],
            audioUrl: null,
            score: this.calculateMatchScore(data.target, searchTerm),
          });
        }
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    return results.length > 0 ? results : null;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new DictionaryApp();

  // Add some additional accessibility features
  document.addEventListener("keydown", (e) => {
    // Alt + S to focus search input
    if (e.altKey && e.key === "s") {
      e.preventDefault();
      document.getElementById("search-input").focus();
    }

    // Alt + H to focus history
    if (e.altKey && e.key === "h") {
      e.preventDefault();
      const firstHistoryItem = document.querySelector(".history-item");
      if (firstHistoryItem) {
        firstHistoryItem.focus();
      }
    }
  });

  // Announce keyboard shortcuts
  console.log(
    "Keyboard shortcuts: H (home), Alt+S (focus search), Alt+H (focus history), +/- (text size), 0 (normal size)"
  );
});

// Service Worker registration for future PWA features
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Service worker will be added in future updates
    console.log("Service Worker support detected");
  });
}
