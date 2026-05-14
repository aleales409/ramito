import React, { useState } from 'react';
import { Trophy, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export default function TopAppBar() {
  const { isComplexOpen } = useApp();

  return (
    <header className="fixed top-0 left-0 w-full flex flex-col justify-end px-5 h-24 bg-[#121414]/60 backdrop-blur-xl border-b border-white/10 z-50 pb-3">
      <div className="w-full bg-[#1a1c1c] flex items-center justify-between px-5 py-1 border-b border-white/5 overflow-hidden absolute top-0 left-0">
        <div className="flex-grow overflow-hidden relative">
          <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] text-[#FF9100] uppercase italic">
            COMPLEJO RAMITO FUT SHOW • EL MEJOR NIVEL • {isComplexOpen ? 'RESERVAS ABIERTAS • VEN A JUGAR' : 'COMPLEJO CERRADO TEMPORALMENTE'} • &nbsp;&nbsp;&nbsp;&nbsp;
            COMPLEJO RAMITO FUT SHOW • EL MEJOR NIVEL • {isComplexOpen ? 'RESERVAS ABIERTAS • VEN A JUGAR' : 'COMPLEJO CERRADO TEMPORALMENTE'} •
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-0.5 rounded-full ml-4 border transition-colors ${
          isComplexOpen ? 'bg-[#4be277]/10 border-[#4be277]/20 shadow-[0_0_10px_rgba(75,226,119,0.1)]' : 'bg-red-500/10 border-red-500/20'
        }`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isComplexOpen ? 'bg-[#4be277]' : 'bg-red-500'}`}></span>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isComplexOpen ? 'bg-[#4be277]' : 'bg-red-500'}`}></span>
          </span>
          <span className={`text-[9px] font-black uppercase tracking-[0.05em] ${isComplexOpen ? 'text-[#4be277]' : 'text-red-500'}`}>
            {isComplexOpen ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <img 
            src="/input_file_0.png" 
            alt="Ramito Fut Show" 
            className="h-10 w-auto object-contain drop-shadow-md" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
