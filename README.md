# Fireflies.ai Clone — Meeting Notes & Transcription Platform

A fullstack meeting intelligence and transcription web application inspired by Fireflies.ai, built as an SDE Fullstack Assignment. The platform recreates Fireflies' core post-meeting workflows including an interactive transcript player, seeded and processed meeting summaries, topic chapter outlines, action item tracking, global multi-field search, meeting CRUD operations, and a meeting-scoped AI chatbot.

---

## Live Demo & Deliverables

- **Live Web Application**: [https://fireflies-ai-clone-seven.vercel.app](https://fireflies-ai-clone-seven.vercel.app)
- **Production Backend API**: [https://fireflies-backend-6rj8.onrender.com](https://fireflies-backend-6rj8.onrender.com)
- **GitHub Repository**: [https://github.com/Nitinbiswas1/fireflies.ai-clone](https://github.com/Nitinbiswas1/fireflies.ai-clone)

---

## Assignment Coverage

| Requirement | Implementation Details | Status |
| :--- | :--- | :--- |
| **1. Meetings Library / Dashboard** | Searchable notebook grid with title, date, duration, participant avatars, date/participant/topic filters, recency sorting, and meeting CRUD. | ✅ Complete |
| **2. Meeting Detail & Interactive Transcript** | Dual-panel layout featuring an audio/media player, synchronized transcript timeline, speaker badges, timestamps, line-click seeking, and keyword transcript search. | ✅ Complete |
| **3. AI Summary & Notes** | Overview summary, bulleted key decision points, topic chapter outlines, and action items assigned to participants with due dates. | ✅ Complete |
| **4. Meeting Management / CRUD** | Full REST API & UI for creating meetings (with or without transcript input), updating metadata & participant rosters, processing transcripts, and deleting meetings. | ✅ Complete |
| **5. Fireflies-Inspired UI/UX** | Dark/Light theme toggle, persistent sidebar navigation, header search bar, modal dialogs, slide-over panels, and toast notifications. | ✅ Complete |

---

## Features

### Meetings Library / Dashboard
- **Meeting List & Notebook View**: Displays meetings as structured cards showing title, meeting date, formatted duration, participant avatars, and action summaries.
- **Multi-Parametric Filtering**: Filter meetings by participant ID, topic tags, or case-insensitive title search queries.
- **Flexible Sorting**: Sort meetings by recency (`recent` descending) or oldest (`oldest` ascending).
- **Navigation & Workspace Sections**: Sidebar shortcuts for Home, Meetings, Tasks, Channels, People, and Settings.

### Meeting Detail & Interactive Transcript
- **Dual-Panel Workspace Layout**: Left panel holds media player controls, quick stats, AI summaries, topic outline chapters, action items, and Ask AI chat. Right panel houses the scrollable interactive transcript.
- **Synchronized Audio / Player Seeking**: Clicking any transcript segment seeks the media player directly to that segment's exact timestamp (`start_time`). Conversely, as audio plays, the active segment is automatically highlighted and scrolled into view.
- **Transcript Search & Highlight**: Search bar inside the transcript panel filters segments in real-time, displaying matching count and highlighting matched text strings.

### AI Summary & Notes
-**Overview Summary**: Meeting summaries containing key discussion points, decisions, and relevant context.
- **Key Decision Points**: Bulleted list of critical takeaways extracted from the meeting discussion.
- **Topic Chapter Outline**: Chronologically ordered meeting chapters mapped to exact transcript segment start times.
- **Action Item Tracking**: Action items with title, detailed description, assigned participant avatar, due date, and interactive completion checkbox.

### Meeting Management / CRUD
- **Create Meetings**: Create new meetings with title, description, date, duration, and participant roster. Supports optional immediate transcript processing.
- **Edit Meetings**: Update meeting metadata, adjust duration, or change assigned participants dynamically.
- **Delete Meetings**: Permanently delete meetings with cascade deletion across transcripts, summaries, topics, and action items.
- **Add & Process Transcripts**: Upload or paste transcript text into empty or existing meetings to generate transcript segments, summary overview, key points, topics, and action items.

### Fireflies-Inspired UI / UX
- **Fireflies-Inspired Visual Design**: Clean workspace layout, modern typography, subtle animations, cards, and a blue/purple accent hierarchy inspired by the reference application.
- **Toast Notification System**: Instant feedback on meeting creation, updates, action item completions, and error states.

---

## Bonus Features

- ⭐ **Dark Mode Support**: Full Light / Dark theme system with auto-detection of user OS preferences, persistent `localStorage` storage, and instant toggle without page reload.
- ⭐ **Global Multi-Field Search**: Modal search bar querying across meeting titles, descriptions, participant names, transcript text segments, overview summaries, key decision points, and action items.
- ⭐ **Multi-Format Export**: Download meeting transcripts (`.txt`), summary overviews (`.txt`), or complete structured Markdown meeting notes (`.md`) with a single click.
- ⭐ **LLM-Powered "Ask AI" Chatbot**: Meeting-scoped interactive Q&A assistant built on Hugging Face Inference Providers (`Qwen/Qwen2.5-7B-Instruct-1M`). Answers user questions directly using the meeting's full transcript and summary context.

---

## Mocked / Placeholder Features

Per assignment scope guidelines, the following features are intentionally implemented as UI mockups / placeholders:
- **Live Meeting Bot & Auto-Join**: Integrations with Zoom, Google Meet, and Webex display an interactive "Coming Soon" modal.
- **Real-Time Speech-to-Text**: Audio transcription relies on pre-seeded, pasted, or mock-processed transcript text rather than live microphone WebSocket streaming.
- **Third-Party CRM Cards**: Integrations for Salesforce, HubSpot, and Slack are presented as UI cards with "Coming Soon" status indicators.
- **User Authentication**: Default user session (`Nitin Biswas`) operates in unauthenticated demonstration mode for simplicity.

---

## Architecture

```
                 ┌───────────────────────────────────────────────────┐
                 │                Next.js 16 Frontend                │
                 │        (React 19 + Tailwind v4 + Lucide)          │
                 └─────────────────────────┬─────────────────────────┘
                                           │ REST API (JSON)
                 ┌─────────────────────────▼─────────────────────────┐
                 │                  FastAPI Backend                  │
                 │         (Routers / Schemas / Services)            │
                 └──────────┬─────────────────────────────┬──────────┘
                            │                             │
          SQLAlchemy 2.x ORM │                             │ Server-Side HTTP
   ┌────────────────────────▼────────┐           ┌────────▼────────────────┐
   │         SQLite Database         │           │ Hugging Face Inference  │
   │  - meetings, participants       │           │   Qwen/Qwen2.5-7B      │
   │  - transcripts, summaries       │           │   Meeting Q&A Chatbot   │
   │  - action_items, topics         │           └─────────────────────────┘
   └─────────────────────────────────┘
```

- **Frontend Architecture**: Built using Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4. Modular component structure (`components/meetings`, `components/transcript`, `components/chat`, `components/search`, `components/layout`) backed by a centralized API client (`lib/api.ts`).
- **Backend Architecture**: Built with FastAPI, Pydantic v2 schemas, and SQLAlchemy 2.0 ORM models. Decoupled into routers (`meetings.py`, `action_items.py`, `search.py`), models (`meeting.py`, `participant.py`, `transcript.py`, `summary.py`, `topic.py`, `action_item.py`), and services (`meeting_processor.py`, `summary_service.py`, `transcript_parser.py`, `meeting_chat.py`).
- **AI Chatbot Logic**: The server constructs a grounded prompt from the meeting's overview, key points, topics, and transcript segments, passing it to Hugging Face Inference Providers. No external vector database or embedding index is required.

---

## Tech Stack

### Frontend
- **Framework**: Next.js `16.3.0` (App Router)
- **Library**: React `19.2.8`
- **Language**: TypeScript `^5`
- **Styling**: Tailwind CSS `^4` (`@tailwindcss/postcss`)
- **Icons**: Lucide React `^1.31.0`

### Backend
- **Framework**: FastAPI `0.141.1`
- **Server**: Uvicorn `0.52.2`
- **ORM**: SQLAlchemy `2.0.52`
- **Database Migrations**: Alembic `1.19.1`
- **Data Validation**: Pydantic `2.13.4` & `pydantic-settings`
- **Environment Management**: python-dotenv `1.2.2`
- **AI Hub Integration**: `huggingface-hub` `1.27.0`
- **Database**: SQLite

---

## Database Schema

```
             ┌─────────────────────┐
             │       Meeting       │
             └──────────┬──────────┘
                        │
      ┌─────────────────┼──────────────────┬─────────────────┐
      │                 │                  │                 │
┌─────▼──────────┐ ┌────▼───────┐ ┌────────▼───────┐ ┌───────▼────────┐
│TranscriptSegment│ │  Summary   │ │     Topic     │ │  ActionItem    │
└────────────────┘ └────────────┘ └───────────────┘ └───────┬────────┘
                                                             │ (assignee)
                        ┌────────────────────┐               │
                        │ MeetingParticipant │               │
                        └─────────┬──────────┘               │
                                  │                          │
                        ┌─────────▼──────────┐               │
                        │    Participant     │◄──────────────┘
                        └────────────────────┘
```

### Models & Relationships
- **`Meeting`**: Primary table containing `id`, `title`, `description`, `meeting_date`, `duration_seconds`, `created_at`, `updated_at`.
- **`Participant`**: Contains `id`, `name`, `email`, `avatar_url`, `created_at`.
- **`MeetingParticipant`**: Association join table enforcing a `UniqueConstraint("meeting_id", "participant_id")`.
- **`TranscriptSegment`**: Foreign-keyed to `Meeting` and `Participant`, storing `sequence`, `start_time`, `end_time`, and spoken `text`.
- **`Summary`**: One-to-one relationship with `Meeting`, storing `overview` text and `key_points` as a JSON string array.
- **`Topic`**: Foreign-keyed to `Meeting`, storing chapter `name` and `start_time`.
- **`ActionItem`**: Foreign-keyed to `Meeting` and `Participant` (`assignee_id`), storing `title`, `description`, `due_date`, and `completed` status.

---

## API Overview

| Method | Endpoint Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning API status and version |
| `GET` | `/api/participants` | List all workspace participants ordered by name |
| `GET` | `/api/topics` | List all unique topic chapter names sorted alphabetically |
| `GET` | `/api/meetings` | List meetings with title search, participant filter, topic filter, recency sort, and pagination |
| `POST` | `/api/meetings` | Create a new meeting (supports optional immediate transcript processing) |
| `GET` | `/api/meetings/{id}` | Retrieve meeting details with participants and topics |
| `PATCH` | `/api/meetings/{id}` | Update meeting metadata and participant list |
| `DELETE` | `/api/meetings/{id}` | Permanently delete a meeting and all cascading child data |
| `GET` | `/api/meetings/{id}/transcript` | Get all ordered transcript segments for a meeting |
| `GET` | `/api/meetings/{id}/summary` | Get meeting overview summary and key decision points |
| `POST` | `/api/meetings/{id}/process` | Parse transcript text and generate automated summary, topics, and action items |
| `POST` | `/api/meetings/{id}/chat` | Ask meeting-scoped AI questions via Hugging Face Inference API |
| `GET` | `/api/meetings/{id}/actions` | List all action items for a specific meeting |
| `POST` | `/api/meetings/{id}/actions` | Create a new action item assigned to a participant |
| `PATCH` | `/api/actions/{action_id}` | Update action item title, description, assignee, due date, or completion status |
| `DELETE` | `/api/actions/{action_id}` | Delete an action item |
| `GET` | `/api/search` | Global multi-field search across titles, descriptions, participants, transcripts, summaries, and action items |

---

## Environment Variables / Security

### Backend (`backend/.env`)
```bash
DATABASE_URL=sqlite:///./meeting.db
CORS_ORIGINS=http://localhost:3000,https://fireflies-ai-clone-seven.vercel.app
HF_TOKEN=your_huggingface_token  # Optional: Server-side Hugging Face token for Ask AI
HF_MODEL=Qwen/Qwen2.5-7B-Instruct-1M
```

> 🔒 **Security Note**: `HF_TOKEN` is loaded strictly server-side inside FastAPI and is **never** exposed to the frontend or included in client-side Next.js bundles (`NEXT_PUBLIC_*`).

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Clone Repository
```bash
git clone https://github.com/Nitinbiswas1/fireflies.ai-clone.git
cd fireflies.ai-clone
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Database Setup & Seeding
```bash
# Run Alembic migrations to create all database tables
alembic upgrade head

# Populate database with seed data
python -m app.seed
```

### 4. Start Backend Server
```bash
uvicorn app.main:app --port 8000 --reload
```
Backend API will run at `http://localhost:8000`. API documentation is available at `http://localhost:8000/api/docs`.

### 5. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at `http://localhost:3000`.

---

## Database Setup & Seed Data

The application does **not** track or require a pre-built binary database file. A fresh database can be created using Alembic migrations (`alembic upgrade head`) and populated with demo data using `python -m app.seed`.

The seed script is **100% idempotent** and populates **5 realistic demo meetings** with full-duration transcripts, summaries, topics, and action items:

| Seeded Meeting Title | Duration | Segments | Transcript End Time | Topics | Action Items | Summary Overview |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Q3 Product Strategy Review** | 3720s (62 min) | 228 segments | 3720.0s (100%) | 16 topics | 4 items | ✅ Populated |
| **Engineering Sprint Planning — Sprint 42** | 2880s (48 min) | 174 segments | 2880.0s (100%) | 15 topics | 4 items | ✅ Populated |
| **Client Discovery: Meridian Financial** | 2700s (45 min) | 160 segments | 2700.0s (100%) | 15 topics | 4 items | ✅ Populated |
| **Marketing Campaign Planning: Q3 Launch** | 3240s (54 min) | 195 segments | 3240.0s (100%) | 16 topics | 5 items | ✅ Populated |
| **Weekly Leadership Sync — Week 31** | 2400s (40 min) | 144 segments | 2400.0s (100%) | 15 topics | 5 items | ✅ Populated |

---

## Testing & Quality Checks

All verification suites pass cleanly across both frontend and backend codebases:

```bash
# 1. Backend Python Syntax & Compilation Check
cd backend
venv/bin/python -m compileall app
# Result: PASS (0 errors across all app packages)

# 2. Frontend ESLint Check
cd frontend
npm run lint
# Result: PASS (0 errors, 0 warnings)

# 3. Frontend Next.js Production Build Test
cd frontend
npm run build
# Result: PASS (Production bundle compiled in ~0.5s)
```

---

## Deployment

- **Frontend Hosting**: Deployed on **Vercel** with automatic production builds connected to the GitHub `main` branch.
- **Backend Hosting**: Deployed on **Render** running FastAPI under Uvicorn.
- **Database**: SQLite database is used by the backend. Database tables are created through Alembic migrations and demo data is populated using the seed script.
- **AI Assistant**: Connected to **Hugging Face Inference Providers** via server-side API integration.

---

## Assumptions

- **Speech-to-Text Scope**: Real-time microphone audio capture and live speech-to-text models are outside assignment scope; meeting transcripts are seeded, pasted, or mock-processed.
- **Authentication**: Single demo workspace session operating under user profile `Nitin Biswas`.
- **Integrations**: Calendar and web conferencing platform auto-join bots are represented by UI status modals.

---

## Original Work

This project was independently implemented for the SDE Fullstack Assignment. AI development tools were used during implementation as permitted by the assignment, and the submitted code was reviewed and tested as part of the development process.

---

## Deliverables

- **Source Code Repository**: [https://github.com/Nitinbiswas1/fireflies.ai-clone](https://github.com/Nitinbiswas1/fireflies.ai-clone)
- **Live Interactive Web Application**: [https://fireflies-ai-clone-seven.vercel.app](https://fireflies-ai-clone-seven.vercel.app)
- **Production API Health Check**: [https://fireflies-backend-6rj8.onrender.com/api/health](https://fireflies-backend-6rj8.onrender.com/api/health)
