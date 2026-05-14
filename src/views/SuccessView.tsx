import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Share2, CalendarDays, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SuccessView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setNotifications, setAllBookings } = useApp();
  
  const bookingStatus = localStorage.getItem('last_booking_status') || 'upcoming';
  const paymentMethod = localStorage.getItem('last_payment_method') || 'cash';
  const userName = localStorage.getItem('ramito_user_name') || 'Agus Castro';
  
  // Get the real booking data if it was passed via location.state
  const bookingData = location.state?.bookingData;

  useEffect(() => {
    if (bookingData) {
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        date: bookingData.date,
        time: bookingData.time,
        field: bookingData.field,
        status: bookingStatus,
        amount: '$45.00',
        user: userName
      };

      setAllBookings((prev: any) => [...prev, newBooking]);

      // Notify player
      setNotifications((prev: any) => [...prev, {
        title: 'Reserva Registrada',
        body: `Tu turno para el ${bookingData.date} a las ${bookingData.time} ha sido pre-reservado.`,
        time: 'Ahora',
        read: false
      }]);

      // Notify admin
      setNotifications((prev: any) => [...prev, {
        title: 'Nueva Reserva',
        body: `El usuario ${userName} reservó la ${bookingData.field} para el ${bookingData.date}.`,
        time: 'Ahora',
        read: false
      }]);
    }
  }, []);

  const isPending = bookingStatus === 'pending_approval' || bookingStatus === 'pending_payment';
  const needsTicket = bookingStatus === 'pending_payment';

  return (
    <main className="relative flex-grow flex flex-col items-center justify-center h-[100dvh] px-5 text-center overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${isPending ? 'bg-[#FF9100]/20' : 'bg-[#4be277]/20'} blur-[100px] z-0`} />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="relative z-10 space-y-6"
      >
        <div className="flex justify-center">
          <div className={`w-24 h-24 ${isPending ? 'bg-[#FF9100]' : 'bg-[#4be277]'} rounded-full flex items-center justify-center shadow-lg transition-colors`}>
            {isPending ? (
              <Clock className="w-12 h-12 text-[#121414]" strokeWidth={3} />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-[#121414]" strokeWidth={3} />
            )}
          </div>
        </div>

        <div className="space-y-3 px-4">
          <h2 className="font-display text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
            {needsTicket ? 'Reserva Registrada' : isPending ? 'Validando Comprobante' : '¡Reserva Lista!'}
          </h2>
          <p className="text-[#bccbb9] text-xs font-bold uppercase tracking-[0.1em] leading-relaxed">
            {needsTicket
              ? 'Tu reserva está separada. Por favor, realiza la transferencia y sube el comprobante en la sección "Mis Reservas" para confirmarla.'
              : isPending 
                ? 'Estamos revisando tu transferencia. Recibirás una notificación cuando sea confirmada.' 
                : paymentMethod === 'cash' 
                  ? 'Tu cancha está reservada. Recuerda realizar el pago en la recepción al llegar.'
                  : 'Tu lugar en la cancha ya es oficial. ¡Prepárate para el show!'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 w-full max-w-xs mt-12 space-y-4"
      >
        <button
          onClick={() => navigate('/my-bookings')}
          className="w-full h-14 bg-[#1a1c1c] border border-white/10 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
        >
          <CalendarDays className="w-5 h-5 text-[#FF9100]" />
          Ver Mis Reservas
        </button>

        <button
          className="w-full h-14 bg-gradient-to-r from-[#FF9100] via-[#4be277] to-[#D32F2F] text-[#121414] font-black text-xs rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-lg shadow-[#FF9100]/20 active:scale-95 transition-all"
        >
          <Share2 className="w-5 h-5" />
          Compartir con el Equipo
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white"
        >
          Volver al Inicio
        </button>
      </motion.div>
    </main>
  );
}
