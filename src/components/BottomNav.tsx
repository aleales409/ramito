import React from 'react';
import { Home, LayoutGrid, CalendarCheck, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

const USER_AVATARS: Record<string, string> = {
  'CARLOS MENDOZA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23FBBF24" stroke-width="2" stroke-opacity="0.3"/><path d="M 35,30 L 65,30 A 15,15 0 0,1 50,60 A 15,15 0 0,1 35,30 Z" fill="%23FBBF24" fill-opacity="0.1" stroke="%23FBBF24" stroke-width="2"/><path d="M 35,38 H 28 A 5,5 0 0,1 28,48 H 35" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 65,38 H 72 A 5,5 0 0,0 72,48 H 65" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,60 V 70 M 40,70 H 60" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,16 L 52,21 L 57,21 L 53,24 L 55,29 L 50,26 L 45,29 L 47,24 L 43,21 L 48,21 Z" fill="%23FBBF24" fill-opacity="0.2" stroke="%23FBBF24" stroke-width="1"/></svg>', // Mundial Oro
  'SOFÍA RODRÍGUEZ': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2306B6D4" stroke-width="2" stroke-opacity="0.3"/><path d="M 32,32 L 42,32 A 8,8 0 0,0 58,32 L 68,32 L 76,46 L 66,52 L 62,48 L 62,74 L 38,74 L 38,48 L 34,52 L 24,46 Z" fill="%2306B6D4" fill-opacity="0.1" stroke="%2306B6D4" stroke-width="2"/><text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="16" fill="%2306B6D4" text-anchor="middle">10</text></svg>', // Camiseta Copa 10
  'MATEO SILVA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.7" stroke="%238B5CF6" stroke-width="2" stroke-opacity="0.3"/><path d="M 38,34 Q 28,38 34,54 L 38,68 A 12,12 0 0,0 62,68 L 66,54 Q 72,38 62,34 A 8,8 0 0,0 50,44 A 8,8 0 0,0 38,34 Z" fill="%23A78BFA" fill-opacity="0.1" stroke="%23A78BFA" stroke-width="2" stroke-linejoin="round"/><path d="M 44,52 H 56 M 46,60 H 54" stroke="%23A78BFA" stroke-width="1.5" stroke-opacity="0.7"/></svg>', // Guantes Pro
  'CAMILA ESPINOZA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23CA8A04" stroke-width="2" stroke-opacity="0.3"/><path d="M 42,20 L 34,44 L 50,54 L 66,44 L 58,20" fill="none" stroke="%23EF4444" stroke-width="2"/><circle cx="50" cy="58" r="18" fill="%23CA8A04" fill-opacity="0.1" stroke="%23CA8A04" stroke-width="2"/><path d="M 50,49 L 52,54 L 57,54 L 53,57 L 55,62 L 50,59 L 45,62 L 47,57 L 43,54 L 48,54 Z" fill="%23FBBF24" fill-opacity="0.4" stroke="%23CA8A04" stroke-width="1"/></svg>', // Medalla Oro
  'JAVIER ORTEGA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2310B981" stroke-width="2" stroke-opacity="0.3"/><rect x="24" y="24" width="52" height="48" fill="none" stroke="%2310B981" stroke-width="2" stroke-opacity="0.8"/><line x1="50" y1="24" x2="50" y2="72" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="10" fill="none" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="2.5" fill="%2310B981"/></svg>', // Estrategia
};

export default function BottomNav() {
  const location = useLocation();
  const { userRole: role, userName, userAvatar } = useApp();
  const isAdmin = role === 'admin_elite' || role === 'admin_vip';
  
  const getUserAvatar = () => {
    const cleanName = (userName || '').toUpperCase().trim();
    if (userAvatar) return userAvatar;
    if (USER_AVATARS[cleanName]) return USER_AVATARS[cleanName];
    return null;
  };

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: LayoutGrid, label: isAdmin ? 'Reservar' : 'Canchas', path: '/booking' },
    { icon: CalendarCheck, label: isAdmin ? 'Gestión' : 'Reservas', path: '/my-bookings' },
    { icon: isAdmin ? Settings : User, label: isAdmin ? 'Config' : 'Perfil', path: '/profile', isProfile: true },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl md:max-w-6xl z-50 flex justify-around items-center h-20 pb-safe px-3 bg-black/40 backdrop-blur-md border-t border-white/5 border-x shadow-2xl rounded-t-xl">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        const profileAvatar = item.isProfile ? getUserAvatar() : null;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-all duration-150 ${
              isActive ? 'text-[#4be277] font-bold scale-110' : 'text-[#bccbb9]/70 hover:text-[#4be277]'
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center"
            >
              {profileAvatar ? (
                <div className={`w-6 h-6 mb-1 rounded-full overflow-hidden border transition-all ${
                  isActive ? 'border-[#4be277] scale-105 shadow-[0_0_8px_rgba(75,226,119,0.4)]' : 'border-white/10'
                }`}>
                  <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <Icon 
                  className="w-6 h-6 mb-1" 
                  fill="none" 
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              )}
              <span className="text-[10px] uppercase font-semibold tracking-wider">{item.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
