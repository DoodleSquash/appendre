import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Award, Target, TrendingUp, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/lib/api/userApi';
import { fetchQuizById } from '@/lib/api/quizApi';
import { saveQuizResult } from '@/lib/api/quizResultApi';
import { useQuery, useMutation } from '@tanstack/react-query';
import QuestionCard from '@/components/quiz/QuestionCard';
import { createPageUrl } from '@/utils';
import confetti from 'canvas-confetti';

export default function PlaySolo() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [gameState, setGameState] = useState('playing'); // playing, finished
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [user, setUser] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('quizId');
  
  useEffect(() => {
    loadUser();
  }, []);
  
  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      // Guest mode
      setUser({ email: 'guest', full_name: 'Guest Player' });
    }
  };
  
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const quiz = await fetchQuizById(quizId);
      return quiz;
    },
    enabled: !!quizId
  });
  
  useEffect(() => {
    if (quiz?.questions && gameState === 'playing') {
      const currentQuestion = quiz.questions[currentQuestionIndex];
      setTimeLeft(currentQuestion?.time_limit || 20);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [quiz, currentQuestionIndex, gameState]);
  
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, currentQuestionIndex]);
  
  const saveResultMutation = useMutation({
    mutationFn: async (resultData) => {
      if (user?.email !== 'guest') {
        return saveQuizResult(quizId, resultData);
      }
    }
  });
  
  const handleAnswer = (answerIndex) => {
    if (showResult) return; // Prevent multiple answers
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const responseTime = Date.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    
    let pointsEarned = 0;
    if (isCorrect && answerIndex !== null) {
      const timeBonus = Math.floor((timeLeft / currentQuestion.time_limit) * 500);
      pointsEarned = currentQuestion.points + timeBonus;
      setScore(prev => prev + pointsEarned);
    }
    
    const answerRecord = {
      question_index: currentQuestionIndex,
      selected_answer: answerIndex,
      is_correct: isCorrect,
      response_time: responseTime,
      points_earned: pointsEarned
    };
    
    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        finishGame(newAnswers);
      }
    }, 2000);
  };
  
  const finishGame = (finalAnswers) => {
    setGameState('finished');
    
    const correctCount = finalAnswers.filter(a => a.is_correct).length;
    const accuracy = Math.round((correctCount / quiz.questions.length) * 100);
    const avgResponseTime = finalAnswers.reduce((sum, a) => sum + a.response_time, 0) / finalAnswers.length;
    
    if (accuracy >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    if (user?.email !== 'guest') {
      saveResultMutation.mutate({
        session_id: 'solo_' + Date.now(),
        quiz_id: quizId,
        player_email: user.email,
        player_name: user.full_name || user.email,
        total_score: score,
        correct_answers: correctCount,
        total_questions: quiz.questions.length,
        accuracy_percentage: accuracy,
        average_response_time: avgResponseTime,
        rank: 1,
        answers: finalAnswers
      });
    }
  };
  
  if (isLoading || !quiz || !quiz.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  if (gameState === 'finished') {
    const correctCount = answers.filter(a => a.is_correct).length;
    const accuracy = Math.round((correctCount / quiz.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Quiz Complete! 🎉</h1>
            <p className="text-slate-600">Great job practicing!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-6 text-center">
              <Target className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-violet-900">{score}</p>
              <p className="text-slate-600">Total Score</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-emerald-900">{accuracy}%</p>
              <p className="text-slate-600">Accuracy</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{correctCount}/{quiz.questions.length}</p>
              <p className="text-slate-600">Correct</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-900">
                {Math.round(answers.reduce((sum, a) => sum + a.response_time, 0) / answers.length / 1000)}s
              </p>
              <p className="text-slate-600">Avg. Time</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              Play Again
            </Button>
            <Button
              onClick={() => window.location.href = createPageUrl('Explore')}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            >
              <Home className="w-4 h-4 mr-2" /> Explore More
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = createPageUrl('Explore')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 mx-6">
            <div className="flex items-center justify-between text-white mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm font-medium">Score: {score}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-bold tabular-nums">{timeLeft}</span>
          </div>
        </div>
      </div>
      
      {/* Question */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestionIndex}
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleAnswer}
            showResult={showResult}
            correctAnswer={currentQuestion.correct_answer}
            disabled={showResult}
            timeLeft={timeLeft}
            totalTime={currentQuestion.time_limit}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}