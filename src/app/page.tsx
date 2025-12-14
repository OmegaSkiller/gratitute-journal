'use client';

import { useState, useEffect } from "react";
import { DailyPrompt } from "@/components/DailyPrompt";
import { JournalEditor } from "@/components/JournalEditor";
import { MemoriesView } from "@/components/MemoriesView";
import { StatsDashboard } from "@/components/StatsDashboard";
import { SettingsView } from "@/components/SettingsView";
import { PenLine, History, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

type View = 'write' | 'memories' | 'settings';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('write');
  const { t } = useLanguage();
  
  // Quick stats calculation (mock/local)
  const [stats, setStats] = useState({ totalEntries: 0, currentStreak: 0, totalWords: 0 });

  useEffect(() => {
     // Simple stats from local storage for now
     let entriesCount = 0;
     let wordsCount = 0;
     // Streak logic would be more complex, just mock for now or calculate simply
     
     if (typeof window !== 'undefined') {
         for (let i = 0; i < localStorage.length; i++) {
             const key = localStorage.key(i);
             if (key?.startsWith('journal_entry_')) {
                 entriesCount++;
                 const content = localStorage.getItem(key) || '';
                 wordsCount += content.split(/\s+/).length;
             }
         }
         setStats({
             totalEntries: entriesCount,
             currentStreak: entriesCount > 0 ? 1 : 0, // Naive streak
             totalWords: wordsCount
         });
     }
  }, [currentView]); // Re-calc when view changes

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-[10s]"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-[15s]"></div>

        <header className="relative z-10 w-full max-w-5xl flex justify-between items-center mb-6 md:mb-12 px-2 md:px-0">
            <h1 className="text-xl font-bold tracking-tighter text-white/80">
                {t.app_title_main}<span className="text-white/40 font-light">{t.app_title_sub}</span>
            </h1>
            
            <nav className="flex items-center gap-1 md:gap-2 bg-black/20 backdrop-blur-xl p-1.5 rounded-full border border-white/5 shadow-xl">
                <button 
                  onClick={() => setCurrentView('write')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'write' ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                >
                    <span className="flex items-center gap-2"><PenLine className="w-4 h-4" /> <span className="hidden md:inline">{t.nav_today}</span></span>
                </button>
                <button 
                  onClick={() => setCurrentView('memories')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'memories' ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                >
                     <span className="flex items-center gap-2"><History className="w-4 h-4" /> <span className="hidden md:inline">{t.nav_memories}</span></span>
                </button>
                <button 
                  onClick={() => setCurrentView('settings')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentView === 'settings' ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                >
                     <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> <span className="hidden md:inline">{t.nav_settings}</span></span>
                </button>
            </nav>
        </header>

        <div className="w-full relative z-10">
             <AnimatePresence mode="wait">
                {currentView === 'write' ? (
                    <motion.div
                        key="write-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <DailyPrompt />
                        <JournalEditor />
                    </motion.div>
                ) : currentView === 'memories' ? (
                     <motion.div
                        key="memories-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <StatsDashboard {...stats} />
                        <MemoriesView />
                    </motion.div>
                ) : (
                    <motion.div
                        key="settings-view"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                         className="flex flex-col items-center gap-8 w-full"
                    >
                        <SettingsView />
                    </motion.div>
                )}
             </AnimatePresence>
        </div>
        
        <footer className="mt-auto relative z-10 text-center w-full text-white/20 text-xs py-4">
            <p>{t.footer_text}</p>
        </footer>
    </main>
  );
}
