import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react';
import { cn } from '@/utils';

const rankStyles = {
  1: { bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', icon: Trophy, color: 'text-amber-600' },
  2: { bg: 'bg-gradient-to-r from-slate-300 to-slate-400', icon: Medal, color: 'text-slate-600' },
  3: { bg: 'bg-gradient-to-r from-amber-600 to-orange-700', icon: Award, color: 'text-amber-700' }
};

export default function Leaderboard({ players, currentUserEmail, showAnimation = true }) {
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Leaderboard
          </h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              const style = rankStyles[rank];
              const isCurrentUser = player.email === currentUserEmail;
              
              return (
                <motion.div
                  key={player.email}
                  layout
                  initial={showAnimation ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: showAnimation ? index * 0.1 : 0 }}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors",
                    isCurrentUser && "bg-violet-50"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                    style ? `${style.bg} text-white` : "bg-slate-100 text-slate-600"
                  )}>
                    {style ? <style.icon className="w-6 h-6" /> : rank}
                  </div>
                  
                  {/* Avatar & Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold">
                        {(player.name || player.email)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className={cn(
                          "font-semibold text-slate-800 truncate",
                          isCurrentUser && "text-violet-700"
                        )}>
                          {player.name || player.email?.split('@')[0]}
                          {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                        </p>
                        {player.streak > 1 && (
                          <div className="flex items-center gap-1 text-orange-500 text-sm">
                            <Flame className="w-4 h-4" />
                            <span>{player.streak} streak!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">
                      {(player.score || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">points</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {sortedPlayers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No players yet
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}