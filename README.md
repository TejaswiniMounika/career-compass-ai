# Career Compass AI

A MERN-based AI career guidance and placement preparation platform.

## Features
- Student registration/login with JWT
- Profile and target-career management
- Resume PDF upload + text extraction
- AI resume analysis
- Skill-gap analysis
- Personalized learning roadmap
- Internship/job application tracker
- Certificates and projects
- AI mock interview
- Placement readiness score
- AI career chatbot
- Admin dashboard with user/internship analytics

## Stack
Frontend: React + Vite + React Router + Axios
Backend: Node.js + Express + MongoDB + Mongoose + JWT
AI: Google Gemini through the official `@google/genai` SDK

## Quick start

### 1. Backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:
```bash
cp .env.example .env
npm run dev
```

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:
```bash
cp .env.example .env
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Environment variables

Backend `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/career_compass
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.6-flash
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

AI works when `GEMINI_API_KEY` is present. Without it, the app still runs and uses a small fallback response for development.

## Create an admin
After registering a user, open MongoDB and change:
```json
{ "role": "admin" }
```
for that user's document. Then log in again.

## Deployment

Recommended simple split:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

Set backend `CLIENT_URL` to the deployed frontend URL.
Set frontend `VITE_API_URL` to the deployed backend URL + `/api`.

For production resume storage, replace local `uploads/` with Cloudinary, S3, or another object-storage service because many cloud services use ephemeral filesystems.

## Important
Never put `GEMINI_API_KEY`, `JWT_SECRET`, or `MONGO_URI` in frontend code or commit them to GitHub.
