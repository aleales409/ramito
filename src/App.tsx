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

import { useApp } from './context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Terminal, Lock, ShieldCheck } from 'lucide-react';

function LockScreen() {
  const navigate = useNavigate();
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-[#000] flex flex-col items-center justify-center p-8 overflow-hidden text-center"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-10 gap-2 p-4 text-[8px] font-mono text-[#4be277] select-none break-all">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
              101011001010101011
            </div>
          ))}
        </div>
      </div>

      <div className="relative space-y-8 max-w-sm">
        <div className="relative mx-auto w-32 h-32">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-full h-full rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center"
          >
            <ShieldAlert className="w-16 h-16 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
          </motion.div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-black rounded-2xl border-2 border-red-500/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            Sistema <span className="text-red-500">Bloqueado</span>
          </h1>
          <p className="text-[11px] font-bold text-[#bccbb9] uppercase tracking-[0.25em] leading-relaxed">
            La licencia de servicio ha expirado o ha sido desactivada por seguridad. 
          </p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-red-500" />
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">Log de Error: ERR_LIC_EXPIRED</span>
          </div>
          <p className="text-[10px] font-bold text-[#bccbb9]/60 uppercase tracking-widest leading-relaxed">
            Contacte al equipo de soporte de Ramito Fut Show para renovar el dominio web o la clave de aplicación móvil.
          </p>
        </div>

        {isAdmin ? (
          <button 
            onClick={() => navigate('/profile')}
            className="w-full h-16 bg-white text-[#121414] font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] italic text-xs hover:bg-[#4be277] transition-all"
          >
            <ShieldCheck className="w-5 h-5" />
            Entrar como Admin
          </button>
        ) : (
          <button 
            onClick={() => navigate('/')}
            className="w-full h-16 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase tracking-[0.2em] italic text-xs hover:bg-white/10 transition-all"
          >
            Volver al Inicio
          </button>
        )}
      </div>
    </motion.div>
  );
}

function AppContent() {
  const { isSystemBlocked } = useApp();
  const location = useLocation();
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  const shouldShowLock = isSystemBlocked && !(isAdmin && location.pathname === '/profile');

  return (
    <>
      <AnimatePresence>
        {shouldShowLock && <LockScreen />}
      </AnimatePresence>
      
      {!shouldShowLock && (
        <div className="flex flex-col min-h-screen">
          <TopAppBar />
          
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/booking" element={<BookingView />} />
            <Route path="/confirmation" element={<ConfirmationView />} />
            <Route path="/success" element={<SuccessView />} />
            <Route path="/my-bookings" element={<MyBookingsView />} />
            <Route path="/profile" element={<ProfileView />} />
          </Routes>
          
          <BottomNav />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
