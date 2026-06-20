/* 
  =========================================
  Aetheria Main Interactive Logic (JS)
  =========================================
*/

// Global Application State
const state = {
    currentTab: 'dashboard',
    apiConfigured: false,
    chatHistory: [],
    
    // Active Quiz State
    quiz: {
        title: '',
        questions: [],
        currentIndex: 0,
        score: 0,
        answered: false
    },
    
    // Active Flashcard State
    deck: {
        name: '',
        cards: [],
        currentIndex: 0,
        scores: [], // 'correct' or 'wrong' for each card
        isFlipped: false
    },
    
    // Active Study Plan State
    studyPlan: null,
    activeWeek: 1,
    
    // Active Chat Attachment State
    chatAttachment: {
        base64: null,
        mime: null,
        fullDataUrl: null
    },
    
    // Active Math Solver State
    math: {
        activeInput: 'text', // 'text', 'image', or 'document'
        imageData: null,
        imageMime: null,
        documentText: null,
        documentName: null
    },
    
    // Dynamic Tutor Analytics State
    analytics: {
        quizzes: [],      // array of { topic, score, total, date }
        flashcards: [],   // array of { deckName, mastery, total, date }
        radarChart: null,
        trendChart: null,
        advisorReport: null
    }
};

// Document Ready Initialization
function initApp() {
    // 1. Setup Navigation
    setupNavigation();
    
    // 2. Check API Status
    checkApiStatus();
    
    // 3. Initialize Modules
    initSettingsModule();
    initChatModule();
    initSummarizerModule();
    initQuizModule();
    initFlashcardModule();
    initPlannerModule();
    initAnalyticsModule();
    initMathSolverModule();
    
    // Set current date in top header
    updateHeaderDate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// --------------------------------------------------
// Core Navigation & Helpers
// --------------------------------------------------
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
}

function switchTab(tabName) {
    state.currentTab = tabName;
    
    // Update Sidebar CSS classes
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update Page Header Title
    const titleMap = {
        'dashboard': 'Dashboard',
        'qa': 'Q&A Assistant',
        'summarizer': 'Smart Summarizer',
        'quiz': 'Quiz Generator',
        'flashcard': 'Flashcard Decks',
        'planner': 'Study Planner',
        'analytics': 'Tutor Analytics',
        'settings': 'Tutor Settings'
    };
    document.getElementById('page-title').textContent = titleMap[tabName] || 'Dashboard';
    
    // Switch View Panes
    document.querySelectorAll('.view-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    const targetPane = document.getElementById(`view-${tabName}`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
    
    // Refresh Analytics UI on tab switch
    if (tabName === 'analytics') {
        if (typeof refreshAnalyticsDashboard === 'function') {
            refreshAnalyticsDashboard();
        }
    }
}

function updateHeaderDate() {
    const dateElement = document.getElementById('date-display');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// Check API key configuration status from backend
async function checkApiStatus() {
    try {
        const res = await fetch('/api/settings/status');
        const data = await res.json();
        
        state.apiConfigured = data.configured;
        updateApiStatusUI(data.configured);
    } catch (err) {
        console.error("Error checking API status:", err);
    }
}

function updateApiStatusUI(configured) {
    const badges = [
        document.getElementById('api-status-badge'),
        document.getElementById('settings-status-box')
    ];
    
    const dot = document.querySelector('#api-status-badge .status-dot');
    const badgeText = document.querySelector('#api-status-badge .status-text');
    
    const settingsDot = document.getElementById('settings-badge-dot');
    const settingsText = document.getElementById('settings-badge-text');
    const settingsDesc = document.getElementById('settings-status-desc');
    
    if (configured) {
        // Connected UI
        if (dot) {
            dot.className = 'status-dot pulsing-green';
            badgeText.textContent = 'Tutor Connected';
        }
        
        if (settingsDot) {
            settingsDot.className = 'status-badge-dot bg-pulsing-green';
            settingsText.textContent = 'Connected & Active';
            settingsDesc.textContent = 'HSA AI Academy study assistants are fully online and powered by Gemini. You are ready to study!';
        }
    } else {
        // Disconnected UI
        if (dot) {
            dot.className = 'status-dot pulsing-orange';
            badgeText.textContent = 'Setup Required';
        }
        
        if (settingsDot) {
            settingsDot.className = 'status-badge-dot bg-pulsing-orange';
            settingsText.textContent = 'Not Configured';
            settingsDesc.textContent = 'Please insert your Gemini API Key below to activate HSA AI Academy academic assistants.';
        }
    }
}

// Toast Notifications System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove toast from DOM
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// --------------------------------------------------
// Module 7: Settings System
// --------------------------------------------------
function initSettingsModule() {
    const saveBtn = document.getElementById('btn-save-settings');
    const keyInput = document.getElementById('settings-api-key');
    const toggleBtn = document.getElementById('btn-toggle-key');
    const modelSelect = document.getElementById('settings-model');
    
    if (toggleBtn && keyInput) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = keyInput.type === 'password';
            keyInput.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const apiKey = keyInput.value.trim();
            if (!apiKey) {
                showToast("Please enter an API Key", "error");
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';
            
            try {
                const response = await fetch('/api/settings/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ api_key: apiKey })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast("API Key verified and saved!", "success");
                    state.apiConfigured = true;
                    updateApiStatusUI(true);
                    keyInput.value = ''; // clear input for security
                    
                    // Update current model badge dynamically if selected model changed
                    const modelName = modelSelect.value;
                    const modelDisplayMap = {
                        'gemini-2.5-flash': 'Gemini 2.5 Flash',
                        'gemini-2.5-pro': 'Gemini 2.5 Pro',
                        'gemini-2.0-flash': 'Gemini 2.0 Flash'
                    };
                    document.querySelector('#current-model-badge span').textContent = modelDisplayMap[modelName];
                    
                    setTimeout(() => switchTab('dashboard'), 1000);
                } else {
                    showToast(data.error || "Verification failed.", "error");
                }
            } catch (err) {
                showToast("Failed to connect to the server.", "error");
                console.error(err);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Verify & Save Key';
            }
        });
    }
}

// --------------------------------------------------
// Module 2: Chat & Q&A Assistant
// --------------------------------------------------
function initChatModule() {
    const sendBtn = document.getElementById('btn-send-chat');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const suggestedBtns = document.querySelectorAll('.suggested-btn');
    
    // Image attachment elements
    const attachBtn = document.getElementById('btn-attach-image');
    const imageInput = document.getElementById('chat-image-input');
    const previewContainer = document.getElementById('chat-image-preview');
    const previewImg = document.getElementById('chat-preview-img');
    const removePreviewBtn = document.getElementById('btn-remove-preview');
    
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitChatMessage();
            }
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', submitChatMessage);
    }
    
    if (suggestedBtns) {
        suggestedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                if (prompt) {
                    chatInput.value = prompt;
                    submitChatMessage();
                }
            });
        });
    }
    
    // Image Attachment event handlers
    if (attachBtn && imageInput) {
        attachBtn.addEventListener('click', () => {
            imageInput.click();
        });
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', () => {
            if (imageInput.files && imageInput.files[0]) {
                const file = imageInput.files[0];
                if (!file.type.startsWith('image/')) {
                    showToast("Please upload an image file (PNG/JPEG/WebP)", "error");
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Data = e.target.result.split(',')[1];
                    state.chatAttachment = {
                        base64: base64Data,
                        mime: file.type,
                        fullDataUrl: e.target.result
                    };
                    
                    if (previewImg && previewContainer) {
                        previewImg.src = e.target.result;
                        previewContainer.style.display = 'flex';
                    }
                    showToast("Image attached successfully!", "success");
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', () => {
            clearChatAttachment();
        });
    }
}

function clearChatAttachment() {
    state.chatAttachment = { base64: null, mime: null, fullDataUrl: null };
    const previewContainer = document.getElementById('chat-image-preview');
    const imageInput = document.getElementById('chat-image-input');
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    if (imageInput) {
        imageInput.value = '';
    }
}

async function submitChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    
    if (!chatInput) return;
    
    const messageText = chatInput.value.trim();
    if (!messageText) return;
    
    if (!state.apiConfigured) {
        showToast("Gemini API key is required. Go to settings.", "warning");
        switchTab('settings');
        return;
    }
    
    // Capture attachment details before clearing
    const attachment = { ...state.chatAttachment };
    clearChatAttachment(); // clear UI immediately
    
    // 1. Add User Message bubble
    appendChatMessage(messageText, 'user', attachment.fullDataUrl);
    chatInput.value = '';
    
    // 2. Append Typing Indicator
    const typingId = appendTypingIndicator();
    scrollToBottom(messagesContainer);
    
    // 3. Make API request
    try {
        const modelSelect = document.getElementById('settings-model');
        const modelName = modelSelect ? modelSelect.value : "gemini-2.5-flash";
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: messageText,
                history: state.chatHistory,
                model: modelName,
                image_data: attachment.base64 || null,
                image_mime: attachment.mime || null
            })
        });
        
        const data = await response.json();
        
        // Remove typing bubble
        removeElement(typingId);
        
        if (data.success) {
            // Append assistant reply bubble
            appendChatMessage(data.reply, 'assistant');
            
            // Push to local chat history state
            state.chatHistory.push({ role: 'user', text: messageText });
            state.chatHistory.push({ role: 'model', text: data.reply });
        } else {
            appendChatMessage(`⚠️ **Error:** ${data.error || "Failed to generate response."}`, 'assistant');
        }
    } catch (err) {
        removeElement(typingId);
        appendChatMessage(`⚠️ **Error:** Failed to connect to server.`, 'assistant');
        console.error(err);
    }
    
    scrollToBottom(messagesContainer);
}

function appendChatMessage(text, role, imageUrl = null) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    const bubble = document.createElement('div');
    bubble.className = `message ${role}`;
    
    // Render markdown content using marked.js
    let parsedContent = text;
    if (window.marked) {
        parsedContent = window.marked.parse(text);
    }
    
    let imgHtml = '';
    if (imageUrl) {
        imgHtml = `<img src="${imageUrl}" class="chat-message-image" alt="Attached Image" onclick="window.open('${imageUrl}')">`;
    }
    
    bubble.innerHTML = `
        <div class="message-content markdown-body">
            ${imgHtml}
            ${parsedContent}
        </div>
    `;
    
    container.appendChild(bubble);
    
    // Trigger KaTeX math rendering dynamically inside this bubble
    if (window.renderMathInElement) {
        try {
            window.renderMathInElement(bubble, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        } catch (e) {
            console.error("KaTeX failed to render math:", e);
        }
    }
    
    // Trigger syntax highlighting with Prism
    if (window.Prism) {
        window.Prism.highlightAllUnder(bubble);
    }
}

function appendTypingIndicator() {
    const container = document.getElementById('chat-messages');
    if (!container) return null;
    
    const id = 'typing-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'message assistant';
    bubble.id = id;
    bubble.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    container.appendChild(bubble);
    return id;
}

function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}

// --------------------------------------------------
// Module 3: Smart Summarizer
// --------------------------------------------------
function initSummarizerModule() {
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-upload-input');
    const fileInfo = document.getElementById('file-info-text');
    const summarizeBtn = document.getElementById('btn-summarize');
    const textInput = document.getElementById('summarize-text-input');
    const formatSelect = document.getElementById('summarize-format');
    const styleSelect = document.getElementById('summarize-style');
    const outputContainer = document.getElementById('summarizer-output');
    
    const copyBtn = document.getElementById('btn-copy-summary');
    const downloadBtn = document.getElementById('btn-download-summary');
    
    // Drag-and-drop triggers
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                uploadAndParseFile(files[0], textInput, fileInfo);
            }
        });
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                uploadAndParseFile(fileInput.files[0], textInput, fileInfo);
            }
        });
    }
    
    // Summarize triggering
    if (summarizeBtn) {
        summarizeBtn.addEventListener('click', async () => {
            const rawText = textInput.value.trim();
            if (!rawText) {
                showToast("Please paste text or load a file first.", "warning");
                return;
            }
            
            if (!state.apiConfigured) {
                showToast("Gemini API key is required. Go to settings.", "warning");
                switchTab('settings');
                return;
            }
            
            summarizeBtn.disabled = true;
            summarizeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Synthesizing Summary...';
            outputContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-wand-magic-sparkles fa-spin" style="color: var(--accent-primary-hover);"></i>
                    <p>HSA AI Academy Assistant is studying your documents. Please wait...</p>
                </div>
            `;
            
            try {
                const modelSelect = document.getElementById('settings-model');
                const modelName = modelSelect ? modelSelect.value : "gemini-2.5-flash";
                
                const response = await fetch('/api/summarize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: rawText,
                        format: formatSelect.value,
                        style: styleSelect.value,
                        model: modelName
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    let html = data.summary;
                    if (window.marked) {
                        html = window.marked.parse(data.summary);
                    }
                    outputContainer.innerHTML = html;
                    
                    // Render Math equations with KaTeX if present
                    if (window.renderMathInElement) {
                        try {
                            window.renderMathInElement(outputContainer, {
                                delimiters: [
                                    {left: '$$', right: '$$', display: true},
                                    {left: '$', right: '$', display: false},
                                    {left: '\\(', right: '\\)', display: false},
                                    {left: '\\[', right: '\\]', display: true}
                                ],
                                throwOnError: false
                            });
                        } catch (e) {}
                    }
                    
                    if (window.Prism) {
                        window.Prism.highlightAllUnder(outputContainer);
                    }
                    showToast("Summary generated!", "success");
                } else {
                    outputContainer.innerHTML = `<p class="text-danger">⚠️ <strong>Error:</strong> ${data.error || "Failed to summarize text"}</p>`;
                }
            } catch (err) {
                outputContainer.innerHTML = `<p class="text-danger">⚠️ <strong>Error:</strong> Failed to connect to server.</p>`;
                console.error(err);
            } finally {
                summarizeBtn.disabled = false;
                summarizeBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Summary';
            }
        });
    }
    
    // Copy summary action
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const rawOutput = outputContainer.innerText;
            if (!rawOutput || outputContainer.querySelector('.empty-state')) {
                showToast("No summary available to copy.", "warning");
                return;
            }
            
            navigator.clipboard.writeText(rawOutput)
                .then(() => showToast("Summary copied to clipboard!", "success"))
                .catch(() => showToast("Failed to copy.", "error"));
        });
    }
    
    // Download summary action
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const rawOutput = outputContainer.innerText;
            if (!rawOutput || outputContainer.querySelector('.empty-state')) {
                showToast("No summary available to download.", "warning");
                return;
            }
            
            const blob = new Blob([rawOutput], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HSA_AI_Academy_Summary_${new Date().toISOString().slice(0,10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("Download started!", "success");
        });
    }
}

// --------------------------------------------------
// Module 4: MCQ Quiz Generator
// --------------------------------------------------
function initQuizModule() {
    const generateBtn = document.getElementById('btn-generate-quiz');
    const topicInput = document.getElementById('quiz-topic');
    const countSelect = document.getElementById('quiz-count');
    const difficultySelect = document.getElementById('quiz-difficulty');
    
    const playScreen = document.getElementById('quiz-play-screen');
    const emptyState = document.getElementById('quiz-empty-state');
    const resultsScreen = document.getElementById('quiz-results-screen');
    
    const nextBtn = document.getElementById('btn-quiz-next');
    const restartBtn = document.getElementById('btn-quiz-restart');
    const newQuizBtn = document.getElementById('btn-quiz-new');

    // Universal file upload for Quiz
    const quizDropZone = document.getElementById('quiz-file-drop-zone');
    const quizFileInput = document.getElementById('quiz-file-input');
    const quizFileInfo = document.getElementById('quiz-file-info');
    if (quizDropZone && quizFileInput) {
        quizDropZone.addEventListener('click', () => quizFileInput.click());
        quizDropZone.addEventListener('dragover', (e) => { e.preventDefault(); quizDropZone.classList.add('dragover'); });
        quizDropZone.addEventListener('dragleave', () => quizDropZone.classList.remove('dragover'));
        quizDropZone.addEventListener('drop', (e) => {
            e.preventDefault(); quizDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) uploadAndParseFile(e.dataTransfer.files[0], topicInput, quizFileInfo);
        });
        quizFileInput.addEventListener('change', () => {
            if (quizFileInput.files.length > 0) uploadAndParseFile(quizFileInput.files[0], topicInput, quizFileInfo);
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const topic = topicInput.value.trim();
            if (!topic) {
                showToast("Please enter a topic or paste a reference text.", "warning");
                return;
            }
            
            if (!state.apiConfigured) {
                showToast("Gemini API key is required. Go to settings.", "warning");
                switchTab('settings');
                return;
            }
            
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Formulating Questions...';
            
            // Show studying screen in play container
            emptyState.style.display = 'none';
            resultsScreen.style.display = 'none';
            playScreen.style.display = 'flex';
            playScreen.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-brain fa-spin" style="color: var(--accent-primary-hover);"></i>
                    <p>Structuring multiple choice questions with explanations. Please wait...</p>
                </div>
            `;
            
            try {
                const modelSelect = document.getElementById('settings-model');
                const modelName = modelSelect ? modelSelect.value : "gemini-2.5-flash";
                
                const response = await fetch('/api/quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: topic,
                        num_questions: parseInt(countSelect.value),
                        difficulty: difficultySelect.value,
                        model: modelName
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.quiz && data.quiz.questions) {
                    // Restore play screen layout skeleton
                    restoreQuizPlayHTML();
                    
                    // Setup internal quiz state
                    state.quiz.title = data.quiz.title || "Interactive Assessment";
                    state.quiz.questions = data.quiz.questions;
                    state.quiz.currentIndex = 0;
                    state.quiz.score = 0;
                    state.quiz.answered = false;
                    
                    showQuizQuestion(0);
                    showToast("Quiz ready! Good luck!", "success");
                } else {
                    restoreQuizEmptyHTML("⚠️ Failed to generate quiz. Try adjusting your input.");
                }
            } catch (err) {
                restoreQuizEmptyHTML("⚠️ Connection lost. Could not load the quiz.");
                console.error(err);
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fa-solid fa-brain"></i> Generate MCQ Quiz';
            }
        });
    }
    
    function restoreQuizPlayHTML() {
        playScreen.innerHTML = `
            <div class="quiz-header">
                <h4 id="quiz-title-display">Interactive Quiz</h4>
                <span class="quiz-progress-badge" id="quiz-progress">Question 1 of 5</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" id="quiz-progress-bar" style="width: 20%;"></div>
            </div>

            <div class="quiz-question-container">
                <h3 class="quiz-question" id="quiz-question-text">Loading...</h3>
                <div class="quiz-options-list" id="quiz-options-container"></div>

                <div class="quiz-feedback-box" id="quiz-feedback" style="display: none;">
                    <div class="feedback-icon"><i class="fa-solid fa-circle-info"></i></div>
                    <div class="feedback-content">
                        <h5>Tutor Explanation:</h5>
                        <p id="quiz-explanation-text"></p>
                    </div>
                </div>
            </div>

            <div class="quiz-footer-nav">
                <span id="quiz-score-instant">Score: 0 / 0</span>
                <button class="btn btn-primary" id="btn-quiz-next" disabled>
                    Next Question <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        // Re-bind dynamically generated next button
        document.getElementById('btn-quiz-next').addEventListener('click', handleQuizNextQuestion);
    }
    
    function restoreQuizEmptyHTML(msg) {
        playScreen.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyState.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>${msg}</p>
        `;
    }
    
    function showQuizQuestion(index) {
        const questionData = state.quiz.questions[index];
        state.quiz.answered = false;
        
        // Title & Progress Bar
        document.getElementById('quiz-title-display').textContent = state.quiz.title;
        document.getElementById('quiz-progress').textContent = `Question ${index + 1} of ${state.quiz.questions.length}`;
        
        const pct = ((index + 1) / state.quiz.questions.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${pct}%`;
        
        // Question Text
        document.getElementById('quiz-question-text').textContent = questionData.question;
        
        // Options List
        const optionsContainer = document.getElementById('quiz-options-container');
        optionsContainer.innerHTML = '';
        
        const optionBadges = ['A', 'B', 'C', 'D'];
        questionData.options.forEach((opt, idx) => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.innerHTML = `
                <div class="option-badge">${optionBadges[idx]}</div>
                <div class="option-text">${opt}</div>
            `;
            
            card.addEventListener('click', () => selectQuizOption(idx, card));
            optionsContainer.appendChild(card);
        });
        
        // Reset Feedback Box
        document.getElementById('quiz-feedback').style.display = 'none';
        
        // Disable next button until answered
        const nextBtnEl = document.getElementById('btn-quiz-next');
        nextBtnEl.disabled = true;
        
        // Instant score counter
        document.getElementById('quiz-score-instant').textContent = `Score: ${state.quiz.score} / ${index}`;
    }
    
    function selectQuizOption(selectedIndex, cardElement) {
        if (state.quiz.answered) return; // ignore double click
        state.quiz.answered = true;
        
        const questionData = state.quiz.questions[state.quiz.currentIndex];
        const correctIndex = questionData.correct_answer;
        const optionsContainer = document.getElementById('quiz-options-container');
        const cards = optionsContainer.querySelectorAll('.option-card');
        
        // Check correctness
        if (selectedIndex === correctIndex) {
            cardElement.classList.add('correct');
            state.quiz.score++;
            showToast("Correct! Excellent job.", "success");
        } else {
            cardElement.classList.add('wrong');
            cards[correctIndex].classList.add('correct');
            showToast("Oops, incorrect.", "error");
        }
        
        // Populate tutor explanation
        const feedbackBox = document.getElementById('quiz-feedback');
        const explanationText = document.getElementById('quiz-explanation-text');
        explanationText.textContent = questionData.explanation || "No explanation provided.";
        
        // Render Math equations with KaTeX if present
        if (window.renderMathInElement) {
            try {
                window.renderMathInElement(explanationText, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            } catch (e) {}
        }
        
        feedbackBox.style.display = 'flex';
        
        // Enable Next Button
        const nextBtnEl = document.getElementById('btn-quiz-next');
        nextBtnEl.disabled = false;
        
        if (state.quiz.currentIndex === state.quiz.questions.length - 1) {
            nextBtnEl.innerHTML = 'Finish Assessment <i class="fa-solid fa-flag-checkered"></i>';
        }
        
        // Update Instant Score counter
        document.getElementById('quiz-score-instant').textContent = `Score: ${state.quiz.score} / ${state.quiz.currentIndex + 1}`;
    }
    
    function handleQuizNextQuestion() {
        if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
            state.quiz.currentIndex++;
            showQuizQuestion(state.quiz.currentIndex);
        } else {
            // End of Quiz - render results screen
            playScreen.style.display = 'none';
            resultsScreen.style.display = 'block';
            
            const scoreNum = document.getElementById('quiz-results-score');
            const scorePct = document.getElementById('quiz-results-pct');
            const subtitle = document.getElementById('quiz-results-subtitle');
            
            const finalScore = state.quiz.score;
            const total = state.quiz.questions.length;
            const finalPct = Math.round((finalScore / total) * 100);
            
            scoreNum.textContent = `${finalScore} / ${total}`;
            scorePct.textContent = `${finalPct}% Correct`;
            
            if (finalPct >= 80) {
                subtitle.textContent = "🏆 Masterful performance! You have fully internalised this subject.";
            } else if (finalPct >= 50) {
                subtitle.textContent = "💡 Good attempt! A little more revision and you will be top of class.";
            } else {
                subtitle.textContent = "📚 Recommended to re-study this unit. Practice makes perfect!";
            }
            
            // Log to Dynamic Tutor Analytics
            if (typeof logQuizToAnalytics === 'function') {
                logQuizToAnalytics(state.quiz.title || "Subject Quiz", finalPct, total);
            }
        }
    }
    
    // Bind Restart
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            resultsScreen.style.display = 'none';
            playScreen.style.display = 'flex';
            restoreQuizPlayHTML();
            
            state.quiz.currentIndex = 0;
            state.quiz.score = 0;
            state.quiz.answered = false;
            
            showQuizQuestion(0);
        });
    }
    
    // Bind New Quiz Topic
    if (newQuizBtn) {
        newQuizBtn.addEventListener('click', () => {
            resultsScreen.style.display = 'none';
            emptyState.style.display = 'flex';
            topicInput.value = '';
            topicInput.focus();
        });
    }
}

// --------------------------------------------------
// Module 5: Flashcard Maker
// --------------------------------------------------
function initFlashcardModule() {
    const generateBtn = document.getElementById('btn-generate-flashcards');
    const topicInput = document.getElementById('flashcard-topic');
    const countSelect = document.getElementById('flashcard-count');
    
    const playScreen = document.getElementById('flashcard-play-screen');
    const emptyState = document.getElementById('flashcard-empty-state');
    const summaryScreen = document.getElementById('deck-summary-screen');
    
    const prevBtn = document.getElementById('btn-card-prev');
    const nextBtn = document.getElementById('btn-card-next');
    const cardEl = document.getElementById('interactive-flashcard');
    
    const correctBtn = document.getElementById('btn-card-correct');
    const wrongBtn = document.getElementById('btn-card-wrong');
    
    const restartBtn = document.getElementById('btn-deck-restart');
    const newDeckBtn = document.getElementById('btn-deck-new');

    // Universal file upload for Flashcards
    const fcDropZone = document.getElementById('flashcard-file-drop-zone');
    const fcFileInput = document.getElementById('flashcard-file-input');
    const fcFileInfo = document.getElementById('flashcard-file-info');
    if (fcDropZone && fcFileInput) {
        fcDropZone.addEventListener('click', () => fcFileInput.click());
        fcDropZone.addEventListener('dragover', (e) => { e.preventDefault(); fcDropZone.classList.add('dragover'); });
        fcDropZone.addEventListener('dragleave', () => fcDropZone.classList.remove('dragover'));
        fcDropZone.addEventListener('drop', (e) => {
            e.preventDefault(); fcDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) uploadAndParseFile(e.dataTransfer.files[0], topicInput, fcFileInfo);
        });
        fcFileInput.addEventListener('change', () => {
            if (fcFileInput.files.length > 0) uploadAndParseFile(fcFileInput.files[0], topicInput, fcFileInfo);
        });
    }
    
    // Setup interactive Card Flipping
    if (cardEl) {
        cardEl.addEventListener('click', () => {
            cardEl.classList.toggle('flipped');
            state.deck.isFlipped = cardEl.classList.contains('flipped');
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const topic = topicInput.value.trim();
            if (!topic) {
                showToast("Please enter study material or deck terms topic.", "warning");
                return;
            }
            
            if (!state.apiConfigured) {
                showToast("Gemini API key is required. Go to settings.", "warning");
                switchTab('settings');
                return;
            }
            
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Writing Study Cards...';
            
            emptyState.style.display = 'none';
            summaryScreen.style.display = 'none';
            playScreen.style.display = 'block';
            playScreen.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-layer-group fa-spin" style="color: var(--accent-primary-hover);"></i>
                    <p>Synthesizing flashcard terms & spaced recall items. Please wait...</p>
                </div>
            `;
            
            try {
                const modelSelect = document.getElementById('settings-model');
                const modelName = modelSelect ? modelSelect.value : "gemini-2.5-flash";
                
                const response = await fetch('/api/flashcard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: topic,
                        num_cards: parseInt(countSelect.value),
                        model: modelName
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.deck && data.deck.cards) {
                    // Restore playing DOM layout
                    restoreFlashcardHTML();
                    
                    state.deck.name = data.deck.deck_name || "Study Deck";
                    state.deck.cards = data.deck.cards;
                    state.deck.currentIndex = 0;
                    state.deck.scores = Array(data.deck.cards.length).fill(null);
                    state.deck.isFlipped = false;
                    
                    showFlashcard(0);
                    showToast("Flashcards synthesized!", "success");
                } else {
                    restoreFlashcardEmptyHTML("⚠️ Failed to generate cards. Try shorter topic keywords.");
                }
            } catch (err) {
                restoreFlashcardEmptyHTML("⚠️ Connection lost. Could not compile deck.");
                console.error(err);
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fa-solid fa-rectangle-list"></i> Create Flashcard Deck';
            }
        });
    }
    
    function restoreFlashcardHTML() {
        playScreen.innerHTML = `
            <div class="deck-header">
                <h4 id="deck-title-display">Biology Flashcards</h4>
                <span class="card-progress-badge" id="card-progress">Card 1 of 10</span>
            </div>

            <div class="flashcard-container" id="interactive-flashcard">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <span class="card-hint-text">FRONT (CLICK TO FLIP)</span>
                        <div class="card-text-container">
                            <h3 id="card-front-content"></h3>
                        </div>
                        <div class="card-footer-tip"><i class="fa-solid fa-arrows-spin"></i> Click card to reveal explanation</div>
                    </div>
                    <div class="flashcard-back">
                        <span class="card-hint-text">BACK (CLICK TO FLIP)</span>
                        <div class="card-text-container">
                            <h3 id="card-back-content"></h3>
                            <p class="card-context-text" id="card-context-content"></p>
                        </div>
                        <div class="card-footer-tip"><i class="fa-solid fa-arrows-spin"></i> Click card to flip back</div>
                    </div>
                </div>
            </div>

            <div class="deck-scoring-bar">
                <p>Self Evaluation (Did you recall this correctly?):</p>
                <div class="scoring-buttons">
                    <button class="btn btn-danger col-5" id="btn-card-wrong">
                        <i class="fa-solid fa-times-circle"></i> Needs Review
                    </button>
                    <button class="btn btn-success col-5" id="btn-card-correct">
                        <i class="fa-solid fa-check-circle"></i> Got It!
                    </button>
                </div>
            </div>

            <div class="deck-footer-nav">
                <button class="btn-action" id="btn-card-prev"><i class="fa-solid fa-chevron-left"></i> Previous</button>
                <span id="deck-score-counter">Recall: 0/0</span>
                <button class="btn-action" id="btn-card-next">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        `;
        
        // Re-bind all dynamic elements inside the playScreen
        const activeCard = document.getElementById('interactive-flashcard');
        activeCard.addEventListener('click', () => {
            activeCard.classList.toggle('flipped');
            state.deck.isFlipped = activeCard.classList.contains('flipped');
        });
        
        document.getElementById('btn-card-prev').addEventListener('click', handleCardPrev);
        document.getElementById('btn-card-next').addEventListener('click', handleCardNext);
        document.getElementById('btn-card-correct').addEventListener('click', () => handleCardScore('correct'));
        document.getElementById('btn-card-wrong').addEventListener('click', () => handleCardScore('wrong'));
    }
    
    function restoreFlashcardEmptyHTML(msg) {
        playScreen.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyState.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>${msg}</p>
        `;
    }
    
    function showFlashcard(index) {
        const cardData = state.deck.cards[index];
        state.deck.isFlipped = false;
        
        // Ensure card element is unflipped (front showing)
        const el = document.getElementById('interactive-flashcard');
        if (el) el.classList.remove('flipped');
        
        // Delay content load slightly to cover flip reset animation
        setTimeout(() => {
            document.getElementById('deck-title-display').textContent = state.deck.name;
            document.getElementById('card-progress').textContent = `Card ${index + 1} of ${state.deck.cards.length}`;
            document.getElementById('card-front-content').textContent = cardData.front;
            document.getElementById('card-back-content').textContent = cardData.back;
            
            const contextEl = document.getElementById('card-context-content');
            if (cardData.context) {
                contextEl.style.display = 'block';
                contextEl.textContent = `💡 Hint: ${cardData.context}`;
            } else {
                contextEl.style.display = 'none';
            }
            
            // Highlights scoring buttons if already evaluated
            const activeScore = state.deck.scores[index];
            const correctBtnEl = document.getElementById('btn-card-correct');
            const wrongBtnEl = document.getElementById('btn-card-wrong');
            
            correctBtnEl.className = activeScore === 'correct' ? 'btn btn-success col-5' : 'btn btn-secondary col-5';
            wrongBtnEl.className = activeScore === 'wrong' ? 'btn btn-danger col-5' : 'btn btn-secondary col-5';
            
            // Score counter
            const completed = state.deck.scores.filter(s => s !== null).length;
            const correct = state.deck.scores.filter(s => s === 'correct').length;
            document.getElementById('deck-score-counter').textContent = `Recall: ${correct}/${completed} (${completed > 0 ? Math.round((correct/completed)*100) : 0}%)`;
            
            // Navigation button disabled state
            document.getElementById('btn-card-prev').disabled = index === 0;
        }, 150);
    }
    
    function handleCardScore(scoreType) {
        const currentIdx = state.deck.currentIndex;
        state.deck.scores[currentIdx] = scoreType;
        
        // Highlight active button
        const correctBtnEl = document.getElementById('btn-card-correct');
        const wrongBtnEl = document.getElementById('btn-card-wrong');
        correctBtnEl.className = scoreType === 'correct' ? 'btn btn-success col-5' : 'btn btn-secondary col-5';
        wrongBtnEl.className = scoreType === 'wrong' ? 'btn btn-danger col-5' : 'btn btn-secondary col-5';
        
        showToast(scoreType === 'correct' ? "Marked as memorized!" : "Marked for review.", scoreType === 'correct' ? 'success' : 'warning');
        
        // Advance to next card automatically after a brief delay
        setTimeout(() => {
            if (currentIdx < state.deck.cards.length - 1) {
                handleCardNext();
            } else {
                // Deck completed - show results
                finishDeckReview();
            }
        }, 800);
    }
    
    function handleCardPrev() {
        if (state.deck.currentIndex > 0) {
            state.deck.currentIndex--;
            showFlashcard(state.deck.currentIndex);
        }
    }
    
    function handleCardNext() {
        if (state.deck.currentIndex < state.deck.cards.length - 1) {
            state.deck.currentIndex++;
            showFlashcard(state.deck.currentIndex);
        } else {
            finishDeckReview();
        }
    }
    
    function finishDeckReview() {
        playScreen.style.display = 'none';
        summaryScreen.style.display = 'block';
        
        const completed = state.deck.scores.filter(s => s !== null).length;
        const correct = state.deck.scores.filter(s => s === 'correct').length;
        const pct = completed > 0 ? Math.round((correct/completed)*100) : 0;
        
        document.getElementById('deck-results-score').textContent = `${correct} / ${state.deck.cards.length}`;
        document.getElementById('deck-results-pct').textContent = `${pct}% Correctly Recalled`;
        
        // Log to Dynamic Tutor Analytics
        if (typeof logFlashcardToAnalytics === 'function') {
            logFlashcardToAnalytics(state.deck.name || "Subject Deck", pct, state.deck.cards.length);
        }
    }
    
    // Bind Restart
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            summaryScreen.style.display = 'none';
            playScreen.style.display = 'block';
            restoreFlashcardHTML();
            
            state.deck.currentIndex = 0;
            state.deck.scores = Array(state.deck.cards.length).fill(null);
            showFlashcard(0);
        });
    }
    
    // Bind New Deck
    if (newDeckBtn) {
        newDeckBtn.addEventListener('click', () => {
            summaryScreen.style.display = 'none';
            emptyState.style.display = 'flex';
            topicInput.value = '';
            topicInput.focus();
        });
    }
}

// --------------------------------------------------
// Module 6: Adaptive Study Planner
// --------------------------------------------------
function initPlannerModule() {
    const generateBtn = document.getElementById('btn-generate-planner');
    const topicInput = document.getElementById('planner-topic');
    const timeframeSelect = document.getElementById('planner-timeframe');
    const hoursSelect = document.getElementById('planner-hours');
    const levelSelect = document.getElementById('planner-level');
    
    const displayScreen = document.getElementById('planner-display-screen');
    const emptyState = document.getElementById('planner-empty-state');
    const downloadBtn = document.getElementById('btn-download-plan');

    // Universal file upload for Planner
    const plannerDropZone = document.getElementById('planner-file-drop-zone');
    const plannerFileInput = document.getElementById('planner-file-input');
    const plannerFileInfo = document.getElementById('planner-file-info');
    if (plannerDropZone && plannerFileInput) {
        plannerDropZone.addEventListener('click', () => plannerFileInput.click());
        plannerDropZone.addEventListener('dragover', (e) => { e.preventDefault(); plannerDropZone.classList.add('dragover'); });
        plannerDropZone.addEventListener('dragleave', () => plannerDropZone.classList.remove('dragover'));
        plannerDropZone.addEventListener('drop', (e) => {
            e.preventDefault(); plannerDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) uploadAndParseFile(e.dataTransfer.files[0], topicInput, plannerFileInfo, true);
        });
        plannerFileInput.addEventListener('change', () => {
            if (plannerFileInput.files.length > 0) uploadAndParseFile(plannerFileInput.files[0], topicInput, plannerFileInfo, true);
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const topic = topicInput.value.trim();
            if (!topic) {
                showToast("Please enter a subject or goal to build a plan.", "warning");
                return;
            }
            
            if (!state.apiConfigured) {
                showToast("Gemini API key is required. Go to settings.", "warning");
                switchTab('settings');
                return;
            }
            
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Structuring Roadmap...';
            
            emptyState.style.display = 'none';
            displayScreen.style.display = 'block';
            displayScreen.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-route fa-spin" style="color: var(--accent-primary-hover);"></i>
                    <p>Calculating study timelines, task allocations, and custom resources. Please wait...</p>
                </div>
            `;
            
            try {
                const modelSelect = document.getElementById('settings-model');
                const modelName = modelSelect ? modelSelect.value : "gemini-2.5-flash";
                
                const response = await fetch('/api/study-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: topic,
                        timeframe: timeframeSelect.value,
                        hours_per_day: parseInt(hoursSelect.value),
                        level: levelSelect.value,
                        model: modelName
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.plan) {
                    state.studyPlan = data.plan;
                    state.activeWeek = 1;
                    
                    restorePlannerHTML();
                    renderPlannerPlan();
                    showToast("Study roadmap created!", "success");
                } else {
                    restorePlannerEmptyHTML("⚠️ Failed to construct roadmap. Try keeping input keywords brief.");
                }
            } catch (err) {
                restorePlannerEmptyHTML("⚠️ Connection lost. Could not connect to schedule planner.");
                console.error(err);
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fa-solid fa-calendar-alt"></i> Construct Study Plan';
            }
        });
    }
    
    function restorePlannerHTML() {
        displayScreen.innerHTML = `
            <div class="plan-header">
                <div>
                    <h3 id="plan-title-display">Study Plan</h3>
                    <p class="plan-summary-text" id="plan-summary-display"></p>
                </div>
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div class="progress-bar-container" style="width: 150px; margin-bottom: 0; height: 10px;">
                        <div class="progress-bar-fill" id="planner-progress-bar" style="width: 0%;"></div>
                    </div>
                    <span id="planner-progress-text" style="font-size: 0.8rem; font-weight: 700; color: var(--accent-secondary);">0% Done</span>
                    <button class="btn-action" id="btn-download-plan" title="Download Planner"><i class="fa-solid fa-download"></i></button>
                </div>
            </div>

            <div class="plan-workspace-container">
                <div class="plan-weeks-sidebar" id="plan-weeks-container"></div>
                <div class="plan-days-timeline" id="plan-days-container"></div>
            </div>
        `;
        
        // Re-bind download button trigger
        document.getElementById('btn-download-plan').addEventListener('click', handleDownloadStudyPlan);
    }
    
    function restorePlannerEmptyHTML(msg) {
        displayScreen.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyState.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>${msg}</p>
        `;
    }
    
    function renderPlannerPlan() {
        const plan = state.studyPlan;
        
        document.getElementById('plan-title-display').textContent = plan.plan_title;
        document.getElementById('plan-summary-display').textContent = plan.summary;
        
        // Render Weeks Sidebar tabs
        const weeksContainer = document.getElementById('plan-weeks-container');
        weeksContainer.innerHTML = '';
        
        plan.weeks.forEach(week => {
            const btn = document.createElement('button');
            btn.className = `week-tab ${week.week_number === state.activeWeek ? 'active' : ''}`;
            btn.textContent = `Week ${week.week_number}`;
            btn.addEventListener('click', () => {
                state.activeWeek = week.week_number;
                // Update active tab class
                weeksContainer.querySelectorAll('.week-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                
                renderActiveWeekDays();
            });
            weeksContainer.appendChild(btn);
        });
        
        renderActiveWeekDays();
        updatePlannerProgress();
    }
    
    function renderActiveWeekDays() {
        const daysContainer = document.getElementById('plan-days-container');
        daysContainer.innerHTML = '';
        
        const activeWeekData = state.studyPlan.weeks.find(w => w.week_number === state.activeWeek);
        if (!activeWeekData) return;
        
        // Draw the week focus header
        const focusCard = document.createElement('div');
        focusCard.className = 'glass-panel';
        focusCard.style.padding = '12px 18px';
        focusCard.style.marginBottom = '14px';
        focusCard.innerHTML = `<p style="font-size: 0.88rem; margin: 0; color: var(--text-secondary);">🎯 <strong>Week Focus:</strong> ${activeWeekData.focus || "Master core units"}</p>`;
        daysContainer.appendChild(focusCard);
        
        activeWeekData.days.forEach(day => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-plan-card';
            
            // Checklist generator
            let tasksHTML = '';
            day.tasks.forEach((task, tIdx) => {
                const taskId = `task-${state.activeWeek}-${day.day_name}-${tIdx}`;
                const checkedAttr = state.studyPlan.completedTasks && state.studyPlan.completedTasks.includes(taskId) ? 'checked' : '';
                
                const priorityClass = `priority-${(task.priority || 'medium').toLowerCase()}`;
                
                tasksHTML += `
                    <div class="task-item">
                        <input type="checkbox" class="task-checkbox" id="${taskId}" data-id="${taskId}" ${checkedAttr}>
                        <label for="${taskId}">
                            <span>${task.description}</span>
                            <span class="task-duration"><i class="fa-regular fa-clock"></i> ${task.duration_mins}m</span>
                            <span class="task-priority ${priorityClass}">${task.priority || 'Medium'}</span>
                        </label>
                    </div>
                `;
            });
            
            // Resources layout
            let resourcesHTML = '';
            if (day.resources && day.resources.length > 0) {
                resourcesHTML = `
                    <div class="day-resources">
                        <i class="fa-solid fa-book-open-reader"></i> Suggested Materials: 
                        <span style="color: var(--text-secondary); font-style: italic;">${day.resources.join(', ')}</span>
                    </div>
                `;
            }
            
            dayCard.innerHTML = `
                <div class="day-header">
                    <span class="day-title">📆 ${day.day_name}</span>
                    <span class="day-focus">${day.focus || "Practical revision"}</span>
                </div>
                <div class="day-tasks-list">
                    ${tasksHTML}
                </div>
                ${resourcesHTML}
            `;
            
            daysContainer.appendChild(dayCard);
        });
        
        // Bind task checkboxes event listeners
        daysContainer.querySelectorAll('.task-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                if (!state.studyPlan.completedTasks) {
                    state.studyPlan.completedTasks = [];
                }
                
                if (e.target.checked) {
                    if (!state.studyPlan.completedTasks.includes(id)) {
                        state.studyPlan.completedTasks.push(id);
                    }
                    showToast("Task completed! Keep it up.", "success");
                } else {
                    state.studyPlan.completedTasks = state.studyPlan.completedTasks.filter(item => item !== id);
                }
                
                updatePlannerProgress();
            });
        });
    }
    
    function updatePlannerProgress() {
        const plan = state.studyPlan;
        if (!plan) return;
        
        // Count total tasks in plan
        let totalTasks = 0;
        plan.weeks.forEach(w => {
            w.days.forEach(d => {
                totalTasks += d.tasks.length;
            });
        });
        
        if (totalTasks === 0) return;
        
        const completed = plan.completedTasks ? plan.completedTasks.length : 0;
        const pct = Math.round((completed / totalTasks) * 100);
        
        const barFill = document.getElementById('planner-progress-bar');
        const textEl = document.getElementById('planner-progress-text');
        
        if (barFill) barFill.style.width = `${pct}%`;
        if (textEl) textEl.textContent = `${pct}% Done`;
    }
    
    function handleDownloadStudyPlan() {
        const plan = state.studyPlan;
        if (!plan) {
            showToast("No active study plan to download.", "warning");
            return;
        }
        
        let output = `==================================================\n`;
        output += `📚 HSA AI Academy Custom Study Schedule: ${plan.plan_title}\n`;
        output += `==================================================\n`;
        output += `Summary: ${plan.summary}\n\n`;
        
        plan.weeks.forEach(week => {
            output += `--------------------------------------------------\n`;
            output += `WEEK ${week.week_number} (Focus: ${week.focus})\n`;
            output += `--------------------------------------------------\n`;
            
            week.days.forEach(day => {
                output += `\n* ${day.day_name} (Focus: ${day.focus})\n`;
                day.tasks.forEach(task => {
                    output += `  [ ] ${task.description} (${task.duration_mins} mins) [Priority: ${task.priority}]\n`;
                });
                
                if (day.resources && day.resources.length > 0) {
                    output += `  Suggested Materials: ${day.resources.join(', ')}\n`;
                }
            });
            output += `\n`;
        });
        
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HSA_AI_Academy_Study_Plan_${plan.plan_title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Study plan schedule download started!", "success");
    }
}

// --------------------------------------------------
// Universal File Upload & Parse Utility
// Used by: Summarizer, Quiz, Flashcard, Planner
// --------------------------------------------------
/**
 * Uploads a file to /api/parse-file and populates a target input/textarea.
 * @param {File}        file         - The File object to upload
 * @param {HTMLElement} targetInput  - The textarea/input to populate with extracted text
 * @param {HTMLElement} infoLabel    - The span to show file info/status
 * @param {boolean}     topicOnly    - If true, sets input value to filename (for planner topic field)
 */
async function uploadAndParseFile(file, targetInput, infoLabel, topicOnly = false) {
    if (!file) return;

    // Show loading state
    if (infoLabel) {
        infoLabel.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Extracting from ${file.name}...`;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/parse-file', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            if (targetInput) {
                if (topicOnly) {
                    // For planner: just use filename as a hint, extracted text goes to a hidden note
                    targetInput.value = file.name.replace(/\.[^/.]+$/, ''); // strip extension
                } else {
                    targetInput.value = data.text;
                    // Scroll to bottom of textarea so user can see content
                    targetInput.scrollTop = targetInput.scrollHeight;
                }
            }
            const charCount = data.char_count ? ` · ${data.char_count.toLocaleString()} chars` : '';
            if (infoLabel) {
                infoLabel.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--color-success);"></i> ${data.filename}${charCount}`;
            }
            showToast(`✅ "${data.filename}" extracted successfully!`, "success");
        } else {
            if (infoLabel) {
                infoLabel.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color: var(--color-danger);"></i> ${data.error}`;
            }
            showToast(data.error || "File extraction failed.", "error");
        }
    } catch (err) {
        if (infoLabel) {
            infoLabel.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color: var(--color-danger);"></i> Connection error.`;
        }
        showToast("Failed to connect to the server for file parsing.", "error");
        console.error("uploadAndParseFile error:", err);
    }
}

/* ================================================================
   DYNAMIC TUTOR ANALYTICS SYSTEM
   ================================================================ */

function initAnalyticsModule() {
    // 1. Load historical logs from localStorage
    try {
        const storedQuizzes = localStorage.getItem('hsa_analytics_quizzes');
        const storedCards = localStorage.getItem('hsa_analytics_cards');
        const storedAdvisor = localStorage.getItem('hsa_analytics_advisor_report');
        
        if (storedQuizzes) state.analytics.quizzes = JSON.parse(storedQuizzes);
        if (storedCards) state.analytics.flashcards = JSON.parse(storedCards);
        if (storedAdvisor) state.analytics.advisorReport = storedAdvisor;
    } catch (err) {
        console.error("Error reading analytics history:", err);
    }

    // 2. Bind Advisor Button
    const refreshBtn = document.getElementById('btn-refresh-advisor');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAiAdvisorReport(true);
        });
    }

    // 3. Render loaded Advisor Report
    renderAdvisorReportHTML();
}

function logQuizToAnalytics(topic, score, total) {
    const quizRecord = {
        topic: topic,
        score: score,
        total: total,
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    
    state.analytics.quizzes.push(quizRecord);
    localStorage.setItem('hsa_analytics_quizzes', JSON.stringify(state.analytics.quizzes));
    showToast("Quiz attempt logged in your analytics! 📊", "success");
}

function logFlashcardToAnalytics(deckName, mastery, total) {
    const cardRecord = {
        deckName: deckName,
        mastery: mastery,
        total: total,
        date: new Date().toISOString().split('T')[0]
    };

    state.analytics.flashcards.push(cardRecord);
    localStorage.setItem('hsa_analytics_cards', JSON.stringify(state.analytics.flashcards));
    showToast("Spaced recall progress logged! 📝", "success");
}

function refreshAnalyticsDashboard() {
    // 1. Compute Card Values
    const quizzesTaken = state.analytics.quizzes.length;
    const cardsReviewed = state.analytics.flashcards.reduce((sum, item) => sum + item.total, 0);
    
    let avgQuizScore = 0;
    if (quizzesTaken > 0) {
        const sumScores = state.analytics.quizzes.reduce((sum, item) => sum + item.score, 0);
        avgQuizScore = Math.round(sumScores / quizzesTaken);
    }

    let avgRetentionRate = 0;
    if (state.analytics.flashcards.length > 0) {
        const sumMastery = state.analytics.flashcards.reduce((sum, item) => sum + item.mastery, 0);
        avgRetentionRate = Math.round(sumMastery / state.analytics.flashcards.length);
    }

    // Update Cards DOM elements
    document.getElementById('stats-quizzes-taken').textContent = quizzesTaken;
    document.getElementById('stats-avg-quiz-score').textContent = `${avgQuizScore}%`;
    document.getElementById('stats-cards-reviewed').textContent = cardsReviewed;
    document.getElementById('stats-retention-rate').textContent = `${avgRetentionRate}%`;

    // 2. Render Charts
    renderAccuracyRadarChart();
    renderActivityTrendChart();
    
    // 3. Render Advisor
    renderAdvisorReportHTML();
}

function renderAccuracyRadarChart() {
    const ctx = document.getElementById('accuracy-radar-chart').getContext('2d');
    
    // Destroy existing chart to prevent hover flickering / memory leaks
    if (state.analytics.radarChart) {
        state.analytics.radarChart.destroy();
    }

    // Extract subjects and calculate average score per subject
    const subjectMap = {};
    state.analytics.quizzes.forEach(q => {
        const cleanTopic = q.topic.split('Quiz')[0].trim();
        if (!subjectMap[cleanTopic]) {
            subjectMap[cleanTopic] = [];
        }
        subjectMap[cleanTopic].push(q.score);
    });

    const labels = Object.keys(subjectMap);
    const dataPoints = labels.map(label => {
        const scores = subjectMap[label];
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });

    // Fallback labels if no data exists
    const chartLabels = labels.length > 0 ? labels : ["Mathematics", "Physics", "Chemistry", "Computer Science", "Biology"];
    const chartData = dataPoints.length > 0 ? dataPoints : [0, 0, 0, 0, 0];

    state.analytics.radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Conceptual Accuracy (%)',
                data: chartData,
                backgroundColor: 'rgba(0, 229, 255, 0.2)',
                borderColor: 'rgba(0, 229, 255, 1)',
                pointBackgroundColor: 'rgba(124, 77, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(0, 229, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10 } },
                    ticks: { color: 'rgba(255, 255, 255, 0.5)', backdropColor: 'transparent' },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                legend: { labels: { color: 'rgba(255, 255, 255, 0.7)' } }
            }
        }
    });
}

function renderActivityTrendChart() {
    const ctx = document.getElementById('activity-trend-chart').getContext('2d');

    if (state.analytics.trendChart) {
        state.analytics.trendChart.destroy();
    }

    // Aggregate logs by last 7 days
    const dateMap = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dateMap[dateStr] = { quizzes: 0, reviews: 0 };
    }

    state.analytics.quizzes.forEach(q => {
        if (dateMap[q.date] !== undefined) dateMap[q.date].quizzes++;
    });

    state.analytics.flashcards.forEach(fc => {
        if (dateMap[fc.date] !== undefined) dateMap[fc.date].reviews++;
    });

    const labels = Object.keys(dateMap).map(d => {
        const parts = d.split('-');
        return `${parts[1]}/${parts[2]}`; // MM/DD
    });

    const quizData = Object.values(dateMap).map(v => v.quizzes);
    const reviewData = Object.values(dateMap).map(v => v.reviews);

    state.analytics.trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Quizzes Taken',
                    data: quizData,
                    backgroundColor: 'rgba(124, 77, 255, 0.65)',
                    borderColor: 'rgba(124, 77, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Flashcard Sessions',
                    data: reviewData,
                    backgroundColor: 'rgba(0, 229, 255, 0.65)',
                    borderColor: 'rgba(0, 229, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', stepSize: 1 }
                }
            },
            plugins: {
                legend: { labels: { color: 'rgba(255, 255, 255, 0.7)' } }
            }
        }
    });
}

async function loadAiAdvisorReport(forceUpdate = false) {
    const reportText = document.getElementById('advisor-report-text');
    if (!reportText) return;

    if (!forceUpdate && state.analytics.advisorReport) {
        renderAdvisorReportHTML();
        return;
    }

    reportText.innerHTML = `
        <div class="advisor-empty-state">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <p>HSA Dean is analyzing your quiz logs and memory traces. Compiling advisor report...</p>
        </div>
    `;

    try {
        const modelSelect = document.getElementById('settings-model');
        const modelName = modelSelect ? modelSelect.value : "gemini-2.5-flash";

        const response = await fetch('/api/analytics/advisor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizzes: state.analytics.quizzes,
                flashcards: state.analytics.flashcards,
                model: modelName
            })
        });

        const data = await response.json();

        if (data.success && data.report) {
            state.analytics.advisorReport = data.report;
            localStorage.setItem('hsa_analytics_advisor_report', data.report);
            renderAdvisorReportHTML();
            showToast("Dean's advisor report successfully compiled! 📜", "success");
        } else {
            reportText.innerHTML = `
                <div class="advisor-empty-state">
                    <i class="fa-solid fa-triangle-exclamation" style="color: var(--color-danger);"></i>
                    <p>Failed to generate advisor report: ${data.error || "Unknown server error."}</p>
                </div>
            `;
        }
    } catch (err) {
        reportText.innerHTML = `
            <div class="advisor-empty-state">
                <i class="fa-solid fa-triangle-exclamation" style="color: var(--color-danger);"></i>
                <p>Connection lost. Could not compile Dean's insights.</p>
            </div>
        `;
        console.error("loadAiAdvisorReport error:", err);
    }
}

function renderAdvisorReportHTML() {
    const reportText = document.getElementById('advisor-report-text');
    if (!reportText) return;

    if (state.analytics.advisorReport) {
        if (typeof marked !== 'undefined') {
            reportText.innerHTML = marked.parse(state.analytics.advisorReport);
        } else {
            reportText.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit; color: inherit;">${state.analytics.advisorReport}</pre>`;
        }
    } else {
        reportText.innerHTML = `
            <div class="advisor-empty-state">
                <i class="fa-solid fa-user-tie"></i>
                <p>No advising report compiled yet. Click the button below to generate insights using HSA AI Academy Dean.</p>
            </div>
        `;
    }
}


// --------------------------------------------------
// Module 8: AI Math Solver
// --------------------------------------------------
function initMathSolverModule() {
    const solveBtn = document.getElementById('btn-solve-math');
    const modelSelect = document.getElementById('math-model-select');
    
    const textInput = document.getElementById('math-text-input');
    const tabButtons = document.querySelectorAll('.math-tab-btn');
    const inputPanes = document.querySelectorAll('.math-input-pane');
    
    // Image scan inputs
    const imgDropZone = document.getElementById('math-image-drop-zone');
    const imgInput = document.getElementById('math-image-input');
    const imgPreviewContainer = document.getElementById('math-image-preview-container');
    const imgPreview = document.getElementById('math-image-preview');
    const removeImgBtn = document.getElementById('btn-remove-math-image');
    
    // Document inputs
    const docDropZone = document.getElementById('math-doc-drop-zone');
    const docInput = document.getElementById('math-doc-input');
    const docInfo = document.getElementById('math-doc-info');
    const docName = document.getElementById('math-doc-name');
    const removeDocBtn = document.getElementById('btn-remove-math-doc');
    
    // Outputs UI
    const emptyState = document.getElementById('math-empty-state');
    const loadingState = document.getElementById('math-loading-state');
    const solutionScreen = document.getElementById('math-solution-screen');
    
    const extractedQuestion = document.getElementById('math-extracted-question');
    const finalAnswer = document.getElementById('math-final-answer');
    const stepsContainer = document.getElementById('math-steps-container');
    
    const beginnerText = document.getElementById('math-beginner-text');
    const advancedText = document.getElementById('math-advanced-text');
    const tutorCommentary = document.getElementById('math-tutor-commentary');
    
    const copyAnswerBtn = document.getElementById('btn-copy-math-answer');
    const exTabButtons = document.querySelectorAll('.explanation-tab-btn');
    const exPanes = document.querySelectorAll('.explanation-pane');
    
    // 1. Setup Input Tab Navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const inputType = btn.getAttribute('data-input');
            state.math.activeInput = inputType;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            inputPanes.forEach(p => p.classList.remove('active'));
            document.getElementById(`math-input-${inputType}`).classList.add('active');
        });
    });
    
    // 2. Image Upload Logic
    if (imgDropZone && imgInput) {
        imgDropZone.addEventListener('click', () => imgInput.click());
        imgDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            imgDropZone.classList.add('dragover');
        });
        imgDropZone.addEventListener('dragleave', () => imgDropZone.classList.remove('dragover'));
        imgDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            imgDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleMathImageSelect(e.dataTransfer.files[0]);
            }
        });
        imgInput.addEventListener('change', () => {
            if (imgInput.files.length > 0) {
                handleMathImageSelect(imgInput.files[0]);
            }
        });
    }
    
    function handleMathImageSelect(file) {
        if (!file.type.startsWith('image/')) {
            showToast("Unsupported file type. Please upload an image.", "error");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            imgPreview.src = e.target.result;
            imgPreviewContainer.style.display = 'block';
            imgDropZone.style.display = 'none';
            
            // Extract pure base64 string
            const commaIndex = e.target.result.indexOf(',');
            state.math.imageData = e.target.result.substring(commaIndex + 1);
            state.math.imageMime = file.type;
            
            showToast("📷 Math scan loaded successfully!", "success");
        };
        reader.readAsDataURL(file);
    }
    
    if (removeImgBtn) {
        removeImgBtn.addEventListener('click', () => {
            imgPreview.src = '';
            imgPreviewContainer.style.display = 'none';
            imgDropZone.style.display = 'flex';
            imgInput.value = '';
            state.math.imageData = null;
            state.math.imageMime = null;
        });
    }
    
    // 3. Document Upload Logic
    if (docDropZone && docInput) {
        docDropZone.addEventListener('click', () => docInput.click());
        docDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            docDropZone.classList.add('dragover');
        });
        docDropZone.addEventListener('dragleave', () => docDropZone.classList.remove('dragover'));
        docDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            docDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleMathDocSelect(e.dataTransfer.files[0]);
            }
        });
        docInput.addEventListener('change', () => {
            if (docInput.files.length > 0) {
                handleMathDocSelect(docInput.files[0]);
            }
        });
    }
    
    async function handleMathDocSelect(file) {
        docDropZone.style.display = 'none';
        docInfo.style.display = 'flex';
        docName.textContent = file.name;
        docInfo.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Parsing equations from ${file.name}...`;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/parse-file', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                state.math.documentText = data.text;
                state.math.documentName = file.name;
                docInfo.innerHTML = `
                    <i class="fa-solid fa-file-circle-check text-success"></i>
                    <span id="math-doc-name">${file.name}</span>
                    <button class="btn-remove-preview" id="btn-remove-math-doc"><i class="fa-solid fa-times"></i></button>
                `;
                // Re-bind dynamically generated close button
                document.getElementById('btn-remove-math-doc').addEventListener('click', resetMathDoc);
                showToast("📄 Text extracted successfully!", "success");
            } else {
                showToast(data.error || "Failed to extract text from document.", "error");
                resetMathDoc();
            }
        } catch (err) {
            console.error(err);
            showToast("Connection error while reading file.", "error");
            resetMathDoc();
        }
    }
    
    function resetMathDoc() {
        docDropZone.style.display = 'flex';
        docInfo.style.display = 'none';
        docInput.value = '';
        state.math.documentText = null;
        state.math.documentName = null;
    }
    
    if (removeDocBtn) {
        removeDocBtn.addEventListener('click', resetMathDoc);
    }
    
    // 4. Solve Math Trigger
    if (solveBtn) {
        solveBtn.addEventListener('click', async () => {
            if (!state.apiConfigured) {
                showToast("Please save your Gemini API Key in Tutor Settings first.", "warning");
                switchTab('settings');
                return;
            }
            
            let question = null;
            let imageData = null;
            let imageMime = null;
            
            const activeInput = state.math.activeInput;
            
            if (activeInput === 'text') {
                question = textInput.value.trim();
                if (!question) {
                    showToast("Please enter a mathematical question.", "warning");
                    return;
                }
            } else if (activeInput === 'image') {
                imageData = state.math.imageData;
                imageMime = state.math.imageMime;
                if (!imageData) {
                    showToast("Please upload an image of the math problem.", "warning");
                    return;
                }
            } else if (activeInput === 'document') {
                question = state.math.documentText;
                if (!question) {
                    showToast("Please import a math worksheet or study document.", "warning");
                    return;
                }
            }
            
            // Set UI Loading State
            solveBtn.disabled = true;
            solveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Writing Solutions...';
            
            emptyState.style.display = 'none';
            solutionScreen.style.display = 'none';
            loadingState.style.display = 'flex';
            
            try {
                const modelName = modelSelect ? modelSelect.value : 'gemini-2.5-flash';
                
                const response = await fetch('/api/math/solve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: question,
                        image_data: imageData,
                        image_mime: imageMime,
                        model: modelName
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.solution) {
                    const sol = data.solution;
                    
                    // 1. Extracted Question
                    extractedQuestion.textContent = sol.extracted_question || "Multimodal OCR Scan";
                    
                    // 2. Final Answer
                    finalAnswer.textContent = sol.final_answer || "Unsolved";
                    
                    // 3. Step-by-Step timeline
                    stepsContainer.innerHTML = '';
                    if (sol.steps && sol.steps.length > 0) {
                        sol.steps.forEach((step, idx) => {
                            const node = document.createElement('div');
                            node.className = 'math-step-node';
                            node.innerHTML = `
                                <div class="math-step-num">Step ${idx + 1}</div>
                                <div class="math-step-content">${step}</div>
                            `;
                            stepsContainer.appendChild(node);
                        });
                    } else {
                        stepsContainer.innerHTML = '<p>No intermediate steps returned.</p>';
                    }
                    
                    // 4. Easy (Beginner) explanation
                    if (typeof marked !== 'undefined' && sol.beginner_explanation) {
                        beginnerText.innerHTML = marked.parse(sol.beginner_explanation);
                    } else {
                        beginnerText.textContent = sol.beginner_explanation || "No explanation provided.";
                    }
                    
                    // 5. Core Principles (Advanced) explanation
                    if (typeof marked !== 'undefined' && sol.intermediate_explanation) {
                        advancedText.innerHTML = marked.parse(sol.intermediate_explanation);
                    } else {
                        advancedText.textContent = sol.intermediate_explanation || "No explanation provided.";
                    }
                    
                    // 6. Tutor commentary
                    tutorCommentary.textContent = sol.tutor_commentary || "Focus on the basics and practice constantly!";
                    
                    // Trigger KaTeX math rendering on all new elements!
                    if (window.renderMathInElement) {
                        const targets = [extractedQuestion, finalAnswer, stepsContainer, beginnerText, advancedText, tutorCommentary];
                        targets.forEach(t => {
                            try {
                                window.renderMathInElement(t, {
                                    delimiters: [
                                        {left: '$$', right: '$$', display: true},
                                        {left: '$', right: '$', display: false},
                                        {left: '\\(', right: '\\)', display: false},
                                        {left: '\\[', right: '\\]', display: true}
                                    ],
                                    throwOnError: false
                                });
                            } catch (err) {
                                console.error("KaTeX rendering error:", err);
                            }
                        });
                    }
                    
                    // Switch back to "Step-by-Step" tab as default view
                    exTabButtons.forEach(btn => btn.classList.remove('active'));
                    exTabButtons[0].classList.add('active');
                    exPanes.forEach(pane => pane.classList.remove('active'));
                    document.getElementById('math-ex-steps').classList.add('active');
                    
                    loadingState.style.display = 'none';
                    solutionScreen.style.display = 'block';
                    
                    showToast("📝 Math problem solved successfully!", "success");
                } else {
                    showToast(data.error || "Failed to compile math solutions.", "error");
                    loadingState.style.display = 'none';
                    emptyState.style.display = 'flex';
                }
            } catch (err) {
                console.error(err);
                showToast("Connection to math tutor engine failed.", "error");
                loadingState.style.display = 'none';
                emptyState.style.display = 'flex';
            } finally {
                solveBtn.disabled = false;
                solveBtn.innerHTML = '<i class="fa-solid fa-brain"></i> Solve Math Problem';
            }
        });
    }
    
    // 5. Copy Answer Trigger
    if (copyAnswerBtn) {
        copyAnswerBtn.addEventListener('click', () => {
            const ans = finalAnswer.textContent;
            if (ans) {
                navigator.clipboard.writeText(ans);
                showToast("Copied answer to clipboard!", "success");
            }
        });
    }
    
    // 6. Explanation Tabs Navigation
    exTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const exType = btn.getAttribute('data-ex');
            
            exTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            exPanes.forEach(p => p.classList.remove('active'));
            document.getElementById(`math-ex-${exType}`).classList.add('active');
        });
    });
}

