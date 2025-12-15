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
    action_confirm: "Confirm Delete",
    login_email_placeholder: "you@example.com",
    login_password_placeholder: "••••••••",
    login_signin_button: "Sign In",
    login_signup_button: "Sign Up",
    login_switch_to_signin: "Already have an account? Sign In",
    login_switch_to_signup: "Don't have an account? Sign Up",
    login_signup_subtitle: "Create an account to get started",
    login_signin_subtitle: "Sign in to your account",
    settings_export_csv: "Export to CSV",
    settings_import_csv: "Import from CSV",
    settings_import_confirm_title: "Confirm Import",
    settings_import_confirm_desc: "This will overwrite existing entries for any matching dates in the CSV file.",
    settings_logout: "Logout",
    settings_data_management: "Data Management"
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

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const saved = localStorage.getItem('app_locale') as Locale;
  if (saved && (saved === 'en' || saved === 'ru')) {
    return saved;
  }
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) {
    return 'ru';
  }
  return 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
