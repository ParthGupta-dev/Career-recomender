// --- State Management ---
let state = {
    currentView: 'landing',
    interview: {
        active: false,
        role: '',
        history: [] // Array of {role: 'user'|'model', text: string}
    }
};

// --- Gemini API Key (client-side for local/demo use) ---
const GEMINI_API_KEY = 'AIzaSyDIuD8SPOGUbnQV01k6kGb9Ec0s27QDhD8';

// --- DOM Elements ---
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

// --- Sidebar Mobile Toggle ---
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });
}

// --- Navigation ---
function navigateTo(viewId) {
    views.forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        state.currentView = viewId;
    }

    // Update sidebar active state
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewId) {
            item.classList.add('active');
        }
    });

    // Close mobile sidebar
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
}

// --- AI Helper (calls Gemini directly with API key) ---
async function callGemini(prompt) {
    const models = [
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash-lite'
    ];

    let lastError = null;

    for (const model of models) {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (data.error) {
                console.warn(`Model ${model} failed:`, data.error.message);
                lastError = data.error.message;
                continue; // Try next model
            }

            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            console.error(`Network error with ${model}:`, error);
            lastError = error.message;
        }
    }

    return `AI Error: Could not connect to models. Last error: ${lastError}`;
}

// --- Markdown Renderer (Marked.js) ---
function renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
        return marked.parse(text);
    }
    // Fallback if Marked.js failed to load
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

// --- Feature 1: Roadmap Generator ---
const generateRoadmapBtn = document.getElementById('generateRoadmapBtn');
const roadmapDisplay = document.getElementById('roadmap-display');

generateRoadmapBtn.addEventListener('click', async () => {
    const career = document.getElementById('roadmap-career-select').value;
    const currentPos = document.getElementById('roadmap-current-pos').value;

    if (!career || !currentPos) {
        alert('Please fill in both fields');
        return;
    }

    roadmapDisplay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating your personalized roadmap...';
    roadmapDisplay.classList.remove('hidden');

    const prompt = `I am currently a ${currentPos} and I want to become a ${career}. Create a detailed step-by-step roadmap for me. Break it down into stages (Beginner, Intermediate, Advanced) with estimated timelines and key skills to learn. format using markdown.`;

    const rawText = await callGemini(prompt);
    roadmapDisplay.innerHTML = renderMarkdown(rawText);
});

// --- Feature 2: Resume Analyzer ---
const analyzeResumeBtn = document.getElementById('analyzeResumeBtn');
const resumeUpload = document.getElementById('resume-upload');
const dropZone = document.getElementById('drop-zone');
const fileNameDisplay = document.getElementById('file-name-display');
const resumeFeedback = document.getElementById('resume-feedback');
let resumeText = '';

// Drag & Drop
dropZone.addEventListener('click', () => resumeUpload.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent)'; });
dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'var(--border-strong)'; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-strong)';
    handleFile(e.dataTransfer.files[0]);
});
resumeUpload.addEventListener('change', (e) => handleFile(e.target.files[0]));

async function handleFile(file) {
    if (file && file.type === 'application/pdf') {
        fileNameDisplay.textContent = `Selected: ${file.name}`;
        resumeText = await extractPdfText(file);
    } else {
        alert('Please upload a PDF file.');
    }
}

async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ');
    }
    return fullText;
}

analyzeResumeBtn.addEventListener('click', async () => {
    const role = document.getElementById('resume-role-input').value;
    if (!resumeText || !role) {
        alert('Please upload a resume and enter a desired role.');
        return;
    }

    resumeFeedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing resume match...';
    resumeFeedback.classList.remove('hidden');

    const prompt = `
    Job Role: ${role}
    Resume Content: ${resumeText.substring(0, 10000)} ... [truncated]
    
    Task: Analyze if this resume is a good fit for the role. 
    1. Give a match score (0-100%).
    2. List CRITICAL MISSING SKILLS.
    3. Suggest improvements.
    Format clearly in markdown.
    `;

    const rawText = await callGemini(prompt);
    resumeFeedback.innerHTML = renderMarkdown(rawText);
});

// --- Feature 3: Mock Interview ---
const startInterviewBtn = document.getElementById('startInterviewBtn');
const interviewChat = document.getElementById('interview-chat');
const interviewSetup = document.getElementById('interview-setup');
const chatHistoryDiv = document.getElementById('chat-history');
const userResponseInput = document.getElementById('user-response');
const sendResponseBtn = document.getElementById('sendResponseBtn');

startInterviewBtn.addEventListener('click', async () => {
    const role = document.getElementById('interview-role').value;
    if (!role) {
        alert('Please enter a role for the interview.');
        return;
    }

    state.interview.active = true;
    state.interview.role = role;
    state.interview.history = [];

    interviewSetup.classList.add('hidden');
    interviewChat.classList.remove('hidden');

    // Initial Question
    addMessageToChat('ai', `Starting interview for ${role}. I will ask you questions. Ready? Tell me about yourself.`);
    state.interview.history.push({ role: 'model', parts: [{ text: `You are a professional technical interviewer interviewing a candidate for the role of ${role}. Start by asking them to introduce themselves.` }] });
});

sendResponseBtn.addEventListener('click', handleInterviewResponse);
userResponseInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleInterviewResponse();
});

async function handleInterviewResponse() {
    const response = userResponseInput.value.trim();
    if (!response) return;

    // Add user message
    addMessageToChat('user', response);
    userResponseInput.value = '';

    // Show typing indicator instead of static spinner
    const loadingId = addTypingIndicator();

    // Construct Prompt with History context
    const prompt = `
    Context: You are interviewing a candidate for ${state.interview.role}.
    Current Conversation History:
    ${state.interview.history.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}
    Candidate Answer: ${response}
    
    Task: Evaluate the answer briefly (internally), then ask the NEXT relevant interview question. 
    If the answer was weak, ask a follow-up. 
    Include a mix of technical and behavioral questions.
    Keep your response concise (just the next question or feedback + question).
    `;

    const aiReply = await callGemini(prompt);

    // Update history
    state.interview.history.push({ role: 'user', parts: [{ text: response }] });
    state.interview.history.push({ role: 'model', parts: [{ text: aiReply }] });

    // Remove typing indicator and show reply
    const loadingElem = document.getElementById(loadingId);
    if (loadingElem) loadingElem.remove();
    addMessageToChat('ai', aiReply);
}

function addMessageToChat(sender, text) {
    const id = 'msg-' + Date.now();
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.id = id;
    div.innerHTML = `
        <div class="avatar"><i class="fas fa-${sender === 'ai' ? 'robot' : 'user'}"></i></div>
        <div class="bubble">${sender === 'ai' ? renderMarkdown(text) : text}</div>
    `;
    chatHistoryDiv.appendChild(div);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    return id;
}

// Typing indicator — 3 animated dots
function addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message ai';
    div.id = id;
    div.innerHTML = `
        <div class="avatar"><i class="fas fa-robot"></i></div>
        <div class="bubble">
            <div class="typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
    `;
    chatHistoryDiv.appendChild(div);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    return id;
}

// --- Feature 4: Skill Check ---
const checkSkillsBtn = document.getElementById('checkSkillsBtn');
const skillDisplay = document.getElementById('skill-display');

checkSkillsBtn.addEventListener('click', async () => {
    const role = document.getElementById('skill-role-input').value;
    if (!role) return;

    skillDisplay.classList.remove('hidden');
    skillDisplay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Forecasting skills...';

    const prompt = `What are the required skills for a ${role} today, and what skills will be critical in 2-3 years? Provide a bulleted list.`;
    const text = await callGemini(prompt);
    skillDisplay.innerHTML = renderMarkdown(text);
});


// --- Feature 5: Interest Selector ---
const selectedInterests = new Set();
document.querySelectorAll('.interest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        if (selectedInterests.has(value)) {
            selectedInterests.delete(value);
            btn.classList.remove('selected');
        } else {
            selectedInterests.add(value);
            btn.classList.add('selected');
        }
    });
});

document.getElementById('recommendBtn').addEventListener('click', async () => {
    if (selectedInterests.size === 0) {
        alert("Please select at least one interest!");
        return;
    }

    const interests = Array.from(selectedInterests).join(', ');
    const resultBox = document.getElementById('interest-result');
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI is finding your perfect match...';

    const prompt = `Based on these interests: [${interests}], suggest top 3 suitable career paths with a brief explanation for each.`;
    const text = await callGemini(prompt);
    resultBox.innerHTML = renderMarkdown(text);
});
