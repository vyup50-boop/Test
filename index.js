"use strict";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// --- START OF TYPE DECLARATIONS ---
// For external libraries that are loaded via <script> tags
// --- END OF TYPE DECLARATIONS ---
function showQuizSavedNotification() {
    const note = document.createElement('div');
    note.textContent = "✅ Quiz successfully saved to Google Sheet!";
    note.style.position = "fixed";
    note.style.bottom = "20px";
    note.style.left = "50%";
    note.style.transform = "translateX(-50%)";
    note.style.backgroundColor = "#28a745";
    note.style.color = "#fff";
    note.style.padding = "12px 20px";
    note.style.borderRadius = "8px";
    note.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
    note.style.fontWeight = "bold";
    note.style.zIndex = "99999";
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 4000);
}
document.addEventListener('DOMContentLoaded', () => {
    // --- CONSTANTS ---
    const QUESTION_FORMATS = {
        'mcq': { name: 'Multiple Choice (MCQ)' },
        'statement': { name: 'Statement-Based' },
        'assertion-reason': { name: 'Assertion-Reason' },
        'math-physics': { name: 'Maths, Physics, or Other Questions' },
        'true-false': { name: 'True/False' },
        'fill-blank': { name: 'Fill-in-the-Blank' },
        'mix': { name: 'Mixed Format' }
    };
    const MCQ_EXAMPLE = `1. Multiple Choice Questions
Question: What is the capital of France?
Options:
a) Berlin
b) Madrid
c) Paris
d) Rome
Correct Answer: c
Explanation: Paris is the capital and most populous city of France.`;
    const AR_EXAMPLE = `1. Assertion-Reason Based Questions
Assertion (A): The sun appears yellow from Earth.
Reason (R): The Earth's atmosphere scatters shorter wavelength blue light more than longer wavelength yellow and red light.
Options:
a) Both A and R are true and R is the correct explanation of A.
b) Both A and R are true but R is not the correct explanation of A.
c) A is true but R is false.
d) A is false but R is true.
Correct Answer: a
Explanation: This phenomenon is known as Rayleigh scattering.`;
    const STATEMENT_EXAMPLE = `1. Statement-Based Questions
Question: Consider the following statements regarding photosynthesis:
* Photosynthesis primarily occurs in the chloroplasts of plant cells.
* Oxygen is released as a byproduct during photosynthesis.
* Photosynthesis converts light energy into chemical energy.
Which of the above statements are correct?
Options:
a) 1 and 2 only
b) 2 and 3 only
c) 1 and 3 only
d) 1, 2, and 3
Correct Answer: d
Explanation: All three statements are correct.`;
    const MATH_EXAMPLE = `1. Maths, Physics, or Other Questions
Question: What is the value of the integral of 3x^2, i.e., \\( \\int 3x^2 \\,dx \\)?
Options:
a) \\( 3x^3 + C \\)
b) \\( x^3 + C \\)
c) \\( 6x + C \\)
d) \\( \\frac{1}{3}x^3 + C \\)
Correct Answer: b
Explanation: Using the power rule for integration, the integral of \\( 3x^2 \\) is \\( x^3 + C \\). C is the constant of integration. For math symbols, you MUST use LaTeX format enclosed in \\( ... \\) delimiters.`;
    const TF_EXAMPLE = `1. True/False Questions
Question: The Earth is the fourth planet from the Sun.
Options:
a) True
b) False
Correct Answer: b
Explanation: The Earth is the third planet from the Sun. Mars is the fourth.`;
    const FILL_BLANK_EXAMPLE = `1. Fill-in-the-Blank Questions
Question: The powerhouse of the cell is the __________.
Options:
a) Nucleus
b) Ribosome
c) Mitochondrion
d) Endoplasmic Reticulum
Correct Answer: c
Explanation: The mitochondrion is responsible for generating most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.`;
    const LEGACY_FORMAT_TEXT = [MCQ_EXAMPLE, AR_EXAMPLE, STATEMENT_EXAMPLE, MATH_EXAMPLE, TF_EXAMPLE, FILL_BLANK_EXAMPLE].join('\n\n');
    const FORM_STATE_KEY = 'examyatriFormState';
    const SCROLL_POS_KEY = 'examyatriScrollPos';
    const elements = {
        globalNavBar: document.getElementById('global-nav-bar'),
        mainContainer: document.getElementById('main-container'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        modeSelectionContainer: document.getElementById('mode-selection-container'),
        multiplayerSelectionContainer: document.getElementById('multiplayer-selection-container'),
        manualGeneratorContainer: document.getElementById('manual-generator-container'),
        pasteQuizContainer: document.getElementById('paste-quiz-container'),
        quizPlayerContainer: document.getElementById('quiz-player-container'),
        resultsScreen: document.getElementById('results-screen'),
        joinRoomContainer: document.getElementById('join-room-container'),
        configureRoomContainer: document.getElementById('configure-room-container'),
        lobbyContainer: document.getElementById('lobby-container'),
        multiplayerQuizPlayerContainer: document.getElementById('multiplayer-quiz-player-container'),
        multiplayerResultsContainer: document.getElementById('multiplayer-results-container'),
        searchContainer: document.getElementById('search-container'),
        selectSinglePlayerBtn: document.getElementById('select-single-player-btn'),
        selectMultiplayerBtn: document.getElementById('select-multiplayer-btn'),
        creationMethodSelector: document.getElementById('creation-method-selector'),
        topicGeneratorWorkflow: document.getElementById('topic-generator-workflow'),
        textGeneratorWorkflow: document.getElementById('text-generator-workflow'),
        imageGeneratorWorkflow: document.getElementById('image-generator-workflow'),
        pdfGeneratorWorkflow: document.getElementById('pdf-generator-workflow'),
        imageFormatGuide: document.getElementById('image-format-guide'),
        imageLangSelectorContainer: document.getElementById('image-lang-selector-container'),
        imageFileInput: document.getElementById('image-file-input'),
        imagePreviewContainer: document.getElementById('image-preview-container'),
        ocrStatus: document.getElementById('ocr-status'),
        imageQuizDefinitionArea: document.getElementById('image-quiz-definition-area'),
        sourceTextImage: document.getElementById('source-text-image'),
        handwritingToggle: document.getElementById('handwriting-toggle'),
        pdfLangSelectorContainer: document.getElementById('pdf-lang-selector-container'),
        pdfFileInput: document.getElementById('pdf-file-input'),
        pdfFileName: document.getElementById('pdf-file-name'),
        pdfOptionsContainer: document.getElementById('pdf-options-container'),
        pdfPageRangeSelector: document.getElementById('pdf-page-range-selector'),
        pdfForceOcrCheckbox: document.getElementById('pdf-force-ocr'),
        pdfStatus: document.getElementById('pdf-status'),
        pdfQuizDefinitionArea: document.getElementById('pdf-quiz-definition-area'),
        sourceTextPdf: document.getElementById('source-text-pdf'),
        aiLinkFallback: document.getElementById('ai-link-fallback'),
        quizDataInput: document.getElementById('quiz-data-input'),
        questionTopic: document.getElementById('question-topic'),
        progress: document.getElementById('progress'),
        timerText: document.getElementById('timer-text'),
        faces: { happy: document.getElementById('face-happy'), worried: document.getElementById('face-worried'), sad: document.getElementById('face-sad'), crying: document.getElementById('face-crying') },
        bookmarkBtn: document.getElementById('bookmark-btn'),
        questionText: document.getElementById('question-text'),
        statementsList: document.getElementById('statements-list'),
        optionsContainer: document.getElementById('options-container'),
        explanationContainer: document.getElementById('explanation-container'),
        explanationText: document.getElementById('explanation-text'),
        quizActions: document.getElementById('quiz-actions'),
        congratsAnimationContainer: document.getElementById('congrats-animation-container'),
        sadReactionOverlay: document.getElementById('sad-reaction-overlay'),
        sadReactionEmoji: document.getElementById('sad-reaction-emoji'),
        pressureModeControls: document.getElementById('pressure-mode-controls'),
        shakeReminderToggle: document.getElementById('shake-reminder-toggle'),
        scoreSummary: document.getElementById('score-summary'),
        scorePerformanceChartContainer: document.getElementById('score-performance-chart-container'),
        quizSummaryDetails: document.getElementById('quiz-summary-details'),
        resultsReview: document.getElementById('results-review'),
        resultsPageTelegramInput: document.getElementById('results-page-telegram-input'),
        saveStatusContainer: document.getElementById('save-status-container'),
        pasteNotification: document.getElementById('paste-notification'),
        manualCopyModalOverlay: document.getElementById('manual-copy-modal-overlay'),
        manualCopyTextarea: document.getElementById('manual-copy-textarea'),
        cropModalOverlay: document.getElementById('crop-modal-overlay'),
        imageToCrop: document.getElementById('image-to-crop'),
        telegramBackupModalOverlay: document.getElementById('telegram-backup-modal-overlay'),
        geminiInstructionsModalOverlay: document.getElementById('gemini-instructions-modal-overlay'),
        playerNameJoinInput: document.getElementById('player-name-join'),
        roomCodeInput: document.getElementById('room-code-input'),
        hostNameInput: document.getElementById('host-name'),
        quizTimeSelect: document.getElementById('quiz-time-select'),
        roomCodeText: document.getElementById('room-code-text'),
        roomCodeDisplay: document.getElementById('room-code-display'),
        lobbyPlayersList: document.getElementById('lobby-players-list'),
        playerCountSpan: document.getElementById('player-count'),
        waitingForHostText: document.getElementById('waiting-for-host-text'),
        multiplayerPersonalSummary: document.getElementById('multiplayer-personal-summary'),
        mpQuizActions: document.getElementById('mp-quiz-actions'),
        mpProgress: document.getElementById('mp-progress'),
        mpTimer: document.getElementById('mp-timer').querySelector('strong'),
        mpQuestionText: document.getElementById('mp-question-text'),
        mpOptionsContainer: document.getElementById('mp-options-container'),
        mpExplanationContainer: document.getElementById('mp-explanation-container'),
        waitingForSubmissionOverlay: document.getElementById('waiting-for-submission-overlay'),
        mpFaceHappy: document.getElementById('mp-face-happy'),
        mpFaceAngry: document.getElementById('mp-face-angry'),
        searchInput: document.getElementById('search-input'),
        searchResultsContainer: document.getElementById('search-results-container'),
    };
    const dbHelper = {
        db: null, dbName: 'examyatriDB', storeName: 'sessionState',
        async init() { return new Promise((resolve, reject) => { const request = indexedDB.open(this.dbName, 1); request.onupgradeneeded = (event) => { const db = event.target.result; if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
        } }; request.onsuccess = (event) => { this.db = event.target.result; resolve(this.db); }; request.onerror = (event) => { console.error('IndexedDB error:', event.target.error); reject(event.target.error); }; }); },
        async set(key, value) { if (!this.db)
            await this.init(); return new Promise((resolve, reject) => { const transaction = this.db.transaction([this.storeName], 'readwrite'); const store = transaction.objectStore(this.storeName); const request = store.put(value, key); request.onsuccess = () => resolve(); request.onerror = (event) => reject(event.target.error); }); },
        async get(key) { if (!this.db)
            await this.init(); return new Promise((resolve, reject) => { const transaction = this.db.transaction([this.storeName], 'readonly'); const store = transaction.objectStore(this.storeName); const request = store.get(key); request.onsuccess = () => resolve(request.result); request.onerror = (event) => reject(event.target.error); }); },
        async clear() { if (!this.db)
            await this.init(); return new Promise((resolve, reject) => { const transaction = this.db.transaction([this.storeName], 'readwrite'); const store = transaction.objectStore(this.storeName); const request = store.clear(); request.onsuccess = () => resolve(); request.onerror = (event) => reject(event.target.error); }); }
    };
    // --- STATE MANAGEMENT ---
    let gameMode = null;
    const QUIZ_STATE_KEY = 'examyatriQuizState';
    let quizData = [], originalQuizData = [], userAnswers = [];
    let quizMetaData = {};
    let currentQuestionIndex = 0, selectedOptionIndex = null;
    let bookmarkedQuestions = new Set();
    let timerId = null, quizStartTime = null, questionStartTime = null;
    let imageFiles = [];
    let pdfFile = null;
    let cropper = null;
    let currentEditingImageId = null;
    let selectedExam = '';
    let blogPostsLoaded = false;
    let isFromSearchPractice = false;
    let creationWorkflow = null;
    let ocrWorker = null;
    let currentOcrLang = null;
    let selectedImageOcrLang = null;
    let selectedPdfOcrLang = null;
    let promptForGemini = null;
    // Multiplayer State
    let currentRoomCode = null, currentPlayerId = null, isHost = false;
    let roomListener = null, clientTimer = null;
    let lastRoomData = null;
    let mpCurrentQuestionIndex = 0;
    let mpSelectedOptionIndex = null;
    let countdownTimerId = null;
    let isShakeReminderEnabled = true;
    let pressureTextCounter = 1;
    const optionClickSound = new Audio('data:audio/mpeg;base64,UklGRkYAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhMgAAAP//AwD//wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v-');
    const clapSound = new Audio('data:audio/mpeg;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhJAEAAAD///////8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8á');
    // --- GOOGLE SHEET SERVICE ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDGcUoyB3xAsoI2yOURbEjbsEmiM7-dZgvvvTqEuXxu86gYC-JyvBV8G2z9JpEhYcR2g/exec";
    async function saveQuizToSheet(quizData) {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(quizData),
            });
            const textResponse = await response.text();
            return JSON.parse(textResponse);
        }
        catch (error) {
            console.error('Error saving quiz:', error);
            return { status: 'error', uniqueID: '' };
        }
    }
    async function searchQuizzesInSheet(query) {
        try {
            const response = await fetch(`${SCRIPT_URL}?topic=${encodeURIComponent(query)}`);
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Error searching quizzes:', error);
            return [];
        }
    }
    async function getQuizByIdFromSheet(id) {
        try {
            const response = await fetch(`${SCRIPT_URL}?id=${encodeURIComponent(id)}`);
            const data = await response.json();
            if (data.error) {
                console.error(data.error);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Error fetching quiz by ID:', error);
            return null;
        }
    }
    // ========================================================================
    // --- NEWLY IMPLEMENTED/FIXED CORE FUNCTIONS START HERE ---
    // ========================================================================
    // --- THEME & SETTINGS ---
    const THEME_KEY = 'examyatriTheme';
    function applyInitialTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-mode');
            if (themeToggleBtn)
                themeToggleBtn.textContent = '☀️';
        }
        else {
            document.body.classList.add('dark-mode');
            if (themeToggleBtn)
                themeToggleBtn.textContent = '🌙';
        }
    }
    function toggleTheme() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (isDarkMode) {
            localStorage.setItem(THEME_KEY, 'dark');
            if (themeToggleBtn)
                themeToggleBtn.textContent = '🌙';
        }
        else {
            localStorage.setItem(THEME_KEY, 'light');
            if (themeToggleBtn)
                themeToggleBtn.textContent = '☀️';
        }
    }
    function loadPressureModeSettings() {
        const savedSetting = localStorage.getItem('shakeReminderEnabled');
        isShakeReminderEnabled = savedSetting !== 'false';
        const toggle = document.getElementById('shake-reminder-toggle');
        if (toggle) {
            toggle.checked = isShakeReminderEnabled;
        }
    }
    // --- DYNAMIC PROMPT BUILDER ---
    function setupDynamicPromptBuilder() {
        const builderContainer = document.getElementById('dynamic-prompt-builder');
        const addBtn = document.getElementById('prompt-builder-add-btn');
        if (!builderContainer || !addBtn)
            return;
        const createRow = (isFirstRow = false) => {
            const rowId = `prompt-row-${Date.now()}${Math.random()}`;
            const row = document.createElement('div');
            row.className = 'prompt-builder-row';
            row.id = rowId;
            row.innerHTML = `
                <div class="concise-summary">Click to edit section</div>
                <div class="prompt-builder-grid">
                    <div class="input-group"><label class="input-label" for="numQuestions-${rowId}">No. of Questions</label><input type="number" class="input-field" data-type="numQuestions" id="numQuestions-${rowId}" placeholder="e.g., 10" min="1"></div>
                    <div class="input-group"><label class="input-label" for="subject-${rowId}">Subject</label><input type="text" class="input-field" data-type="subject" id="subject-${rowId}" placeholder="e.g., Physics"></div>
                    <div class="input-group"><label class="input-label" for="topic-${rowId}">Topic</label><input type="text" class="input-field" data-type="topic" id="topic-${rowId}" placeholder="e.g., Kinematics"></div>
                    <div class="input-group"><label class="input-label" for="standard-${rowId}">Class/Standard</label><input type="text" class="input-field" data-type="standard" id="standard-${rowId}" placeholder="e.g., 11th (Optional)"></div>
                    <div class="input-group"><label class="input-label" for="book-${rowId}">Reference Book</label><input type="text" class="input-field" data-type="book" id="book-${rowId}" placeholder="e.g., NCERT (Optional)"></div>
                </div>
                ${!isFirstRow ? `<button class="prompt-builder-remove-btn" title="Remove Section">&times;</button>` : ''}
            `;
            builderContainer.appendChild(row);
            const removeBtn = row.querySelector('.prompt-builder-remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => { e.stopPropagation(); row.remove(); });
            }
            row.addEventListener('click', () => { if (row.classList.contains('concise')) {
                row.classList.remove('concise');
            } });
            row.querySelectorAll('input').forEach(input => {
                input.addEventListener('focus', () => {
                    document.querySelectorAll('.prompt-builder-row').forEach(r => { if (r.id !== row.id)
                        r.classList.add('concise'); });
                });
            });
        };
        addBtn.addEventListener('click', () => createRow());
        if (builderContainer.children.length === 0)
            createRow(true);
    }
    // --- SYSTEM & NAVIGATION ---
    async function handleHardReset() {
        if (confirm("Are you sure you want to go to the home screen? All current progress and stored data will be deleted.")) {
            quizData = [];
            userAnswers = [];
            currentQuestionIndex = 0;
            bookmarkedQuestions.clear();
            if (timerId)
                clearInterval(timerId);
            localStorage.clear();
            sessionStorage.clear();
            await dbHelper.clear();
            window.location.href = window.location.origin + window.location.pathname;
        }
    }
    // --- SEARCH ---
    async function handlePerformSearch() {
        const query = elements.searchInput.value.trim();
        if (!query) {
            alert("Please enter a topic or ID to search.");
            return;
        }
        showLoading("Searching...");
        try {
            const results = await searchQuizzesInSheet(query);
            const resultsContainer = elements.searchResultsContainer;
            resultsContainer.innerHTML = '';
            if (results && results.length > 0) {
                results.forEach((result) => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.dataset.id = result.id;
                    item.innerHTML = `<h4>${result.topic || 'Untitled Quiz'}</h4><p>Subject: ${result.subject || 'N/A'} | Questions: ${result.questionCount || 'N/A'}</p>`;
                    resultsContainer.appendChild(item);
                });
            }
            else {
                resultsContainer.innerHTML = '<p style="text-align:center;">No quizzes found matching your search.</p>';
            }
        }
        catch (error) {
            console.error("Search failed:", error);
            alert("An error occurred during the search.");
        }
        finally {
            hideLoading();
        }
    }
    async function handleStartQuizFromSearch(id) {
        showLoading("Loading quiz...");
        try {
            const quiz = await getQuizByIdFromSheet(id);
            if (quiz && quiz.questions) {
                quizData = quiz.questions;
                quizMetaData = { topic: quiz.topic || "Practice Quiz", subject: quiz.subject || "General", examName: quiz.exam || "General" };
                isFromSearchPractice = true;
                startQuiz();
            }
            else {
                alert("Could not load the selected quiz. It might have been deleted.");
            }
        }
        catch (error) {
            console.error("Failed to load quiz by ID:", error);
            alert("An error occurred while loading the quiz.");
        }
        finally {
            hideLoading();
        }
    }
    // --- NOTIFICATIONS & UI FEEDBACK ---
    function showPasteNotification(message) {
        if (!elements.pasteNotification)
            return;
        elements.pasteNotification.textContent = message;
        elements.pasteNotification.classList.add('show');
        setTimeout(() => {
            elements.pasteNotification.classList.remove('show');
        }, 3000);
    }
    async function copyTextToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showPasteNotification('✅ Copied to clipboard!');
        }
        catch (err) {
            console.error('Clipboard write failed:', err);
            const textarea = elements.manualCopyTextarea;
            textarea.value = text;
            elements.manualCopyModalOverlay.classList.remove('hidden');
            textarea.select();
            textarea.setSelectionRange(0, 99999);
        }
    }
    function triggerCongratsAnimation() {
        const container = elements.congratsAnimationContainer;
        if (!container)
            return;
        container.innerHTML = '';
        const emojis = ['🎉', '🎊', '🥳', '✨', '👏', '🚀'];
        for (let i = 0; i < 20; i++) {
            const emoji = document.createElement('span');
            emoji.className = 'congrats-emoji';
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            const angle = Math.random() * 360;
            const distance = Math.random() * 200 + 100;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;
            emoji.style.setProperty('--transform-end', `translate(${x}px, ${y}px)`);
            emoji.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(emoji);
        }
    }
    function showSadReaction() {
        const emojis = ['😢', '😭', '😥', '😟'];
        if (elements.sadReactionEmoji)
            elements.sadReactionEmoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        elements.sadReactionOverlay.classList.remove('hidden');
        setTimeout(() => elements.sadReactionOverlay.classList.add('hidden'), 1500);
    }
    // --- QUIZ LIFECYCLE ---
    function startQuiz() {
        if (!quizData || quizData.length === 0) {
            alert("No questions found to start the quiz.");
            return;
        }
        originalQuizData = JSON.parse(JSON.stringify(quizData));
        userAnswers = new Array(quizData.length).fill(null);
        currentQuestionIndex = 0;
        bookmarkedQuestions.clear();
        quizStartTime = new Date();
        questionStartTime = Date.now();
        showScreen('player');
        loadQuestion(0);
        startTimer();
        saveQuizState();
    }
    function startTimer() {
        if (timerId)
            clearInterval(timerId);
        timerId = setInterval(updateTimer, 1000);
    }
    function updateTimer() {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - quizStartTime.getTime()) / 1000);
        const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const seconds = String(elapsedSeconds % 60).padStart(2, '0');
        elements.timerText.textContent = `${minutes}:${seconds}`;
        updateFace(elapsedSeconds);
    }
    function updateFace(elapsedSeconds) {
        const totalQuestions = quizData.length;
        const timePerQuestion = 90; // Average 90 seconds per question
        const totalTime = totalQuestions * timePerQuestion;
        const faces = [elements.faces.happy, elements.faces.worried, elements.faces.sad, elements.faces.crying];
        faces.forEach(f => f?.classList.remove('visible'));
        if (elapsedSeconds > totalTime) {
            elements.faces.crying?.classList.add('visible');
        }
        else if (elapsedSeconds > totalTime * 0.75) {
            elements.faces.sad?.classList.add('visible');
        }
        else if (elapsedSeconds > totalTime * 0.5) {
            elements.faces.worried?.classList.add('visible');
        }
        else {
            elements.faces.happy?.classList.add('visible');
        }
    }
    function loadQuestion(index) {
        if (index < 0 || index >= quizData.length)
            return;
        currentQuestionIndex = index;
        selectedOptionIndex = null;
        questionStartTime = Date.now();
        const question = quizData[index];
        const userAnswer = userAnswers[index];
        elements.questionTopic.textContent = quizMetaData.topic || 'Quiz';
        elements.progress.textContent = `Question ${index + 1} / ${quizData.length}`;
        elements.questionText.innerHTML = question.question.replace(/\n/g, '<br>');
        elements.bookmarkBtn.classList.toggle('bookmarked', bookmarkedQuestions.has(index));
        elements.optionsContainer.innerHTML = '';
        question.options.forEach((opt, i) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'option';
            optDiv.dataset.index = String(i);
            optDiv.innerHTML = `<span class="option-text">${opt}</span><div class="option-feedback"><span class="user-choice-emoji"></span><span class="feedback-icon"></span></div>`;
            elements.optionsContainer.appendChild(optDiv);
        });
        elements.explanationContainer.classList.add('hidden');
        if (userAnswer !== null) {
            renderAnsweredState(userAnswer.selectedOption, question.correctAnswerIndex);
        }
        updateQuizActions();
        if (window.MathJax)
            window.MathJax.typesetPromise([elements.quizPlayerContainer]);
        saveQuizState();
    }
    function renderAnsweredState(selectedIndex, correctIndex) {
        const question = quizData[currentQuestionIndex];
        const options = document.querySelectorAll('#options-container .option');
        options.forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === correctIndex) {
                opt.classList.add('correct');
                opt.querySelector('.feedback-icon').textContent = '✔️';
            }
            if (i === selectedIndex) {
                if (selectedIndex !== correctIndex) {
                    opt.classList.add('incorrect');
                    opt.querySelector('.feedback-icon').textContent = '❌';
                }
                const emoji = selectedIndex === correctIndex ? '😊' : '🤔';
                const emojiSpan = opt.querySelector('.user-choice-emoji');
                emojiSpan.textContent = emoji;
                emojiSpan.classList.add('visible');
            }
        });
        if (question.explanation) {
            elements.explanationText.innerHTML = question.explanation;
            elements.explanationContainer.classList.remove('hidden');
            if (window.MathJax)
                window.MathJax.typesetPromise([elements.explanationContainer]);
        }
    }
    function selectOption(index) {
        const option = document.querySelector(`#options-container .option[data-index='${index}']`);
        if (!option || option.classList.contains('disabled'))
            return;
        optionClickSound.play();
        selectedOptionIndex = index;
        document.querySelectorAll('#options-container .option').forEach((opt, i) => opt.classList.toggle('selected', i === index));
        updateQuizActions();
    }
    function checkAnswer() {
        if (selectedOptionIndex === null)
            return;
        const question = quizData[currentQuestionIndex];
        const isCorrect = selectedOptionIndex === question.correctAnswerIndex;
        userAnswers[currentQuestionIndex] = { selectedOption: selectedOptionIndex, isCorrect: isCorrect, timeTaken: (Date.now() - (questionStartTime || Date.now())) / 1000 };
        if (isCorrect) {
            clapSound.play();
            triggerCongratsAnimation();
        }
        else {
            showSadReaction();
        }
        renderAnsweredState(selectedOptionIndex, question.correctAnswerIndex);
        updateQuizActions();
        saveQuizState();
    }
    function handleSkip() {
        userAnswers[currentQuestionIndex] = { selectedOption: null, isCorrect: false, skipped: true, timeTaken: (Date.now() - (questionStartTime || Date.now())) / 1000 };
        if (currentQuestionIndex < quizData.length - 1) {
            loadQuestion(currentQuestionIndex + 1);
        }
        else {
            showResults();
        }
    }
    function forceSubmitQuiz() {
        if (confirm("Are you sure you want to submit the quiz?")) {
            showResults();
        }
    }
    function handleBookmark() {
        if (bookmarkedQuestions.has(currentQuestionIndex)) {
            bookmarkedQuestions.delete(currentQuestionIndex);
        }
        else {
            bookmarkedQuestions.add(currentQuestionIndex);
        }
        elements.bookmarkBtn.classList.toggle('bookmarked');
        saveQuizState();
    }
    function updateQuizActions() {
        elements.quizActions.innerHTML = '';
        const isAnswered = userAnswers[currentQuestionIndex] !== null;
        const prevBtn = `<button id="prev-question-btn" class="btn btn-secondary quiz-actions-top-left" ${currentQuestionIndex === 0 ? 'disabled' : ''}>⬅️ Previous</button>`;
        const nextBtn = `<button id="next-question-btn" class="btn quiz-actions-bottom-left" ${currentQuestionIndex === quizData.length - 1 ? 'disabled' : ''}>Next ➡️</button>`;
        const checkBtn = `<button id="check-answer-btn" class="btn quiz-actions-top-right" ${selectedOptionIndex === null ? 'disabled' : ''}>Check Answer ✅</button>`;
        const skipBtn = `<button id="skip-question-btn" class="btn quiz-actions-bottom-left">Skip ➡️</button>`;
        const submitBtn = `<button id="submit-quiz-btn" class="btn btn-danger quiz-actions-bottom-right">Submit</button>`;
        if (isAnswered) {
            elements.quizActions.innerHTML = prevBtn + nextBtn + submitBtn;
        }
        else {
            elements.quizActions.innerHTML = prevBtn + checkBtn + skipBtn + submitBtn;
        }
    }
    async function showResults() {
        if (timerId)
            clearInterval(timerId);
        showScreen('results');
        const correct = userAnswers.filter(a => a?.isCorrect).length;
        const incorrect = userAnswers.filter(a => a && !a.isCorrect && !a.skipped).length;
        const skipped = userAnswers.filter(a => a?.skipped).length;
        const total = quizData.length;
        const score = total > 0 ? (correct / total * 100).toFixed(2) : 0;
        elements.scoreSummary.innerHTML = `You scored ${correct} out of ${total} (${score}%)`;
        elements.scoreSummary.classList.add('visible');
        const totalTime = Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        // Chart & Details
        const correctDeg = (correct / total) * 360;
        const incorrectDeg = (incorrect / total) * 360;
        elements.scorePerformanceChartContainer.innerHTML = `
            <div class="performance-pie-chart" style="background-image: conic-gradient(
                var(--correct-color) 0deg ${correctDeg}deg,
                var(--incorrect-color) ${correctDeg}deg ${correctDeg + incorrectDeg}deg,
                var(--skipped-color) ${correctDeg + incorrectDeg}deg 360deg
            )"></div>
            <div class="chart-legend">
                <div class="legend-item"><span class="legend-color-box" style="background-color: var(--correct-color);"></span>Correct: ${correct}</div>
                <div class="legend-item"><span class="legend-color-box" style="background-color: var(--incorrect-color);"></span>Incorrect: ${incorrect}</div>
                <div class="legend-item"><span class="legend-color-box" style="background-color: var(--skipped-color);"></span>Skipped: ${skipped}</div>
            </div>`;
        elements.quizSummaryDetails.innerHTML = `
            <div class="summary-item"><span class="summary-label">Total Questions</span><span class="summary-value">${total}</span></div>
            <div class="summary-item"><span class="summary-label">Time Taken</span><span class="summary-value">${minutes}m ${seconds}s</span></div>
            <div class="summary-item"><span class="summary-label">Accuracy</span><span class="summary-value remark">${(correct / (correct + incorrect) * 100 || 0).toFixed(1)}%</span></div>
            <div class="summary-item"><span class="summary-label">Attempted</span><span class="summary-value">${correct + incorrect}</span></div>`;
        // Review Section
        elements.resultsReview.innerHTML = '';
        quizData.forEach((q, i) => {
            const userAnswer = userAnswers[i];
            const isBookmarked = bookmarkedQuestions.has(i);
            const reviewItem = document.createElement('div');
            reviewItem.className = 'result-item';
            let optionsHtml = '<ul class="result-options-list">';
            q.options.forEach((opt, optIndex) => {
                let classes = 'result-option';
                if (optIndex === q.correctAnswerIndex)
                    classes += ' correct-answer';
                if (userAnswer && optIndex === userAnswer.selectedOption)
                    classes += ' user-selected';
                optionsHtml += `<li class="${classes}">${String.fromCharCode(97 + optIndex)}) ${opt}</li>`;
            });
            optionsHtml += '</ul>';
            reviewItem.innerHTML = `
                <p class="result-question">Q${i + 1}: ${q.question} <span class="bookmark-indicator ${isBookmarked ? 'visible' : ''}">⭐</span></p>
                ${optionsHtml}
                <div class="result-explanation"><h5>Explanation</h5>${q.explanation || 'Not provided.'}</div>`;
            elements.resultsReview.appendChild(reviewItem);
        });
        if (window.MathJax)
            window.MathJax.typesetPromise([elements.resultsReview]);
        await dbHelper.set(QUIZ_STATE_KEY, null); // Clear saved state
    }
    // --- RESULTS SCREEN ACTIONS ---
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 10;
        doc.text(`Quiz Results: ${quizMetaData.topic}`, 10, y);
        y += 10;
        quizData.forEach((q, i) => {
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
            const questionText = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, 180);
            doc.text(questionText, 10, y);
            y += questionText.length * 5;
            q.options.forEach((opt, optIdx) => {
                doc.text(`${String.fromCharCode(97 + optIdx)}) ${opt}`, 15, y);
                y += 7;
            });
            doc.text(`Correct Answer: ${String.fromCharCode(97 + q.correctAnswerIndex)}`, 15, y);
            y += 7;
            y += 5;
        });
        doc.save(`${quizMetaData.topic || 'quiz'}_results.pdf`);
    }
    function copyQuizContent(bookmarkedOnly) {
        let text = '';
        quizData.forEach((q, i) => {
            if (bookmarkedOnly && !bookmarkedQuestions.has(i))
                return;
            text += `Q${i + 1}: ${q.question}\n`;
            q.options.forEach((opt, optIdx) => {
                text += `${String.fromCharCode(97 + optIdx)}) ${opt}\n`;
            });
            text += `Correct Answer: ${String.fromCharCode(97 + q.correctAnswerIndex)}\n`;
            text += `Explanation: ${q.explanation}\n\n`;
        });
        copyTextToClipboard(text);
    }
    function shareOnWhatsApp() {
        const correct = userAnswers.filter(a => a?.isCorrect).length;
        const total = quizData.length;
        const text = `I just scored ${correct}/${total} on a ${quizMetaData.topic} quiz! 🚀 Check out this awesome quiz generator: ${window.location.href}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
    function shareWebsite() { copyTextToClipboard(window.location.href); }
    function openTelegramWithBookmarks() {
        const username = elements.resultsPageTelegramInput.value.trim();
        if (username) {
            window.open(`https://t.me/${username}`, '_blank');
        }
        else {
            alert("Please enter a Telegram username.");
        }
    }
    // --- MULTIPLAYER ACTIONS ---
    function selectMultiplayerOption(index) {
        const option = document.querySelector(`#mp-options-container .option[data-index='${index}']`);
        if (!option || option.classList.contains('disabled'))
            return;
        optionClickSound.play();
        mpSelectedOptionIndex = index;
        document.querySelectorAll('#mp-options-container .option').forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
        updateMultiplayerQuizActions();
    }
    function checkMultiplayerAnswer() {
        if (mpSelectedOptionIndex === null)
            return;
        const question = quizData[mpCurrentQuestionIndex];
        const isCorrect = mpSelectedOptionIndex === question.correctAnswerIndex;
        if (isCorrect) {
            triggerCongratsAnimation();
            showMultiplayerFaceReaction(true);
        }
        else {
            showSadReaction();
            showMultiplayerFaceReaction(false);
        }
        renderMultiplayerAnsweredState(mpSelectedOptionIndex, isCorrect);
        saveMultiplayerAnswer(mpSelectedOptionIndex, isCorrect);
        updateMultiplayerQuizActions();
    }
    // ========================================================================
    // --- END OF NEWLY IMPLEMENTED FUNCTIONS ---
    // ========================================================================
    // --- INITIALIZATION ---
    async function init() {
        applyInitialTheme();
        populateSharedElements();
        setupAudio();
        setupEventListeners();
        setupAllExamSelectors();
        loadFormState();
        loadScrollPosition();
        loadPressureModeSettings();
        document.getElementById('pdf-force-ocr').checked = true;
        await dbHelper.init();
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('beforeunload', (event) => {
            const isQuizActive = !elements.quizPlayerContainer.classList.contains('hidden') && quizData.length > 0;
            const isMultiplayerQuizActive = !elements.multiplayerQuizPlayerContainer.classList.contains('hidden');
            if (isQuizActive || isMultiplayerQuizActive) {
                event.preventDefault();
                event.returnValue = '';
            }
        });
        const quizRestored = await loadQuizState();
        if (quizRestored) {
            showScreen('player');
        }
        else {
            handleHashChange();
        }
        setupDynamicPromptBuilder();
    }
    function setupAudio() { optionClickSound.volume = 0.7; clapSound.volume = 0.5; }
    init();
    // --- UI & SCREEN MANAGEMENT ---
    function showLoading(text) { elements.loadingText.textContent = text; elements.loadingOverlay.classList.remove('hidden'); }
    function hideLoading() { elements.loadingOverlay.classList.add('hidden'); }
    function showScreen(screenName) {
        const newHash = `#${screenName}`;
        if (window.location.hash !== newHash) {
            window.location.hash = newHash;
        }
        else {
            _displayScreen(screenName);
        }
    }
    function _displayScreen(screenName) {
        const screens = {
            modeSelection: elements.modeSelectionContainer,
            multiplayerSelection: elements.multiplayerSelectionContainer,
            manualGenerator: elements.manualGeneratorContainer,
            paste: elements.pasteQuizContainer,
            player: elements.quizPlayerContainer,
            results: elements.resultsScreen,
            joinRoom: elements.joinRoomContainer,
            configureRoom: elements.configureRoomContainer,
            lobby: elements.lobbyContainer,
            mpPlayer: elements.multiplayerQuizPlayerContainer,
            mpResults: elements.multiplayerResultsContainer,
            search: elements.searchContainer,
        };
        const isQuizScreen = screenName === 'player' || screenName === 'mpPlayer';
        if (elements.globalNavBar)
            elements.globalNavBar.classList.toggle('hidden', isQuizScreen);
        Object.values(screens).forEach(screen => { if (screen)
            screen.classList.add('hidden'); });
        if (screens[screenName]) {
            screens[screenName].classList.remove('hidden');
            if (screenName === 'manualGenerator')
                showCreationSelector();
        }
        const blogSection = document.getElementById('blog-section');
        if (blogSection) {
            blogSection.style.display = (screenName === 'modeSelection') ? 'block' : 'none';
            if (screenName === 'modeSelection' && !blogPostsLoaded) {
                loadBlogPosts();
                blogPostsLoaded = true;
            }
        }
    }
    function handleHashChange() {
        const screenName = window.location.hash.substring(1);
        const allScreens = ['modeSelection', 'multiplayerSelection', 'manualGenerator', 'paste', 'player', 'results', 'joinRoom', 'configureRoom', 'lobby', 'mpPlayer', 'mpResults', 'search'];
        if (!screenName || !allScreens.includes(screenName)) {
            _displayScreen('modeSelection');
            return;
        }
        _displayScreen(screenName);
        if (screenName === 'paste')
            setupPasteScreen();
    }
    function loadBlogPosts() {
        const blogSection = document.getElementById("blog-section");
        if (!blogSection)
            return;
        let timeout = setTimeout(() => { handleError(); }, 8000);
        const callbackName = 'handleBloggerResponse';
        window[callbackName] = function (data) {
            clearTimeout(timeout);
            const posts = data.feed.entry?.slice(0, 3);
            if (!posts || posts.length === 0) {
                blogSection.innerHTML = "<p style='text-align:center;'>No recent blog posts found.</p>";
                cleanup();
                return;
            }
            let html = '<div class="blog-feed-container">';
            posts.forEach((post) => {
                const title = post.title.$t;
                const link = post.link.find((l) => l.rel === "alternate").href;
                const content = post.content.$t.replace(/<[^>]+>/g, "");
                const shortDesc = content.substring(0, 120) + "...";
                const imgMatch = post.content.$t.match(/<img[^>]+src="([^">]+)"/);
                const image = imgMatch ? imgMatch[1] : "https://via.placeholder.com/640x360.png?text=ExamYatri";
                html += `<div class="blog-card"><a href="${link}" target="_blank" rel="noopener noreferrer"><img src="${image}" alt="${title}" loading="lazy"><div class="blog-content"><h3>${title}</h3><p>${shortDesc}</p></div></a></div>`;
            });
            html += "</div>";
            blogSection.innerHTML = `<h2 style="text-align:center; margin-bottom: 1.5rem;">Latest from Our Blog</h2>` + html;
            cleanup();
        };
        const handleError = () => { blogSection.innerHTML = "<p style='text-align:center;color:var(--incorrect-color);'>⚠️ Could not load blog posts. Please check your network connection.</p>"; cleanup(); };
        const cleanup = () => { const script = document.getElementById('blogger-jsonp-script'); if (script)
            script.remove(); delete window[callbackName]; };
        const script = document.createElement('script');
        script.id = 'blogger-jsonp-script';
        script.src = `https://examyatrilive.blogspot.com/feeds/posts/default?alt=json&callback=${callbackName}`;
        script.onerror = handleError;
        document.body.appendChild(script);
    }
    function setupEventListeners() {
        document.body.addEventListener('click', (event) => {
            const target = event.target;
            const closestButton = target.closest('[id]');
            const closestPill = target.closest('.lang-pill-btn');
            const effectiveId = closestButton ? closestButton.id : target.id;
            if (effectiveId === 'global-home-btn') {
                handleHardReset();
                return;
            }
            if (effectiveId === 'select-single-player-btn') {
                gameMode = 'singlePlayer';
                showScreen('manualGenerator');
                return;
            }
            if (effectiveId === 'select-multiplayer-btn') {
                gameMode = 'multiplayer';
                showScreen('multiplayerSelection');
                return;
            }
            if (effectiveId === 'search-practice-btn') {
                showScreen('search');
                return;
            }
            if (effectiveId === 'perform-search-btn') {
                handlePerformSearch();
                return;
            }
            if (target.closest('.search-result-item')) {
                const quizId = target.closest('.search-result-item').dataset.id;
                if (quizId)
                    handleStartQuizFromSearch(quizId);
                return;
            }
            if (target.classList.contains('back-to-mode-selection-btn')) {
                showScreen('modeSelection');
                return;
            }
            if (target.classList.contains('back-to-multiplayer-selection-btn')) {
                showScreen('multiplayerSelection');
                return;
            }
            if (target.classList.contains('back-to-creation-selection-btn')) {
                showCreationSelector();
                return;
            }
            if (effectiveId === 'join-room-btn') {
                showScreen('joinRoom');
                return;
            }
            if (effectiveId === 'create-room-btn') {
                showScreen('manualGenerator');
                return;
            }
            if (effectiveId === 'submit-join-room-btn') {
                handleJoinRoom();
                return;
            }
            if (effectiveId === 'generate-code-btn') {
                handleGenerateCode();
                return;
            }
            if (effectiveId === 'start-game-btn') {
                handleStartGame();
                return;
            }
            if (effectiveId === 'share-code-whatsapp-btn') {
                const text = `Join my Examyatri room! 🚀\n\nRoom Code: \`${currentRoomCode}\`\n\nClick the link to join: ${window.location.href}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                return;
            }
            if (effectiveId === 'select-from-topic') {
                showWorkflow('topic');
                return;
            }
            if (effectiveId === 'select-from-text') {
                showWorkflow('text');
                return;
            }
            if (effectiveId === 'select-from-image') {
                showWorkflow('image');
                return;
            }
            if (effectiveId === 'select-from-pdf') {
                showWorkflow('pdf');
                return;
            }
            if (closestPill) {
                const lang = closestPill.dataset.lang;
                const container = closestPill.parentElement;
                container.querySelectorAll('.lang-pill-btn').forEach(btn => btn.classList.remove('active'));
                closestPill.classList.add('active');
                if (container.id === 'image-lang-selector-container')
                    selectedImageOcrLang = lang;
                else if (container.id === 'pdf-lang-selector-container')
                    selectedPdfOcrLang = lang;
                saveFormState();
                return;
            }
            if (effectiveId === 'generate-prompt-btn-topic') {
                generateTopicPrompt();
                return;
            }
            if (effectiveId === 'generate-prompt-btn-text') {
                generateTextPrompt();
                return;
            }
            if (effectiveId === 'generate-prompt-btn-image') {
                generateImagePrompt();
                return;
            }
            if (effectiveId === 'generate-prompt-btn-pdf') {
                generatePdfPrompt();
                return;
            }
            if (effectiveId === 'select-images-btn') {
                if (!selectedImageOcrLang) {
                    alert('Please first select a Document Language.');
                    return;
                }
                elements.imageFileInput.click();
                return;
            }
            if (effectiveId === 'select-pdf-btn') {
                if (!selectedPdfOcrLang) {
                    alert('Please first select a Document Language.');
                    return;
                }
                elements.pdfFileInput.click();
                return;
            }
            if (effectiveId === 'extract-text-pdf-btn') {
                runPdfExtraction();
                return;
            }
            if (target.closest('.crop-btn')) {
                openCropModal(target.closest('.crop-btn').dataset.id);
                return;
            }
            if (target.closest('.remove-btn')) {
                removeImage(target.closest('.remove-btn').dataset.id);
                return;
            }
            if (effectiveId === 'start-manual-quiz-btn') {
                handlePasteAndParse();
                return;
            }
            if (effectiveId === 'paste-from-clipboard-btn') {
                handlePasteFromClipboard();
                return;
            }
            if (target.closest('.option')) {
                const optionIndex = parseInt(target.closest('.option').dataset.index, 10);
                if (elements.quizPlayerContainer.offsetParent !== null)
                    selectOption(optionIndex);
                else if (elements.multiplayerQuizPlayerContainer.offsetParent !== null)
                    selectMultiplayerOption(optionIndex);
                return;
            }
            if (effectiveId === 'check-answer-btn') {
                checkAnswer();
                return;
            }
            if (effectiveId === 'mp-check-answer-btn') {
                checkMultiplayerAnswer();
                return;
            }
            if (effectiveId === 'skip-question-btn') {
                handleSkip();
                return;
            }
            if (effectiveId === 'next-question-btn') {
                loadQuestion(currentQuestionIndex + 1);
                return;
            }
            if (effectiveId === 'mp-next-btn') {
                loadMultiplayerQuestion(mpCurrentQuestionIndex + 1);
                return;
            }
            if (effectiveId === 'prev-question-btn') {
                loadQuestion(currentQuestionIndex - 1);
                return;
            }
            if (effectiveId === 'mp-prev-btn') {
                loadMultiplayerQuestion(mpCurrentQuestionIndex - 1);
                return;
            }
            if (effectiveId === 'submit-quiz-btn') {
                forceSubmitQuiz();
                return;
            }
            if (effectiveId === 'bookmark-btn') {
                handleBookmark();
                return;
            }
            if (effectiveId === 'start-new-practice-btn') {
                localStorage.clear();
                sessionStorage.clear();
                if (dbHelper && dbHelper.clear) {
                    dbHelper.clear();
                }
                location.href = window.location.origin + window.location.pathname;
                return;
            }
            if (effectiveId === 'share-pdf-btn') {
                generatePDF();
                return;
            }
            if (effectiveId === 'copy-bookmarks-btn') {
                copyQuizContent(true);
                return;
            }
            if (effectiveId === 'copy-all-btn') {
                copyQuizContent(false);
                return;
            }
            if (effectiveId === 'share-whatsapp-btn') {
                shareOnWhatsApp();
                return;
            }
            if (effectiveId === 'share-site-btn') {
                shareWebsite();
                return;
            }
            if (effectiveId === 'restart-quiz-btn') {
                handleHardReset();
                return;
            }
            if (effectiveId === 'results-page-open-telegram-btn') {
                openTelegramWithBookmarks();
                return;
            }
            if (effectiveId === 'hard-reset-btn-single' || effectiveId === 'hard-reset-btn-multi') {
                handleHardReset();
                return;
            }
            if (effectiveId === 'theme-toggle-btn') {
                toggleTheme();
                return;
            }
            if (target.closest('.modal-close-btn-top')) {
                target.closest('.modal-overlay').classList.add('hidden');
                return;
            }
            if (effectiveId === 'telegram-backup-guide-btn') {
                elements.telegramBackupModalOverlay.classList.remove('hidden');
                return;
            }
            if (effectiveId === 'telegram-backup-close-btn') {
                elements.telegramBackupModalOverlay.classList.add('hidden');
                return;
            }
            if (effectiveId === 'manual-copy-close-btn') {
                elements.manualCopyModalOverlay.classList.add('hidden');
                return;
            }
            if (effectiveId === 'cancel-crop-btn') {
                closeCropModal();
                return;
            }
            if (effectiveId === 'save-crop-btn') {
                saveCrop();
                return;
            }
            if (effectiveId === 'open-gemini-btn') {
                if (promptForGemini) {
                    executePostPromptActions(promptForGemini);
                }
                return;
            }
            if (effectiveId === 'pressure-mode-toggle-btn') {
                elements.pressureModeControls.classList.toggle('hidden');
                return;
            }
        });
        elements.imageFileInput.addEventListener('change', handleImageSelection);
        elements.pdfFileInput.addEventListener('change', handlePdfSelection);
        elements.shakeReminderToggle.addEventListener('change', (e) => { isShakeReminderEnabled = e.target.checked; localStorage.setItem('shakeReminderEnabled', String(isShakeReminderEnabled)); const checkBtn = document.getElementById('check-answer-btn'); if (!isShakeReminderEnabled && checkBtn)
            checkBtn.classList.remove('vibrating'); });
        document.querySelectorAll('input[name="pdf-page-option"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isRange = e.target.value === 'range';
                elements.pdfPageRangeSelector.classList.toggle('hidden', !isRange);
            });
        });
        window.addEventListener('beforeunload', saveQuizState);
        let scrollTimeout;
        window.addEventListener('scroll', () => { clearTimeout(scrollTimeout); scrollTimeout = setTimeout(saveScrollPosition, 150); });
        getPersistableInputs().forEach(input => { input.addEventListener('input', saveFormState); input.addEventListener('change', saveFormState); });
    }
    // --- FORM & SCROLL PERSISTENCE ---
    function getPersistableInputs() { return document.querySelectorAll('#manual-generator-container input, #manual-generator-container textarea, #manual-generator-container select'); }
    function saveFormState() { const state = {}; const inputs = getPersistableInputs(); inputs.forEach(input => { if (!input.id && !input.name)
        return; const key = input.id || input.name; switch (input.type) {
        case 'checkbox':
            state[key] = input.checked;
            break;
        case 'radio':
            if (input.checked) {
                state[input.name] = input.id;
            }
            break;
        default: state[key] = input.value;
    } }); state['activeExamButton'] = selectedExam; state['selectedImageOcrLang'] = selectedImageOcrLang; state['selectedPdfOcrLang'] = selectedPdfOcrLang; localStorage.setItem(FORM_STATE_KEY, JSON.stringify(state)); }
    function loadFormState() {
        const savedState = localStorage.getItem(FORM_STATE_KEY);
        if (!savedState)
            return;
        const state = JSON.parse(savedState);
        const inputs = getPersistableInputs();
        inputs.forEach(input => {
            if (!input.id && !input.name)
                return;
            const key = input.id || input.name;
            if (input.type === 'radio' && state[input.name]) {
                input.checked = (input.id === state[input.name]);
            }
            else if (state.hasOwnProperty(key)) {
                switch (input.type) {
                    case 'checkbox':
                        input.checked = state[key];
                        break;
                    default: input.value = state[key];
                }
            }
        });
        document.querySelectorAll('.exam-btn').forEach(btn => btn.classList.remove('active'));
        if (state.activeExamButton) {
            selectedExam = state.activeExamButton;
            document.querySelectorAll('.exam-buttons-container').forEach(container => {
                const btnToActivate = container.querySelector(`.exam-btn[data-exam-name="${state.activeExamButton}"]`);
                if (btnToActivate) {
                    btnToActivate.classList.add('active');
                    const otherInput = container.closest('.input-group').querySelector('.prompt-exam-other');
                    if (otherInput)
                        otherInput.classList.toggle('hidden', state.activeExamButton !== 'Other');
                }
            });
        }
        document.querySelectorAll('input[name="pdf-page-option"]').forEach(radio => {
            if (radio.checked)
                elements.pdfPageRangeSelector.classList.toggle('hidden', radio.value !== 'range');
        });
        if (state.selectedImageOcrLang) {
            selectedImageOcrLang = state.selectedImageOcrLang;
            const btn = elements.imageLangSelectorContainer.querySelector(`.lang-pill-btn[data-lang="${selectedImageOcrLang}"]`);
            if (btn)
                btn.classList.add('active');
        }
        if (state.selectedPdfOcrLang) {
            selectedPdfOcrLang = state.selectedPdfOcrLang;
            const btn = elements.pdfLangSelectorContainer.querySelector(`.lang-pill-btn[data-lang="${selectedPdfOcrLang}"]`);
            if (btn)
                btn.classList.add('active');
        }
    }
    function clearFormState() {
        localStorage.removeItem(FORM_STATE_KEY);
        localStorage.removeItem(SCROLL_POS_KEY);
        selectedImageOcrLang = null;
        selectedPdfOcrLang = null;
        document.querySelectorAll('.lang-pill-btn.active').forEach(c => c.classList.remove('active'));
    }
    function saveScrollPosition() { if (elements.manualGeneratorContainer.offsetParent !== null) {
        localStorage.setItem(SCROLL_POS_KEY, String(window.scrollY));
    } }
    function loadScrollPosition() { const scrollY = localStorage.getItem(SCROLL_POS_KEY); if (scrollY && elements.manualGeneratorContainer.offsetParent !== null) {
        setTimeout(() => window.scrollTo(0, parseInt(scrollY, 10)), 100);
    } }
    function handlePasteAndParse() {
        const gameMode = sessionStorage.getItem('gameMode');
        const text = elements.quizDataInput.value.trim();
        if (!text) {
            alert('Please paste the response into the box.');
            return;
        }
        sessionStorage.removeItem('gameMode');
        if (gameMode === 'multiplayer') {
            localStorage.setItem('multiplayerQuizText', text);
            showScreen('configureRoom');
        }
        else {
            if (!quizMetaData || Object.keys(quizMetaData).length === 0)
                quizMetaData = { topic: '', subject: '' };
            const parsedQuestions = flexibleParser(text);
            if (!parsedQuestions || parsedQuestions.length === 0) {
                alert('Parsing Failed: Could not find any valid questions. Please check the text from the AI.');
                return;
            }
            quizData = parsedQuestions;
            startQuiz();
        }
    }
    // --- MULTIPLAYER LOGIC ---
    async function handleJoinRoom() {
        const playerName = elements.playerNameJoinInput.value.trim();
        const roomCode = elements.roomCodeInput.value.trim();
        if (!playerName || !roomCode) {
            alert('Please fill in all fields.');
            return;
        }
        const { db, ref, get, set, push } = window.firebase;
        const roomRef = ref(db, `rooms/${roomCode}`);
        try {
            const snapshot = await get(roomRef);
            if (!snapshot.exists()) {
                alert('Room not found. Please check the code.');
                return;
            }
            const roomData = snapshot.val();
            if (Object.keys(roomData.players || {}).length >= 4) {
                alert('This room is full.');
                return;
            }
            if (roomData.status !== 'waiting') {
                alert('This game has already started or finished.');
                return;
            }
            currentRoomCode = roomCode;
            const newPlayerRef = push(ref(db, `rooms/${currentRoomCode}/players`));
            currentPlayerId = newPlayerRef.key;
            await set(newPlayerRef, { name: playerName, isHost: false, score: 0, answers: [] });
            enterLobby();
        }
        catch (error) {
            console.error("Failed to join room: ", error);
            alert("Could not join the room.");
        }
    }
    async function handleGenerateCode() {
        const hostName = elements.hostNameInput.value.trim();
        const quizText = localStorage.getItem('multiplayerQuizText');
        if (!hostName) {
            alert('Please enter your name.');
            return;
        }
        if (!quizText) {
            alert('Error: Question text not found. Please go back and create the questions.');
            return;
        }
        isHost = true;
        currentRoomCode = Math.floor(100000 + Math.random() * 900000).toString();
        const { db, ref, set, push, serverTimestamp } = window.firebase;
        const playersRef = ref(db, `rooms/${currentRoomCode}/players`);
        const newPlayerRef = push(playersRef);
        currentPlayerId = newPlayerRef.key;
        const roomData = {
            quizText: quizText,
            totalQuizTime: parseInt(elements.quizTimeSelect.value, 10),
            hostId: currentPlayerId,
            status: 'waiting',
            createdAt: serverTimestamp(),
            players: { [currentPlayerId]: { name: hostName, isHost: true, score: 0, answers: [] } },
        };
        try {
            await set(ref(db, `rooms/${currentRoomCode}`), roomData);
            localStorage.removeItem('multiplayerQuizText');
            enterLobby();
        }
        catch (error) {
            console.error("Firebase write failed: ", error);
            alert("Could not create the room.");
        }
    }
    function enterLobby() {
        showScreen('lobby');
        if (isHost) {
            elements.roomCodeText.textContent = currentRoomCode;
            elements.roomCodeDisplay.classList.remove('hidden');
            document.getElementById('start-game-btn').classList.remove('hidden');
            elements.waitingForHostText.classList.add('hidden');
        }
        else {
            document.getElementById('lobby-title').textContent = "You've Joined the Room!";
            elements.roomCodeDisplay.classList.add('hidden');
            document.getElementById('start-game-btn').classList.add('hidden');
            elements.waitingForHostText.classList.remove('hidden');
        }
        listenForRoomChanges();
    }
    function listenForRoomChanges() {
        const { db, ref, onValue, runTransaction } = window.firebase;
        const roomRef = ref(db, `rooms/${currentRoomCode}`);
        if (roomListener)
            roomListener();
        roomListener = onValue(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                if (clientTimer)
                    clearInterval(clientTimer);
                const resultsScreenVisible = !elements.multiplayerResultsContainer.classList.contains('hidden');
                if (!resultsScreenVisible) {
                    alert("The host has left or the room was deleted.");
                    window.location.hash = '';
                }
                return;
            }
            const roomData = snapshot.val();
            lastRoomData = roomData;
            if (roomData.status === 'waiting') {
                const players = roomData.players || {};
                elements.lobbyPlayersList.innerHTML = '';
                Object.values(players).forEach((player) => {
                    const li = document.createElement('li');
                    li.textContent = player.name;
                    if (player.isHost)
                        li.innerHTML += ' 👑';
                    elements.lobbyPlayersList.appendChild(li);
                });
                elements.playerCountSpan.textContent = String(Object.keys(players).length);
                if (isHost) {
                    document.getElementById('start-game-btn').disabled = Object.keys(players).length < 1;
                }
            }
            if (roomData.status === 'playing' && elements.multiplayerQuizPlayerContainer.classList.contains('hidden')) {
                startMultiplayerQuiz(roomData);
            }
            const allPlayersFinished = Object.values(roomData.players || {}).every((p) => p.isFinished);
            if (allPlayersFinished && roomData.status === 'playing') {
                if (isHost) {
                    runTransaction(ref(db, `rooms/${currentRoomCode}/status`), (currentStatus) => currentStatus === 'playing' ? 'finished' : currentStatus);
                }
            }
            if (roomData.status === 'finished') {
                if (clientTimer)
                    clearInterval(clientTimer);
                showFinalLeaderboardAndStartCountdown(roomData);
            }
        });
    }
    async function handleStartGame() {
        const { db, ref, runTransaction, serverTimestamp } = window.firebase;
        const roomRef = ref(db, `rooms/${currentRoomCode}`);
        try {
            await runTransaction(roomRef, (room) => {
                if (room && room.status === 'waiting') {
                    room.status = 'playing';
                    room.startTime = serverTimestamp();
                }
                return room;
            });
        }
        catch (error) {
            console.error("Failed to start game:", error);
            alert("Could not start the game. Please try again.");
        }
    }
    function startMultiplayerQuiz(roomData) {
        quizData = flexibleParser(roomData.quizText);
        mpCurrentQuestionIndex = 0;
        mpSelectedOptionIndex = null;
        showScreen('mpPlayer');
        loadMultiplayerQuestion(mpCurrentQuestionIndex);
        startMultiplayerTimer(roomData.totalQuizTime, roomData.startTime);
    }
    function loadMultiplayerQuestion(index) {
        if (index < 0 || index >= quizData.length)
            return;
        mpCurrentQuestionIndex = index;
        mpSelectedOptionIndex = null;
        const question = quizData[index];
        const myAnswers = lastRoomData?.players[currentPlayerId]?.answers || [];
        const currentAnswer = myAnswers[index];
        elements.mpProgress.textContent = `Question ${index + 1} / ${quizData.length}`;
        elements.mpQuestionText.innerHTML = question.question.replace(/\n/g, '<br>');
        elements.mpOptionsContainer.innerHTML = '';
        question.options.forEach((opt, i) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'option';
            optDiv.dataset.index = String(i);
            optDiv.innerHTML = `<span class="option-text">${opt}</span><div class="option-feedback"><span class="user-choice-emoji"></span><span class="feedback-icon"></span></div>`;
            elements.mpOptionsContainer.appendChild(optDiv);
        });
        elements.mpExplanationContainer.innerHTML = '';
        elements.mpExplanationContainer.classList.add('hidden');
        if (currentAnswer) {
            renderMultiplayerAnsweredState(currentAnswer.selected, currentAnswer.correct);
        }
        else {
            document.querySelectorAll('#mp-options-container .option').forEach(opt => opt.classList.remove('disabled', 'correct', 'incorrect'));
        }
        updateMultiplayerQuizActions();
        if (window.MathJax)
            window.MathJax.typesetPromise([elements.multiplayerQuizPlayerContainer]);
    }
    function renderMultiplayerAnsweredState(selectedIndex, isCorrect) {
        const question = quizData[mpCurrentQuestionIndex];
        const correctEmojis = ['😊', '👍', '✅', '🥳', '✨'];
        const incorrectEmojis = ['🤔', '😟', '❌', '🤦', '🤨'];
        document.querySelectorAll('#mp-options-container .option').forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === question.correctAnswerIndex) {
                opt.classList.add('correct');
                opt.querySelector('.feedback-icon').textContent = '✔️';
            }
            if (i === selectedIndex) {
                const userChoiceEmoji = opt.querySelector('.user-choice-emoji');
                if (isCorrect) {
                    userChoiceEmoji.textContent = correctEmojis[mpCurrentQuestionIndex % correctEmojis.length];
                }
                else {
                    opt.classList.add('incorrect');
                    opt.querySelector('.feedback-icon').textContent = '❌';
                    userChoiceEmoji.textContent = incorrectEmojis[mpCurrentQuestionIndex % incorrectEmojis.length];
                }
                userChoiceEmoji.classList.add('visible');
            }
        });
        if (question.explanation) {
            elements.mpExplanationContainer.innerHTML = `<h4>Explanation</h4><p>${question.explanation}</p>`;
            elements.mpExplanationContainer.classList.remove('hidden');
            if (window.MathJax)
                window.MathJax.typesetPromise([elements.mpExplanationContainer]);
        }
    }
    async function saveMultiplayerAnswer(selectedIndex, isCorrect) {
        const { db, ref, runTransaction } = window.firebase;
        const playerRef = ref(db, `rooms/${currentRoomCode}/players/${currentPlayerId}`);
        try {
            await runTransaction(playerRef, (player) => {
                if (player) {
                    if (!player.answers)
                        player.answers = [];
                    if (!player.answers[mpCurrentQuestionIndex]) {
                        player.answers[mpCurrentQuestionIndex] = { selected: selectedIndex, correct: isCorrect };
                    }
                }
                return player;
            });
        }
        catch (error) {
            console.error("Failed to save answer:", error);
            alert("Could not save your answer. Please check your connection.");
        }
    }
    function updateMultiplayerQuizActions() {
        elements.mpQuizActions.innerHTML = '';
        const myAnswers = lastRoomData?.players[currentPlayerId]?.answers || [];
        const isAnswered = !!myAnswers[mpCurrentQuestionIndex];
        const prevBtn = document.createElement('button');
        prevBtn.id = 'mp-prev-btn';
        prevBtn.className = 'btn btn-secondary quiz-actions-top-left';
        prevBtn.textContent = '⬅️ Previous';
        prevBtn.disabled = mpCurrentQuestionIndex === 0;
        elements.mpQuizActions.appendChild(prevBtn);
        if (isAnswered) {
            const nextBtn = document.createElement('button');
            nextBtn.id = 'mp-next-btn';
            nextBtn.className = 'btn quiz-actions-bottom-left';
            nextBtn.textContent = 'Next ➡️';
            nextBtn.disabled = mpCurrentQuestionIndex >= quizData.length - 1;
            elements.mpQuizActions.appendChild(nextBtn);
        }
        else {
            const checkBtn = document.createElement('button');
            checkBtn.id = 'mp-check-answer-btn';
            checkBtn.className = 'btn btn-success quiz-actions-top-right';
            checkBtn.textContent = 'Check Answer ✅';
            checkBtn.disabled = mpSelectedOptionIndex === null;
            elements.mpQuizActions.appendChild(checkBtn);
            const skipBtn = document.createElement('button');
            skipBtn.id = 'mp-skip-btn';
            skipBtn.className = 'btn quiz-actions-bottom-left';
            skipBtn.style.backgroundColor = '#ffc107';
            skipBtn.style.color = '#333';
            skipBtn.textContent = 'Skip ➡️';
            skipBtn.addEventListener('click', () => { if (mpCurrentQuestionIndex < quizData.length - 1)
                loadMultiplayerQuestion(mpCurrentQuestionIndex + 1); });
            elements.mpQuizActions.appendChild(skipBtn);
        }
        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-danger quiz-actions-bottom-right';
        submitBtn.textContent = 'Submit';
        submitBtn.addEventListener('click', () => submitMultiplayerQuiz(false));
        elements.mpQuizActions.appendChild(submitBtn);
    }
    function showMultiplayerFaceReaction(isCorrect) {
        const faceToShow = isCorrect ? elements.mpFaceHappy : elements.mpFaceAngry;
        const faceToHide = isCorrect ? elements.mpFaceAngry : elements.mpFaceHappy;
        faceToHide.classList.remove('visible');
        faceToShow.classList.add('visible');
        setTimeout(() => { faceToShow.classList.remove('visible'); }, 2000);
    }
    function startMultiplayerTimer(totalSeconds, startTime) {
        if (clientTimer)
            clearInterval(clientTimer);
        const updateTimer = () => {
            const serverTimeOffset = 0;
            const now = Date.now() + serverTimeOffset;
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remainingSeconds = totalSeconds - elapsedSeconds;
            if (remainingSeconds <= 0) {
                elements.mpTimer.textContent = "00:00";
                clearInterval(clientTimer);
                const myData = lastRoomData?.players?.[currentPlayerId];
                if (myData && !myData.isFinished)
                    submitMultiplayerQuiz(true);
                return;
            }
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            elements.mpTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };
        updateTimer();
        clientTimer = setInterval(updateTimer, 1000);
    }
    async function submitMultiplayerQuiz(isAutoSubmit = false) {
        if (!isAutoSubmit && !confirm("Are you sure you want to submit? You cannot change your answers after submitting."))
            return;
        if (clientTimer)
            clearInterval(clientTimer);
        elements.waitingForSubmissionOverlay.classList.remove('hidden');
        const { db, ref, set } = window.firebase;
        const finishedRef = ref(db, `rooms/${currentRoomCode}/players/${currentPlayerId}/isFinished`);
        try {
            await set(finishedRef, true);
            showPersonalMultiplayerResults();
        }
        catch (error) {
            console.error("Failed to submit:", error);
            alert("There was an error submitting. Please check your connection.");
        }
        finally {
            elements.waitingForSubmissionOverlay.classList.add('hidden');
        }
    }
    function showPersonalMultiplayerResults() {
        showScreen('mpResults');
        elements.multiplayerResultsContainer.querySelector('#leaderboard-section').classList.add('hidden');
        elements.multiplayerResultsContainer.querySelector('#waiting-for-leaderboard-text').classList.remove('hidden');
        elements.multiplayerResultsContainer.querySelector('#room-deletion-countdown').classList.add('hidden');
        elements.multiplayerResultsContainer.querySelector('#mp-results-title').textContent = '🏆 Assessment Submitted! 🏆';
        const personalStatsContainer = elements.multiplayerPersonalSummary.querySelector('.summary-grid');
        const myData = lastRoomData.players[currentPlayerId];
        if (myData) {
            const myAnswers = myData.answers || [];
            let correctCount = 0;
            myAnswers.forEach((ans, index) => { if (ans && quizData[index] && ans.correct)
                correctCount++; });
            const finalScore = correctCount * 10;
            const totalAnswered = myAnswers.filter((a) => a !== null && a !== undefined).length;
            const incorrectCount = totalAnswered - correctCount;
            const skippedCount = quizData.length - totalAnswered;
            const percentage = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
            personalStatsContainer.innerHTML = `
                <div class="summary-item"><span class="summary-label">Correct</span><span class="summary-value" style="color: var(--correct-color);">${correctCount}</span></div>
                <div class="summary-item"><span class="summary-label">Incorrect</span><span class="summary-value" style="color: var(--incorrect-color);">${incorrectCount}</span></div>
                <div class="summary-item"><span class="summary-label">Skipped</span><span class="summary-value" style="color: var(--skipped-color);">${skippedCount}</span></div>
                <div class="summary-item"><span class="summary-label">Score</span><span class="summary-value remark">${finalScore} (${percentage.toFixed(0)}%)</span></div>`;
        }
    }
    function showFinalLeaderboardAndStartCountdown(roomData) {
        if (countdownTimerId)
            return;
        if (elements.multiplayerResultsContainer.classList.contains('hidden'))
            showPersonalMultiplayerResults();
        const leaderboardSection = elements.multiplayerResultsContainer.querySelector('#leaderboard-section');
        const waitingText = elements.multiplayerResultsContainer.querySelector('#waiting-for-leaderboard-text');
        const countdownText = elements.multiplayerResultsContainer.querySelector('#room-deletion-countdown');
        const title = elements.multiplayerResultsContainer.querySelector('#mp-results-title');
        title.textContent = '🏆 Final Results 🏆';
        waitingText.classList.add('hidden');
        leaderboardSection.classList.remove('hidden');
        countdownText.classList.remove('hidden');
        const leaderboard = document.getElementById('leaderboard');
        leaderboard.innerHTML = '';
        const players = Object.values(roomData.players || {});
        players.forEach(player => {
            const answers = player.answers || [];
            let correctCount = 0;
            answers.forEach((ans, index) => { if (ans && ans.correct)
                correctCount++; });
            player.finalScore = correctCount * 10;
        });
        players.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
        players.forEach(player => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${player.name} ${player.isHost ? '👑' : ''}</span> <strong>${player.finalScore || 0} Points</strong>`;
            leaderboard.appendChild(li);
        });
        let countdown = 8;
        countdownText.textContent = `Room will be deleted and you will return to the home screen in ${countdown} seconds...`;
        countdownTimerId = setInterval(() => {
            countdown--;
            countdownText.textContent = `Room will be deleted and you will return to the home screen in ${countdown} seconds...`;
            if (countdown <= 0) {
                clearInterval(countdownTimerId);
                countdownTimerId = null;
                handleHardReset();
            }
        }, 1000);
    }
    // --- OCR & Image/PDF Processing ---
    async function getOcrWorker(lang, statusEl) {
        if (ocrWorker && currentOcrLang === lang)
            return ocrWorker;
        if (ocrWorker) {
            statusEl.textContent = 'Switching OCR language model...';
            await ocrWorker.terminate();
            ocrWorker = null;
            currentOcrLang = null;
        }
        const langName = { 'eng': 'English', 'hin': 'Hindi', 'eng+hin': 'English+Hindi' }[lang];
        statusEl.textContent = `Initializing ${langName} OCR Engine (this happens once per language)...`;
        try {
            ocrWorker = await Tesseract.createWorker(lang, 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text')
                        statusEl.textContent = `Recognizing Text... ${(m.progress * 100).toFixed(0)}%`;
                    else if (m.status === 'loading language model')
                        statusEl.textContent = `Loading ${langName} Model... (may take a moment on first load)`;
                }
            });
            currentOcrLang = lang;
            statusEl.textContent = `${langName} OCR Engine is ready.`;
            return ocrWorker;
        }
        catch (error) {
            console.error("Failed to initialize OCR worker:", error);
            statusEl.textContent = `Error: Could not initialize ${langName} OCR engine.`;
            ocrWorker = null;
            currentOcrLang = null;
            return null;
        }
    }
    async function resizeImage(file, maxDimension = 2048) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round(height * (maxDimension / width));
                            width = maxDimension;
                        }
                        else {
                            width = Math.round(width * (maxDimension / height));
                            height = maxDimension;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    async function processAndExtractAllImages(files) {
        if (files.length === 0) {
            hideLoading();
            return;
        }
        showLoading("Preparing OCR Engine...");
        const worker = await getOcrWorker(selectedImageOcrLang, elements.ocrStatus);
        if (!worker) {
            hideLoading();
            alert("OCR Engine could not be started. Please check your internet connection and try again.");
            return;
        }
        imageFiles = files.map(file => ({ originalFile: file, id: `img_${Date.now()}_${Math.random()}`, croppedFile: null, previewUrl: URL.createObjectURL(file) }));
        updateImagePreviews();
        showLoading("Processing images...");
        let allExtractedText = '';
        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const imgState = imageFiles[i];
                const fileToProcess = imgState.croppedFile || imgState.originalFile;
                elements.ocrStatus.textContent = `Resizing image ${i + 1}/${imageFiles.length} for optimal performance...`;
                const mainCanvas = await resizeImage(fileToProcess);
                let bestText = '', bestConfidence = -1;
                for (const angle of [0, 90, 180, 270]) {
                    elements.ocrStatus.textContent = `Analyzing image ${i + 1}/${imageFiles.length} (orientation: ${angle}°)...`;
                    let rotatedCanvas = document.createElement('canvas');
                    let ctx = rotatedCanvas.getContext('2d');
                    if (angle === 90 || angle === 270) {
                        rotatedCanvas.width = mainCanvas.height;
                        rotatedCanvas.height = mainCanvas.width;
                    }
                    else {
                        rotatedCanvas.width = mainCanvas.width;
                        rotatedCanvas.height = mainCanvas.height;
                    }
                    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
                    ctx.rotate(angle * Math.PI / 180);
                    ctx.drawImage(mainCanvas, -mainCanvas.width / 2, -mainCanvas.height / 2);
                    const isHandwriting = elements.handwritingToggle.checked;
                    await worker.setParameters({ tessedit_pageseg_mode: isHandwriting ? Tesseract.PSM.SINGLE_BLOCK : Tesseract.PSM.AUTO });
                    const { data } = await worker.recognize(rotatedCanvas);
                    if (data.confidence > bestConfidence) {
                        bestConfidence = data.confidence;
                        bestText = data.text;
                    }
                    rotatedCanvas.width = 0;
                    rotatedCanvas.height = 0;
                    rotatedCanvas = null;
                    ctx = null;
                    if (angle === 0 && data.confidence > 50)
                        break;
                    if (bestConfidence > 95)
                        break;
                }
                mainCanvas.width = 0;
                mainCanvas.height = 0;
                allExtractedText += bestText + '\n\n';
            }
            elements.sourceTextImage.value = allExtractedText;
            if (allExtractedText.trim()) {
                elements.imageQuizDefinitionArea.classList.remove('hidden');
                elements.ocrStatus.textContent = `✅ Text extracted successfully from ${imageFiles.length} image(s).`;
            }
            else {
                elements.ocrStatus.textContent = `🤔 Could not extract any text. Try clearer images.`;
            }
        }
        catch (err) {
            console.error("Error during image processing:", err);
            elements.ocrStatus.textContent = '❌ Error: Processing failed. This can happen with very large images or on devices with low memory. Please try with smaller or fewer images.';
        }
        finally {
            hideLoading();
        }
    }
    async function runPdfExtraction() {
        if (!pdfFile) {
            alert("Please select a PDF file first.");
            return;
        }
        const useOcr = elements.pdfForceOcrCheckbox.checked;
        let worker;
        if (useOcr) {
            showLoading("Preparing OCR Engine...");
            worker = await getOcrWorker(selectedPdfOcrLang, elements.pdfStatus);
            if (!worker) {
                hideLoading();
                alert("OCR Engine could not be started. Please try again.");
                return;
            }
        }
        showLoading("Extracting text from PDF...");
        elements.pdfStatus.textContent = 'Starting extraction...';
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
                const pageOption = document.querySelector('input[name="pdf-page-option"]:checked').value;
                let startPage = 1, endPage = pdfDoc.numPages;
                if (pageOption === 'range') {
                    startPage = parseInt(document.getElementById('pdf-page-from').value, 10) || 1;
                    endPage = parseInt(document.getElementById('pdf-page-to').value, 10) || pdfDoc.numPages;
                }
                const text = useOcr ? await extractPdfTextWithOcr(pdfDoc, startPage, endPage, worker) : await extractPdfTextNative(pdfDoc, startPage, endPage);
                elements.sourceTextPdf.value = text;
                elements.pdfQuizDefinitionArea.classList.remove('hidden');
                elements.pdfStatus.textContent = '✅ Text extracted successfully!';
            }
            catch (err) {
                console.error("Error during PDF processing:", err);
                elements.pdfStatus.textContent = '❌ Error: Could not process PDF. It may be corrupt, protected, or too large for this device. Try a smaller page range.';
            }
            finally {
                hideLoading();
            }
        };
        reader.onerror = (e) => { console.error("FileReader error:", e); elements.pdfStatus.textContent = '❌ Error: Could not read the selected file.'; hideLoading(); };
        reader.readAsArrayBuffer(pdfFile);
    }
    function showCreationSelector() { elements.manualGeneratorContainer.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden')); ['topic', 'text', 'image', 'pdf'].forEach(w => elements[`${w}GeneratorWorkflow`].classList.add('hidden')); elements.creationMethodSelector.classList.remove('hidden'); elements.imageFormatGuide.classList.add('hidden'); }
    function showWorkflow(workflowName) {
        elements.creationMethodSelector.classList.add('hidden');
        document.querySelector('.back-to-mode-selection-btn').classList.add('hidden');
        ['topic', 'text', 'image', 'pdf'].forEach(w => {
            const key = `${w}GeneratorWorkflow`;
            if (elements[key])
                elements[key].classList.add('hidden');
        });
        const workflowElement = elements[(workflowName + 'GeneratorWorkflow')];
        if (workflowElement) {
            workflowElement.classList.remove('hidden');
            const examButtonsContainer = workflowElement.querySelector('.exam-buttons-container');
            const otherExamInput = workflowElement.querySelector('.prompt-exam-other');
            if (examButtonsContainer && otherExamInput) {
                examButtonsContainer.querySelectorAll('.exam-btn').forEach(btn => btn.classList.remove('active'));
                const btnToActivate = examButtonsContainer.querySelector(`.exam-btn[data-exam-name="${selectedExam}"]`);
                if (btnToActivate)
                    btnToActivate.classList.add('active');
                otherExamInput.classList.toggle('hidden', selectedExam !== 'Other');
            }
            if (workflowName === 'pdf') {
                const rangeRadio = document.getElementById('pdf-page-option-range');
                elements.pdfPageRangeSelector.classList.toggle('hidden', !rangeRadio.checked);
            }
        }
    }
    function populateSharedElements() {
        const formatSelects = document.querySelectorAll('select[id^="question-format-select"]');
        formatSelects.forEach(select => {
            if (!select)
                return;
            select.innerHTML = '';
            Object.keys(QUESTION_FORMATS).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = QUESTION_FORMATS[key].name;
                select.appendChild(option);
            });
            select.value = 'mcq';
        });
    }
    async function saveQuizState() { if (quizData.length === 0 || elements.quizPlayerContainer.classList.contains('hidden')) {
        await dbHelper.set(QUIZ_STATE_KEY, null);
        return;
    } const state = { originalQuizData, userAnswers, currentQuestionIndex, bookmarkedQuestions: Array.from(bookmarkedQuestions), quizStartTime: quizStartTime.toISOString(), quizMetaData: quizMetaData, creationWorkflow: creationWorkflow }; await dbHelper.set(QUIZ_STATE_KEY, state); }
    async function loadQuizState() { const state = await dbHelper.get(QUIZ_STATE_KEY); if (!state)
        return false; try {
        originalQuizData = state.originalQuizData;
        quizData = JSON.parse(JSON.stringify(originalQuizData));
        userAnswers = state.userAnswers;
        currentQuestionIndex = state.currentQuestionIndex;
        bookmarkedQuestions = new Set(state.bookmarkedQuestions);
        quizStartTime = new Date(state.quizStartTime);
        quizMetaData = state.quizMetaData || {};
        creationWorkflow = state.creationWorkflow || null;
        _displayScreen('player');
        loadQuestion(currentQuestionIndex);
        showPasteNotification('✅ Your active assessment has been restored.');
        return true;
    }
    catch (e) {
        console.error("Failed to load state:", e);
        await dbHelper.set(QUIZ_STATE_KEY, null);
        return false;
    } }
    function setupPasteScreen() {
        const tryAutoPaste = async () => {
            if (!navigator.clipboard || !navigator.clipboard.readText)
                return;
            if (elements.quizDataInput.value.trim() !== '')
                return;
            if (document.hidden)
                return;
            try {
                const text = await navigator.clipboard.readText();
                if (text && text.trim() && (text.includes("Question:") || text.includes("Correct Answer:") || text.includes("Assertion (A):"))) {
                    elements.quizDataInput.value = text;
                    showPasteNotification('✨ Auto-pasted! Processing...');
                    handlePasteAndParse();
                }
            }
            catch (err) {
                console.log("Silent auto-paste attempt failed. User can paste manually.", err.name);
            }
        };
        elements.quizDataInput.addEventListener('focus', tryAutoPaste);
        document.addEventListener('visibilitychange', () => { if (!document.hidden && window.location.hash === '#paste')
            tryAutoPaste(); });
        tryAutoPaste();
    }
    async function handlePasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
                elements.quizDataInput.value = text;
                showPasteNotification('✅ Pasted from clipboard! Parsing...');
                handlePasteAndParse();
            }
            else {
                showPasteNotification('🤔 Your clipboard is empty.');
            }
        }
        catch (err) {
            console.error('Failed to read clipboard:', err);
            alert('Could not read from clipboard. This can happen if you denied permission or are in a private browser window. Please paste the text manually into the box.');
        }
    }
    function generatePrompt(source, sourceType) {
        creationWorkflow = sourceType;
        isFromSearchPractice = false;
        const { numQuestions, topic, subject, difficulty, language, formatKey, exam, sourceText } = source;
        if (sourceType === 'topic' && !topic) {
            alert('Please enter a Primary Topic.');
            return null;
        }
        if ((sourceType !== 'topic' && !sourceText) || !numQuestions) {
            alert('Please ensure you have provided source material and the number of questions.');
            return null;
        }
        if (!exam) {
            alert("Please select a target exam before generating questions.");
            return null;
        }
        quizMetaData.examName = exam;
        let sampleFormat = LEGACY_FORMAT_TEXT;
        switch (formatKey) {
            case 'mcq':
                sampleFormat = MCQ_EXAMPLE;
                break;
            case 'statement':
                sampleFormat = STATEMENT_EXAMPLE;
                break;
            case 'assertion-reason':
                sampleFormat = AR_EXAMPLE;
                break;
            case 'math-physics':
                sampleFormat = MATH_EXAMPLE;
                break;
            case 'true-false':
                sampleFormat = TF_EXAMPLE;
                break;
            case 'fill-blank':
                sampleFormat = FILL_BLANK_EXAMPLE;
                break;
        }
        let prompt = `You are an expert at generating high-quality assessment questions in plain text format. Your responses must be very fast and precise.
CRITICAL INSTRUCTIONS (MUST be followed):
1.  **Output Format:** Provide the entire response as a single block of plain text. DO NOT use Markdown, JSON, code blocks, or any other formatting.
2.  **Strict Format Adherence:** You MUST generate questions that EXACTLY match the requested "Question Format" parameter below.
3.  **Question Structure:** STRICTLY follow the sample format provided below for every single question.
4.  **Statement Formatting:** For Statement-Based questions, individual statements MUST be preceded by an asterisk (*) and a space.
5.  **Correct Answer Line:** The 'Correct Answer:' line MUST contain ONLY the letter of the correct option (e.g., "Correct Answer: c").
6.  **Completeness:** Each question MUST have a question, all options, a single correct answer letter, and a detailed explanation.
7.  **Math/Physics Symbols:** Use valid LaTeX for all formulas. Enclose all inline math with \\( ... \\) delimiters.
8.  **Terminology:** Use the term "questions" or "assessment". DO NOT use the word "quiz".
--- ASSESSMENT PARAMETERS ---
*   **Number of Questions:** ${numQuestions}
*   **Primary Topic:** ${topic || (sourceType === 'text' ? 'Multiple Topics' : 'Not specified')}
*   **Subject:** ${subject || (sourceType === 'text' ? 'Multiple Subjects' : 'Not specified')}
*   **Difficulty Level:** ${difficulty}
*   **Language:** ${language}
*   **Question Format:** ${QUESTION_FORMATS[formatKey].name}
*   **Target Exam:** ${exam}
*   **Target Exam Instructions:** Generate questions based on analysis of previous year questions that are relevant, and match the syllabus, question pattern, and difficulty level of the '${exam}' exam.
--- SOURCE MATERIAL INSTRUCTIONS ---
`;
        if (sourceType === 'pdf' || sourceType === 'image') {
            prompt += `*   **Knowledge Base:** You MUST generate questions based primarily on the "Source Material" provided below. Use the provided text as the core context and factual basis for the questions. For 'Hard' and 'Expert' difficulties, increase the conceptual depth, but the questions MUST remain grounded in the information provided.`;
        }
        else {
            prompt += `*   **Knowledge Base:** Use your own internal knowledge to create the questions. Your primary goal is to create new, high-quality questions that accurately match the standard, syllabus, and difficulty level of the specified target exam.`;
        }
        prompt += `\n\n--- REQUIRED QUESTION SAMPLE FORMAT (Follow Strictly) ---\n${sampleFormat}\n-------------------------------------------------------\n`;
        if (sourceText) {
            prompt += `Now, generate the questions based on all the instructions above and the following source material/details:\n--- START OF SOURCE MATERIAL ---\n${sourceText}\n--- END OF SOURCE MATERIAL ---`;
        }
        else {
            prompt += `Now, generate the questions based on all the instructions above.`;
        }
        promptForGemini = prompt;
        elements.geminiInstructionsModalOverlay.classList.remove('hidden');
    }
    async function executePostPromptActions(prompt) {
        elements.geminiInstructionsModalOverlay.classList.add('hidden');
        try {
            await copyTextToClipboard(prompt);
        }
        catch (err) {
            console.error("Could not automatically copy the prompt.");
        }
        const aiWindow = window.open('https://gemini.google.com', '_blank');
        if (!aiWindow || aiWindow.closed || typeof aiWindow.closed === 'undefined') {
            showPasteNotification('⚠️ Popup blocked! Click the link to open manually.');
            elements.aiLinkFallback.classList.remove('hidden');
        }
        else {
            elements.aiLinkFallback.classList.add('hidden');
        }
        clearFormState();
        sessionStorage.setItem('gameMode', gameMode);
        showScreen('paste');
        promptForGemini = null;
    }
    function generateTopicPrompt() {
        quizMetaData = { topic: document.getElementById('prompt-topic').value.trim(), subject: document.getElementById('prompt-subject-topic').value.trim() };
        const otherExamInput = elements.topicGeneratorWorkflow.querySelector('.prompt-exam-other');
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;
        const source = { numQuestions: document.getElementById('prompt-num-questions-topic').value || 5, topic: quizMetaData.topic, subject: quizMetaData.subject, difficulty: document.getElementById('prompt-difficulty-topic').value, language: document.getElementById('prompt-language-topic').value, formatKey: document.getElementById('question-format-select-topic').value, exam: finalExam };
        generatePrompt(source, 'topic');
    }
    function generateTextPrompt() {
        const rows = document.querySelectorAll('.prompt-builder-row');
        let totalQuestions = 0;
        let sourceText = "Generate a mixed mock test based on the following sections:\n\n";
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const numVal = row.querySelector('[data-type="numQuestions"]').value;
            const subject = row.querySelector('[data-type="subject"]').value.trim();
            const topic = row.querySelector('[data-type="topic"]').value.trim();
            const standard = row.querySelector('[data-type="standard"]').value.trim();
            const book = row.querySelector('[data-type="book"]').value.trim();
            if (!numVal || !subject || !topic) {
                alert(`Please fill out at least the number of questions, subject, and topic for Section ${i + 1}.`);
                return;
            }
            const num = parseInt(numVal, 10);
            totalQuestions += num;
            sourceText += `Section ${i + 1}:\n- Subject: ${subject}\n- Topic: ${topic}\n- Number of Questions: ${num}\n`;
            if (standard)
                sourceText += `- Class/Standard: ${standard}\n`;
            if (book)
                sourceText += `- Reference Book: ${book}\n\n`;
        }
        if (totalQuestions === 0) {
            alert("Please add at least one section with a valid number of questions.");
            return;
        }
        quizMetaData = { topic: 'Custom Mock Test', subject: 'Mixed' };
        const otherExamInput = elements.textGeneratorWorkflow.querySelector('.prompt-exam-other');
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;
        const source = { numQuestions: totalQuestions, topic: '', subject: '', difficulty: document.getElementById('prompt-difficulty-text').value, language: document.getElementById('prompt-language-text').value, formatKey: document.getElementById('question-format-select-text').value, exam: finalExam, sourceText: sourceText.trim() };
        generatePrompt(source, 'text');
    }
    function generateImagePrompt() {
        quizMetaData = { topic: document.getElementById('prompt-topic-image').value.trim(), subject: document.getElementById('prompt-subject-image').value.trim() };
        const otherExamInput = elements.imageGeneratorWorkflow.querySelector('.prompt-exam-other');
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;
        const source = { numQuestions: document.getElementById('prompt-num-questions-image').value, topic: quizMetaData.topic, subject: quizMetaData.subject, difficulty: document.getElementById('prompt-difficulty-image').value, language: document.getElementById('prompt-language-image').value, formatKey: document.getElementById('question-format-select-image').value, exam: finalExam, sourceText: elements.sourceTextImage.value.trim() };
        generatePrompt(source, 'image');
    }
    function generatePdfPrompt() {
        quizMetaData = { topic: document.getElementById('prompt-topic-pdf').value.trim(), subject: document.getElementById('prompt-subject-pdf').value.trim() };
        const otherExamInput = elements.pdfGeneratorWorkflow.querySelector('.prompt-exam-other');
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;
        const source = { numQuestions: document.getElementById('prompt-num-questions-pdf').value, topic: quizMetaData.topic, subject: quizMetaData.subject, difficulty: document.getElementById('prompt-difficulty-pdf').value, language: document.getElementById('prompt-language-pdf').value, formatKey: document.getElementById('question-format-select-pdf').value, exam: finalExam, sourceText: elements.sourceTextPdf.value.trim() };
        generatePrompt(source, 'pdf');
    }
    function setupAllExamSelectors() { document.querySelectorAll('.exam-buttons-container').forEach(container => { const inputField = container.nextElementSibling; populateExamButtons(container, inputField); }); }
    function populateExamButtons(container, inputField) {
        const exams = ["JEE", "NEET", "BANK", "RRB", "NEET PG", "CTET", "State PSC", "Police", "UPSSSC", "CUET", "UPSC", "SSC", "CBSE", "Other"];
        container.innerHTML = exams.map(exam => `<button class="btn exam-btn" data-exam-name="${exam}">${exam}</button>`).join('');
        container.addEventListener('click', e => {
            const target = e.target;
            if (target.classList.contains('exam-btn')) {
                const clickedBtn = target;
                const examName = clickedBtn.dataset.examName;
                container.querySelectorAll('.exam-btn').forEach(btn => btn.classList.remove('active'));
                clickedBtn.classList.add('active');
                selectedExam = examName;
                if (inputField) {
                    inputField.classList.toggle('hidden', examName !== 'Other');
                    if (examName === 'Other')
                        inputField.focus();
                }
                saveFormState();
            }
        });
        if (inputField)
            inputField.addEventListener('input', () => { if (selectedExam === 'Other')
                saveFormState(); });
    }
    function handlePdfSelection(event) {
        pdfFile = event.target.files[0];
        if (pdfFile) {
            elements.pdfFileName.textContent = pdfFile.name;
            elements.pdfOptionsContainer.classList.remove('hidden');
            elements.pdfQuizDefinitionArea.classList.add('hidden');
            elements.pdfStatus.textContent = '';
            document.getElementById('pdf-page-range-selector').classList.remove('hidden');
        }
    }
    async function extractPdfTextWithOcr(pdfDoc, start, end, worker) {
        let fullText = '';
        const scale = 2.0;
        for (let i = start; i <= Math.min(end, pdfDoc.numPages); i++) {
            let canvas = null;
            try {
                elements.pdfStatus.textContent = `Processing page ${i} of ${end}...`;
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: scale });
                canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                page.cleanup();
                elements.pdfStatus.textContent = `Extracting text from page ${i} of ${end}... (This can take a moment)`;
                const { data: { text } } = await worker.recognize(canvas);
                fullText += text + '\n\n';
            }
            catch (error) {
                console.error(`Error processing page ${i}:`, error);
                fullText += `[Error processing page ${i}]\n\n`;
            }
            finally {
                if (canvas) {
                    canvas.width = 0;
                    canvas.height = 0;
                    canvas = null;
                }
            }
        }
        return fullText;
    }
    async function extractPdfTextNative(pdf, start, end) { let fullText = ''; for (let i = start; i <= end; i++) {
        elements.pdfStatus.textContent = `Reading text from page ${i}...`;
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item) => item.str).join(' ') + '\n\n';
    } return fullText; }
    async function handleImageSelection(event) { const newFiles = Array.from(event.target.files); if (newFiles.length === 0)
        return; imageFiles = []; elements.sourceTextImage.value = ''; elements.imageQuizDefinitionArea.classList.add('hidden'); elements.ocrStatus.textContent = ''; updateImagePreviews(); processAndExtractAllImages(newFiles); event.target.value = ''; }
    function updateImagePreviews() { elements.imagePreviewContainer.innerHTML = ''; imageFiles.forEach(imgFile => { const fileForPreview = imgFile.croppedFile || imgFile.originalFile; if (imgFile.previewUrl)
        URL.revokeObjectURL(imgFile.previewUrl); imgFile.previewUrl = URL.createObjectURL(fileForPreview); const wrapper = document.createElement('div'); wrapper.className = 'img-preview-wrapper'; wrapper.innerHTML = `<div class="img-container"><img src="${imgFile.previewUrl}" alt="Image preview"></div><div class="img-preview-actions"><button class="img-preview-btn crop-btn" data-id="${imgFile.id}" title="Crop">✂️</button><button class="img-preview-btn remove-btn" data-id="${imgFile.id}" title="Remove">🗑️</button></div>`; elements.imagePreviewContainer.appendChild(wrapper); }); }
    function removeImage(idToRemove) { const indexToRemove = imageFiles.findIndex(f => f.id === idToRemove); if (indexToRemove > -1) {
        if (imageFiles[indexToRemove].previewUrl)
            URL.revokeObjectURL(imageFiles[indexToRemove].previewUrl);
        imageFiles.splice(indexToRemove, 1);
        updateImagePreviews();
        const remainingFiles = imageFiles.map(f => f.croppedFile || f.originalFile);
        showLoading("Re-extracting text from cropped image...");
        processAndExtractAllImages(remainingFiles);
    } }
    function openCropModal(imageId) { const imgFile = imageFiles.find(f => f.id === imageId); if (!imgFile)
        return; currentEditingImageId = imageId; const fileToCrop = imgFile.croppedFile || imgFile.originalFile; elements.imageToCrop.src = URL.createObjectURL(fileToCrop); elements.cropModalOverlay.classList.remove('hidden'); elements.imageToCrop.onload = () => { if (cropper)
        cropper.destroy(); cropper = new Cropper(elements.imageToCrop, { aspectRatio: NaN, viewMode: 1, background: false, autoCropArea: 0.9, }); }; }
    function closeCropModal() { if (cropper)
        cropper.destroy(); cropper = null; currentEditingImageId = null; elements.cropModalOverlay.classList.add('hidden'); }
    function saveCrop() { if (!cropper || !currentEditingImageId)
        return; cropper.getCroppedCanvas({ minWidth: 256, maxWidth: 4096, imageSmoothingQuality: 'high' }).toBlob((blob) => { const imgFile = imageFiles.find(f => f.id === currentEditingImageId); if (imgFile) {
        imgFile.croppedFile = blob;
        updateImagePreviews();
        const currentFiles = imageFiles.map(f => f.croppedFile || f.originalFile);
        showLoading("Re-extracting text from cropped image...");
        processAndExtractAllImages(currentFiles);
    } closeCropModal(); }); }
    function flexibleParser(text) {
        const questions = [];
        const blocks = text.replace(/\r\n/g, '\n').split(/\n(?=^\s*(?:Question:|Q\d|^\d+[\.\)]|Assertion\s*\(A\):))/im);
        blocks.forEach(block => {
            if (block.trim().length < 10)
                return;
            const lines = block.trim().split('\n');
            let questionText = '', correctAnswer = null, explanation = 'No explanation provided.';
            const options = [];
            let questionLines = [];
            let optionsStarted = false, answerFound = false, explanationStarted = false;
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine)
                    continue;
                const isExplanation = trimmedLine.match(/^(?:Explanation:|Reason:)/i);
                const isAnswer = trimmedLine.match(/^(?:Correct Answer:|Answer:|Ans:|Correct:)/i);
                const isOption = trimmedLine.match(/^([a-zA-Z0-9][\.\)]|[-*•])\s*(.*)/);
                if (isExplanation) {
                    explanationStarted = true;
                    explanation = trimmedLine.replace(/^(?:Explanation:|Reason:)\s*/i, '').trim();
                    continue;
                }
                if (isAnswer) {
                    answerFound = true;
                    optionsStarted = false;
                    correctAnswer = trimmedLine.replace(/^(?:Correct Answer:|Answer:|Ans:|Correct:)\s*/i, '').trim().toLowerCase().charAt(0);
                    continue;
                }
                if (explanationStarted) {
                    explanation += '\n' + trimmedLine;
                    continue;
                }
                if (isOption && !answerFound) {
                    optionsStarted = true;
                    options.push(isOption[2].trim());
                    continue;
                }
                if (!optionsStarted && !answerFound)
                    questionLines.push(trimmedLine);
            }
            questionText = questionLines.join('\n').replace(/^(?:Question:|Q\d|^\d+[\.\)])\s*/i, '').trim();
            if (questionText && options.length > 0 && correctAnswer) {
                const correctAnswerIndex = correctAnswer.charCodeAt(0) - 'a'.charCodeAt(0);
                if (correctAnswerIndex >= 0 && correctAnswerIndex < options.length) {
                    questions.push({ question: questionText, options: options, correctAnswerIndex: correctAnswerIndex, explanation: explanation });
                }
            }
        });
        return questions;
    }
});
//# sourceMappingURL=index.js.map]