import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, Users, Sparkles, ArrowRight, Zap, Trophy, 
  BarChart3, Globe, Rocket, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isAuthenticated as fetchIsAuthenticated, redirectToLogin } from '@/lib/api/userApi';
import Logo from '@/components/ui/Logo';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Home() {
  const [gameCode, setGameCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    checkAuth();
    
    // Check for join code in URL
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setGameCode(joinCode);
    }
  }, []);
  
  const checkAuth = async () => {
    try {
      const auth = await fetchIsAuthenticated();
      setIsLoggedIn(auth);
    } catch {
      setIsLoggedIn(false);
    }
  };
  
  const handleJoinGame = () => {
    if (gameCode.length !== 6) {
      toast.error('Please enter a valid 6-digit game code');
      return;
    }
    window.location.href = createPageUrl(`Play?code=${gameCode}`);
  };
  
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Creation',
      description: 'Generate quizzes from any topic, text, or PDF in seconds'
    },
    {
      icon: Zap,
      title: 'Real-Time Competition',
      description: 'Live multiplayer quizzes with instant scoring'
    },
    {
      icon: Trophy,
      title: 'Live Leaderboards',
      description: 'Track rankings as players answer questions'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Detailed insights on performance and engagement'
    }
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link to={createPageUrl('Dashboard')}>
                <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 gap-2">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Button variant="ghost" onClick={() => redirectToLogin()}>
                  Sign In
                </Button>
                <Button 
                  onClick={() => redirectToLogin()}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Quiz Platform
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                Learn, Play,{' '}
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  Compete
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Create engaging quizzes with AI, host live game sessions, and compete 
                on real-time leaderboards. Perfect for education, training, and fun!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => {
                    if (isLoggedIn) {
                      window.location.href = createPageUrl('CreateQuiz');
                    } else {
                      redirectToLogin(createPageUrl('CreateQuiz'));
                    }
                  }}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-lg px-8 py-6 gap-2"
                >
                  <Rocket className="w-5 h-5" /> Create a Quiz
                </Button>
                <Link to={createPageUrl('Explore')}>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 gap-2">
                    <Globe className="w-5 h-5" /> Explore Quizzes
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Join Game Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Join a Game</h2>
                    <p className="text-slate-500">Enter the game PIN to play</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Input
                    placeholder="Enter game PIN"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase().slice(0, 6))}
                    className="text-center text-3xl font-bold tracking-[0.5em] h-16 border-2"
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleJoinGame}
                    disabled={gameCode.length !== 6}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 py-6 text-lg font-semibold gap-2"
                  >
                    <Users className="w-5 h-5" /> Enter Game
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>No account needed to join</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Apprendre?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to create, host, and analyze engaging quiz experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-white/80">
              Create, host, and compete in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '1', 
                icon: '✨', 
                title: 'Create Your Quiz',
                description: 'Use AI to generate quizzes instantly or build custom ones from scratch'
              },
              { 
                step: '2', 
                icon: '🎮', 
                title: 'Share Game Code',
                description: 'Get a unique 6-digit code and share it with your players'
              },
              { 
                step: '3', 
                icon: '🏆', 
                title: 'Play & Compete',
                description: 'Watch live results and crown the champion on the leaderboard'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/80">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of educators and learners using Apprendre
          </p>
          <Button 
            size="lg"
            onClick={() => redirectToLogin(createPageUrl('Dashboard'))}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-lg px-12 py-6"
          >
            Get Started Free
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="small" />
          <p className="text-slate-500 text-sm">
            © 2024 Apprendre. Making learning fun.
          </p>
        </div>
      </footer>
    </div>
  );
}