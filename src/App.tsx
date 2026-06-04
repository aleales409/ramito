import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import TopAppBar from './components/TopAppBar';
import BottomNav from './components/BottomNav';
import HomeView from './views/HomeView';
import BookingView from './views/BookingView';
import ConfirmationView from './views/ConfirmationView';
import SuccessView from './views/SuccessView';
import MyBookingsView from './views/MyBookingsView';
import ProfileView from './views/ProfileView';
import LoginView from './views/LoginView';
import NewsConfigView from './views/NewsConfigView';
import { useApp } from './context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import Toast from './components/Toast';

// ============================================================
//  PANTALLA DE BLOQUEO (Mantenimiento / Emergencia)
//  - Imagen a pantalla completa
//  - 5 toques secretos revelan el panel de login admin
//  - Admin Élite → desactiva mantenimiento + entra al perfil
//  - Admin VIP   → solo entra al perfil (modo lectura)
// ============================================================
function LockScreen() {
  const navigate = useNavigate();
  const {
    emergencyMode, emergencyType, emergencyMessage,
    setMaintenanceMode,
    eliteKey, vipKey,
    setUserRole, setUserName,
  } = useApp();

  const [tapCount, setTapCount] = React.useState(0);
  const [showLogin, setShowLogin] = React.useState(false);
  const [adminKey, setAdminKey] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [loginSuccess, setLoginSuccess] = React.useState(false);
  const tapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImageTap = () => {
    const next = tapCount + 1;
    setTapCount(next);

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 2500);

    if (next >= 5) {
      setShowLogin(true);
      setTapCount(0);
      if (tapTimer.current) clearTimeout(tapTimer.current);
    }
  };

  const handleAdminLogin = () => {
    setLoginError('');
    const trimmed = adminKey.trim();

    if (trimmed === eliteKey) {
      // Admin Élite: desactiva mantenimiento y entra
      setUserRole('admin_elite');
      setUserName('Admin Élite');
      localStorage.setItem('ramito_user_role', 'admin_elite');
      localStorage.setItem('ramito_user_name', 'Admin Élite');
      setLoginSuccess(true);
      setTimeout(() => {
        setMaintenanceMode(false);
        localStorage.setItem('ramito_maintenance', 'false');
        navigate('/profile');
      }, 900);
    } else if (trimmed === vipKey) {
      // Admin VIP: solo entra al perfil (no puede desactivar)
      setUserRole('admin_vip');
      setUserName('Admin VIP');
      localStorage.setItem('ramito_user_role', 'admin_vip');
      localStorage.setItem('ramito_user_name', 'Admin VIP');
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 900);
    } else {
      setLoginError('Clave incorrecta. Solo administradores autorizados.');
      setAdminKey('');
    }
  };

  const bgImage = emergencyMode ? '/emergencia.png' : '/mantenimiento.png';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] overflow-hidden select-none"
    >
      {/* ── IMAGEN A PANTALLA COMPLETA (clickeable para el gesto secreto) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url(${bgImage})` }}
        onClick={handleImageTap}
      />

      {/* Gradiente sutil en la parte inferior */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50 pointer-events-none" />

      {/* ── INDICADOR DE TAPS (puntitos que aparecen discretamente) ── */}
      {tapCount > 0 && tapCount < 5 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: i < tapCount ? 1.3 : 1 }}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i < tapCount ? 'bg-amber-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── MENSAJE DE EMERGENCIA (solo cuando hay emergencia, no mantenimiento) ── */}
      {emergencyMode && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-20 pointer-events-none">
          <div className={`p-4 rounded-2xl backdrop-blur-md text-center border ${
            emergencyType === 'critical'
              ? 'bg-red-950/80 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
              : 'bg-amber-950/80 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {emergencyType === 'critical'
                ? <ShieldAlert className="w-4 h-4 text-red-400" />
                : <AlertTriangle className="w-4 h-4 text-amber-400" />
              }
              <span className={`text-[8px] font-black tracking-widest uppercase font-mono ${
                emergencyType === 'critical' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {emergencyType === 'critical' ? '🚨 Cierre de Emergencia' : '⚠️ Cierre Preventivo'}
              </span>
            </div>
            <p className="text-[9px] font-bold text-white/80 uppercase tracking-wide leading-relaxed font-mono">
              {emergencyMessage}
            </p>
          </div>
        </div>
      )}

      {/* ── PANEL SECRETO DE LOGIN (desliza desde abajo tras 5 toques) ── */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            key="secret-login"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="absolute inset-0 z-30 flex items-end justify-center pb-8 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowLogin(false); setAdminKey(''); setLoginError(''); } }}
          >
            <div className="w-full max-w-sm bg-black/92 backdrop-blur-2xl border border-amber-500/20 rounded-[2rem] p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4">

              {loginSuccess ? (
                /* Estado de éxito */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#4be277]/10 border border-[#4be277]/30 flex items-center justify-center text-[#4be277]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-black text-[#4be277] uppercase tracking-widest">Acceso Concedido</span>
                  <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Redirigiendo al panel administrativo...</p>
                </motion.div>
              ) : (
                <>
                  {/* Cabecera */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[12px] font-black text-white uppercase tracking-wider block italic">
                        Acceso Administrativo
                      </span>
                      <span className="text-[8px] font-mono text-white/35 tracking-widest uppercase">
                        Solo personal autorizado • Ramito Fut Show
                      </span>
                    </div>
                  </div>

                  {/* Campo de clave */}
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-amber-400/70 uppercase tracking-widest block">
                      Clave de Administrador
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={adminKey}
                        onChange={(e) => { setAdminKey(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        autoFocus
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 text-xs font-mono font-bold text-white text-center tracking-widest placeholder-white/15 outline-none focus:border-amber-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {loginError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-[8.5px] font-bold text-red-400 font-mono uppercase tracking-wide text-center pt-1"
                        >
                          ⚠ {loginError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowLogin(false); setAdminKey(''); setLoginError(''); }}
                      className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-white/40 font-black rounded-xl text-[9px] uppercase tracking-widest italic transition-all border border-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminLogin}
                      disabled={!adminKey.trim()}
                      className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black rounded-xl text-[9px] uppercase tracking-widest italic transition-all shadow-lg shadow-amber-500/20 active:scale-[0.97]"
                    >
                      Ingresar
                    </button>
                  </div>

                  <p className="text-center text-[7px] font-mono text-white/15 uppercase tracking-widest pt-1">
                    Admin Élite desactiva mantenimiento • Admin VIP acceso solo lectura
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
//  CONTENIDO PRINCIPAL DE LA APP
// ============================================================
function AppContent() {
  const { isSystemBlocked, maintenanceMode, emergencyMode } = useApp();
  const location = useLocation();
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  // Admins autenticados siempre pueden acceder a /profile
  const shouldShowLock = (isSystemBlocked || maintenanceMode || emergencyMode)
    && !(isAdmin && location.pathname === '/profile');

  return (
    <>
      <Toast />
      <AnimatePresence>
        {shouldShowLock && <LockScreen key="lock" />}
      </AnimatePresence>

      {!shouldShowLock && (
        <div className="flex flex-col min-h-[100dvh] w-full max-w-5xl md:max-w-6xl mx-auto relative main-bg-container shadow-2xl shadow-black/50 overflow-x-hidden border-x border-white/5">
          <div className="premium-overlay" />
          <div className="pitch-pattern" />

          <div className="relative z-10 flex flex-col flex-grow">
            <TopAppBar />

            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="/booking" element={<BookingView />} />
              <Route path="/confirmation" element={<ConfirmationView />} />
              <Route path="/success" element={<SuccessView />} />
              <Route path="/my-bookings" element={<MyBookingsView />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/news-config" element={<NewsConfigView />} />
            </Routes>

            <BottomNav />
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-black flex justify-center w-full">
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </div>
  );
}
