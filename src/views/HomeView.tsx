import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronRight, X, Lock, User, AlertTriangle, UserPlus, Zap, MessageCircle, Key, LogIn, Calendar, Clock, PlayCircle, DollarSign, Power } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HomeView() {
  const navigate = useNavigate();
  const { eliteKey, vipKey, adminPhone, showToast } = useApp();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('ramito_maintenance') === 'true');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState(false);

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
      <main className="relative flex-grow flex flex-col items-center min-h-[100dvh] pt-6 pb-28 px-6 overflow-hidden">
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

        {/* 1. LICENCIAS — estilo Caja del Día */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mb-4 z-10 space-y-3"
        >
          {/* Licencia Web */}
          <div className="glass-panel p-4 rounded-2xl border border-[#FF9100]/20 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF9100]/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#FF9100] rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest block italic">Licencia Web</span>
                <span className="text-[8px] font-bold text-[#bccbb9]/60 uppercase tracking-widest">Activa y Sincronizada</span>
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-widest">Activa</span>
              <span className="text-[8px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5">365 Días</span>
            </div>
          </div>

          {/* Licencia APP (PWA) */}
          <div className="glass-panel p-4 rounded-2xl border border-[#FF9100]/20 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF9100]/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#FF9100] rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest block italic">Licencia APP (PWA)</span>
                <span className="text-[8px] font-bold text-[#bccbb9]/60 uppercase tracking-widest">Activa y Sincronizada</span>
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-widest">Activa</span>
              <span className="text-[8px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5">365 Días</span>
            </div>
          </div>
        </motion.div>

        {/* 2. MÉTRICAS Y DATOS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col gap-3 z-10"
        >
          {/* Turno en juego */}
          <div className="bg-[#4be277]/10 border border-[#4be277]/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(75,226,119,0.1)]">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-8 h-8 text-[#4be277] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Jugando Ahora</span>
                <span className="text-[12px] font-bold text-[#4be277] uppercase tracking-tighter">La Escaloneta FC</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest block">Termina en</span>
              <span className="text-[14px] font-black text-white">15:00</span>
            </div>
          </div>

          {/* Caja del día + Cierre emergencia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-4 rounded-2xl border border-[#FF9100]/20 bg-white/[0.02] flex flex-col justify-center items-center text-center">
              <DollarSign className="w-6 h-6 text-[#FF9100] mb-1" />
              <span className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest">Caja del Día</span>
              <span className="text-[16px] font-black text-white tracking-tighter mt-1">$45.000</span>
            </div>

            <button
              onClick={() => {
                const newVal = !maintenanceMode;
                setMaintenanceMode(newVal);
                localStorage.setItem('ramito_maintenance', String(newVal));
                if (showToast) showToast(
                  newVal ? 'Modo Mantenimiento Activado' : 'Modo Mantenimiento Desactivado',
                  newVal ? 'error' : 'success'
                );
              }}
              className={`p-4 rounded-2xl border flex flex-col justify-center items-center text-center transition-all ${
                maintenanceMode
                  ? 'bg-red-500/20 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'glass-panel bg-white/[0.02] border-white/10'
              }`}
            >
              <Power className={`w-6 h-6 mb-1 ${maintenanceMode ? 'text-red-500 animate-pulse' : 'text-[#bccbb9]/60'}`} />
              <span className={`text-[8px] font-bold uppercase tracking-widest ${maintenanceMode ? 'text-red-500' : 'text-[#bccbb9]/60'}`}>
                Cierre Emergencia
              </span>
              <span className={`text-[10px] font-black tracking-tighter mt-1 ${maintenanceMode ? 'text-red-500' : 'text-white'}`}>
                {maintenanceMode ? 'ACTIVADO' : 'NORMAL'}
              </span>
            </button>
          </div>

          {/* Reservas de hoy */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 text-center space-y-4 relative overflow-hidden bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <h3 className="text-xs font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF9100]" /> Reservas de Hoy
              </h3>
              <span className="text-[8px] font-black bg-[#FF9100]/20 text-[#FF9100] px-2 py-1 rounded-md border border-[#FF9100]/30">
                3 PENDIENTES
              </span>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 hover:border-[#4be277]/30 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#bccbb9]" /> 18:00 - 19:00
                  </span>
                  <span className="text-[8px] text-[#bccbb9]/60 uppercase font-bold mt-1">Los Pibes FC • Pagado</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#4be277] shadow-[0_0_8px_rgba(75,226,119,0.6)] animate-pulse" />
              </div>
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#bccbb9]" /> 19:00 - 20:00
                  </span>
                  <span className="text-[8px] text-[#bccbb9]/60 uppercase font-bold mt-1">Real Bañil • Seña 50%</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
              </div>
            </div>

            <button
              onClick={() => navigate('/booking')}
              className="w-full h-12 mt-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-[0.2em] italic text-[9px] hover:bg-white/10 transition-all"
            >
              Gestionar Calendario <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
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
              onClick={() => setShowAdminLogin(false)}
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
