'use client';

import { useState, useEffect } from "react";
import { Trash2, Save, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export function SettingsView() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { t, locale, setLocale } = useLanguage();

  const clearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          {t.settings_title}
      </h2>

      {/* Language Switcher */}
      <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5">
        <label className="block text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> {t.settings_language}
        </label>
        <div className="flex gap-2">
            <button 
                onClick={() => setLocale('en')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${locale === 'en' ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >
                English
            </button>
            <button 
                onClick={() => setLocale('ru')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${locale === 'ru' ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >
                Русский
            </button>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10">
        <h3 className="text-red-400 font-medium mb-4 flex items-center gap-2">
            {t.settings_danger_zone}
        </h3>
        
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t.settings_clear_data}
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center animate-in fade-in zoom-in duration-200">
            <p className="text-red-300 text-sm mb-4">
              {t.settings_clear_confirm}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="bg-black/20 hover:bg-black/40 text-white/60 px-4 py-2 rounded-lg text-sm"
              >
                {t.action_cancel}
              </button>
              <button
                onClick={clearData}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {t.action_confirm}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
