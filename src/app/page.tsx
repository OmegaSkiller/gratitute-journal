'use client';

import { useState } from "react";
import { SettingsView } from "@/components/SettingsView";
import { TimelineView } from "@/components/TimelineView";
import { Settings, X, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [streak, setStreak] = useState(0);
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#183D12] flex flex-col relative overflow-hidden transition-colors duration-500">
        
        {/* Background Gradients (Subtle) */}
        <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />

        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 md:px-12 backdrop-blur-md bg-[#183D12]/50">
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-white/90">
                {t.app_title_main} <span className="font-light italic opacity-60">{t.app_title_sub}</span>
            </h1>
            
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-black/20 ${streak > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold text-sm tracking-wide">{streak}</span>
                </div>
                
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80"
                >
                    {showSettings ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
                </button>
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 w-full pt-20">
            <AnimatePresence mode="wait">
                {showSettings ? (
                    <motion.div 
                        key="settings"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="pt-10 px-4"
                    >
                        <SettingsView />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="timeline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <TimelineView onStreakChange={setStreak} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
    </main>
  );
}
