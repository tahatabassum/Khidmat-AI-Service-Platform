# 🇵🇰 Khidmat — AI Service Orchestrator for Pakistan

**خدمت** — _Pakistan's First AI-Powered Informal Economy Platform_

**Google Antigravity Hackathon — Challenge 2: Informal Economy Platform**

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%20AI-blue?style=for-the-badge&logo=google)]()
[![React Native](https://img.shields.io/badge/React%20Native-Expo-black?style=for-the-badge&logo=expo)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)]()
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)]()

> [!TIP]
> ### ⚡ Instant Launch (Windows)
> You can launch the entire stack (FastAPI Backend + SQLite + Expo Mobile App) automatically with a single command! Just double-click `start.bat` in the root folder, or run this in your terminal:
> ```powershell
> .\start.bat
> ```
> This script automatically detects your network LAN IP, configures the Expo environment variables for physical device testing, launches the backend, and opens Expo!

---

## 📌 Problem Statement

Pakistan's informal economy — **plumbers, electricians, tutors, AC technicians, beauticians** — operates through WhatsApp, phone calls, and referrals. This causes:

- ❌ Missed opportunities for skilled workers
- ❌ Poor customer-to-provider matching
- ❌ Unpredictable & non-transparent pricing
- ❌ No follow-up, reputation, or dispute mechanism

**Khidmat solves this** with a full **agentic AI system** that automates the entire service lifecycle — from multilingual request understanding to booking, pricing, follow-up, and dispute resolution.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                     │
│  Home │ Results │ Booking │ Confirmation │ Profile       │
│  MyBookings │ AgentTrace │ Dispute │ ProviderRegister    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (Axios)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 FASTAPI BACKEND (:8000)                  │
│  /providers │ /bookings │ /disputes │ /traces │ /stats   │
│  /agents/orchestrate │ /pricing/quote │ /demo/reset      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           AGENTIC AI ORCHESTRATION LAYER                │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Intent   │→ │ Provider │→ │ Pricing  │              │
│  │ Parser   │  │ Matcher  │  │ Engine   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│       ↓             ↓             ↓                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Booking  │→ │ Follow-up│→ │ Dispute  │              │
│  │ Engine   │  │ Agent    │  │ Agent    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  LLM: Gemini 2.0 Flash via OpenRouter API               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite DATABASE                             │
│  providers (40+) │ bookings │ disputes │ agent_traces    │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 The 6-Agent Agentic AI Pipeline

This is **NOT** a simple API call. Khidmat runs a **sequential multi-agent pipeline** where each AI agent makes independent decisions and passes context to the next:

### Agent 1: Intent Parser 🧠
- **Input:** Raw user message (Urdu, Roman Urdu, English, or code-switched)
- **LLM:** Gemini 2.0 Flash
- **Extracts:** service_type, location, time_preference, urgency, budget_sensitivity, job_complexity, language_detected, confidence_score
- **Decision:** If confidence < 0.7, asks clarification question instead of proceeding
- **Smart Fallback:** Keyword extraction from user message supports Urdu terms (nalkay → Plumber, bijli → Electrician)

### Agent 2: Provider Discovery 🔍
- **Input:** Parsed intent (service_type + location)
- **Logic:** SQL query with fuzzy service-type normalization (Plumbing → Plumber, AC Repair → AC Technician)
- **Fallback:** If location match returns 0 results, falls back to all providers of that service type

### Agent 3: Provider Matcher 🏅
- **Input:** Parsed intent + full provider list
- **LLM:** Gemini 2.0 Flash
- **Ranks by 6+ factors:**
  1. Distance / travel time
  2. Availability & time slot match
  3. Rating + review count
  4. Reliability / on-time score
  5. Skill specialization vs job complexity
  6. Price vs budget sensitivity
  7. Cancellation rate (lower = better)
- **Output:** Ranked list with match_score + one reasoning sentence per provider

### Agent 4: Pricing Engine 💰
- **Input:** Provider details + parsed intent
- **LLM:** Gemini 2.0 Flash
- **Dynamic pricing formula:**
  - `base_rate` = provider.price_per_hour
  - `+ distance_cost` = PKR 50 per km over 3km
  - `+ urgency_surcharge` = +20% if urgency=urgent
  - `× complexity_multiplier` = 1.0 basic / 1.3 intermediate / 1.6 complex
  - `+ demand_surcharge` = +10% if all similar providers busy
  - `- loyalty_discount` = -5% if user has 3+ previous bookings
- **Output:** quoted_price + full breakdown + budget_alternative + fairness_score

### Agent 5: Booking Engine 📅
- **Input:** Selected provider ID + slot + user info
- **LLM:** Gemini 2.0 Flash (for Hinglish confirmation message)
- **Logic:** Slot conflict detection, booking reference generation (SVC-YYYY-XXXX), receipt creation
- **Methods:** `book()`, `cancel()`, `reschedule()`

### Agent 6: Follow-up Agent 🔔
- **Input:** Confirmed booking
- **Schedules 5 notifications:**
  1. ✅ Confirmation — Immediate
  2. ⏰ Reminder — 1 hour before
  3. 🚗 En-route — 15 min before ("Provider is on the way!")
  4. ✅ Completion — After service (feedback request)
  5. ⭐ Reputation Update — After feedback
- **Logs:** Saved to `/agents/followup_logs/{booking_ref}.json`

### Agent 7: Dispute Agent ⚖️
- **Input:** booking_ref + dispute_type + description
- **LLM:** Gemini 2.0 Flash
- **Dispute types:** no_show, quality_complaint, price_disagreement, overrun
- **Output:** resolution, compensation amount, provider_flag (warning/blacklist), escalation_decision

### Trace Logger 📊
- Every agent step is logged with: agent name, input, output, execution time (ms)
- Full trace saved to `/agents/traces/{booking_ref}_{timestamp}.json` + SQLite
- Visible in the mobile app's Agent Trace screen

---

## 📱 Mobile App — 9 Screens

| Screen | Purpose |
|--------|---------|
| **HomeScreen** | Categories, stats bar, AI search input, quick chips, provider registration CTA |
| **ResultsScreen** | Animated AI pipeline loading, search intent card, ranked provider cards with map, AI recommendation |
| **BookingScreen** | Provider summary, booking form (name, phone, slot), price breakdown |
| **ConfirmationScreen** | Success animation, booking receipt, notification timeline, Hinglish AI message |
| **MyBookingsScreen** | Auto-loads bookings by phone, status badges, dispute button |
| **AgentTraceScreen** | Visual 6-step agent timeline with timing, export trace to clipboard |
| **DisputeScreen** | Report no-show/quality/price disputes, AI resolution |
| **ProviderRegisterScreen** | Service worker self-registration form with service type, city, skill level chips |
| **ProfileScreen** | User profile, stats, menu links to bookings/registration/traces |

---

## 🛠️ Tech Stack

| Technology | Category | Purpose | Cost |
|------------|----------|---------|------|
| **Gemini 2.0 Flash** | LLM | Powers all 6 agent reasoning: NLU, matching, pricing, disputes | OpenRouter credits |
| **FastAPI + Uvicorn** | Backend | REST API server, all endpoints, orchestrator bridge | FREE |
| **SQLite** | Database | Providers (40+), bookings, traces, feedback, disputes | FREE |
| **React Native + Expo** | Mobile App | Cross-platform app (Android/iOS/Web) | FREE |
| **TypeScript** | Language | Type-safe frontend development | FREE |
| **Python 3.10+** | Language | Backend + agent logic | FREE |
| **httpx** | HTTP Client | Agent-to-backend communication | FREE |
| **Axios** | HTTP Client | Frontend-to-backend communication (120s timeout) | FREE |
| **SQLAlchemy** | ORM | Database models and queries | FREE |
| **Pydantic** | Validation | Request/response schema validation | FREE |
| **python-dotenv** | Config | Environment variable management | FREE |

---

## 🤖 How Antigravity is Used

This entire project was architected, developed, and debugged entirely using **Google Antigravity**—a powerful agentic AI coding assistant. Antigravity was utilized for the following core tasks:

1. **Architecture Design:** Translating the PRD into a concrete, 6-stage sequential agent pipeline and structuring the React Native + FastAPI stack.
2. **Code Generation:** Writing the entire backend logic (SQLAlchemy models, FastAPI routers), the multi-agent Orchestrator (Gemini 2.0 integration, Pydantic parsing), and the Expo mobile frontend.
3. **Environment Setup & Bug Fixing:** Automatically setting up the local `venv`, running Metro bundlers, clearing caches, and resolving complex cross-platform UI issues (e.g., polyfilling `react-native-maps` for web).
4. **Data Seeding:** Writing python scripts to generate 400+ realistic, mock Pakistani service providers with Urdu/English metadata.
5. **System Orchestration:** Writing PowerShell and Batch scripts (`start.bat`) to automate the launch sequence of multiple micro-servers and dynamically inject LAN IPs for mobile testing.

---

## 📊 Database Schema

### `providers` — 40+ Mock Pakistani Providers
```
id | name | owner_name | service_type | area | city | rating | total_reviews |
on_time_score | cancellation_rate | experience_years | skill_level |
price_per_hour | distance_km | available | phone | slots (JSON) | created_at
```

### `bookings`
```
id | booking_ref (SVC-YYYY-XXXX) | provider_id (FK) | user_name | user_phone |
service_type | location | slot | status | quoted_price | actual_price |
notes | created_at | confirmed_at
```

### `disputes`
```
id | booking_ref | dispute_type | description | status | resolution |
compensation | provider_flag | created_at
```

### `agent_traces`
```
id | booking_ref | trace_data (JSON) | created_at
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agents/orchestrate` | Main entry — runs full 6-agent pipeline |
| `GET` | `/providers/search?service_type=X&location=Y` | Search providers with fuzzy matching |
| `GET` | `/providers/` | List all providers with filters |
| `GET` | `/providers/{id}` | Single provider details |
| `POST` | `/providers/register` | Provider self-registration |
| `GET` | `/providers/services/list` | All unique service types |
| `POST` | `/bookings/` | Create booking (slot conflict check) |
| `GET` | `/bookings/{ref}` | Booking details by reference |
| `GET` | `/bookings/user/{phone}` | All bookings for a phone number |
| `DELETE` | `/bookings/{ref}` | Cancel booking |
| `POST` | `/disputes/` | Report a dispute |
| `POST` | `/pricing/quote` | Generate dynamic price quote |
| `POST` | `/traces` | Save agent trace |
| `GET` | `/traces/{booking_ref}` | Retrieve full agent trace |
| `GET` | `/stats` | Dashboard stats (providers, cities, avg rating) |
| `GET` | `/health` | Health check (DB status, counts) |
| `GET` | `/demo/reset` | Reset bookings/traces for demo |

---

## 📁 Project Structure

```
Khidmat/
├── agents/                          # AI Orchestration Layer
│   ├── orchestrator.py              # Master Orchestrator (10-step pipeline)
│   ├── intent_parser/
│   │   ├── agent.py                 # IntentParserAgent — Multilingual NLU
│   │   └── prompts.py               # System prompt for Gemini
│   ├── provider_matcher/
│   │   ├── agent.py                 # ProviderMatcherAgent — 6-factor ranking
│   │   └── prompts.py
│   ├── pricing_engine/
│   │   ├── agent.py                 # PricingEngineAgent — Dynamic quotes
│   │   └── prompts.py
│   ├── booking_engine/
│   │   ├── agent.py                 # BookingEngineAgent — Slot management
│   │   └── prompts.py
│   ├── followup_agent/
│   │   └── agent.py                 # FollowupAgent — 5 notifications
│   ├── dispute_agent/
│   │   ├── agent.py                 # DisputeAgent — Resolution AI
│   │   └── prompts.py
│   ├── shared/
│   │   └── gemini_client.py         # OpenRouter API client (retry + logging)
│   ├── traces/                      # Agent trace JSON exports
│   ├── followup_logs/               # Notification logs
│   ├── test_stress.py               # 5 stress-test scenarios
│   ├── .env                         # OPENROUTER_API_KEY
│   └── requirements.txt
│
├── backend/                         # FastAPI REST Backend
│   ├── main.py                      # App entry, CORS, routers
│   ├── database.py                  # SQLite + SQLAlchemy setup
│   ├── models.py                    # ORM models (Provider, Booking, Dispute, AgentTrace)
│   ├── schemas.py                   # Pydantic schemas + ProviderRegister
│   ├── routers/
│   │   ├── providers.py             # Provider CRUD + fuzzy search + registration
│   │   ├── bookings.py              # Booking CRUD + conflict check
│   │   ├── disputes.py              # Dispute management
│   │   ├── pricing.py               # Dynamic pricing endpoint
│   │   ├── agents.py                # /agents/orchestrate bridge
│   │   └── traces.py                # Agent trace storage
│   ├── data/
│   │   └── seed_providers.py        # Seeds 40 mock Pakistani providers
│   ├── khidmat.db                   # SQLite database file
│   └── requirements.txt
│
├── KhidmatApp/                      # React Native Expo Mobile App
│   ├── App.tsx                      # Navigation stack (9 screens)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx       # Main screen with categories + AI search
│   │   │   ├── ResultsScreen.tsx    # Animated loading + provider results
│   │   │   ├── BookingScreen.tsx    # Booking form
│   │   │   ├── ConfirmationScreen.tsx # Receipt + notification timeline
│   │   │   ├── MyBookingsScreen.tsx # Booking history
│   │   │   ├── AgentTraceScreen.tsx # AI decision trace viewer
│   │   │   ├── DisputeScreen.tsx    # Dispute reporting
│   │   │   ├── ProfileScreen.tsx    # User profile
│   │   │   └── ProviderRegisterScreen.tsx # Provider signup
│   │   ├── components/
│   │   │   └── ProviderCard.tsx     # Provider card with map + AI reasoning
│   │   ├── services/
│   │   │   └── api.ts              # Axios client (120s timeout)
│   │   ├── constants/
│   │   │   └── colors.ts           # Pakistan Green design system
│   │   └── types/
│   │       └── index.ts            # TypeScript interfaces
│   └── package.json
│
├── Khidmat_PRD_Hackathon.pdf        # Full Product Requirements Document
└── README.md                        # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn
- Expo Go app on phone (for physical mobile testing)

---

### ⚡ Quick Start (Windows — One-Click Launch)

To run the entire stack (FastAPI Backend + SQLite Database + Expo Mobile Client) with a single command, you can use the pre-configured launcher:

```powershell
# Double-click start.bat in the root folder, or run in terminal:
.\start.bat
```

This batch script will:
1. Detect your **LAN IP Address** automatically.
2. Configure Expo's API endpoint `EXPO_PUBLIC_API_URL` so physical devices on the same Wi-Fi can talk to your PC's local server.
3. Start the backend Uvicorn server in a separate window.
4. Launch the Expo bundler in a separate window.
5. Provide a QR code in the terminal to scan with the **Expo Go** app!

---

### 🛠️ Manual Setup Step-by-Step

If you are on macOS/Linux or prefer manual execution, follow these steps:

#### 1. Setup Backend
```bash
cd backend
python -m venv venv
venv/Scripts/activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

#### 2. Seed Database (first time only)
```bash
python data/seed_providers.py
```

#### 3. Start Backend
```bash
venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. Setup & Start Mobile App
```bash
cd ../KhidmatApp
npm install
npx expo start --lan
```
Scan the QR code with your Expo Go app.

#### 5. Update API URL for Phone (If not using start.bat)
Create or update `KhidmatApp/.env`:
```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:8000
```
*(Replace `YOUR_PC_LAN_IP` with your computer's local IP address, e.g. `http://192.168.10.2:8000`)*

---

## 📡 Data Flow: User Request → Confirmed Booking

```
Step 1:  User types "Mujhe AC technician chahiye G-13 mein kal subah"
Step 2:  POST /agents/orchestrate → FastAPI → Master Orchestrator
Step 3:  Agent 1 (Intent Parser) → service=AC Technician, location=G-13, urgency=normal
Step 4:  Agent 2 (Provider Discovery) → GET /providers/search → 8 providers found
Step 5:  Agent 3 (Provider Matcher) → Ranks by 6+ factors → Top 3 with reasoning
Step 6:  Agent 4 (Pricing Engine) → Dynamic quote with breakdown for each
Step 7:  Mobile shows results + reasoning + price → User selects provider
Step 8:  Agent 5 (Booking Engine) → Checks slot → Confirms → Writes to DB
Step 9:  Agent 6 (Follow-up) → Schedules 5 notifications
Step 10: Full agent trace saved to JSON + DB → Visible in app
```

---

## 🧪 Robustness & Edge Cases

| Scenario | Input | Expected Behavior |
|----------|-------|-------------------|
| No providers available | "Plumber G-100" (fake area) | Helpful message + suggestion |
| Ambiguous input | "kuch chahiye" | confidence < 0.7 → clarification |
| Misspelled Urdu | "AC wala bhejo jldi" | Intent Parser handles it |
| Double booking | Same slot, same provider | Slot conflict → suggest alternatives |
| Post-service dispute | Quality complaint | AI resolution + compensation |
| API failure | OpenRouter 504/429 | Smart fallback with keyword extraction |

---

## 💰 Cost Analysis

| Operation | Cost per Call | Est. per Booking |
|-----------|-------------|------------------|
| Intent Parse | ~$0.0001 | $0.0001 |
| Provider Match | ~$0.0002 | $0.0002 |
| Pricing Quote (×3) | ~$0.0001 each | $0.0003 |
| Booking Confirm | ~$0.0001 | $0.0001 |
| **Total per booking** | | **~$0.0007** |

**Scaling estimate:** 1,000 bookings/day = ~$0.70/day. 10,000 bookings/day = ~$7/day.

---

## 🆚 Baseline Comparison: Agentic vs Non-Agentic

| Feature | Non-Agentic (Simple App) | Khidmat (Agentic AI) |
|---------|--------------------------|----------------------|
| Search | Keyword match | Multilingual NLU with confidence |
| Matching | Distance only | 6+ factor AI ranking with reasoning |
| Pricing | Fixed rate | Dynamic with urgency/demand/loyalty |
| Booking | Basic CRUD | AI confirmation + conflict resolution |
| Follow-up | None | 5 automated notification types |
| Disputes | Manual | AI-powered resolution + compensation |
| Transparency | None | Full agent trace visible to user |

---

## 🔐 Privacy Note

- **No real personal data** is used. All provider names, phone numbers, and addresses are **mock/generated data**.
- CNIC verification is **not implemented** — would be required for production.
- All data is stored locally in SQLite — no cloud data transmission except LLM API calls.

---

## ⚠️ Limitations & Assumptions

1. **Mock Data:** 40 providers with randomly generated ratings, prices, and locations
2. **Simulated Notifications:** Follow-up notifications are logged to JSON, not sent via SMS/push
3. **No Real Maps:** Provider distance_km values are randomly generated, not GPS-calculated
4. **No Real-time Tracking:** No inDrive-style worker GPS tracking
5. **No Provider App:** Providers cannot accept/reject bookings in real-time
6. **API Latency:** Multi-agent pipeline takes 15-30 seconds due to sequential LLM calls
7. **OpenRouter Rate Limits:** May hit 429 errors under heavy usage; fallbacks handle this gracefully

---

## 👥 Team Khidmat

| Role | Responsibility |
|------|---------------|
| **Agent Architect** | All 6 AI agents, orchestrator, Gemini prompts, trace logging |
| **Backend Lead** | FastAPI server, SQLite database, 40+ mock providers, API endpoints |
| **Mobile App Lead** | React Native Expo app (9 screens), UI/UX, design system |
| **Integration Lead** | End-to-end testing, documentation, demo video, submission |

---

## 📜 License

This project was built for the **Google Antigravity Hackathon** by **Team Khidmat** via **InnoCollab.pk**.

---

<div align="center">

**Built with ❤️ for Pakistan's informal economy workers**

_Khidmat — Har fix mein trust_ 🇵🇰

</div>
