# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.














Apprendre - AI-Powered Real-Time Quiz Platform
  Project Overview
Apprendre is an AI-powered online quiz platform that allows users to:

- Participate in *real-time multiplayer quizzes* and solo practice.
- Generate quizzes automatically using *AI* from topics, text, or PDFs.
- Track *live leaderboards* and personal performance.
- Manage quizzes, results, and dashboards via a *React + Firebase* frontend.


 Setup Instructions

1. Clone the repository

        bash
        git clone <repo_url>
        cd apprendre


2. Install dependencies

        cd frontend
        npm install
        cd ../functions
        npm install


3. Configure Firebase

        Create a .env.local in /frontend:

        VITE_FUNCTIONS_URL=http://localhost:5001/apprendre-61151/us-central1/api


4. Configure Firebase credentials in src/firebase.js.

         Start Firebase emulators

         firebase emulators:start --only functions,firestore,storage,hosting,database


5. Run the frontend
      cd frontend
    npm run dev



Architecture Overview

Frontend: React + Tailwind CSS

Pages: Home, Dashboard, Explore, Quiz Play (Solo/Multiplayer), Login/Signup

API integration with Firebase Functions

Backend: Firebase (Functions, Firestore, Storage, Realtime DB)

Cloud Functions handle: quizzes CRUD, AI quiz generation, results, sessions, leaderboard

Firestore stores quizzes, questions, sessions, results

Storage holds uploaded PDFs

AI Integration: Google AI Studio (Gemini) for quiz generation

Realtime Updates: Firestore and Realtime Database listeners for multiplayer sessions and leaderboard



How to Run Locally

Start Firebase emulators:

               firebase emulators:start --only functions,firestore,storage,hosting,database


Start the frontend:

              cd frontend
              npm run dev
              Open in browser: http://localhost:5173 (Vite dev server)

Use the app:

              Signup/login
              Create quizzes (manual or AI-generated)
              Play solo or host/join multiplayer sessions
              Upload PDFs for AI quiz generation
              APIs / Endpoints
All endpoints are Firebase Cloud Functions. They expect an Authorization header with Firebase ID token.


Endpoint	                                   Method	                                                                       Description

/auth/profile    	                            POST	                                                                   Get current user profile

/quizzes	                                    GET	                                                                  List public quizzes or dashboard quizzes

/quizzes/:id	                                GET	                                                                       Fetch quiz and questions

/quizzes	                                    POST                                                                            	Create quiz

/quizzes/:id	                                PATCH                                                                            	Update quiz

/quizzes/:id	                                DELETE	                                                                           Delete quiz

/quizzes/:id/ai-generate                      POST                                                                           	Generate AI quiz

/quizzes/:id/results	                        POST	                                                                            Save result

/quizzes/:id/results	                        GET                                                                           	Fetch quiz results

/users/:uid/results	                          GET                                                                           	Fetch user results

/sessions	                                    POST	                                                                        Create multiplayer session

/sessions/:id                                	GET	                                                                               Fetch session

/sessions/code/:code/join                    	POST	                                                                          Join session by code

/sessions/:id	                                PATCH                                                                	Host updates session (start/next/finish)

/sessions/:id/answer	                        POST	                                                                                  Submit answer

/sessions/:id/leaderboard	                    GET                                                                                	Fetch leaderboard

/upload/pdf	                                  POST                                                                        	Upload PDF and extract text

Example Inputs / Outputs


Create Quiz (POST /quizzes)

{  "title": "Sample Quiz",
  "description": "Test quiz",
  "category": "Science",
  "difficulty": "medium",
  "questions": [
    {
      "question": "What is H2O?",
      "type": "multiple_choice",
      "options": ["Water", "Oxygen", "Hydrogen"],
      "correct_answer": "Water",
      "points": 10
    }
  ],
  "is_public": true
}

Response

{
  "id": "quiz123",
  "title": "Sample Quiz",
  "created_by": "user@example.com",
  "created_date": "2025-12-11T12:00:00Z"
}


List of Dependencies

Frontend

React

Tailwind CSS

Firebase JS SDK (auth, firestore, storage, database)

Axios (for API calls)

Backend / Functions

Firebase Admin SDK

Firebase Functions

Firebase Firestore












