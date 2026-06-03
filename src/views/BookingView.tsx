import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Filter, 
  Lock, 
  Edit2, 
  ShieldAlert, 
  X,
  Search,
  Plus,
  Trash2,
  Compass,
  Layers,
  MapPin,
  Clock,
  DollarSign,
  Check,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  Bell
} from 'lucide-react';
import { SLOTS } from '../data';
import { useApp } from '../context/AppContext';

const IMAGE_PRESETS = [
  { name: 'Césped Clásico', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Estadio Pro', url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format&fit=crop' },
  { name: 'Nocturno Pro', url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800&auto=format&fit=crop' },
  { name: 'Maracaná Pro', url: 'https://images.unsplash.com/photo-1589487391730-58f20ad2f308?q=80&w=800&auto=format&fit=crop' },
];

const DEFAULT_FEATURES = [
  'Césped Sintético Pro',
  'Techado',
  'Iluminación LED',
  'Al aire libre',
  'Graderías',
  'Duchas Pro',
  'Estacionamiento',
  'Marcador Electrónico'
];

export default function BookingView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, allBookings, setAllBookings, courts, setCourts, schedule, emergencyMode } = useApp();
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(() => {
    return location.state?.initialCourt || null;
  });
  const [selectedDate, setSelectedDate] = useState(24);
  
  // Waitlist system state
  const [waitlists, setWaitlists] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_waitlists');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddToWaitlist = (slotTime: string) => {
    const currentUserName = localStorage.getItem('ramito_user_name') || '';
    if (!currentUserName) {
      showToast('Inicia sesión para entrar en lista de espera', 'error');
      navigate('/login');
      return;
    }
    const formattedDate = `Mayo ${selectedDate}`;
    const targetCourtName = selectedCourt?.name || 'Cancha';

    const alreadyIn = waitlists.some(w => 
      w.user === currentUserName &&
      w.time === slotTime &&
      w.date === formattedDate &&
      w.field === targetCourtName
    );

    if (alreadyIn) {
      showToast('Ya estás en la lista de espera de este turno', 'error');
      return;
    }

    const newItem = {
      id: 'wl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      user: currentUserName,
      time: slotTime,
      date: formattedDate,
      field: targetCourtName,
      createdAt: new Date().toISOString()
    };

    const updated = [...waitlists, newItem];
    setWaitlists(updated);
    localStorage.setItem('ramito_waitlists', JSON.stringify(updated));
    showToast(`¡Anotado! Te alertaremos si se libera las ${slotTime} hs`, 'success');
  };

  // States for Filter
  const [filterType, setFilterType] = useState<'all' | 'roofed' | 'outdoor' | 'top_rated'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // States for Slots
  const [slots, setSlots] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_slots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove 19:00 if present as requested
          const filtered = parsed.filter(s => s.time !== '19:00');
          // Guarantee at least one slot is marked isFixed
          if (filtered.length > 0 && !filtered.some(s => s.isFixed)) {
            filtered[0].isFixed = true;
          }
          return filtered;
        }
      } catch (e) {
        // ignore
      }
    }
    return SLOTS.filter(s => s.time !== '19:00');
  });

  const saveSlotsLocal = (updatedSlots: any[]) => {
    setSlots(updatedSlots);
    localStorage.setItem('ramito_slots', JSON.stringify(updatedSlots));
  };

  // States for Admin actions
  const [confirmingSlotId, setConfirmingSlotId] = useState<string | null>(null);
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [showCourtConfirm, setShowCourtConfirm] = useState(false);
  
  // Local states for slot item adding in modal
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotPrice, setNewSlotPrice] = useState('');

  const handleCourtImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && editingCourt) {
          setEditingCourt({
            ...editingCourt,
            imageUrl: event.target.result as string
          });
          showToast('¡Imagen de la cancha cargada con éxito!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_elite' || role === 'admin_vip';

  // Permite a usuarios ver el catálogo de canchas, pero requiere estar conectado para iniciar el proceso de reserva de un campo específico.
  useEffect(() => {
    const userName = localStorage.getItem('ramito_user_name');
    if (selectedCourtId && !userName) {
      showToast('Por favor, inicia sesión para comenzar el proceso de reserva.', 'error');
      navigate('/login', { state: { from: '/booking', pendingCourtSelection: selectedCourtId } });
    }
  }, [selectedCourtId, navigate, showToast]);

  const selectedCourt = courts.find((c: any) => c.id === selectedCourtId);

  const isWeekend = selectedDate === 29 || selectedDate === 30; // 29: Sáb, 30: Dom
  const timeRange = isWeekend ? schedule?.weekend : schedule?.weekday;

  const openTimeStr = timeRange?.open || (isWeekend ? '15:00' : '18:00');
  const closeTimeStr = timeRange?.close || (isWeekend ? '23:00' : '23:00');
  const openTime2Str = timeRange?.open2 || '08:00';
  const closeTime2Str = timeRange?.close2 || '13:00';
  const useTwoShifts = timeRange?.useTwoShifts || false;

  // Generador de turnos por hora según el horario activo
  const getDynamicSlotsForSchedule = () => {
    try {
      const generateForRange = (openStr: string, closeStr: string) => {
        if (!openStr || !closeStr) return [];
        const [openH, openM] = openStr.split(':').map(Number);
        const [closeH, closeM] = closeStr.split(':').map(Number);

        const list: string[] = [];
        const totalStartVal = openH * 60 + openM;
        let totalEndVal = closeH * 60 + closeM;

        if (totalEndVal < totalStartVal) {
          totalEndVal += 24 * 60; // Horario que pasa de medianoche
        }

        for (let val = totalStartVal; val < totalEndVal; val += 60) {
          const adjustedVal = val % (24 * 60);
          const h = Math.floor(adjustedVal / 60);
          const m = adjustedVal % 60;
          const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          list.push(timeStr);
        }
        return list;
      };

      let times = generateForRange(openTimeStr, closeTimeStr);
      if (useTwoShifts && openTime2Str && closeTime2Str) {
        const times2 = generateForRange(openTime2Str, closeTime2Str);
        // Merge and sort uniquely
        times = Array.from(new Set([...times, ...times2])).sort();
      }
      return times;
    } catch (e) {
      return ['18:00', '19:00', '20:00', '21:00', '22:00'];
    }
  };

  const generatedHours = getDynamicSlotsForSchedule();
  
  // Fusionar los horarios generados con personalizaciones guardadas en localStorage
  const mergedSlots = [...generatedHours].map((time) => {
    const custom = slots.find((s: any) => s.time === time);
    return {
      id: custom?.id || `gen_${time}`,
      time: time,
      price: custom?.price || selectedCourt?.price || 120,
      status: custom?.status || 'available',
      isFixed: custom?.isFixed ?? false,
    };
  });

  // Conservar también turnos especiales fuera de hora exacta que el admin haya creado manualmente
  const offHourCustomSlots = slots.filter((s: any) => {
    const isHourIn = (timeStr: string) => {
      try {
        const [sh, sm] = timeStr.split(':').map(Number);
        const slotVal = sh * 60 + sm;

        const checkRange = (opStr: string, clStr: string) => {
          if (!opStr || !clStr) return false;
          const [oh, om] = opStr.split(':').map(Number);
          const openVal = oh * 60 + om;

          const [ch, cm] = clStr.split(':').map(Number);
          let closeVal = ch * 60 + cm;

          if (closeVal < openVal) {
            return slotVal >= openVal || slotVal <= closeVal;
          }
          return slotVal >= openVal && slotVal <= closeVal;
        };

        let inRange = checkRange(openTimeStr, closeTimeStr);
        if (useTwoShifts && openTime2Str && closeTime2Str) {
          inRange = inRange || checkRange(openTime2Str, closeTime2Str);
        }
        return inRange;
      } catch (e) {
        return true;
      }
    };

    const alreadyIncluded = generatedHours.includes(s.time);
    return isHourIn(s.time) && !alreadyIncluded;
  });

  const activeAndVisibleSlots = [...mergedSlots, ...offHourCustomSlots].sort((a, b) => a.time.localeCompare(b.time));

  const days = [
    { name: 'Lun', num: 24 },
    { name: 'Mar', num: 25 },
    { name: 'Mié', num: 26 },
    { name: 'Jue', num: 27 },
    { name: 'Vie', num: 28 },
    { name: 'Sáb', num: 29 },
    { name: 'Dom', num: 30 },
  ];

  // Since there are only two courts, we disable the verbose filters and list them directly for instant access
  const filteredCourts = courts;

  if (emergencyMode && !isAdmin) {
    return (
      <main className="pt-24 pb-32 px-5 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <div className="max-w-md space-y-3">
          <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tight">
            NUEVAS RESERVAS DESHABILITADAS
          </h2>
          <p className="text-[10px] font-black tracking-widest text-[#FF9100] uppercase font-mono">
            ⚠️ CIERRE POR CONTINGENCIA DE FUERZA MAYOR
          </p>
          <div className="p-5 bg-red-950/20 border border-red-500/25 rounded-3xl text-left">
            <p className="text-[11px] font-black text-red-200 uppercase tracking-wide leading-relaxed text-center">
              El complejo deportivo Ramito Fut Show se encuentra en estado de cierre temporal preventivo ordinario por decisión de la administración.
            </p>
          </div>
          <p className="text-[10px] font-bold text-[#bccbb9]/60 uppercase tracking-wide leading-relaxed">
            Por contingencia técnica o climática oficial, el módulo de turnos está completamente bloqueado. No se permiten nuevos alquileres.
          </p>
          <p className="text-[9px] font-black text-[#FF9100] uppercase tracking-wider leading-relaxed">
            Si cuentas con una reserva de juego confirmada afectada por este cierre, dirígete de inmediato a tus reservas para reprogramar tu partido libremente de forma gratuita.
          </p>
        </div>
        
        <button
          onClick={() => navigate('/my-bookings')}
          className="px-6 py-3 bg-[#FF9100] hover:bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all font-sans italic"
        >
          Ir a Mis Reservas para Reprogramar
        </button>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-32 px-5 w-full max-w-5xl md:max-w-6xl mx-auto overflow-x-hidden">
      {/* Headline Section */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl font-black text-white mb-1 uppercase italic tracking-tighter">Reservar</h2>
          <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.2em]">Complejo Principal • Elige tu terreno</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1.5 bg-[#FF9100]/10 border border-[#FF9100]/25 px-2.5 py-1 rounded-xl">
            <span className="w-1.5 h-1.5 bg-[#FF9100] rounded-full animate-pulse" />
            <span className="text-[8.5px] font-black text-[#FF9100] uppercase tracking-wider">Modo Elite</span>
          </div>
        )}
      </div>

      {/* 1. Court Selection Row - Upgraded to elegant big image-based cards as requested */}
      <section className="mb-10">
        <label className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em] mb-4 block ml-2">1. Selecciona tu Cancha</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCourts.map((court: any, index: number) => {
            const isSelected = selectedCourtId === court.id;
            return (
              <motion.div
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                whileTap={{ scale: 0.98 }}
                className={`relative h-60 rounded-[2rem] overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-[#FF9100] shadow-[0_0_30px_rgba(255,145,0,0.25)] scale-[1.01]' 
                    : 'border-white/5 bg-[#141616] hover:border-white/15'
                }`}
              >
                {/* Background Image of the Court */}
                <img 
                  src={court.imageUrl} 
                  alt={court.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient overlay to make names perfectly readable over the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />

                {/* Selected glowing badge tag */}
                {isSelected && (
                  <div className="absolute top-4 left-4 z-10 bg-[#FF9100] text-black text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider italic flex items-center gap-1 shadow-lg shadow-black/80">
                    <Trophy className="w-3.5 h-3.5" />
                    Seleccionada
                  </div>
                )}

                {/* Edit Pencil icon absolute in top right for Administrators */}
                {isAdmin && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingCourt({ ...court }); 
                    }}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-[#FF9100] hover:bg-[#FF9100] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                    title="Modificar Cancha y Horarios"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {/* Overlay Text Content sitting over the photo */}
                <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between z-10">
                  <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5 w-max mb-1">
                      <Star className="w-3.5 h-3.5 text-[#FF9100]" strokeWidth={2.5} />
                      <span className="text-[10px] font-black text-white">{court.rating}</span>
                    </div>
                    
                    <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-[0.25em] italic block">
                      Cancha {index + 1}
                    </span>
                    
                    <h3 className="text-white text-xl font-black uppercase italic tracking-tight leading-none leading-tight truncate">
                      {court.name}
                    </h3>
                    
                    <p className="text-[9px] font-bold text-[#bccbb9]/80 uppercase tracking-wider truncate">
                      {court.location || 'Complejo Principal'}
                    </p>
                  </div>

                  {/* Price display tag */}
                  <div className="text-right shrink-0">
                    <span className="text-[8px] font-black text-[#FF9100] uppercase tracking-[0.2em] block mb-0.5">Precio Base</span>
                    <span className="text-lg font-black text-white font-display italic">
                      $ {court.price || 120}<span className="text-[10px] text-[#bccbb9]/60 font-sans font-bold uppercase">/hr</span>
                    </span>
                    <span className="text-[9px] font-black text-purple-400 block tracking-widest leading-none mt-1">
                      SEÑA (20%): $ {((court.price || 120) * 0.2).toFixed(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Steps 2 & 3 - Render ONLY if Court is Selected */}
      {selectedCourtId ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* 2. Date Selection */}
          <section>
            <label className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em] mb-4 block ml-2">2. Selecciona Fecha</label>
            <div className="bg-[#141616] border border-white/5 rounded-[2rem] p-4 flex flex-col gap-2">
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 snap-x">
                {days.map((day) => (
                  <button
                    key={day.num}
                    onClick={() => setSelectedDate(day.num)}
                    className={`snap-center flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl transition-all duration-300 ${
                      selectedDate === day.num
                        ? 'bg-[#FF9100] text-[#121414] shadow-lg shadow-[#FF9100]/20 scale-105 font-black'
                        : 'bg-[#0f1111] border border-white/5 text-[#bccbb9] hover:border-white/15'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase opacity-70 mb-1">{day.name}</span>
                    <span className="text-xl font-black font-display tracking-tighter">{day.num}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Slot Selection Grid */}
          <section className="pb-10">
            <div className="flex justify-between items-end mb-4 px-2">
              <div className="flex flex-col min-w-0 flex-1">
                <label className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em]">3. Horarios Disponibles</label>
                <h3 className="font-display text-base font-black text-white uppercase italic mt-1 tracking-tight line-clamp-1">
                  Turnos para {selectedCourt?.name}
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {activeAndVisibleSlots.map((slot: any) => {
                const isBookedLocally = allBookings?.some(b => 
                  b.time === slot.time && 
                  b.date.includes(selectedDate.toString()) && 
                  b.field === selectedCourt?.name
                );
                const status = isBookedLocally ? 'booked' : slot.status;
                const activePrice = slot.price || selectedCourt?.price || 120;
                
                return (
                  <motion.div
                    key={slot.id}
                    className={`glass-panel p-5 rounded-[2rem] flex flex-col items-center gap-1 shadow-md border ${
                      status === 'booked' 
                        ? 'border-red-500/20 bg-red-500/[0.02]' 
                        : 'border-white/5 hover:border-[#FF9100]/20 bg-[#141616]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                      <span className="text-[#bccbb9] text-[8px] font-black uppercase tracking-widest">MAYO {selectedDate}</span>
                      {status === 'booked' && <Lock className="w-3 h-3 text-red-500/50" />}
                    </div>

                    <span className={`font-display text-2xl font-black italic tracking-tighter my-1 ${
                      status === 'booked' ? 'text-zinc-500' : 'text-[#FF9100]'
                    }`}>
                      {slot.time} hs
                    </span>

                    {/* Highly Visual Status Indicator */}
                    <div className="my-1">
                      {status === 'booked' ? (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/15 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          🚫 Ocupado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/15 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4be277]" />
                          💚 Disponible
                        </span>
                      )}
                    </div>

                    <div className="w-full h-[1px] bg-white/5 my-1.5" />
                    
                    <span className={`text-[10px] font-black tracking-widest mb-1 ${
                      status === 'booked' ? 'text-zinc-600' : 'text-[#bccbb9]'
                    }`}>
                      $ {activePrice}
                    </span>
                    <span className={`text-[8.5px] font-black tracking-wider uppercase mb-3.5 ${
                      status === 'booked' ? 'text-zinc-700' : 'text-purple-400'
                    }`}>
                      Seña: $ {(activePrice * 0.20).toFixed(0)}
                    </span>
                    
                    <button 
                      onClick={() => {
                        if (status === 'booked') {
                          if (isAdmin) {
                            navigate('/my-bookings');
                          } else {
                            showToast('Este turno ya está reservado');
                          }
                          return;
                        }

                        const isLogged = !!localStorage.getItem('ramito_user_name');
                        if (isLogged) {
                          navigate('/confirmation', { 
                            state: { 
                              court: selectedCourt, 
                              time: slot.time, 
                              date: `Mayo ${selectedDate}`,
                              price: activePrice
                            } 
                          });
                        } else {
                          showToast('Por favor, inicia sesión para realizar la reserva.', 'error');
                          navigate('/login', { state: { from: '/booking', pendingCourtSelection: selectedCourtId } });
                        }
                      }}
                      className={`w-full py-3 rounded-xl text-[9px] font-black transition-all active:scale-95 uppercase tracking-widest text-center ${
                        status === 'booked'
                          ? 'bg-white/5 text-[#bccbb9]/40 border border-white/5'
                          : 'bg-[#FF9100] text-[#121414] shadow-lg shadow-[#FF9100]/10'
                      }`}
                    >
                      {status === 'booked' 
                        ? (isAdmin ? 'Ver Detalle' : 'Ocupado') 
                        : 'Reservar'}
                    </button>

                    {(() => {
                      const currentUserName = localStorage.getItem('ramito_user_name') || '';
                      const isUserWaitlistedSlot = waitlists.some((w: any) => 
                        w.user === currentUserName &&
                        w.time === slot.time &&
                        w.date === `Mayo ${selectedDate}` &&
                        w.field === selectedCourt?.name
                      );
                      
                      return !isAdmin && status === 'booked' && (
                        <button
                          type="button"
                          onClick={() => handleAddToWaitlist(slot.time)}
                          className={`w-full mt-2 py-2.5 px-2 rounded-xl text-[8.5px] font-black transition-all active:scale-[0.98] uppercase tracking-widest text-center flex items-center justify-center gap-1 border font-sans ${
                            isUserWaitlistedSlot 
                              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                              : 'bg-zinc-950 border-white/5 text-[#bccbb9]/60 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <Bell className="w-3 h-3 shrink-0" />
                          {isUserWaitlistedSlot ? 'En lista de espera' : 'Anotarme en Espera'}
                        </button>
                      );
                    })()}
                  </motion.div>
                );
              })}
            </div>
          </section>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center pt-8 pb-16 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-[#141616] flex items-center justify-center border border-white/5 shadow-inner">
            <Compass className="w-7 h-7 text-[#FF9100]" />
          </div>
          <div className="max-w-xs space-y-1">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
              Disponibilidad Online
            </p>
            <p className="text-[10px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-relaxed">
              Elige cualquiera de los campos deportivos para ver sus turnos disponibles, precios y detalles de equipamiento.
            </p>
          </div>
        </motion.div>
      )}

      {/* Editing Court Modal - Full screen screen takeover to prevent cut-offs & feel super spacious */}
      <AnimatePresence>
        {editingCourt && !showCourtConfirm && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-[100] w-full min-h-screen bg-[#0A0C0C]/98 backdrop-blur-xl flex flex-col overflow-y-auto font-sans"
          >
            <div className="w-full max-w-7xl mx-auto px-6 py-10 sm:px-12 flex-1 flex flex-col justify-start space-y-10">
              
              {/* Header section with generous space */}
              <div className="flex justify-between items-center pb-6 border-b border-white/15 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF9100] animate-pulse" />
                    <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-[0.25em]">Portal de Edición Administrativa Elite / VIP</span>
                  </div>
                  <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">
                    Configuración de Campo Deportivo y Turnos
                  </h3>
                  <p className="text-xs text-[#bccbb9]/60">
                    Edita el nombre de la cancha, tarifas, características y configura o agrega horarios de juego en tiempo real.
                  </p>
                </div>
                <button 
                  onClick={() => setEditingCourt(null)} 
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95 border border-white/10"
                  title="Salir sin guardar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic fully responsive section blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
                
                {/* Left Column: Court details */}
                <div className="space-y-8 bg-black/40 border border-white/5 p-6 sm:p-8 rounded-[2.5rem]">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-sm font-black text-[#FF9100] uppercase tracking-wider">Parámetros de la Cancha</h4>
                    <p className="text-[10px] text-[#bccbb9]/50 font-bold">Define los datos principales de cara al cliente residente</p>
                  </div>
                  
                  {/* Court Name input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest block font-bold">Nombre del campo deportivo</label>
                    <input 
                      type="text" 
                      value={editingCourt.name} 
                      onChange={(e) => setEditingCourt({ ...editingCourt, name: e.target.value })} 
                      className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-5 text-white font-black text-xs outline-none focus:border-[#FF9100]/60 focus:bg-black transition-all" 
                    />
                  </div>

                  {/* Location input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest block font-bold">Ubicación / Sector asignado</label>
                    <input 
                      type="text" 
                      value={editingCourt.location || 'Complejo Principal'} 
                      onChange={(e) => setEditingCourt({ ...editingCourt, location: e.target.value })} 
                      className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-5 text-white font-black text-xs outline-none focus:border-[#FF9100]/60 focus:bg-black transition-all" 
                    />
                  </div>

                  {/* Rating and Price row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest block font-bold">Precio Base General (ARS $)</label>
                      <input 
                        type="number" 
                        value={editingCourt.price} 
                        onChange={(e) => setEditingCourt({ ...editingCourt, price: Math.max(0, Number(e.target.value)) })} 
                        className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-5 text-white font-black text-xs outline-none focus:border-[#FF9100]/60 focus:bg-black transition-all" 
                      />
                      <div className="flex justify-between items-center px-1 bg-purple-500/5 border border-purple-500/15 p-2 rounded-xl mt-1">
                        <span className="text-[8.5px] font-black text-purple-400 uppercase tracking-wider block">Seña Requerida Automatizada (20%):</span>
                        <span className="text-[11px] font-black text-white italic font-mono bg-purple-500/15 px-2 py-0.5 rounded-lg border border-purple-500/20">$ {((editingCourt.price || 120) * 0.20).toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest block font-bold">Valoración (Rating)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        max="5"
                        min="0"
                        value={editingCourt.rating} 
                        onChange={(e) => setEditingCourt({ ...editingCourt, rating: parseFloat(e.target.value) || 5 })} 
                        className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-5 text-white font-black text-xs outline-none focus:border-[#FF9100]/60 focus:bg-black transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Fondo Visual de Cancha preset + dynamic FILE UPLOAD */}
                <div className="space-y-8 bg-black/40 border border-white/5 p-6 sm:p-8 rounded-[2.5rem]">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-sm font-black text-[#FF9100] uppercase tracking-wider">Fondo Visual de la Cancha</h4>
                    <p className="text-[10px] text-[#bccbb9]/50 font-bold">Sube fotos personalizadas del campo o elige de la colección</p>
                  </div>

                  {/* File Upload zone */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest block font-bold">Subir nueva imagen</label>
                    <label 
                      htmlFor="image-upload-input"
                      className="group cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[#FF9100]/40 rounded-2xl p-6 bg-black/30 hover:bg-black/60 transition-all text-center space-y-2 h-40 relative overflow-hidden"
                    >
                      <input 
                        type="file" 
                        id="image-upload-input" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleCourtImageChange}
                      />
                      {editingCourt.imageUrl ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={editingCourt.imageUrl} alt="Subida" className="w-full h-full object-cover brightness-[0.4]" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <Check className="w-8 h-8 text-[#FF9100] mb-1 animate-bounce" />
                            <span className="text-xs font-black text-white uppercase tracking-wider">¡Imagen seleccionada!</span>
                            <span className="text-[9px] text-[#bccbb9]/70 font-mono mt-0.5 truncate max-w-full">Click para cambiar de archivo</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#FF9100]/10 group-hover:text-[#FF9100] transition-all text-white/60">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-white block">Haz clic para subir un archivo</span>
                            <p className="text-[9px] text-[#bccbb9]/55 font-bold uppercase tracking-wider">Acepta formatos JPG, PNG, WEBP, etc.</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                </div>

              </div>

              {/* Compartment 3: Turnos y Tarifas por Hora (Renovated completely, full-width, no scroll limits, clean layout responsive) */}
              <div className="bg-black/40 border border-white/5 p-6 sm:p-8 rounded-[2.5rem] text-left space-y-6">
                <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#FF9100]" />
                      <h4 className="text-sm font-black text-[#FF9100] uppercase tracking-wider">Turnos y Tarifas por Hora</h4>
                    </div>
                    <p className="text-[10px] text-[#bccbb9]/50 font-bold font-mono">Configura tarifas personalizadas por bloque de horario individuales</p>
                  </div>
                  <span className="text-[10px] font-mono text-white/55 bg-white/5 px-3 py-1 rounded-full border border-white/10 font-bold">
                    {slots.length} Turnos de Juego Activos
                  </span>
                </div>

                {/* Grid of active turns, 100% spacious, no nested scrolls */}
                {slots.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                    <p className="text-xs text-[#bccbb9]/40 font-black uppercase tracking-widest">No hay turnos creados para la cancha actualmente</p>
                    <p className="text-[10px] text-[#bccbb9]/20 font-bold mt-1">Usa la sección inferior para añadir rangos horarios de reservas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                    {slots.map((item: any) => (
                      <div 
                        key={item.id} 
                        className={`bg-[#121414] border ${item.isFixed ? 'border-amber-500/30 bg-amber-500/[0.01]' : 'border-white/5'} hover:border-[#FF9100]/30 rounded-[1.5rem] p-5 flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-[#FF9100]/5 transition-all group w-full`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-1.5 ${item.isFixed ? 'bg-amber-500/15 border-amber-500/35 text-amber-400' : 'bg-[#FF9100]/10 border-[#FF9100]/20 text-[#FF9100]'} px-3 py-1 rounded-full border`}>
                            {item.isFixed ? <Lock className="w-3 h-3 animate-pulse" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#FF9100]" />}
                            <span className="text-[11.5px] font-black font-mono">{item.time}hs</span>
                          </div>
                          
                          {item.isFixed ? (
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest italic font-sans bg-amber-500/5 px-2.5 py-1 rounded-md border border-amber-500/10">
                              🔒 Fijo Inamovible
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = slots.filter(sl => sl.id !== item.id);
                                saveSlotsLocal(updated);
                                showToast('Turno eliminado del sistema', 'success');
                              }}
                              className="text-white/30 hover:text-red-400 p-1.5 rounded-xl hover:bg-red-500/10 transition-all opacity-80 md:opacity-0 group-hover:opacity-100"
                              title="Eliminar este horario del sistema"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[8.5px] text-[#bccbb9]/40 font-black uppercase tracking-widest block">Tarifa por hora</span>
                            {item.isFixed && <span className="text-[7.5px] text-amber-500/40 uppercase font-bold font-mono">FIJA GENERAL</span>}
                          </div>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-[10px] font-black text-[#bccbb9]/40 font-mono">$</span>
                            <input 
                              type="number" 
                              value={item.price} 
                              disabled={item.isFixed}
                              onChange={(e) => {
                                if (item.isFixed) return;
                                const p = Math.max(0, Number(e.target.value));
                                const updated = slots.map(sl => sl.id === item.id ? { ...sl, price: p } : sl);
                                saveSlotsLocal(updated);
                              }}
                              className={`w-full h-10 bg-black border rounded-xl pl-6 pr-2.5 text-xs font-black outline-none transition-all text-center ${
                                item.isFixed 
                                  ? 'border-amber-500/20 text-amber-500/80 cursor-not-allowed bg-amber-500/5' 
                                  : 'border-white/5 text-white focus:border-[#FF9100]/40'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Beautiful Inline turn addition panel */}
                <div className="bg-black/30 border border-white/5 rounded-[2rem] p-5 space-y-4 text-left">
                  <span className="text-[10px] font-black text-white uppercase tracking-wider block">Agregar Nuevo Rango Horario Especial</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#bccbb9] uppercase block font-bold">HORARIO DE INICIO (HH:MM)</label>
                      <input 
                        type="text" 
                        placeholder="ej. 21:00" 
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                        className="w-full h-12 bg-black border border-white/10 rounded-2xl px-4 text-xs text-white placeholder-white/25 font-mono text-center outline-none focus:border-[#FF9100]/50" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#bccbb9] uppercase block font-bold">TARIFA DEL TURNO ($ ARS)</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-black text-[#bccbb9]/40">$</span>
                        <input 
                          type="number" 
                          placeholder="Tarifa en pesos..." 
                          value={newSlotPrice}
                          onChange={(e) => setNewSlotPrice(e.target.value)}
                          className="w-full h-12 bg-black border border-white/10 rounded-2xl pl-8 pr-4 text-xs text-white placeholder-white/25 font-bold outline-none focus:border-[#FF9100]/50" 
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!newSlotTime || !newSlotTime.includes(':')) {
                          showToast('Ingresa un formato válido (HH:MM)');
                          return;
                        }
                        const newP = Number(newSlotPrice) || editingCourt.price || 120;
                        const added = {
                          id: 'sl_' + Date.now(),
                          time: newSlotTime.trim(),
                          price: newP,
                          status: 'available'
                        };
                        const updated = [...slots, added].sort((a, b) => a.time.localeCompare(b.time));
                        saveSlotsLocal(updated);
                        setNewSlotTime('');
                        setNewSlotPrice('');
                        showToast('¡Horario guardado en el sistema!', 'success');
                      }}
                      className="bg-[#FF9100] text-black hover:brightness-110 active:scale-95 transition-all text-[10px] font-black h-12 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Guardar y Añadir Turno
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons styled as big luxurious bars */}
              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 shrink-0">
                <button 
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancelar Modificaciones
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCourtConfirm(true)}
                  className="flex-1 h-14 rounded-2xl bg-[#FF9100] text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FF9100]/20 hover:brightness-110 transition-all active:scale-95"
                >
                  Aplicar Guardado General de Cancha
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* Double Confirmation Modal */}
        {showCourtConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm bg-gradient-to-b from-red-500/10 to-[#121414] rounded-[2.5rem] p-6 border border-red-500/30 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">¿Confirmar Modificaciones?</h3>
                <p className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-[0.2em] leading-relaxed">
                  Estás modificando los datos públicos de esta cancha. Todos los clientes verán los nuevos precios, características e imágenes.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCourtConfirm(false)}
                  className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest"
                >
                  Regresar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const newCourts = courts.map((c: any) => c.id === editingCourt.id ? editingCourt : c);
                    setCourts(newCourts);
                    setShowCourtConfirm(false);
                    setEditingCourt(null);
                    showToast('Cancha actualizada correctamente', 'success');
                  }}
                  className="flex-1 h-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/50 text-red-400 font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Sí, Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
