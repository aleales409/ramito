import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Filter } from 'lucide-react';
import { COURTS, SLOTS } from '../data';

export default function BookingView() {
  const navigate = useNavigate();
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(24);

  const selectedCourt = COURTS.find(c => c.id === selectedCourtId);

  const days = [
    { name: 'Lun', num: 24 },
    { name: 'Mar', num: 25 },
    { name: 'Mié', num: 26 },
    { name: 'Jue', num: 27 },
    { name: 'Vie', num: 28 },
    { name: 'Sáb', num: 29 },
    { name: 'Dom', num: 30 },
  ];

  return (
    <main className="pt-32 pb-24 px-5 max-w-2xl mx-auto">
      {/* Headline Section */}
      <div className="mb-8">
        <h2 className="font-display text-4xl font-black text-white mb-1 uppercase italic tracking-tighter">Reservar</h2>
        <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.2em]">Complejo Principal • Elige tu terreno</p>
      </div>

      {/* Featured Court Image */}
      <AnimatePresence mode="wait">
        {selectedCourt ? (
          <motion.div
            key={selectedCourt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-48 rounded-[2.5rem] overflow-hidden mb-10 border-4 border-[#FF9100]/20 shadow-2xl relative"
          >
            <img 
              src={selectedCourt.imageUrl} 
              alt={selectedCourt.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121414] via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-6 left-8">
              <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-[0.3em] italic">Cancha Seleccionada</span>
              <h3 className="text-white text-xl font-black uppercase italic tracking-tight">{selectedCourt.name}</h3>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-48 rounded-[2.5rem] bg-[#1a1c1c] border-2 border-dashed border-white/5 mb-10 flex flex-col items-center justify-center space-y-3"
          >
            <div className="p-4 bg-white/5 rounded-full">
              <Star className="w-8 h-8 text-[#bccbb9]/10" />
            </div>
            <p className="text-[9px] font-black text-[#bccbb9]/20 uppercase tracking-[0.4em] italic">El Show está por comenzar</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Court Selection */}
      <section className="mb-10">
        <label className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em] mb-4 block ml-2">1. Selecciona tu Cancha</label>
        <div className="grid grid-cols-1 gap-4">
          {COURTS.map((court) => (
            <motion.div
              key={court.id}
              onClick={() => setSelectedCourtId(court.id)}
              className={`relative overflow-hidden rounded-[2rem] border-2 transition-all cursor-pointer ${
                selectedCourtId === court.id 
                  ? 'border-[#FF9100] bg-[#FF9100]/5 shadow-[0_0_30px_rgba(255,145,0,0.2)]' 
                  : 'border-white/5 bg-[#1a1c1c] grayscale-[0.5] opacity-60'
              }`}
            >
              <div className="flex gap-5 p-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                  <img src={court.imageUrl} alt={court.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-display text-xl font-black text-white uppercase italic tracking-tight">{court.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3.5 h-3.5 text-[#FF9100] fill-[#FF9100]" />
                    <span className="text-xs font-black text-white">{court.rating}</span>
                  </div>
                  <p className="text-[9px] font-bold text-[#bccbb9] uppercase tracking-widest mt-2 bg-white/5 px-2 py-1 rounded-lg w-fit">
                    {court.features.slice(0, 2).join(' • ')}
                  </p>
                </div>
                {selectedCourtId === court.id && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6"
                  >
                    <div className="w-10 h-10 bg-[#FF9100] rounded-full flex items-center justify-center shadow-lg">
                      <Trophy className="w-5 h-5 text-[#121414]" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps 2 & 3 - Conditional Rendering */}
      {selectedCourtId ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* 2. Date Selection */}
          <section>
            <label className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em] mb-4 block ml-2">2. Selecciona Fecha</label>
            <div className="bg-[#1a1c1c] border border-white/5 rounded-[2rem] p-5 flex flex-col gap-2">
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 snap-x">
                {days.map((day) => (
                  <button
                    key={day.num}
                    onClick={() => setSelectedDate(day.num)}
                    className={`snap-center flex flex-col items-center justify-center min-w-[70px] h-24 rounded-2xl transition-all duration-300 ${
                      selectedDate === day.num
                        ? 'bg-[#FF9100] text-[#121414] shadow-lg shadow-[#FF9100]/30 scale-105'
                        : 'bg-[#121414] border border-white/10 text-[#bccbb9] hover:border-[#FF9100]/30'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase opacity-70 mb-1">{day.name}</span>
                    <span className="text-2xl font-black font-display tracking-tighter">{day.num}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Slot Selection */}
          <section className="pb-10">
            <div className="flex justify-between items-end mb-4 px-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em]">3. Horarios Disponibles</label>
                <h3 className="font-display text-base font-black text-white uppercase italic mt-1 tracking-tight">Turnos para {selectedCourt?.name}</h3>
              </div>
              <span className="text-[#FF9100] text-[10px] font-black cursor-pointer hover:underline uppercase tracking-widest">Ver todos</span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x no-scrollbar">
              {SLOTS.map((slot) => (
                <motion.div
                  key={slot.id}
                  whileHover={{ y: -5 }}
                  className={`snap-start min-w-[150px] bg-gradient-to-br from-[#1a1c1c] to-[#121414] p-6 rounded-[2rem] border border-white/10 flex flex-col items-center gap-1 shadow-xl ${
                    slot.status === 'booked' ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-[#FF9100]/30'
                  }`}
                >
                  <span className="text-[#bccbb9] text-[10px] font-black uppercase tracking-[0.2em]">MAY 18</span>
                  <span className={`font-display text-2xl font-black italic tracking-tighter my-2 ${slot.status === 'booked' ? 'text-[#bccbb9]' : 'text-[#FF9100]'}`}>
                    {slot.time}
                  </span>
                  <div className="w-full h-[1px] bg-white/5 my-2" />
                  <span className="text-[#bccbb9] text-[11px] font-black tracking-widest mb-3">S/ {slot.price}</span>
                  <button 
                    disabled={slot.status === 'booked'}
                    onClick={() => {
                      const isLogged = !!localStorage.getItem('ramito_user_name');
                      if (isLogged) {
                        navigate('/confirmation');
                      } else {
                        navigate('/login');
                      }
                    }}
                    className={`w-full py-3 rounded-xl text-[10px] font-black transition-all active:scale-95 uppercase tracking-widest ${
                      slot.status === 'booked'
                        ? 'bg-[#1a1c1c] text-[#bccbb9]'
                        : 'bg-[#FF9100] text-[#121414] shadow-lg shadow-[#FF9100]/20'
                    }`}
                  >
                    {slot.status === 'available' ? 'Reservar' : 'Ocupado'}
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center pt-10 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-[#1a1c1c] flex items-center justify-center border border-white/5">
            <Filter className="w-8 h-8 text-[#bccbb9]/20" />
          </div>
          <p className="text-[10px] font-black text-[#bccbb9]/40 uppercase tracking-[0.3em] italic">
            Selecciona una cancha para ver disponibilidad
          </p>
        </motion.div>
      )}

      {/* Floating Filter FAB - Only if court selected */}
      {selectedCourtId && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 right-5 w-16 h-16 bg-[#D32F2F] text-white rounded-full shadow-[0_10px_30px_rgba(211,47,47,0.4)] flex items-center justify-center z-40 active:scale-90 transition-transform"
        >
          <Filter className="w-6 h-6" />
        </motion.button>
      )}
    </main>
  );
}
