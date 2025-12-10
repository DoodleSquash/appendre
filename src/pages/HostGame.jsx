import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Users, Crown, Clock, XCircle, 
  CheckCircle, Loader2, SkipForward, ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, redirectToLogin } from '@/lib/api/userApi';
import { fetchQuizById, updateQuiz } from '@/lib/api/quizApi';
import { createGameSession, fetchGameSession, updateGameSession } from '@/lib/api/gameSessionApi';
import { saveQuizResult } from '@/lib/api/quizResultApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GameLobby from '@/components/quiz/GameLobby';
import QuestionCard from '@/components/quiz/QuestionCard';
import Leaderboard from '@/components/quiz/Leaderboard';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const generateGameCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function HostGame() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('quizId');
  
  const { data: quiz, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const quiz = await fetchQuizById(quizId);
      return quiz;
    },
    enabled: !!quizId
  });
  
  useEffect(() => {
    loadUser();
  }, []);
  
  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      redirectToLogin();
    }
  };
  
  // Create game session
  const createSession = useMutation({
    mutationFn: async () => {
      const gameCode = generateGameCode();
      const newSession = await createGameSession({
        quiz_id: quizId,
        host_email: user.email,
        game_code: gameCode,
        status: 'waiting',
        current_question_index: 0,
        players: []
      });
      return newSession;
    },
    onSuccess: (data) => {
      setSession(data);
    }
  });
  
  // Poll for player updates
  useEffect(() => {
    if (!session?.id) return;
    
    const pollPlayers = setInterval(async () => {
      const updatedSession = await fetchGameSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }
    }, 2000);
    
    return () => clearInterval(pollPlayers);
  }, [session?.id]);
  
  // Timer logic
  useEffect(() => {
    if (session?.status !== 'question' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [session?.status, timeLeft]);
  
  useEffect(() => {
    if (quiz && user && !session) {
      createSession.mutate();
    }
  }, [quiz, user]);
  
  const handleTimeUp = useCallback(async () => {
    if (!session) return;
    
    await updateGameSession(session.id, {
      status: 'results'
    });
    
    setShowResults(true);
    setSession(prev => ({ ...prev, status: 'results' }));
  }, [session]);
  
  const startGame = async () => {
    if (!session || !quiz) return;
    
    const firstQuestion = quiz.questions[0];
    setTimeLeft(firstQuestion?.time_limit || 20);
    setShowResults(false);
    
    await updateGameSession(session.id, {
      status: 'question',
      current_question_index: 0,
      question_start_time: new Date().toISOString()
    });
    
    // Update play count
    await updateQuiz(quizId, {
      play_count: (quiz.play_count || 0) + 1
    });
    
    setSession(prev => ({ ...prev, status: 'question', current_question_index: 0 }));
  };
  
  const nextQuestion = async () => {
    if (!session || !quiz) return;
    
    const nextIndex = session.current_question_index + 1;
    
    if (nextIndex >= quiz.questions.length) {
      // Game finished
      await updateGameSession(session.id, {
        status: 'finished'
      });
      
      // Save results for all players
      const sortedPlayers = [...(session.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
      
      for (let i = 0; i < sortedPlayers.length; i++) {
        const player = sortedPlayers[i];
        await saveQuizResult({
          session_id: session.id,
          quiz_id: quizId,
          player_email: player.email,
          player_name: player.name,
          total_score: player.score || 0,
          correct_answers: player.answers?.filter(a => a.is_correct).length || 0,
          total_questions: quiz.questions.length,
          accuracy_percentage: Math.round((player.answers?.filter(a => a.is_correct).length || 0) / quiz.questions.length * 100),
          rank: i + 1,
          answers: player.answers || []
        });
      }
      
      setSession(prev => ({ ...prev, status: 'finished' }));
    } else {
      const nextQ = quiz.questions[nextIndex];
      setTimeLeft(nextQ?.time_limit || 20);
      setShowResults(false);
      
      await updateGameSession(session.id, {
        status: 'question',
        current_question_index: nextIndex,
        question_start_time: new Date().toISOString()
      });
      
      setSession(prev => ({ ...prev, status: 'question', current_question_index: nextIndex }));
    }
  };
  
  const endGame = async () => {
    if (!session) return;
    
    await updateGameSession(session.id, {
      status: 'finished'
    });
    
    window.location.href = createPageUrl('Dashboard');
  };
  
  if (loadingQuiz || !quiz || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }
  
  // Waiting for players
  if (session?.status === 'waiting') {
    return (
      <GameLobby
        gameCode={session.game_code}
        players={session.players || []}
        isHost={true}
        onStart={startGame}
        quizTitle={quiz.title}
      />
    );
  }
  
  // Question phase
  if (session?.status === 'question' || session?.status === 'results') {
    const currentQuestion = quiz.questions[session.current_question_index];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.href = createPageUrl('Home')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <span className="font-bold">{session.current_question_index + 1}</span>
                <span className="text-white/60"> / {quiz.questions.length}</span>
              </div>
              <h1 className="text-xl font-bold text-white hidden md:block">{quiz.title}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-bold">{session.players?.length || 0}</span>
              </div>
              
              {showResults && (
                <Button
                  onClick={nextQuestion}
                  className="bg-white text-violet-600 hover:bg-slate-100 gap-2"
                >
                  {session.current_question_index + 1 >= quiz.questions.length ? (
                    <>Finish <CheckCircle className="w-4 h-4" /></>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              )}
              
              {!showResults && (
                <Button
                  variant="outline"
                  onClick={handleTimeUp}
                  className="border-white/20 text-white hover:bg-white/10 gap-2"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </Button>
              )}
            </div>
          </div>
          
          {/* Question or Leaderboard */}
          <AnimatePresence mode="wait">
            {showResults ? (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Leaderboard 
                  players={session.players || []} 
                  currentUserEmail={user.email}
                />
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  selectedAnswer={null}
                  onSelectAnswer={() => {}}
                  showResult={false}
                  disabled={true}
                  timeLeft={timeLeft}
                  totalTime={currentQuestion?.time_limit || 20}
                />
                
                {/* Live answer tracking */}
                <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Waiting for answers...
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentQuestion.options.map((option, index) => {
                      const answerCount = session.players?.filter(
                        p => p.answers?.[session.current_question_index]?.selected_answer === index
                      ).length || 0;
                      
                      return (
                        <div key={index} className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-white">{answerCount}</p>
                          <p className="text-white/60 text-sm">Option {index + 1}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
  
  // Game finished
  if (session?.status === 'finished') {
    const sortedPlayers = [...(session.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const winner = sortedPlayers[0];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col items-center justify-center p-6">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Crown className="w-20 h-20 text-amber-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Game Over!</h1>
          {winner && (
            <p className="text-xl text-white/80">
              🎉 <span className="font-bold">{winner.name || winner.email?.split('@')[0]}</span> wins with{' '}
              <span className="font-bold">{winner.score?.toLocaleString()}</span> points!
            </p>
          )}
        </motion.div>
        
        <Leaderboard 
          players={session.players || []} 
          currentUserEmail={user.email}
        />
        
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={endGame}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => {
              createSession.mutate();
            }}
            className="bg-white text-violet-600 hover:bg-slate-100"
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}