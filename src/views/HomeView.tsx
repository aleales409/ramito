import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronRight, X, Lock, User, AlertTriangle, UserPlus, Zap, MessageCircle, Key, LogIn, Calendar, Clock, PlayCircle, DollarSign, Power, Globe, Smartphone, Newspaper, Database, HardDrive, Activity, Info, RefreshCw, Sparkles, GlassWater, Flame, Trophy, Shirt, Search, Plus, Minus, ShoppingBag, Check, CloudSun, Footprints } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCantinaItems } from '../lib/cantina';
import { supabase, isSupabaseConfigured } from '../lib/supabase';


const USER_AVATARS: Record<string, string> = {
  'CARLOS MENDOZA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23FBBF24" stroke-width="2" stroke-opacity="0.3"/><path d="M 35,30 L 65,30 A 15,15 0 0,1 50,60 A 15,15 0 0,1 35,30 Z" fill="%23FBBF24" fill-opacity="0.1" stroke="%23FBBF24" stroke-width="2"/><path d="M 35,38 H 28 A 5,5 0 0,1 28,48 H 35" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 65,38 H 72 A 5,5 0 0,0 72,48 H 65" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,60 V 70 M 40,70 H 60" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,16 L 52,21 L 57,21 L 53,24 L 55,29 L 50,26 L 45,29 L 47,24 L 43,21 L 48,21 Z" fill="%23FBBF24" fill-opacity="0.2" stroke="%23FBBF24" stroke-width="1"/></svg>', // Mundial Oro
  'SOFÍA RODRÍGUEZ': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2306B6D4" stroke-width="2" stroke-opacity="0.3"/><path d="M 32,32 L 42,32 A 8,8 0 0,0 58,32 L 68,32 L 76,46 L 66,52 L 62,48 L 62,74 L 38,74 L 38,48 L 34,52 L 24,46 Z" fill="%2306B6D4" fill-opacity="0.1" stroke="%2306B6D4" stroke-width="2"/><text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="16" fill="%2306B6D4" text-anchor="middle">10</text></svg>', // Camiseta Copa 10
  'MATEO SILVA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.7" stroke="%238B5CF6" stroke-width="2" stroke-opacity="0.3"/><path d="M 38,34 Q 28,38 34,54 L 38,68 A 12,12 0 0,0 62,68 L 66,54 Q 72,38 62,34 A 8,8 0 0,0 50,44 A 8,8 0 0,0 38,34 Z" fill="%23A78BFA" fill-opacity="0.1" stroke="%23A78BFA" stroke-width="2" stroke-linejoin="round"/><path d="M 44,52 H 56 M 46,60 H 54" stroke="%23A78BFA" stroke-width="1.5" stroke-opacity="0.7"/></svg>', // Guantes Pro
  'CAMILA ESPINOZA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23CA8A04" stroke-width="2" stroke-opacity="0.3"/><path d="M 42,20 L 34,44 L 50,54 L 66,44 L 58,20" fill="none" stroke="%23EF4444" stroke-width="2"/><circle cx="50" cy="58" r="18" fill="%23CA8A04" fill-opacity="0.1" stroke="%23CA8A04" stroke-width="2"/><path d="M 50,49 L 52,54 L 57,54 L 53,57 L 55,62 L 50,59 L 45,62 L 47,57 L 43,54 L 48,54 Z" fill="%23FBBF24" fill-opacity="0.4" stroke="%23CA8A04" stroke-width="1"/></svg>', // Medalla Oro
  'JAVIER ORTEGA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2310B981" stroke-width="2" stroke-opacity="0.3"/><rect x="24" y="24" width="52" height="48" fill="none" stroke="%2310B981" stroke-width="2" stroke-opacity="0.8"/><line x1="50" y1="24" x2="50" y2="72" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="10" fill="none" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="2.5" fill="%2310B981"/></svg>', // Estrategia
};

// Sub-component wrapper to avoid full-page re-renders on countdown tick
function NextMatchWidget({ 
  booking, 
  onShare,
  onShareSplit
}: { 
  booking: any; 
  onShare: (b: any) => void; 
  onShareSplit: (b: any, headcount: number, shareAmount: number, totalCost: number) => void;
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [playerCount, setPlayerCount] = useState(10);

  // Safe parsing of the amount for split division
  const parseAmountValue = (amt: string) => {
    if (!amt) return 12000;
    let cleaned = amt;
    if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts[parts.length - 1] === '00' || parts[parts.length - 1].length === 2) {
        parts.pop();
        cleaned = parts.join('');
      }
    }
    const digitsOnly = cleaned.replace(/\D/g, '');
    const val = parseInt(digitsOnly, 10);
    return isNaN(val) ? 12000 : val;
  };

  const totalCost = parseAmountValue(booking.amount);
  const shareAmount = Math.ceil(totalCost / playerCount);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      if (!booking) return;
      
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth();
      let day = now.getDate();

      const d = (booking.date || '').toLowerCase();
      if (d.includes('hoy')) {
        // keep current date specs
      } else if (d.includes('mañana') || d.includes('manana')) {
        const tmr = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        year = tmr.getFullYear();
        month = tmr.getMonth();
        day = tmr.getDate();
      } else {
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        let foundMonth = -1;
        for (let i = 0; i < months.length; i++) {
          if (d.includes(months[i])) {
            foundMonth = i;
            break;
          }
        }
        const dayMatch = d.match(/\d+/);
        if (dayMatch) {
          day = parseInt(dayMatch[0], 10);
        }
        if (foundMonth !== -1) {
          month = foundMonth;
        }
      }

      let hour = 20;
      let minute = 0;
      const timeClean = (booking.time || '').split('-')[0].trim();
      const timeMatch = timeClean.match(/(\d+):(\d+)/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
        minute = parseInt(timeMatch[2], 10);
      }

      const target = new Date(year, month, day, hour, minute, 0);
      const diffMs = target.getTime() - now.getTime();

      if (diffMs <= 0) {
        const matchDurationMs = 60 * 60 * 1000;
        if (diffMs > -matchDurationMs) {
          setTimeLeft('¡TU PARTIDO ESTÁ EN JUEGO AHORA! ⚽');
        } else {
          setTimeLeft('Partido finalizado');
        }
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      const rHours = diffHrs % 24;
      const rMins = diffMins % 60;
      const rSecs = diffSecs % 60;

      if (diffDays > 0) {
        setTimeLeft(`Faltan: ${diffDays}d ${rHours}h ${rMins}m`);
      } else if (rHours > 0) {
        setTimeLeft(`Faltan: ${rHours}h ${rMins}m ${rSecs}s`);
      } else {
        setTimeLeft(`¡Comienza en ${rMins}m ${rSecs}s! 🔥`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) return null;

  const isCancha1 = booking.field?.toUpperCase().includes('CANCHA 1') || booking.field?.toUpperCase().includes('MARACANÁ') || !booking.field?.toUpperCase().includes('CANCHA 2');
  const courtNameClean = isCancha1 ? 'Cancha 1 • El Maracaná' : 'Cancha 2 • La Bombonera';
  const courtFeatures = isCancha1 ? 'Césped Sintético Pro' : 'Sin Césped • Salón';

  let statusLabel = 'PAGO PENDIENTE';
  let statusBadgeStyle = 'bg-red-500/10 border-red-500/20 text-red-400';
  
  if (booking.isSimulation) {
    statusLabel = 'DEMO • CALCULADORA RÁPIDA 💰';
    statusBadgeStyle = 'bg-emerald-500/10 border-emerald-500/20 text-[#4be277]';
  } else if (booking.status === 'upcoming') {
    statusLabel = 'APROBADO • SEÑADO 🛡️';
    statusBadgeStyle = 'bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277]';
  } else if (booking.status === 'pending_approval') {
    statusLabel = 'EN REVISIÓN DE PAGO ⏳';
    statusBadgeStyle = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative overflow-hidden rounded-[2rem] border border-[#4be277]/20 bg-gradient-to-br from-emerald-950/20 to-zinc-950/90 p-5 space-y-3.5 text-left group shadow-lg"
    >
      <div className="absolute inset-0 bg-[#4be277]/[0.01] pointer-events-none group-hover:bg-[#4be277]/[0.03] transition-colors duration-300" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[#4be277] flex items-center gap-1.5 animate-pulse">
          <Clock className="w-3.5 h-3.5 text-[#4be277]" /> {booking.isSimulation ? 'Simulador Fútbol Split 💰' : 'Próximo Partido Activo'}
        </span>
        <span className={`text-[7.5px] font-black tracking-widest px-2 py-0.5 border rounded uppercase ${statusBadgeStyle}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-1 relative z-10">
        <h4 className="text-xs font-black text-white uppercase italic tracking-tight flex items-center gap-1.5">
          {courtNameClean}
        </h4>
        <p className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-none">
          {courtFeatures}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/5 bg-black/20 -mx-5 px-5 my-1 text-left relative z-10">
        <div className="space-y-0.5">
          <span className="text-[7px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block leading-none">Fecha y Hora</span>
          <span className="text-[10px] font-black text-white uppercase tracking-wider block font-mono leading-none">
            {booking.date} • {booking.time} hs
          </span>
        </div>
        <div className="space-y-0.5 text-right">
          <span className="text-[7px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block leading-none">Monto / Seña</span>
          <span className="text-[10px] font-mono font-black text-[#4be277] block leading-none">
            {booking.amount || '$ 120.00'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[7px] font-bold text-[#bccbb9]/30 uppercase tracking-widest block leading-none">Cuenta Regresiva</span>
        <span className="text-[13px] font-black font-mono text-[#4be277] tracking-tight uppercase leading-none">
          {timeLeft}
        </span>
      </div>

      <div className="flex gap-2 pt-1 relative z-10">
        <button
          type="button"
          onClick={() => onShare(booking)}
          className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[8.5px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#4be277]" /> Datos Partido
        </button>
      </div>

      {/* Fútbol Split - Divisor Dinámico */}
      <div className="pt-3 border-t border-white/5 space-y-2.5 relative z-10 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#4be277]" />
            <span className="text-[8.5px] font-black uppercase text-[#bccbb9] tracking-wider">Fútbol Split • Dividir Cuenta 💰</span>
          </div>
          <span className="text-[7px] font-bold font-mono text-[#4be277] bg-[#4be277]/10 border border-[#4be277]/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
            {booking.isSimulation ? 'Modo Demo' : 'En Vivo'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
          <div className="flex flex-col gap-0.5 text-left">
            <span className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-none">Total Jugadores</span>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setPlayerCount(p => Math.max(2, p - 1))}
                className="w-7 h-7 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-white font-black text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-black font-mono text-white w-5 text-center">{playerCount}</span>
              <button
                type="button"
                onClick={() => setPlayerCount(p => Math.min(22, p + 1))}
                className="w-7 h-7 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-white font-black text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[7px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block leading-none mb-1">Cuota por Jugador</span>
            <span className="text-[14px] font-black text-[#4be277] font-mono block leading-none">
              $ {shareAmount.toLocaleString('es-AR')}
            </span>
            <span className="text-[6.5px] font-bold text-[#bccbb9]/30 uppercase tracking-tight block mt-1">
              Neto Unitario Exacto
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onShareSplit(booking, playerCount, shareAmount, totalCost)}
          className="w-full h-10 rounded-xl bg-[#4be277] text-black font-black text-[8.5px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(75,226,119,0.25)] hover:opacity-95"
        >
          <DollarSign className="w-3.5 h-3.5" /> Copiar Cuota del Equipo (WhatsApp Split)
        </button>
      </div>
    </motion.div>
  );
}

function MicroBookingWidget({ booking }: { booking: any }) {
  const [timeLeft, setTimeLeft] = useState('');

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      if (!booking) return;
      
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth();
      let day = now.getDate();

      const d = (booking.date || '').toLowerCase();
      if (d.includes('hoy')) {
        // keep current date specs
      } else if (d.includes('mañana') || d.includes('manana')) {
        const tmr = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        year = tmr.getFullYear();
        month = tmr.getMonth();
        day = tmr.getDate();
      } else {
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        let foundMonth = -1;
        for (let i = 0; i < months.length; i++) {
          if (d.includes(months[i])) {
            foundMonth = i;
            break;
          }
        }
        const dayMatch = d.match(/\d+/);
        if (dayMatch) {
          day = parseInt(dayMatch[0], 10);
        }
        if (foundMonth !== -1) {
          month = foundMonth;
        }
      }

      let hour = 20;
      let minute = 0;
      const timeClean = (booking.time || '').split('-')[0].trim();
      const timeMatch = timeClean.match(/(\d+):(\d+)/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
        minute = parseInt(timeMatch[2], 10);
      }

      const target = new Date(year, month, day, hour, minute, 0);
      const diffMs = target.getTime() - now.getTime();

      if (diffMs <= 0) {
        const matchDurationMs = 60 * 60 * 1000;
        if (diffMs > -matchDurationMs) {
          setTimeLeft('EN JUEGO NOW ⚽');
        } else {
          setTimeLeft('PARTIDO FINALIZADO');
        }
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      const rHours = diffHrs % 24;
      const rMins = diffMins % 60;
      const rSecs = diffSecs % 60;

      if (diffDays > 0) {
        setTimeLeft(`${diffDays}d ${rHours}h ${rMins}m`);
      } else {
        const hStr = rHours > 0 ? `${rHours}H ` : '';
        const mStr = `${rMins.toString().padStart(2, '0')}M `;
        const sStr = `${rSecs.toString().padStart(2, '0')}S`;
        setTimeLeft(`${hStr}${mStr}${sStr}`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const isCancha1 = booking.field?.toUpperCase().includes('CANCHA 1') || booking.field?.toUpperCase().includes('MARACANÁ') || !booking.field?.toUpperCase().includes('CANCHA 2');
  const courtNameClean = isCancha1 ? 'CANCHA 1' : 'CANCHA 2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      id="active-booking-metric"
      className="w-full p-4.5 rounded-[2rem] border border-[#4be277]/25 bg-gradient-to-br from-emerald-950/20 via-[#121614]/45 to-black/50 backdrop-blur-md relative overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#4be277]/30 to-transparent" />
      
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left Side: Booking Details in prominent fonts */}
        <div className="flex flex-col text-left gap-1.5 min-w-0 flex-grow">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4be277] animate-pulse shrink-0 shadow-[0_0_8px_#4be277]" />
            <span className="text-[8px] font-black tracking-widest text-[#4be277] uppercase leading-none">
              RESERVA ACTIVA
            </span>
          </div>
          
          <h3 className="text-[15px] font-black text-white uppercase tracking-tight leading-none">
            {courtNameClean}
          </h3>
          
          <p className="text-[11.5px] font-bold text-zinc-300 uppercase tracking-wide leading-none mt-0.5">
            {booking.date} • {booking.time} HS
          </p>
        </div>

        {/* Right Side: Proportional beautifully enclosed countdown */}
        <div className="shrink-0 flex flex-col items-center justify-center text-center bg-black/60 border border-[#4be277]/20 p-3 rounded-2xl min-w-[125px] shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          <span className="text-[5.5px] font-black text-[#bccbb9]/50 uppercase tracking-widest leading-none pb-1.5">
            FALTAN PARA JUGAR
          </span>
          <span className="text-[13.5px] font-black font-mono text-[#4be277] tracking-tight leading-none">
            {timeLeft}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function CantinaCatalogWidget({ cantinaItems, renderIconById }: { cantinaItems: any[], renderIconById: (id?: string) => React.ReactNode, adminPhone: string }) {
  // Sort items slightly so drinks come first or order remains clear
  const sortedItems = [...cantinaItems].sort((a, b) => {
    if (a.type === 'drink' && b.type !== 'drink') return -1;
    if (a.type !== 'drink' && b.type === 'drink') return 1;
    return 0;
  });

  return (
    <div id="cantina-grid-catalog" className="w-[100%] space-y-3.5 text-left">
      {/* Grid structure of minimal cells */}
      <div className="grid grid-cols-2 gap-2">
        {sortedItems.length === 0 ? (
          <div className="col-span-full py-6 text-center text-[9px] font-black uppercase text-zinc-600 tracking-wider">
            Sin productos cargados
          </div>
        ) : (
          sortedItems.map(item => {
            const isDrink = item.type === 'drink';
            const cleanName = item.name.split('(')[0].trim();
            const isOutOfStock = item.stock <= 0;

            return (
              <div 
                key={item.id} 
                className="p-3 rounded-2xl border border-white/5 bg-gradient-to-br from-[#121614]/40 to-black/30 backdrop-blur-md flex flex-col justify-between min-h-[115px] transition-all hover:bg-white/[0.02]"
              >
                {/* Top Row: Icon / Type Badge */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                    isDrink 
                      ? 'bg-cyan-500/5 border-cyan-500/10 text-cyan-400' 
                      : 'bg-amber-500/5 border-amber-500/10 text-amber-400'
                  }`}>
                    {renderIconById(item.iconId)}
                  </div>
                  <span className={`text-[5.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    isOutOfStock 
                      ? 'text-red-400 bg-red-500/10' 
                      : isDrink 
                        ? 'text-cyan-400 bg-cyan-500/15' 
                        : 'text-amber-400 bg-amber-500/15'
                  }`}>
                    {isOutOfStock ? 'AGOTADO' : isDrink ? 'BEBIDA' : 'EXTRA'}
                  </span>
                </div>

                {/* Middle part: Wrapped name and Stock */}
                <div className="flex flex-col text-left justify-center flex-grow pt-2.5 pb-2">
                  <span className="text-[9.5px] font-black text-white uppercase tracking-tight block break-words leading-tight" title={item.name}>
                    {cleanName}
                  </span>
                  <span className="text-[6.5px] font-bold text-zinc-500 tracking-wider uppercase block mt-0.5">
                    U. Disp: {item.stock}
                  </span>
                </div>

                {/* Bottom Row: Price metric cleanly separated */}
                <div className="w-full pt-2 border-t border-white/[0.03] flex items-center justify-between">
                  <span className="text-[6.5px] font-black text-zinc-500 uppercase tracking-widest leading-none">PRECIO</span>
                  <span className="text-[10px] font-black text-amber-400 font-mono leading-none">
                    $ {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tiny clean footer indicator */}
      <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span className="text-[7.5px] font-bold text-[#bccbb9]/45 uppercase tracking-wider leading-relaxed">
          Precios actualizados de cantina para retirar directo en la barra del complejo.
        </span>
      </div>
    </div>
  );
}

function ThreeQuickDetailsWidget() {
  return (
    <div id="three-quick-details" className="grid grid-cols-3 gap-2 w-full pt-1">
      {/* 1. Clima */}
      <div className="p-2.5 rounded-2xl border border-white/5 bg-[#121614]/40 flex flex-col justify-between text-left min-h-[75px] transition-all hover:bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[5.5px] font-black text-cyan-400/80 uppercase tracking-widest font-mono">Clima</span>
        </div>
        <div className="mt-2.5">
          <span className="text-[8.5px] font-black text-white block uppercase leading-none pb-1">21°C Bueno</span>
          <span className="text-[5.5px] font-black text-zinc-500 uppercase block tracking-wider leading-none">Cancha Seca ☀️</span>
        </div>
      </div>

      {/* 2. Calzado */}
      <div className="p-2.5 rounded-2xl border border-white/5 bg-[#121614]/40 flex flex-col justify-between text-left min-h-[75px] transition-all hover:bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <Footprints className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[5.5px] font-black text-amber-500/80 uppercase tracking-widest font-mono">Calzado</span>
        </div>
        <div className="mt-2.5">
          <span className="text-[8.5px] font-black text-white block uppercase leading-none pb-1">Sintético F5</span>
          <span className="text-[5.5px] font-black text-zinc-500 uppercase block tracking-wider leading-none">Sin tapón metal 👟</span>
        </div>
      </div>

      {/* 3. Servicios Incluidos */}
      <div className="p-2.5 rounded-2xl border border-white/5 bg-[#121614]/40 flex flex-col justify-between text-left min-h-[75px] transition-all hover:bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <Shirt className="w-3.5 h-3.5 text-[#4be277]" />
          <span className="text-[5.5px] font-black text-[#4be277]/80 uppercase tracking-widest font-mono font-black">Servicio</span>
        </div>
        <div className="mt-2.5">
          <span className="text-[8.5px] font-black text-white block uppercase leading-none pb-1">Pelota + Vests</span>
          <span className="text-[5.5px] font-black text-zinc-500 uppercase block tracking-wider leading-none">Cortesía de casa ⚽</span>
        </div>
      </div>
    </div>
  );
}

export default function HomeView() {
  const navigate = useNavigate();
  const { 
    eliteKey, vipKey, adminPhone, showToast, webLicenseActive, appLicenseActive, saveSettings, 
    stadiumName, courts, allBookings, userName, userRole: role, userAvatar, setUserName, setUserRole,
    cashTotal, transferTotal, mpTotal, cantinaItems 
  } = useApp();

  const renderIconById = (iconId?: string) => {
    switch (iconId) {
      case 'gatorade':
        return <Flame className="w-4 h-4 text-orange-400 animate-pulse" />;
      case 'beer':
        return <GlassWater className="w-4 h-4 text-amber-300" />;
      case 'vests':
        return <Shirt className="w-4 h-4 text-blue-400" />;
      case 'ball':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'bbq':
        return <Flame className="w-4 h-4 text-red-500" />;
      default:
        return <GlassWater className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBookingTargetTime = (dateStr: string, timeStr: string) => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();

    const d = (dateStr || '').toLowerCase();
    if (d.includes('hoy')) {
      // keep
    } else if (d.includes('mañana') || d.includes('manana')) {
      const tmr = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      year = tmr.getFullYear();
      month = tmr.getMonth();
      day = tmr.getDate();
    } else {
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      let foundMonth = -1;
      for (let i = 0; i < months.length; i++) {
        if (d.includes(months[i])) {
          foundMonth = i;
          break;
        }
      }
      const dayMatch = d.match(/\d+/);
      if (dayMatch) {
        day = parseInt(dayMatch[0], 10);
      }
      if (foundMonth !== -1) {
        month = foundMonth;
      }
    }

    let hour = 20;
    let minute = 0;
    const timeClean = (timeStr || '').split('-')[0].trim();
    const timeMatch = timeClean.match(/(\d+):(\d+)/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
    }

    return new Date(year, month, day, hour, minute, 0);
  };

  const getNextActiveBooking = () => {
    if (!allBookings || !userName) return null;
    const userBookings = allBookings.filter((b: any) => {
      const isMyBooking = (b.user || '').toLowerCase().trim() === userName.toLowerCase().trim();
      return isMyBooking && ['upcoming', 'pending_approval', 'pending_payment'].includes(b.status);
    });

    if (userBookings.length === 0) {
      if (userName.toLowerCase().trim() === 'agus castro') {
        return {
          id: 'b_temp_agus',
          date: 'Hoy',
          time: '21:00',
          field: 'Cancha 1 • El Maracaná',
          status: 'upcoming',
          amount: 'S/. 120.00',
          user: 'Agus Castro',
          phone: '+51 987 654 321',
          extras: ['Pack Hidratación (2 Gatorade + 2 Aguas)']
        };
      }
      return null;
    }

    return userBookings.sort((a, b) => {
      const timeA = getBookingTargetTime(a.date, a.time).getTime();
      const timeB = getBookingTargetTime(b.date, b.time).getTime();
      return timeA - timeB;
    })[0];
  };

  const handleShareBooking = (b: any) => {
    const isCancha1 = b.field?.toUpperCase().includes('CANCHA 1') || b.field?.toUpperCase().includes('MARACANÁ') || !b.field?.toUpperCase().includes('CANCHA 2');
    const courtName = isCancha1 ? 'Cancha 1 • El Maracaná 🏟️' : 'Cancha 2 • La Bombonera 🏟️';
    const textMsg = `¡Hay fulbito confirmado! ⚽🔥\n\n📌 *Complejo*: ${stadiumName || 'Complejo Ramito Fut Show'}\n🏟️ *Cancha*: ${courtName}\n🗓️ *Fecha*: ${b.date}\n⏰ *Horario*: ${b.time} hs\n💵 *Monto total/seña*: ${b.amount || '$ 120.00'}\n\n¡No falten! ¡A dejar la vida en la cancha! 💪🏃\n_Enviado desde Ramito Fut Show Mobile app_`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textMsg);
      if (showToast) {
        showToast('¡Texto copiado listo para WhatsApp! Pastealo en tu grupo.', 'success');
      }
    } else {
      if (showToast) showToast('No se pudo copiar automáticamente. Por favor compártelo manualmente.', 'error');
    }
  };

  const handleShareSplit = (b: any, headcount: number, shareAmount: number, totalCost: number) => {
    const isCancha1 = b.field?.toUpperCase().includes('CANCHA 1') || b.field?.toUpperCase().includes('MARACANÁ') || !b.field?.toUpperCase().includes('CANCHA 2');
    const courtName = isCancha1 ? 'Cancha 1 • El Maracaná 🏟️' : 'Cancha 2 • La Bombonera 🏟️';
    const totalCostStr = `$ ${totalCost.toLocaleString('es-AR')}`;
    const shareAmountStr = `$ ${shareAmount.toLocaleString('es-AR')}`;
    
    const textMsg = `¡Muchachos! Ya tenemos reservada la cancha: *${courtName}* 🏟️\n🗓️ *Fecha*: ${b.date}\n⏰ *Horario*: ${b.time} hs\n\nSomos *${headcount}* jugadores en total, por lo que nos toca pagar *${shareAmountStr}* a cada uno para la cancha. 💰 ¡No falten! ⚽🏆\n\n_(Monto total: ${totalCostStr})_\n_Enviado desde Ramito Fut Show_`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textMsg);
      if (showToast) {
        showToast(`¡Fútbol Split copiado para ${headcount} jugadores! Pastealo en tu grupo.`, 'success');
      }
    } else {
      if (showToast) showToast('No se pudo copiar el texto del split.', 'error');
    }
  };

  const nextBooking = getNextActiveBooking();

  const myBookingsCount = allBookings?.filter((b: any) => 
    (b.user || '').toLowerCase().trim() === (userName || '').toLowerCase().trim()
  ).length || 0;

  const court1Obj = courts?.find((c: any) => c.id === '1') || { name: 'Cancha 1 • El Maracaná', features: ['Césped Sintético Pro'] };
  const court2Obj = courts?.find((c: any) => c.id === '2') || { name: 'Cancha 2 • La Bombonera', features: ['Sin Césped'] };
  const court1Name = court1Obj.name;
  const court2Name = court2Obj.name;

  const getUpcomingBookingsForCourt = (courtId: string, courtName: string) => {
    if (!allBookings) return [];
    return allBookings.filter(b => {
      const fieldLower = (b.field || b.courtName || '').toLowerCase();
      const courtNameLower = (courtName || '').toLowerCase();
      const isMatch = fieldLower.includes(`cancha ${courtId}`) || 
                      fieldLower.includes(courtNameLower) || 
                      courtNameLower.includes(fieldLower);
      return isMatch && (b.status === 'upcoming' || b.status === 'pending_approval' || b.status === 'pending_payment');
    }).slice(0, 3);
  };
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('ramito_maintenance') === 'true');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [adminLoginMethod, setAdminLoginMethod] = useState<'credentials' | 'pin'>('credentials');
  const [adminQuickPin, setAdminQuickPin] = useState('');
  const [adminQuickPinVisible, setAdminQuickPinVisible] = useState(false);
  const [error, setError] = useState(false);


  const [selectedLicense, setSelectedLicense] = useState<'web' | 'app' | null>(null);
  const [renewalKey, setRenewalKey] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);

  // Estados de Canchas Administrador (Simulador Interactivo)
  const [cancha1Active, setCancha1Active] = useState(true);
  const [cancha1Team, setCancha1Team] = useState('La Escaloneta FC');
  const [cancha1TimeLeft, setCancha1TimeLeft] = useState('14:45');
  const [showCancha1Modal, setShowCancha1Modal] = useState(false);
  const [quickTeamCancha1, setQuickTeamCancha1] = useState('');
  const [quickTimeCancha1, setQuickTimeCancha1] = useState('60');

  const [cancha2Active, setCancha2Active] = useState(false);
  const [cancha2Team, setCancha2Team] = useState('Aston Birra FC');
  const [cancha2TimeLeft, setCancha2TimeLeft] = useState('00:00');
  const [showCancha2Modal, setShowCancha2Modal] = useState(false);
  const [quickTeamCancha2, setQuickTeamCancha2] = useState('');
  const [quickTimeCancha2, setQuickTimeCancha2] = useState('60');

  // Live countdown timer para ambas canchas (Césped vs Sin Césped)
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (cancha1Active) {
        setCancha1TimeLeft((prev) => {
          const parts = prev.split(':');
          if (parts.length !== 2) return '14:45';
          const m = parseInt(parts[0], 10);
          const s = parseInt(parts[1], 10);
          if (isNaN(m) || isNaN(s)) return '14:45';
          if (m === 0 && s === 0) {
            setCancha1Active(false);
            if (showToast) showToast(`¡Turno finalizado en ${court1Name}!`, 'success');
            return '00:00';
          }
          const totalSeconds = m * 60 + s - 1;
          const newM = Math.floor(totalSeconds / 60);
          const newS = totalSeconds % 60;
          return `${newM.toString().padStart(2, '0')}:${newS.toString().padStart(2, '0')}`;
        });
      }
      if (cancha2Active) {
        setCancha2TimeLeft((prev) => {
          const parts = prev.split(':');
          if (parts.length !== 2) return '59:00';
          const m = parseInt(parts[0], 10);
          const s = parseInt(parts[1], 10);
          if (isNaN(m) || isNaN(s)) return '59:00';
          if (m === 0 && s === 0) {
            setCancha2Active(false);
            if (showToast) showToast(`¡Turno finalizado en ${court2Name}!`, 'success');
            return '00:00';
          }
          const totalSeconds = m * 60 + s - 1;
          const newM = Math.floor(totalSeconds / 60);
          const newS = totalSeconds % 60;
          return `${newM.toString().padStart(2, '0')}:${newS.toString().padStart(2, '0')}`;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cancha1Active, cancha2Active, showToast]);

  const isLogged = !!userName;
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';
  const vercelPlan = localStorage.getItem('ramito_vercel_plan') || 'free';

  const totalCaja = cashTotal + transferTotal + mpTotal;

  const formattedCaja = totalCaja > 0 ? `$ ${totalCaja.toLocaleString('es-AR')}` : '$ 0';

  // Auto-Login for Master Keys
  React.useEffect(() => {
    if (adminLoginMethod === 'credentials' && adminKey && (adminKey === eliteKey || adminKey === vipKey)) {
      const r = adminKey === eliteKey ? 'admin_elite' : 'admin_vip';
      localStorage.setItem('ramito_user_role', r);
      localStorage.setItem('ramito_user_name', r === 'admin_elite' ? 'Elite Admin' : 'VIP Admin');
      localStorage.setItem('ramito_user_id', 'master_access');
      setUserName(r === 'admin_elite' ? 'Elite Admin' : 'VIP Admin');
      setUserRole(r);
      navigate('/profile');
    }
  }, [adminKey, eliteKey, vipKey, adminLoginMethod, navigate, setUserName, setUserRole]);

  const getLocalProfilesForAdmin = () => {
    const saved = localStorage.getItem('ramito_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 'master_access_elite', email: 'admin@ramito.com', password: 'ELITE_PASSWORD', name: 'Elite Admin', role: 'admin_elite', pin: 'ELITE26', phone: '+51 987 654 321' },
      { id: 'master_access_vip', email: 'vip@ramito.com', password: 'VIP_PASSWORD', name: 'VIP Admin', role: 'admin_vip', pin: 'VIP26', phone: '+51 912 345 678' },
      { id: 'player_1', email: 'user@ramito.com', password: 'password', name: 'Agus Castro', role: 'player', pin: '481516', phone: '+51 900 123 456' }
    ];
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (adminLoginMethod === 'pin') {
        const trimmedQuickPin = adminQuickPin.trim();
        if (!trimmedQuickPin) {
          setError(true);
          setTimeout(() => setError(false), 3000);
          return;
        }

        let user: any = null;

        if (isSupabaseConfigured) {
          const { data, error: err } = await supabase
            .from('profiles')
            .select('*')
            .eq('pin', trimmedQuickPin)
            .maybeSingle();

          if (data && (data.role === 'admin_elite' || data.role === 'admin_vip')) {
            user = data;
          }
        } else {
          // Check local profiles
          const profiles = getLocalProfilesForAdmin();
          const found = profiles.find((p: any) => p.pin && p.pin.trim().toLowerCase() === trimmedQuickPin.toLowerCase());
          if (found && (found.role === 'admin_elite' || found.role === 'admin_vip')) {
            user = found;
          }
        }

        if (user) {
          localStorage.setItem('ramito_user_role', user.role);
          localStorage.setItem('ramito_user_name', user.name || 'Admin');
          localStorage.setItem('ramito_user_id', user.id);
          if (user.password) {
            localStorage.setItem('ramito_user_pw', user.password);
          }
          if (user.pin) {
            localStorage.setItem('ramito_user_pin', user.pin);
          }
          if (user.email) {
            localStorage.setItem('ramito_user_email', user.email);
          }
          setUserName(user.name || 'Admin');
          setUserRole(user.role);
          
          setAdminQuickPin('');
          setShowAdminLogin(false);
          if (user.role === 'admin_elite' || user.role === 'admin_vip') {
            navigate('/profile?view=admin_selection');
          } else {
            navigate('/profile');
          }
        } else {
          setError(true);
          setTimeout(() => setError(false), 3000);
        }
        return;
      }

      // Standard credentials login
      if (!adminKey) return;
      
      let user: any = null;

      if (isSupabaseConfigured) {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', adminEmail.toLowerCase())
          .maybeSingle();

        const currentEliteKey = localStorage.getItem('ramito_elite_key') || 'ELITE-9A7F-D3B8-K2C5';
        const currentVipKey = localStorage.getItem('ramito_vip_key') || 'VIP-3E8F-C1A5-J7B9';

        let isPasswordValid = false;
        if (data) {
          isPasswordValid = data.password === adminKey;
          if (data.role === 'admin_elite' && adminKey === currentEliteKey) {
            isPasswordValid = true;
          }
          if (data.role === 'admin_vip' && adminKey === currentVipKey) {
            isPasswordValid = true;
          }
        }
        
        if (data && isPasswordValid && (data.role === 'admin_elite' || data.role === 'admin_vip')) {
          user = data;
        }
      } else {
        const profiles = getLocalProfilesForAdmin();
        const found = profiles.find((p: any) => p.email.toLowerCase() === adminEmail.toLowerCase());
        
        const currentEliteKey = localStorage.getItem('ramito_elite_key') || 'ELITE-9A7F-D3B8-K2C5';
        const currentVipKey = localStorage.getItem('ramito_vip_key') || 'VIP-3E8F-C1A5-J7B9';

        let isPasswordValid = false;
        if (found) {
          isPasswordValid = found.password === adminKey;
          if (found.role === 'admin_elite' && adminKey === currentEliteKey) {
            isPasswordValid = true;
          }
          if (found.role === 'admin_vip' && adminKey === currentVipKey) {
            isPasswordValid = true;
          }
        }

        if (found && isPasswordValid && (found.role === 'admin_elite' || found.role === 'admin_vip')) {
          user = found;
        }
      }

      if (user) {
        localStorage.setItem('ramito_user_role', user.role);
        localStorage.setItem('ramito_user_name', user.name || 'Admin');
        localStorage.setItem('ramito_user_id', user.id);
        if (user.password) {
          localStorage.setItem('ramito_user_pw', user.password);
        }
        if (user.pin) {
          localStorage.setItem('ramito_user_pin', user.pin);
        }
        if (user.email) {
          localStorage.setItem('ramito_user_email', user.email);
        }
        setUserName(user.name || 'Admin');
        setUserRole(user.role);
        
        setAdminEmail('');
        setAdminKey('');
        setShowAdminLogin(false);
        if (user.role === 'admin_elite' || user.role === 'admin_vip') {
          navigate('/profile?view=admin_selection');
        } else {
          navigate('/profile');
        }
      } else {
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  // ──────────────────────────────────────────────
  // VISTA ADMIN (Elite & VIP)
  // ──────────────────────────────────────────────
  if (isAdmin) {
    return (
      <main className="relative flex-grow flex flex-col items-center min-h-[100dvh] pt-16 pb-28 px-6 overflow-hidden">
        {/* Fondo oscuro */}
        <div className="absolute inset-0 bg-pitch opacity-20 pointer-events-none" />

        {/* Logo de fondo tenue — solo en pantalla inicio admin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/logo_ramito.png"
            alt="Ramito Fut Show"
            className="w-96 h-auto opacity-10"
          />
        </div>

        {/* 1. LICENCIAS — estilo Caja del Día y side-by-side */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-sm mb-4 z-10 grid gap-3 ${
            vercelPlan === 'pro' ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Licencia Web */}
          {vercelPlan === 'pro' && (
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/profile?tab=licencias')}
              className={`glass-panel p-4 rounded-2xl border bg-gradient-to-br from-white/[0.01] to-white/[0.03] flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden group min-h-[155px] ${
                webLicenseActive 
                  ? 'border-[#4be277]/25 hover:border-[#4be277]/40 shadow-[0_5px_20px_rgba(75,226,119,0.05)]' 
                  : 'border-red-500/20 hover:border-red-500/40 shadow-none'
              }`}
            >
              {/* Glossy ambient glow */}
              <div className={`absolute -right-2 -top-2 w-14 h-14 rounded-full blur-2xl opacity-30 pointer-events-none transition-colors ${
                webLicenseActive ? 'bg-[#4be277]' : 'bg-red-500'
              }`} />

              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.12em] shrink-0">
                  Web Hub
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                  webLicenseActive 
                    ? 'bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277]' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-3 text-left">
                <h4 className="text-[11px] font-black text-white uppercase tracking-wide leading-none pb-1.5 flex items-center gap-1">
                  Licencia Web
                  <span className={`w-1.5 h-1.5 rounded-full ${webLicenseActive ? 'bg-[#4be277] animate-pulse' : 'bg-red-500'}`} />
                </h4>
                
                {webLicenseActive ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[22px] font-black font-display text-[#4be277] leading-none">15</span>
                      <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">Días</span>
                    </div>
                    <p className="text-[7px] font-medium font-mono text-[#bccbb9]/40 uppercase tracking-widest leading-none">Vence: 12 Jun 2026</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-red-500/80 uppercase tracking-wider block">BLOQUEADA</span>
                    <p className="text-[7px] font-medium font-mono text-red-500/40 uppercase tracking-widest leading-none">Por Elite Switch</p>
                  </div>
                )}
              </div>

              {/* Premium progress bar */}
              <div className="space-y-1.5 w-full">
                <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: webLicenseActive ? '50%' : '0%' }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${
                      webLicenseActive ? 'bg-gradient-to-r from-[#4be277] to-emerald-400' : 'bg-red-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center text-[7px] font-bold text-[#bccbb9]/30 uppercase tracking-widest leading-none">
                  <span>Vercel PRO</span>
                  <span>{webLicenseActive ? '50%' : '0%'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Licencia APP (PWA) */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile?tab=licencias')}
            className={`glass-panel p-4 rounded-2xl border bg-gradient-to-br from-white/[0.01] to-white/[0.03] flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden group min-h-[155px] ${
              appLicenseActive 
                ? 'border-[#FF9100]/25 hover:border-[#FF9100]/40 shadow-[0_5px_20px_rgba(255,145,0,0.05)]' 
                : 'border-red-500/20 hover:border-red-500/45 shadow-none'
            }`}
          >
            {/* Glossy ambient glow */}
            <div className={`absolute -right-2 -top-2 w-14 h-14 rounded-full blur-2xl opacity-30 pointer-events-none transition-colors ${
              appLicenseActive ? 'bg-[#FF9100]' : 'bg-red-500'
            }`} />

            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.12em] shrink-0">
                PWA Hub
              </span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                appLicenseActive 
                  ? 'bg-[#FF9100]/10 border-[#FF9100]/20 text-[#FF9100]' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                <Smartphone className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-3 text-left">
              <h4 className="text-[11px] font-black text-white uppercase tracking-wide leading-none pb-1.5 flex items-center gap-1">
                Licencia APP
                <span className={`w-1.5 h-1.5 rounded-full ${appLicenseActive ? 'bg-[#FF9100] animate-pulse' : 'bg-red-500'}`} />
              </h4>

              {appLicenseActive ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[22px] font-black font-display text-[#FF9100] leading-none">28</span>
                    <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">Días</span>
                  </div>
                  <p className="text-[7px] font-medium font-mono text-[#bccbb9]/40 uppercase tracking-widest leading-none">Vence: 25 Jun 2026</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-red-500/80 uppercase tracking-wider block">EXPIRADA</span>
                  <p className="text-[7px] font-medium font-mono text-red-500/40 uppercase tracking-widest leading-none">Acceso Cerrado</p>
                </div>
              )}
            </div>

            {/* Premium progress bar */}
            <div className="space-y-1.5 w-full">
              <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: appLicenseActive ? '93%' : '0%' }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${
                    appLicenseActive ? 'bg-gradient-to-r from-[#FF9100] to-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center text-[7px] font-bold text-[#bccbb9]/30 uppercase tracking-widest leading-none">
                <span>PWA App mobile</span>
                <span>{appLicenseActive ? '93%' : '0%'}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 2. MÉTRICAS Y DATOS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col gap-3 z-10"
        >
          {/* Central de Canchas en Vivo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] italic flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4be277] animate-ping shrink-0" />
                CENTRAL DE CANCHAS EN VIVO
              </span>
              <span className="text-[8px] font-black font-mono text-[#bccbb9]/50 uppercase tracking-widest">
                {cancha1Active && cancha2Active ? '2 ACTIVAS' : (cancha1Active || cancha2Active ? '1 ACTIVA • 1 LIBRE' : '2 LIBRES')}
              </span>
            </div>

            {/* Cancha 1 (Con Césped) */}
            <motion.div 
              layout
              className={`relative overflow-hidden transition-all duration-300 rounded-2xl border ${
                cancha1Active 
                  ? 'bg-gradient-to-r from-emerald-950/20 to-emerald-900/10 border-emerald-500/30 shadow-[0_4px_20px_rgba(75,226,119,0.06)]' 
                  : 'bg-white/[0.01] border-white/5 opacity-80'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                    cancha1Active 
                      ? 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277] animate-pulse' 
                      : 'bg-white/5 border-white/10 text-white/30'
                  }`}>
                    <PlayCircle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-[#4be277] uppercase tracking-wider">{court1Name}</span>
                    </div>
                    {cancha1Active ? (
                      <span className="text-[12px] font-black text-white uppercase tracking-wide leading-none mt-1">
                        {cancha1Team}
                      </span>
                    ) : (
                      <span className="text-[13px] font-black text-[#4be277] uppercase tracking-wider leading-none mt-1">
                        Libre
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end justify-between min-h-[36px]">
                  {cancha1Active ? (
                    <>
                      <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none pb-1">Fin de Turno</span>
                      <span className="text-[14px] font-black text-white font-mono leading-none tracking-tight">
                        {cancha1TimeLeft}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Siguiente turno (Próximas reservas) */}
              {(() => {
                const bookings = getUpcomingBookingsForCourt('1', court1Name);
                if (bookings.length === 0) return null;
                return (
                  <div className="px-3.5 py-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border-t border-emerald-500/20 text-left transition-all flex flex-col gap-1.5">
                    <span className="text-[7.5px] font-black text-[#4be277] uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                      <Calendar className="w-3 h-3 text-[#4be277]" />
                      PROXIMAS RESERVAS
                    </span>
                    <div className="space-y-1">
                      {bookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-[10px] font-bold text-white uppercase border-b border-white/[0.02] last:border-0 pb-1 last:pb-0">
                          <span className="truncate max-w-[120px]">{b.user}</span>
                          <span className="font-mono text-[#bccbb9]/60 shrink-0">{b.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Botonera rápida de administración para Cancha 1 */}
              <div className="px-3 pb-3 pt-1 flex items-center justify-end gap-2 border-t border-white/[0.03] bg-black/10">
                {cancha1Active ? (
                  <>
                    <button 
                      onClick={() => {
                        setQuickTeamCancha1(cancha1Team);
                        setQuickTimeCancha1('15');
                        setShowCancha1Modal(true);
                      }}
                      className="text-[8px] font-black text-white/50 hover:text-white uppercase tracking-widest px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      Editar Turno
                    </button>
                    <button 
                      onClick={() => {
                        setCancha1Active(false);
                        if (showToast) showToast(`Turno finalizado en ${court1Name}`, 'success');
                      }}
                      className="text-[8px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest px-2.5 py-1 rounded bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 transition-all"
                    >
                      Finalizar
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setQuickTeamCancha1('Los Amigos de Ramito');
                      setQuickTimeCancha1('60');
                      setShowCancha1Modal(true);
                    }}
                    className="text-[8px] font-black text-[#4be277] hover:text-[#4be277]/85 uppercase tracking-widest px-3 py-1 rounded bg-[#4be277]/10 hover:bg-[#4be277]/15 border border-[#4be277]/20 transition-all ml-auto flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-[#4be277]" />
                    INICIAR TURNO RÁPIDO
                  </button>
                )}
              </div>
            </motion.div>

            {/* Cancha 2 (Sin Césped/Cemento/Al aire libre) */}
            <motion.div 
              layout
              className={`relative overflow-hidden transition-all duration-300 rounded-2xl border ${
                cancha2Active 
                  ? 'bg-gradient-to-r from-amber-950/20 to-amber-900/10 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.06)]' 
                  : 'bg-white/[0.01] border-white/5 opacity-80'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                    cancha2Active 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse' 
                      : 'bg-white/5 border-white/10 text-white/30'
                  }`}>
                    <PlayCircle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">{court2Name}</span>
                    </div>
                    {cancha2Active ? (
                      <span className="text-[12px] font-black text-amber-500 uppercase tracking-wide leading-none mt-1">
                        {cancha2Team}
                      </span>
                    ) : (
                      <span className="text-[13px] font-black text-white uppercase tracking-wider leading-none mt-1">
                        Libre
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end justify-between min-h-[36px]">
                  {cancha2Active ? (
                    <>
                      <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none pb-1">Fin de Turno</span>
                      <span className="text-[14px] font-black text-white font-mono leading-none tracking-tight">
                        {cancha2TimeLeft}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Siguiente turno (Próximas reservas) */}
              {(() => {
                const bookings = getUpcomingBookingsForCourt('2', court2Name);
                if (bookings.length === 0) return null;
                return (
                  <div className="px-3.5 py-2.5 bg-amber-500/5 hover:bg-amber-500/10 border-t border-amber-500/20 text-left transition-all flex flex-col gap-1.5">
                    <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      PROXIMAS RESERVAS
                    </span>
                    <div className="space-y-1">
                      {bookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-[10px] font-bold text-white uppercase border-b border-white/[0.02] last:border-0 pb-1 last:pb-0">
                          <span className="truncate max-w-[120px]">{b.user}</span>
                          <span className="font-mono text-[#bccbb9]/60 shrink-0">{b.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Botonera rápida de administración para Cancha 2 */}
              <div className="px-3 pb-3 pt-1 flex items-center justify-end gap-2 border-t border-white/[0.03] bg-black/10">
                {cancha2Active ? (
                  <>
                    <button 
                      onClick={() => {
                        setQuickTeamCancha2(cancha2Team);
                        setQuickTimeCancha2('15');
                        setShowCancha2Modal(true);
                      }}
                      className="text-[8px] font-black text-white/50 hover:text-white uppercase tracking-widest px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      Editar Turno
                    </button>
                    <button 
                      onClick={() => {
                        setCancha2Active(false);
                        if (showToast) showToast(`Turno finalizado en ${court2Name}`, 'success');
                      }}
                      className="text-[8px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest px-2.5 py-1 rounded bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 transition-all"
                    >
                      Finalizar
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setQuickTeamCancha2('Los Galácticos');
                      setQuickTimeCancha2('60');
                      setShowCancha2Modal(true);
                    }}
                    className="text-[8px] font-black text-[#4be277] hover:text-[#4be277]/85 uppercase tracking-widest px-3 py-1 rounded bg-[#4be277]/10 hover:bg-[#4be277]/15 border border-[#4be277]/20 transition-all ml-auto flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-[#4be277]" />
                    INICIAR TURNO RÁPIDO
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Caja del día & Cierre emergencia */}
          <div className="flex flex-col gap-3">
            {/* Redesigned Premium "Caja del Día" Bento Card */}
            <button
              onClick={() => {
                navigate('/profile?tab=seguridad');
                if (showToast) showToast('Redirigiendo a Auditoría de Ingresos...', 'success');
              }}
              className="w-full relative overflow-hidden glass-panel p-5 rounded-3xl border border-amber-500/10 bg-gradient-to-br from-white/[0.01] to-white/[0.04] text-left hover:bg-amber-500/[0.03] hover:border-amber-500/30 transition-all duration-300 group outline-none shadow-2xl flex flex-col gap-4"
            >
              <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
              
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-center group-hover:scale-105 group-hover:border-amber-500/40 transition-all duration-300">
                    <DollarSign className="w-5 h-5 text-amber-400 stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.14em] leading-none mb-1">
                      Caja del Día
                    </span>
                    <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-none">
                      Métrica consolidada
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[7.5px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                    En Tiempo Real
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between w-full pt-1">
                <div className="flex flex-col">
                  <span className="text-3xl font-mono font-black text-white tracking-widest leading-none block drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
                    {formattedCaja}
                  </span>
                  <span className="text-[8px] font-bold text-[#bccbb9]/30 uppercase tracking-wider block mt-1.5">
                    Pesos Argentinos (ARS)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[#bccbb9]/60 group-hover:text-amber-400 text-[9px] font-black uppercase tracking-widest transition-colors">
                  Auditar Caja
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="w-full border-t border-white/[0.04] pt-3.5 flex flex-wrap justify-between items-center gap-2">
                <span className="text-[8px] font-bold text-[#bccbb9]/50 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-white/30" />
                  {allBookings?.filter(b => b.status === 'completed' || b.status === 'upcoming').length || 0} Reservas Hoy
                </span>
                <span className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block font-mono">
                  Complejo Abierto • Turnos Registrados
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                navigate('/profile?tab=ajustes');
                if (showToast) showToast('Redirigiendo a Ajustes de Emergencia...', 'success');
              }}
              className={`w-full p-4 rounded-2xl border flex flex-row items-center justify-between text-left transition-all hover:scale-[0.99] active:scale-[0.97] bg-white/[0.01] outline-none ${
                maintenanceMode
                  ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:bg-red-500/15'
                  : 'glass-panel bg-white/[0.02] border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  maintenanceMode ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-[#bccbb9]/60'
                }`}>
                  <Power className={`w-5 h-5 ${maintenanceMode ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${maintenanceMode ? 'text-red-500' : 'text-[#bccbb9]/80'}`}>
                    Cierre de Emergencia
                  </span>
                  <span className="text-[7.5px] font-bold text-[#bccbb9]/45 uppercase tracking-widest mt-1">
                    Configurar cierre, modo mantenimiento y auditoría
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-xl border font-mono ${
                maintenanceMode 
                  ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' 
                  : 'bg-white/5 border-white/10 text-[#bccbb9]/60'
              }`}>
                {maintenanceMode ? 'ACTIVADO' : 'NORMAL'}
              </span>
            </button>

            {/* Resguardo & Almacenamiento Caja/Backend */}
            <button
              onClick={() => {
                navigate('/profile?tab=ajustes&modal=backup');
                if (showToast) showToast('Redirigiendo a Administración de Resguardos...', 'success');
              }}
              className="w-full glass-panel p-4 rounded-2xl border border-amber-500/25 bg-white/[0.02] flex flex-col gap-4 text-left hover:bg-amber-500/5 hover:border-amber-500/40 transition-all group outline-none"
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Database className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-[10px] font-black text-[#bccbb9] uppercase tracking-wider leading-none">Cómputo & Storage Backend</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                    </div>
                    <p className="text-[7.5px] font-bold text-[#bccbb9]/45 uppercase tracking-widest mt-1.5">
                      Respaldos en Supabase Storage
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="text-[13px] font-mono font-black text-white tracking-widest block drop-shadow-md">142.5 MB</span>
                  <span className="text-[6.5px] font-bold text-amber-500 uppercase tracking-widest font-mono block mt-1 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/10">TOTAL USADO (13.9%)</span>
                </div>
              </div>

              {/* Stacked loading bars structure (Secciones) */}
              <div className="w-full space-y-3 pt-2 border-t border-white/5">
                {/* Sección 1: Base de Datos */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[7.5px] font-black uppercase tracking-wider text-[#bccbb9]">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-500" />
                      Estructura & Tablas SQL
                    </span>
                    <span className="font-mono text-amber-400">12.4 MB / 200 MB</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '6.2%' }} />
                  </div>
                </div>

                {/* Sección 2: Comprobantes & Fotos */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[7.5px] font-black uppercase tracking-wider text-[#bccbb9]">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-yellow-500" />
                      Comprobantes & Capturas
                    </span>
                    <span className="font-mono text-amber-400">95.8 MB / 600 MB</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: '15.9%' }} />
                  </div>
                </div>

                {/* Sección 3: Logs y temporales */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[7.5px] font-black uppercase tracking-wider text-[#bccbb9]">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-600" />
                      Historial & Logs de Auditoría
                    </span>
                    <span className="font-mono text-amber-400">34.3 MB / 200 MB</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: '17.15%' }} />
                  </div>
                </div>

                {/* Límite global */}
                <div className="pt-2 border-t border-white/[0.03] flex items-center justify-between">
                  <span className="text-[6.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest font-mono">Límite Global: 1.0 GB</span>
                  <span className="text-[6.5px] font-mono font-black bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/50">Cómputo en tiempo real</span>
                </div>
              </div>
            </button>
          </div>

          {/* Vercel Web Metrics & Channels Dashboard */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] italic flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                CONEXIÓN VERCEL & CANALES
              </span>
              <span className="text-[8px] font-black font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                TEMPORAL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Ancho de Banda */}
              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none">Ancho de Banda</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-white font-mono">{webLicenseActive ? '4.82 GB' : '0.00 GB'}</span>
                  <span className="text-[7.5px] font-bold text-zinc-500 font-mono">/ 100G</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: webLicenseActive ? '4.82%' : '0%' }} />
                </div>
              </div>

              {/* Card 2: Peticiones Edge */}
              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none font-sans">Peticiones Edge</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-white font-mono">{webLicenseActive ? '18,482' : '0'}</span>
                  <span className={`text-[7.5px] font-black font-mono ${webLicenseActive ? 'text-emerald-400' : 'text-zinc-500'}`}>{webLicenseActive ? '▲14%' : '0%'}</span>
                </div>
                <span className="text-[7px] font-bold text-zinc-500 uppercase font-mono block mt-2 leading-none">
                  {webLicenseActive ? 'Resp: 14ms (A+)' : 'SITIO SUSPENDIDO'}
                </span>
              </div>

              {/* Card 3: Invocaciones Serverless */}
              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-left relative overflow-hidden">
                <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none">Serverless INVS</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-white font-mono">
                    {webLicenseActive && appLicenseActive ? '2,842' : (webLicenseActive || appLicenseActive ? '1,421' : '0')}
                  </span>
                  <span className="text-[7.5px] font-bold text-zinc-500 font-mono">REQS</span>
                </div>
                <span className="text-[7px] font-bold text-zinc-500 uppercase font-mono block mt-2 leading-none">
                  {webLicenseActive || appLicenseActive ? 'Duración: 112ms' : 'CONSOLA APAGADA'}
                </span>
              </div>

              {/* Card 4: Tokens Consumidos */}
              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-left relative overflow-hidden">
                <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none">Tokens Diarios</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-white font-mono">{appLicenseActive ? '15.4K' : '0.0K'}</span>
                  <span className="text-[7.5px] font-bold text-[#4be277] font-mono">TOKENS</span>
                </div>
                <span className={`text-[7px] font-bold uppercase font-mono block mt-2 leading-none ${appLicenseActive ? 'text-[#4be277]' : 'text-red-500'}`}>
                  {appLicenseActive ? 'LICENCIA ACTIVA' : 'SITIO SUSPENDIDO'}
                </span>
              </div>
            </div>

            {/* Quick action button to check details in Profile Settings */}
            <button
              onClick={() => {
                navigate('/profile?tab=ajustes&modal=vercel');
                if (showToast) showToast('Redirigiendo a Métricas detalladas de Vercel...', 'success');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.01] text-left hover:bg-blue-500/5 hover:border-blue-500/25 active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
                <span className="text-[8px] font-black text-[#bccbb9] uppercase tracking-widest">
                  Ver consola detallada de canales
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#bccbb9]/40 group-hover:text-white transition-colors" />
            </button>
          </div>
        </motion.div>



        {/* Modal Cancha 1 Setup */}
        <AnimatePresence>
          {showCancha1Modal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-xs glass-panel rounded-3xl p-6 border border-[#4be277]/30 bg-zinc-950/90 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-black text-white uppercase italic tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                  <Trophy className="w-4 h-4 text-[#4be277]" />
                  <span>Cancha 1 • {court1Name}</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[8px] font-black text-[#bccbb9]/60 uppercase tracking-widest mb-1.5 block">Nombre del Equipo</label>
                    <input 
                      type="text" 
                      value={quickTeamCancha1} 
                      onChange={(e) => setQuickTeamCancha1(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl h-10 px-3 text-xs text-white uppercase font-bold focus:border-[#4be277] transition-all outline-none"
                      placeholder="Eej. LA ESCALONETA FC"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-[#bccbb9]/60 uppercase tracking-widest mb-1.5 block">Duración del Turno</label>
                    <select
                      value={quickTimeCancha1}
                      onChange={(e) => setQuickTimeCancha1(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl h-10 px-3 text-xs text-white font-bold focus:border-[#4be277] transition-all outline-none"
                    >
                      <option value="5" className="bg-zinc-950">5 Minutos (Prueba Rápida)</option>
                      <option value="15" className="bg-zinc-950">15 Minutos</option>
                      <option value="30" className="bg-zinc-950">30 Minutos</option>
                      <option value="45" className="bg-zinc-950">45 Minutos</option>
                      <option value="60" className="bg-zinc-950">1 Hora (60 min)</option>
                      <option value="90" className="bg-zinc-950">90 Minutos</option>
                      <option value="120" className="bg-zinc-950">2 Horas (120 min)</option>
                    </select>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button 
                      onClick={() => setShowCancha1Modal(false)}
                      className="flex-1 h-9 rounded-xl border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (!quickTeamCancha1.trim()) {
                          if (showToast) showToast('Por favor ingrese el nombre del equipo', 'error');
                          return;
                        }
                        setCancha1Team(quickTeamCancha1);
                        setCancha1TimeLeft(`${parseInt(quickTimeCancha1, 10).toString().padStart(2, '0')}:00`);
                        setCancha1Active(true);
                        setShowCancha1Modal(false);
                        if (showToast) showToast(`¡Turno configurado en ${court1Name}!`, 'success');
                      }}
                      className="flex-1 h-9 rounded-xl bg-[#4be277] text-black font-black text-[9px] uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_15px_rgba(75,226,119,0.3)]"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Cancha 2 Setup */}
        <AnimatePresence>
          {showCancha2Modal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-xs glass-panel rounded-3xl p-6 border border-[#4be277]/30 bg-zinc-950/90 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-black text-white uppercase italic tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                  <Trophy className="w-4 h-4 text-[#4be277]" />
                  <span>Cancha 2 • {court2Name}</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[8px] font-black text-[#bccbb9]/60 uppercase tracking-widest mb-1.5 block">Nombre del Equipo</label>
                    <input 
                      type="text" 
                      value={quickTeamCancha2} 
                      onChange={(e) => setQuickTeamCancha2(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl h-10 px-3 text-xs text-white uppercase font-bold focus:border-[#4be277] transition-all outline-none"
                      placeholder="Ej. ASTON BIRRA FC"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-[#bccbb9]/60 uppercase tracking-widest mb-1.5 block">Duración del Turno</label>
                    <select
                      value={quickTimeCancha2}
                      onChange={(e) => setQuickTimeCancha2(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl h-10 px-3 text-xs text-white font-bold focus:border-[#4be277] transition-all outline-none"
                    >
                      <option value="5" className="bg-zinc-950">5 Minutos (Prueba Rápida)</option>
                      <option value="15" className="bg-zinc-950">15 Minutos</option>
                      <option value="30" className="bg-zinc-950">30 Minutos</option>
                      <option value="45" className="bg-zinc-950">45 Minutos</option>
                      <option value="60" className="bg-zinc-950">1 Hora (60 min)</option>
                      <option value="90" className="bg-zinc-950">90 Minutos</option>
                      <option value="120" className="bg-zinc-950">2 Horas (120 min)</option>
                    </select>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button 
                      onClick={() => setShowCancha2Modal(false)}
                      className="flex-1 h-9 rounded-xl border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (!quickTeamCancha2.trim()) {
                          if (showToast) showToast('Por favor ingrese el nombre del equipo', 'error');
                          return;
                        }
                        setCancha2Team(quickTeamCancha2);
                        setCancha2TimeLeft(`${parseInt(quickTimeCancha2, 10).toString().padStart(2, '0')}:00`);
                        setCancha2Active(true);
                        setShowCancha2Modal(false);
                        if (showToast) showToast(`¡Turno configurado en ${court2Name}!`, 'success');
                      }}
                      className="flex-1 h-9 rounded-xl bg-[#4be277] text-black font-black text-[9px] uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_15px_rgba(75,226,119,0.3)]"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // ──────────────────────────────────────────────
  // VISTA PÚBLICA (jugadores / no logueados)
  // ──────────────────────────────────────────────
  return (
    <main className="relative flex-grow flex flex-col items-center min-h-[100dvh] pt-12 pb-28 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-pitch opacity-20 pointer-events-none" />

      {/* Botones de acción principales arriba (solo cuando no está logueado para priorizar la experiencia del jugador) */}
      {!isLogged && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mb-6 z-10 flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login', { state: { mode: 'register' } })}
            className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4be277]/10 flex items-center justify-center border border-[#4be277]/20">
              <UserPlus className="w-5 h-5 text-[#4be277]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-black uppercase italic tracking-tighter text-white">Soy Nuevo</span>
              <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest">Registrarse</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#bccbb9]/20 ml-auto" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login', { state: { mode: 'login' } })}
            className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF9100]/10 flex items-center justify-center border border-[#FF9100]/20">
              <LogIn className="w-5 h-5 text-[#FF9100]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-black uppercase italic tracking-tighter text-white">Soy Jugador</span>
              <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest">Ingresar</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#bccbb9]/20 ml-auto" />
          </motion.button>
        </motion.div>
      )}

      {/* Logo central */}
      {!isLogged && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 0.9 }}
          className="relative w-full flex flex-col items-center justify-center mb-6"
        >
          <div className="absolute -inset-20 bg-[#4be277]/10 rounded-full blur-[120px] opacity-20 pointer-events-none" />
          <img
            src="/logo_ramito.png"
            alt="Ramito Fut Show"
            className="w-72 h-auto drop-shadow-[0_0_50px_rgba(75,226,119,0.3)]"
          />
        </motion.div>
      )}

      {/* Botones de acción en la parte inferior */}
      <div className="w-full max-w-sm flex flex-col gap-3 z-10">
        {!isLogged ? (
          /* Botón Acceso Staff en la parte inferior si no está logueado en dispositivo móvil */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdminLogin(true)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all opacity-60 hover:opacity-100"
            >
              <div className="w-8 h-8 rounded-lg bg-[#4be277]/10 flex items-center justify-center border border-[#4be277]/20">
                <ShieldCheck className="w-4 h-4 text-[#4be277]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase text-white">Acceso Staff</span>
                <span className="text-[8px] font-bold text-[#bccbb9]/30 uppercase tracking-widest">Administración</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#bccbb9]/20 ml-auto" />
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {nextBooking ? (
              <MicroBookingWidget booking={nextBooking} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4.5 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.01] to-white/[0.03] text-left space-y-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#FF9100]/[0.01] pointer-events-none" />
                <div className="flex items-center gap-1.5 text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                  Sin reservas activas
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-white uppercase italic tracking-tight">¿Listo para salir a la cancha hoy? ⚽</h4>
                  <p className="text-[9px] font-bold text-[#bccbb9]/45 leading-normal">
                    No tienes ningún partido agendado para las próximas horas. ¡Elegí uno de los turnos libres abajo para reservar tu lugar ahora mismo!
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => navigate('/booking')}
                    className="h-8 px-4 rounded-xl bg-[#4be277]/10 hover:bg-[#4be277]/20 border border-[#4be277]/15 text-[#4be277] text-[8px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Reserva tu Turno ⚡
                  </button>
                </div>
              </motion.div>
            )}

            <ThreeQuickDetailsWidget />

            {/* CANCHAS & RESERVAS ONLINE */}
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9100] animate-pulse shrink-0" />
                  <Clock className="w-3.5 h-3.5 text-[#FF9100] shrink-0" /> DISPONIBILIDAD EN VIVO • HOY
                </span>
                <span className="text-[8px] font-black font-mono text-[#FF9100] bg-[#FF9100]/10 border border-[#FF9100]/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                  LIVE NOW ⚡
                </span>
              </div>

              <div className="glass-panel p-5 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.01] to-white/[0.03] hover:border-[#FF9100]/15 transition-all duration-300 space-y-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9100]/[0.02] rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  {(() => {
                    const getTodaySlotStatus = (timeSlot: string) => {
                      if (!allBookings) return { c1Free: true, c2Free: true };
                      
                      const c1Booked = allBookings.some((b: any) => {
                        const isToday = (b.date || '').toLowerCase().includes('hoy');
                        const matchesTime = (b.time || '').includes(timeSlot);
                        const isC1 = (b.field || b.courtName || '').toLowerCase().includes('cancha 1') || 
                                     (b.field || b.courtName || '').toLowerCase().includes('maracaná') || 
                                     (b.field || b.courtName || '').toLowerCase().includes('maracana') ||
                                     !(b.field || b.courtName || '').toLowerCase().includes('cancha 2');
                        return isToday && matchesTime && isC1 && (b.status === 'upcoming' || b.status === 'pending_approval' || b.status === 'pending_payment');
                      });

                      const c2Booked = allBookings.some((b: any) => {
                        const isToday = (b.date || '').toLowerCase().includes('hoy');
                        const matchesTime = (b.time || '').includes(timeSlot);
                        const isC2 = (b.field || b.courtName || '').toLowerCase().includes('cancha 2') || 
                                     (b.field || b.courtName || '').toLowerCase().includes('bombonera');
                        return isToday && matchesTime && isC2 && (b.status === 'upcoming' || b.status === 'pending_approval' || b.status === 'pending_payment');
                      });

                      return {
                        c1Free: !c1Booked,
                        c2Free: !c2Booked
                      };
                    };

                    const todaySlots = ['18:00', '19:00', '20:00', '21:00', '22:00'];
                    let freeCount = 0;
                    todaySlots.forEach(t => {
                      const { c1Free, c2Free } = getTodaySlotStatus(t);
                      if (c1Free) freeCount++;
                      if (c2Free) freeCount++;
                    });

                    return (
                      <>
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-[10px] font-black text-white uppercase italic tracking-wider flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-[#FF9100]" />
                            Turnos Libres de Hoy
                          </span>
                          <span className="text-[8px] font-black text-[#4be277] uppercase tracking-wider bg-[#4be277]/10 px-2 py-0.5 rounded-md border border-[#4be277]/20 font-mono">
                            {freeCount} libres
                          </span>
                        </div>

                        {/* Canchas y Celdas Horarias */}
                        <div className="space-y-3.5 pt-1">
                          {/* Cancha 1 */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-[#bccbb9]/85 tracking-[0.1em] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4be277]" />
                                Cancha 1 • El Maracaná 🏟️
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                              {todaySlots.map((time) => {
                                const { c1Free } = getTodaySlotStatus(time);
                                return (
                                  <button
                                    key={time + '_c1'}
                                    onClick={() => navigate('/booking', { state: { initialCourt: '1' } })}
                                    className={`h-11 rounded-xl flex flex-col items-center justify-center border font-mono transition-all text-[10px] focus:outline-none cursor-pointer ${
                                      c1Free
                                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-[#4be277]/30 text-[#4be277] font-black'
                                        : 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 text-rose-400 font-bold'
                                    }`}
                                  >
                                    <span className="leading-none text-xs font-black">{time}</span>
                                    <span className="text-[5.5px] font-sans font-black uppercase mt-1 tracking-wider opacity-90">
                                      {c1Free ? 'LIBRE' : 'OK'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Cancha 2 */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-[#bccbb9]/85 tracking-[0.1em] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9100]" />
                                Cancha 2 • La Bombonera 🏟️
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                              {todaySlots.map((time) => {
                                const { c2Free } = getTodaySlotStatus(time);
                                return (
                                  <button
                                    key={time + '_c2'}
                                    onClick={() => navigate('/booking', { state: { initialCourt: '2' } })}
                                    className={`h-11 rounded-xl flex flex-col items-center justify-center border font-mono transition-all text-[10px] focus:outline-none cursor-pointer ${
                                      c2Free
                                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-[#4be277]/30 text-[#4be277] font-black'
                                        : 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 text-rose-400 font-bold'
                                    }`}
                                  >
                                    <span className="leading-none text-xs font-black">{time}</span>
                                    <span className="text-[5.5px] font-sans font-black uppercase mt-1 tracking-wider opacity-90">
                                      {c2Free ? 'LIBRE' : 'OK'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/booking')}
                  className="w-full h-11 rounded-xl bg-[#FF9100] text-black font-black text-[9px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(255,145,0,0.25)] hover:bg-[#FF9100]/95"
                >
                  <Zap className="w-3.5 h-3.5 animate-pulse" /> RESERVAR AHORA
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CANTINA & MINI-SHOP (Only for logged players) */}
      {isLogged && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm mt-6 z-10 space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] italic flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <GlassWater className="w-3.5 h-3.5 text-amber-500 shrink-0" /> CANTINA & MINI-SHOP RAMITO
            </span>
            <span className="text-[8px] font-black font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
              CATÁLOGO ACTIVO ⚡
            </span>
          </div>

          <CantinaCatalogWidget 
            cantinaItems={cantinaItems} 
            renderIconById={renderIconById} 
            adminPhone={adminPhone} 
          />
        </motion.div>
      )}

      {/* Modal Acceso Staff */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm glass-panel rounded-[3rem] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowAdminLogin(false)} className="absolute top-6 right-6 text-[#bccbb9]">
                <X className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#4be277]/10 flex items-center justify-center border border-[#4be277]/20">
                  <ShieldCheck className="w-8 h-8 text-[#4be277]" />
                </div>
                <div className="text-center">
                  <h3 className="font-display text-2xl font-black text-white uppercase italic tracking-tighter">Acceso Staff</h3>
                  <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest italic">
                    {adminLoginMethod === 'pin' ? 'Use su código especial de ingreso rápido' : 'Ingrese su correo y llave'}
                  </p>
                </div>

                {/* Alternador de método de ingreso para administrador */}
                <div className="flex bg-black/60 p-1 rounded-2xl border border-white/5 w-full max-w-[270px] -mt-2">
                  <button
                    type="button"
                    onClick={() => setAdminLoginMethod('credentials')}
                    className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                      adminLoginMethod === 'credentials'
                        ? 'bg-[#4be277] text-black shadow-md'
                        : 'text-[#bccbb9]/50 hover:text-white'
                    }`}
                  >
                    Con Correo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminLoginMethod('pin')}
                    className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all gap-1 flex items-center justify-center ${
                      adminLoginMethod === 'pin'
                        ? 'bg-[#4be277] text-black shadow-md'
                        : 'text-[#bccbb9]/50 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" /> PIN Rápido
                  </button>
                </div>

                <form onSubmit={handleAdminLogin} className="w-full space-y-4">
                  {adminLoginMethod === 'pin' ? (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-[10px] font-black text-[#4be277] uppercase tracking-widest ml-1">
                        PIN Rápido Administrador
                      </label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4be277]" />
                        <input
                          type={adminQuickPinVisible ? 'text' : 'password'}
                          required
                          value={adminQuickPin}
                          onChange={(e) => setAdminQuickPin(e.target.value)}
                          placeholder="INGRESE SU PIN"
                          className="block w-full pl-12 pr-16 h-14 bg-white/[0.03] border border-white/10 rounded-2xl text-white font-mono font-black tracking-widest uppercase text-xs focus:border-[#4be277]/60 outline-none transition-all cursor-text text-center animate-pulse"
                        />
                        <button
                          type="button"
                          onClick={() => setAdminQuickPinVisible(!adminQuickPinVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono font-black text-[#bccbb9]/50 hover:text-white tracking-widest px-2 py-1.5 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                        >
                          {adminQuickPinVisible ? 'OCULTAR' : 'VER'}
                        </button>
                      </div>
                      <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-normal text-center mt-1 px-1">
                        * Ingresa tu PIN de 4 a 12 caracteres alfanuméricos guardado en tu panel de administrador.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Correo Administrador</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9]" />
                          <input
                            type="email"
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="CORREO"
                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 text-white font-black uppercase text-[11px] focus:border-[#4be277]/50 outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Llave Maestro o Personal</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9]" />
                          <input
                            type="password"
                            required
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 text-white font-black tracking-[0.3em] focus:border-[#4be277]/50 outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-500 justify-center bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Datos Incorrectos</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#4be277] text-black font-black h-16 rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-[#4be277]/20 flex items-center justify-center gap-3 italic cursor-pointer"
                  >
                    {adminLoginMethod === 'pin' ? 'VALIDAR PIN E INGRESAR' : 'INGRESAR AL PANEL'} <Key className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      navigate('/login', { state: { view: 'recover' } });
                    }}
                    className="text-[8px] font-black text-[#bccbb9]/50 hover:text-[#4be277] uppercase tracking-widest transition-all cursor-pointer hover:underline font-mono"
                  >
                    ¿Olvidó su Llave o PIN? Recupérela aquí &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </main>
  );
}
