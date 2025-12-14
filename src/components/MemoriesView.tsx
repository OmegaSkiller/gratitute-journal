'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Calendar, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

interface Entry {
  id: string; // or date string for local
  entry_date: string;
  content: string;
  word_count: number;
}

import { useLanguage } from '@/context/LanguageContext';

const localeMap = {
  en: enUS,
  ru: ru
};

export function MemoriesView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useLanguage();



  useEffect(() => {
    async function fetchEntries() {
      // Hybrid approach: Check Supabase first, fallback/merge Local Storage
        const localEntries: Entry[] = [];
        
        // 1. Scan Local Storage
        for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('journal_entry_')) {
            const date = key.replace('journal_entry_', '');
            const content = localStorage.getItem(key) || '';
            localEntries.push({
            id: key,
            entry_date: date,
            content: content,
            word_count: content.split(/\s+/).length
            });
        }
        }
        
      // Sort desc
      localEntries.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
      
      setEntries(localEntries);
      setLoading(false);
      
      // 2. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('entries')
          .select('id, entry_date, content, word_count')
          .order('entry_date', { ascending: false });

        if (data && !error) {
           // Merge strategies:
           // - Supabase is source of truth for its own IDs
           // - Local storage is source of truth for offline/unsynced work
           // - For simplicity: prefer Supabase if date matches, else add local
           
           const paramMap = new Map<string, Entry>();
           
           // Seed with Supabase data
           data.forEach((row: any) => {
               paramMap.set(row.entry_date, {
                   id: row.id,
                   entry_date: row.entry_date,
                   content: row.content,
                   word_count: row.word_count || row.content.split(/\s+/).length
               });
           });

           // Merge Local (only if not already present or if local serves as "draft" - simplistic merge: keep remote)
           // Actually, if local exists and remote exists, local might be newer? 
           // For this V1, let's treat Supabase as primary View.
           // Only add local if it's NOT in Supabase.
           localEntries.forEach(local => {
               if (!paramMap.has(local.entry_date)) {
                   paramMap.set(local.entry_date, local);
               }
           });
           
           // Convert back to array
           const merged = Array.from(paramMap.values());
           merged.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
           
           setEntries(merged);
        } else {
            setEntries(localEntries);
        }
      } catch (err) {
          console.error("Failed to sync memories:", err);
          setEntries(localEntries);
      } finally {
          setLoading(false);
      }

    }

    fetchEntries();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[60vh]">
      <AnimatePresence mode="wait">
        {selectedEntry ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative"
          >
            <button 
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white/60" />
            </button>
            
            <div className="flex items-center gap-2 mb-6 text-white/40 text-sm tracking-widest uppercase">
               <Calendar className="w-4 h-4" />
               {format(new Date(selectedEntry.entry_date), 'MMMM do, yyyy', { locale: localeMap[locale] })}
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="whitespace-pre-wrap leading-loose text-white/90">
                {selectedEntry.content}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {entries.length === 0 && !loading && (
                <div className="col-span-full text-center py-20 text-white/30">
                    <p>{t.memories_empty}</p>
                </div>
            )}
            
            {entries.map((entry, i) => (
              <motion.div
                key={entry.entry_date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedEntry(entry)}
                className="group cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 hover:border-white/20 p-6 rounded-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-white/40">
                    {format(new Date(entry.entry_date), 'd MMM yyyy', { locale: localeMap[locale] })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </div>
                <p className="text-white/80 line-clamp-3 font-serif leading-relaxed text-lg">
                  {entry.content}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
