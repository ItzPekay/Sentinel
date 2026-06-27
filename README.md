# Sentinel

Real-time stroke detection built for a hackathon. Combines a Raspberry Pi camera, on-device AI, and a full-stack web app to catch three of the most common early stroke signals: slurred speech, facial asymmetry, and dangerously abnormal blood glucose.

## How it's put together

```
Raspberry Pi (port 8000)          Mac / Server (port 8001)           Browser (port 3000)
┌──────────────────────┐          ┌───────────────────────────────┐   ┌─────────────────────┐
│  Camera Module 3     │snapshots │  FastAPI backend               │   │  Next.js 14 app     │
│  /camera/snapshot ───┼─────────▶│  fetch_loop → latest_frame    │   │  Dashboard          │
│  /camera/view_stream─┼─────────▶│  /camera/stream (MJPEG proxy) │◀──│  Speech analysis    │
└──────────────────────┘          │  /predict (YOLOv8)            │   │  Camera view        │
                                  │  /speech (Whisper + librosa)  │   │  Blood sugar log    │
                                  │  /auth  (JWT + 2FA + OAuth)   │   │  History timeline   │
                                  │  Supabase (PostgreSQL)        │   └─────────────────────┘
                                  └───────────────────────────────┘
```

The Mac server is the hub. It pulls frames from the Pi on a 0.5s loop, runs YOLO inference on demand, transcribes speech with Whisper, and emails your emergency contact if something looks wrong.

## What it detects

**Speech** — You say "the sky is blue." Whisper transcribes it, and the backend scores the result two ways: word match against the reference phrase, and syllable rate from librosa. The final score is the worse of the two (not an average, so one bad signal is enough to flag). Below 50 is fine, 50–69 is a warning, 70+ triggers an alert.

**Camera** — A YOLOv8 model trained on facial asymmetry watches the Pi feed. If it sees a stroke label with ≥70% confidence, it emails your emergency contact with a report.

**Blood glucose** — Low glucose mimics stroke symptoms almost perfectly. The app runs a 10-range clinical assessment and flags anything below 70 mg/dL as a potential stroke mimic. Anything below 40 mg/dL calls for emergency services.

## Getting started

You'll need Python 3.11+, Node 18+, a Supabase project, and the `best.pt` YOLO model weights (not committed to the repo — ask for the file separately).

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your credentials
uvicorn app.main:app --reload --port 8001
```

Swagger docs at `http://localhost:8001/docs`.

The camera feed is optional — if the Pi isn't reachable the rest of the app still works. The `/predict` endpoint accepts an uploaded image too.

### Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### Database

Paste `backend/integrations/schema.sql` into the Supabase SQL editor. RLS is off — the anon key has full read/write. Tables: `users`, `otp_codes`, `stroke_history`, `voice_command_history`, `blood_sugar_record`, `speech_history`, `predictions`.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PI_BASE_URL` | Raspberry Pi camera URL, e.g. `http://10.0.0.209:8000` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key (or use `SUPABASE_SERVICE_ROLE_KEY`) |
| `JWT_SECRET` | 64-char hex string for signing JWTs |
| `JWT_EXPIRE_MINUTES` | Token lifetime (default 60) |
| `OAUTH_CLIENT_ID` | Google OAuth client ID |
| `OAUTH_SECRET` | Google OAuth client secret |
| `OAUTH_REDIRECT_URI` | OAuth callback — `http://localhost:8001/auth/google/callback` |
| `FRONTEND_URL` | Where to redirect after OAuth — `http://localhost:3000` |
| `APP_EMAIL` | Gmail sender address |
| `GOOGLE_APP_PASSWORD` | Gmail app password (not your account password) |
| `EMERGENCY_EMAIL` | Fallback alert address if no emergency contact is set |
| `ALLOWED_ORIGINS` | CORS origins, comma-separated (default `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Auth flow

1. Register → login → OTP arrives by email → verify OTP → full JWT
2. All API calls after that use `Authorization: Bearer <token>`
3. Google OAuth also works: `GET /auth/google` → Google → callback → JWT → dashboard

The 2FA step is real — the OTP is time-limited and single-use.

## Project layout

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, fetch_loop, CORS, error handlers
│   ├── state.py                # Shared latest_frame bytes
│   ├── core/security.py        # Password hashing, JWT sign/verify
│   ├── routers/                # auth, speech, camera, predict, usage_history
│   └── services/
│       ├── config_service.py   # Env vars, Supabase client, thresholds
│       ├── database_service.py # All Supabase queries
│       ├── speech_service.py   # Whisper + librosa pipeline
│       ├── stroke_model.py     # YOLOv8 wrapper
│       ├── camera_service.py   # Pi proxy
│       ├── contact_service.py  # Gmail SMTP alerts
│       └── extra_check_service.py  # Blood glucose ranges
├── ml/best.pt                  # YOLOv8 weights (not in repo)
├── integrations/schema.sql     # Supabase schema
├── tests/
└── requirements.txt

frontend/
├── app/
│   ├── page.tsx                # Landing page
│   ├── auth/                   # login, register, OTP verify, OAuth callback
│   └── (app)/                  # Authenticated routes (dashboard, speech, camera, etc.)
├── components/
│   ├── auth/                   # LoginForm, RegisterForm, GoogleButton
│   ├── layout/                 # Sidebar (desktop), BottomNav (mobile)
│   └── shared/                 # RiskBadge, BlobBackground, LoadingSpinner
├── lib/
│   ├── api.ts                  # Typed backend client
│   ├── types.ts                # TypeScript interfaces
│   └── hooks/                  # useAuth, useAudioRecorder
└── middleware.ts               # Route protection
```
