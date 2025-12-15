'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { Notification } from './Notification';
import { AnimatePresence } from 'framer-motion';

export function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useLanguage();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setNotification({ message: 'Check your email for the confirmation link!', type: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'error_description' in err) {
        setError((err as { error_description: string }).error_description);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
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
      <div className="w-full max-w-sm mx-auto flex flex-col justify-center min-h-[60vh]">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white/90">
                {t.app_title_main}
            </h1>
            <p className="text-white/50">{isSignUp ? t.login_signup_subtitle : t.login_signin_subtitle}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.login_email_placeholder}
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login_password_placeholder}
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-white text-[#183D12] font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-colors shadow-lg disabled:opacity-50"
            >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSignUp ? t.login_signup_button : t.login_signin_button}
            </button>

            {error && <p className="text-red-400 text-center">{error}</p>}

        </form>

        <div className="text-center mt-6">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-white/50 hover:text-white transition-colors">
                {isSignUp ? t.login_switch_to_signin : t.login_switch_to_signup}
            </button>
        </div>
      </div>
    </>
  );
}
