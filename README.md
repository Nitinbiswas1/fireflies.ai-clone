# Fireflies.ai Clone — Meeting Intelligence & Transcription Platform

A fullstack Fireflies.ai-inspired meeting notes & transcription web application built with FastAPI, SQLAlchemy 2.x, SQLite, Next.js (App Router), and Tailwind CSS v4.

---

## Technical Architecture & Overview

```
               ┌──────────────────────────────────────────┐
               │          Next.js App Router UI           │
               │   (React 19 + Tailwind v4 + Lucide)      │
               └────────────────────┬─────────────────────┘
                                    │ REST API
               ┌────────────────────▼─────────────────────┐
               │            FastAPI Backend               │
               │     (Routers / Services / Schemas)       │
               └─────────┬──────────────────────┬─────────┘
                         │                      │
       SQLite Database   │                      │ Hugging Face API
┌────────────────────────▼─────┐      ┌─────────▼──────────────┐
│  meeting.db (SQLAlchemy)     │      │ Qwen/Qwen2.5-7B       │
│  - meetings, participants    │      │ Server-side RAG Q&A    │
│  - transcripts, summaries    │      └────────────────────────┘
│  - action_items, topics      │
└──────────────────────────────┘
```

---

## Features

- **Meetings Library & Workspace**: Search across titles/transcripts, date filters, participant filters, recency/oldest sorting, and full meeting CRUD.
- **Interactive Transcript Player**: Synchronized audio/time tracking, timestamp click-to-seek, speaker badges, and keyword transcript search with highlighted matches.
- **Automated AI Summary & Processing**: Generates overview summaries, key decision points, topic/chapter timelines, and action items with speaker-assigned due dates.
- **Meeting CRUD & Participant Management**: Supports creating meetings with/without transcripts, editing metadata, syncing participant relationships, and deleting meetings.
- **Global Search**: Search across meetings by title, description, participant names, transcript text, overview, key points, and action items.
- **Export Capabilities**: Export meeting transcripts (`.txt`), summaries (`.txt`), or full Markdown notes (`.md`).
- **Dark Mode**: System-aware theme toggle (Light / Dark) persisting across navigation and page refreshes.
- **Ask AI Chatbot (Bonus Feature)**: Meeting-scoped Q&A using Hugging Face Inference Providers.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Pydantry v2, SQLAlchemy 2.x, Alembic, Uvicorn, python-dotenv
- **Database**: SQLite (`backend/meeting.db`)
- **AI Integration**: Hugging Face Inference API (`huggingface_hub` / `Qwen/Qwen2.5-7B-Instruct-1M`)

---

## Environment Variables

### Backend (`backend/.env`)
```bash
DATABASE_URL=sqlite:///./meeting.db
CORS_ORIGINS=http://localhost:3000
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx # Optional for Ask AI
HF_MODEL=Qwen/Qwen2.5-7B-Instruct-1M
```

> **Security Note**: `HF_TOKEN` is stored strictly server-side in `backend/.env` and is **never** exposed to the frontend or placed in `NEXT_PUBLIC_*` variables.

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Database Generation Note**: The application does **not** check in or rely on a pre-existing `backend/meeting.db` file. On a fresh installation, the SQLite database is automatically generated from scratch using Alembic migrations (`alembic upgrade head`) and populated with initial realistic seed data using `python -m app.seed`.

---

## Database Schema & Models

- **`Meeting`**: `id`, `title`, `description`, `meeting_date`, `duration_seconds`, `created_at`, `updated_at`
- **`Participant`**: `id`, `name`, `email`, `avatar_url`
- **`MeetingParticipant`**: Association table (`meeting_id`, `participant_id`)
- **`TranscriptSegment`**: `id`, `meeting_id`, `speaker_name`, `participant_id`, `start_time`, `end_time`, `text`
- **`Summary`**: `id`, `meeting_id`, `overview`, `key_points` (JSON string array)
- **`Topic`**: `id`, `meeting_id`, `name`, `start_time`, `end_time`
- **`ActionItem`**: `id`, `meeting_id`, `text`, `assignee_id`, `due_date`, `completed`

---

## API Overview

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/health` | `GET` | Health check endpoint |
| `/api/meetings` | `GET` | List meetings with search, sort, topic, and participant filters |
| `/api/meetings` | `POST` | Create a new meeting (optional transcript processing) |
| `/api/meetings/{id}` | `GET` | Get meeting details with participants, topics, and summaries |
| `/api/meetings/{id}` | `PATCH` | Update meeting details & participant list |
| `/api/meetings/{id}` | `DELETE` | Delete meeting and all associated data |
| `/api/meetings/{id}/process` | `POST` | Process/re-process transcript text for derived summaries & action items |
| `/api/meetings/{id}/chat` | `POST` | Ask meeting-scoped Q&A via Hugging Face AI |
| `/api/participants` | `GET` | List all workspace participants |
| `/api/topics` | `GET` | List unique meeting topics |

---

## How to Run Locally

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed
uvicorn app.main:app --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## Testing & Quality Assurance

- **Backend compilation**: `venv/bin/python -m compileall app`
- **Frontend linting**: `npm run lint`
- **Frontend build**: `npm run build`

---

## Assumptions & Placeholder Features

Features that are UI mockups / placeholders for scope compliance:
- **Live Meeting Bot / Webex / Zoom Auto-Join**: UI triggers a Coming Soon modal.
- **Real-Time Audio Capture / Microphone**: Audio transcription relies on pasted transcript processing or mock deterministic AI engine.
- **Third-Party Integrations**: Zoom, Google Meet, Salesforce, HubSpot CRM cards are UI placeholders.
- **User Authentication**: Default user session (`Nitin Biswas`) runs in unauthenticated mode for demonstration simplicity.
