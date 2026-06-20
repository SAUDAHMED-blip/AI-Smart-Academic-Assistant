<<<<<<< HEAD
# 🎓 Aetheria | AI Smart Academic Assistant

Aetheria is an elite, glassmorphic, and production-grade smart academic companion designed to accelerate student learning, active recall, and productivity. Built as a single-page dashboard with a modular Python/Flask backend and a premium modern UI, it links directly to the Google Gemini API to power 5 custom-tailored academic submodules.

---

## 🎨 Premium UI & Dark Glassmorphism Visuals
- **Harmonious Neon Glow Palette:** Uses a tailored, modern color system combining deep slate-indigo backgrounds, violet accent lines, and electric cyan interactive indicators.
- **3D Card Transitions:** Implements a pure CSS 3D perspective flip engine for study flashcards (`transform: rotateY(180deg)`), making memorization highly engaging.
- **Responsive Layout Grids:** Seamlessly fits desktop and laptop screens with a fixed-side glassmorphic navigation bar and flexible workspace containers.
- **Interactive Checklists & Timelines:** Features dynamic study roadmaps with expandable timelines, hour-budgets, color-coded priority indicators, and client-side progress bars.

---

## 📁 Complete Project Architecture

The workspace is organized into a clean, decoupled MVC/modular structure:

```
smart_academic_assistant/
│
├── app.py                      ← Main Flask Server (runs on http://localhost:8080)
├── config.json                 ← Stores Gemini API Key securely (loaded/saved dynamically)
├── requirements.txt            ← System dependencies (Flask, google-genai, etc.)
├── README.md                   ← Project documentation (This file)
│
├── templates/
│   └── index.html              ← Premium SPA UI skeleton linking style & script modules
│
├── static/
│   ├── css/
│   │   └── style.css           ← Comprehensive dark-theme visual design system
│   └── js/
│       └── main.js             ← Frontend controllers, API calls, and SPA state machine
│
└── modules/
    ├── __init__.py             ← Treats modules as a package
    ├── gemini_client.py        ← Core connector handling key validation, configurations, and API calls
    ├── qa_assistant.py         ← Q&A Chat Assistant powered by a custom academic tutor persona
    ├── summarizer.py           ← Document & plain-text condensing engine
    ├── quiz_generator.py       ← Structured JSON multiple-choice question generator
    ├── flashcard_maker.py      ← Dynamic JSON active-recall deck builder
    ├── study_planner.py        ← Weekly/daily adaptive scheduling and task allocation compiler
    └── math_solver.py          ← Multimodal OCR OCR, step-by-step calculus/algebra solver and tutor
```

---

## ⚡ Key Features & Academic Modules

### 1. 🏠 Dashboard Home
- Welcomes the scholar with positive motivation.
- Provides high-fidelity navigator cards that slide seamlessly between all modules.
- Displays dynamic date displays and pulses live connection status indicators.

### 2. 💬 Q&A Tutor (Academic Chat)
- Powered by a custom system instruction enforcing a rigorous, encouraging step-by-step academic teacher persona.
- **Markdown & Highlight Support:** Renders Markdown tables, mathematics formulas, and bullet points. Automatically parses and applies beautiful, colorized syntax highlighting to Python, JavaScript, HTML, and SQL blocks using **Prism.js**.
- **Chat Memory:** Seamlessly appends user query histories for fully contextualized conversations.
- **Quick Prompts:** Includes smart sidebar bookmarks for instant derivations, database comparisons, and coding analogies.

### 3. 📝 Smart Summarizer
- **File Drag-and-Drop:** Allows direct file uploading (`.txt`, `.md`, `.json`). Reads files in the browser instantly via `FileReader` and populates the text workspace.
- **Custom Lengths & Styles:** Features output formats (Key Takeaways, Bulleted Lists, Summaries, or Comprehensive Study Guides) and explanation styles (Academic, ELI5, or formal Technical).
- **Clipboard & Downloads:** Instant copy to clipboard and `.txt` file downloading for study references.

### 4. 🧠 Interactive Quiz Generator
- Generates high-quality multiple-choice questions (MCQs) utilizing the **Gemini JSON Output Mode** for absolute reliability.
- **Active Testing Engine:** Displays question-by-question slides with interactive, animated option cards.
- **Instant Interactive Feedback:** Right options light up in vibrant emerald-green; wrong selections pulse in soft ruby-red.
- **Tutor Explanations:** Instantly drops down a custom collapsed tutoring card showing a comprehensive conceptual explanation of why the correct option is right.
- **Score Report Card:** Concludes with an elegant score ring, percentage calculation, and progress appraisal.

### 5. 📇 Flashcard Deck Maker
- Converts reference material into customized, portable memory cards.
- **3D Flip Component:** Clicking a card triggers a smooth, responsive 3D flip animation showing the front (concept) and back (definition/solved steps).
- **Active Recall Self-Appraisal:** Lets students self-evaluate as "Got It!" or "Needs Review" to dynamically compile a performance ratio and auto-advance.

### 6. 📅 Adaptive Study Planner
- Tailors study plans based on topic, proficiency levels (Beginner, Intermediate, Expert), target timeframes, and daily study hours.
- **Checklist Roadmap:** Generates an expandable checklist timeline. Toggling checkboxes calculates overall completed percentages and slides progress meters.
- **Schedule Downloads:** Formats timelines into clean study schedules downloadable as text logs.

### 7. 🧠 AI Math Solver
- Solves handwritten or printed mathematical equations from scans, text inputs, and worksheets.
- **Multimodal Vision OCR:** Employs Gemini's multimodal reasoning to read math formulas directly without heavy external binary wrappers (like Tesseract).
- **Multi-Level Tutoring:** Delivers a copyable Final Answer, a vertical step-by-step derivation timeline, a simplified beginner explanation using analogies, a list of advanced rules applied, and dean-style commentary.

---

## 🚀 Step-by-Step Running Guide

### 1. Pre-requisites
Ensure Python 3.10+ is installed on your local machine.

### 2. Run the Server
Open a terminal in the root of this project and execute:
```bash
python app.py
```
*The server will boot instantly in debug mode on **`http://localhost:8080`**.*

### 3. Setup Gemini API Key
1. Go to `http://localhost:8080`.
2. Click **Tutor Settings** in the bottom sidebar.
3. Insert your API key (obtained for free from [Google AI Studio](https://aistudio.google.com/)).
4. Click **Verify & Save Key**.
*Aetheria is now fully configured and active!*

---

## ⚙️ REST API Endpoints Overview

The server operates a clean JSON-API interface:

- `GET /` - Serves the web dashboard.
- `GET /api/settings/status` - Checks if a key is loaded.
- `POST /api/settings/verify` - Dynamically checks and saves a new API key.
- `POST /api/chat` - Submits a conversational query with historical context.
- `POST /api/summarize` - Sends plain text, format, and explanation style parameters for summarization.
- `POST /api/quiz` - Requests a custom MCQ quiz array in strict JSON format.
- `POST /api/flashcard` - Requests an active-recall flashcard deck array.
- `POST /api/study-plan` - Requests a detailed timeline schedule.
- `POST /api/math/solve` - Submits a mathematical problem (text, scan, or worksheet) for multi-level step-by-step solutions.
- `POST /api/analytics/advisor` - Compiles historical analytics into an Academic Dean advising report.
=======
# AI-Smart-Academic-Assistant
Aetheria is a production-grade AI Smart Academic Assistant built with Flask and Gemini API. Features include AI tutoring, smart summarization, quiz generation, flashcards, adaptive study planning, math solving, analytics, and a premium glassmorphic UI designed to enhance student learning and productivity.
>>>>>>> 80ce1354c7afde51d0f6063eb6ba01edb1bcd757
