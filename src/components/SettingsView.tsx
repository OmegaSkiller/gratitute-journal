'use client';

import { useState, useEffect, useRef } from "react";
import { Trash2, Save, Globe, LogIn, LogOut, Download, Upload, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/lib/supabase";

import { exportToCSV, parseCSV, CSVEntry } from "@/lib/csv-utils";

export function SettingsView() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, locale, setLocale } = useLanguage();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setUser(session?.user ?? null);
       setLoadingUser(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoadingUser(false);
  }

  const clearData = () => {
    localStorage.clear();
    window.location.reload();
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
  };

  const handleExport = () => {
     const entries: CSVEntry[] = [];
     for (let i = 0; i < localStorage.length; i++) {
         const key = localStorage.key(i);
         if (key?.startsWith('journal_entry_')) {
             const date = key.replace('journal_entry_', '');
             const content = localStorage.getItem(key) || '';
             entries.push({ date, content });
         }
     }
     
     if (entries.length === 0) {
         alert(t.memories_empty || "No entries to export");
         return;
     }

     // Sort
     entries.sort((a, b) => a.date.localeCompare(b.date));
     exportToCSV(entries);
  }

  const handleImportClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const entries = parseCSV(text);
      
      if (entries.length > 0) {
          let count = 0;
          entries.forEach(entry => {
              const key = `journal_entry_${entry.date}`;
              // Only import if not empty? Or overwrite? 
              // Overwrite logic usually expected for import/restore.
              if (!localStorage.getItem(key)) { // Let's simplify: only add new? OR overwrite?
                  // User asked for "Import". Usually implies Restore. 
                  // Let's safe behavior: Upsert.
                  localStorage.setItem(key, entry.content);
                  count++;
              } else {
                   // Conflict. For now, skip if exists? Or overwrite?
                   // Let's overwrite for now or maybe just `setItem` directly.
                   localStorage.setItem(key, entry.content); // Overwrite.
                   count++;
              }
          });
          
          alert(`${t.data_import_success} (${count} entries)`);
          window.location.reload(); // Refresh to show new entries
      } else {
          alert(t.data_import_error);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

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

      {/* Account Section */}
      <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5">
         <h3 className="block text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
             <User className="w-4 h-4" /> {t.auth_account}
         </h3>
         
         {loadingUser ? (
             <div className="flex items-center gap-2 text-white/40 text-sm">
                 <Loader2 className="w-4 h-4 animate-spin" /> {t.auth_loading}
             </div>
         ) : user ? (
             <div className="flex items-center justify-between">
                 <div className="text-white text-sm">
                     <div className="text-white/40 text-xs mb-0.5">{t.auth_logged_in_as}</div>
                     <div className="font-medium">{user.email}</div>
                 </div>
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors border border-red-500/10"
                 >
                     <LogOut className="w-4 h-4" /> {t.auth_sign_out}
                 </button>
             </div>
         ) : (
             <div className="text-center">
                 <p className="text-white/40 text-sm mb-4">{t.auth_not_logged_in}</p>
                 <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-white text-[#183D12] font-bold py-2.5 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                 >
                     <LogIn className="w-4 h-4" /> {t.auth_login}
                 </button>
             </div>
         )}
      </div>

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
      
      {/* Data Management */}
      <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5">
         <h3 className="block text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
             <Save className="w-4 h-4" /> {t.data_title}
         </h3>
         <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white/80 active:scale-95 transition-all text-sm"
             >
                 <Download className="w-4 h-4" /> {t.data_export}
             </button>
             <button 
                onClick={handleImportClick}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white/80 active:scale-95 transition-all text-sm"
             >
                 <Upload className="w-4 h-4" /> {t.data_import}
             </button>
             <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
             />
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

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
            checkUser();
            // TODO: Trigger sync?
        }}
      />
    </motion.div>
  );
}
