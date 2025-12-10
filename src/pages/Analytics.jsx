import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Trophy, Target, Clock, 
  TrendingUp, BarChart3, PieChart, Loader2,
  Download, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { fetchQuizById } from '@/lib/api/quizApi';
import { fetchQuizResults } from '@/lib/api/quizResultApi';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, 
  LineChart, Line, Legend 
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
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
  
  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ['quizResults', quizId],
    queryFn: () => fetchQuizResults(quizId),
    enabled: !!quizId
  });
  
  if (loadingQuiz || loadingResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Quiz not found</p>
      </div>
    );
  }
  
  // Calculate analytics
  const totalPlays = results.length;
  const avgScore = totalPlays > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.total_score || 0), 0) / totalPlays) 
    : 0;
  const avgAccuracy = totalPlays > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.accuracy_percentage || 0), 0) / totalPlays) 
    : 0;
  const avgTime = totalPlays > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.average_response_time || 0), 0) / totalPlays / 1000) 
    : 0;
  
  // Question performance data
  const questionPerformance = quiz.questions?.map((q, index) => {
    const questionAnswers = results.flatMap(r => r.answers?.filter(a => a.question_index === index) || []);
    const correctAnswers = questionAnswers.filter(a => a.is_correct).length;
    const totalAnswers = questionAnswers.length;
    
    return {
      name: `Q${index + 1}`,
      question: q.question?.substring(0, 50) + '...',
      correct: correctAnswers,
      incorrect: totalAnswers - correctAnswers,
      accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
    };
  }) || [];
  
  // Score distribution
  const scoreRanges = [
    { range: '0-20%', count: 0 },
    { range: '21-40%', count: 0 },
    { range: '41-60%', count: 0 },
    { range: '61-80%', count: 0 },
    { range: '81-100%', count: 0 }
  ];
  
  results.forEach(r => {
    const pct = r.accuracy_percentage || 0;
    if (pct <= 20) scoreRanges[0].count++;
    else if (pct <= 40) scoreRanges[1].count++;
    else if (pct <= 60) scoreRanges[2].count++;
    else if (pct <= 80) scoreRanges[3].count++;
    else scoreRanges[4].count++;
  });
  
  // Daily plays data
  const dailyPlays = {};
  results.forEach(r => {
    const date = format(new Date(r.created_date), 'MMM d');
    dailyPlays[date] = (dailyPlays[date] || 0) + 1;
  });
  const dailyPlaysData = Object.entries(dailyPlays).map(([date, plays]) => ({ date, plays })).slice(-7);
  
  // Top performers
  const topPerformers = [...results]
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    .slice(0, 5);
  
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.location.href = createPageUrl('Dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Quiz Analytics</h1>
              <p className="text-sm text-slate-500">{quiz.title}</p>
            </div>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Plays', value: totalPlays, color: 'from-violet-500 to-purple-600' },
            { icon: Trophy, label: 'Avg Score', value: avgScore.toLocaleString(), color: 'from-amber-500 to-orange-600' },
            { icon: Target, label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: 'from-emerald-500 to-green-600' },
            { icon: Clock, label: 'Avg Response', value: `${avgTime}s`, color: 'from-blue-500 to-cyan-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-slate-500">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-violet-600" />
                    Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={scoreRanges}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ range, count }) => count > 0 ? `${range}: ${count}` : ''}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {scoreRanges.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Daily Plays */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-600" />
                    Plays Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyPlaysData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="plays" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                  Question Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload?.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border">
                                <p className="font-medium">{data.question}</p>
                                <p className="text-emerald-600">Correct: {data.correct}</p>
                                <p className="text-red-600">Incorrect: {data.incorrect}</p>
                                <p className="text-violet-600 font-semibold">{data.accuracy}% accuracy</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="correct" fill="#10b981" name="Correct" />
                      <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Question List */}
            <Card>
              <CardHeader>
                <CardTitle>Question Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questionPerformance.map((q, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{quiz.questions[index]?.question}</p>
                          <p className="text-sm text-slate-500">
                            {q.correct + q.incorrect} answers
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className={q.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' : q.accuracy >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                      >
                        {q.accuracy}% accuracy
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="players" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {player.player_name || player.player_email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-slate-500">
                            {player.correct_answers}/{player.total_questions} correct • {player.accuracy_percentage}% accuracy
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-violet-600">
                        {(player.total_score || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  
                  {topPerformers.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No players yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}