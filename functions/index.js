const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { verifyFirebaseIdToken } = require('./middleware/auth');
const quizzes = require('./controllers/quizzes');
const sessions = require('./controllers/sessions');
const results = require('./controllers/results');
const uploads = require('./controllers/upload');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Quizzes
app.get('/quizzes', verifyFirebaseIdToken, quizzes.listQuizzes);
app.get('/quizzes/:id', verifyFirebaseIdToken, quizzes.getQuiz);
app.post('/quizzes', verifyFirebaseIdToken, quizzes.createQuiz);
app.patch('/quizzes/:id', verifyFirebaseIdToken, quizzes.updateQuiz);
app.delete('/quizzes/:id', verifyFirebaseIdToken, quizzes.deleteQuiz);
app.post('/quizzes/:id/ai-generate', verifyFirebaseIdToken, quizzes.generateQuizAI);

// Results
app.post('/quizzes/:id/results', verifyFirebaseIdToken, results.saveResult);
app.get('/quizzes/:id/results', verifyFirebaseIdToken, results.listResultsForQuiz);
app.get('/users/:uid/results', verifyFirebaseIdToken, results.listResultsForUser);

// Sessions
app.post('/sessions', verifyFirebaseIdToken, sessions.createSession);
app.get('/sessions/:id', verifyFirebaseIdToken, sessions.getSession);
app.post('/sessions/code/:code/join', verifyFirebaseIdToken, sessions.joinSession);
app.patch('/sessions/:id', verifyFirebaseIdToken, sessions.updateSession);
app.post('/sessions/:id/answer', verifyFirebaseIdToken, sessions.submitAnswer);
app.get('/sessions/:id/leaderboard', verifyFirebaseIdToken, sessions.leaderboard);

// Upload PDF
app.post('/upload/pdf', verifyFirebaseIdToken, upload.single('file'), uploads.uploadPdf);

exports.api = functions.https.onRequest(app);




