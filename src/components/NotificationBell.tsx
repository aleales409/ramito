import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function NotificationBell() {
  const { notifications, setNotifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications ? notifications.filter((n: any) => !n.read).length : 0;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          if (!showNotifications && unreadCount > 0) markAllAsRead();
          setShowNotifications(!showNotifications);
        }}
        className="w-12 h-12 rounded-2xl bg-[#1a1c1c] flex items-center justify-center text-[#bccbb9] hover:bg-white/10 hover:text-white transition-all relative border border-white/10 shadow-lg"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#121414] text-[8px] font-black text-white flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-[#1a1c1c] rounded-[2rem] border border-white/10 shadow-3xl overflow-hidden p-5 space-y-4 z-[101]"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-[0.3em]">Notificaciones</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[8px] font-bold text-[#bccbb9]/40 hover:text-red-400 uppercase tracking-widest transition-colors"
                  >
                    Limpiar Todo
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                    <Bell className="w-10 h-10 text-[#bccbb9]/10 mx-auto mb-3" />
                    <p className="text-[9px] font-bold text-[#bccbb9]/30 uppercase tracking-[0.2em] italic">Sin novedades por ahora</p>
                  </div>
                ) : (
                  [...notifications].reverse().map((n: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-1.5 hover:bg-white/[0.04] transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-white text-[11px] font-black uppercase italic leading-tight group-hover:text-[#FF9100] transition-colors">{n.title}</span>
                        <span className="text-[8px] font-bold text-[#bccbb9]/30 uppercase tracking-widest">{n.time}</span>
                      </div>
                      <p className="text-[10px] font-medium text-[#bccbb9] uppercase tracking-wider leading-relaxed">{n.body}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
