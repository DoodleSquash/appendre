import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Loader2, CheckCircle, XCircle, Trophy, 
  Flame, ArrowRight, Home 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser } from '@/lib/api/userApi';
import { fetchQuizById } from '@/lib/api/quizApi';
import { fetchGameSession, updateGameSession, submitAnswer } from '@/lib/api/gameSessionApi';
import QuestionCard from '@/components/quiz/QuestionCard';
import Leaderboard from '@/components/quiz/Leaderboard';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Play() {
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [gameCode, setGameCode] = useState('');
  const [status, setStatus] = useState('joining'); // joining, waiting, playing, results, finished
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const codeFromUrl = urlParams.get('code');
  
  useEffect(() => {
    if (codeFromUrl) {
      setGameCode(codeFromUrl);
    }
    checkAuth();
  }, [codeFromUrl]);
  
  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setPlayerName(userData.full_name || userData.email?.split('@')[0]);
    } catch {
      setIsGuest(true);
    }
  };
  
  // Poll for game updates
  useEffect(() => {
    if (!session?.id) return;
    
    const pollSession = setInterval(async () => {
      const updatedSession = await fetchGameSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
        
        // Handle status changes
        if (updatedSession.status === 'question' && status !== 'playing') {
          setStatus('playing');
          setSelectedAnswer(null);
          setHasAnswered(false);
          setLastResult(null);
          
          // Fetch quiz if not loaded
          if (!quiz) {
            const fetchedQuiz = await fetchQuizById(updatedSession.quiz_id);
            setQuiz(fetchedQuiz);
          } else {
            const currentQ = quiz.questions[updatedSession.current_question_index];
            setTimeLeft(currentQ?.time_limit || 20);
          }
        } else if (updatedSession.status === 'results') {
          setStatus('results');
        } else if (updatedSession.status === 'finished') {
          setStatus('finished');
        }
      }
    }, 1000);
    
    return () => clearInterval(pollSession);
  }, [session?.id, status, quiz]);
  
  // Timer
  useEffect(() => {
    if (status !== 'playing' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [status, timeLeft]);
  
  // Set initial time when question changes
  useEffect(() => {
    if (quiz && session?.status === 'question') {
      const currentQ = quiz.questions[session.current_question_index];
      setTimeLeft(currentQ?.time_limit || 20);
    }
  }, [quiz, session?.current_question_index, session?.status]);
  
  const joinGame = async () => {
    if (gameCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    // Find game session
    const gameSession = await fetchGameSession(gameCode.toUpperCase());
    
    if (!gameSession) {
      toast.error('Game not found');
      return;
    }
    
    if (gameSession.status !== 'waiting') {
      toast.error('Game has already started');
      return;
    }
    
    // Add player to session
    const playerEmail = user?.email || `guest_${Date.now()}@apprendre.app`;
    const players = gameSession.players || [];
    
    if (players.some(p => p.email === playerEmail)) {
      toast.error('You are already in this game');
      setSession(gameSession);
      setStatus('waiting');
      return;
    }
    
    const newPlayer = {
      email: playerEmail,
      name: playerName,
      score: 0,
      answers: [],
      streak: 0
    };
    
    await updateGameSession(gameSession.id, {
      players: [...players, newPlayer]
    });
    
    // Get quiz
    const fetchedQuiz = await fetchQuizById(gameSession.quiz_id);
    setQuiz(fetchedQuiz);
    
    const updatedSession = await fetchGameSession(gameSession.id);
    setSession(updatedSession);
    setStatus('waiting');
    
    toast.success('Joined game!');
  };
  
  const submitAnswerAction = async (answerIndex) => {
    if (hasAnswered || !session || !quiz) return;
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    const currentQ = quiz.questions[session.current_question_index];
    const isCorrect = answerIndex === currentQ.correct_answer;
    
    const playerEmail = user?.email || session.players?.find(p => p.name === playerName)?.email;
    const resp = await submitAnswer(session.id, {
      player_email: playerEmail,
      selected_answer: answerIndex,
      question_index: session.current_question_index,
      correct_answer: currentQ.correct_answer,
      time_limit: currentQ.time_limit || 20,
      time_left: timeLeft,
      base_points: currentQ.points || 1000
    });

    setLastResult({
      isCorrect,
      pointsEarned: resp.points,
      correctAnswer: currentQ.correct_answer
    });

    // Refresh session snapshot to get updated scores
    const updatedSession = await fetchGameSession(session.id);
    if (updatedSession) setSession(updatedSession);
  };
  
  // Joining screen
  if (status === 'joining') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-6">
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Join Game</h1>
          <p className="text-slate-500 text-center mb-8">Enter the game PIN to play</p>
          
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Game PIN"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase().slice(0, 6))}
                className="text-center text-3xl font-bold tracking-[0.5em] h-16 border-2"
                maxLength={6}
              />
            </div>
            
            <div>
              <Input
                placeholder="Your nickname"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-center text-xl h-14"
              />
            </div>
            
            <Button 
              onClick={joinGame}
              disabled={gameCode.length !== 6 || !playerName.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 py-6 text-lg font-semibold gap-2"
            >
              <Users className="w-5 h-5" /> Join Game
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => window.location.href = createPageUrl('Home')}
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Waiting for game to start
  if (status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col items-center justify-center p-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">You're In!</h1>
          <p className="text-xl text-white/80 mb-2">Hi, {playerName}!</p>
          <p className="text-white/60">Waiting for the host to start the game...</p>
          
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <p className="text-white/60 mb-2">Players joined:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {session?.players?.map((player, index) => (
                <span 
                  key={player.email}
                  className="bg-white rounded-full px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {player.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Playing
  if (status === 'playing' || status === 'results') {
    const currentQuestion = quiz?.questions?.[session?.current_question_index];
    const myPlayer = session?.players?.find(p => p.name === playerName);
    
    if (!currentQuestion) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <span className="font-bold">{session.current_question_index + 1}</span>
                <span className="text-white/60"> / {quiz.questions.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {myPlayer?.streak > 1 && (
                <div className="bg-orange-500/20 rounded-full px-4 py-2 text-orange-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold">{myPlayer.streak} streak!</span>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <span className="font-bold">{(myPlayer?.score || 0).toLocaleString()}</span>
                <span className="text-white/60"> pts</span>
              </div>
            </div>
          </div>
          
          {/* Answer Result Overlay */}
          <AnimatePresence>
            {hasAnswered && lastResult && (
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className={`rounded-3xl p-12 text-center ${
                    lastResult.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  {lastResult.isCorrect ? (
                    <>
                      <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
                      <h2 className="text-4xl font-bold text-white mb-2">Correct!</h2>
                      <p className="text-2xl text-white/80">+{lastResult.pointsEarned} points</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-20 h-20 text-white mx-auto mb-4" />
                      <h2 className="text-4xl font-bold text-white mb-2">Wrong!</h2>
                      <p className="text-xl text-white/80">The correct answer was option {lastResult.correctAnswer + 1}</p>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Question */}
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={submitAnswerAction}
            showResult={hasAnswered}
            correctAnswer={hasAnswered ? currentQuestion.correct_answer : null}
            disabled={hasAnswered}
            timeLeft={timeLeft}
            totalTime={currentQuestion.time_limit || 20}
          />
        </div>
      </div>
    );
  }
  
  // Game finished
  if (status === 'finished') {
    const myPlayer = session?.players?.find(p => p.name === playerName);
    const sortedPlayers = [...(session?.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const myRank = sortedPlayers.findIndex(p => p.name === playerName) + 1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Game Over!</h1>
            <p className="text-xl text-white/80">
              You finished #{myRank} with {(myPlayer?.score || 0).toLocaleString()} points!
            </p>
          </motion.div>
          
          <Leaderboard 
            players={session?.players || []} 
            currentUserEmail={myPlayer?.email}
          />
          
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => window.location.href = createPageUrl('Home')}
              className="border-white/20 text-white hover:bg-white/10 gap-2"
            >
              <Home className="w-4 h-4" /> Home
            </Button>
            <Button
              onClick={() => {
                setStatus('joining');
                setSession(null);
                setQuiz(null);
                setGameCode('');
              }}
              className="bg-white text-violet-600 hover:bg-slate-100 gap-2"
            >
              <ArrowRight className="w-4 h-4" /> Join Another
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}