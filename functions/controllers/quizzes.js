const { db } = require('../config');
const { generateQuizFromPrompt } = require('../services/gemini');

async function listQuizzes(req, res) {
  try {
    const { owner, category, difficulty, search, sort = 'popular', page = 1, limit = 20, public: isPublic } = req.query;
    let query = db.collection('quizzes');
    if (owner === 'me') {
      query = query.where('ownerUid', '==', req.user.uid);
    }
    if (isPublic === '1' || isPublic === 'true') {
      query = query.where('is_public', '==', true);
    }
    if (category && category !== 'all') query = query.where('category', '==', category);
    if (difficulty && difficulty !== 'all') query = query.where('difficulty', '==', difficulty);

    const snapshot = await query.get();
    let quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const lower = search.toLowerCase();
      quizzes = quizzes.filter(q =>
        (q.title || '').toLowerCase().includes(lower) ||
        (q.description || '').toLowerCase().includes(lower)
      );
    }

    quizzes.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sort === 'questions') return (b.questions_count || 0) - (a.questions_count || 0);
      return (b.play_count || 0) - (a.play_count || 0);
    });

    const start = (Number(page) - 1) * Number(limit);
    const paged = quizzes.slice(start, start + Number(limit));
    return res.json({ items: paged, total: quizzes.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getQuiz(req, res) {
  try {
    const quizId = req.params.id;
    const doc = await db.collection('quizzes').doc(quizId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = { id: doc.id, ...doc.data() };
    const questionsSnap = await db.collection('quizzes').doc(quizId).collection('questions').get();
    quiz.questions = questionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(quiz);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createQuiz(req, res) {
  try {
    const payload = req.body || {};
    const now = new Date().toISOString();
    const quizRef = await db.collection('quizzes').add({
      title: payload.title,
      description: payload.description,
      category: payload.category || 'general',
      difficulty: payload.difficulty || 'medium',
      is_public: !!payload.is_public,
      time_per_question: payload.time_per_question || 20,
      play_count: 0,
      source_type: payload.source_type || 'manual',
      createdAt: now,
      updatedAt: now,
      ownerUid: req.user.uid,
      created_by: req.user.email
    });

    const questions = payload.questions || [];
    const batch = db.batch();
    questions.forEach(q => {
      const qRef = quizRef.collection('questions').doc();
      batch.set(qRef, {
        question: q.question,
        type: q.type || 'multiple_choice',
        options: q.options || [],
        correct_answer: q.correct_answer ?? 0,
        time_limit: q.time_limit || 20,
        points: q.points || 1000
      });
    });
    batch.set(quizRef, { questions_count: questions.length }, { merge: true });
    await batch.commit();

    return res.status(201).json({ id: quizRef.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateQuiz(req, res) {
  try {
    const quizId = req.params.id;
    const payload = req.body || {};
    const quizRef = db.collection('quizzes').doc(quizId);
    const doc = await quizRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Quiz not found' });
    if (doc.data().ownerUid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    await quizRef.set(
      {
        ...payload,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    if (Array.isArray(payload.questions)) {
      const batch = db.batch();
      const qCol = quizRef.collection('questions');
      const existing = await qCol.get();
      existing.docs.forEach(d => batch.delete(d.ref));
      payload.questions.forEach(q => {
        const qRef = qCol.doc(q.id || undefined);
        batch.set(qRef, {
          question: q.question,
          type: q.type || 'multiple_choice',
          options: q.options || [],
          correct_answer: q.correct_answer ?? 0,
          time_limit: q.time_limit || 20,
          points: q.points || 1000
        });
      });
      batch.set(quizRef, { questions_count: payload.questions.length }, { merge: true });
      await batch.commit();
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteQuiz(req, res) {
  try {
    const quizId = req.params.id;
    const quizRef = db.collection('quizzes').doc(quizId);
    const doc = await quizRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Quiz not found' });
    if (doc.data().ownerUid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const batch = db.batch();
    const questions = await quizRef.collection('questions').get();
    questions.forEach(q => batch.delete(q.ref));
    batch.delete(quizRef);
    await batch.commit();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function generateQuizAI(req, res) {
  try {
    const { topic, text, pdfText, difficulty = 'medium', numQuestions = 10 } = req.body || {};
    const prompt = text || pdfText || topic || 'General knowledge';
    const quiz = await generateQuizFromPrompt({ prompt, numQuestions, difficulty });
    return res.json(quiz);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  generateQuizAI
};




