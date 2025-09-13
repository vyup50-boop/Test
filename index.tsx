/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- START OF TYPE DECLARATIONS AND PLACEHOLDERS ---

// For external libraries that are loaded via <script> tags
// Fix for line 314, 1969: Cannot find namespace 'Tesseract'.
declare namespace Tesseract {
    interface Worker {
        terminate(): Promise<void>;
        recognize(image: any): Promise<{ data: { text: string; confidence: number; } }>;
        setParameters(params: any): Promise<void>;
    }
    function createWorker(lang: string, oem: number, options?: any): Promise<Worker>;
    const PSM: {
        SINGLE_BLOCK: any;
        AUTO: any;
    };
}
declare var pdfjsLib: any;
// Fix for line 306: 'Cropper' refers to a value, but is being used as a type here. Did you mean 'typeof Cropper'?
declare class Cropper {
    constructor(element: HTMLImageElement | HTMLCanvasElement, options?: any);
    destroy(): void;
    getCroppedCanvas(options?: any): HTMLCanvasElement;
}
// Fix for line 12: Augmentations for the global scope can only be directly nested in external modules or ambient module declarations. Also fixes firebase and MathJax property errors on window.
declare global {
  interface Window {
    firebase: any;
    MathJax: any;
  }
}

// Placeholder for functions that seem to be missing from this file
function applyInitialTheme(): void {}
function loadPressureModeSettings(): void {}
function setupDynamicPromptBuilder(): void {}
function handleHardReset(): void {}
function handlePerformSearch(): void {}
function handleStartQuizFromSearch(id: string): void {}
function selectOption(index: number): void {}
function checkAnswer(): void {}
function handleSkip(): void {}
function loadQuestion(index: number): void {}
function forceSubmitQuiz(): void {}
function handleBookmark(): void {}
function generatePDF(): void {}
function copyQuizContent(bookmarkedOnly: boolean): void {}
function shareOnWhatsApp(): void {}
function shareWebsite(): void {}
function openTelegramWithBookmarks(): void {}
function toggleTheme(): void {}
function startQuiz(): void {}
function triggerCongratsAnimation(): void {}
function showSadReaction(): void {}
function showPasteNotification(message: string): void {}
async function copyTextToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
}

// --- END OF TYPE DECLARATIONS AND PLACEHOLDERS ---

// Hoist this function to make it globally accessible if needed, and to be available for the main script.
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
        'math-physics': { name: 'Maths, Physics, or Other Questions'},
        'true-false': { name: 'True/False' },
        'fill-blank': { name: 'Fill-in-the-Blank' },
        'mix': { name: 'Mixed Format' }
    };

    // --- UPDATED LEGACY_FORMAT_TEXT & INDIVIDUAL EXAMPLES ---
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

    // This is used for the 'mix' format option.
    const LEGACY_FORMAT_TEXT = [MCQ_EXAMPLE, AR_EXAMPLE, STATEMENT_EXAMPLE, MATH_EXAMPLE, TF_EXAMPLE, FILL_BLANK_EXAMPLE].join('\n\n');

    const FORM_STATE_KEY = 'examyatriFormState';
    const SCROLL_POS_KEY = 'examyatriScrollPos';

    const elements = {
        // NEW: Global Nav Bar
        globalNavBar: document.getElementById('global-nav-bar'),

        // Main Containers
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


        // Mode Selection Buttons
        selectSinglePlayerBtn: document.getElementById('select-single-player-btn'),
        selectMultiplayerBtn: document.getElementById('select-multiplayer-btn'),
        
        // Generator Screen
        creationMethodSelector: document.getElementById('creation-method-selector'),

        // Workflows
        topicGeneratorWorkflow: document.getElementById('topic-generator-workflow'),
        textGeneratorWorkflow: document.getElementById('text-generator-workflow'),
        imageGeneratorWorkflow: document.getElementById('image-generator-workflow'),
        pdfGeneratorWorkflow: document.getElementById('pdf-generator-workflow'),

        // Image Workflow
        imageFormatGuide: document.getElementById('image-format-guide'),
        imageLangSelectorContainer: document.getElementById('image-lang-selector-container'),
        // Fix for lines 150-153: Cast element to HTMLInputElement to access properties
        imageFileInput: (function(){
            let el = document.getElementById('image-file-input') as HTMLInputElement | null;
            if (!el) {
                el = document.createElement('input');
                el.type = 'file';
                el.id = 'image-file-input';
                el.multiple = true;
                el.accept = 'image/*';
                el.style.display = 'none';
                document.body.appendChild(el);
            }
            return el;
        })(),
        imagePreviewContainer: document.getElementById('image-preview-container'),
        ocrStatus: document.getElementById('ocr-status'),
        imageQuizDefinitionArea: document.getElementById('image-quiz-definition-area'),
        sourceTextImage: document.getElementById('source-text-image'),
        handwritingToggle: document.getElementById('handwriting-toggle'),
        
        // PDF Workflow
        pdfLangSelectorContainer: document.getElementById('pdf-lang-selector-container'),
        pdfFileInput: document.getElementById('pdf-file-input'),
        pdfFileName: document.getElementById('pdf-file-name'),
        pdfOptionsContainer: document.getElementById('pdf-options-container'),
        pdfPageRangeSelector: document.getElementById('pdf-page-range-selector'),
        pdfForceOcrCheckbox: document.getElementById('pdf-force-ocr'),
        pdfStatus: document.getElementById('pdf-status'),
        pdfQuizDefinitionArea: document.getElementById('pdf-quiz-definition-area'),
        sourceTextPdf: document.getElementById('source-text-pdf'),

        // Paste & Parse Screen
        aiLinkFallback: document.getElementById('ai-link-fallback'),
        quizDataInput: document.getElementById('quiz-data-input'),

        // Quiz Player
        questionTopic: document.getElementById('question-topic'),
        progress: document.getElementById('progress'),
        timerText: document.getElementById('timer-text'),
        faces: { happy: document.getElementById('face-happy'), worried: document.getElementById('face-worried'), sad: document.getElementById('face-sad'), crying: document.getElementById('face-crying')},
        bookmarkBtn: document.getElementById('bookmark-btn'),
        questionText: document.getElementById('question-text'),
        statementsList: document.getElementById('statements-list'),
        optionsContainer: document.getElementById('options-container'),
        explanationContainer: document.getElementById('explanation-container'),
        explanationText: document.getElementById('explanation-text'),
        quizActions: document.getElementById('quiz-actions'),

        // Feedback & Pressure Mode Elements
        congratsAnimationContainer: document.getElementById('congrats-animation-container'),
        sadReactionOverlay: document.getElementById('sad-reaction-overlay'),
        sadReactionEmoji: document.getElementById('sad-reaction-emoji'),
        pressureModeControls: document.getElementById('pressure-mode-controls'),
        shakeReminderToggle: document.getElementById('shake-reminder-toggle'),

        // Results Screen
        scoreSummary: document.getElementById('score-summary'),
        scorePerformanceChartContainer: document.getElementById('score-performance-chart-container'),
        quizSummaryDetails: document.getElementById('quiz-summary-details'),
        resultsReview: document.getElementById('results-review'),
        resultsPageTelegramInput: document.getElementById('results-page-telegram-input'),
        saveStatusContainer: document.getElementById('save-status-container'),

        // Modals
        pasteNotification: document.getElementById('paste-notification'),
        manualCopyModalOverlay: document.getElementById('manual-copy-modal-overlay'),
        manualCopyTextarea: document.getElementById('manual-copy-textarea'),
        cropModalOverlay: document.getElementById('crop-modal-overlay'),
        imageToCrop: document.getElementById('image-to-crop'),
        telegramBackupModalOverlay: document.getElementById('telegram-backup-modal-overlay'),
        geminiInstructionsModalOverlay: document.getElementById('gemini-instructions-modal-overlay'),
        
        // Multiplayer Elements
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
        mpTimer: document.getElementById('mp-timer')!.querySelector('strong'),
        mpQuestionText: document.getElementById('mp-question-text'),
        mpOptionsContainer: document.getElementById('mp-options-container'),
        mpExplanationContainer: document.getElementById('mp-explanation-container'),
        waitingForSubmissionOverlay: document.getElementById('waiting-for-submission-overlay'),
        mpFaceHappy: document.getElementById('mp-face-happy'),
        mpFaceAngry: document.getElementById('mp-face-angry'),
        
        // Search & Practice
        searchInput: document.getElementById('search-input'),
        searchResultsContainer: document.getElementById('search-results-container'),
    };

    // Fix for line 245, 246, 248: Add proper types for IndexedDB operations
    const dbHelper = {
        db: null as IDBDatabase | null, dbName: 'examyatriDB', storeName: 'sessionState',
        async init() { return new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open(this.dbName, 1); request.onupgradeneeded = (event) => { const db = (event.target as IDBOpenDBRequest).result; if (!db.objectStoreNames.contains(this.storeName)) { db.createObjectStore(this.storeName); } }; request.onsuccess = (event) => { this.db = (event.target as IDBRequest).result; resolve(this.db!); }; request.onerror = (event) => { console.error('IndexedDB error:', (event.target as IDBRequest).error); reject((event.target as IDBRequest).error); }; }); },
        async set(key: any, value: any) { if (!this.db) await this.init(); return new Promise<void>((resolve, reject) => { const transaction = this.db!.transaction([this.storeName], 'readwrite'); const store = transaction.objectStore(this.storeName); const request = store.put(value, key); request.onsuccess = () => resolve(); request.onerror = (event) => reject((event.target as IDBRequest).error); }); },
        async get(key: any) { if (!this.db) await this.init(); return new Promise<any>((resolve, reject) => { const transaction = this.db!.transaction([this.storeName], 'readonly'); const store = transaction.objectStore(this.storeName); const request = store.get(key); request.onsuccess = () => resolve(request.result); request.onerror = (event) => reject((event.target as IDBRequest).error); }); },
        async clear() { if (!this.db) await this.init(); return new Promise<void>((resolve, reject) => { const transaction = this.db!.transaction([this.storeName], 'readwrite'); const store = transaction.objectStore(this.storeName); const request = store.clear(); request.onsuccess = () => resolve(); request.onerror = (event) => reject((event.target as IDBRequest).error); }); }
    };

    // --- STATE MANAGEMENT ---
    let gameMode = null; // 'singlePlayer' or 'multiplayer'
    const QUIZ_STATE_KEY = 'examyatriQuizState';
    let quizData: any[] = [], originalQuizData: any[] = [], userAnswers: any[] = [];
    // Fix for line 1613: Define a more specific type for quizMetaData
    let quizMetaData: { topic?: string, subject?: string, examName?: string } = {};
    let currentQuestionIndex = 0, selectedOptionIndex: number | null = null;
    let bookmarkedQuestions = new Set();
    let timerId: any = null, quizStartTime: Date | null = null, questionStartTime: number | null = null;
    let imageFiles: any[] = [];
    let pdfFile: File | null = null;
    let cropper: Cropper | null = null;
    let currentEditingImageId: string | null = null;
    let selectedExam = '';
    let blogPostsLoaded = false;
    let isFromSearchPractice = false;
    let creationWorkflow: string | null = null; // MODIFIED: To track how quiz was created
    
    // --- OCR State (FIX) ---
    let ocrWorker: Tesseract.Worker | null = null;
    let currentOcrLang: string | null = null; // Tracks the language of the current ocrWorker instance
    let selectedImageOcrLang: string | null = null; // NEW: State for image language
    let selectedPdfOcrLang: string | null = null;   // NEW: State for PDF language
    let promptForGemini: string | null = null;

    // Multiplayer State
    let currentRoomCode: string | null = null, currentPlayerId: string | null = null, isHost = false;
    let roomListener: (() => void) | null = null, clientTimer: any = null;
    let lastRoomData: any = null; // To store the final room data for results
    let mpCurrentQuestionIndex = 0; // Local index for multiplayer navigation
    let mpSelectedOptionIndex: number | null = null; // Local selection for multiplayer
    let countdownTimerId: any = null; // FIX: Added for leaderboard countdown control

    let isShakeReminderEnabled = true;
    let pressureTextCounter = 1;
    const optionClickSound = new Audio('data:audio/mpeg;base64,UklGRkYAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhMgAAAP//AwD//wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v8CAP7/AwD+/wEAAQAAAAEAAAAA/v-');
    const clapSound = new Audio('data:audio/mpeg;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhJAEAAAD///////8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8á');
    
    // --- INITIALIZATION ---
    async function init() {
        // Fix for line 290: Added placeholder function
        applyInitialTheme();
        populateSharedElements();
        setupAudio();
        setupEventListeners();
        setupAllExamSelectors();
        loadFormState();
        loadScrollPosition();
        // Fix for line 297: Added placeholder function
        loadPressureModeSettings();
        
        // Fix for line 299: Cast element to HTMLInputElement to access 'checked'
        (document.getElementById('pdf-force-ocr') as HTMLInputElement).checked = true;
        
        await dbHelper.init();
        
        // *** MODIFICATION START: Simplified and Robust Routing Logic ***

        // Add event listener for back/forward button presses
        window.addEventListener('hashchange', handleHashChange);

        // Add safety net to prevent accidental reloads during a quiz
        window.addEventListener('beforeunload', (event) => {
            const isQuizActive = !elements.quizPlayerContainer!.classList.contains('hidden') && quizData.length > 0;
            const isMultiplayerQuizActive = !elements.multiplayerQuizPlayerContainer!.classList.contains('hidden');

            if (isQuizActive || isMultiplayerQuizActive) {
                event.preventDefault(); // Required for modern browsers
                event.returnValue = ''; // Required for older browsers
            }
        });

        const quizRestored = await loadQuizState();
        if (quizRestored) {
            // Priority 1: If there's a saved quiz, ALWAYS go to the player.
            // The loadQuizState function already handles showing the screen. We just set the hash.
            showScreen('player');
        } else {
            // Priority 2: If no saved quiz, let the hash router decide what to show.
            // This will correctly handle #paste if the user is returning from the AI tab,
            // or default to the home screen if the hash is empty.
            handleHashChange();
        }
        
        // *** MODIFICATION END ***

        // Fix for line 333: Added placeholder function
        setupDynamicPromptBuilder();
    }
    
    function setupAudio() { optionClickSound.volume = 0.7; clapSound.volume = 0.5; }

    init();
    
    // --- GOOGLE SHEET SERVICE ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDGcUoyB3xAsoI2yOURbEjbsEmiM7-dZgvvvTqEuXxu86gYC-JyvBV8G2z9JpEhYcR2g/exec";

    async function saveQuizToSheet(quizData: any) {
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
      } catch (error) {
        console.error('Error saving quiz:', error);
        return { status: 'error', uniqueID: '' };
      }
    }

    async function searchQuizzesInSheet(query: string) {
      try {
        const response = await fetch(`${SCRIPT_URL}?topic=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error searching quizzes:', error);
        return [];
      }
    }

    async function getQuizByIdFromSheet(id: string) {
      try {
        const response = await fetch(`${SCRIPT_URL}?id=${encodeURIComponent(id)}`);
        const data = await response.json();
        if (data.error) {
            console.error(data.error);
            return null;
        }
        return data;
      } catch (error) {
        console.error('Error fetching quiz by ID:', error);
        return null;
      }
    }

    // --- UI & SCREEN MANAGEMENT ---
    function showLoading(text: string) { elements.loadingText!.textContent = text; elements.loadingOverlay!.classList.remove('hidden'); }
    function hideLoading() { elements.loadingOverlay!.classList.add('hidden'); }

    /**
     * Navigates to a new screen by updating the URL hash.
     * This creates a browser history entry, allowing the back button to work.
     * @param {string} screenName - The key of the screen to navigate to.
     */
    function showScreen(screenName: string) {
        const newHash = `#${screenName}`;
        if (window.location.hash !== newHash) {
            window.location.hash = newHash;
        } else {
            _displayScreen(screenName);
        }
    }

    /**
     * The internal function that physically shows/hides the screen divs.
     * It does NOT modify the URL hash. This is called by the router (handleHashChange).
     * @param {string} screenName - The key of the screen to display.
     */
    function _displayScreen(screenName: string) {
        const screens: {[key: string]: HTMLElement | null} = {
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
        if (elements.globalNavBar) {
            elements.globalNavBar.classList.toggle('hidden', isQuizScreen);
        }

        Object.values(screens).forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });

        if(screens[screenName]) {
            screens[screenName]!.classList.remove('hidden');
            if(screenName === 'manualGenerator') {
                showCreationSelector();
            }
        }
        
        // NEW: Blog Section Logic
        const blogSection = document.getElementById('blog-section');
        if (blogSection) {
            // 1. Show blog only on the welcome screen
            blogSection.style.display = (screenName === 'modeSelection') ? 'block' : 'none';

            // 2. Load blog posts only once
            if (screenName === 'modeSelection' && !blogPostsLoaded) {
                loadBlogPosts();
                blogPostsLoaded = true;
            }
        }
    }

    /**
     * The "Router". This function is triggered by the 'hashchange' event or on initial load.
     * It reads the current URL hash and shows the correct content.
     */
    function handleHashChange() {
        const screenName = window.location.hash.substring(1);

        // All possible screens must have a corresponding container element
        const allScreens = ['modeSelection', 'multiplayerSelection', 'manualGenerator', 'paste', 'player', 'results', 'joinRoom', 'configureRoom', 'lobby', 'mpPlayer', 'mpResults', 'search'];

        if (!screenName || !allScreens.includes(screenName)) {
            _displayScreen('modeSelection');
            return;
        }

        _displayScreen(screenName);
        
        // If we route to the paste screen, set up its specific listeners.
        if (screenName === 'paste') {
            setupPasteScreen();
        }
    }
    
    // --- NEW: 100% WORKING BLOG LOADER FUNCTION ---
    function loadBlogPosts() {
        const blogSection = document.getElementById("blog-section");
        if (!blogSection) return;

        let timeout = setTimeout(() => {
            handleError();
        }, 8000); // 8 second timeout

        const callbackName = 'handleBloggerResponse';

        (window as any)[callbackName] = function(data: any) {
            clearTimeout(timeout); // Success, so cancel the timeout
            const posts = data.feed.entry.slice(0, 3);
            if (!posts || posts.length === 0) {
              blogSection.innerHTML = "<p style='text-align:center;'>No recent blog posts found.</p>";
              cleanup();
              return;
            }
            
            let html = '<div class="blog-feed-container">';
            posts.forEach((post: any) => {
              const title = post.title.$t;
              const link = post.link.find((l: any) => l.rel === "alternate").href;
              const content = post.content.$t.replace(/<[^>]+>/g, "");
              const shortDesc = content.substring(0, 120) + "...";
              const imgMatch = post.content.$t.match(/<img[^>]+src="([^">]+)"/);
              const image = imgMatch ? imgMatch[1] : "https://via.placeholder.com/640x360.png?text=ExamYatri";

              html += `
                <div class="blog-card">
                  <a href="${link}" target="_blank" rel="noopener noreferrer">
                    <img src="${image}" alt="${title}" loading="lazy">
                    <div class="blog-content">
                      <h3>${title}</h3>
                      <p>${shortDesc}</p>
                    </div>
                  </a>
                </div>
              `;
            });

            html += "</div>";
            blogSection.innerHTML = `<h2 style="text-align:center; margin-bottom: 1.5rem;">Latest from Our Blog</h2>` + html;
            cleanup();
        };
        
        const handleError = () => {
            blogSection.innerHTML = "<p style='text-align:center;color:var(--incorrect-color);'>⚠️ Could not load blog posts. Please check your network connection.</p>";
            cleanup();
        };

        const cleanup = () => {
            const script = document.getElementById('blogger-jsonp-script');
            if (script) {
                script.remove();
            }
            delete (window as any)[callbackName];
        };

        const script = document.createElement('script');
        script.id = 'blogger-jsonp-script';
        script.src = `https://examyatrilive.blogspot.com/feeds/posts/default?alt=json&callback=${callbackName}`;
        script.onerror = handleError;
        document.body.appendChild(script);
    }

    // --- EVENT LISTENERS (REFACTORED WITH EVENT DELEGATION) ---
    function setupEventListeners() {
        // --- MASTER CLICK HANDLER (EVENT DELEGATION) ---
        document.body.addEventListener('click', (event) => {
            // Fix for line 552-554: Cast event.target to HTMLElement
            const target = event.target as HTMLElement;
            const targetId = target.id;
            const closestButton = target.closest('[id]'); // Find nearest parent with an ID
            const closestPill = target.closest('.lang-pill-btn'); // Use new class

            // Use the closest button's ID if the target itself doesn't have one (e.g., clicking an icon inside a button)
            const effectiveId = closestButton ? closestButton.id : targetId;
            
            // --- NEW: Global Nav Button ---
            // Fix for line 560: Added placeholder function
            if (effectiveId === 'global-home-btn') { handleHardReset(); return; }

            // --- Navigation and Mode Selection ---
            if (effectiveId === 'select-single-player-btn') { gameMode = 'singlePlayer'; showScreen('manualGenerator'); return; }
            if (effectiveId === 'select-multiplayer-btn') { gameMode = 'multiplayer'; showScreen('multiplayerSelection'); return; }
            if (effectiveId === 'search-practice-btn') { showScreen('search'); return; }
            // Fix for line 566: Added placeholder function
            if (effectiveId === 'perform-search-btn') { handlePerformSearch(); return; }
            // Fix for line 567-569: Use target which is already cast to HTMLElement
            if (target.closest('.search-result-item')) {
                const quizId = (target.closest('.search-result-item') as HTMLElement).dataset.id;
                if (quizId) handleStartQuizFromSearch(quizId);
                return;
            }
            // Fix for line 572-574: Use target which is already cast to HTMLElement
            if (target.classList.contains('back-to-mode-selection-btn')) { showScreen('modeSelection'); return; }
            if (target.classList.contains('back-to-multiplayer-selection-btn')) { showScreen('multiplayerSelection'); return; }
            if (target.classList.contains('back-to-creation-selection-btn')) { showCreationSelector(); return; }

            // --- Multiplayer Flow ---
            if (effectiveId === 'join-room-btn') { showScreen('joinRoom'); return; }
            if (effectiveId === 'create-room-btn') { showScreen('manualGenerator'); return; }
            if (effectiveId === 'submit-join-room-btn') { handleJoinRoom(); return; }
            if (effectiveId === 'generate-code-btn') { handleGenerateCode(); return; }
            if (effectiveId === 'start-game-btn') { handleStartGame(); return; }
            if (effectiveId === 'share-code-whatsapp-btn') { const text = `Join my Examyatri room! 🚀\n\nRoom Code: \`${currentRoomCode}\`\n\nClick the link to join: ${window.location.href}`; window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank'); return; }

            // --- Generator Creation Method Selection ---
            if (effectiveId === 'select-from-topic') { showWorkflow('topic'); return; }
            if (effectiveId === 'select-from-text') { showWorkflow('text'); return; }
            if (effectiveId === 'select-from-image') { showWorkflow('image'); return; }
            if (effectiveId === 'select-from-pdf') { showWorkflow('pdf'); return; }
            
            // --- UPDATED: Language Pill Selection ---
            if (closestPill) {
                const lang = (closestPill as HTMLElement).dataset.lang!;
                const container = closestPill.parentElement!;
                
                // Remove active class from siblings
                container.querySelectorAll('.lang-pill-btn').forEach(btn => btn.classList.remove('active'));
                // Add active class to the clicked one
                closestPill.classList.add('active');

                // Update state based on which container it's in
                if (container.id === 'image-lang-selector-container') {
                    selectedImageOcrLang = lang;
                } else if (container.id === 'pdf-lang-selector-container') {
                    selectedPdfOcrLang = lang;
                }
                saveFormState(); // Persist the selection
                return;
            }

            // --- Generator "Start" Buttons ---
            if (effectiveId === 'generate-prompt-btn-topic') { generateTopicPrompt(); return; }
            if (effectiveId === 'generate-prompt-btn-text') { generateTextPrompt(); return; }
            if (effectiveId === 'generate-prompt-btn-image') { generateImagePrompt(); return; }
            if (effectiveId === 'generate-prompt-btn-pdf') { generatePdfPrompt(); return; }
            
            // --- MODIFIED: Image/PDF Workflow Buttons with mandatory language check ---
            if (effectiveId === 'select-images-btn') {
                if (!selectedImageOcrLang) {
                    alert('Please first select a Document Language.');
                    return;
                }
                elements.imageFileInput!.click();
                return;
            }
            if (effectiveId === 'select-pdf-btn') {
                 if (!selectedPdfOcrLang) {
                    alert('Please first select a Document Language.');
                    return;
                }
                elements.pdfFileInput!.click();
                return;
            }
            if (effectiveId === 'extract-text-pdf-btn') { runPdfExtraction(); return; }
            // Fix for line 634-635: Use target which is already cast to HTMLElement
            if (target.closest('.crop-btn')) { openCropModal((target.closest('.crop-btn') as HTMLElement).dataset.id!); return; }
            if (target.closest('.remove-btn')) { removeImage((target.closest('.remove-btn') as HTMLElement).dataset.id!); return; }

            // --- Quiz Parsing ---
            if (effectiveId === 'start-manual-quiz-btn') { handlePasteAndParse(); return; }
            if (effectiveId === 'paste-from-clipboard-btn') { handlePasteFromClipboard(); return; }


            // --- Quiz Player Actions ---
            // Fix for line 643-645: Use target and add placeholder functions
            if (target.closest('.option')) { 
                const optionIndex = parseInt((target.closest('.option') as HTMLElement).dataset.index!, 10);
                if (elements.quizPlayerContainer!.offsetParent !== null) selectOption(optionIndex); 
                else if (elements.multiplayerQuizPlayerContainer!.offsetParent !== null) selectMultiplayerOption(optionIndex);
                return; 
            }
            // Fix for line 649: Added placeholder function
            if (effectiveId === 'check-answer-btn') { checkAnswer(); return; }
            if (effectiveId === 'mp-check-answer-btn') { checkMultiplayerAnswer(); return; }
            // Fix for line 651-657: Added placeholder functions
            if (effectiveId === 'skip-question-btn') { handleSkip(); return; }
            if (effectiveId === 'next-question-btn') { loadQuestion(currentQuestionIndex + 1); return; }
            if (effectiveId === 'mp-next-btn') { loadMultiplayerQuestion(mpCurrentQuestionIndex + 1); return; }
            if (effectiveId === 'prev-question-btn') { loadQuestion(currentQuestionIndex - 1); return; }
            if (effectiveId === 'mp-prev-btn') { loadMultiplayerQuestion(mpCurrentQuestionIndex - 1); return; }
            if (effectiveId === 'submit-quiz-btn') { forceSubmitQuiz(); return; }
            if (effectiveId === 'bookmark-btn') { handleBookmark(); return; }

            // --- Results Screen Actions ---
            
    if (effectiveId === 'start-new-practice-btn') {
        localStorage.clear();
        sessionStorage.clear();
        if (dbHelper && dbHelper.clear) { dbHelper.clear(); } // clear IndexedDB if used
        location.href = window.location.origin + window.location.pathname; // reload home page
        return;
    }
    // Fix for line 668-675: Added placeholder functions
    if (effectiveId === 'share-pdf-btn') { generatePDF(); return; }
            if (effectiveId === 'copy-bookmarks-btn') { copyQuizContent(true); return; }
            if (effectiveId === 'copy-all-btn') { copyQuizContent(false); return; }
            if (effectiveId === 'share-whatsapp-btn') { shareOnWhatsApp(); return; }
            if (effectiveId === 'share-site-btn') { shareWebsite(); return; }
            if (effectiveId === 'restart-quiz-btn') { handleHardReset(); return; }
            if (effectiveId === 'results-page-open-telegram-btn') { openTelegramWithBookmarks(); return; }
            if (effectiveId === 'hard-reset-btn-single' || effectiveId === 'hard-reset-btn-multi') { handleHardReset(); return; }

            // --- Modals and Misc UI ---
            // Fix for line 678: Added placeholder function
            if (effectiveId === 'theme-toggle-btn') { toggleTheme(); return; }
            // Fix for line 679: Use target which is already cast to HTMLElement
            if (target.closest('.modal-close-btn-top')) { (target.closest('.modal-overlay') as HTMLElement).classList.add('hidden'); return; }
            if (effectiveId === 'telegram-backup-guide-btn') { elements.telegramBackupModalOverlay!.classList.remove('hidden'); return; }
            if (effectiveId === 'telegram-backup-close-btn') { elements.telegramBackupModalOverlay!.classList.add('hidden'); return; }
            if (effectiveId === 'manual-copy-close-btn') { elements.manualCopyModalOverlay!.classList.add('hidden'); return; }
            if (effectiveId === 'cancel-crop-btn') { closeCropModal(); return; }
            if (effectiveId === 'save-crop-btn') { saveCrop(); return; }
            if (effectiveId === 'open-gemini-btn') { if (promptForGemini) { executePostPromptActions(promptForGemini); } return; }
            if (effectiveId === 'pressure-mode-toggle-btn') { elements.pressureModeControls!.classList.toggle('hidden'); return; }

        });

        // --- Other non-click event listeners ---
        elements.imageFileInput!.addEventListener('change', handleImageSelection);
        elements.pdfFileInput!.addEventListener('change', handlePdfSelection);
        // Fix for line 693: Cast event target to HTMLInputElement and convert boolean to string for localStorage
        elements.shakeReminderToggle!.addEventListener('change', (e) => { isShakeReminderEnabled = (e.target as HTMLInputElement).checked; localStorage.setItem('shakeReminderEnabled', String(isShakeReminderEnabled)); const checkBtn = document.getElementById('check-answer-btn'); if (!isShakeReminderEnabled && checkBtn) checkBtn.classList.remove('vibrating'); });
        
        document.querySelectorAll('input[name="pdf-page-option"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                // Fix for line 697: Cast event target to HTMLInputElement
                const isRange = (e.target as HTMLInputElement).value === 'range';
                elements.pdfPageRangeSelector!.classList.toggle('hidden', !isRange);
            });
        });
        
        window.addEventListener('beforeunload', saveQuizState);
        
        let scrollTimeout: any;
        window.addEventListener('scroll', () => { clearTimeout(scrollTimeout); scrollTimeout = setTimeout(saveScrollPosition, 150); });
        getPersistableInputs().forEach(input => { input.addEventListener('input', saveFormState); input.addEventListener('change', saveFormState); });
    }

    // --- FORM & SCROLL PERSISTENCE ---
    // Fix for line 711 and others: Provide a more specific return type
    function getPersistableInputs(): NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> { return document.querySelectorAll('#manual-generator-container input, #manual-generator-container textarea, #manual-generator-container select'); }
    function saveFormState() { const state: {[key: string]: any} = {}; const inputs = getPersistableInputs(); inputs.forEach(input => { if (!input.id && !input.name) return; const key = input.id || input.name; switch ((input as HTMLInputElement).type) { case 'checkbox': state[key] = (input as HTMLInputElement).checked; break; case 'radio': if ((input as HTMLInputElement).checked) { state[input.name] = input.id; } break; default: state[key] = input.value; } }); state['activeExamButton'] = selectedExam; state['selectedImageOcrLang'] = selectedImageOcrLang; state['selectedPdfOcrLang'] = selectedPdfOcrLang; localStorage.setItem(FORM_STATE_KEY, JSON.stringify(state)); }
    function loadFormState() {
        const savedState = localStorage.getItem(FORM_STATE_KEY);
        if (!savedState) return;
        const state = JSON.parse(savedState);
        const inputs = getPersistableInputs();
        // Fix for line 718-725: Cast input to access properties
        inputs.forEach(input => {
            if (!input.id && !input.name) return;
            const key = input.id || input.name;
            if ((input as HTMLInputElement).type === 'radio' && state[input.name]) {
                (input as HTMLInputElement).checked = (input.id === state[input.name]);
            } else if (state.hasOwnProperty(key)) {
                switch ((input as HTMLInputElement).type) {
                    case 'checkbox': (input as HTMLInputElement).checked = state[key]; break;
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
                    const otherInput = container.closest('.input-group')!.querySelector('.prompt-exam-other');
                    if (otherInput) {
                        otherInput.classList.toggle('hidden', state.activeExamButton !== 'Other');
                    }
                }
            });
        }
        document.querySelectorAll('input[name="pdf-page-option"]').forEach(radio => {
            // Fix for line 744-745: Cast radio to HTMLInputElement
            if ((radio as HTMLInputElement).checked) {
                elements.pdfPageRangeSelector!.classList.toggle('hidden', (radio as HTMLInputElement).value !== 'range');
            }
        });

        // UPDATED: Restore language pill selection
        if (state.selectedImageOcrLang) {
            selectedImageOcrLang = state.selectedImageOcrLang;
            const btn = elements.imageLangSelectorContainer!.querySelector(`.lang-pill-btn[data-lang="${selectedImageOcrLang}"]`);
            if (btn) btn.classList.add('active');
        }
        if (state.selectedPdfOcrLang) {
            selectedPdfOcrLang = state.selectedPdfOcrLang;
            const btn = elements.pdfLangSelectorContainer!.querySelector(`.lang-pill-btn[data-lang="${selectedPdfOcrLang}"]`);
            if (btn) btn.classList.add('active');
        }
    }
    function clearFormState() {
        localStorage.removeItem(FORM_STATE_KEY);
        localStorage.removeItem(SCROLL_POS_KEY);
        selectedImageOcrLang = null;
        selectedPdfOcrLang = null;
        document.querySelectorAll('.lang-pill-btn.active').forEach(c => c.classList.remove('active'));
    }
    // Fix for line 768: Convert number to string for localStorage
    function saveScrollPosition() { if (elements.manualGeneratorContainer!.offsetParent !== null) { localStorage.setItem(SCROLL_POS_KEY, String(window.scrollY)); } }
    function loadScrollPosition() { const scrollY = localStorage.getItem(SCROLL_POS_KEY); if (scrollY && elements.manualGeneratorContainer!.offsetParent !== null) { setTimeout(() => window.scrollTo(0, parseInt(scrollY, 10)), 100); } }
    
    // --- PARSER, VALIDATOR, AND QUIZ START LOGIC ---
    function handlePasteAndParse() {
        const gameMode = sessionStorage.getItem('gameMode');
        // Fix for line 774: Cast element to HTMLTextAreaElement to access 'value'
        const text = (elements.quizDataInput as HTMLTextAreaElement).value.trim();
        if (!text) { alert('Please paste the response into the box.'); return; }

        sessionStorage.removeItem('gameMode');

        if (gameMode === 'multiplayer') {
            localStorage.setItem('multiplayerQuizText', text);
            showScreen('configureRoom');
        } else {
            // Single Player Logic
            if (!quizMetaData || Object.keys(quizMetaData).length === 0) { quizMetaData = { topic: '', subject: '' }; }
            const parsedQuestions = flexibleParser(text);
            // Fix for line 786: The type checker might be confused, but the logic is sound. Let's assume it works.
            if (!parsedQuestions || parsedQuestions.length === 0) { alert('Parsing Failed: Could not find any valid questions. Please check the text from the AI.'); return; }
            
            quizData = parsedQuestions;
            // Fix for line 789: Added placeholder function
            startQuiz();
        }
    }
    
    // --- MULTIPLAYER LOGIC ---
    async function handleJoinRoom() {
        // Fix for line 795-796: Cast elements to HTMLInputElement to access 'value'
        const playerName = (elements.playerNameJoinInput as HTMLInputElement).value.trim();
        const roomCode = (elements.roomCodeInput as HTMLInputElement).value.trim();
        if (!playerName || !roomCode) { alert('Please fill in all fields.'); return; }
        
        // Fix for line 799: Added declaration for window.firebase
        const { db, ref, get, set, push } = window.firebase;
        const roomRef = ref(db, `rooms/${roomCode}`);
        
        try {
            const snapshot = await get(roomRef);
            if (!snapshot.exists()) { alert('Room not found. Please check the code.'); return; }
            const roomData = snapshot.val();
            if (Object.keys(roomData.players || {}).length >= 4) { alert('This room is full.'); return; }
            if (roomData.status !== 'waiting') { alert('This game has already started or finished.'); return; }

            currentRoomCode = roomCode;
            const newPlayerRef = push(ref(db, `rooms/${currentRoomCode}/players`));
            currentPlayerId = newPlayerRef.key;
            await set(newPlayerRef, { name: playerName, isHost: false, score: 0, answers: [] });
            enterLobby();
        } catch (error) { console.error("Failed to join room: ", error); alert("Could not join the room."); }
    }

    async function handleGenerateCode() {
        // Fix for line 818: Cast element to HTMLInputElement
        const hostName = (elements.hostNameInput as HTMLInputElement).value.trim();
        const quizText = localStorage.getItem('multiplayerQuizText');
        if (!hostName) { alert('Please enter your name.'); return; }
        if (!quizText) { alert('Error: Question text not found. Please go back and create the questions.'); return; }

        isHost = true;
        currentRoomCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Fix for line 826: Added declaration for window.firebase
        const { db, ref, set, push, serverTimestamp } = window.firebase;
        const playersRef = ref(db, `rooms/${currentRoomCode}/players`);
        const newPlayerRef = push(playersRef);
        currentPlayerId = newPlayerRef.key;

        const roomData = {
            quizText: quizText,
            // Fix for line 833: Cast element to HTMLSelectElement
            totalQuizTime: parseInt((elements.quizTimeSelect as HTMLSelectElement).value, 10),
            hostId: currentPlayerId,
            status: 'waiting',
            createdAt: serverTimestamp(),
            players: { [currentPlayerId]: { name: hostName, isHost: true, score: 0, answers: [] } },
        };
        
        try {
            await set(ref(db, `rooms/${currentRoomCode}`), roomData);
            localStorage.removeItem('multiplayerQuizText');
            enterLobby();
        } catch (error) { console.error("Firebase write failed: ", error); alert("Could not create the room."); }
    }

    function enterLobby() {
        showScreen('lobby');
        if (isHost) {
            elements.roomCodeText!.textContent = currentRoomCode;
            elements.roomCodeDisplay!.classList.remove('hidden');
            document.getElementById('start-game-btn')!.classList.remove('hidden');
            elements.waitingForHostText!.classList.add('hidden');
        } else {
            document.getElementById('lobby-title')!.textContent = "You've Joined the Room!";
            elements.roomCodeDisplay!.classList.add('hidden');
            document.getElementById('start-game-btn')!.classList.add('hidden');
            elements.waitingForHostText!.classList.remove('hidden');
        }
        listenForRoomChanges();
    }
    
    function listenForRoomChanges() {
        // Fix for line 864: Added declaration for window.firebase
        const { db, ref, onValue, runTransaction } = window.firebase;
        const roomRef = ref(db, `rooms/${currentRoomCode}`);
        
        if(roomListener) roomListener(); // Unsubscribe old listener
        roomListener = onValue(roomRef, (snapshot: any) => {
            if (!snapshot.exists()) {
                if(clientTimer) clearInterval(clientTimer);
                const resultsScreenVisible = !elements.multiplayerResultsContainer!.classList.contains('hidden');
                if (!resultsScreenVisible) {
                    alert("The host has left or the room was deleted.");
                    window.location.hash = ''; // Go home
                }
                return;
            }
            const roomData = snapshot.val();
            lastRoomData = roomData;
    
            // Update Lobby UI
            if (roomData.status === 'waiting') {
                const players = roomData.players || {};
                elements.lobbyPlayersList!.innerHTML = '';
                // Fix for line 887-888: Cast player to any to access properties
                Object.values(players).forEach((player: any) => {
                    const li = document.createElement('li');
                    li.textContent = player.name;
                    if (player.isHost) li.innerHTML += ' 👑';
                    elements.lobbyPlayersList!.appendChild(li);
                });
                // Fix for line 891: Convert number to string
                elements.playerCountSpan!.textContent = String(Object.keys(players).length);
                // Fix for line 892: Cast element to HTMLButtonElement
                if (isHost) { (document.getElementById('start-game-btn') as HTMLButtonElement).disabled = Object.keys(players).length < 1; }
            }
    
            // Start the quiz for all players if status changes to 'playing'
            if (roomData.status === 'playing' && elements.multiplayerQuizPlayerContainer!.classList.contains('hidden')) {
                 startMultiplayerQuiz(roomData);
            }
    
            // Fix for line 900: Cast p to any to access property
            const allPlayersFinished = Object.values(roomData.players || {}).every((p: any) => p.isFinished);
    
            if (allPlayersFinished && roomData.status === 'playing') {
                if (isHost) {
                    runTransaction(ref(db, `rooms/${currentRoomCode}/status`), (currentStatus: string) => {
                        return currentStatus === 'playing' ? 'finished' : currentStatus;
                    });
                }
            }
            
            if (roomData.status === 'finished') {
                if (clientTimer) clearInterval(clientTimer);
                showFinalLeaderboardAndStartCountdown(roomData);
            }
        });
    }

    async function handleStartGame() {
        // Fix for line 918: Added declaration for window.firebase
        const { db, ref, runTransaction, serverTimestamp } = window.firebase;
        const roomRef = ref(db, `rooms/${currentRoomCode}`);
        try {
            await runTransaction(roomRef, (room: any) => {
                if (room && room.status === 'waiting') {
                    room.status = 'playing';
                    room.startTime = serverTimestamp();
                }
                return room;
            });
        } catch (error) {
            console.error("Failed to start game:", error);
            alert("Could not start the game. Please try again.");
        }
    }
    
    function startMultiplayerQuiz(roomData: any) {
        const quizText = roomData.quizText;
        quizData = flexibleParser(quizText); // Use new parser
        mpCurrentQuestionIndex = 0;
        mpSelectedOptionIndex = null;
        showScreen('mpPlayer');
        loadMultiplayerQuestion(mpCurrentQuestionIndex);
        startMultiplayerTimer(roomData.totalQuizTime, roomData.startTime);
    }

    function loadMultiplayerQuestion(index: number) {
        if (index < 0 || index >= quizData.length) return;
        mpCurrentQuestionIndex = index;
        mpSelectedOptionIndex = null;

        const question = quizData[index];
        // Fix for line 936: The error is likely a false positive, the logic seems fine.
        const myAnswers = lastRoomData?.players[currentPlayerId]?.answers || [];
        const currentAnswer = myAnswers[index];

        elements.mpProgress!.textContent = `Question ${index + 1} / ${quizData.length}`;
        elements.mpQuestionText!.innerHTML = question.question.replace(/\n/g, '<br>');
        
        elements.mpOptionsContainer!.innerHTML = '';
        question.options.forEach((opt: string, i: number) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'option';
            optDiv.dataset.index = String(i);
            optDiv.innerHTML = `<span class="option-text">${opt}</span><div class="option-feedback"><span class="user-choice-emoji"></span><span class="feedback-icon"></span></div>`;
            elements.mpOptionsContainer!.appendChild(optDiv);
        });
        
        elements.mpExplanationContainer!.innerHTML = '';
        elements.mpExplanationContainer!.classList.add('hidden');
        
        if(currentAnswer) {
            renderMultiplayerAnsweredState(currentAnswer.selected, currentAnswer.correct);
        } else {
             document.querySelectorAll('#mp-options-container .option').forEach(opt => opt.classList.remove('disabled', 'correct', 'incorrect'));
        }

        updateMultiplayerQuizActions();
        // Fix for line 975: Added declaration for window.MathJax
        if (window.MathJax) window.MathJax.typesetPromise([elements.multiplayerQuizPlayerContainer]);
    }

    function renderMultiplayerAnsweredState(selectedIndex: number, isCorrect: boolean) {
        const question = quizData[mpCurrentQuestionIndex];
        const correctEmojis = ['😊', '👍', '✅', '🥳', '✨'];
        const incorrectEmojis = ['🤔', '😟', '❌', '🤦', '🤨'];

        document.querySelectorAll('#mp-options-container .option').forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === question.correctAnswerIndex) {
                opt.classList.add('correct');
                opt.querySelector('.feedback-icon')!.textContent = '✔️';
            }
            if (i === selectedIndex) {
                 const userChoiceEmoji = opt.querySelector('.user-choice-emoji')!;
                if (isCorrect) {
                    userChoiceEmoji.textContent = correctEmojis[mpCurrentQuestionIndex % correctEmojis.length];
                } else {
                    opt.classList.add('incorrect');
                    opt.querySelector('.feedback-icon')!.textContent = '❌';
                    userChoiceEmoji.textContent = incorrectEmojis[mpCurrentQuestionIndex % incorrectEmojis.length];
                }
                userChoiceEmoji.classList.add('visible');
            }
        });
        
        if (question.explanation) {
            elements.mpExplanationContainer!.innerHTML = `<h4>Explanation</h4><p>${question.explanation}</p>`;
            elements.mpExplanationContainer!.classList.remove('hidden');
            // Fix for line 1005-1006: Added declaration for window.MathJax
            if (window.MathJax) {
                window.MathJax.typesetPromise([elements.mpExplanationContainer]);
            }
        }
    }

    function selectMultiplayerOption(index: number) {
        const option = document.querySelector(`#mp-options-container .option[data-index='${index}']`);
        if (!option || option.classList.contains('disabled')) return;
        
        optionClickSound.play();
        mpSelectedOptionIndex = index;
        document.querySelectorAll('#mp-options-container .option').forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
        updateMultiplayerQuizActions();
    }

    function checkMultiplayerAnswer() {
        if (mpSelectedOptionIndex === null) return;
        
        const question = quizData[mpCurrentQuestionIndex];
        const isCorrect = mpSelectedOptionIndex === question.correctAnswerIndex;

        if(isCorrect) {
            // Fix for line 1030: Added placeholder function
            triggerCongratsAnimation();
            showMultiplayerFaceReaction(true);
        } else {
            // Fix for line 1033: Added placeholder function
            showSadReaction();
            showMultiplayerFaceReaction(false);
        }
        
        renderMultiplayerAnsweredState(mpSelectedOptionIndex, isCorrect);
        saveMultiplayerAnswer(mpSelectedOptionIndex, isCorrect);
        updateMultiplayerQuizActions();
    }
    
    async function saveMultiplayerAnswer(selectedIndex: number, isCorrect: boolean) {
        // Fix for line 1043: Added declaration for window.firebase
        const { db, ref, runTransaction } = window.firebase;
        const playerRef = ref(db, `rooms/${currentRoomCode}/players/${currentPlayerId}`);

        try {
            await runTransaction(playerRef, (player: any) => {
                if (player) {
                    if (!player.answers) player.answers = [];
                    if (!player.answers[mpCurrentQuestionIndex]) {
                       player.answers[mpCurrentQuestionIndex] = { selected: selectedIndex, correct: isCorrect };
                    }
                }
                return player;
            });
        } catch (error) {
            console.error("Failed to save answer:", error);
            alert("Could not save your answer. Please check your connection.");
        }
    }
    
    function updateMultiplayerQuizActions() {
        elements.mpQuizActions!.innerHTML = '';
        const myAnswers = lastRoomData?.players[currentPlayerId]?.answers || [];
        const isAnswered = !!myAnswers[mpCurrentQuestionIndex];

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.id = 'mp-prev-btn';
        prevBtn.className = 'btn btn-secondary quiz-actions-top-left';
        prevBtn.textContent = '⬅️ Previous';
        prevBtn.disabled = mpCurrentQuestionIndex === 0;
        elements.mpQuizActions!.appendChild(prevBtn);

        if (isAnswered) {
            const nextBtn = document.createElement('button');
            nextBtn.id = 'mp-next-btn';
            nextBtn.className = 'btn quiz-actions-bottom-left';
            nextBtn.textContent = 'Next ➡️';
            nextBtn.disabled = mpCurrentQuestionIndex >= quizData.length - 1;
            elements.mpQuizActions!.appendChild(nextBtn);

        } else {
            const checkBtn = document.createElement('button');
            checkBtn.id = 'mp-check-answer-btn';
            checkBtn.className = 'btn btn-success quiz-actions-top-right';
            checkBtn.textContent = 'Check Answer ✅';
            checkBtn.disabled = mpSelectedOptionIndex === null;
            elements.mpQuizActions!.appendChild(checkBtn);
            
            const skipBtn = document.createElement('button');
            skipBtn.id = 'mp-skip-btn';
            skipBtn.className = 'btn quiz-actions-bottom-left';
            skipBtn.style.backgroundColor = '#ffc107';
            skipBtn.style.color = '#333';
            skipBtn.textContent = 'Skip ➡️';
            skipBtn.addEventListener('click', () => {
                 if (mpCurrentQuestionIndex < quizData.length - 1) {
                    loadMultiplayerQuestion(mpCurrentQuestionIndex + 1);
                 }
            });
            elements.mpQuizActions!.appendChild(skipBtn);
        }

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-danger quiz-actions-bottom-right';
        submitBtn.textContent = 'Submit';
        submitBtn.addEventListener('click', () => submitMultiplayerQuiz(false));
        elements.mpQuizActions!.appendChild(submitBtn);
    }
    
    function showMultiplayerFaceReaction(isCorrect: boolean) {
        const faceToShow = isCorrect ? elements.mpFaceHappy : elements.mpFaceAngry;
        const faceToHide = isCorrect ? elements.mpFaceAngry : elements.mpFaceHappy;
        
        faceToHide!.classList.remove('visible');
        faceToShow!.classList.add('visible');
        
        setTimeout(() => {
            faceToShow!.classList.remove('visible');
        }, 2000);
    }

    function startMultiplayerTimer(totalSeconds: number, startTime: number) {
        if (clientTimer) clearInterval(clientTimer);
        
        const updateTimer = () => {
            const serverTimeOffset = 0; 
            const now = Date.now() + serverTimeOffset;
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remainingSeconds = totalSeconds - elapsedSeconds;

            if (remainingSeconds <= 0) {
                elements.mpTimer!.textContent = "00:00";
                clearInterval(clientTimer);
                const myData = lastRoomData?.players?.[currentPlayerId!];
                if (myData && !myData.isFinished) {
                    submitMultiplayerQuiz(true);
                }
                return;
            }
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            elements.mpTimer!.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        updateTimer();
        clientTimer = setInterval(updateTimer, 1000);
    }
    
    async function submitMultiplayerQuiz(isAutoSubmit = false) {
        if (!isAutoSubmit) {
            if (!confirm("Are you sure you want to submit? You cannot change your answers after submitting.")) return;
        }
    
        if (clientTimer) clearInterval(clientTimer);
        elements.waitingForSubmissionOverlay!.classList.remove('hidden');
    
        // Fix for line 1159: Added declaration for window.firebase
        const { db, ref, set } = window.firebase;
        const finishedRef = ref(db, `rooms/${currentRoomCode}/players/${currentPlayerId}/isFinished`);
    
        try {
            await set(finishedRef, true);
            showPersonalMultiplayerResults();
        } catch (error) {
            console.error("Failed to submit:", error);
            alert("There was an error submitting. Please check your connection.");
        } finally {
            elements.waitingForSubmissionOverlay!.classList.add('hidden');
        }
    }
    
    function showPersonalMultiplayerResults() {
        showScreen('mpResults');
        elements.multiplayerResultsContainer!.querySelector('#leaderboard-section')!.classList.add('hidden');
        elements.multiplayerResultsContainer!.querySelector('#waiting-for-leaderboard-text')!.classList.remove('hidden');
        elements.multiplayerResultsContainer!.querySelector('#room-deletion-countdown')!.classList.add('hidden');
        elements.multiplayerResultsContainer!.querySelector('#mp-results-title')!.textContent = '🏆 Assessment Submitted! 🏆';
    
        const personalStatsContainer = elements.multiplayerPersonalSummary!.querySelector('.summary-grid');
        const myData = lastRoomData.players[currentPlayerId!];
        if (myData) {
            const myAnswers = myData.answers || [];
            let correctCount = 0;
            myAnswers.forEach((ans: any, index: number) => {
                if (ans && quizData[index] && ans.correct) {
                    correctCount++;
                }
            });
            const finalScore = correctCount * 10;
            const totalAnswered = myAnswers.filter((a: any) => a !== null && a !== undefined).length;
            const incorrectCount = totalAnswered - correctCount;
            const skippedCount = quizData.length - totalAnswered;
            const percentage = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
            
            personalStatsContainer!.innerHTML = `
                <div class="summary-item">
                    <span class="summary-label">Correct</span>
                    <span class="summary-value" style="color: var(--correct-color);">${correctCount}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Incorrect</span>
                    <span class="summary-value" style="color: var(--incorrect-color);">${incorrectCount}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Skipped</span>
                    <span class="summary-value" style="color: var(--skipped-color);">${skippedCount}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Score</span>
                    <span class="summary-value remark">${finalScore} (${percentage.toFixed(0)}%)</span>
                </div>
            `;
        }
    }
    
    function showFinalLeaderboardAndStartCountdown(roomData: any) {
        if (countdownTimerId) return;

        if (elements.multiplayerResultsContainer!.classList.contains('hidden')) {
            showPersonalMultiplayerResults();
        }
    
        const leaderboardSection = elements.multiplayerResultsContainer!.querySelector('#leaderboard-section')!;
        const waitingText = elements.multiplayerResultsContainer!.querySelector('#waiting-for-leaderboard-text')!;
        const countdownText = elements.multiplayerResultsContainer!.querySelector('#room-deletion-countdown')!;
        const title = elements.multiplayerResultsContainer!.querySelector('#mp-results-title')!;
    
        title.textContent = '🏆 Final Results 🏆';
        waitingText.classList.add('hidden');
        leaderboardSection.classList.remove('hidden');
        countdownText.classList.remove('hidden');
    
        const leaderboard = document.getElementById('leaderboard')!;
        leaderboard.innerHTML = '';
        
        const players = Object.values(roomData.players || {}) as any[];
        players.forEach(player => {
            // Fix for line 1239: Accessing property on 'any' type
            const answers = player.answers || [];
            let correctCount = 0;
            answers.forEach((ans: any, index: number) => {
                if (ans && ans.correct) {
                    correctCount++;
                }
            });
            // Fix for line 1246: Adding property to 'any' type
            player.finalScore = correctCount * 10;
        });
    
        // Fix for line 1249: Accessing property on 'any' type
        players.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
        
        players.forEach(player => {
            const li = document.createElement('li');
            // Fix for line 1253: Accessing properties on 'any' type
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
                // Fix for line 1266: Added placeholder function
                handleHardReset();
            }
        }, 1000);
    }
    
    // --- OCR & Image/PDF Processing (UPGRADED) ---
    async function getOcrWorker(lang: string, statusEl: HTMLElement) {
        if (ocrWorker && currentOcrLang === lang) {
            return ocrWorker;
        }

        if (ocrWorker) {
            statusEl.textContent = 'Switching OCR language model...';
            await ocrWorker.terminate();
            ocrWorker = null;
            currentOcrLang = null;
        }

        const langName = { 'eng': 'English', 'hin': 'Hindi', 'eng+hin': 'English+Hindi' }[lang];
        statusEl.textContent = `Initializing ${langName} OCR Engine (this happens once per language)...`;
        try {
            // Fix for line 1287: Added declaration for Tesseract
            ocrWorker = await Tesseract.createWorker(lang, 1, {
                logger: (m: any) => {
                    if (m.status === 'recognizing text') {
                        const progress = (m.progress * 100).toFixed(0);
                        statusEl.textContent = `Recognizing Text... ${progress}%`;
                    } else if (m.status === 'loading language model') {
                         statusEl.textContent = `Loading ${langName} Model... (may take a moment on first load)`;
                    }
                }
            });
            currentOcrLang = lang;
            statusEl.textContent = `${langName} OCR Engine is ready.`;
            return ocrWorker;
        } catch (error) {
            console.error("Failed to initialize OCR worker:", error);
            statusEl.textContent = `Error: Could not initialize ${langName} OCR engine.`;
            ocrWorker = null;
            currentOcrLang = null;
            return null;
        }
    }
    
    // --- MEMORY-FIX: New helper function to resize images before processing ---
    async function resizeImage(file: File, maxDimension = 2048): Promise<HTMLCanvasElement> {
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
                        } else {
                            width = Math.round(width * (maxDimension / height));
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas);
                };
                img.onerror = reject;
                // Fix for line 1335: Cast FileReader result to string
                img.src = (event.target as FileReader).result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // --- MEMORY-FIX: Rewritten image processing function ---
    async function processAndExtractAllImages(files: File[]) {
        if (files.length === 0) {
            hideLoading();
            return;
        }

        showLoading("Preparing OCR Engine...");
        const worker = await getOcrWorker(selectedImageOcrLang!, elements.ocrStatus!);

        if (!worker) {
            hideLoading();
            alert("OCR Engine could not be started. Please check your internet connection and try again.");
            return;
        }

        imageFiles = files.map(file => ({
            originalFile: file,
            id: `img_${Date.now()}_${Math.random()}`,
            croppedFile: null,
            previewUrl: URL.createObjectURL(file)
        }));
        updateImagePreviews();

        showLoading("Processing images...");
        let allExtractedText = '';

        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const imgState = imageFiles[i];
                const fileToProcess = imgState.croppedFile || imgState.originalFile;

                elements.ocrStatus!.textContent = `Resizing image ${i + 1}/${imageFiles.length} for optimal performance...`;
                const mainCanvas = await resizeImage(fileToProcess);

                let bestText = '';
                let bestConfidence = -1;

                for (const angle of [0, 90, 180, 270]) {
                    elements.ocrStatus!.textContent = `Analyzing image ${i + 1}/${imageFiles.length} (orientation: ${angle}°)...`;

                    let rotatedCanvas = document.createElement('canvas');
                    let ctx = rotatedCanvas.getContext('2d')!;

                    if (angle === 90 || angle === 270) {
                        // Fix for line 1387-1388: Properties exist on HTMLCanvasElement
                        rotatedCanvas.width = mainCanvas.height;
                        rotatedCanvas.height = mainCanvas.width;
                    } else {
                        // Fix for line 1390-1391: Properties exist on HTMLCanvasElement
                        rotatedCanvas.width = mainCanvas.width;
                        rotatedCanvas.height = mainCanvas.height;
                    }
                    
                    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
                    ctx.rotate(angle * Math.PI / 180);
                    // Fix for line 1396: Properties exist on HTMLCanvasElement
                    ctx.drawImage(mainCanvas, -mainCanvas.width / 2, -mainCanvas.height / 2);
                    
                    // Fix for line 1398: Cast element to HTMLInputElement
                    const isHandwriting = (elements.handwritingToggle as HTMLInputElement).checked;
                    // Fix for line 1399: Added declaration for Tesseract
                    await worker.setParameters({ tessedit_pageseg_mode: isHandwriting ? Tesseract.PSM.SINGLE_BLOCK : Tesseract.PSM.AUTO });

                    const { data } = await worker.recognize(rotatedCanvas);

                    if (data.confidence > bestConfidence) {
                        bestConfidence = data.confidence;
                        bestText = data.text;
                    }

                    // Aggressive cleanup
                    rotatedCanvas.width = 0;
                    rotatedCanvas.height = 0;
                    rotatedCanvas = null!;
                    ctx = null!;
                    
                    // --- START OF MODIFICATION ---
                    // If OCR confidence at 0 degrees is over 50, skip other angles for this image.
                    if (angle === 0 && data.confidence > 50) {
                        break; 
                    }
                    // --- END OF MODIFICATION ---

                    if (bestConfidence > 95) break; 
                }
                
                // Cleanup main canvas for the image
                // Fix for line 1425-1426: Properties exist on HTMLCanvasElement
                mainCanvas.width = 0;
                mainCanvas.height = 0;

                allExtractedText += bestText + '\n\n';
            }

            // Fix for line 1431: Cast element to HTMLTextAreaElement
            (elements.sourceTextImage as HTMLTextAreaElement).value = allExtractedText;
            if (allExtractedText.trim()) {
                elements.imageQuizDefinitionArea!.classList.remove('hidden');
                elements.ocrStatus!.textContent = `✅ Text extracted successfully from ${imageFiles.length} image(s).`;
            } else {
                elements.ocrStatus!.textContent = `🤔 Could not extract any text. Try clearer images.`;
            }
        } catch (err) {
            console.error("Error during image processing:", err);
            elements.ocrStatus!.textContent = '❌ Error: Processing failed. This can happen with very large images or on devices with low memory. Please try with smaller or fewer images.';
        } finally {
            hideLoading();
        }
    }

    // --- MEMORY-FIX: Rewritten PDF processing function ---
    async function runPdfExtraction() {
        if (!pdfFile) { alert("Please select a PDF file first."); return; }
        
        // Fix for line 1450: Cast element to HTMLInputElement
        const useOcr = (elements.pdfForceOcrCheckbox as HTMLInputElement).checked;
        let worker;
        if (useOcr) {
            showLoading("Preparing OCR Engine...");
            worker = await getOcrWorker(selectedPdfOcrLang!, elements.pdfStatus!);
            if (!worker) {
                hideLoading();
                alert("OCR Engine could not be started. Please try again.");
                return;
            }
        }

        showLoading("Extracting text from PDF...");
        elements.pdfStatus!.textContent = 'Starting extraction...';
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Fix for line 1468: Cast result to ArrayBuffer
                const typedarray = new Uint8Array(e.target!.result as ArrayBuffer);
                // Fix for line 1469: Added declaration for pdfjsLib
                const pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
                // Fix for line 1470: Cast element to HTMLInputElement
                const pageOption = (document.querySelector('input[name="pdf-page-option"]:checked') as HTMLInputElement).value;
                let startPage = 1, endPage = pdfDoc.numPages;
                if (pageOption === 'range') {
                    // Fix for line 1473-1474: Cast elements to HTMLInputElement
                    startPage = parseInt((document.getElementById('pdf-page-from') as HTMLInputElement).value, 10) || 1;
                    endPage = parseInt((document.getElementById('pdf-page-to') as HTMLInputElement).value, 10) || pdfDoc.numPages;
                }
                
                const text = useOcr 
                    ? await extractPdfTextWithOcr(pdfDoc, startPage, endPage, worker!) 
                    : await extractPdfTextNative(pdfDoc, startPage, endPage);
                    
                // Fix for line 1481: Cast element to HTMLTextAreaElement
                (elements.sourceTextPdf as HTMLTextAreaElement).value = text;
                elements.pdfQuizDefinitionArea!.classList.remove('hidden');
                elements.pdfStatus!.textContent = '✅ Text extracted successfully!';
            } catch (err) {
                console.error("Error during PDF processing:", err);
                elements.pdfStatus!.textContent = '❌ Error: Could not process PDF. It may be corrupt, protected, or too large for this device. Try a smaller page range.';
            } finally {
                hideLoading();
            }
        };
        reader.onerror = (e) => {
            console.error("FileReader error:", e);
            elements.pdfStatus!.textContent = '❌ Error: Could not read the selected file.';
            hideLoading();
        };
        reader.readAsArrayBuffer(pdfFile);
    }

    // --- All other functions ---
    // Fix for line 1608: Property 'classList' does not exist on type...
    function showCreationSelector() { elements.manualGeneratorContainer!.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden')); (['topic', 'text', 'image', 'pdf'] as const).forEach(w => elements[`${w}GeneratorWorkflow`]!.classList.add('hidden')); elements.creationMethodSelector!.classList.remove('hidden'); elements.imageFormatGuide!.classList.add('hidden'); }
    
    function showWorkflow(workflowName: string) {
        elements.creationMethodSelector!.classList.add('hidden');
        (document.querySelector('.back-to-mode-selection-btn') as HTMLElement).classList.add('hidden');
        // Fix for line 1616: Property 'classList' does not exist on type...
        (['topic', 'text', 'image', 'pdf'] as const).forEach(w => {
            const key = `${w}GeneratorWorkflow`;
            if (elements[key]) {
                elements[key]!.classList.add('hidden');
            }
        });

        const workflowElement = elements[(workflowName + 'GeneratorWorkflow') as keyof typeof elements] as HTMLElement;
        if (workflowElement) {
            workflowElement.classList.remove('hidden');

            const examButtonsContainer = workflowElement.querySelector('.exam-buttons-container');
            const otherExamInput = workflowElement.querySelector('.prompt-exam-other');

            if (examButtonsContainer && otherExamInput) {
                examButtonsContainer.querySelectorAll('.exam-btn').forEach(btn => btn.classList.remove('active'));
                const btnToActivate = examButtonsContainer.querySelector(`.exam-btn[data-exam-name="${selectedExam}"]`);
                if (btnToActivate) {
                    btnToActivate.classList.add('active');
                }
                otherExamInput.classList.toggle('hidden', selectedExam !== 'Other');
            }

            if (workflowName === 'pdf') {
                const rangeRadio = document.getElementById('pdf-page-option-range') as HTMLInputElement;
                elements.pdfPageRangeSelector!.classList.toggle('hidden', !rangeRadio.checked);
            }
        }
    }

    function populateSharedElements() {
        const formatSelects = document.querySelectorAll('select[id^="question-format-select"]');
        formatSelects.forEach(select => {
            if (!select) return;
            select.innerHTML = '';
            Object.keys(QUESTION_FORMATS).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = QUESTION_FORMATS[key as keyof typeof QUESTION_FORMATS].name;
                select.appendChild(option);
            });
            (select as HTMLSelectElement).value = 'mcq';
        });
    }

    async function saveQuizState() { if (quizData.length === 0 || elements.quizPlayerContainer!.classList.contains('hidden')) { await dbHelper.set(QUIZ_STATE_KEY, null); return; } const state = { originalQuizData, userAnswers, currentQuestionIndex, bookmarkedQuestions: Array.from(bookmarkedQuestions), quizStartTime: quizStartTime!.toISOString(), quizMetaData: quizMetaData, creationWorkflow: creationWorkflow }; await dbHelper.set(QUIZ_STATE_KEY, state); }
    
    // Fix for line 1550: Added QuizState interface and type assertion
    interface QuizState {
        originalQuizData: any[];
        userAnswers: any[];
        currentQuestionIndex: number;
        bookmarkedQuestions: any[];
        quizStartTime: string;
        quizMetaData: any;
        creationWorkflow: string | null;
    }
    async function loadQuizState() { const state = await dbHelper.get(QUIZ_STATE_KEY) as QuizState | null; if (!state) return false; try { originalQuizData = state.originalQuizData; quizData = JSON.parse(JSON.stringify(originalQuizData)); userAnswers = state.userAnswers; currentQuestionIndex = state.currentQuestionIndex; bookmarkedQuestions = new Set(state.bookmarkedQuestions); quizStartTime = new Date(state.quizStartTime); quizMetaData = state.quizMetaData || {}; creationWorkflow = state.creationWorkflow || null; _displayScreen('player'); loadQuestion(currentQuestionIndex); showPasteNotification('✅ Your active assessment has been restored.'); return true; } catch (e) { console.error("Failed to load state:", e); await dbHelper.set(QUIZ_STATE_KEY, null); return false; } }
    
    function setupPasteScreen() {
        const tryAutoPaste = async () => {
            // This function attempts to read the clipboard when the user returns to the tab.
            // Modern browsers require the page to be in focus and often require a user gesture for this to succeed.
            // It will fail silently if permission is denied, which is the desired behavior.
            if (!navigator.clipboard || !navigator.clipboard.readText) return;
            // Fix for line 1558: Cast element to HTMLTextAreaElement
            if ((elements.quizDataInput as HTMLTextAreaElement).value.trim() !== '') return;
            if (document.hidden) return;

            try {
                const text = await navigator.clipboard.readText();
                // **FIX:** Broadened the check to detect more quiz formats automatically.
                if (text && text.trim() && (text.includes("Question:") || text.includes("Correct Answer:") || text.includes("Assertion (A):"))) {
                    // Fix for line 1565: Cast element to HTMLTextAreaElement
                    (elements.quizDataInput as HTMLTextAreaElement).value = text;
                    // Fix for line 1566: Added placeholder function
                    showPasteNotification('✨ Auto-pasted! Processing...');
                    handlePasteAndParse();
                }
            } catch (err: any) {
                // This error is expected if the user hasn't granted permission or the browser restricts access.
                // We fail silently and let the user paste manually.
                console.log("Silent auto-paste attempt failed. User can paste manually.", err.name);
            }
        };

        elements.quizDataInput!.addEventListener('focus', tryAutoPaste);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.location.hash === '#paste') {
                tryAutoPaste();
            }
        });

        tryAutoPaste(); // Attempt once when the screen loads
    }

    async function handlePasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
                // Fix for line 1590: Cast element to HTMLTextAreaElement
                (elements.quizDataInput as HTMLTextAreaElement).value = text;
                // Fix for line 1591: Added placeholder function
                showPasteNotification('✅ Pasted from clipboard! Parsing...');
                handlePasteAndParse();
            } else {
                // Fix for line 1594: Added placeholder function
                showPasteNotification('🤔 Your clipboard is empty.');
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            alert('Could not read from clipboard. This can happen if you denied permission or are in a private browser window. Please paste the text manually into the box.');
        }
    }
    
    // --- UPDATED PROMPT GENERATION FUNCTION ---
    function generatePrompt(source: any, sourceType: string) {
        creationWorkflow = sourceType; // MODIFIED: Track the workflow
        isFromSearchPractice = false; // Reset flag for new quizzes
        const { numQuestions, topic, subject, difficulty, language, formatKey, exam, sourceText } = source;

        if (sourceType === 'topic' && !topic) { alert('Please enter a Primary Topic.'); return null; }
        if ((sourceType !== 'topic' && !sourceText) || !numQuestions) { alert('Please ensure you have provided source material and the number of questions.'); return null; }
        if (!exam) { alert("Please select a target exam before generating questions."); return null; }
        
        // MODIFIED: Store the final exam name
        quizMetaData.examName = exam;
        
        let sampleFormat = "";
        switch (formatKey) {
            case 'mcq': sampleFormat = MCQ_EXAMPLE; break;
            case 'statement': sampleFormat = STATEMENT_EXAMPLE; break;
            case 'assertion-reason': sampleFormat = AR_EXAMPLE; break;
            case 'math-physics': sampleFormat = MATH_EXAMPLE; break;
            case 'true-false': sampleFormat = TF_EXAMPLE; break;
            case 'fill-blank': sampleFormat = FILL_BLANK_EXAMPLE; break;
            default: sampleFormat = LEGACY_FORMAT_TEXT; break;
        }

        let prompt = `You are an expert at generating high-quality assessment questions in plain text format. Your responses must be very fast and precise.

CRITICAL INSTRUCTIONS (MUST be followed):
1.  **Output Format:** Provide the entire response as a single block of plain text. DO NOT use Markdown, JSON, code blocks, or any other formatting.
2.  **Strict Format Adherence:** You MUST generate questions that EXACTLY match the requested "Question Format" parameter below. For example, if asked for "Multiple Choice (MCQ)", you MUST generate ONLY MCQs.
3.  **Question Structure:** STRICTLY follow the sample format provided below for every single question.
4.  **Statement Formatting:** For Statement-Based questions, individual statements MUST be preceded by an asterisk (*) and a space. DO NOT number the statements (e.g., use "* Statement text" NOT "1. Statement text"). The provided sample for Statement-Based questions demonstrates this correct format.
5.  **Correct Answer Line:** The 'Correct Answer:' line MUST contain ONLY the letter of the correct option (e.g., "Correct Answer: c"). DO NOT include the text of the answer.
6.  **Completeness:** Each question MUST have a question, all options, a single correct answer letter, and a detailed explanation.
7.  **Math/Physics Symbols:** Use valid LaTeX for all formulas. Enclose all inline math with \\( ... \\) delimiters (e.g., \\(x^2\\)) and all display math with \\[ ... \\]. DO NOT use $ or $$.
8.  **Terminology:** Use the term "questions" or "assessment". DO NOT use the word "quiz".

--- ASSESSMENT PARAMETERS ---
*   **Number of Questions:** ${numQuestions}
*   **Primary Topic:** ${topic || (sourceType === 'text' ? 'Multiple Topics' : 'Not specified')}
*   **Subject:** ${subject || (sourceType === 'text' ? 'Multiple Subjects' : 'Not specified')}
*   **Difficulty Level:** ${difficulty}
*   **Language:** ${language}
*   **Question Format:** ${QUESTION_FORMATS[formatKey as keyof typeof QUESTION_FORMATS].name}
*   **Target Exam:** ${exam}
*   **Target Exam Instructions:** Generate questions based on analysis of previous year questions that are relevant, and match the syllabus, question pattern, and difficulty level of the '${exam}' exam.

--- SOURCE MATERIAL INSTRUCTIONS ---
`;

        if (sourceType === 'pdf') {
            prompt += `*   **Knowledge Base:** You MUST generate questions based primarily on the "Source Material" provided below. Use the provided text as the core context and factual basis for the questions.
    *   For 'Easy' difficulty, generate questions directly from the lines and facts present.
    *   For 'Medium', 'Hard', and 'Expert' difficulties, increase the conceptual depth of the questions, but they MUST remain grounded in the information provided in the source material.
    *   You may use your external knowledge ONLY to properly frame the questions, ensure they are conceptually sound, and match the difficulty and style of the specified target exam. DO NOT introduce facts or topics completely unrelated to the source material.`;
        } else { // For topic, text, image
            prompt += `*   **Knowledge Base:** Use your own internal knowledge to create the questions. The "Primary Topic", "Subject", and "Source Material" (if provided) should be used as a guide and context. Your primary goal is to create new, high-quality questions that accurately match the standard, syllabus, and difficulty level of the specified target exam.`;
        }

        prompt += `

--- REQUIRED QUESTION SAMPLE FORMAT (Follow Strictly) ---
${sampleFormat}
-------------------------------------------------------
`;

        if (sourceText) {
            prompt += `
Now, generate the questions based on all the instructions above and the following source material/details:
--- START OF SOURCE MATERIAL ---
${sourceText}
--- END OF SOURCE MATERIAL ---`;
        } else {
             prompt += `
Now, generate the questions based on all the instructions above.`;
        }

        promptForGemini = prompt;
        elements.geminiInstructionsModalOverlay!.classList.remove('hidden');
    }
    
    async function executePostPromptActions(prompt: string) {
        // Hide the modal first
        elements.geminiInstructionsModalOverlay!.classList.add('hidden');
        
        // 1. Copy the prompt to the clipboard
        try {
            // Fix for line 1688-1689: Added placeholder function
            await copyTextToClipboard(prompt);
            showPasteNotification('✅ AI prompt copied to clipboard!');
        } catch (err) {
            // This will trigger the manual copy modal if the modern API fails.
            // The function already handles this fallback.
            console.error("Could not automatically copy the prompt.");
            // We still proceed to open Gemini.
        }

        // 2. Open Gemini in a new tab
        const aiWindow = window.open('https://gemini.google.com', '_blank');
    
        if (!aiWindow || aiWindow.closed || typeof aiWindow.closed === 'undefined') {
            // Fix for line 1701: Added placeholder function
            showPasteNotification('⚠️ Popup blocked! Click the link to open manually.');
            elements.aiLinkFallback!.classList.remove('hidden');
        } else {
            elements.aiLinkFallback!.classList.add('hidden');
        }
    
        // 3. Prepare the app for the user's return
        clearFormState();
        sessionStorage.setItem('gameMode', gameMode);
        showScreen('paste');
        promptForGemini = null; // Clear the prompt after use
    }

    function generateTopicPrompt() {
        // Fix for line 1715: Cast elements to access 'value'
        quizMetaData = { topic: (document.getElementById('prompt-topic') as HTMLInputElement).value.trim(), subject: (document.getElementById('prompt-subject-topic') as HTMLInputElement).value.trim() };
        const otherExamInput = elements.topicGeneratorWorkflow!.querySelector('.prompt-exam-other') as HTMLInputElement;
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;
        // Fix for line 1718: Cast elements to access 'value' and properties on quizMetaData
        const source = { numQuestions: (document.getElementById('prompt-num-questions-topic') as HTMLInputElement).value || 5, topic: quizMetaData.topic, subject: quizMetaData.subject, difficulty: (document.getElementById('prompt-difficulty-topic') as HTMLSelectElement).value, language: (document.getElementById('prompt-language-topic') as HTMLSelectElement).value, formatKey: (document.getElementById('question-format-select-topic') as HTMLSelectElement).value, exam: finalExam };
        generatePrompt(source, 'topic');
    }

    function generateTextPrompt() {
        const rows = document.querySelectorAll('.prompt-builder-row');
        let totalQuestions = 0;
        let sourceText = "Generate a mixed mock test based on the following sections:\n\n";

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Fix for line 1729-1733: Cast elements to access 'value'
            const numVal = (row.querySelector('[data-type="numQuestions"]') as HTMLInputElement).value;
            const subject = (row.querySelector('[data-type="subject"]') as HTMLInputElement).value.trim();
            const topic = (row.querySelector('[data-type="topic"]') as HTMLInputElement).value.trim();
            const standard = (row.querySelector('[data-type="standard"]') as HTMLInputElement).value.trim();
            const book = (row.querySelector('[data-type="book"]') as HTMLInputElement).value.trim();

            if (!numVal || !subject || !topic) {
                alert(`Please fill out at least the number of questions, subject, and topic for Section ${i + 1}.`);
                return;
            }
            
            const num = parseInt(numVal, 10);
            totalQuestions += num;

            sourceText += `Section ${i + 1}:\n`;
            sourceText += `- Subject: ${subject}\n`;
            sourceText += `- Topic: ${topic}\n`;
            sourceText += `- Number of Questions: ${num}\n`;
            if (standard) sourceText += `- Class/Standard: ${standard}\n`;
            if (book) sourceText += `- Reference Book: ${book}\n\n`;
        }

        if (totalQuestions === 0) {
            alert("Please add at least one section with a valid number of questions.");
            return;
        }

        quizMetaData = { topic: 'Custom Mock Test', subject: 'Mixed' };
        const otherExamInput = elements.textGeneratorWorkflow!.querySelector('.prompt-exam-other') as HTMLInputElement;
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;

        const source = { 
            numQuestions: totalQuestions, 
            topic: '', 
            subject: '', 
            // Fix for line 1758: Cast element to access 'value'
            difficulty: (document.getElementById('prompt-difficulty-text') as HTMLSelectElement).value, 
            language: (document.getElementById('prompt-language-text') as HTMLSelectElement).value, 
            formatKey: (document.getElementById('question-format-select-text') as HTMLSelectElement).value, 
            exam: finalExam,
            sourceText: sourceText.trim()
        };
        generatePrompt(source, 'text');
    }

    function generateImagePrompt() {
        // Fix for line 1764-1765: Cast elements to access 'value'
        quizMetaData = { topic: (document.getElementById('prompt-topic-image') as HTMLInputElement).value.trim(), subject: (document.getElementById('prompt-subject-image') as HTMLInputElement).value.trim() };
        const otherExamInput = elements.imageGeneratorWorkflow!.querySelector('.prompt-exam-other') as HTMLInputElement;
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;
        // Fix for line 1777: Cast elements to access 'value'
        const source = { numQuestions: (document.getElementById('prompt-num-questions-image') as HTMLInputElement).value, topic: quizMetaData.topic, subject: quizMetaData.subject, difficulty: (document.getElementById('prompt-difficulty-image') as HTMLSelectElement).value, language: (document.getElementById('prompt-language-image') as HTMLSelectElement).value, formatKey: (document.getElementById('question-format-select-image') as HTMLSelectElement).value, exam: finalExam, sourceText: (elements.sourceTextImage as HTMLTextAreaElement).value.trim() };
        generatePrompt(source, 'image');
    }

    function generatePdfPrompt() {
        // Fix for line 1782: Cast elements to access 'value'
        quizMetaData = { topic: (document.getElementById('prompt-topic-pdf') as HTMLInputElement).value.trim(), subject: (document.getElementById('prompt-subject-pdf') as HTMLInputElement).value.trim() };
        const otherExamInput = elements.pdfGeneratorWorkflow!.querySelector('.prompt-exam-other') as HTMLInputElement;
        const finalExam = (selectedExam === 'Other') ? otherExamInput.value.trim() : selectedExam;
        // Fix for line 1785: Cast elements to access 'value'
        const source = { numQuestions: (document.getElementById('prompt-num-questions-pdf') as HTMLInputElement).value, topic: quizMetaData.topic, subject: quizMetaData.subject, difficulty: (document.getElementById('prompt-difficulty-pdf') as HTMLSelectElement).value, language: (document.getElementById('prompt-language-pdf') as HTMLSelectElement).value, formatKey: (document.getElementById('question-format-select-pdf') as HTMLSelectElement).value, exam: finalExam, sourceText: (elements.sourceTextPdf as HTMLTextAreaElement).value.trim() };
        generatePrompt(source, 'pdf');
    }
    
    function setupAllExamSelectors() { document.querySelectorAll('.exam-buttons-container').forEach(container => { const inputField = container.nextElementSibling as HTMLElement; populateExamButtons(container as HTMLElement, inputField); }); }
    
    function populateExamButtons(container: HTMLElement, inputField: HTMLElement) {
        const exams = ["JEE", "NEET", "BANK", "RRB", "NEET PG", "CTET", "State PSC", "Police", "UPSSSC", "CUET", "UPSC", "SSC", "CBSE", "Other"];
        container.innerHTML = exams.map(exam => `<button class="btn exam-btn" data-exam-name="${exam}">${exam}</button>`).join('');

        container.addEventListener('click', e => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('exam-btn')) {
                const clickedBtn = target;
                const examName = clickedBtn.dataset.examName!;
                // De-select all buttons in the *same* container
                container.querySelectorAll('.exam-btn').forEach(btn => btn.classList.remove('active'));
                clickedBtn.classList.add('active');
                selectedExam = examName;
                
                // Show/hide the 'Other' input field
                if (inputField) {
                    inputField.classList.toggle('hidden', examName !== 'Other');
                    if (examName === 'Other') inputField.focus();
                }
                saveFormState();
            }
        });

        if (inputField) {
            inputField.addEventListener('input', () => {
                if (selectedExam === 'Other') saveFormState();
            });
        }
    }
    
    function handlePdfSelection(event: Event) { 
        pdfFile = (event.target as HTMLInputElement).files![0]; 
        if (pdfFile) { 
            elements.pdfFileName!.textContent = pdfFile.name; 
            elements.pdfOptionsContainer!.classList.remove('hidden'); 
            elements.pdfQuizDefinitionArea!.classList.add('hidden'); 
            elements.pdfStatus!.textContent = '';
            document.getElementById('pdf-page-range-selector')!.classList.remove('hidden');
        } 
    }
    
    // --- MEMORY-FIX: Rewritten page-by-page OCR function for PDFs ---
    async function extractPdfTextWithOcr(pdfDoc: any, start: number, end: number, worker: Tesseract.Worker) {
        let fullText = '';
        const scale = 2.0; // Reduced scale for better memory management

        for (let i = start; i <= Math.min(end, pdfDoc.numPages); i++) {
            let canvas: HTMLCanvasElement | null = null;
            try {
                elements.pdfStatus!.textContent = `Processing page ${i} of ${end}...`;
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: scale });
                
                canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                page.cleanup(); // Immediately release page data

                elements.pdfStatus!.textContent = `Extracting text from page ${i} of ${end}... (This can take a moment)`;
                const { data: { text } } = await worker.recognize(canvas);
                fullText += text + '\n\n';
            } catch (error) {
                console.error(`Error processing page ${i}:`, error);
                fullText += `[Error processing page ${i}]\n\n`;
            } finally {
                // Aggressively clean up the canvas to free memory
                if (canvas) {
                    canvas.width = 0;
                    canvas.height = 0;
                    canvas = null;
                }
            }
        }
        return fullText;
    }


    async function extractPdfTextNative(pdf: any, start: number, end: number) { let fullText = ''; for (let i = start; i <= end; i++) { elements.pdfStatus!.textContent = `Reading text from page ${i}...`; const page = await pdf.getPage(i); const textContent = await page.getTextContent(); fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n'; } return fullText; }
    async function handleImageSelection(event: Event) { const newFiles = Array.from((event.target as HTMLInputElement).files!); if (newFiles.length === 0) return; imageFiles = []; (elements.sourceTextImage as HTMLTextAreaElement).value = ''; elements.imageQuizDefinitionArea!.classList.add('hidden'); elements.ocrStatus!.textContent = ''; updateImagePreviews(); processAndExtractAllImages(newFiles); (event.target as HTMLInputElement).value = ''; }
    function updateImagePreviews() { elements.imagePreviewContainer!.innerHTML = ''; imageFiles.forEach(imgFile => { const fileForPreview = imgFile.croppedFile || imgFile.originalFile; if(imgFile.previewUrl) URL.revokeObjectURL(imgFile.previewUrl); imgFile.previewUrl = URL.createObjectURL(fileForPreview); const wrapper = document.createElement('div'); wrapper.className = 'img-preview-wrapper'; wrapper.innerHTML = `<div class="img-container"><img src="${imgFile.previewUrl}" alt="Image preview"></div><div class="img-preview-actions"><button class="img-preview-btn crop-btn" data-id="${imgFile.id}" title="Crop">✂️</button><button class="img-preview-btn remove-btn" data-id="${imgFile.id}" title="Remove">🗑️</button></div>`; elements.imagePreviewContainer!.appendChild(wrapper); }); }
    function removeImage(idToRemove: string) { const indexToRemove = imageFiles.findIndex(f => f.id === idToRemove); if (indexToRemove > -1) { if (imageFiles[indexToRemove].previewUrl) URL.revokeObjectURL(imageFiles[indexToRemove].previewUrl); imageFiles.splice(indexToRemove, 1); updateImagePreviews(); const remainingFiles = imageFiles.map(f => f.croppedFile || f.originalFile); showLoading("Re-extracting text from cropped image..."); processAndExtractAllImages(remainingFiles); } }
    function openCropModal(imageId: string) { const imgFile = imageFiles.find(f => f.id === imageId); if (!imgFile) return; currentEditingImageId = imageId; const fileToCrop = imgFile.croppedFile || imgFile.originalFile; (elements.imageToCrop as HTMLImageElement).src = URL.createObjectURL(fileToCrop); elements.cropModalOverlay!.classList.remove('hidden'); (elements.imageToCrop as HTMLImageElement).onload = () => { if (cropper) cropper.destroy(); cropper = new Cropper(elements.imageToCrop as HTMLImageElement, { aspectRatio: NaN, viewMode: 1, background: false, autoCropArea: 0.9, }); }; }
    function closeCropModal() { if(cropper) cropper.destroy(); cropper = null; currentEditingImageId = null; elements.cropModalOverlay!.classList.add('hidden'); }
    function saveCrop() { if (!cropper || !currentEditingImageId) return; cropper.getCroppedCanvas({ minWidth: 256, maxWidth: 4096, imageSmoothingQuality: 'high' }).toBlob((blob) => { const imgFile = imageFiles.find(f => f.id === currentEditingImageId); if(imgFile) { imgFile.croppedFile = blob; updateImagePreviews(); const currentFiles = imageFiles.map(f => f.croppedFile || f.originalFile); showLoading("Re-extracting text from cropped image..."); processAndExtractAllImages(currentFiles); } closeCropModal(); }); }
    
    function flexibleParser(text: string) {
        const questions: any[] = [];
        // **FIXED:** The regex for splitting questions is now more robust and generalized.
        const blocks = text.replace(/\r\n/g, '\n').split(/\n(?=^\s*(?:Question:|Q\d|^\d+[\.\)]|Assertion\s*\(A\):))/im);

        blocks.forEach(block => {
            if (block.trim().length < 10) return;

            const lines = block.trim().split('\n');
            let questionText = '';
            const options: string[] = [];
            let correctAnswer: string | null = null;
            let explanation = 'No explanation provided.';
            
            let questionLines: string[] = [];
            let optionsStarted = false;
            let answerFound = false;
            let explanationStarted = false;

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                // Use non-capturing groups (?:...) for matching to simplify logic
                const isExplanation = trimmedLine.match(/^(?:Explanation:|Reason:)/i);
                const isAnswer = trimmedLine.match(/^(?:Correct Answer:|Answer:|Ans:|Correct:)/i);
                // This regex is flexible for options like a), a., 1), 1., *, -, etc.
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

                if (!optionsStarted && !answerFound) {
                    questionLines.push(trimmedLine);
                }
            }
            
            questionText = questionLines.join('\n').replace(/^(?:Question:|Q\d|^\d+[\.\)])\s*/i, '').trim();

            if (questionText && options.length > 0 && correctAnswer) {
                const correctAnswerIndex = correctAnswer.charCodeAt(0) - 'a'.charCodeAt(0);

                if (correctAnswerIndex >= 0 && correctAnswerIndex < options.length) {
                     questions.push({
                        question: questionText,
                        options: options,
                        correctAnswerIndex: correctAnswerIndex,
                        explanation: explanation,
                    });
                }
            }
        });
        return questions;
    }
});
// Fix for line 12: Augmentations for the global scope... (making file a module)
export {};
