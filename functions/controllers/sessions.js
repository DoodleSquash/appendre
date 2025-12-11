const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');

function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createSession(req, res) {
  try {
    const { quiz_id, settings } = req.body || {};
    const game_code = generateGameCode();
    const now = new Date().toISOString();
    const session = {
      quiz_id,
      host_uid: req.user.uid,
      host_email: req.user.email,
      game_code,
      status: 'waiting',
      current_question_index: 0,
      question_start_time: null,
      settings: settings || { show_answers: true, shuffle_questions: false, shuffle_options: true },
      createdAt: now,
      updatedAt: now
    };
    const ref = await db.collection('sessions').add(session);
    return res.status(201).json({ id: ref.id, ...session });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getSession(req, res) {
  try {
    const idOrCode = req.params.id;
    let snap = await db.collection('sessions').doc(idOrCode).get();
    if (!snap.exists) {
      const byCode = await db.collection('sessions').where('game_code', '==', idOrCode).limit(1).get();
      if (byCode.empty) return res.status(404).json({ error: 'Session not found' });
      snap = byCode.docs[0];
    }
    const session = { id: snap.id, ...snap.data() };
    const playersSnap = await db.collection('sessions').doc(session.id).collection('players').get();
    session.players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(session);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function joinSession(req, res) {
  try {
    const gameCode = req.params.code.toUpperCase();
    const { name, email } = req.body || {};
    const match = await db.collection('sessions').where('game_code', '==', gameCode).limit(1).get();
    if (match.empty) return res.status(404).json({ error: 'Session not found' });
    const sessionDoc = match.docs[0];
    const session = sessionDoc.data();
    if (session.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });

    const playerEmail = email || req.user?.email || `guest_${uuidv4()}@apprendre.app`;
    const playersCol = sessionDoc.ref.collection('players');
    const existing = await playersCol.where('email', '==', playerEmail).limit(1).get();
    if (!existing.empty) return res.status(200).json({ alreadyJoined: true });

    const player = {
      email: playerEmail,
      name: name || playerEmail.split('@')[0],
      score: 0,
      streak: 0,
      answers: [],
      joined_at: new Date().toISOString()
    };
    await playersCol.add(player);
    await sessionDoc.ref.set({ updatedAt: new Date().toISOString() }, { merge: true });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateSession(req, res) {
  try {
    const sessionId = req.params.id;
    const payload = req.body || {};
    const sessionRef = db.collection('sessions').doc(sessionId);
    const snap = await sessionRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'Session not found' });
    if (snap.data().host_uid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    await sessionRef.set({ ...payload, updatedAt: new Date().toISOString() }, { merge: true });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function submitAnswer(req, res) {
  try {
    const sessionId = req.params.id;
    const { player_email, selected_answer, question_index, correct_answer, time_limit = 20, time_left = 0, base_points = 1000 } = req.body || {};
    const sessionRef = db.collection('sessions').doc(sessionId);
    const snap = await sessionRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'Session not found' });

    const playersCol = sessionRef.collection('players');
    const playerSnap = await playersCol.where('email', '==', player_email).limit(1).get();
    if (playerSnap.empty) return res.status(404).json({ error: 'Player not found' });

    const playerRef = playerSnap.docs[0].ref;
    const player = playerSnap.docs[0].data();

    const is_correct = Number(selected_answer) === Number(correct_answer);
    const timeBonus = Math.round((Number(time_left) / Number(time_limit)) * 500);
    const points = is_correct ? Math.round(base_points * 0.5 + timeBonus) : 0;
    const newStreak = is_correct ? (player.streak || 0) + 1 : 0;
    const streakBonus = is_correct && newStreak > 1 ? newStreak * 50 : 0;
    const totalPoints = points + streakBonus;

    const answers = player.answers || [];
    answers[Number(question_index)] = {
      question_index: Number(question_index),
      selected_answer: Number(selected_answer),
      is_correct,
      response_time: Number(time_limit) - Number(time_left),
      points_earned: totalPoints
    };

    await playerRef.set(
      {
        score: (player.score || 0) + totalPoints,
        streak: newStreak,
        answers
      },
      { merge: true }
    );

    return res.json({ is_correct, points: totalPoints, player_score: (player.score || 0) + totalPoints });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function leaderboard(req, res) {
  try {
    const sessionId = req.params.id;
    const playersSnap = await db.collection('sessions').doc(sessionId).collection('players').get();
    const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    players.sort((a, b) => (b.score || 0) - (a.score || 0));
    return res.json(players);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createSession,
  getSession,
  joinSession,
  updateSession,
  submitAnswer,
  leaderboard
};




