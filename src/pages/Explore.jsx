import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Sparkles, TrendingUp, Clock, 
  Grid3X3, List, Loader2, SlidersHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { fetchQuizzes } from '@/lib/api/quizApi';
import { useQuery } from '@tanstack/react-query';
import QuizCard from '@/components/quiz/QuizCard';
import { createPageUrl } from '@/utils';

const categories = [
  { value: 'all', label: 'All Categories', emoji: '🌐' },
  { value: 'science', label: 'Science', emoji: '🔬' },
  { value: 'history', label: 'History', emoji: '📜' },
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'arts', label: 'Arts & Culture', emoji: '🎨' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'general', label: 'General', emoji: '🌟' }
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['publicQuizzes'],
    queryFn: async () => {
      const { items } = await fetchQuizzes({ public: 1 });
      return items;
    }
  });
  
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = !searchQuery || 
      quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || quiz.category === category;
    const matchesDifficulty = difficulty === 'all' || quiz.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    if (sortBy === 'popular') return (b.play_count || 0) - (a.play_count || 0);
    if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'questions') return (b.questions?.length || 0) - (a.questions?.length || 0);
    return 0;
  });
  
  const handlePlayQuiz = (quiz) => {
    window.location.href = createPageUrl(`PlaySolo?quizId=${quiz.id}`);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Quizzes</h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Discover and play quizzes created by our community
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg text-slate-800 border-0 shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </header>
      
      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? 'default' : 'ghost'}
              onClick={() => setCategory(cat.value)}
              className={`gap-2 ${category === cat.value ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
            >
              <span>{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Filters & Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm py-1">
              {sortedQuizzes.length} quizzes
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Most Popular
                  </span>
                </SelectItem>
                <SelectItem value="newest">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Newest
                  </span>
                </SelectItem>
                <SelectItem value="questions">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Most Questions
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex bg-slate-100 rounded-lg p-1">
              <Button
                size="icon"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quiz Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : sortedQuizzes.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No quizzes found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            <AnimatePresence mode="popLayout">
              {sortedQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onPlay={handlePlayQuiz}
                  isOwner={false}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}