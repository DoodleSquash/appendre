import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

const optionColors = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-green-600'
];

const optionShapes = ['◆', '●', '▲', '■'];

export default function QuestionCard({ 
  question, 
  selectedAnswer, 
  onSelectAnswer, 
  showResult,
  correctAnswer,
  disabled,
  timeLeft,
  totalTime
}) {
  const progress = (timeLeft / totalTime) * 100;
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Timer Bar */}
      <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <motion.div 
          className={cn(
            "h-full rounded-full transition-colors",
            progress > 50 ? "bg-emerald-500" : progress > 25 ? "bg-amber-500" : "bg-red-500"
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Question */}
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-500">
            {question.points || 1000} points
          </span>
          <span className={cn(
            "text-3xl font-bold",
            progress > 50 ? "text-emerald-500" : progress > 25 ? "text-amber-500" : "text-red-500"
          )}>
            {timeLeft}s
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center">
          {question.question}
        </h2>
      </motion.div>
      
      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = correctAnswer === index;
          
          return (
            <motion.button
              key={index}
              onClick={() => !disabled && onSelectAnswer(index)}
              disabled={disabled}
              className={cn(
                "relative p-6 rounded-xl text-white font-semibold text-lg transition-all",
                "bg-gradient-to-r shadow-lg",
                optionColors[index],
                isSelected && !showResult && "ring-4 ring-white ring-offset-2",
                showResult && isCorrect && "ring-4 ring-emerald-400 ring-offset-2",
                showResult && isSelected && !isCorrect && "opacity-50",
                !disabled && "hover:scale-105 hover:shadow-xl cursor-pointer",
                disabled && "cursor-not-allowed"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl opacity-80">{optionShapes[index]}</span>
                <span className="flex-1 text-left">{option}</span>
              </div>
              
              {showResult && isCorrect && (
                <motion.div 
                  className="absolute top-2 right-2 bg-white text-emerald-600 rounded-full p-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}