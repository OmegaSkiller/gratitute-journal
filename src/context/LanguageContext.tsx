'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'ru';

export const translations = {
  en: {
    app_title_main: "GRATITUDE",
    app_title_sub: "JOURNAL",
    nav_today: "Today",
    nav_memories: "Memories",
    nav_settings: "Settings",
    footer_text: "Your thoughts are private and stored locally.",
    
    // Prompt
    prompt_gratitude: "Today I am grateful for...",

    // Editor
    editor_placeholder: "Write something...",
    editor_saving: "Saving...",
    editor_saved: "Save",
    editor_words: "words",
    editor_chars: "chars",
    
    // Memories
    memories_empty: "No entries yet. Start writing today.",
    memories_date_format: "MMM d, yyyy", 
    
    // Stats
    stats_streak: "Day Streak",
    stats_entries: "Entries",
    stats_words: "Words",
    
    // Settings
    settings_title: "Settings",
    settings_language: "Language",
    settings_danger_zone: "Danger Zone",
    settings_clear_data: "Clear All Local Data",
    settings_clear_confirm: "Are you sure you want to delete all local journal entries? This cannot be undone.",
    settings_saved: "Saved!",
    action_edit: "Edit",
    action_cancel: "Cancel",
    action_confirm: "Confirm Delete"
  },
  ru: {
    app_title_main: "ЖУРНАЛ",
    app_title_sub: "БЛАГОДАРНОСТЕЙ", 
    nav_today: "Сегодня",
    nav_memories: "История",
    nav_settings: "Настройки",
    footer_text: "Ваши записи хранятся локально и конфиденциально.",

    // Prompt
    prompt_gratitude: "Сегодня я благодарна за...",

    // Editor
    editor_placeholder: "Напишите что-нибудь...",
    editor_saving: "Сохранение...",
    editor_saved: "Сохранить",
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
    settings_danger_zone: "Опасная зона",
    settings_clear_data: "Удалить все данные",
    settings_clear_confirm: "Вы уверены? Это удалит все записи безвозвратно.",
    settings_saved: "Сохранено!",
    action_edit: "Изменить",
    action_cancel: "Отмена",
    action_confirm: "Удалить"
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
  const [locale, setLocaleState] = useState<Locale>('en'); 
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('app_locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ru')) {
      setLocaleState(saved);
    } else {
        // 2. Check navigator if no local storage
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('ru')) {
            setLocaleState('ru');
        }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      document.documentElement.lang = locale;
    }
  }, [locale, isLoaded]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('app_locale', l);
  };

  const t = translations[locale];

  if (!isLoaded) {
      return <div className="min-h-screen bg-[#0f0c29]" />; // subtle loading state / flash preventer
  }

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
