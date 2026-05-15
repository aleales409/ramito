import React from 'react';
import { Home, LayoutGrid, CalendarCheck, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

export default function BottomNav() {
  const location = useLocation();
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_elite' || role === 'admin_vip';
  
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: LayoutGrid, label: isAdmin ? 'Reservar' : 'Canchas', path: '/booking' },
    { icon: CalendarCheck, label: isAdmin ? 'Gestión' : 'Reservas', path: '/my-bookings' },
    { icon: isAdmin ? Settings : User, label: isAdmin ? 'Config' : 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-around items-center h-20 pb-safe px-3 bg-black/40 backdrop-blur-md border-t border-white/5 border-x shadow-2xl rounded-t-xl">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
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
              <Icon 
                className="w-6 h-6 mb-1" 
                fill={isActive ? 'currentColor' : 'none'} 
              />
              <span className="text-[10px] uppercase font-semibold tracking-wider">{item.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
