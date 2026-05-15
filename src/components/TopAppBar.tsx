import React, { useState } from 'react';
import { Trophy, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export default function TopAppBar() {
  const { isComplexOpen, marqueeText } = useApp();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="w-full bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-2 border-b border-white/5 overflow-hidden">
        <div className="flex-grow overflow-hidden relative">
          <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] text-[#FF9100] uppercase italic">
            {marqueeText} • &nbsp;&nbsp;&nbsp;&nbsp;
            {marqueeText} •
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ml-4 border transition-colors ${
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
    </header>
  );
}
