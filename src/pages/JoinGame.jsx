import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/ui/Logo';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const handleJoin = () => {
    if (gameCode.length !== 6) {
      toast.error('Please enter a valid 6-digit game code');
      return;
    }
    
    window.location.href = createPageUrl(`Play?code=${gameCode}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = createPageUrl('Dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-white">
            <Logo size="small" />
          </div>
          <div className="w-10" />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Join a Game</h1>
          <p className="text-slate-500 mb-8">Enter the 6-digit game PIN shown on the host's screen</p>
          
          <div className="space-y-6">
            <Input
              placeholder="GAME PIN"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              className="text-center text-4xl font-bold tracking-[0.3em] h-20 border-2 focus:border-violet-500"
              maxLength={6}
            />
            
            <Button 
              onClick={handleJoin}
              disabled={gameCode.length !== 6 || isJoining}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 py-7 text-xl font-bold gap-3"
            >
              {isJoining ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>Enter</>
              )}
            </Button>
          </div>
          
          <p className="text-slate-400 text-sm mt-8">
            Don't have a code? Ask the host to share the game PIN with you.
          </p>
        </motion.div>
      </main>
    </div>
  );
}