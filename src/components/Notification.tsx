'use client';

import { motion } from 'framer-motion';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Notification({ message, type, onClose }: NotificationProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className={`fixed top-5 right-5 p-4 rounded-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
    >
      {message}
      <button onClick={onClose} className="ml-4 text-white font-bold">X</button>
    </motion.div>
  );
}
