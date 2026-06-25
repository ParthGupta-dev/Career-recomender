# NextGen Career AI

> An AI-powered career assistant that helps users **discover career paths, generate roadmaps, analyse skills, review resumes, and practise mock interviews** — all from one clean web app.

![Platform](https://img.shields.io/badge/platform-web-blue)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-black)
![Backend](https://img.shields.io/badge/backend-Vercel%20Functions-black)
![Auth](https://img.shields.io/badge/auth-Firebase-orange)
![LLM](https://img.shields.io/badge/LLM-Gemini%20%2B%20Groq-success)

---

## Overview

**NextGen Career AI** started as a simple career recommendation tool, but the current version is a **multi-feature AI career assistant**.  
It combines career exploration, personalised guidance, skill analysis, resume feedback, and interview preparation into a single app.

The project is built with:
- **Vanilla HTML, CSS, and JavaScript** on the frontend
- **Firebase Authentication** for login/signup
- **Vercel serverless functions** for secure AI access
- **Google Gemini** as the primary model provider
- **Groq** as an automatic fallback provider if Gemini fails

---

## Features

### 1) Career Discovery
Users can select their interests and get AI-generated career suggestions with explanations of **why those paths fit**.

**Use case:**  
A student interested in AI, design, and problem-solving can get a shortlist of suitable careers rather than generic internet advice.

---

### 2) Career Roadmap Generator
Users enter:
- their **current position**
- their **target role**

The app generates a step-by-step roadmap showing how to move from where they are now to where they want to be.

**Example:**  
“From BCA student → Backend Developer”  
or  
“From fresher → Data Analyst”

---

### 3) Skill Check / Skill Forecast
Users enter a role and get:
- the **important skills required today**
- the **skills likely to matter in the next few years**
- a quick view of market direction and role expectations

This is useful for deciding **what to learn next** instead of randomly collecting courses.

---

### 4) Resume Analysis
Users upload a **PDF resume** and enter a target role.  
The app extracts the resume text in the browser and sends it to the AI for analysis.

The response can include:
- resume-role fit
- missing skills
- improvement suggestions
- areas to strengthen before applying

---

### 5) Mock Interview
Users can start a role-based mock interview and continue it in a chat-like format.  
The AI asks follow-up questions based on the previous answers, making the interaction feel closer to a real interview than a static question bank.

---

### 6) Secure AI Backend
The frontend does **not** expose API keys.  
Instead, requests are sent to Vercel serverless functions under `/api`, which securely call the LLM provider.

---

### 7) Provider Fallback Logic
The backend uses a shared helper that:
1. tries **Gemini** first
2. automatically falls back to **Groq** if Gemini fails, rate-limits, or returns an invalid response

This makes the app more reliable during demos and real usage.

---

## Tech Stack

### Frontend
- **HTML5**
- **CSS3**
- **Vanilla JavaScript**

### Backend / AI Layer
- **Vercel Serverless Functions**
- **Google Gemini API**
- **Groq API** (fallback)

### Authentication
- **Firebase Authentication**

### Client-side Libraries
- **PDF.js** — extracts text from uploaded PDF resumes
- **Marked.js** — renders AI responses returned in Markdown
- **Font Awesome** — icons

---

## Product Flow

### Normal AI flow
1. User opens a tool (career discovery, roadmap, skill check, etc.)
2. Frontend builds a prompt from the user input
3. Request is sent to `/api/gemini`
4. The serverless function calls the shared LLM helper
5. The helper tries **Gemini**, then **Groq** if needed
6. The AI response is returned and rendered in the UI

### Resume analysis flow
1. User uploads a PDF resume
2. **PDF.js** extracts text client-side
3. The extracted text + target role are turned into a prompt
4. Backend sends the prompt to the LLM
5. The response is shown as role-fit and improvement feedback

### Mock interview flow
1. User enters a target role
2. Interview session starts
3. Each answer is added to the chat history
4. The next prompt includes previous conversation context
5. AI returns the next question / follow-up

---

## Project Structure

```text
Career-recomender-main/
├─ api/
│  ├─ _llmHelper.js        # Shared LLM helper with Gemini → Groq fallback
│  ├─ gemini.js            # Main AI endpoint used by the frontend
│  └─ roadmap.js           # Separate roadmap endpoint (currently present but not actively used by script.js)
│
├─ index.html              # Main app UI
├─ script.js               # Core frontend logic for all tools
├─ style.css               # Styling, layout, responsive UI
│
├─ login.html              # Login / signup page
├─ login.js                # Login page behaviour
├─ auth.js                 # Firebase auth checks + logout logic
│
├─ config.js               # Local Firebase config
├─ config.example.js       # Example Firebase config template
├─ .env.example            # Example environment variables (currently outdated; see setup section below)
├─ vercel.json             # Vercel configuration
│
├─ README.md               # Public project documentation
└─ UI_REDESIGN_AND_FIXES.md
```

---

## Screens / Modules

The current app UI includes these main sections:
- **Home / landing page**
- **Discover Career**
- **Get Roadmap**
- **Skill Check**
- **Resume Analysis**
- **Mock Interview**

If you are turning this into a portfolio or hackathon repo, add screenshots for each of the above sections here.

```md
## Screenshots

### Home
![Home Screenshot](./assets/home.png)

### Career Discovery
![Career Discovery Screenshot](./assets/career-discovery.png)

### Resume Analysis
![Resume Analysis Screenshot](./assets/resume-analysis.png)
```

---

## Local Setup

## 1) Clone the repository

```bash
git clone <your-repo-url>
cd Career-recomender-main
```

## 2) Create the environment variables

The repo’s current `.env.example` is **outdated**.  
Based on the actual code in `api/_llmHelper.js`, the app expects:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Create a `.env` file locally (or add these in Vercel environment variables).

---

## 3) Add Firebase configuration

Set up your Firebase config in `config.js`.

Use `config.example.js` as the template and fill in your own values.

Example structure:

```js
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 4) Run the project

If you just want to work on the frontend, you can serve it locally with any static server.

Example using VS Code Live Server:
- open the project folder
- start **Live Server**
- open the local URL in your browser

If you want to test the Vercel functions properly, use the Vercel dev environment:

```bash
npm install -g vercel
vercel dev
```

---

## Deployment

This project is designed to deploy cleanly on **Vercel**.

### Deploy steps
1. Push the repo to GitHub
2. Import the project into Vercel
3. Add environment variables in the Vercel dashboard:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
4. Ensure Firebase config is correctly handled for production
5. Deploy

---

## API Endpoints

### `POST /api/gemini`
Main endpoint used by the frontend for:
- career discovery
- skill check
- resume analysis
- mock interview
- general prompt-based generation

It accepts either:
- a direct `prompt`, or
- specific structured fields such as `interests`

---

### `POST /api/roadmap`
Dedicated roadmap endpoint that accepts:
- `prompt`, or
- `currentPosition` + `targetCareer`

---

## Why this project matters

Students often face three separate problems:
1. **they do not know which career path fits them**
2. **they do not know what to learn next**
3. **they do not know whether their resume or interview prep is actually good enough**

This project tries to solve all three in one place:
- discover a direction
- build a roadmap
- identify missing skills
- improve the resume
- practise interviews

That makes it much more useful than a one-feature “career recommendation” demo.

---

## Contributing

If you want to improve the project:
1. fork the repo
2. create a feature branch
3. make your changes
4. open a pull request with a clear explanation of what changed

---



---

## Author Note

This project is a solid base for a **career-tech product**, not just a small AI demo.  
With cleaner architecture, persistent data, and better prompt/endpoint separation, it can become a genuinely strong portfolio piece.
