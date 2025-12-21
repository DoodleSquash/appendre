import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Trophy, Target, Clock,
  TrendingUp, BarChart3, PieChart, Loader2,
  Download, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [activeTab, setActiveTab] = useState('overview');

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
      question: q.question || 'N/A',
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quiz Analytics</h1>
            <p className="text-slate-500">{quiz.title}</p>
          </div>
          <Button variant="outline" className="gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export Results
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: 'Total Plays', value: totalPlays, bgColor: 'bg-violet-100', iconColor: 'text-violet-600' },
            { icon: Trophy, label: 'Avg Score', value: avgScore.toLocaleString(), bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
            { icon: Target, label: 'Avg Accuracy', value: `${avgAccuracy}%`, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
            { icon: Clock, label: 'Avg Response', value: `${avgTime}s`, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-6`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-slate-900 leading-none">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Control */}
        <div className="bg-slate-100 p-1 rounded-xl flex w-fit mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'questions', label: 'Questions' },
            { id: 'players', label: 'Players' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
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
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" />
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="plays"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                          if (active && payload?.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-xs">
                                <p className="font-bold text-slate-800 mb-2 leading-tight">{data.question}</p>
                                <div className="space-y-1">
                                  <p className="text-sm flex justify-between gap-4">
                                    <span className="text-emerald-600 font-medium">Correct:</span>
                                    <span className="font-bold">{data.correct}</span>
                                  </p>
                                  <p className="text-sm flex justify-between gap-4">
                                    <span className="text-red-500 font-medium">Incorrect:</span>
                                    <span className="font-bold">{data.incorrect}</span>
                                  </p>
                                  <div className="pt-2 border-t border-slate-50 mt-2">
                                    <p className="text-sm font-bold text-violet-600 flex justify-between items-center">
                                      <span>Accuracy:</span>
                                      <span className="text-lg">{data.accuracy}%</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="correct" fill="#10b981" radius={[4, 4, 0, 0]} name="Correct" />
                      <Bar dataKey="incorrect" fill="#ef4444" radius={[4, 4, 0, 0]} name="Incorrect" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Question List */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Question Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questionPerformance.map((q, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{quiz.questions[index]?.question}</p>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {q.correct + q.incorrect} total responses
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`px-3 py-1 rounded-lg font-bold ${q.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' : q.accuracy >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {q.accuracy}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-violet-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {player.player_name || player.player_email?.split('@')[0]}
                          </p>
                          <p className="text-sm font-medium text-slate-500">
                            {player.correct_answers}/{player.total_questions} correct • {player.accuracy_percentage}% accuracy
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-violet-600">
                          {(player.total_score || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
                      </div>
                    </div>
                  ))}

                  {topPerformers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No players have joined this quiz yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}