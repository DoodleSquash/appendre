import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Play, Sparkles, BarChart3, 
  Users, Clock, Loader2, Grid3X3, List 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, redirectToLogin } from '@/lib/api/userApi';
import { fetchQuizzes, deleteQuiz } from '@/lib/api/quizApi';
import { fetchUserResults } from '@/lib/api/quizResultApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QuizCard from '@/components/quiz/QuizCard';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteQuiz, setDeleteQuiz] = useState(null);
  const queryClient = useQueryClient();
  
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
  
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['myQuizzes'],
    queryFn: async () => {
      const allQuizzes = await fetchQuizzes();
      const userData = await getCurrentUser();
      return allQuizzes.filter(q => q.created_by === userData.email);
    },
    enabled: !!user
  });
  
  const { data: results = [] } = useQuery({
    queryKey: ['myResults'],
    queryFn: async () => {
      const userData = await getCurrentUser();
      return fetchUserResults(userData.email, { limit: 10 });
    },
    enabled: !!user
  });
  
  const deleteMutation = useMutation({
    mutationFn: (quizId) => deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myQuizzes'] });
      toast.success('Quiz deleted');
      setDeleteQuiz(null);
    }
  });
  
  const handlePlayQuiz = (quiz) => {
    window.location.href = createPageUrl(`HostGame?quizId=${quiz.id}`);
  };
  
  const handleEditQuiz = (quiz) => {
    window.location.href = createPageUrl(`CreateQuiz?editId=${quiz.id}`);
  };
  
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const stats = {
    totalQuizzes: quizzes.length,
    totalPlays: quizzes.reduce((acc, q) => acc + (q.play_count || 0), 0),
    gamesPlayed: results.length,
    avgScore: results.length > 0 
      ? Math.round(results.reduce((acc, r) => acc + (r.accuracy_percentage || 0), 0) / results.length) 
      : 0
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user.full_name || user.email?.split('@')[0]}</p>
          </div>
          <Link to={createPageUrl('CreateQuiz')}>
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 gap-2">
              <Plus className="w-5 h-5" /> Create Quiz
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Sparkles, label: 'My Quizzes', value: stats.totalQuizzes, color: 'from-violet-500 to-purple-600' },
            { icon: Users, label: 'Total Plays', value: stats.totalPlays, color: 'from-blue-500 to-cyan-600' },
            { icon: Play, label: 'Games Played', value: stats.gamesPlayed, color: 'from-emerald-500 to-green-600' },
            { icon: BarChart3, label: 'Avg. Accuracy', value: `${stats.avgScore}%`, color: 'from-amber-500 to-orange-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to={createPageUrl('JoinGame')}>
            <motion.div 
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Join a Game</h3>
              <p className="text-white/80">Enter a game PIN to play with others</p>
            </motion.div>
          </Link>
          
          <Link to={createPageUrl('Explore')}>
            <motion.div 
              className="bg-white rounded-2xl p-6 border border-slate-200 cursor-pointer hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="w-10 h-10 mb-4 text-violet-600" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Explore Quizzes</h3>
              <p className="text-slate-600">Discover and play community quizzes</p>
            </motion.div>
          </Link>
        </div>
        
        {/* My Quizzes Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800">My Quizzes</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {searchQuery ? 'No quizzes found' : 'Create your first quiz'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Use AI to generate quizzes in seconds'}
              </p>
              {!searchQuery && (
                <Link to={createPageUrl('CreateQuiz')}>
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 gap-2">
                    <Plus className="w-5 h-5" /> Create Quiz
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              <AnimatePresence mode="popLayout">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onPlay={handlePlayQuiz}
                    onEdit={handleEditQuiz}
                    onDelete={setDeleteQuiz}
                    isOwner={true}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteQuiz} onOpenChange={() => setDeleteQuiz(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteQuiz?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteQuiz.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}