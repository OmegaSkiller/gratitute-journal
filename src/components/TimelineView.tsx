'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Loader2, PenLine, Save, Plus } from 'lucide-react';

interface Entry {
  id: string;
  entry_date: string;
  content: string;
}

const localeMap = {
  en: enUS,
  ru: ru
};

interface TimelineViewProps {
  onStreakChange?: (streak: number) => void;
}

export function TimelineView({ onStreakChange }: TimelineViewProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayContent, setTodayContent] = useState('');
  const [isEditingToday, setIsEditingToday] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { t, locale } = useLanguage();

  const todayDate = new Date().toISOString().split('T')[0];

  const calculateStreak = useCallback((sortedEntries: Entry[]) => {
    if (sortedEntries.length === 0) {
        onStreakChange?.(0);
        return;
    }

    const reversed = [...sortedEntries].reverse();
    let streak = 0;
    const entryDates = new Set(reversed.map(e => e.entry_date));

    const dateCursor = new Date();
    let dateString = dateCursor.toISOString().split('T')[0];

    if (!entryDates.has(dateString)) {
        dateCursor.setDate(dateCursor.getDate() - 1);
        dateString = dateCursor.toISOString().split('T')[0];
    }

    while (entryDates.has(dateString)) {
        streak++;
        dateCursor.setDate(dateCursor.getDate() - 1);
        dateString = dateCursor.toISOString().split('T')[0];
    }

    onStreakChange?.(streak);
  }, [onStreakChange]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, entry_date, content')
        .order('entry_date', { ascending: true });

      if (error) throw error;

      if (data) {
        setEntries(data);
        calculateStreak(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStreak]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, fetchEntries]);

  // Auto-scroll to bottom when entries load or input toggles
  useEffect(() => {
    if (!loading && bottomRef.current) {
        // Wait a tick for layout reflow
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  }, [loading, entries, isEditingToday, showInput]);

  // Check if today exists in entries
  const todayEntry = entries.find(e => e.entry_date === todayDate);

  const handleSaveToday = async () => {
    if (!todayContent.trim() || !user) return;
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('entries')
        .upsert(
          {
            entry_date: todayDate,
            content: todayContent,
            user_id: user.id,
          },
          { onConflict: 'user_id,entry_date' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedEntries = todayEntry
          ? entries.map((e) => (e.entry_date === todayDate ? data : e))
          : [...entries, data];

        updatedEntries.sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

        setEntries(updatedEntries);
        calculateStreak(updatedEntries);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsEditingToday(false);
      setShowInput(false);
      setIsSaving(false);
    }
  };

  const startEditing = () => {
      setTodayContent(todayEntry?.content || '');
      setIsEditingToday(true);
      setShowInput(true);
  };
  
  const handleFabClick = () => {
      setTodayContent('');
      setShowInput(true);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white/50" /></div>;

  const pastEntries = entries.filter(e => e.entry_date !== todayDate);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 pb-40 relative min-h-screen flex flex-col justify-end">
      {/* Vertical Line */}
      <div className="absolute left-15 md:left-8 top-0 bottom-0 w-px bg-white/20" />

      {/* Past Entries */}
      <div className="space-y-12 mb-12">
        {pastEntries.map((entry) => (
            <motion.div 
                key={entry.entry_date} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative pl-15 md:pl-10"
            >
                {/* Dot */}
                <div className="absolute left-15 md:left-8 top-3 w-3 h-3 bg-[#183D12] border-2 border-white rounded-full z-10 -translate-x-[1.95rem]" />
                
                {/* Date */}
                <h3 className="font-serif text-2xl font-bold text-white/90 mb-2">
                    {format(new Date(entry.entry_date), 'MMMM d, yyyy', { locale: localeMap[locale] })}
                </h3>
                
                {/* Content */}
                <p className="text-white/60 leading-relaxed font-light text-lg">
                    {entry.content}
                </p>
            </motion.div>
        ))}
      </div>

      {/* Today's Section */}
      <div className="relative pl-15 md:pl-10 mt-8">
         {/* Dot */}
         <div className="absolute left-15 md:left-8 top-3 w-4 h-4 bg-white rounded-full z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)] -translate-x-[1.95rem]" />

         <h3 className="font-serif text-2xl font-bold text-white mb-1">
            {format(new Date(), 'MMMM d, yyyy', { locale: localeMap[locale] })}
         </h3>
         
         <div className="text-white/40 text-sm italic mb-4 font-serif tracking-wide">
            {t.prompt_gratitude}
         </div>

         {/* Logic: 
             If todayEntry exists AND NOT Editing -> Show Content
             If showInput OR Editing -> Show Card
             Else -> Show nothing (Wait for FAB)
         */}
         
         <AnimatePresence mode="wait">
            {todayEntry && !isEditingToday ? (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group relative"
                 >
                     <p className="text-white/90 leading-relaxed font-light text-lg whitespace-pre-wrap">
                        {todayEntry.content}
                     </p>
                     <button 
                        onClick={startEditing}
                        className="mt-4 text-white/40 hover:text-white text-xs flex items-center gap-2 transition-colors uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full"
                     >
                        <PenLine className="w-3 h-3" /> {t.action_edit || "Edit"}
                     </button>
                 </motion.div>
            ) : (showInput || isEditingToday) ? (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md"
                 >
                     <textarea 
                        value={todayContent}
                        onChange={(e) => setTodayContent(e.target.value)}
                        placeholder={t.editor_placeholder}
                        className="w-full bg-transparent text-white text-lg placeholder:text-white/20 focus:outline-none resize-none min-h-[150px] leading-relaxed"
                        autoFocus
                     />
                     <div className="flex justify-end mt-2">
                         <button 
                            onClick={handleSaveToday}
                            disabled={isSaving}
                            className="bg-white text-[#183D12] px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg"
                         >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t.editor_saved}
                         </button>
                     </div>
                 </motion.div>
            ) : null}
         </AnimatePresence>
      </div>

      {/* FAB (Floating Action Button) */}
      <AnimatePresence>
          {!todayEntry && !showInput && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFabClick}
                className="fixed bottom-8 right-8 w-14 h-14 bg-white text-[#183D12] rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-shadow"
              >
                  <Plus className="w-8 h-8" />
              </motion.button>
          )}
      </AnimatePresence>

      {/* Anchor for Auto-scroll */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
