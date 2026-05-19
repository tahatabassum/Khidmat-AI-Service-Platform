# 🇵🇰 Khidmat — AI Service Orchestrator for Pakistan

**خدمت** — _Pakistan's First AI-Powered Informal Economy Platform_

**Google Antigravity Hackathon — Challenge 2: Informal Economy Platform**

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%20AI-blue?style=for-the-badge&logo=google)]()
[![React Native](https://img.shields.io/badge/React%20Native-Expo-black?style=for-the-badge&logo=expo)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)]()
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)]()
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run-4285F4?style=for-the-badge&logo=googlecloud)]()

> [!IMPORTANT]
> ### 🚀 Live Production Deployments
> * **Cloud Backend**: [https://khidmat-backend-983433004333.us-central1.run.app](https://khidmat-backend-983433004333.us-central1.run.app)
> * **Installable Android App**: [Download & Install Khidmat APK](https://expo.dev/accounts/tahatabassum/projects/KhidmatApp/builds/4da155d9-140b-4dea-84a5-82b69d41f946)

---

## 📌 Problem Statement

Pakistan's informal economy — **plumbers, electricians, tutors, AC technicians, beauticians** — operates through word-of-mouth, WhatsApp, and fragmented local directories. This causes:

- ❌ Missed opportunities for skilled workers
- ❌ Poor customer-to-provider matching
- ❌ Unpredictable & non-transparent pricing
- ❌ No follow-up, reputation, or dispute mechanism

**Khidmat solves this** with a full **agentic AI system** that automates the entire service lifecycle — from multilingual natural language request understanding to provider matching, dynamic pricing, slot booking, automated follow-up, and AI-mediated dispute resolution.

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
│                 FASTAPI BACKEND (:8080)                  │
│  Deployed on Google Cloud Run                           │
│  /providers │ /bookings │ /disputes │ /traces │ /stats   │
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
│  LLM: Gemini 2.0 Flash via Google AI SDK                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite DATABASE (Auto-seeded)              │
│  providers (395+) │ bookings │ disputes │ agent_traces   │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 The 6-Agent Agentic AI Pipeline

Khidmat runs a **sequential multi-agent pipeline** where each AI agent makes independent decisions and passes structured context to the next:

### Agent 1: Intent Parser 🧠
- **Input:** Raw user message (Urdu, Roman Urdu, English, or code-switched)
- **LLM:** Gemini 2.0 Flash
- **Extracts:** service_type, location, time_preference, urgency, budget_sensitivity, job_complexity, language_detected, confidence_score
- **Decision:** If confidence < 0.7, asks clarification question instead of proceeding.
- **Urdu Translation Support:** Recognizes local terms (e.g. *nalkay* → Plumber, *bijli* → Electrician).

### Agent 2: Provider Discovery 🔍
- **Input:** Parsed intent (service_type + location)
- **Logic:** SQL query with fuzzy service-type normalization.
- **Fallback:** If location match returns 0 results, falls back to all providers of that service type.

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
- **Output:** Ranked list with match_score + one reasoning sentence per provider.

### Agent 4: Pricing Engine 💰
- **Input:** Provider details + parsed intent
- **LLM:** Gemini 2.0 Flash
- **Dynamic pricing factors:**
  - `base_rate` = provider.price_per_hour
  - `+ distance_cost` = PKR 50 per km over 3km
  - `+ urgency_surcharge` = +20% if urgency=urgent
  - `× complexity_multiplier` = 1.0 basic / 1.3 intermediate / 1.6 complex
  - `+ demand_surcharge` = +10% if all similar providers busy
- **Output:** quoted_price + full breakdown + fairness_score.

### Agent 5: Booking Engine 📅
- **Input:** Selected provider ID + slot + user info
- **LLM:** Gemini 2.0 Flash (for Hinglish confirmation message)
- **Logic:** Slot conflict detection, booking reference generation (SVC-YYYY-XXXX), receipt creation.

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
- **Output:** resolution, compensation amount, provider_flag (warning/blacklist), escalation_decision.

### Trace Logger 📊
- Every agent step is logged with: agent name, input, output, execution time (ms).
- Visible directly in the mobile app's **Agent Trace** screen.

---

## 📱 Mobile App — Screens

| Screen | Purpose |
|--------|---------|
| **HomeScreen** | Categories, stats bar (63 Pakistani Cities), AI search input, quick chips |
| **ResultsScreen** | Animated AI pipeline loading, search intent card, ranked provider cards, AI recommendation |
| **BookingScreen** | Provider summary, booking form (name, phone, slot), price breakdown |
| **ConfirmationScreen** | Success animation, booking receipt, notification timeline, Hinglish AI message |
| **MyBookingsScreen** | Auto-loads bookings by phone, status badges, dispute button |
| **AgentTraceScreen** | Visual 6-step agent timeline with timing, export trace to clipboard |
| **DisputeScreen** | Report no-show/quality/price disputes, AI resolution |
| **ProviderRegisterScreen** | Service worker self-registration form with service type, city (63 supported), skill level chips |
| **ProfileScreen** | User profile, stats, menu links (FAQs under Help & Support, Version info under About Khidmat) |

---

## 🛠️ Tech Stack

| Technology | Category | Purpose |
|------------|----------|---------|
| **Gemini 2.0 Flash** | LLM | Powers all 6 agent reasoning stages |
| **FastAPI + Gunicorn** | Backend | REST API server, production containerised |
| **SQLite** | Database | Local development/Demo database |
| **React Native + Expo** | Mobile App | Cross-platform app (Android/iOS/Web) |
| **TypeScript** | Language | Type-safe frontend development |
| **Docker** | Containerization | Standardized Cloud Run deployments |

---

## 🚀 Setup & Launch Instructions

### ⚡ Quick Start (Windows — One-Click Launch)
To run the entire stack (FastAPI Backend + SQLite + Expo Mobile Client) locally with a single command:
```powershell
# Double-click start.bat in the root folder, or run in terminal:
.\start.bat
```
This batch script automatically detects your network LAN IP, configures the Expo environment variables for physical device testing, launches the backend, and opens the Metro Bundler with a QR code!

---

### 🌐 Cloud Deployment (Backend to Google Cloud Run)
The backend is packaged with a multi-stage Dockerfile and deployed to Google Cloud Run:
```bash
gcloud run deploy khidmat-backend --source . --port 8080 --allow-unauthenticated --region us-central1 --set-env-vars="GEMINI_API_KEY=your_gemini_api_key"
```
On first boot, the Cloud Run backend **automatically seeds 395 mock Pakistani service providers** across major cities to guarantee data richness out-of-the-box.

---

### 📱 Mobile App Compilation (EAS Build)
The frontend uses Expo Application Services (EAS) to compile the APK:
```bash
cd KhidmatApp
eas build -p android --profile preview
```

---

## 👥 Team Khidmat

| Role | Responsibility |
|------|---------------|
| **Agent Architect** | All 6 AI agents, orchestrator, Gemini prompts, trace logging |
| **Backend Lead** | FastAPI server, SQLite database, 395 mock providers, API endpoints |
| **Mobile App Lead** | React Native Expo app, UI/UX, design system |
| **Integration Lead** | End-to-end testing, documentation, Google Cloud Run deployment |

---

<div align="center">

**Built with ❤️ for Pakistan's informal economy workers**

_Khidmat — Har fix mein trust_ 🇵🇰

</div>
