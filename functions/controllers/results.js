const { db } = require('../config');

async function saveResult(req, res) {
  try {
    const payload = req.body || {};
    const now = new Date().toISOString();
    const doc = await db.collection('results').add({
      ...payload,
      created_date: now
    });
    return res.status(201).json({ id: doc.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listResultsForQuiz(req, res) {
  try {
    const quizId = req.params.id;
    const snap = await db.collection('results').where('quiz_id', '==', quizId).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listResultsForUser(req, res) {
  try {
    const userId = req.params.uid;
    const { limit = 10 } = req.query;
    const snap = await db.collection('results')
      .where('player_email', '==', req.user.email)
      .orderBy('created_date', 'desc')
      .limit(Number(limit))
      .get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  saveResult,
  listResultsForQuiz,
  listResultsForUser
};




