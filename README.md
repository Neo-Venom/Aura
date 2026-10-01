# Aura — Warm, Gentle AI Emotional Support

> **A calm place to put everything down.**  
> Aura is a free, compassionate AI-powered emotional support web application built to offer mindful reflection, gentle check-ins, guided breathing, and non-judgmental space whenever life feels loud.

---

## 🌟 Features & Highlights

- **Gentle 29-Question Check-in**:
  - Grounded in evidence-informed psychological markers (DASS-21 + mood, anger, tiredness, grief, and brightness subscales).
  - Draft saving, keyboard navigation (1–4), interstitial pauses, and skip capabilities.
- **"Your Emotional Weather" Visualizer**:
  - Interactive radar chart visualizing heaviness dimensions and an intuitive brightness gauge.
  - **History Detail**: Tap any earlier check-in card to view that day's full emotional weather breakdown, radar, and descriptive dimension words.
- **Empathetic AI Conversational Companion**:
  - Real-time streaming with breathing-orb thinking indicators.
  - Idempotent retry mechanisms and restorative "Aura needs a little rest" rate-limit cards.
  - **Multi-Key Circular AI Engine**: Automatic round-robin rotation across multiple Google Gemini and Groq API keys with zero-latency failover.
- **Calm Corner**:
  - Guided breathing orb with gentle presets (*Gentle 4-6*, *Box 4-4-4-4*).
  - **Night Calm Sounds**: Procedurally generated ambient sounds (**Soft Rain** and **Ocean Waves**) powered by the Web Audio API with volume controls.
  - 5-4-3-2-1 Sensory Grounding Tool (client-side only, never uploaded).
- **Auto Night Mode**:
  - Automatically switches to Soft Night theme after sunset (6:00 PM / 18:00 to 6:00 AM) for users who select the System theme.
- **Voice Input & Accessibility**:
  - Web Speech API microphone input with listening ripple effects and customizable language selection (`stt_language`).
  - 95+ Lighthouse accessibility pass with visible keyboard focus rings across all interactive controls.
- **Safety First & Crisis Direction**:
  - Persistent *"Need support now?"* pill and global crisis directory with one-tap dialing and SMS shortcuts for 988, 911, 112, 116 123, and international services.
  - Automated safety cues trigger inline crisis guidance and emergency modal support.
- **User Privacy & Data Ownership**:
  - 100% user data export as a structured JSON bundle.
  - One-click chat history deletion and permanent account purge (`DELETE`).

---

## 🏗️ Architecture & Technology Stack

```
Aura/
├── frontend/                     # React 19 + TypeScript SPA
│   ├── src/app/                  # App routes, store, auth context, theme sync
│   ├── src/components/           # Feature UI modules (chat, calm, weather, checkin, shell, safety)
│   ├── src/services/             # Service abstraction layer (Mock, HTTP, Supabase)
│   │   ├── supabase.ts           # Supabase Auth client & service adapter
│   │   ├── http.ts               # API fetcher with token bearer & error handling
│   │   └── mock/                 # LocalStorage-backed offline test suite
│   ├── src/copy/en.ts            # Centralized UX copy
│   └── src/styles/               # Tailwind CSS tokens & globals
│
├── backend/                      # Python FastAPI REST & Streaming Server
│   ├── server.py                 # FastAPI routes, rate limiter, circular key rotator
│   └── requirements.txt          # Python dependencies
│
└── memory/                       # Product requirements (PRD) & architecture specs
```

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Radix UI primitives, `@vercel/analytics`, `@supabase/supabase-js`.
- **Backend**: FastAPI, Uvicorn, Pydantic, HTTPX, Motor/MongoDB (with resilient in-memory fallback).
- **AI Inferencing**: Google Gemini Flash (2.0 / 1.5) & Groq Cloud (Llama 3.3 70B Versatile).
- **Authentication**: Supabase Auth (Email/Password & Google OAuth).

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18+ (Node v20+ recommended)
- **Python**: v3.10+

### 2. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create your .env file
cp .env.example .env   # Or edit frontend/.env

# Start the development server
npm start
```
The frontend will start at **`http://localhost:3000`**.

> **Tip**: By default in `frontend/.env`, set `REACT_APP_USE_MOCKS=true` to test the app offline with mock data stored in `localStorage` without needing the backend or API keys running!

### 3. Backend Setup
```bash
# In a separate terminal, navigate to the backend directory
cd backend

# Install python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn server:app --reload --port 8000
```
The backend API documentation is available at **`http://localhost:8000/docs`**.

---

## 🔒 Environment Variables

### `frontend/.env`
```env
# Mode: true = localStorage mock data; false = real backend & Supabase
REACT_APP_USE_MOCKS=false

# API origin
REACT_APP_API_BASE_URL=http://localhost:8000

# STT Mode: browser (Web Speech API) or server (MediaRecorder)
REACT_APP_STT_MODE=browser

# Supabase Auth Credentials
REACT_APP_SUPABASE_URL=https://<your-project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-supabase-publishable-key>
```

### `backend/.env`
```env
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Groq API Keys (Comma-separated for circular loop rotation)
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3

# Gemini API Keys (Comma-separated for circular loop rotation)
GEMINI_API_KEYS=AIzaSy_key1,AIzaSy_key2,AIzaSy_key3

# Sliding Window Rate Limits
RATE_LIMIT_RPM=10
RATE_LIMIT_RPD=1000
```

---

## ☁️ Production Deployment (Free Tier Stack)

For a complete step-by-step walkthrough, see [DEPLOYMENT_GUIDE.md](file:///c:/Users/iamgh/Documents/Aura/DEPLOYMENT_GUIDE.md).

1. **Deploy Backend on Render**:
   - Push to GitHub.
   - Connect repository on [Render.com](https://render.com) as a Web Service.
   - Root directory: `backend`, Build: `pip install -r requirements.txt`, Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`.
   - Copy your Render URL (e.g. `https://aura-backend.onrender.com`).
2. **Deploy Frontend on Vercel**:
   - Connect repository on [Vercel.com](https://vercel.com).
   - Root directory: `frontend`.
   - Set `REACT_APP_USE_MOCKS=false` and `REACT_APP_API_BASE_URL=https://aura-backend.onrender.com`.
   - Deploy.

---

## 🛡️ Privacy & Medical Disclaimer

Aura is an artificial intelligence emotional support companion designed to offer warm, empathetic space for reflection and mindfulness. **Aura is not a medical provider, diagnostic tool, psychiatric healthcare provider, or emergency crisis hotline.** 

If you or someone you know is in immediate danger or experiencing self-harm, please immediately contact emergency services (such as 988 or 911 in the US/Canada, 112 in India, 999 or 116 123 in the UK) or consult a licensed physician.

---

## 📄 License
Released under the MIT License.
