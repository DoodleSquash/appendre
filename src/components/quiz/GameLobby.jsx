import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Play, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GameLobby({ gameCode, players, isHost, onStart, quizTitle }) {
  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast.success('Game code copied!');
  };
  
  const shareGame = () => {
    const url = `${window.location.origin}?join=${gameCode}`;
    if (navigator.share) {
      navigator.share({
        title: `Join my quiz: ${quizTitle}`,
        text: `Use code ${gameCode} to join!`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Share link copied!');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col items-center justify-center p-6">
      {/* Game Code Display */}
      <motion.div 
        className="bg-white rounded-3xl shadow-2xl p-8 text-center mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-slate-500 mb-2">Join at apprendre.app</p>
        <h2 className="text-lg font-medium text-slate-700 mb-4">Game PIN:</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="text-5xl md:text-7xl font-black tracking-wider text-slate-800 font-mono">
            {gameCode}
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-center">
          <Button variant="outline" onClick={copyGameCode} className="gap-2">
            <Copy className="w-4 h-4" /> Copy
          </Button>
          <Button variant="outline" onClick={shareGame} className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>
      </motion.div>
      
      {/* Quiz Title */}
      <motion.h1 
        className="text-2xl md:text-4xl font-bold text-white text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {quizTitle}
      </motion.h1>
      
      {/* Players List */}
      <motion.div 
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-white" />
          <span className="text-white font-semibold text-lg">
            {players.length} Player{players.length !== 1 ? 's' : ''} Joined
          </span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout">
            {players.map((player, index) => (
              <motion.div
                key={player.email}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm">
                  {(player.name || player.email)?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-slate-700">
                  {player.name || player.email?.split('@')[0]}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {players.length === 0 && (
          <p className="text-white/70 text-center py-4">
            Waiting for players to join...
          </p>
        )}
      </motion.div>
      
      {/* Start Button (Host Only) */}
      {isHost && players.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button 
            size="lg" 
            onClick={onStart}
            className="bg-white text-violet-600 hover:bg-slate-100 text-xl px-12 py-6 rounded-full font-bold shadow-2xl gap-3"
          >
            <Play className="w-6 h-6" /> Start Game
          </Button>
        </motion.div>
      )}
    </div>
  );
}