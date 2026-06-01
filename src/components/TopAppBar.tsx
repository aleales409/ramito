import React, { useState, useEffect } from 'react';
import { Trophy, Bell, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function TopAppBar() {
  const { marqueeText, secondaryMarqueeText, schedule, showToast, userName, userRole: role, setUserName, setUserRole, setUserAvatar, emergencyMode, emergencyMessage } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [autoMarquee, setAutoMarquee] = useState(marqueeText);

  const isLogged = !!userName || !!role || !!localStorage.getItem('ramito_user_id');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  const handleLogout = () => {
    localStorage.removeItem('ramito_current_session_id');
    localStorage.removeItem('ramito_user_id');
    localStorage.removeItem('ramito_user_name');
    localStorage.removeItem('ramito_user_role');
    localStorage.removeItem('ramito_user_email');
    localStorage.removeItem('ramito_user_pw');
    setUserName('');
    setUserRole(null);
    setUserAvatar(null);
    navigate('/');
    if (showToast) {
      showToast('Sesión cerrada correctamente', 'success');
    }
  };

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const isWeekend = day === 0 || day === 6; // Sunday=0, Saturday=6
      const timeRange = isWeekend ? schedule.weekend : schedule.weekday;
      
      const currentHours = now.getHours();
      const [openH, openM] = timeRange.open.split(':').map(Number);
      const [closeH, closeM] = timeRange.close.split(':').map(Number);
      
      const currentMinutes = now.getMinutes();
      const currentTime = currentHours + currentMinutes / 60;
      const openTime = openH + openM / 60;
      const closeTime = closeH + closeM / 60;
      
      let currentlyOpen = false;
      if (closeTime < openTime) {
        if (currentTime >= openTime || currentTime <= closeTime) currentlyOpen = true;
      } else {
        if (currentTime >= openTime && currentTime <= closeTime) currentlyOpen = true;
      }
      
      setIsOpen(currentlyOpen);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const now = new Date();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const timeRange = isWeekend ? schedule.weekend : schedule.weekday;

  const displayIsOpen = emergencyMode ? false : isOpen;

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl md:max-w-6xl z-[300]">
      <div className="w-full bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-2 border-b border-white/5 overflow-hidden">
        <div className="flex-grow overflow-hidden relative">
          {emergencyMode ? (
            <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] uppercase italic">
              <span className="text-red-500 font-extrabold">🚨 {emergencyMessage ? emergencyMessage.toUpperCase() : 'CIERRE DE EMERGENCIA'} 🚨</span>
              <span className="text-[#FF9100] ml-6">🔄 REPROGRAME SU TURNO LIBREMENTE DESDE "MIS RESERVAS" SIN COSTO</span>
              <span className="text-zinc-500 mx-6">•</span>
              <span className="text-red-500 font-extrabold">🚨 {emergencyMessage ? emergencyMessage.toUpperCase() : 'CIERRE DE EMERGENCIA'} 🚨</span>
              <span className="text-[#FF9100] ml-6">🔄 REPROGRAME SU TURNO LIBREMENTE DESDE "MIS RESERVAS" SIN COSTO</span>
              <span className="text-zinc-500 mx-6">•</span>
            </div>
          ) : (
            <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] uppercase italic">
              <span className="text-[#FF9100]">{marqueeText}</span>
              {secondaryMarqueeText && (
                <span className="text-[#009EE3] ml-3 bg-[#009EE3]/15 px-2 py-0.5 rounded-lg border border-[#009EE3]/30 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009EE3] animate-ping shrink-0" />
                  ⚡ {secondaryMarqueeText}
                </span>
              )}
              {isOpen ? (
                <span className="text-white">
                  {' • '}HOY <span className="text-[#4be277] font-black">ABIERTO</span> DE{' '}
                  <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.open}</span>
                  {' '}A{' '}
                  <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.close}</span>
                </span>
              ) : (
                <span className="text-zinc-400">
                  {' • '}<span className="text-red-500 font-extrabold">COMPLEJO CERRADO</span> • ABRIMOS A LAS{' '}
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.open}</span>
                </span>
              )}
              <span className="text-zinc-500 mx-5">•</span>
              {/* Duplicate for seamless infinite loop */}
              <span className="text-[#FF9100]">{marqueeText}</span>
              {secondaryMarqueeText && (
                <span className="text-[#009EE3] ml-3 bg-[#009EE3]/15 px-2 py-0.5 rounded-lg border border-[#009EE3]/30 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009EE3] animate-ping shrink-0" />
                  ⚡ {secondaryMarqueeText}
                </span>
              )}
              {isOpen ? (
                <span className="text-white">
                  {' • '}HOY <span className="text-[#4be277] font-black">ABIERTO</span> DE{' '}
                  <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/30 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.open}</span>
                  {' '}A{' '}
                  <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/30 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.close}</span>
                </span>
              ) : (
                <span className="text-zinc-400">
                  {' • '}<span className="text-red-500 font-extrabold">COMPLEJO CERRADO</span> • ABRIMOS A LAS{' '}
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.open}</span>
                </span>
              )}
              <span className="text-zinc-500 mx-5">•</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
            displayIsOpen ? 'bg-[#4be277]/10 border-[#4be277]/20 shadow-[0_0_10px_rgba(75,226,119,0.1)]' : 'bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] animate-pulse'
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${displayIsOpen ? 'bg-[#4be277]' : 'bg-red-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${displayIsOpen ? 'bg-[#4be277]' : 'bg-red-500'}`}></span>
            </span>
            <span className={`text-[9px] font-black uppercase tracking-[0.05em] ${displayIsOpen ? 'text-[#4be277]' : 'text-red-500'}`}>
              {emergencyMode ? 'F. MAYOR' : (displayIsOpen ? 'Abierto' : 'Cerrado')}
            </span>
          </div>

          {isLogged && (
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
