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
import { ShieldAlert, Terminal, Lock, ShieldCheck } from 'lucide-react';

function LockScreen() {
  const navigate = useNavigate();
  const { emergencyMode } = useApp();
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden text-center select-none"
    >
      {/* High-fidelity recreated maintenance or emergency image (unmovable) */}
      <div 
        className="absolute inset-0 bg-cover bg-center select-none pointer-events-none" 
        style={{ 
          backgroundImage: `url(${emergencyMode ? '/emergencia.png' : '/mantenimiento.png'})`,
          opacity: 1
        }}
      />

      {/* Button overlay with high accessibility so administrators can easily toggle back */}
      <div className="absolute bottom-6 md:bottom-8 z-20 w-full max-w-xs px-4">
        {isAdmin ? (
          <button 
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full h-14 bg-white text-[#121414] font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] italic text-xs hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <ShieldCheck className="w-5 h-5" />
            Entrar como Admin
          </button>
        ) : (
          /* Invisible touch container for Admin access back in standard state */
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="w-full h-14 bg-transparent border-0 opacity-0 cursor-default"
          >
            Administrar
          </button>
        )}
      </div>
    </motion.div>
  );
}

import Toast from './components/Toast';

function AppContent() {
  const { isSystemBlocked, maintenanceMode, emergencyMode } = useApp();
  const location = useLocation();
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';

  const shouldShowLock = (isSystemBlocked || maintenanceMode || emergencyMode) && !(isAdmin && location.pathname === '/profile');

  return (
    <>
      <Toast />
      <AnimatePresence>
        {shouldShowLock && <LockScreen />}
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
