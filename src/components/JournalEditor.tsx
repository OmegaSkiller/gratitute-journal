'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function JournalEditor() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { t } = useLanguage();
  
  // Calculate stats
  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  const charCount = content.length;

  // Load from local storage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedContent = localStorage.getItem(`journal_entry_${today}`);
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // Auto-save logic
  const saveContent = useCallback(async (text: string) => {
    if (!text) return;
    
    setIsSaving(true);
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Save to Local Storage (Immediate backup)
    localStorage.setItem(`journal_entry_${today}`, text);

    // 2. Save to Supabase (if user is logged in - mocked for now)
    // In a real app, we'd check session here.
    try {
        const { error } = await supabase.from('entries').upsert({
            entry_date: today,
            content: text,
            word_count: text.trim().split(/\s+/).length,
            updated_at: new Date().toISOString()
        }, { onConflict: 'entry_date' }); // Assuming entry_date is unique per user logic via policies/cols
        
        if (error) {
             // If table doesn't exist or RLS blocks, silent fail for now in this 'mock' phase
             // console.warn("Supabase save failed (expected if not set up):", error);
        }
    } catch (e) {
        // quiet fail
    }

    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 800);
  }, []);

  // Debounce the save
  useEffect(() => {
    const timer = setTimeout(() => {
      saveContent(content);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, saveContent]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="w-full max-w-4xl mx-auto relative flex flex-col h-[60vh] md:h-[70vh]"
    >
      <div className="flex-1 relative group focus-within:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-shadow duration-700 rounded-3xl">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:bg-white/10 group-focus-within:bg-white/[0.07] group-focus-within:border-white/20"></div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.editor_placeholder}
          className="relative w-full h-full bg-transparent p-8 md:p-12 text-lg md:text-xl leading-[2] tracking-wide text-white/95 placeholder:text-white/20 resize-none focus:outline-none font-sans"
          spellCheck={false}
        />
      </div>

      <div className="flex justify-between items-center px-6 py-4 text-white/40 text-sm font-medium">
        <div className="flex gap-4">
           <span>{wordCount} {t.editor_words}</span>
           <span>{charCount} {t.editor_chars}</span>
        </div>
        <div className="flex items-center gap-2 transition-all duration-300">
           {isSaving ? (
               <><Loader2 className="w-4 h-4 animate-spin" /> {t.editor_saving}</>
           ) : lastSaved ? (
               <><Save className="w-4 h-4" /> {t.editor_saved} {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</>
           ) : (
               <span className="opacity-0">{t.editor_saved}</span>
           )}
        </div>
      </div>
    </motion.div>
  );
}
