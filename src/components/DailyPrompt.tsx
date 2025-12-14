'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

export function DailyPrompt() {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { t, locale } = useLanguage();

  useEffect(() => {
    async function fetchPrompt() {
      // Logic:
      // 1. If locale is Russian, stick to our curated Russian fallback prompts (unless we add RU support to DB later).
      // 2. If English, try DB first, then fallback.
      
      if (locale === 'ru') {
          const dateIndex = new Date().getDate() % t.fallback_prompts.length;
          setPrompt(t.fallback_prompts[dateIndex]);
          setLoading(false);
          return;
      }

      try {
        const { data, error } = await supabase
          .from('prompts')
          .select('text')
          .eq('display_date', new Date().toISOString().split('T')[0])
          .single();
        
        if (data && !error) {
          setPrompt(data.text);
        } else {
          // Fallback based on date
          const dateIndex = new Date().getDate() % t.fallback_prompts.length;
          setPrompt(t.fallback_prompts[dateIndex]);
        }
      } catch (e) {
        console.error("Error fetching prompt:", e);
        const dateIndex = new Date().getDate() % t.fallback_prompts.length;
        setPrompt(t.fallback_prompts[dateIndex]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompt();
  }, [t.fallback_prompts, locale]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 text-center px-4">
      {loading ? (
        <div className="animate-pulse h-12 bg-white/10 rounded-lg w-3/4 mx-auto"></div>
      ) : (
        <motion.div
          key={prompt} // Animate on change
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h2 className="text-xl md:text-3xl font-light tracking-wide text-white/90 leading-relaxed font-serif italic">
            "{prompt}"
          </h2>
        </motion.div>
      )}
    </div>
  );
}


