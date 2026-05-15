import React, { useState } from 'react';
import { Trophy, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export default function TopAppBar() {
  const { isComplexOpen } = useApp();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md flex flex-col justify-end px-5 h-24 bg-[#121414]/60 backdrop-blur-xl border-b border-white/10 border-x z-50 pb-3">
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
          <div className="flex items-center">
            <img 
              src="/logo-ramito.png" 
              alt="Ramito" 
              className="h-10 w-auto object-contain brightness-[1.2]"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('top-text-logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div id="top-text-logo-fallback" className="hidden flex-col items-start -mt-1" style={{ transform: 'rotate(-3deg)' }}>
              <span className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#FFA500] to-[#FF4500]" style={{ WebkitTextStroke: '1px #FFD700', lineHeight: '0.9', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}>RAMITO</span>
              <span className="text-[11px] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#FFA500] to-[#FF4500] ml-3" style={{ WebkitTextStroke: '0.5px #FFD700', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}>FUT SHOW</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
