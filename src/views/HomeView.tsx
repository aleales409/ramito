import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronRight, X, Lock, User, AlertTriangle, UserPlus, Zap, MessageCircle, Key, LogIn, Calendar, Clock, PlayCircle, DollarSign, Power, Globe, Smartphone, Newspaper, Database, HardDrive, Activity, Info, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';


export default function HomeView() {
  const navigate = useNavigate();
  const { eliteKey, vipKey, adminPhone, showToast, webLicenseActive, appLicenseActive, saveSettings, stadiumName, courts, allBookings } = useApp();

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

  const isLogged = !!localStorage.getItem('ramito_user_name');
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  // Auto-Login for Master Keys
  React.useEffect(() => {
    if (adminKey && (adminKey === eliteKey || adminKey === vipKey)) {
      const r = adminKey === eliteKey ? 'admin_elite' : 'admin_vip';
      localStorage.setItem('ramito_user_role', r);
      localStorage.setItem('ramito_user_name', r === 'admin_elite' ? 'Elite Admin' : 'VIP Admin');
      localStorage.setItem('ramito_user_id', 'master_access');
      navigate('/profile');
    }
  }, [adminKey, eliteKey, vipKey, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return;

    try {
      const { supabase } = await import('../lib/supabase');

      if (!adminEmail) {
        setError(true);
        return;
      }

      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', adminEmail.toLowerCase())
        .eq('password', adminKey)
        .maybeSingle();

      if (user && (user.role === 'admin_elite' || user.role === 'admin_vip')) {
        localStorage.setItem('ramito_user_role', user.role);
        localStorage.setItem('ramito_user_name', user.name);
        localStorage.setItem('ramito_user_id', user.id);
        navigate('/profile');
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
          className="w-full max-w-sm mb-4 z-10 grid grid-cols-2 gap-3"
        >
          {/* Licencia Web */}
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
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">{court1Name}</span>
                      <span className="text-[7.5px] font-bold bg-[#4be277]/15 text-[#4be277] px-1 rounded-sm border border-[#4be277]/20">Césped</span>
                    </div>
                    {cancha1Active ? (
                      <span className="text-[12px] font-black text-[#4be277] uppercase tracking-wide leading-none mt-1">
                        {cancha1Team}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#bccbb9]/40 uppercase tracking-wide leading-none mt-1 font-mono italic">
                        Disponible / Guardería Vacía
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
                  ) : (
                    <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                      LIBRE
                    </span>
                  )}
                </div>
              </div>

              {/* Siguiente turno (Próximas reservas) */}
              {(() => {
                const bookings = getUpcomingBookingsForCourt('1', court1Name);
                if (bookings.length === 0) return null;
                return (
                  <div className="px-3.5 py-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border-t border-emerald-500/20 text-left transition-all flex flex-col gap-1.5">
                    <span className="text-[7.5px] font-black text-[#4be277] uppercase tracking-widest block mb-0.5">⚽ PROXIMAS RESERVAS</span>
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
                    className="text-[8px] font-black text-[#4be277] hover:text-[#4be277]/85 uppercase tracking-widest px-3 py-1 rounded bg-[#4be277]/10 hover:bg-[#4be277]/15 border border-[#4be277]/20 transition-all ml-auto flex items-center gap-1"
                  >
                    ⚡ INICIAR TURNO RÁPIDO
                  </button>
                )}
              </div>
            </motion.div>

            {/* Cancha 2 (Sin Césped/Cemento/Al aire libre) */}
            <motion.div 
              layout
              className={`relative overflow-hidden transition-all duration-300 rounded-2xl border ${
                cancha2Active 
                  ? 'bg-gradient-to-r from-emerald-950/20 to-emerald-900/10 border-emerald-500/30 shadow-[0_4px_20px_rgba(75,226,119,0.06)]' 
                  : 'bg-white/[0.01] border-white/5 opacity-80'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                    cancha2Active 
                      ? 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277] animate-pulse' 
                      : 'bg-white/5 border-white/10 text-white/30'
                  }`}>
                    <PlayCircle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">{court2Name}</span>
                      <span className="text-[7.5px] font-bold bg-amber-500/15 text-amber-500 px-1 rounded-sm border border-amber-500/20">Sin Césped</span>
                    </div>
                    {cancha2Active ? (
                      <span className="text-[12px] font-black text-[#4be277] uppercase tracking-wide leading-none mt-1">
                        {cancha2Team}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#bccbb9]/40 uppercase tracking-wide leading-none mt-1 font-mono italic">
                        Disponible / Guardería Vacía
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
                  ) : (
                    <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                      LIBRE
                    </span>
                  )}
                </div>
              </div>

              {/* Siguiente turno (Próximas reservas) */}
              {(() => {
                const bookings = getUpcomingBookingsForCourt('2', court2Name);
                if (bookings.length === 0) return null;
                return (
                  <div className="px-3.5 py-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border-t border-emerald-500/20 text-left transition-all flex flex-col gap-1.5">
                    <span className="text-[7.5px] font-black text-[#4be277] uppercase tracking-widest block mb-0.5">⚽ PROXIMAS RESERVAS</span>
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
                    className="text-[8px] font-black text-[#4be277] hover:text-[#4be277]/85 uppercase tracking-widest px-3 py-1 rounded bg-[#4be277]/10 hover:bg-[#4be277]/15 border border-[#4be277]/20 transition-all ml-auto flex items-center gap-1"
                  >
                    ⚡ INICIAR TURNO RÁPIDO
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Caja del día & Cierre emergencia */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                navigate('/profile?tab=seguridad');
                if (showToast) showToast('Redirigiendo a Auditoría de Ingresos...', 'success');
              }}
              className="w-full glass-panel p-4 rounded-2xl border border-[#FF9100]/25 bg-white/[0.02] flex flex-row items-center justify-between text-left hover:bg-[#FF9100]/5 hover:border-[#FF9100]/40 transition-all group outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF9100]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="w-5 h-5 text-[#FF9100]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-[#bccbb9]/80 uppercase tracking-widest leading-none">Caja del Día</span>
                  <span className="text-[7.5px] font-bold text-[#bccbb9]/45 uppercase tracking-widest mt-1">Suma acumulada de reservas de hoy</span>
                </div>
              </div>
              <span className="text-base font-mono font-black text-white tracking-widest">$45.000</span>
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
              className="w-full glass-panel p-4 rounded-2xl border border-amber-500/25 bg-white/[0.02] flex flex-row items-center justify-between text-left hover:bg-amber-500/5 hover:border-amber-500/40 transition-all group outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Database className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-[#bccbb9]/80 uppercase tracking-widest leading-none">Cómputo & Storage Backend</span>
                  <p className="text-[7.5px] font-bold text-[#bccbb9]/45 uppercase tracking-widest mt-1">
                    Almacenamiento de comprobantes en Supabase Storage
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '13.9%' }} />
                    </div>
                    <span className="text-[7.5px] font-mono font-black text-amber-400 uppercase">13.9% de uso</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-black text-white tracking-wider block">142.5 MB</span>
                <span className="text-[7px] font-bold text-[#bccbb9]/30 uppercase tracking-widest font-mono block mt-0.5">/ 1.0 GB Limit</span>
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
                  <span className="text-sm font-black text-white font-mono">4.82 GB</span>
                  <span className="text-[7.5px] font-bold text-zinc-500 font-mono">/ 100G</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '4.82%' }} />
                </div>
              </div>

              {/* Card 2: Peticiones Edge */}
              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none font-sans">Peticiones Edge</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-white font-mono">18,482</span>
                  <span className="text-[7.5px] font-black text-emerald-400 font-mono">▲14%</span>
                </div>
                <span className="text-[7px] font-bold text-zinc-500 uppercase font-mono block mt-2 leading-none">Resp: 14ms (A+)</span>
              </div>

              {/* Card 3: Invocaciones Serverless */}
              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-left relative overflow-hidden">
                <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none">Serverless INVS</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-white font-mono">2,842</span>
                  <span className="text-[7.5px] font-bold text-zinc-500 font-mono">REQS</span>
                </div>
                <span className="text-[7px] font-bold text-zinc-500 uppercase font-mono block mt-2 leading-none">Duración: 112ms</span>
              </div>

              {/* Card 4: Tokens Consumidos */}
              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-left relative overflow-hidden">
                <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block leading-none">Tokens Diarios</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-sm font-black text-white font-mono">15.4K</span>
                  <span className="text-[7.5px] font-bold text-[#4be277] font-mono">TOKENS</span>
                </div>
                <span className="text-[7px] font-bold text-[#4be277] uppercase font-mono block mt-2 leading-none">LICENCIA ACTIVA</span>
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
                  <span>⚽ Cancha 1 • {court1Name}</span>
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
                  <span>⚽ Cancha 2 • {court2Name}</span>
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

      {/* Botón Acceso Staff (solo si no es admin) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mb-6 z-10"
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

      {/* Logo central */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full flex flex-col items-center justify-center mb-6"
      >
        <div className="absolute -inset-20 bg-[#4be277]/10 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <img
          src="/logo_ramito.png"
          alt="Ramito Fut Show"
          className="w-72 h-auto drop-shadow-[0_0_50px_rgba(75,226,119,0.3)]"
        />
      </motion.div>

      {/* Botones de acción */}
      <div className="w-full max-w-sm flex flex-col gap-3 z-10">
        {!isLogged ? (
          <>
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
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/booking')}
            className="w-full flex items-center gap-4 p-5 rounded-3xl bg-[#FF9100]/10 border border-[#FF9100]/30 hover:bg-[#FF9100]/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FF9100]/20 flex items-center justify-center border border-[#FF9100]/40">
              <Zap className="w-7 h-7 text-[#FF9100] animate-pulse" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FF9100]">
                Reservar Cancha
              </span>
              <span className="text-[9px] font-black text-[#FF9100] uppercase tracking-widest">Jugar Ahora</span>
            </div>
            <ChevronRight className="w-6 h-6 text-[#FF9100]/40 ml-auto" />
          </motion.button>
        )}
      </div>

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
                  <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest italic">Ingrese su correo y llave</p>
                </div>

                <form onSubmit={handleAdminLogin} className="w-full space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Correo Administrador</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9]" />
                      <input
                        type="email"
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
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 text-white font-black tracking-[0.3em] focus:border-[#4be277]/50 outline-none"
                      />
                    </div>
                  </div>

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
                    className="w-full bg-[#4be277] text-black font-black h-16 rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-[#4be277]/20 flex items-center justify-center gap-3 italic"
                  >
                    INGRESAR AL PANEL <Key className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp flotante */}
      {isLogged && !role?.includes('admin') && adminPhone && (
        <motion.a
          href={`https://wa.me/${adminPhone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-6 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg z-50 border-4 border-[#121414]"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </motion.a>
      )}
    </main>
  );
}
