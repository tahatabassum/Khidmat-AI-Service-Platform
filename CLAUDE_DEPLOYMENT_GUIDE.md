# Khidmat Project — Complete Knowledge & Deployment Guide

This document contains a complete technical dump of the Khidmat AI Service Orchestrator project. It is intended to be provided to an AI assistant (like Claude) or used directly by you to understand the full context of the application for further development, maintenance, or deployment to production.

---

## 1. Project Overview & Architecture
Khidmat is a Pakistan-focused informal economy platform that connects users with blue-collar workers (plumbers, electricians, tutors, etc.) using a fully autonomous **6-Agent AI Orchestrator**. 

The system has three distinct tiers:
1. **Frontend**: React Native app built with Expo and TypeScript.
2. **Backend API**: Python FastAPI server acting as the REST layer.
3. **AI Pipeline**: Sequential multi-agent logic powered by Gemini 2.0 Flash (via OpenRouter API or Google AI SDK).
4. **Database**: SQLite (local dev), interacting via SQLAlchemy ORM.

---

## 2. Directory Structure & Key Files

### `/backend`
- `main.py`: Entry point for FastAPI, CORS setup, and router imports.
- `database.py`: SQLAlchemy connection logic.
- `models.py`: Database tables (`User`, `Provider`, `Booking`, `Dispute`, `AgentTrace`).
- `schemas.py`: Pydantic models for validation.
- `routers/`: Endpoints separated by domains (`agents.py`, `auth.py`, `bookings.py`, `disputes.py`, `pricing.py`, `providers.py`, `traces.py`).
- `requirements.txt`: Python backend dependencies (FastAPI, uvicorn, sqlalchemy, etc).
- `data/seed_providers.py`: Data seeding script containing realistic dummy data for Pakistan.

### `/agents`
Contains the core business logic (the 6 agents). The FastAPI backend imports these directly (`from agents.orchestrator import ServiceOrchestrator`).
- `orchestrator.py`: The master pipeline executing agents sequentially.
- `shared/gemini_client.py`: The universal API wrapper for OpenRouter/Gemini.
- `{agent_name}/agent.py & prompts.py`: Isolated logic and LLM system prompts for NLU, Matcher, Pricing, Booking, Follow-up, and Dispute.
- `requirements.txt`: Agent-specific dependencies.

### `/KhidmatApp`
The Expo React Native frontend.
- `App.tsx`: Navigation stack and routing.
- `src/services/api.ts`: Axios client configured to talk to the backend (`EXPO_PUBLIC_API_URL`).
- `src/screens/`: 14 screens handling user flows.
- `src/components/ProviderCard.tsx`: Complex card featuring conditional rendering for maps on web/mobile.

---

## 3. Google Cloud Run Deployment (Backend)

We deploy the FastAPI backend using Docker to Google Cloud Run, taking advantage of your hackathon credits.

### Step 3.1: Install & Login to GCloud SDK
If not already installed, install the Google Cloud SDK and run:
```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 3.2: Deploy to Cloud Run
Run this single command from the **root folder** of the project where `Dockerfile` is located:
```bash
gcloud run deploy khidmat-backend --source . --port 8080 --allow-unauthenticated --region us-central1 --set-env-vars="GEMINI_API_KEY=your_gemini_api_key"
```

This command will:
1. Upload the code to Google Cloud Build.
2. Build the Docker image.
3. Push the image to Google Artifact Registry.
4. Spin up a secure, autoscaling HTTPS service on Google Cloud Run!

### Step 3.3: Database Setup
- **Demo Mode (SQLite)**: The Dockerfile automatically copies the seeded `khidmat.db` SQLite database during the build. This database will be read-only since Cloud Run containers are stateless. This is **perfect and instant** for the hackathon demo.
- **Production Mode (PostgreSQL)**: To support write operations (e.g. new users and real bookings) across container restarts, set up a PostgreSQL database (like Supabase or Google Cloud SQL) and pass the `DATABASE_URL` environment variable to Cloud Run:
  ```bash
  --set-env-vars="DATABASE_URL=postgresql://user:pass@host:5432/dbname"
  ```

---

## 4. Expo EAS Deployment (Frontend Android APK)

We will use Expo Application Services (EAS) to compile the app into an installable `.apk` file for testing on physical Android devices.

### Step 4.1: Install EAS CLI & Login
```bash
npm install -g eas-cli
eas login
```

### Step 4.2: Link API URL
Modify `KhidmatApp/.env` to point to your new Cloud Run URL:
```env
EXPO_PUBLIC_API_URL=https://khidmat-backend-xxxxxx.a.run.app
```

### Step 4.3: Trigger Build
Inside the `KhidmatApp` folder, run:
```bash
eas build -p android --profile preview
```
This sends the build to Expo's cloud compilers. Once completed, EAS will provide a QR code and a link in the terminal to download the `.apk` file directly onto any Android phone!

---

## 5. Current Limitations & Assumptions
- **Authentication**: Currently uses basic SHA256 hashing. Needs JWT tokens for production security.
- **AI Latency**: The 6-agent sequential pipeline takes 10-25 seconds to process. The frontend has a 120s timeout configured in Axios to account for this.
- **Mock Services**: Notifications and SMS follow-ups are simulated in JSON logs. A real service (like Twilio) needs to be integrated.
- **Provider Maps**: Location distances are randomized locally. Needs actual GPS integration.

---

## 6. Next Actions for Claude
When taking over, please:
1. Verify the Google Cloud Run logs to ensure the Gunicorn server is starting without errors.
2. Guide the user on connecting Supabase PostgreSQL to allow persistent write operations for new users and bookings.
3. Help build the final APK for production using Expo EAS.
