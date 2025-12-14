'use client';

import { motion } from 'framer-motion';
import { Trophy, BookOpen, Flame } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface StatsProps {
  totalEntries: number;
  currentStreak: number;
  totalWords: number;
}

export function StatsDashboard({ totalEntries, currentStreak, totalWords }: StatsProps) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-4xl mx-auto mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center"
      >
        <Flame className="w-6 h-6 text-orange-400 mb-2" />
        <span className="text-2xl font-bold text-white">{currentStreak}</span>
        <span className="text-xs text-white/40 uppercase tracking-widest">{t.stats_streak}</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center"
      >
        <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
        <span className="text-2xl font-bold text-white">{totalEntries}</span>
        <span className="text-xs text-white/40 uppercase tracking-widest">{t.stats_entries}</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center"
      >
        <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
        <span className="text-2xl font-bold text-white">{totalWords}</span>
        <span className="text-xs text-white/40 uppercase tracking-widest">{t.stats_words}</span>
      </motion.div>
    </div>
  );
}
