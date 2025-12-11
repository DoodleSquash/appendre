import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Users, Clock, Sparkles, MoreVertical, Edit, Trash2, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createPageUrl } from '@/utils';

const difficultyColors = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
  adaptive: 'bg-violet-100 text-violet-700'
};

const categoryIcons = {
  science: '🔬',
  history: '📜',
  technology: '💻',
  arts: '🎨',
  sports: '⚽',
  business: '💼',
  education: '📚',
  general: '🌐',
  custom: '✨'
};

export default function QuizCard({ quiz, onPlay, onEdit, onDelete, isOwner }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-gradient-to-br from-violet-500 to-fuchsia-500 overflow-hidden">
        {quiz.cover_image ? (
          <img
            src={quiz.cover_image}
            alt={quiz.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">{categoryIcons[quiz.category] || '📝'}</span>
          </div>
        )}

        {/* AI Badge */}
        {quiz.source_type?.startsWith('ai_') && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-violet-700 gap-1">
              <Sparkles className="w-3 h-3" /> AI Generated
            </Badge>
          </div>
        )}

        {/* Actions Menu */}
        {isOwner && (
          <div className="absolute top-3 right-3 transition-opacity">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center transition-colors shadow-sm">
                  <MoreVertical className="w-4 h-4 text-slate-700" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl(`PlaySolo?quizId=${quiz.id}`)}>
                    <User className="w-4 h-4 mr-2" /> Practice Solo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(quiz)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl(`Analytics?quizId=${quiz.id}`)}>
                    <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDropdownOpen(false);
                    onDelete?.(quiz);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">
          {quiz.title}
        </h3>

        {quiz.description && (
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">
            {quiz.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className={difficultyColors[quiz.difficulty]}>
            {quiz.difficulty}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {quiz.questions?.length || 0} Qs
          </Badge>
          {quiz.play_count > 0 && (
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {quiz.play_count}
            </Badge>
          )}
        </div>

        <Button
          onClick={() => onPlay(quiz)}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 gap-2"
        >
          <Play className="w-4 h-4" /> Play Now
        </Button>
      </div>
    </motion.div>
  );
}