import React, { useState, useEffect } from 'react';
import { Trophy, Bell, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function TopAppBar() {
  const { marqueeText, schedule, showToast } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [autoMarquee, setAutoMarquee] = useState(marqueeText);

  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    if (showToast) {
      showToast('Sesión cerrada correctamente');
    }
  };

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const isWeekend = day === 0 || day === 6; // Sunday=0, Saturday=6
      const timeRange = isWeekend ? schedule.weekend : schedule.weekday;
      
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTime = currentHours + currentMinutes / 60;
      
      const [openH, openM] = timeRange.open.split(':').map(Number);
      const openTime = openH + openM / 60;
      
      const [closeH, closeM] = timeRange.close.split(':').map(Number);
      const closeTime = closeH + closeM / 60;
      
      let currentlyOpen = false;
      if (closeTime < openTime) {
        // Crosses midnight
        if (currentTime >= openTime || currentTime <= closeTime) currentlyOpen = true;
      } else {
        if (currentTime >= openTime && currentTime <= closeTime) currentlyOpen = true;
      }
      
      setIsOpen(currentlyOpen);
      
      if (currentlyOpen) {
        setAutoMarquee(`${marqueeText} • HOY ABIERTO DE ${timeRange.open} A ${timeRange.close}`);
      } else {
        setAutoMarquee(`COMPLEJO CERRADO • ABRIMOS A LAS ${timeRange.open} • ${marqueeText}`);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [schedule, marqueeText]);

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="w-full bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-2 border-b border-white/5 overflow-hidden">
        <div className="flex-grow overflow-hidden relative">
          <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] text-[#FF9100] uppercase italic">
            {autoMarquee} • &nbsp;&nbsp;&nbsp;&nbsp;
            {autoMarquee} •
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
            isOpen ? 'bg-[#4be277]/10 border-[#4be277]/20 shadow-[0_0_10px_rgba(75,226,119,0.1)]' : 'bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-[#4be277]' : 'bg-red-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOpen ? 'bg-[#4be277]' : 'bg-red-500'}`}></span>
            </span>
            <span className={`text-[9px] font-black uppercase tracking-[0.05em] ${isOpen ? 'text-[#4be277]' : 'text-red-500'}`}>
              {isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          </div>

          {isAdmin && (
            <button 
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:bg-red-500/20 hover:scale-105 transition-all group relative"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              
              {/* Tooltip personalizado */}
              <div className="absolute right-0 top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
                <div className="bg-[#121414]/90 backdrop-blur-xl border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl whitespace-nowrap shadow-[0_5px_15px_rgba(239,68,68,0.15)]">
                  Cerrar Sesión
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
