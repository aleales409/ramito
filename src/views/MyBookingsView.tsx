import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Trophy, 
  Camera, 
  Check, 
  User,
  Eye,
  X,
  CalendarDays,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  History,
  Ticket,
  Download,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Printer,
  Bell,
  Activity,
  ShieldCheck,
  Package,
  Layers,
  Zap,
  Smartphone,
  Landmark,
  Shield,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCantinaItems, saveCantinaItems } from '../lib/cantina';
import NotificationBell from '../components/NotificationBell';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { enqueueOperation } from '../lib/syncQueue';

const USER_AVATARS: Record<string, string> = {
  'CARLOS MENDOZA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23FBBF24" stroke-width="2" stroke-opacity="0.3"/><path d="M 35,30 L 65,30 A 15,15 0 0,1 50,60 A 15,15 0 0,1 35,30 Z" fill="%23FBBF24" fill-opacity="0.1" stroke="%23FBBF24" stroke-width="2"/><path d="M 35,38 H 28 A 5,5 0 0,1 28,48 H 35" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 65,38 H 72 A 5,5 0 0,0 72,48 H 65" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,60 V 70 M 40,70 H 60" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,16 L 52,21 L 57,21 L 53,24 L 55,29 L 50,26 L 45,29 L 47,24 L 43,21 L 48,21 Z" fill="%23FBBF24" fill-opacity="0.2" stroke="%23FBBF24" stroke-width="1"/></svg>', // Mundial Oro
  'SOFÍA RODRÍGUEZ': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2306B6D4" stroke-width="2" stroke-opacity="0.3"/><path d="M 32,32 L 42,32 A 8,8 0 0,0 58,32 L 68,32 L 76,46 L 66,52 L 62,48 L 62,74 L 38,74 L 38,48 L 34,52 L 24,46 Z" fill="%2306B6D4" fill-opacity="0.1" stroke="%2306B6D4" stroke-width="2"/><text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="16" fill="%2306B6D4" text-anchor="middle">10</text></svg>', // Camiseta Copa 10
  'MATEO SILVA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.7" stroke="%238B5CF6" stroke-width="2" stroke-opacity="0.3"/><path d="M 38,34 Q 28,38 34,54 L 38,68 A 12,12 0 0,0 62,68 L 66,54 Q 72,38 62,34 A 8,8 0 0,0 50,44 A 8,8 0 0,0 38,34 Z" fill="%23A78BFA" fill-opacity="0.1" stroke="%23A78BFA" stroke-width="2" stroke-linejoin="round"/><path d="M 44,52 H 56 M 46,60 H 54" stroke="%23A78BFA" stroke-width="1.5" stroke-opacity="0.7"/></svg>', // Guantes Pro
  'CAMILA ESPINOZA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23CA8A04" stroke-width="2" stroke-opacity="0.3"/><path d="M 42,20 L 34,44 L 50,54 L 66,44 L 58,20" fill="none" stroke="%23EF4444" stroke-width="2"/><circle cx="50" cy="58" r="18" fill="%23CA8A04" fill-opacity="0.1" stroke="%23CA8A04" stroke-width="2"/><path d="M 50,49 L 52,54 L 57,54 L 53,57 L 55,62 L 50,59 L 45,62 L 47,57 L 43,54 L 48,54 Z" fill="%23FBBF24" fill-opacity="0.4" stroke="%23CA8A04" stroke-width="1"/></svg>', // Medalla Oro
  'JAVIER ORTEGA': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2310B981" stroke-width="2" stroke-opacity="0.3"/><rect x="24" y="24" width="52" height="48" fill="none" stroke="%2310B981" stroke-width="2" stroke-opacity="0.8"/><line x1="50" y1="24" x2="50" y2="72" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="10" fill="none" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="2.5" fill="%2310B981"/></svg>', // Estrategia
};

const generateMockReceiptUrl = (user: string, amount: string, bookingId: string) => {
  const currentNum = Math.floor(100000 + Math.random() * 900000);
  const cleanAmount = amount ? amount.replace('$', '').trim() : '120.00';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 650" width="400" height="650">
    <defs>
      <linearGradient id="yapeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A148C"/>
        <stop offset="100%" stop-color="#1A0033"/>
      </linearGradient>
    </defs>
    <rect width="400" height="650" rx="32" fill="url(#yapeGrad)"/>
    <circle cx="200" cy="90" r="40" fill="#00E676" opacity="0.2"/>
    <circle cx="200" cy="90" r="30" fill="#00E676"/>
    <path d="M188 90 l8 8 l16 -16" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="200" y="150" fill="#00E676" font-family="sans-serif" font-weight="950" font-size="18" text-anchor="middle" letter-spacing="1.5">¡YAPE CONFIRMADO!</text>
    <text x="200" y="172" fill="#E1BEE7" font-family="sans-serif" font-weight="700" font-size="10" text-anchor="middle">TRANSFERENCIA DIRECTA EMITIDA</text>
    <rect x="25" y="195" width="350" height="350" rx="20" fill="#ffffff"/>
    <circle cx="10" cy="370" r="16" fill="#1A0033"/>
    <circle cx="390" cy="370" r="16" fill="#1A0033"/>
    <text x="200" y="235" fill="#757575" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">MONTO TRANSFERIDO</text>
    <text x="200" y="278" fill="#4A148C" font-family="sans-serif" font-weight="900" font-size="34" text-anchor="middle">S/. ${cleanAmount}</text>
    <line x1="50" y1="305" x2="350" y2="305" stroke="#EEEEEE" stroke-width="2"/>
    <line x1="50" y1="370" x2="350" y2="370" stroke="#7B1FA2" stroke-width="2" stroke-dasharray="6,6"/>
    <text x="50" y="335" fill="#9E9E9E" font-family="sans-serif" font-weight="800" font-size="8">EMITENTE (JUGADOR)</text>
    <text x="50" y="352" fill="#212121" font-family="sans-serif" font-weight="900" font-size="11" uppercase="true">${user}</text>
    <text x="50" y="410" fill="#7B1FA2" font-family="sans-serif" font-weight="900" font-size="9">DESTINATARIO OFICIAL</text>
    <text x="50" y="427" fill="#212121" font-family="sans-serif" font-weight="900" font-size="11">RAMITO FUT SHOW - COMPLEJO DEPORTIVO</text>
    <text x="50" y="465" fill="#9E9E9E" font-family="sans-serif" font-weight="bold" font-size="8">CÓDIGO DE OPERACIÓN</text>
    <text x="50" y="482" fill="#111111" font-family="monospace, sans-serif" font-weight="900" font-size="11">OP-YAPE-${bookingId.substring(0,6).toUpperCase()}-${currentNum}</text>
    <text x="50" y="510" fill="#9E9E9E" font-family="sans-serif" font-weight="bold" font-size="8">FECHA Y HORA DEL REGISTRO</text>
    <text x="50" y="525" fill="#111111" font-family="sans-serif" font-weight="700" font-size="10">Hoy, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</text>
    <text x="200" y="590" fill="#E1BEE7" font-family="sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="2">★ CONTROL DE CAJA COMPLEJO ★</text>
    <text x="200" y="610" fill="#9575CD" font-family="monospace" font-weight="700" font-size="8" text-anchor="middle">CRA_INTEGRAL_VERIFIED_SECURE</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

export default function MyBookingsView() {
  const navigate = useNavigate();
  const { allBookings, setAllBookings, notifications, setNotifications, showToast, userName, userRole: role, userAvatar, emergencyMode, adminPhone } = useApp();
  
  const isAdmin = role === 'admin_elite' || role === 'admin_vip';

  const getUserAvatar = (name: string) => {
    const cleanName = (name || '').toUpperCase().trim();
    const userNameUpperCase = (userName || '').toUpperCase().trim();
    
    if (cleanName === userNameUpperCase) {
      if (userAvatar) return userAvatar;
    }
    
    return USER_AVATARS[cleanName] || null;
  };

  const [activeSplitBookingId, setActiveSplitBookingId] = useState<string | null>(null);
  const [splitPlayerCount, setSplitPlayerCount] = useState<number>(10);

  // Synchronize notifications on mount to show pending receipt alerts in the bell
  useEffect(() => {
    if (isAdmin && allBookings) {
      const pendingApprovalBookings = allBookings.filter((b: any) => b.status === 'pending_approval');
      if (pendingApprovalBookings.length > 0) {
        const alreadyHasSimulated = notifications?.some((n: any) => n.title.includes('Comprobante de'));
        if (!alreadyHasSimulated) {
          const freshNotifications = pendingApprovalBookings.map((b: any, idx: number) => ({
            title: `Comprobante de ${b.user}`,
            body: `Subió captura para la reserva del ${b.date} (${b.time}, ${b.field}) por ${b.amount}. Revisa la transferencia para verificarla.`,
            time: `Hace ${idx * 4 + 3} min`,
            read: false
          }));
          
          setNotifications((prev: any) => {
            const cleanPrev = (prev || []).filter((n: any) => !n.title.includes('Comprobante de'));
            return [...cleanPrev, ...freshNotifications];
          });
        }
      }
    }
  }, [isAdmin, allBookings, notifications]);

  if (!userName && !isAdmin) {
    return (
      <main className="pt-20 pb-32 px-5 max-w-md mx-auto flex flex-col items-center text-center space-y-8">
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
          Gestión Ramito Fut Show • v1.0.8
        </p>
      </main>
    );
  }
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'waitlist'>('pending');

  const [myWaitlists, setMyWaitlists] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_waitlists') || '[]';
    try {
      const parsed = JSON.parse(saved);
      const currentUserName = localStorage.getItem('ramito_user_name') || '';
      return parsed.filter((w: any) => w.user === currentUserName);
    } catch (e) {
      return [];
    }
  });

  const handleRemoveFromWaitlist = (id: string) => {
    try {
      const saved = localStorage.getItem('ramito_waitlists') || '[]';
      const parsed = JSON.parse(saved);
      const updated = parsed.filter((w: any) => w.id !== id);
      localStorage.setItem('ramito_waitlists', JSON.stringify(updated));
      setMyWaitlists(prev => prev.filter((w: any) => w.id !== id));
      showToast('Eliminado de la lista de espera con éxito.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const [viewingBookingReceipt, setViewingBookingReceipt] = useState<any | null>(null);
  const [viewingCourtDetails, setViewingCourtDetails] = useState<any | null>(null);
  const [viewingOfficialTicket, setViewingOfficialTicket] = useState<any | null>(null);
  const [isSimulatingPrint, setIsSimulatingPrint] = useState(false);
  const [isSimulatingDownload, setIsSimulatingDownload] = useState(false);
  const [showExtrasDeliveries, setShowExtrasDeliveries] = useState(false);

  // States and Handlers for Rescheduling under Emergency Mode (Cierre Fuerza Mayor)
  const [reschedulingBooking, setReschedulingBooking] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('Mayo 25');
  const [rescheduleTime, setRescheduleTime] = useState<string>('18:00');

  const handleRescheduleBooking = async (id: string, newDate: string, newTime: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('bookings')
          .update({ date: newDate, time: newTime })
          .eq('id', id);

        if (error) throw error;
      }

      setAllBookings((prev: any) => prev.map((b: any) => 
        b.id === id ? { ...b, date: newDate, time: newTime } : b
      ));

      setNotifications((prev: any) => [
        {
          id: `reschedule_${Date.now()}`,
          title: '🔄 TURNO REPROGRAMADO CON ÉXITO',
          body: `Tu reserva ha sido reprogramada libremente debido al Cierre de Emergencia. Nueva fecha: ${newDate} a las ${newTime} Hs.`,
          time: 'Hace un instante',
          read: false
        },
        ...(prev || [])
      ]);

      showToast('¡Turno reprogramado exitosamente!', 'success');
      setReschedulingBooking(null);
    } catch (err) {
      console.error("Error rescheduling: ", err);
      showToast('Error al reprogramar el turno.', 'error');
    }
  };

  const toggleExtrasDelivered = (bookingId: string) => {
    const bookingList = allBookings || [];
    const bk = bookingList.find((b: any) => b.id === bookingId);
    if (!bk) return;

    const wasDelivered = bk.extras_delivered === true;
    const nowDelivered = !wasDelivered;

    setAllBookings((prev: any) =>
      prev.map((b: any) =>
        b.id === bookingId ? { ...b, extras_delivered: nowDelivered } : b
      )
    );

    if (bk.extras && bk.extras.length > 0) {
      const items = getCantinaItems();
      let updatedAny = false;

      bk.extras.forEach((extraName: string) => {
        // Encontrar por coincidencia exacta o subcadena para mayor robustez
        const target = items.find(i => 
          i.name.toUpperCase() === extraName.toUpperCase() ||
          extraName.toUpperCase().includes(i.name.toUpperCase()) ||
          i.name.toUpperCase().includes(extraName.toUpperCase())
        );

        if (target) {
          if (nowDelivered) {
            const oldStock = target.stock;
            target.stock = Math.max(0, target.stock - 1);

            // Check threshold for real-time safety inventory warning notifications
            const threshold = parseInt(localStorage.getItem('ramito_stock_alert_threshold') || '5', 10);
            if (target.stock <= threshold && oldStock > threshold) {
              const lowStockWarning = {
                id: `stock_alert_${target.id}_${Date.now()}`,
                title: target.stock === 0 ? 'STOCK CRÍTICO AGOTADO' : 'CONTROL DE INVENTARIO: STOCK BAJO',
                body: target.stock === 0 
                  ? `¡URGENTE! Se agotó por completo el stock de "${target.name}". Diríjase a Configuración de Cantina para recargar.`
                  : `Se alcanzó el perímetro de seguridad. Quedan solo ${target.stock} unidades de "${target.name}". Cargue reposición antes de llegar a cero.`,
                time: 'Hace un momento',
                read: false
              };
              if (setNotifications) {
                setNotifications((prev: any[]) => [lowStockWarning, ...(prev || [])]);
              }
            }
          } else {
            target.stock = target.stock + 1;
          }
          updatedAny = true;
        }
      });

      if (updatedAny) {
        saveCantinaItems(items);
      }
    }

    showToast(
      nowDelivered 
        ? 'Consumo entregado e inventario descontado' 
        : 'Entrega revertida y stock restablecido', 
      'success'
    );
  };
  
  // Sincronizar reservas del estado reactivo
  const bookings = allBookings || [];
  const bookingsWithUndeliveredExtras = bookings.filter((b: any) => b.extras && b.extras.length > 0 && !b.extras_delivered);
  
  // Filtrar reservas: Administradores logueados ven todos, jugadores ven los propios
  const userBookings = isAdmin ? bookings : bookings.filter((b: any) => b.user === userName);
  
  // Clasificación por tab (Pendientes vs Confirmadas)
  // Pendientes: reservas por pagar o por verificar por la administración (pending_payment, pending_approval)
  const pendingBookingsList = userBookings.filter((b: any) => ['pending_approval', 'pending_payment'].includes(b.status));
  // Confirmadas: reservas validadas y programadas para jugar (upcoming), o bien finalizadas con éxito (completed/cancelled)
  const confirmedBookingsList = userBookings.filter((b: any) => ['upcoming', 'completed', 'cancelled'].includes(b.status));

  // Aplicar filtros directos sobre la lista seleccionada
  const getFilteredBookings = () => {
    if (activeTab === 'confirmed') {
      return confirmedBookingsList;
    }
    if (activeTab === 'waitlist') {
      return [];
    }
    return pendingBookingsList;
  };

  const displayBookings = getFilteredBookings();

  const handleFileUpload = (bookingId: string) => {
    setUploadingFor(bookingId);
    fileInputRef.current?.click();
  };

  const handleSimulateReceipt = (bookingId: string) => {
    const targetBooking = bookings.find((b: any) => b.id === bookingId);
    if (!targetBooking) return;
    
    const mockUrl = generateMockReceiptUrl(targetBooking.user || userName || 'Usuario', targetBooking.amount || '$ 120.00', targetBooking.id);
    
    setAllBookings((prev: any) => prev.map((b: any) => 
      b.id === bookingId ? { ...b, status: 'pending_approval', receiptUrl: mockUrl } : b
    ));
    
    // Registrar notificación interactiva para administración
    setNotifications((prev: any) => [
      {
        title: 'Nuevo Comprobante Recibido (Simulado)',
        body: `El usuario ${targetBooking.user} simuló un envío de comprobante para el turno del ${targetBooking.date}. Revisa la transferencia interactiva para validarla.`,
        time: 'Ahora',
        read: false
      },
      ...prev
    ]);

    showToast('¡Comprobante Yape/Plin simulado de forma exitosa!', 'success');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingFor) {
      const isPdfValue = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      // Intentar crear URL del archivo cargado para máxima fidelidad visual del comprobante real
      try {
        const localUrl = URL.createObjectURL(file);
        setAllBookings((prev: any) => prev.map((b: any) => 
          b.id === uploadingFor ? { 
            ...b, 
            status: 'pending_approval', 
            receiptUrl: localUrl,
            isPdf: isPdfValue,
            fileName: file.name
          } : b
        ));
        
        // Registrar notificación interactiva en tiempo real para administración
        const targetBooking = bookings.find((b: any) => b.id === uploadingFor);
        setNotifications((prev: any) => [
          {
            title: 'Nuevo Comprobante Recibido',
            body: `${userName || 'Usuario'} adjuntó transferencia de pago para el turno del ${targetBooking?.date || 'día programado'}.`,
            time: 'Ahora',
            read: false
          },
          ...prev
        ]);

        setUploadingFor(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } catch (err) {
        console.error('Error generating blob URL', err);
        // Fallback robusto
        setAllBookings((prev: any) => prev.map((b: any) => 
          b.id === uploadingFor ? { ...b, status: 'pending_approval', receiptUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600' } : b
        ));
        setUploadingFor(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    }
  };

  const approvePayment = async (id: string) => {
    const booking = bookings.find((b: any) => b.id === id);
    
    let syncNeeded = false;
    try {
      if (isSupabaseConfigured) {
        if (navigator.onLine) {
          const { error } = await supabase
            .from('bookings')
            .update({ status: 'upcoming' })
            .eq('id', id);

          if (error) {
            console.error('Error approving payment on Supabase:', error);
            syncNeeded = true;
          }
        } else {
          syncNeeded = true;
        }

        if (syncNeeded) {
          enqueueOperation('bookings', 'update', { status: 'upcoming' }, { key: 'id', value: id });
          showToast('Pago aprobado localmente (pendiente de sincronización)', 'success');
        }
      }

      setAllBookings((prev: any) => prev.map((b: any) => 
        b.id === id ? { ...b, status: 'upcoming' } : b
      ));

      // Notificar al jugador sobre confirmación de turno
      setNotifications((prev: any) => [
        {
          title: '¡Reserva Confirmada!',
          body: `Tu pago de cancha para el día ${booking?.date || ''} ha sido validado con éxito. ¡Prepárate para jugar!`,
          time: 'Ahora',
          read: false
        },
        ...prev
      ]);
      
      if (!syncNeeded) {
        showToast('¡Reserva aprobada y confirmada con éxito!', 'success');
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      showToast('Error al actualizar la reserva', 'error');
    }
  };

  const rejectPayment = (id: string) => {
    setAllBookings((prev: any) => prev.map((b: any) => 
      b.id === id ? { ...b, status: 'pending_payment', receiptUrl: null } : b
    ));
    
    const booking = bookings.find((b: any) => b.id === id);
    setNotifications((prev: any) => [
      {
        title: 'Verificación de Pago Fallida',
        body: `El comprobante subido para tu turno del ${booking?.date || ''} fue rechazado. Revisa tu transferencia e inténtalo de nuevo.`,
        time: 'Ahora',
        read: false
      },
      ...prev
    ]);
    
    showToast('Transferencia rechazada. Se notificó al usuario para subirlo de nuevo.', 'error');
  };

  return (
    <main className="pt-24 pb-32 px-4 w-full max-w-5xl md:max-w-6xl mx-auto space-y-6 overflow-x-hidden">
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
        accept="image/*,application/pdf" 
      />

      {/* Header */}
      <div className="flex justify-between items-center pb-2 gap-3 text-left">
        <div className="flex-1 pr-4">
          <h2 className="font-display text-3xl font-extrabold text-white uppercase italic tracking-tighter leading-tight">
            {isAdmin ? 'Gestión Reservas' : 'Mis Reservas'}
          </h2>
          <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.18em] mt-1.5 italic">
            {isAdmin ? 'Supervisión y control en tiempo real' : 'Seguimiento de tus turnos y pagos'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-2xl bg-[#1a1c1c]/80 border border-white/5 flex items-center justify-center overflow-hidden hover:border-[#4be277]/40 hover:scale-105 transition-all group relative shrink-0 shadow-lg"
            title="Ir al Perfil"
          >
            {getUserAvatar(userName || '') ? (
              <img src={getUserAvatar(userName || '')} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#bccbb9]" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[7.5px] font-black text-[#4be277] uppercase tracking-wider">Ver</span>
            </div>
          </button>
          <NotificationBell />
        </div>
      </div>



      {/* CONTROL DE ENTREGAS & CANTINA (Only Admins) */}
      {isAdmin && (
        <section className="bg-[#1a1c1c]/40 border border-white/5 p-4 sm:p-5 rounded-3xl space-y-4 mb-4 text-left">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowExtrasDeliveries(!showExtrasDeliveries)}
              className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors focus:outline-none"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <span className="text-xs font-black uppercase italic tracking-wider block">Entregas de Cantina ({bookingsWithUndeliveredExtras.length})</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#bccbb9]/50 font-mono">
                  DESPACHO DE BEBIDAS Y EXTRAS PARA JUGADORES
                </span>
              </div>
              {showExtrasDeliveries ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>

            <span className="text-[7.5px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl uppercase font-mono">
              Entregas por Turno
            </span>
          </div>

          {showExtrasDeliveries && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-3 border-t border-white/5 overflow-hidden"
            >
              {bookings.filter((b: any) => b.extras && b.extras.length > 0).length === 0 ? (
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#bccbb9]/40 text-center py-4">No hay reservas con consumos extras registrados.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {bookings.filter((b: any) => b.extras && b.extras.length > 0).map((b: any) => {
                    const isDelivered = b.extras_delivered === true;
                    return (
                      <div key={b.id} className="p-3 bg-black/30 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shrink-0 flex items-center justify-center">
                            {getUserAvatar(b.user) ? (
                              <img src={getUserAvatar(b.user)} alt={b.user} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-[#bccbb9]" />
                            )}
                          </div>
                          <div className="space-y-1.5 min-w-0 flex-grow">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white uppercase truncate">{b.user}</span>
                              <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest italic">({b.time} - {b.date})</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {b.extras.map((extra: string, idx: number) => (
                                <span key={idx} className="text-[8px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/10 px-1.5 py-0.5 rounded uppercase font-sans">
                                  {extra}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleExtrasDelivered(b.id)}
                          className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-[8.5px] font-black uppercase tracking-widest transition-all inline-flex items-center justify-center gap-1.5 select-none ${
                            isDelivered 
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                              : 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 animate-pulse'
                          }`}
                        >
                          {isDelivered ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Package className="w-3.5 h-3.5 shrink-0" />}
                          {isDelivered ? 'ENTREGADO' : 'ENTREGAR'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </section>
      )}

      {/* Tabs - Centered & responsive selectors */}
      <div className="space-y-2">
        <div className="flex gap-2 p-1 bg-[#141616] border border-white/5 rounded-2xl relative">
          <button 
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-grow py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all duration-300 ${
              activeTab === 'pending' 
                ? 'bg-[#FF9100] text-black shadow-lg shadow-[#FF9100]/20' 
                : 'text-[#bccbb9] hover:bg-white/5'
            }`}
          >
            Pendientes ({pendingBookingsList.length})
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('confirmed')}
            className={`flex-grow py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all duration-300 ${
              activeTab === 'confirmed' 
                ? 'bg-[#FF9100] text-black shadow-lg shadow-[#FF9100]/20' 
                : 'text-[#bccbb9] hover:bg-white/5'
            }`}
          >
            Confirmadas ({confirmedBookingsList.length})
          </button>

          {!isAdmin && (
            <button 
              type="button"
              onClick={() => setActiveTab('waitlist')}
              className={`flex-grow py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all duration-300 ${
                activeTab === 'waitlist' 
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' 
                  : 'text-[#bccbb9] hover:bg-white/5'
              }`}
            >
              Lista de Espera ({myWaitlists.length})
            </button>
          )}
        </div>
        
        {/* Helper subtitles under the tabs to clear doubts */}
        <div className="flex items-center justify-center gap-1.5 px-2 text-center">
          {activeTab === 'pending' && <Activity className="w-3.5 h-3.5 text-[#FF9100] shrink-0 animate-pulse" />}
          {activeTab === 'confirmed' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          {activeTab === 'waitlist' && <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />}
          <p className="text-[8.5px] font-black text-[#bccbb9]/40 tracking-wider uppercase">
            {activeTab === 'pending' 
              ? 'Turnos Pendientes: A la espera de carga de comprobantes, transferencia o verificación de administración.' 
              : activeTab === 'confirmed'
              ? 'Turnos Confirmados: Reservas habilitadas y validadas con éxito, guardadas en el sistema.'
              : 'Lista de Espera Inteligente: Te alertaremos con una notificación prioritaria inmediata si se libera o cancela el turno.'}
          </p>
        </div>
      </div>



      {/* Bookings List */}
      {activeTab === 'waitlist' ? (
        myWaitlists.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4">
            <Bell className="w-10 h-10 text-amber-400/20" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#bccbb9]/40 uppercase tracking-widest italic">
                Sin Listas de Espera activas
              </p>
              <p className="text-[9px] font-medium text-[#bccbb9]/30 uppercase tracking-wider">
                No te has sumado a ninguna lista de espera todavía en las canchas ocupadas.
              </p>
            </div>
            <button
              onClick={() => navigate('/booking')}
              className="mt-2 px-4 py-2 bg-[#FF9100] text-[#121414] text-[9px] font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-all font-sans"
            >
              Explorar Canchas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myWaitlists.map((wl: any) => {
              const isCancha1 = wl.field?.toUpperCase().includes('CANCHA 1') || wl.field?.toUpperCase().includes('MARACANÁ') || wl.field?.toUpperCase().includes('MONUMENTAL') || !wl.field?.toUpperCase().includes('CANCHA 2');
              const courtDetail = isCancha1 
                ? { 
                    name: 'Cancha 1 • El Maracaná', 
                    tag: 'Césped Sintético Pro', 
                    tagStyle: 'bg-[#4be277]/10 text-[#4be277] border-[#4be277]/20'
                  }
                : { 
                    name: 'Cancha 2 • La Bombonera', 
                    tag: 'Tierra Compactada', 
                    tagStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  };

              const courtBg = isCancha1
                ? 'https://images.unsplash.com/photo-1589487391730-58f20ad2f308?q=80&w=400&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=400&auto=format&fit=crop';
              return (
                <div key={wl.id} className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 bg-[#141616]/90 p-5 flex flex-col justify-between space-y-4 relative text-left">
                  <div className="space-y-3">
                    <div className="h-28 rounded-xl overflow-hidden relative border border-white/5">
                      <img src={courtBg} alt={wl.field} className="w-full h-full object-cover animate-pulse" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <span className="absolute bottom-2 left-3 text-xs font-black text-white uppercase italic tracking-wider">{wl.field}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-[#FF9100] block uppercase italic">{wl.time} hs</span>
                        <span className="text-[8px] font-mono font-black text-[#bccbb9]/40 uppercase bg-white/5 py-0.5 px-2 rounded-full border border-white/10">{wl.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-lg px-2 py-0.5 w-max">
                        <Bell className="w-3 h-3 animate-pulse" />
                        <span className="text-[7.5px] font-black uppercase tracking-widest leading-none">Espera Activa</span>
                      </div>
                      
                      <div className={`mt-2 inline-flex items-center gap-1.5 border text-[7.5px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${courtDetail.tagStyle}`}>
                        {isCancha1 ? <Activity className="w-3 h-3 shrink-0" /> : <Layers className="w-3 h-3 shrink-0" />}
                        {courtDetail.tag}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFromWaitlist(wl.id)}
                    className="w-full h-10 bg-red-500/5 hover:bg-red-500 hover:text-black hover:border-red-500/30 text-red-400 border border-red-500/10 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all outline-none"
                  >
                    Remover de Espera
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className={displayBookings.length === 0 ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {displayBookings.length === 0 ? (
            <div className="glass-panel rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4">
              <Calendar className="w-10 h-10 text-[#bccbb9]/10" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#bccbb9]/40 uppercase tracking-widest italic">
                  Sin reservas registradas
                </p>
                <p className="text-[9px] font-medium text-[#bccbb9]/30 uppercase tracking-wider">
                  No hay resultados para este filtro.
                </p>
              </div>
              {!isAdmin && activeTab === 'pending' && (
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="mt-2 px-4 py-2 bg-[#FF9100] text-black text-[9px] font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-all"
                >
                  Hacer mi primera reserva
                </button>
              )}
            </div>
          ) : (
          displayBookings.map((booking: any) => {
            const isPendingApproval = booking.status === 'pending_approval';
            const isPendingPayment = booking.status === 'pending_payment';
            const isUpcoming = booking.status === 'upcoming';
            const hasReceipt = !!booking.receiptUrl;

            const isCancha1 = booking.field?.toUpperCase().includes('CANCHA 1') || booking.field?.toUpperCase().includes('MARACANÁ') || booking.field?.toUpperCase().includes('MONUMENTAL') || !booking.field?.toUpperCase().includes('CANCHA 2');
            
            const isDeposit = booking.payment_plan === 'deposit';
            const rawAmt = parseFloat(booking.amount?.replace(/[^0-9.]/g, '') || '120');
            const paidAmount = isDeposit ? (booking.paid_amount || Math.round(rawAmt * 0.20)) : null;
            const pendingBalance = isDeposit ? (booking.pending_balance || Math.max(0, rawAmt - (paidAmount || 0))) : 0;

            const courtDetail = isCancha1 
              ? { 
                  name: 'Cancha 1 • El Maracaná', 
                  tag: 'Césped Sintético Pro', 
                  tagStyle: 'bg-[#4be277]/10 text-[#4be277] border-[#4be277]/20',
                  rules: 'NORMATIVA: SOLO BOTINES MULTITAPÓN F5 O ZAPATILLAS. PROHIBICIÓN DE TAPONES LARGOS.' 
                }
              : { 
                  name: 'Cancha 2 • La Bombonera', 
                  tag: 'Tierra Compactada', 
                  tagStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  rules: 'NORMATIVA: APTO BOTINES O ZAPATILLAS DEPORTIVAS. SE PROHÍBEN ESTRICTAMENTE TAPONES DE METAL.' 
                };

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-[2rem] overflow-hidden transition-all border-2 ${
                  isPendingApproval 
                    ? 'border-[#FF9100] bg-gradient-to-b from-[#181512] to-[#121414] shadow-[0_4px_30px_rgba(255,145,0,0.15)]' 
                    : isPendingPayment 
                      ? 'border-red-500/30 bg-[#121414]' 
                      : 'border-white/5 bg-[#141616]'
                }`}
              >
                {/* Court header accent background bar */}
                <div className={`h-1 w-full ${
                  isPendingApproval ? 'bg-[#FF9100]' : 
                  isPendingPayment ? 'bg-red-500/50' : 'bg-[#4be277]/50'
                }`} />

                <div className="p-5 space-y-4.5">
                  {/* Title & Status Badge Row */}
                  <div className="flex flex-col gap-3 min-w-0 w-full text-left">
                    <div className="flex flex-row justify-between items-start gap-2.5 w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                          <Clock className="w-5 h-5 text-[#FF9100]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white text-xs font-black uppercase tracking-widest leading-none">
                            {booking.date}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider block text-[#4be277] mt-1.5 leading-none flex items-center gap-1">
                            {isCancha1 ? <Activity className="w-3 h-3 text-[#4be277] shrink-0" /> : <Layers className="w-3 h-3 text-amber-400 shrink-0" />}
                            {isCancha1 ? "Cancha 1 • El Maracaná" : "Cancha 2 • La Bombonera"}
                          </span>
                          <span className="text-[10px] font-black text-[#FF9100] uppercase italic tracking-wider leading-none bg-[#FF9100]/10 px-2 py-1 mt-1.5 rounded inline-flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-[#FF9100] shrink-0" /> {booking.time} Hs
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-right border shrink-0 flex items-center gap-1 ${
                        isUpcoming 
                          ? (isDeposit ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277]') 
                          : isPendingApproval ? 'bg-[#FF9100]/10 border-[#FF9100]/20 text-[#FF9100] animate-pulse' 
                          : isPendingPayment ? (booking.payment_method === 'cash' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-red-500/10 border-red-500/20 text-red-500') 
                          : 'bg-white/5 border-white/10 text-[#bccbb9]'
                      }`}>
                        {isUpcoming && <Check className={`w-2.5 h-2.5 shrink-0 ${isDeposit ? 'text-purple-400' : 'text-[#4be277]'}`} />}
                        {isPendingApproval && <AlertTriangle className="w-2.5 h-2.5 text-[#FF9100] shrink-0 animate-pulse" />}
                        {isPendingPayment && <Clock className="w-2.5 h-2.5 text-red-400 shrink-0" />}
                        {isUpcoming 
                          ? (isDeposit ? 'SEÑADO • SALDO EN PUERTA' : 'PAGO COMPLETO CONFIRMADO') 
                          : isPendingApproval ? (isDeposit ? 'SEÑA POR VALIDAR' : 'APROBACIÓN PENDIENTE') 
                          : isPendingPayment ? (booking.payment_method === 'cash' ? 'POR CONFIRMAR EN PUERTA' : (isDeposit ? 'SEÑA PENDIENTE' : 'PAGO PENDIENTE')) 
                          : 'FINALIZADO'}
                      </div>
                    </div>

                    {/* Court visual detail expansion - direct detail without truncation */}
                    <div className="bg-[#121414]/90 rounded-2xl p-3.5 border border-white/5 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11.5px] font-black text-white uppercase italic tracking-wide">
                          {courtDetail.name}
                        </span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider border leading-none shrink-0 flex items-center gap-1 ${courtDetail.tagStyle}`}>
                          {isCancha1 ? <Activity className="w-2.5 h-2.5 shrink-0" /> : <Layers className="w-2.5 h-2.5 shrink-0" />}
                          {courtDetail.tag}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#bccbb9]/85 font-medium uppercase tracking-wide leading-relaxed">
                        {courtDetail.rules}
                      </p>
                      
                      <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 text-left">
                        <span className="text-[7.5px] font-black text-[#4be277] uppercase tracking-wider block">⚽ EQUIPAMIENTO INCLUIDO EN EL TURNO</span>
                        <p className="text-[8.5px] text-zinc-300 font-bold uppercase tracking-wide leading-snug">
                          La pelota oficial de juego y 6 chaquetas distintivas están incluidas con el pago total de tu reserva confirmada.
                        </p>
                        <p className="text-[7.5px] text-[#4be277]/95 font-semibold uppercase tracking-wide leading-snug">
                          ⚠️ Se agradece retornar la pelota y las chaquetas a la recepción al finalizar el partido tal como fueron entregadas en mano.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Player and Cost Panel: Highlighted beautifully */}
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center shrink-0">
                          {getUserAvatar(booking.user) ? (
                            <img src={getUserAvatar(booking.user)} alt={booking.user} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-[#bccbb9]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[7.5px] font-bold text-[#bccbb9]/60 uppercase block tracking-widest leading-none mb-1">
                            {isAdmin ? 'JUGADOR RESERVANTE' : 'MI REGISTRO'}
                          </span>
                          <span className="text-xs font-black text-white uppercase italic truncate block">
                            {booking.user}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="text-[7.5px] font-bold text-[#bccbb9]/60 uppercase block tracking-widest leading-none mb-1">
                          {isDeposit ? 'Plan de Pago Seña' : 'Costo Total'}
                        </span>
                        {isDeposit ? (
                          <div className="text-right space-y-0.5">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-[9px] font-bold text-zinc-400">Total Turno + Extras:</span>
                              <span className="text-[11px] font-black text-white leading-none">{booking.amount || '$ 125.00'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-[9px] font-black text-purple-400">Seña pagada:</span>
                              <span className="text-[11px] font-black text-purple-400 leading-none">$ {paidAmount}</span>
                            </div>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 rounded border border-red-500/20 justify-end mt-1">
                              <span className="text-[8px] font-black text-red-500 uppercase tracking-wider">Por cobrar en cancha:</span>
                              <span className="text-xs font-black text-red-400 font-display italic leading-none">$ {pendingBalance}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-black text-[#4be277] font-display italic">
                            {booking.amount || '$ 125.00'}
                          </span>
                        )}
                      </div>
                    </div>

                    {booking.extras && booking.extras.length > 0 && (
                      <div className="pt-2.5 border-t border-white/5 text-left space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[7.5px] font-black text-[#FF9100] uppercase tracking-[0.24em] block leading-none">
                            ★ CONSUMOS EXTRAS
                          </span>
                          <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded font-mono flex items-center gap-1 ${
                            booking.extras_delivered 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse'
                          }`}>
                            {booking.extras_delivered ? <Check className="w-2.5 h-2.5 shrink-0" /> : <Package className="w-2.5 h-2.5 shrink-0 animate-pulse" />}
                            {booking.extras_delivered ? 'ENTREGADO' : 'PENDIENTE'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 leading-none">
                          {booking.extras.map((extra: string, idx: number) => (
                            <span key={idx} className="text-[8px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {extra}
                            </span>
                          ))}
                        </div>
                        {isAdmin && !booking.extras_delivered && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExtrasDelivered(booking.id);
                            }}
                            className="mt-1 w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[7.5px] font-bold uppercase tracking-widest py-1 rounded transition-colors"
                          >
                            Marcar como Entregado en Puerta/Cantina
                          </button>
                        )}
                      </div>
                    )}

                    {/* CONDITIONAL PAYMENT TICKET IN CARD (CASH / MERCADO PAGO / TRANSFER) */}
                    {booking.payment_method === 'cash' ? (
                      <div className="pt-3 border-t border-white/5 space-y-2.5">
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.25em] block leading-none flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" /> TICKET DE COBRO EN EFECTIVO (PUERTA)
                        </span>
                        
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#121414] to-[#1a1c1c] border border-amber-500/20 p-4 shadow-xl">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF9100]/5 rounded-full blur-2xl pointer-events-none" />
                          
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-0.5 text-left">
                              <span className="text-[7px] font-black text-amber-400 uppercase tracking-widest block leading-none">ABONO FÍSICO PRESENCIAL</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black text-white italic tracking-wide">PAGO EN PUERTA</span>
                              </div>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded leading-none flex items-center gap-1 ${
                              booking.status === 'upcoming' 
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                                : 'bg-red-500/15 border border-red-500/30 text-red-400 animate-pulse'
                            }`}>
                              {booking.status === 'upcoming' ? <Check className="w-2.5 h-2.5 shrink-0" /> : <Clock className="w-2.5 h-2.5 shrink-0" />}
                              {booking.status === 'upcoming' ? 'PAGADO EN PUERTA' : 'POR COBRAR'}
                            </span>
                          </div>
                          
                          <div className="p-3 bg-black/60 rounded-xl space-y-2 border border-white/5 text-left">
                            <p className="text-[9.5px] text-[#bccbb9]/85 font-medium uppercase tracking-wide leading-relaxed">
                              {booking.status === 'upcoming' 
                                ? 'Cobrado formalmente en la administración del complejo deportivo.' 
                                : 'El jugador seleccionó pagar en efectivo. Se debe cobrar el total a la llegada del equipo al complejo.'}
                            </p>
                            <div className="flex justify-between items-center text-[9px] pt-2 border-t border-white/5 leading-none">
                              <span className="text-[#bccbb9]/40 font-bold uppercase">IMPORTE A RECAUDAR:</span>
                              <span className="text-xs font-black text-amber-400 font-display italic">{booking.amount || '$ 125.00'}</span>
                            </div>
                          </div>

                          {isAdmin && booking.status !== 'upcoming' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAllBookings((prev: any) => prev.map((b: any) => 
                                  b.id === booking.id ? { ...b, status: 'upcoming' } : b
                                ));
                                showToast('¡Turno cobrado en efectivo y validado con éxito!', 'success');
                              }}
                              className="mt-3 w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/50 text-amber-500 font-black text-[9px] uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 select-none"
                            >
                              <Check className="w-3 h-3 text-amber-500 shrink-0" /> Cobrado en administración (Validar Turno)
                            </button>
                          )}
                        </div>
                      </div>
                    ) : booking.payment_method === 'mercadopago' ? (
                      <div className="pt-3 border-t border-white/5 space-y-2.5">
                        <span className="text-[8px] font-black text-[#009EE3] uppercase tracking-[0.25em] block leading-none flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-[#009EE3] shrink-0 animate-pulse" /> TICKET DIGITAL AUTOMÁTICO MERCADO PAGO
                        </span>
                        
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c161d] to-[#121414] border border-[#009EE3]/20 p-4 shadow-xl">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#009EE3]/5 rounded-full blur-2xl pointer-events-none" />
                          
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-0.5 text-left">
                              <span className="text-[7px] font-black text-[#009EE3] uppercase tracking-widest block leading-none">PAGO ELECTRÓNICO INSTANTÁNEO</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black text-white italic tracking-wide">MERCADO PAGO PASS</span>
                              </div>
                            </div>
                            <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded leading-none uppercase shrink-0 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> APROBADO ON-LINE
                            </span>
                          </div>
                          
                          <div className="p-3 bg-black/60 rounded-xl space-y-2 border border-white/5 text-left text-[9px] font-sans">
                            <div className="flex justify-between items-center leading-none">
                              <span className="text-[#bccbb9]/40 font-bold uppercase">ID TRANSACCIÓN MP:</span>
                              <span className="text-white font-mono font-bold">{booking.mp_payment_id || 'mp_3810291'}</span>
                            </div>
                            <div className="flex justify-between items-center leading-none mt-1">
                              <span className="text-[#bccbb9]/40 font-bold uppercase">MÉTODO DE PAGO:</span>
                              <span className="text-[#009EE3] font-black italic uppercase">{booking.mp_card_brand || 'Simulada'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/5 font-bold leading-none mt-2">
                              <span className="text-[#bccbb9]/40 uppercase text-[8px]">MONTO NETO RECAUDADO:</span>
                              <span className="text-xs font-black text-[#4be277] font-display italic">{booking.amount || '$ 125.00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-white/5 space-y-2.5 text-left">
                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-[0.25em] block leading-none flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" /> TICKET DIGITAL DE TRANSFERENCIA (YAPE / PLIN)
                        </span>
                        
                        {!hasReceipt ? (
                          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#12121e] to-[#0d0d18] border border-purple-500/20 border-dashed p-4 shadow-xl text-left space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <span className="text-[7px] font-black text-purple-400 uppercase tracking-widest block leading-none">DATOS DEL DEPÓSITO</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                  <span className="text-[10px] font-black text-white italic tracking-wide">COMPROBANTE PENDIENTE</span>
                                </div>
                              </div>
                              <span className="text-[8px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded leading-none">
                                Op. Pendiente
                              </span>
                            </div>

                            <div className="p-3 bg-[#1a0033]/40 rounded-xl space-y-2.5 border border-purple-500/10">
                              <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/25 rounded-lg flex justify-between items-center text-left">
                                <span className="text-[8.5px] font-black text-purple-300 uppercase tracking-wider block">VALOR A TRANSFERIR AHORA:</span>
                                <span className="text-sm font-black text-white font-mono italic">
                                  $ {isDeposit ? paidAmount?.toFixed(2) : (booking.amount || '$ 120.00')}
                                </span>
                              </div>
                              <p className="text-[7.5px] font-bold text-purple-300/60 uppercase tracking-wide leading-relaxed">
                                {isDeposit ? 'OPCIÓN SEÑA INICIAL: El saldo restante se cancela antes de jugar en la entrada.' : 'PAGO COMPLETO AL 100%: Cubre el total del turno y todos los adicionales solicitados.'}
                              </p>
                              <p className="text-[8.5px] font-black text-purple-300 uppercase tracking-wide leading-relaxed">
                                FORMATOS ACEPTADOS: CAPTURAS, FOTOS (PNG, JPG) O DOCUMENTOS PDF
                              </p>
                              <p className="text-[9px] text-[#bccbb9]/85 font-semibold uppercase tracking-wide leading-relaxed">
                                Realiza el envío antes de tu partido y adjunta el comprobante para habilitar el turno:
                              </p>
                              <div className="space-y-1 font-mono text-[9px] text-zinc-300">
                                <div className="flex justify-between items-center bg-black/40 px-2 py-1 rounded">
                                  <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-purple-400 shrink-0" /> YAPE / PLIN:</span>
                                  <span className="text-purple-300 font-black">+51 987 654 321</span>
                                </div>
                                <div className="flex justify-between items-center bg-black/40 px-2 py-1 rounded">
                                  <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-[#009EE3] shrink-0" /> BANCO BCP:</span>
                                  <span className="text-[#009EE3] font-black">191-98765432-0-11</span>
                                </div>
                                <div className="text-[7.5px] text-zinc-400 text-right uppercase">
                                  CCI: 00219119876543201152 • RAMITO COMPLEJO DEPORTIVO
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileUpload(booking.id);
                                }}
                                className="h-10 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 hover:border-purple-500/50 text-purple-300 rounded-xl flex items-center justify-center gap-1.5 font-black text-[8.5px] uppercase tracking-widest transition-all"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                SUBIR COMPROBANTE / PDF
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSimulateReceipt(booking.id);
                                }}
                                className="h-10 bg-white/[0.04] border border-[#FF9100]/30 hover:bg-white/[0.08] text-white rounded-xl flex items-center justify-center gap-1.5 font-black text-[8.5px] uppercase tracking-widest transition-all"
                                title="Generar comprobante digital instantáneo de prueba"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#FF9100] animate-pulse" />
                                Simular Yape
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#12121e] to-[#080812] border border-purple-500/20 p-4 shadow-xl select-none">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-[#4be277]/5 rounded-full blur-xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start mb-3">
                              <div className="space-y-0.5 text-left">
                                <span className="text-[7px] font-black text-purple-400 uppercase tracking-widest block leading-none">TRANSFERENCIA DIGITAL MÓVIL</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#4be277] animate-pulse" />
                                  <span className="text-[10px] font-black text-white italic tracking-wide">YAPE / PLIN / TRANF.</span>
                                </div>
                              </div>
                              <span className="text-[8px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded leading-none">
                                Op. #827{booking.id.substring(0,2) || 'x'}91
                              </span>
                            </div>
                            
                            <div className="p-3 bg-black/50 rounded-xl space-y-2 border border-white/5">
                              <div className="flex justify-between items-center text-[9px] leading-none text-left">
                                <span className="text-[#bccbb9]/50 font-bold uppercase">REMITENTE JUGADOR:</span>
                                <span className="text-white font-black uppercase italic">{booking.user}</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-[9px] leading-none text-left mt-1">
                                <span className="text-[#bccbb9]/50 font-bold uppercase">DESTINATARIO:</span>
                                <span className="text-[#4be277] font-black uppercase">RAMITO FUT SHOW Complejo</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-[9px] pt-2 border-t border-white/5 leading-none text-left mt-2">
                                <span className="text-[#bccbb9]/40 font-bold uppercase">{isDeposit ? 'SEÑA VERIFICADA EN ADM:' : 'IMPORTE COMPLETO VERIFICADO:'}</span>
                                <span className="text-xs font-black text-[#4be277] font-display italic">
                                  {isDeposit ? `$ ${paidAmount}` : (booking.amount || '$ 120.00')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2.5 border-t border-white/5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Mini PDF or image thumbnail inside the ticket */}
                                <div 
                                  onClick={() => {
                                    const receiptObj = { 
                                      ...booking, 
                                      receiptUrl: booking.receiptUrl || 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600' 
                                    };
                                    setViewingBookingReceipt(receiptObj);
                                  }}
                                  className="w-10 h-10 rounded-lg bg-black border border-purple-400/35 overflow-hidden relative cursor-pointer hover:border-purple-300 transition-all shrink-0 flex items-center justify-center group text-center"
                                  title="Ampliar comprobante original"
                                >
                                  {booking.isPdf ? (
                                    <div className="w-full h-full flex items-center justify-center bg-red-950/40 text-red-400">
                                      <FileText className="w-5 h-5 shrink-0" />
                                    </div>
                                  ) : (
                                    <img 
                                      src={booking.receiptUrl || 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600'} 
                                      alt="Captura comprobante" 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="w-3.5 h-3.5 text-white animate-pulse" />
                                  </div>
                                </div>
                                
                                <div className="text-left font-mono leading-tight min-w-0 flex-1">
                                  <span className={`text-[7.5px] font-black uppercase block mb-0.5 flex items-center gap-1 ${booking.isPdf ? 'text-red-400' : 'text-[#4be277]'}`}>
                                    {booking.isPdf ? (
                                      <>
                                        <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" /> DOCUMENTO PDF ADJUNTO
                                      </>
                                    ) : (
                                      <>
                                        <Camera className="w-3.5 h-3.5 text-[#4be277] shrink-0" /> CAPTURA DISPONIBLE
                                      </>
                                    )}
                                  </span>
                                  <span className="text-[7.2px] text-[#bccbb9]/50 block truncate max-w-[120px]" title={booking.isPdf ? (booking.fileName || 'comprobante.pdf') : 'Toca la imagen para previsualizar'}>
                                    {booking.isPdf ? (booking.fileName || 'comprobante.pdf') : 'Toca la imagen para ver'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    const receiptObj = { 
                                      ...booking, 
                                      receiptUrl: booking.receiptUrl || 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600' 
                                    };
                                    setViewingBookingReceipt(receiptObj);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors shrink-0 font-sans"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver Grande
                                </button>
                                <button
                                  onClick={() => handleFileUpload(booking.id)}
                                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all"
                                  title="Subir otra captura de transferencia"
                                >
                                  Cambiar Foto / PDF
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Alert for Players without Receipt */}
                  {!isAdmin && isPendingPayment && (
                    <div className="bg-red-500/5 p-3.5 rounded-xl border border-red-500/10 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-[#bccbb9]/80 uppercase tracking-wide leading-relaxed">
                          Sube tu comprobante de Yape, Plin o transferencia para completar la confirmación de tu turno.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1 Hour limit and No Refund red notice block */}
                  {!isAdmin && (isUpcoming || isPendingApproval || isPendingPayment) && (
                    <div className="bg-red-950/40 p-4 rounded-xl border border-red-500/50 space-y-2">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-2 text-left w-full">
                          <span className="text-[10px] font-black text-red-400 tracking-wider block flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" /> POLÍTICA DE MODIFICACIÓN Y CANCELACIÓN
                          </span>
                          <p className="text-[10px] font-bold text-red-100/90 uppercase tracking-wide leading-relaxed">
                            CUALQUIER ACCIÓN DE CAMBIO DE HORARIO, MODIFICACIÓN O CANCELACIÓN ES PERMITIDA <span className="underline decoration-red-500 text-white font-black">SÓLO HASTA 1 HORA ANTES</span> DE TU TURNO.
                          </p>
                          <div className="bg-red-600 text-white font-black text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.4)] block text-center mt-1 flex items-center justify-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" /> ADVERTENCIA: NO SE REALIZAN DEVOLUCIONES DE DINERO BAJO NINGUNA CIRCUNSTANCIA.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTION TRIGGER BUTTONS ROW: Responsive with wrap to prevent clipping */}
                  <div className="flex flex-col gap-2.5 pt-1">
                    {/* Botón de Reprogramación por Cierre de Emergencia (Fuerza Mayor) */}
                    {emergencyMode && (isUpcoming || isPendingApproval) && (
                      <button 
                        onClick={() => {
                          setReschedulingBooking(booking);
                          setRescheduleDate(booking.date || 'Mayo 25');
                          setRescheduleTime(booking.time || '18:00');
                        }}
                        className="w-full h-12 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 hover:scale-[1.01] active:scale-[0.98] text-black rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest italic transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse"
                      >
                        <Calendar className="w-4 h-4 text-black shrink-0" />
                        Reprogramar por Fuerza Mayor
                      </button>
                    )}

                    {/* Unificado en el ticket digital de transferencia superior */}

                    {/* 2. Elite Administrative Decisions & Validator */}
                    {isAdmin && isPendingApproval && (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button 
                          onClick={() => approvePayment(booking.id)}
                          className="h-11 bg-[#4be277] text-[#121414] rounded-xl flex items-center justify-center gap-1.5 font-black text-[9px] uppercase tracking-wider italic hover:scale-[1.01] active:scale-95 transition-all shadow-[0_4px_15px_rgba(75,226,119,0.2)]"
                        >
                          <Check className="w-4 h-4" />
                          Validar Turno
                        </button>
                        <button 
                          onClick={() => rejectPayment(booking.id)}
                          className="h-11 bg-red-500/15 border border-red-500/25 text-red-400 rounded-xl flex items-center justify-center gap-1.5 font-black text-[9px] uppercase tracking-wider italic hover:bg-red-500 hover:text-black transition-all active:scale-95"
                        >
                          <X className="w-4 h-4" />
                          Rechazar Pago
                        </button>
                      </div>
                    )}

                    {/* Visual Button for Confirmed Tickets */}
                    {isUpcoming && (
                      <button 
                        onClick={() => setViewingOfficialTicket(booking)}
                        className="w-full h-11 bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 hover:from-emerald-500/35 hover:to-emerald-400/20 border border-emerald-500/40 text-emerald-400 rounded-xl flex items-center justify-center gap-2 font-black text-[9.5px] uppercase tracking-widest italic transition-all hover:scale-[1.01]"
                      >
                        <Ticket className="w-4 h-4 text-emerald-400 animate-pulse" />
                        Ver Ticket o Comprobante de Caja
                      </button>
                    )}

                    {/* 3. Social sharing options & Fútbol Split */}
                    {!isAdmin && (isUpcoming || isPendingApproval) && (
                      <button 
                        onClick={() => {
                          const shareText = `¡Reservé un partidazo en Ramito Fut Show!\nTerreno: ${booking.field}\nFecha: ${booking.date}\nHora: ${booking.time}\n¡Prepárate para jugar!`;
                          if (navigator.share) {
                            navigator.share({ title: 'Reserva Ramito Fut Show', text: shareText }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(shareText);
                            showToast('¡Invitación copiada al portapapeles! Envíala por WhatsApp.', 'success');
                          }
                        }}
                        className="w-full h-11 bg-white/[0.04] border border-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest italic transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#FF9100]" />
                        Invitar Amigos por WhatsApp
                      </button>
                    )}

                    {!isAdmin && (isUpcoming || isPendingApproval || isPendingPayment) && (
                      <div className="space-y-1.5">
                        <button 
                          onClick={() => {
                            if (activeSplitBookingId === booking.id) {
                              setActiveSplitBookingId(null);
                            } else {
                              setActiveSplitBookingId(booking.id);
                              setSplitPlayerCount(10);
                            }
                          }}
                          className={`w-full h-11 border rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest italic transition-all cursor-pointer select-none ${
                            activeSplitBookingId === booking.id 
                              ? 'bg-[#4be277]/10 border-[#4be277]/35 text-[#4be277]' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-[#4be277]'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5 text-[#4be277]" />
                          {activeSplitBookingId === booking.id ? 'Ocultar Fútbol Split ❌' : 'Fútbol Split • Dividir Cuenta 💰'}
                        </button>

                        <AnimatePresence>
                          {activeSplitBookingId === booking.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-[#4be277]/[0.02] border border-[#4be277]/15 rounded-2xl p-4 space-y-3 mt-1 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[8.5px] font-black uppercase text-[#bccbb9] tracking-wider">Calculadora Fútbol Split</span>
                                <span className="text-[7.5px] font-black font-mono text-[#4be277] bg-[#4be277]/10 border border-[#4be277]/20 px-2 py-0.5 rounded uppercase tracking-widest">
                                  {isCancha1 ? "Cancha 1" : "Cancha 2"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3 bg-black/50 p-3 rounded-2xl border border-white/5">
                                <div className="flex flex-col gap-0.5 text-left">
                                  <span className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-none">Total Jugadores</span>
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setSplitPlayerCount(p => Math.max(2, p - 1))}
                                      className="w-7 h-7 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-white font-black text-xs flex items-center justify-center transition-all cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-black font-mono text-white w-6 text-center">{splitPlayerCount}</span>
                                    <button
                                      type="button"
                                      onClick={() => setSplitPlayerCount(p => Math.min(22, p + 1))}
                                      className="w-7 h-7 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-white font-black text-xs flex items-center justify-center transition-all cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[7px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block leading-none mb-1">Cuota por Jugador</span>
                                  <span className="text-xs font-black text-[#4be277] font-mono block leading-none">
                                    S/. {Math.ceil(((() => {
                                      const amt = booking.amount || '';
                                      let cleaned = amt;
                                      if (cleaned.includes('.')) {
                                        const parts = cleaned.split('.');
                                        if (parts[parts.length - 1] === '00' || parts[parts.length - 1].length === 2) {
                                          parts.pop();
                                          cleaned = parts.join('');
                                        }
                                      }
                                      const digitsOnly = cleaned.replace(/\D/g, '');
                                      const val = parseInt(digitsOnly, 10);
                                      return isNaN(val) ? 35000 : val;
                                    })() / splitPlayerCount)).toLocaleString('es-PE')}
                                  </span>
                                  <span className="text-[6px] font-bold text-[#bccbb9]/30 uppercase tracking-tight block mt-1">
                                    Neto unitario exacto
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const isCourt1 = booking.field?.toUpperCase().includes('CANCHA 1') || booking.field?.toUpperCase().includes('MARACANÁ') || !booking.field?.toUpperCase().includes('CANCHA 2');
                                  const cName = isCourt1 ? 'Cancha 1 • El Maracaná 🏟️' : 'Cancha 2 • La Bombonera 🏟️';
                                  
                                  const amt = booking.amount || '';
                                  let cleaned = amt;
                                  if (cleaned.includes('.')) {
                                    const parts = cleaned.split('.');
                                    if (parts[parts.length - 1] === '00' || parts[parts.length - 1].length === 2) {
                                      parts.pop();
                                      cleaned = parts.join('');
                                    }
                                  }
                                  const digitsOnly = cleaned.replace(/\D/g, '');
                                  const totalAmountVal = isNaN(parseInt(digitsOnly, 10)) ? 35000 : parseInt(digitsOnly, 10);
                                  const perPlayerShare = Math.ceil(totalAmountVal / splitPlayerCount);
                                  
                                  const shareAmountStr = `S/. ${perPlayerShare.toLocaleString('es-PE')}`;
                                  const totalCostStr = `S/. ${totalAmountVal.toLocaleString('es-PE')}`;
                                  
                                  const textMsg = `¡Muchachos! Ya tenemos reservada la cancha: *${cName}* 🏟️\n🗓️ *Fecha*: ${booking.date}\n⏰ *Horario*: ${booking.time} hs\n\nSomos *${splitPlayerCount}* jugadores en total, por lo que nos toca pagar *${shareAmountStr}* a cada uno para la cancha. 💰 ¡No falten! ⚽🏆\n\n📲 *Pagar vía Yape/Plin* al número: *${adminPhone}*\n\n_(Monto total: ${totalCostStr})_\n_Enviado desde Ramito Fut Show_`;
                                  
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(textMsg);
                                    showToast(`¡Fútbol Split copiado para ${splitPlayerCount} jugadores! Pegalo en tu grupo.`, 'success');
                                  } else {
                                    showToast('No se pudo copiar el texto automáticamente.', 'error');
                                  }
                                }}
                                className="w-full h-10 rounded-xl bg-[#4be277] text-black font-black text-[8.5px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(75,226,119,0.2)] hover:opacity-95"
                              >
                                <DollarSign className="w-3.5 h-3.5 font-bold" /> Copiar Cuota del Equipo (WhatsApp Split)
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 4. Secondary actions (e.g., cancel reservation or see location info) */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setViewingCourtDetails(booking)}
                        className="flex-grow h-10 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-center text-[#bccbb9] font-black text-[8.5px] uppercase tracking-widest italic hover:bg-white/5 transition-all"
                      >
                        Detalles Cancha
                      </button>
                      
                      {isUpcoming && (
                        <button 
                          onClick={() => {
                            try {
                              const [hoursStr, minutesStr] = booking.time.split(':');
                              const targetHour = parseInt(hoursStr, 10);
                              const targetMinute = parseInt(minutesStr, 10);

                              let bookingDate = new Date();
                              const dateParts = booking.date.match(/(\d+)[/-](\d+)[/-](\d+)/);
                              if (dateParts) {
                                const day = parseInt(dateParts[1], 10);
                                const month = parseInt(dateParts[2], 10) - 1;
                                const year = parseInt(dateParts[3], 10);
                                bookingDate = new Date(year, month, day, targetHour, targetMinute);
                              } else {
                                const dayMatch = booking.date.match(/\d+/);
                                if (dayMatch) {
                                  const day = parseInt(dayMatch[0], 10);
                                  bookingDate.setDate(day);
                                }
                                bookingDate.setHours(targetHour, targetMinute, 0, 0);
                              }

                              const now = new Date();
                              const diffMs = bookingDate.getTime() - now.getTime();
                              const diffHrs = diffMs / (1000 * 60 * 60);

                              if (diffHrs < 1) {
                                alert("✖ ACCIÓN BLOQUEADA POR NORMATIVA:\n\nSÓLO SE PUEDEN CAMBIAR DE HORARIO, MODIFICAR O CANCELAR TURNOS RESERVADOS HASTA 1 HORA ANTES DEL INICIO.\n\nADVERTENCIA EXTREMA: NO SE REALIZARÁN DEVOLUCIONES DE DINERO BAJO NINGUNA CIRCUNSTANCIA.");
                                return;
                              }
                            } catch (error) {
                              console.error(error);
                            }

                            if (confirm('🚨 EN COMPLIANCE CON LAS POLÍTICAS:\n¿Estás seguro de que deseas cancelar esta reserva?\n\nRecuerda: Solo se permiten cancelaciones hasta 1 hora antes de la reserva. ¡NO SE REALIZA DEVOLUCIÓN DE DINERO BAJO NINGUNA CIRCUNSTANCIA!')) {
                              setAllBookings((prev: any) => prev.map((b: any) => 
                                b.id === booking.id ? { ...b, status: 'cancelled' } : b
                              ));
                              showToast('Reserva cancelada con éxito.', 'success');

                              try {
                                const savedWaitlists = localStorage.getItem('ramito_waitlists');
                                if (savedWaitlists) {
                                  const waitlistItems = JSON.parse(savedWaitlists);
                                  const cleanField = booking.field.split('•')[0].trim();
                                  
                                  const matches = waitlistItems.filter((w: any) => {
                                    const sameTime = w.time === booking.time;
                                    const wFieldClean = w.field.split('•')[0].trim();
                                    const sameField = wFieldClean === cleanField;
                                    
                                    const bDayStr = booking.date.match(/\d+/)?.[0] || '24';
                                    const wDayStr = (w.date || '').match(/\d+/)?.[0] || '24';
                                    const sameDay = bDayStr === wDayStr;
                                    
                                    return sameTime && sameField && sameDay;
                                  });

                                  if (matches.length > 0) {
                                    const newAlerts = matches.map((m: any) => ({
                                      id: `wl_alert_${Date.now()}_${Math.random()}`,
                                      title: 'TURNO LIBERADO (Lista de Espera)',
                                      body: `¡Atención ${m.user}! El turno de las ${booking.time} hs el día ${booking.date} en "${booking.field}" de tu lista de espera se ha liberado y ya está disponible para reservar de inmediato.`,
                                      time: 'Hace un instante',
                                      read: false
                                    }));

                                    setNotifications((existing: any[]) => [...newAlerts, ...(existing || [])]);
                                  }
                                }
                              } catch (err) {
                                console.error("Error trigger waitlists: ", err);
                              }
                            }
                          }}
                          className="px-3 h-10 bg-red-500/5 text-red-400 border border-red-500/10 hover:bg-red-500 hover:text-black rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    )}

      {/* Fullscreen Interactive Receipt Review Modal for Elite Admins */}
      <AnimatePresence>
        {reschedulingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#141616] border border-white/15 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 sm:p-8 space-y-6 text-left"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[8px] font-black tracking-widest text-[#FF9100] uppercase bg-[#FF9100]/10 border border-[#FF9100]/20 px-2 py-0.5 rounded-full inline-block mb-2">
                    🔄 REPROGRAMACIÓN DE EMERGENCIA
                  </span>
                  <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tight">
                    Camino de Fuerza Mayor
                  </h3>
                  <p className="text-[10px] text-[#bccbb9]/60 uppercase tracking-wide mt-1 font-bold">
                    Elige la nueva fecha libre para tu partido en {reschedulingBooking.field}
                  </p>
                </div>
                <button
                  onClick={() => setReschedulingBooking(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informative advice */}
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[9.5px] uppercase font-bold text-red-200/90 tracking-wide leading-relaxed">
                  Debido al cierre preventivo, se te habilita excepcionalmente a reprogramar este turno para cualquier nuevo día de juego de forma 100% gratuita. No se alterarán tus consumos adicionales.
                </p>
              </div>

              {/* Step 1: Date selections */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-[#FF9100] tracking-wider block">
                  1. FECHA DE REPROGRAMACIÓN
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                  {[
                    { name: 'Lun 24', val: 'Mayo 24' },
                    { name: 'Mar 25', val: 'Mayo 25' },
                    { name: 'Mié 26', val: 'Mayo 26' },
                    { name: 'Jue 27', val: 'Mayo 27' },
                    { name: 'Vie 28', val: 'Mayo 28' },
                    { name: 'Sáb 29', val: 'Mayo 29' },
                    { name: 'Dom 30', val: 'Mayo 30' },
                  ].map((d) => {
                    const active = rescheduleDate === d.val;
                    return (
                      <button
                        key={d.val}
                        onClick={() => setRescheduleDate(d.val)}
                        className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all shrink-0 ${
                          active 
                            ? 'bg-[#FF9100] border-[#FF9100] text-black shadow-lg shadow-[#FF9100]/25 font-bold' 
                            : 'bg-black/40 border-white/5 text-[#bccbb9]/80 hover:border-white/10'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Time Slots selections */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-[#FF9100] tracking-wider block">
                  2. HORARIO DE JUEGO (SLOT DE 1 HORA)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
                  ].map((t) => {
                    const active = rescheduleTime === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setRescheduleTime(t)}
                        className={`py-2 text-[10px] font-black tracking-widest rounded-xl border transition-all ${
                          active 
                            ? 'bg-gradient-to-r from-red-500 to-amber-500 text-black border-none font-black shadow-md' 
                            : 'bg-black/40 border-white/5 text-[#bccbb9] hover:border-white/15'
                        }`}
                      >
                        {t} Hs
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-4 bg-black/60 rounded-2xl border border-white/5 space-y-1.5 text-left">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-[#bccbb9]/40 leading-none">
                  <span>Partido reprogramado a:</span>
                  <span>Confirmación en vivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase italic">
                    {reschedulingBooking.field}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase italic font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg ml-auto shrink-0 animate-pulse">
                    {rescheduleDate} • {rescheduleTime} Hs
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setReschedulingBooking(null)}
                  className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white font-black text-[9.5px] uppercase tracking-widest rounded-xl transition-all border border-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRescheduleBooking(reschedulingBooking.id, rescheduleDate, rescheduleTime)}
                  className="flex-1 h-12 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 hover:scale-[1.01] active:scale-[0.98] text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl"
                >
                  Confirmar Nueva Fecha ➔
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {viewingBookingReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-zinc-950 flex flex-col w-full h-screen max-h-screen overflow-hidden select-none"
          >
            {/* Ambient glows behind fullscreen content */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative w-full max-w-7xl mx-auto flex flex-col pt-3 pb-3 px-4 md:pt-4 md:pb-4 md:px-8 h-full max-h-screen flex-grow justify-between min-h-0 overflow-hidden">
              
              {/* Header block */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white uppercase tracking-wider italic">
                      {isAdmin ? "CONSOLA DE VALIDACIÓN DE COMPROBANTES" : "DETALLE DEL COMPROBANTE CARGADO"}
                    </h4>
                    <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      {isAdmin ? "OPERACIONES DE REVISIÓN Y REGISTRO EN TIEMPO REAL - SISTEMA ELITE" : "ESTADO DE REVISIÓN Y COORDINACIÓN DE TURNO"}
                    </span>
                  </div>
                </div>
                
                {/* Safe Close X Button */}
                <button 
                  onClick={() => setViewingBookingReceipt(null)}
                  className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-all active:scale-95"
                  title="Regresar a reservas"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Central split layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch flex-grow min-h-0 mb-3 h-[calc(100vh-140px)] overflow-hidden">
                
                {/* Left: Beautiful large scaled receipt preview */}
                <div className="lg:col-span-7 flex flex-col bg-black/40 border border-white/5 p-4 rounded-[2rem] justify-center items-center relative overflow-hidden h-[45vh] lg:h-full">
                  <div className="absolute top-3 left-6">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block italic">
                      {viewingBookingReceipt.isPdf ? '📄 DOCUMENTO PDF INTERACTIVO' : '📸 CAPTURA ORIGINAL CARGADA POR JUGADOR'}
                    </span>
                  </div>
                  
                  <div className="w-full flex-grow flex items-center justify-center py-4 min-h-0 overflow-hidden">
                    {viewingBookingReceipt.isPdf ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-zinc-955/65 rounded-[2rem] border border-red-500/15 max-w-sm text-center space-y-5 shadow-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-bounce">
                          <FileText className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-sm font-black text-white block uppercase tracking-wider">Documento PDF Adjunto</span>
                          <span className="text-[10px] text-zinc-400 font-mono block truncate max-w-[240px]" title={viewingBookingReceipt.fileName || 'comprobante.pdf'}>
                            {viewingBookingReceipt.fileName || 'comprobante.pdf'}
                          </span>
                        </div>
                        <a 
                          href={viewingBookingReceipt.receiptUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(239,68,68,0.35)] flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          ABRIR COMPROBANTE PDF
                        </a>
                      </div>
                    ) : (
                      <img 
                        src={viewingBookingReceipt.receiptUrl || 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600'} 
                        alt="Comprobante original" 
                        className="max-w-full max-h-[35vh] lg:max-h-[62vh] rounded-2xl object-contain border border-white/10 shadow-3xl select-all hover:scale-[1.01] transition-transform duration-300 pointer-events-auto"
                      />
                    )}
                  </div>

                  <div className="w-full text-center mt-2 shrink-0">
                    <span className="text-[8px] font-bold text-[#bccbb9]/40 tracking-widest uppercase mb-1 block">
                      EL SISTEMA PERMITE VISUALIZAR CAPTURAS DIRECTAS O DESCARGAR PDFS SEGURAS
                    </span>
                    <span className="text-[8px] font-bold text-[#bccbb9]/40 tracking-widest uppercase block">
                      Deslice o pellizque la imagen para ampliar en dispositivos móviles si es necesario
                    </span>
                  </div>
                </div>

                {/* Right: Validation metadata and actions panel */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-900/30 border border-white/5 p-4 md:p-5 rounded-[2rem] relative overflow-y-auto no-scrollbar min-h-0 lg:max-h-full">
                  <div className="space-y-4">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider block italic">
                      {isAdmin ? '📋 METADATOS Y REVISIÓN ADMINISTRATIVA' : '📋 DETALLES DE TRANSACCIÓN Y COMPROBANTE'}
                    </span>

                    {/* Metadata fields stacked details list */}
                    <div className="space-y-3">
                      
                      {/* Remitente block */}
                      <div className="bg-black/40 rounded-2xl p-3 border border-white/5 flex gap-3 items-center text-left">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                          <User className="w-4.5 h-4.5 text-purple-400" />
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-[#bccbb9]/40 tracking-wider block uppercase">CLIENTE / JUGADOR</span>
                          <span className="text-xs font-black text-white uppercase italic tracking-wide mt-0.5 block">
                            {viewingBookingReceipt.user}
                          </span>
                        </div>
                      </div>

                      {/* Contact block with direct WhatsApp Link - Only visible to Admins as requested */}
                      {isAdmin && (
                        <div className="bg-black/40 rounded-2xl p-3 border border-white/5 flex gap-3 items-center text-left">
                          <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                            <Share2 className="w-4.5 h-4.5 text-[#4be277]" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="text-[8px] font-black text-[#bccbb9]/40 tracking-wider block uppercase">CONTACTO DEL JUGADOR</span>
                            <span className="text-xs font-black text-white uppercase tracking-wide mt-0.5 block truncate">
                              {viewingBookingReceipt.phone || '+51 987 654 321'}
                            </span>
                          </div>
                          <a 
                            href={`https://wa.me/${(viewingBookingReceipt.phone || '51987654321').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-[#4be277]/10 hover:bg-[#4be277] text-[#4be277] hover:text-black font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                          >
                            Chat
                          </a>
                        </div>
                      )}

                      {/* Cancha block */}
                      <div className="bg-black/40 rounded-2xl p-3 border border-white/5 flex gap-3 items-center text-left">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4.5 h-4.5 text-pink-400" />
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-[#bccbb9]/40 tracking-wider block uppercase">CANCHA RESERVADA</span>
                          <span className="text-xs font-black text-white uppercase tracking-wide mt-0.5 block">
                            {viewingBookingReceipt.field}
                          </span>
                        </div>
                      </div>

                      {/* Fecha y hora block */}
                      <div className="bg-black/40 rounded-2xl p-3 border border-white/5 flex gap-3 items-center text-left">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Clock className="w-4.5 h-4.5 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-[#bccbb9]/40 tracking-wider block uppercase">FORMA Y HORARIO JUEGO</span>
                          <span className="text-xs font-black text-amber-400 uppercase tracking-wide mt-0.5 block">
                            {viewingBookingReceipt.date} • {viewingBookingReceipt.time} Hs
                          </span>
                        </div>
                      </div>

                      {/* Importe block - Restructured beautifully without compression */}
                      <div className="bg-[#4be277]/5 rounded-2xl p-4 border border-[#4be277]/15 flex flex-col justify-center items-center text-center space-y-2.5">
                        <div className="text-center w-full">
                          <span className="text-[10px] font-black text-[#4be277] uppercase tracking-[0.25em] block">IMPORTE DECLARADO</span>
                          <span className="text-[8px] text-[#bccbb9]/30 font-black uppercase tracking-widest block mt-0.5">Sincronizado vía Plataforma</span>
                        </div>
                        
                        <div className="font-mono text-[9px] text-[#4be277]/80 bg-[#4be277]/10 border border-[#4be277]/15 px-3 py-1 rounded-xl uppercase tracking-wider font-bold">
                          Transacción: Op. #{viewingBookingReceipt.id?.substring(0, 6).toUpperCase() || '827X91'}
                        </div>

                        <div>
                          <span className="text-3xl font-black text-[#4be277] italic font-display tracking-tight block">
                            {viewingBookingReceipt.amount || 'S/. 120.00'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions for VIP Admin - Only visible to admin */}
                  {isAdmin && (
                    <div className="pt-3 border-t border-white/5 mt-3 space-y-2.5 shrink-0">
                      {viewingBookingReceipt.status === 'pending_approval' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              approvePayment(viewingBookingReceipt.id);
                              setViewingBookingReceipt(null);
                            }}
                            className="h-12 bg-[#4be277] text-black hover:opacity-90 rounded-2xl font-black text-[9.5px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(75,226,119,0.35)]"
                          >
                            <Check className="w-4 h-4 text-black" /> Validar y Confirmar Turno
                          </button>
                          <button 
                            onClick={() => {
                              rejectPayment(viewingBookingReceipt.id);
                              setViewingBookingReceipt(null);
                            }}
                            className="h-12 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-black rounded-2xl font-black text-[9.5px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" /> Rechazar Comprobante
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-white/[0.02] border border-white/5 text-center rounded-2xl">
                          <p className="text-[9.5px] font-black text-[#4be277] uppercase tracking-widest italic flex items-center justify-center gap-1.5">
                            ✓ TURNO YA VERIFICADO Y SINCRONIZADO EN SISTEMA
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>

              {/* Bottom Graceful close button */}
              <div className="pt-3 border-t border-white/5 shrink-0">
                <button 
                  onClick={() => setViewingBookingReceipt(null)}
                  className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-black text-[9.5px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> REGRESAR A CONSOLA PRINCIPAL SIN CAMBIOS
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* Fullscreen Interactive Official Verified Thermal Ticket Modal */}
        {viewingOfficialTicket && (() => {
          const isMP = viewingOfficialTicket.payment_method === 'mercadopago';
          const isCash = viewingOfficialTicket.payment_method === 'cash';
          const isTransfer = viewingOfficialTicket.payment_method === 'transfer';
          
          const bookingId = viewingOfficialTicket.id || 'abcde';
          const formattedId = `OP-TKT-${bookingId.substring(0, 5).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          
          let paymentMethodLabel = 'Transferencia Validada';
          let paymentSubClass = 'text-purple-600 bg-purple-50';
          let paymentBrandDetail = 'Banco BCP / Yape / Plin';
          if (isMP) {
            paymentMethodLabel = 'Mercado Pago On-Line';
            paymentSubClass = 'text-[#009EE3] bg-[#00a1e4]/10';
            paymentBrandDetail = 'Mercado Pago Pass Verified';
          } else if (isCash) {
            paymentMethodLabel = 'Efectivo en Puerta';
            paymentSubClass = 'text-amber-600 bg-amber-50';
            paymentBrandDetail = 'Cobro Físico Administración';
          }

          const isCancha1 = viewingOfficialTicket.field?.toUpperCase().includes('CANCHA 1') || viewingOfficialTicket.field?.toUpperCase().includes('MARACANÁ') || viewingOfficialTicket.field?.toUpperCase().includes('MONUMENTAL') || !viewingOfficialTicket.field?.toUpperCase().includes('CANCHA 2');
          const courtTitle = isCancha1 ? 'Cancha 1 • El Maracaná' : 'Cancha 2 • La Bombonera';
          const surfaceType = isCancha1 ? 'CÉSPED SINTÉTICO' : 'TIERRA COMPACTADA';

          const handleSimulatePrint = () => {
            setIsSimulatingPrint(true);
            setTimeout(() => {
              setIsSimulatingPrint(false);
              showToast('¡Imprimiendo copia física de auditoría en la ticketera del complejo!', 'success');
            }, 2500);
          };

          const handleTriggerDownload = () => {
            setIsSimulatingDownload(true);
            setTimeout(() => {
              setIsSimulatingDownload(false);
              
              const receiptText = `
=========================================
          RAMITO FUT SHOW          
      COMPLEJO DEPORTIVO ELITE     
=========================================
RUC: 20491827401
Caja ID: CAJA-AUTOMATICA-02
Ubicación: Jr. Áncash 1240, Cercado de Lima
Contacto Técnico: +51 987 654 321
Fecha Emisión: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}

TICKET DE CAJA: ${formattedId}
ESTADO DE AUDITORÍA: ✓ VERIFICADO / SINCRO-ONLINE

DETALLES DEL TURNO EMITIDO:
-----------------------------------------
CAMPO DE JUEGO: ${courtTitle}
SUPERFICIE: ${surfaceType}
DÍA SELECCIONADO: ${viewingOfficialTicket.date}
HORA PROGRAMADA: ${viewingOfficialTicket.time} Hs
CAPITÁN INSCRIBE: ${viewingOfficialTicket.user || 'Anónimo'}

MÉTODO SELECCIONADO: ${paymentMethodLabel}
PROVEEDOR PAGO: ${paymentBrandDetail}
CONSUMOS ADICIONALES: ${viewingOfficialTicket.extras && viewingOfficialTicket.extras.length > 0 ? viewingOfficialTicket.extras.join(', ') : 'Ninguno'}

-----------------------------------------
SUBTOTAL IMPORTADO: ${viewingOfficialTicket.amount || '$ 120.00'}
TASA ADMINISTRACIÓN: S/. 0.00
-----------------------------------------
TOTAL COBRADO FÍSICO: ${viewingOfficialTicket.amount || '$ 120.00'}

=========================================
   ¡ESTE COMPROBANTE VALIDA TU ACCESO!   
      Presentalo al operador al entrar.
             ¡A ganar, crack!
=========================================
              `;
              const blob = new Blob([receiptText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Ticket_Caja_Ramito_${bookingId.substring(0, 6).toUpperCase()}.txt`;
              link.click();
              URL.revokeObjectURL(url);
              showToast('¡Ticket digital (Modo Auditoría local) guardado en descargas!', 'success');
            }, 1200);
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] bg-zinc-950/98 backdrop-blur-md flex flex-col w-full h-full overflow-y-auto pt-16 pb-4 px-4 md:pt-20 md:pb-8 md:px-8"
            >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF9100]/5 rounded-full blur-[100px] pointer-events-none" />

              <div className="max-w-md mx-auto w-full flex-grow flex flex-col justify-center items-center py-4 relative z-10">
                
                <div className="flex justify-between items-center w-full mb-6 text-left shrink-0">
                  <div>
                    <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-[0.25em] block leading-none">CAJA CENTRAL</span>
                    <h3 className="text-white text-base font-black uppercase italic tracking-wider mt-0.5">COMPROBANTE ELECTRÓNICO</h3>
                  </div>
                  <button 
                    onClick={() => setViewingOfficialTicket(null)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {isSimulatingPrint ? (
                  <div className="w-full flex-grow flex flex-col items-center justify-center min-h-[350px] p-8 text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-emerald-400 animate-spin flex items-center justify-center" />
                      <Printer className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-black text-xs uppercase tracking-widest animate-pulse">ALIMENTANDO TICKET DE CAJA</h4>
                      <p className="text-[#bccbb9]/60 text-[9px] font-bold uppercase tracking-wider leading-relaxed">
                        Conectando con la ticketera térmica principal del complejo...
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ y: 20, scale: 0.98 }}
                    animate={{ y: 0, scale: 1 }}
                    className="w-full bg-white text-zinc-900 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-[28%] -left-3.5 w-7 h-7 rounded-full bg-zinc-950 border border-black/10 z-20" />
                    <div className="absolute top-[28%] -right-3.5 w-7 h-7 rounded-full bg-zinc-950 border border-black/10 z-20" />
                    <div className="absolute top-[68%] -left-3.5 w-7 h-7 rounded-full bg-zinc-950 border border-black/10 z-20" />
                    <div className="absolute top-[68%] -right-3.5 w-7 h-7 rounded-full bg-zinc-950 border border-black/10 z-20" />

                    <div className="p-6 pb-4 text-center border-b border-dashed border-zinc-200">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-3 shadow">
                        <Trophy className="w-7 h-7 text-[#FF9100]" />
                      </div>
                      <h4 className="font-sans font-black text-sm uppercase tracking-wider text-zinc-900 leading-none">
                        RAMITO FUT SHOW
                      </h4>
                      <span className="text-[7.5px] font-black text-zinc-400 uppercase tracking-widest block mt-1 tracking-[0.25em]">
                        COMPLEJO DEPORTIVO ELITE
                      </span>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase mt-2 font-mono">
                        Jr. Áncash 1240, Cercado de Lima <br />
                        RUC: 20491827401 • Telf: +51 987 654 321
                      </p>
                    </div>

                    <div className="px-6 py-1 h-3 flex items-center justify-between text-[7px] font-mono text-zinc-300 pointer-events-none select-none">
                      - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    </div>

                    <div className="px-6 py-4 space-y-3.5 text-left font-mono">
                      <div className="flex justify-between items-start text-[9.5px]">
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-wider block">ID OPERACIÓN CAJA</span>
                          <span className="font-extrabold text-zinc-800 uppercase block">{formattedId}</span>
                        </div>
                        <span className="text-[8.5px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded uppercase leading-none tracking-wide">
                          ✓ VALIDADO OK
                        </span>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-400 uppercase">CAPITÁN JUGANTE:</span>
                          <span className="font-black text-zinc-800 uppercase block max-w-[65%] truncate text-right">
                            {viewingOfficialTicket.user || 'Cliente Registrado'}
                          </span>
                        </div>

                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-400 uppercase">FECHA JUEGO:</span>
                          <span className="font-black text-zinc-800 block">{viewingOfficialTicket.date}</span>
                        </div>

                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-400 uppercase">HORA RESERVADA:</span>
                          <span className="font-black text-zinc-800 block">{viewingOfficialTicket.time} Hs</span>
                        </div>

                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-400">CAMPO / TERRENO:</span>
                          <span className="font-black text-zinc-800 uppercase block text-right">{courtTitle}</span>
                        </div>

                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-400">TIPO DE SUPERFICIE:</span>
                          <span className="font-black text-zinc-800 uppercase block text-right">{surfaceType}</span>
                        </div>

                        <div className="flex justify-between text-[9px] items-center">
                          <span className="text-zinc-400">MÉTODO PAGO:</span>
                          <span className="font-extrabold text-zinc-800 uppercase block text-[8px] tracking-wide bg-zinc-100 px-1.5 py-0.5 rounded leading-none shrink-0 border border-zinc-200">
                            {paymentMethodLabel}
                          </span>
                        </div>

                        {viewingOfficialTicket.extras && viewingOfficialTicket.extras.length > 0 && (
                          <div className="pt-1.5 flex flex-col space-y-1">
                            <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-widest block">EXTRAS COBRADOS / ADQUIRIDOS:</span>
                            <div className="flex flex-wrap gap-1 leading-none">
                              {viewingOfficialTicket.extras.map((ex: string, idx: number) => (
                                <span key={idx} className="text-[7.5px] font-extrabold text-zinc-700 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded uppercase leading-none">
                                  {ex}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex justify-between items-center leading-none mt-2">
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-wider block">MONTO TOTAL REGISTRADO</span>
                          <span className="text-[10px] font-black text-zinc-500 uppercase block">AUDITORÍA SIN REMANENTES</span>
                        </div>
                        <span className="text-lg font-black text-emerald-600 font-display italic">
                          {viewingOfficialTicket.amount || 'S/. 120.00'}
                        </span>
                      </div>
                    </div>

                    <div className="px-6 py-1 h-3 flex items-center justify-between text-[7px] font-mono text-zinc-300 pointer-events-none select-none">
                      - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    </div>

                    <div className="px-6 py-3 bg-zinc-50 flex flex-col items-center justify-center space-y-1.5 border-t border-b border-zinc-100">
                      <div className="flex justify-center items-center gap-[1.5px] h-10 w-full max-w-[200px] py-1 select-none pointer-events-none">
                        {[3,1,2,1,4,1,2,2,1,3,1,4,1,2,1,3,2,1,2,3,1,4,1,2,1,3,2,1,2,3,1,1,2,3,1,2,4,1].map((w, i) => (
                          <div key={i} className="h-full bg-zinc-900 rounded-sm" style={{ width: `${w * 0.9}px` }} />
                        ))}
                      </div>
                      <span className="text-[8.5px] font-bold text-zinc-400 select-all font-mono tracking-widest leading-none">
                        *TKT-{bookingId.toUpperCase()}*
                      </span>
                    </div>

                    <div className="p-5 text-center space-y-2">
                      <p className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
                        ★ OPERADOR DIGITAL REGISTRADO DE CAJA ★
                      </p>
                      
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-150 text-[#155724] text-left text-[8px] space-y-1 font-mono uppercase">
                        <span className="font-extrabold text-[#155724] block leading-none">⚽ EQUIPAMIENTO GENERAL INCLUIDO</span>
                        <p className="leading-normal text-[7.5px] text-zinc-600 font-bold">
                          La pelota oficial de juego y 6 chaquetas distintivas están incluidas con tu pago. Se agradece devolverlas tal como se entregaron en recepción.
                        </p>
                      </div>

                      <p className="text-[8px] font-bold text-zinc-400 leading-normal uppercase">
                        Presente este ticket en la recepción <br />
                        para habilitar las luces del campo de juego. <br />
                        ¡Que tengan un gran partido!
                      </p>
                    </div>
                  </motion.div>
                )}

                {!isSimulatingPrint && (
                  <div className="w-full flex-col flex gap-2.5 mt-6 shrink-0">
                    <div className="grid grid-cols-2 gap-3 pb-0.5">
                      <button
                        onClick={handleSimulatePrint}
                        disabled={isSimulatingDownload}
                        className="h-12 bg-white text-black hover:bg-zinc-100 font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg pointer-events-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir Físico
                      </button>
                      
                      <button
                        onClick={handleTriggerDownload}
                        disabled={isSimulatingDownload}
                        className="h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 pointer-events-auto"
                      >
                        {isSimulatingDownload ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        {isSimulatingDownload ? 'Guardando...' : 'Bajar TxT'}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const isCancha1 = viewingOfficialTicket.field?.toUpperCase().includes('CANCHA 1') || viewingOfficialTicket.field?.toUpperCase().includes('MARACANÁ') || viewingOfficialTicket.field?.toUpperCase().includes('MONUMENTAL') || !viewingOfficialTicket.field?.toUpperCase().includes('CANCHA 2');
                        const courtTitle = isCancha1 ? 'Cancha 1 • El Maracaná' : 'Cancha 2 • La Bombonera';
                        const shareString = `*TICKET DIGITAL OFICIAL: RAMITO FUT SHOW*\n*Turno Código:* ${formattedId}\n*Cancha:* ${courtTitle}\n*Fecha:* ${viewingOfficialTicket.date}\n*Hora:* ${viewingOfficialTicket.time} Hs\n*Inscribe:* ${viewingOfficialTicket.user}\n*Monto:* ${viewingOfficialTicket.amount || '$ 120.00'}\n\n*OPERACIÓN VALIDADA Y SINCRONIZADA CON ÉXITO*\nPrepárense para jugar. ¡No se olviden del calzado deportivo correcto!`;
                        navigator.clipboard.writeText(shareString);
                        showToast('¡Resumen de ticket copiado en formato WhatsApp para enviar al equipo!', 'success');
                      }}
                      className="w-full h-11 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-[#4be277] rounded-xl flex items-center justify-center gap-1.5 font-black text-[9px] uppercase tracking-widest transition-all pointer-events-auto"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      Compartir Ticket de Caja
                    </button>

                    <button
                      onClick={() => setViewingOfficialTicket(null)}
                      className="w-full h-11 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 font-extrabold text-[9px] uppercase tracking-widest transition-all rounded-xl mt-1 pointer-events-auto"
                    >
                      Cerrar Comprobante
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          );
        })()}

        {viewingCourtDetails && (() => {
          const fieldName = viewingCourtDetails.field || "";
          const isLosa = fieldName.toLowerCase().includes('cancha 2') || fieldName.toLowerCase().includes('losa') || fieldName.toLowerCase().includes('sin césped') || fieldName.toLowerCase().includes('cemento') || fieldName.toLowerCase().includes('tierra');
          const courtTitle = isLosa ? 'Cancha 2 • La Bombonera' : 'Cancha 1 • El Maracaná';
          const surfaceType = isLosa ? 'TIERRA COMPACTADA' : 'CÉSPED SINTÉTICO PRO 50MM';
          const footwearRule = isLosa 
            ? 'PERMITIDO BOTINES O ZAPATILLAS DEPORTIVAS. COMPLETAMENTE PROHIBIDO TAPONES METÁLICOS.'
            : 'SOLO BOTINES MULTITAPÓN F5 O ZAPATILLAS. PROHIBICIÓN DE TAPONES LARGOS.';
          
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full"
            >
              {/* Floating ambient light */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-[#FF9100]/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="max-w-md mx-auto w-full px-6 pt-16 pb-8 flex-grow flex flex-col justify-between relative z-10">
                <div>
                  {/* Top Header Navigation bar */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-[9px] font-black text-[#FF9100] uppercase tracking-[0.3em] block italic">COMPLEJO DEPORTIVO</span>
                      <h3 className="text-white text-base font-black uppercase italic tracking-wider mt-0.5">FICHA TÉCNICA Y REGLAMENTO</h3>
                    </div>
                    <button 
                      onClick={() => setViewingCourtDetails(null)}
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Hero card displaying court visual mock */}
                  <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#141616] mb-6 p-6 flex flex-col justify-end min-h-[170px] shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop')` }} />
                    <div className="relative z-20 space-y-1">
                      <span className="text-[8px] font-black bg-[#FF9100] text-black uppercase tracking-wider px-2.5 py-1 rounded italic inline-block">
                        FUTBOL {isLosa ? '5' : '6/7'}
                      </span>
                      <h2 className="text-white text-xl font-black uppercase italic tracking-wide">
                        {courtTitle}
                      </h2>
                      <p className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest flex items-center gap-1.5 leading-none pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9100]" /> Ramito Fut Show Complejo Principal
                      </p>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="space-y-4">
                    {/* Court surface & specs */}
                    <div className="bg-[#141616] rounded-[2rem] p-5 border border-white/5 text-left space-y-4">
                      <div className="flex gap-3.5 items-start">
                        <div className="w-9 h-9 rounded-xl bg-[#4be277]/10 flex items-center justify-center shrink-0">
                          <Trophy className="w-5 h-5 text-[#4be277]" />
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[8.5px] font-black text-[#bccbb9]/40 tracking-wider block uppercase">TIPO DE SUPERFICIE</span>
                          <span className="text-sm font-black text-white uppercase italic tracking-wide block">
                            {surfaceType}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3.5 items-start">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[8.5px] font-black text-[#bccbb9]/40 tracking-wider block uppercase">NORMATIVA DE CALZADO AUTORIZADO</span>
                          <span className="text-[11px] font-bold text-[#bccbb9] leading-relaxed block uppercase">
                            {footwearRule}
                          </span>
                        </div>
                      </div>
                    </div>



                    {/* General policies & rules */}
                    <div className="bg-[#141616] rounded-[2rem] p-5 border border-white/5 text-left space-y-3">
                      <span className="text-[9.5px] font-black text-red-400 uppercase tracking-[0.2em] block flex items-center gap-1.5 leading-none">
                        <Shield className="w-4 h-4 text-red-500 shrink-0" /> POLÍTICAS EXTREMAS DE CONVIVENCIA
                      </span>
                      <ul className="space-y-1.5 list-decimal list-inside text-[9px] font-semibold text-[#bccbb9]/70 uppercase tracking-wide leading-relaxed">
                        <li>LLEGADA ANTICIPADA: Estar presente 10 minutos antes de tu turno. No hay extensiones por demoras propias.</li>
                        <li>VALIDACIONES: Las reservas por transferencia deben verificarse subiendo el ticket con anticipación segura.</li>
                        <li>NO DEVOLUCIONES: Los pagos de señas de reserva no se devolverán en ningún caso por inasistencia.</li>
                        <li>DISCIPLINA: Queda prohibida la agresión física o verbal, la introducción de licores o fumar dentro del local.</li>
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Return button */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <button 
                    onClick={() => setViewingCourtDetails(null)}
                    className="w-full h-14 rounded-2xl bg-[#FF9100] text-black font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 shadow-[0_5px_20px_rgba(255,145,0,0.2)]"
                  >
                    ENTENDIDO • REGRESAR A MIS RESERVAS
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </main>
  );
}
