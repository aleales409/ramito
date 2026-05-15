import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast, hideToast } = useApp();

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, hideToast]);

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-28 left-1/2 z-[99999] w-[90%] max-w-sm pointer-events-none"
        >
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${
            toast.type === 'error' 
              ? 'bg-[#1a1c1c] border-red-500/30 text-white' 
              : 'bg-[#1a1c1c] border-[#4be277]/30 text-white'
          }`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              toast.type === 'error' ? 'bg-red-500/10' : 'bg-[#4be277]/10'
            }`}>
              {toast.type === 'error' 
                ? <AlertCircle className="w-5 h-5 text-red-500" />
                : <CheckCircle className="w-5 h-5 text-[#4be277]" />
              }
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest italic">
                {toast.type === 'error' ? 'Error' : 'Éxito'}
              </h4>
              <p className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-wider mt-0.5 leading-tight">
                {toast.message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
