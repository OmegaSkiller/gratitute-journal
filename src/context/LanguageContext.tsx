'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'ru';

export const translations = {
  en: {
    app_title_main: "DAILY",
    app_title_sub: "JOURNAL",
    nav_today: "Today",
    nav_memories: "Memories",
    nav_settings: "Settings",
    footer_text: "Your thoughts are private and stored locally.",
    
    // Prompt
    prompt_loading: "Consulting the stars...",
    fallback_prompts: [
        "What would you tell your younger self today?",
        "Describe a moment when you felt truly alive.",
        "What are you avoiding thinking about?",
        "What is a small kindness you witnessed recently?",
        "How does the weather today match or contrast your mood?"
    ],

    // Editor
    editor_placeholder: "Unload your mind...",
    editor_saving: "Saving...",
    editor_saved: "Saved",
    editor_words: "words",
    editor_chars: "chars",
    
    // Memories
    memories_empty: "No memories yet. Start writing today.",
    memories_date_format: "MMM d, yyyy", // simplified format string for date-fns if we do dynamic locale load, or handled in logic
    
    // Stats
    stats_streak: "Day Streak",
    stats_entries: "Entries",
    stats_words: "Words",
    
    // Settings
    settings_title: "Settings",
    settings_language: "Language",
    settings_openai_label: "OpenAI API Key",
    settings_openai_hint: "Required if you want AI-generated personalized prompts. Stored locally on your device.",
    settings_danger_zone: "Danger Zone",
    settings_clear_data: "Clear All Local Data",
    settings_clear_confirm: "Are you sure you want to delete all local journal entries? This cannot be undone.",
    settings_saved: "Saved!"
  },
  ru: {
    app_title_main: "ЖУРНАЛ",
    app_title_sub: "БЛАГОДАРНОСТЕЙ", // "Журнал Благодарностей"
    nav_today: "Сегодня",
    nav_memories: "История",
    nav_settings: "Настройки",
    footer_text: "Ваши записи хранятся локально и конфиденциально.",

    // Prompt
    prompt_loading: "Спрашиваем звезды...",
    fallback_prompts: [
        "За что вы благодарны сегодня?",
        "Кто сделал ваш день лучше и почему?",
        "Какой простой момент принес вам радость сегодня?",
        "Напишите о человеке, которому вы благодарны.",
        "Какое качество в себе вы цените больше всего?"
    ],

    // Editor
    editor_placeholder: "Запишите свои мысли...",
    editor_saving: "Сохранение...",
    editor_saved: "Сохранено",
    editor_words: "слов",
    editor_chars: "симв",

    // Memories
    memories_empty: "Записей пока нет. Начните писать сегодня.",
    memories_date_format: "d MMM yyyy",

    // Stats
    stats_streak: "Дней подряд",
    stats_entries: "Записей",
    stats_words: "Слов",

    // Settings
    settings_title: "Настройки",
    settings_language: "Язык",
    settings_openai_label: "API Ключ OpenAI",
    settings_openai_hint: "Нужен для генерации персональных тем от ИИ. Хранится локально.",
    settings_danger_zone: "Опасная зона",
    settings_clear_data: "Удалить все данные",
    settings_clear_confirm: "Вы уверены? Это удалит все записи безвозвратно.",
    settings_saved: "Сохранено!"
  }
};

type Messages = typeof translations.en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en'); // Default en, will hydrate

  useEffect(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('app_locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ru')) {
      setLocaleState(saved);
      return;
    }

    // 2. Check navigator
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ru')) {
      setLocaleState('ru');
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('app_locale', l);
  };

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
