import React, { useState, useEffect } from 'react';
import { Trophy, Bell, LogOut, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function TopAppBar() {
  const { marqueeText, secondaryMarqueeText, schedule, showToast, userName, userRole: role, setUserName, setUserRole, setUserAvatar, emergencyMode, emergencyMessage, isOnline, pendingSyncCount, triggerManualSync } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [autoMarquee, setAutoMarquee] = useState(marqueeText);

  const isLogged = !!userName || !!role || !!localStorage.getItem('ramito_user_id');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('ramito_current_session_id');
    const userId = localStorage.getItem('ramito_user_id');
    // Clean active session from Supabase to allow future login
    try {
      if (isSupabaseConfigured && sessionId && userId) {
        await supabase.from('active_sessions').delete().eq('profile_id', userId);
      }
    } catch (e) {
      console.warn('Could not clear session from Supabase:', e);
    }
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
      const currentMinutes = now.getMinutes();
      const currentTime = currentHours + currentMinutes / 60;
      
      const checkInShift = (op: string, cl: string) => {
        if (!op || !cl) return false;
        try {
          const [openH, openM] = op.split(':').map(Number);
          const [closeH, closeM] = cl.split(':').map(Number);
          const openTime = openH + openM / 60;
          const closeTime = closeH + closeM / 60;
          if (closeTime < openTime) {
            return currentTime >= openTime || currentTime <= closeTime;
          } else {
            return currentTime >= openTime && currentTime <= closeTime;
          }
        } catch (e) {
          return false;
        }
      };

      let currentlyOpen = checkInShift(timeRange.open, timeRange.close);
      if (timeRange.useTwoShifts && timeRange.open2 && timeRange.close2) {
        currentlyOpen = currentlyOpen || checkInShift(timeRange.open2, timeRange.close2);
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

  const renderActiveHoursText = () => {
    if (timeRange.useTwoShifts && timeRange.open2 && timeRange.close2) {
      return (
        <>
          <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.open}</span> A <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.close}</span>
          <span> Y </span>
          <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.open2}</span> A <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.close2}</span>
        </>
      );
    }
    return (
      <>
        <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.open}</span> A <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{timeRange.close}</span>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl md:max-w-6xl z-[300]">
      <div className="w-full bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-2 border-b border-white/5 overflow-hidden">
        <div className="flex-grow overflow-hidden relative">
          {emergencyMode ? (
            <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] uppercase italic flex items-center gap-6">
              <span className="text-red-500 font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 inline" />
                {emergencyMessage ? emergencyMessage.toUpperCase() : 'CIERRE DE EMERGENCIA'}
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 inline" />
              </span>
              <span className="text-[#FF9100] flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-[#FF9100] shrink-0 inline animate-spin" />
                REPROGRAME SU TURNO LIBREMENTE DESDE "MIS RESERVAS" SIN COSTO
              </span>
              <span className="text-zinc-500 mx-2">•</span>
              <span className="text-red-500 font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 inline" />
                {emergencyMessage ? emergencyMessage.toUpperCase() : 'CIERRE DE EMERGENCIA'}
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 inline" />
              </span>
              <span className="text-[#FF9100] flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-[#FF9100] shrink-0 inline animate-spin" />
                REPROGRAME SU TURNO LIBREMENTE DESDE "MIS RESERVAS" SIN COSTO
              </span>
              <span className="text-zinc-500 mx-2">•</span>
            </div>
          ) : (
            <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] uppercase italic">
              <span className="text-[#FF9100]">{marqueeText}</span>
              {secondaryMarqueeText && (
                <span className="text-[#009EE3] ml-3 bg-[#009EE3]/15 px-2 py-0.5 rounded-lg border border-[#009EE3]/30 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009EE3] animate-ping shrink-0" />
                  <Sparkles className="w-3.5 h-3.5 text-[#009EE3] shrink-0 inline" />
                  {secondaryMarqueeText}
                </span>
              )}
              {isOpen ? (
                <span className="text-white">
                  {' • '}HOY <span className="text-[#4be277] font-black">ABIERTO</span> DE {renderActiveHoursText()}
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
                  <Sparkles className="w-3.5 h-3.5 text-[#009EE3] shrink-0 inline" />
                  {secondaryMarqueeText}
                </span>
              )}
              {isOpen ? (
                <span className="text-white">
                  {' • '}HOY <span className="text-[#4be277] font-black">ABIERTO</span> DE {renderActiveHoursText()}
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
          {/* Badge de Conectividad / Sincronización */}
          {!isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)] animate-pulse">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-500"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.05em] text-amber-500">
                Offline
              </span>
            </div>
          ) : pendingSyncCount > 0 ? (
            <button 
              onClick={triggerManualSync}
              className="flex items-center gap-2 px-3 py-1 rounded-full border bg-sky-500/15 border-sky-500/30 hover:bg-sky-500/25 shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all cursor-pointer group"
            >
              <RefreshCw className="w-3 h-3 text-sky-400 animate-spin group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.05em] text-sky-400">
                Sync ({pendingSyncCount})
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500">
              <span className="relative flex h-1 w-1">
                <span className="relative inline-flex rounded-full h-1 w-1 bg-zinc-600"></span>
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.05em]">
                Online
              </span>
            </div>
          )}

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
