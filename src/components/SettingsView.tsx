'use client';

import { useState, useRef } from "react";
import { LogOut, Globe, Upload, Download, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Notification } from "./Notification";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthProvider";

interface SettingsViewProps {
  onLogout: () => void;
}

export function SettingsView({ onLogout }: SettingsViewProps) {
  const { t, locale, setLocale } = useLanguage();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: entries, error } = await supabase
        .from('entries')
        .select('entry_date, content, prompt_text, mood')
        .order('entry_date', { ascending: true });

      if (error) throw error;

      if (entries) {
        const headers = ['date', 'content', 'prompt', 'mood'];
        const csvContent = [
          headers.join(','),
          ...entries.map(e => `"${e.entry_date}","${e.content.replace(/"/g, '""')}","${e.prompt_text || ''}","${e.mood || ''}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
          URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'gratitude_journal_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setNotification({ message: 'Export failed.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportConfirm(true);
    }
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split(/\r?\n/);
    if (lines.length < 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    // This regex handles quoted fields, including commas and escaped quotes ("") inside them.
    const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^",\r\n]*))(?:,|\r?\n|$)/g;

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;

        const obj: { [key: string]: string } = {};
        let match;
        let headerIndex = 0;

        // Use regex to extract values from the line
        while ((match = regex.exec(lines[i])) !== null && headerIndex < headers.length) {
            // Stop if we're at the end of the line and the match is empty (handles trailing commas)
            if (match[0] === '' && regex.lastIndex === lines[i].length) break;

            // Group 1 is for quoted values, Group 2 is for unquoted.
            // Un-escape double quotes ("") to a single quote (").
            const value = match[1] !== undefined
                ? match[1].replace(/""/g, '"')
                : match[2];

            obj[headers[headerIndex]] = value.trim();
            headerIndex++;
        }

        if (Object.keys(obj).length > 0) {
            result.push(obj);
        }
    }
    return result;
  }

  const handleImportConfirm = async () => {
    if (!importFile || !user) return;
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
        const csv = event.target?.result as string;
        const parsedData = parseCSV(csv);

        const entriesToInsert = parsedData
            .map(row => {
                if (row.date && row.content) {
                    return {
                        user_id: user.id,
                        entry_date: row.date,
                        content: row.content,
                        prompt_text: row.prompt,
                        mood: row.mood,
                    };
                }
                return null;
            })
            .filter(Boolean);

        if (entriesToInsert.length > 0) {
            try {
                const { error } = await supabase.from('entries').upsert(entriesToInsert, { onConflict: 'user_id,entry_date' });
                if (error) throw error;
                setNotification({ message: 'Import successful! Reloading...', type: 'success' });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error('Import failed:', error);
                setNotification({ message: 'Import failed. Check console for details.', type: 'error' });
            }
        }
        resetImportState();
    };
    reader.readAsText(importFile);
  };

  const resetImportState = () => {
    setShowImportConfirm(false);
    setImportFile(null);
    setIsImporting(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
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

      {/* Data Management */}
      <div className="pt-8 mt-8 border-t border-white/10">
        <h3 className="text-white/80 font-medium mb-4">{t.settings_data_management}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t.settings_export_csv}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".csv" className="hidden" />
          <button
            onClick={handleImportClick}
            className="w-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t.settings_import_csv}
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-8 mt-8 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t.settings_logout}
        </button>
      </div>

      {/* Import Confirmation Modal */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#183D12] border border-white/20 rounded-2xl p-8 max-w-sm w-full text-center"
          >
            <h3 className="text-xl font-bold text-white mb-4">{t.settings_import_confirm_title}</h3>
            <p className="text-white/60 mb-6">{t.settings_import_confirm_desc}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={resetImportState} className="px-6 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20">
                {t.action_cancel}
              </button>
              <button
                onClick={handleImportConfirm}
                disabled={isImporting}
                className="px-6 py-2 rounded-lg bg-white text-[#183D12] font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.action_confirm}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
    </>
  );
}
