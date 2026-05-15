import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  MoreVertical, 
  Trophy, 
  Camera, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Upload,
  User,
  DollarSign,
  Eye,
  Bell,
  X,
  CalendarDays,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationBell from '../components/NotificationBell';

export default function MyBookingsView() {
  const navigate = useNavigate();
  const { allBookings, setAllBookings, setNotifications, showToast } = useApp();
  
  const role = localStorage.getItem('ramito_user_role');
  const userName = localStorage.getItem('ramito_user_name');
  const isAdmin = role === 'admin_elite' || role === 'admin_vip';

  if (!userName && !isAdmin) {
    return (
      <main className="pt-20 pb-32 px-10 max-w-md mx-auto flex flex-col items-center text-center space-y-8">
        <div className="w-24 h-24 glass-panel rounded-[2rem] flex items-center justify-center relative">
          <CalendarDays className="w-10 h-10 text-[#bccbb9]/20" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FF9100] rounded-2xl flex items-center justify-center border-4 border-[#121414]">
            <Lock className="w-4 h-4 text-[#121414]" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="font-display text-4xl font-black text-white uppercase italic tracking-tighter">Acceso Reservado</h2>
          <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
            Regístrate para ver tus reservas activas, <br />
            subir comprobantes de pago y ver el historial.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="w-full h-16 bg-[#FF9100] text-[#121414] font-black rounded-2xl shadow-[0_10px_30px_rgba(255,145,0,0.3)] flex items-center justify-center gap-3 uppercase tracking-[0.2em] italic"
        >
          Unirme Ahora
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        
        <p className="text-[8px] font-black text-[#bccbb9]/30 uppercase tracking-[0.4em] italic pt-12">
          Gestión Ramito Fut Show • v1.0.7
        </p>
      </main>
    );
  }
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Sync bookings
  const bookings = allBookings || [];
  
  // Filter bookings: Admins see all, players see theirs
  const userBookings = isAdmin ? bookings : bookings.filter((b: any) => b.user === userName);
  
  const displayBookings = activeTab === 'active' 
    ? userBookings.filter((b: any) => ['upcoming', 'pending_approval', 'pending_payment'].includes(b.status))
    : userBookings.filter((b: any) => ['completed', 'cancelled'].includes(b.status));

  const handleFileUpload = (bookingId: string) => {
    setUploadingFor(bookingId);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingFor) {
      setTimeout(() => {
        setAllBookings((prev: any) => prev.map((b: any) => 
          b.id === uploadingFor ? { ...b, status: 'pending_approval', receiptUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600' } : b
        ));
        
        // Notify Admins
        setNotifications((prev: any) => [...prev, {
          title: 'Nuevo Comprobante',
          body: `${userName} envió comprobante de pago para validar.`,
          time: 'Ahora',
          read: false
        }]);

        setUploadingFor(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }, 1500);
    }
  };

  const approvePayment = async (id: string) => {
    const booking = bookings.find((b: any) => b.id === id);
    
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'upcoming' })
        .eq('id', id);

      if (error) throw error;

      setAllBookings((prev: any) => prev.map((b: any) => 
        b.id === id ? { ...b, status: 'upcoming' } : b
      ));

      // Notify Player
      setNotifications((prev: any) => [...prev, {
        title: 'Pago Validado',
        body: `Tu reserva para el ${booking?.date} ha sido confirmada por el administrador.`,
        time: 'Ahora',
        read: false
      }]);
    } catch (err) {
      console.error('Error approving payment:', err);
    }
  };

  return (
    <main className="pt-16 pb-32 px-5 max-w-2xl mx-auto space-y-6">
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-12 left-5 right-5 z-[100] bg-[#4be277] text-[#121414] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white/20"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-black text-sm uppercase italic leading-none">Comprobante Enviado</span>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider mt-1">Sincronizando con administración...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        className="hidden" 
        accept="image/*" 
      />

      {/* Header */}
      <div className="flex justify-between items-start pb-2">
        <div className="flex-1">
          <h2 className="font-display text-4xl font-extrabold text-white uppercase italic tracking-tighter leading-none">
            {isAdmin ? 'Gestión Reservas' : 'Mis Reservas'}
          </h2>
          <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">
            {isAdmin ? 'Supervisión y validación centralizada' : 'Seguimiento de tus turnos y pagos'}
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 glass-panel rounded-2xl">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-grow py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] italic transition-all ${
            activeTab === 'active' ? 'bg-[#FF9100] text-[#121414] shadow-lg shadow-[#FF9100]/20' : 'text-[#bccbb9] hover:bg-white/5'
          }`}
        >
          Próximas
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-grow py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] italic transition-all ${
            activeTab === 'history' ? 'bg-white/10 text-white' : 'text-[#bccbb9] hover:bg-white/5'
          }`}
        >
          Pasadas
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {displayBookings.length === 0 ? (
          <div className="glass-panel rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Calendar className="w-10 h-10 text-[#bccbb9]/20" />
            <p className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest italic">Sin registros en esta vista</p>
          </div>
        ) : (
          displayBookings.map((booking: any) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative glass-panel rounded-[2.5rem] overflow-hidden transition-all ${
                booking.status === 'pending_approval' ? 'border-[#FF9100]/30 shadow-[0_0_30px_rgba(255,145,0,0.1)]' : 
                booking.status === 'pending_payment' ? 'border-red-500/20' : 'border-white/5'
              }`}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-[#FF9100]" />
                    </div>
                    <div>
                      <h3 className="text-white text-base font-black uppercase italic tracking-wider leading-none">{booking.date}</h3>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] font-black text-[#FF9100] uppercase italic tracking-widest leading-none bg-[#FF9100]/10 px-2 py-0.5 rounded">{booking.time}</span>
                         <span className="text-[9px] font-bold text-[#bccbb9] uppercase tracking-widest">{booking.field}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                    booking.status === 'upcoming' ? 'bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277]' : 
                    booking.status === 'pending_approval' ? 'bg-[#FF9100]/10 border-[#FF9100]/20 text-[#FF9100] animate-pulse' :
                    booking.status === 'pending_payment' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-white/5 border-white/10 text-[#bccbb9]'
                  }`}>
                    {booking.status === 'upcoming' ? 'CONFIRMADO' : 
                     booking.status === 'pending_approval' ? 'PENDIENTE VALIDACIÓN' : 
                     booking.status === 'pending_payment' ? 'PAGO PENDIENTE' : 'FINALIZADO'}
                  </div>
                </div>

                {isAdmin && (
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#bccbb9]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[#bccbb9] uppercase block tracking-widest mb-0.5">JUGADOR RESPONSABLE</span>
                        <span className="text-xs font-black text-white uppercase italic">{booking.user}</span>
                      </div>
                    </div>
                    {booking.status === 'pending_approval' && (
                      <button 
                        onClick={() => setViewingReceipt(booking.receiptUrl || 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600')}
                        className="flex items-center gap-2 bg-[#FF9100] px-3 py-2 rounded-xl text-[#121414] text-[8px] font-black uppercase tracking-widest italic animate-pulse"
                      >
                        <Eye className="w-3 h-3" />
                        Ver Pago
                      </button>
                    )}
                    <div className="text-right">
                       <span className="text-[8px] font-bold text-[#bccbb9] uppercase block tracking-widest mb-0.5">COSTO TURNO</span>
                       <span className="text-sm font-black text-[#4be277]">{booking.amount || '$45.00'}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isAdmin && booking.status === 'pending_payment' && (
                    <button 
                      onClick={() => handleFileUpload(booking.id)}
                      className="flex-1 h-14 bg-white text-[#121414] rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest italic hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                    >
                      <Camera className="w-5 h-5" />
                      Subir Comprobante
                    </button>
                  )}

                  {isAdmin && booking.status === 'pending_approval' && (
                    <div className="flex w-full gap-3">
                      <button 
                        onClick={() => approvePayment(booking.id)}
                        className="flex-1 h-14 bg-[#4be277] text-[#121414] rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest italic hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#4be277]/20"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Validar Pago
                      </button>
                      <button 
                        onClick={() => {
                          setAllBookings((prev: any) => prev.map((b: any) => 
                            b.id === booking.id ? { ...b, status: 'pending_payment', receiptUrl: null } : b
                          ));
                          showToast('Pago rechazado. El usuario deberá subirlo nuevamente.', 'error');
                        }}
                        className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-[#121414] transition-all active:scale-95"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {!isAdmin && (booking.status === 'upcoming' || booking.status === 'pending_approval') && (
                    <button 
                      onClick={() => {
                        const shareText = `¡Tengo una reserva en Ramito Fut Show!\nCancha: ${booking.field}\nFecha: ${booking.date}\nHora: ${booking.time}\n¡Te espero!`;
                        if (navigator.share) {
                          navigator.share({ title: 'Reserva Ramito Fut Show', text: shareText }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(shareText);
                          alert('Invitación copiada al portapapeles');
                        }
                      }}
                      className="flex-1 h-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest italic hover:bg-white/10 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      Invitar Amigos
                    </button>
                  )}

                  <button 
                    onClick={() => showToast('Funcionalidad de detalles en desarrollo', 'success')}
                    className="px-6 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-[#bccbb9] font-black text-[9px] uppercase tracking-widest italic hover:bg-white/10 transition-all"
                  >
                    Ver Más
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Receipt Preview Modal */}
      <AnimatePresence>
        {viewingReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[#121414]/95 flex flex-col items-center justify-center p-5"
          >
            <div className="absolute top-10 right-5">
              <button 
                onClick={() => setViewingReceipt(null)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="w-full max-w-sm aspect-[3/4] glass-panel rounded-[3rem] overflow-hidden shadow-2xl relative">
              <img src={viewingReceipt} alt="Comprobante" className="w-full h-full object-contain" />
              <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-[#121414] to-transparent">
                <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-widest italic">Comprobante de Pago</span>
                <h4 className="text-white text-lg font-black uppercase italic tracking-tighter mt-1">Verificación Ramito</h4>
              </div>
            </div>
            
            <div className="mt-8 w-full max-w-sm grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  const bId = bookings.find((b: any) => b.receiptUrl === viewingReceipt)?.id;
                  if (bId) approvePayment(bId);
                  setViewingReceipt(null);
                }}
                className="h-14 bg-[#4be277] text-[#121414] rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest italic"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar
              </button>
              <button 
                onClick={() => {
                  const bId = bookings.find((b: any) => b.receiptUrl === viewingReceipt)?.id;
                  if (bId) {
                    setAllBookings((prev: any) => prev.map((b: any) => 
                      b.id === bId ? { ...b, status: 'pending_payment', receiptUrl: null } : b
                    ));
                    showToast('Pago rechazado. El usuario deberá subirlo nuevamente.', 'error');
                  }
                  setViewingReceipt(null);
                }}
                className="h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest italic"
              >
                <XCircle className="w-4 h-4" />
                Rechazar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
