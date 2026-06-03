import React, { createContext, useContext, useState, useEffect } from 'react';
import { generarMarquee } from '../lib/scheduleUtils';
import { updateVercelLicense } from '../lib/vercelSync';
import { COURTS } from '../data';
import { getCantinaItems, saveCantinaItems, CantinaItem } from '../lib/cantina';

interface AppContextType {
  isComplexOpen: boolean;
  setIsComplexOpen: (isOpen: boolean) => void;
  adminPhone: string;
  setAdminPhone: (phone: string) => void;
  stadiumName: string;
  setStadiumName: (name: string) => void;
  eliteKey: string;
  setEliteKey: (key: string) => void;
  vipKey: string;
  setVipKey: (key: string) => void;
  universalUserKey: string;
  setUniversalUserKey: (key: string) => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  allBookings: any[];
  setAllBookings: React.Dispatch<React.SetStateAction<any[]>>;
  courts: any[];
  setCourts: React.Dispatch<React.SetStateAction<any[]>>;
  schedule: { 
    weekday: { open: string; close: string; open2?: string; close2?: string; useTwoShifts?: boolean }, 
    weekend: { open: string; close: string; open2?: string; close2?: string; useTwoShifts?: boolean } 
  };
  setSchedule: React.Dispatch<React.SetStateAction<any>>;
  appLicenseActive: boolean;
  setAppLicenseActive: (active: boolean) => void;
  webLicenseActive: boolean;
  setWebLicenseActive: (active: boolean) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (active: boolean) => void;
  emergencyMode: boolean;
  setEmergencyMode: (active: boolean) => void;
  emergencyType: string;
  setEmergencyType: (type: string) => void;
  emergencyMessage: string;
  setEmergencyMessage: (message: string) => void;
  marqueeText: string;
  setMarqueeText: (text: string) => void;
  secondaryMarqueeText: string;
  setSecondaryMarqueeText: (text: string) => void;
  isSystemBlocked: boolean;
  toast: { message: string; type: 'error' | 'success'; visible: boolean };
  showToast: (message: string, type?: 'error' | 'success') => void;
  hideToast: () => void;
  saveSettings: (newSettings: Partial<any>) => Promise<void>;
  userAvatar: string | null;
  setUserAvatar: (avatar: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  cashTotal: number;
  setCashTotal: React.Dispatch<React.SetStateAction<number>>;
  transferTotal: number;
  setTransferTotal: React.Dispatch<React.SetStateAction<number>>;
  mpTotal: number;
  setMpTotal: React.Dispatch<React.SetStateAction<number>>;
  ledgerTransactions: any[];
  setLedgerTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  cantinaItems: CantinaItem[];
  setCantinaItems: React.Dispatch<React.SetStateAction<CantinaItem[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userAvatar, setUserAvatarState] = useState<string | null>(() => {
    return localStorage.getItem('ramito_user_avatar');
  });

  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem('ramito_user_name') || '';
  });

  const [userRole, setUserRoleState] = useState<string | null>(() => {
    return localStorage.getItem('ramito_user_role');
  });

  const setUserAvatar = (avatar: string | null) => {
    setUserAvatarState(avatar);
    if (avatar) {
      localStorage.setItem('ramito_user_avatar', avatar);
    } else {
      localStorage.removeItem('ramito_user_avatar');
    }
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('ramito_user_name', name);
  };

  const setUserRole = (role: string | null) => {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem('ramito_user_role', role);
    } else {
      localStorage.removeItem('ramito_user_role');
    }
  };

  const [isComplexOpen, setIsComplexOpen] = useState(() => {
    const saved = localStorage.getItem('ramito_complex_open');
    return saved !== null ? saved === 'true' : true;
  });

  const [adminPhone, setAdminPhone] = useState(() => {
    return localStorage.getItem('ramito_admin_phone') || '+51 987 654 321';
  });

  const [stadiumName, setStadiumName] = useState(() => {
    return localStorage.getItem('ramito_stadium_name') || 'Ramito Fut Show';
  });

  useEffect(() => {
    localStorage.setItem('ramito_stadium_name', stadiumName);
  }, [stadiumName]);

  const [eliteKey, setEliteKey] = useState(() => {
    return localStorage.getItem('ramito_elite_key') || 'ELITE-9A7F-D3B8-K2C5';
  });

  const [vipKey, setVipKey] = useState(() => {
    return localStorage.getItem('ramito_vip_key') || 'VIP-3E8F-C1A5-J7B9';
  });

  const [universalUserKey, setUniversalUserKey] = useState(() => {
    return localStorage.getItem('ramito_universal_user_key') || 'USER-7D2A-B9C4-F5E1';
  });

  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', title: 'COMPROBANTE DISPONIBLE', body: 'Carlos Mendoza ha subido una captura de Yape por S/. 120.00 para la Cancha 1 (Césped).', time: 'Hace 5 min', read: false },
      { id: 'n2', title: 'COMPROBANTE DISPONIBLE', body: 'Sofía Rodríguez ha cargado un comprobante de Plin por S/. 100.00 para la Cancha 2 (Sin Césped).', time: 'Hace 15 min', read: false },
      { id: 'n3', title: 'TURNO VALIDADO', body: 'Se ha verificado con éxito el pago del turno de Mateo Silva para hoy a las 22:00 hs.', time: 'Hace 45 min', read: true }
    ];
  });

  const [allBookings, setAllBookings] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_all_bookings');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'b1', 
        date: 'Hoy', 
        time: '20:00', 
        field: 'Cancha 1 • El Maracaná', 
        status: 'pending_approval', 
        amount: 'S/. 150.00', 
        user: 'Carlos Mendoza',
        receiptUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600',
        phone: '+51 912 345 678',
        extras: ['Pack Hidratación (2 Gatorade + 2 Aguas)']
      },
      { 
        id: 'b2', 
        date: 'Hoy', 
        time: '18:00', 
        field: 'Cancha 2 • La Bombonera', 
        status: 'pending_approval', 
        amount: 'S/. 100.00', 
        user: 'Sofía Rodríguez',
        receiptUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=600',
        phone: '+51 980 765 432'
      },
      { 
        id: 'b3', 
        date: 'Hoy', 
        time: '22:00', 
        field: 'Cancha 1 • El Maracaná', 
        status: 'upcoming', 
        amount: 'S/. 135.00', 
        user: 'Mateo Silva',
        receiptUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
        phone: '+51 955 443 322',
        extras: ['Alquiler Pelota Profesional FIFA']
      },
      { 
        id: 'b_agus_castro_default', 
        date: 'Hoy', 
        time: '21:00', 
        field: 'Cancha 1 • El Maracaná', 
        status: 'upcoming', 
        amount: 'S/. 120.00', 
        user: 'Agus Castro',
        phone: '+51 987 654 321',
        extras: ['Pack Hidratación (2 Gatorade + 2 Aguas)']
      },
      { 
        id: 'b4', 
        date: 'Mañana', 
        time: '18:00', 
        field: 'Cancha 1 • El Maracaná', 
        status: 'pending_payment', 
        amount: 'S/. 120.00', 
        user: 'Camila Espinoza',
        phone: '+51 933 221 100'
      },
      { 
        id: 'b5', 
        date: 'Ayer', 
        time: '21:00', 
        field: 'Cancha 2 • La Bombonera', 
        status: 'completed', 
        amount: 'S/. 100.00', 
        user: 'Javier Ortega',
        receiptUrl: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=600',
        phone: '+51 966 887 799'
      }
    ];
  });

  const [courts, setCourts] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_courts');
    return saved ? JSON.parse(saved) : COURTS;
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('ramito_schedule');
    return saved ? JSON.parse(saved) : { weekday: { open: '18:00', close: '23:00' }, weekend: { open: '15:00', close: '23:00' } };
  });

  const [scheduleDays, setScheduleDays] = useState<Record<string, { morning: string; afternoon: string; night: string }>>(() => {
    const saved = localStorage.getItem('ramito_schedule_days');
    return saved ? JSON.parse(saved) : {};
  });

  const [appLicenseActive, setAppLicenseActive] = useState(() => {
    const saved = localStorage.getItem('ramito_app_license');
    return saved !== null ? saved === 'true' : true;
  });

  const [webLicenseActive, setWebLicenseActive] = useState(() => {
    const saved = localStorage.getItem('ramito_web_license');
    return saved !== null ? saved === 'true' : true;
  });

  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    const saved = localStorage.getItem('ramito_maintenance');
    return saved !== null ? saved === 'true' : false;
  });

  const [emergencyMode, setEmergencyMode] = useState(() => {
    const saved = localStorage.getItem('ramito_emergency_mode');
    return saved !== null ? saved === 'true' : false;
  });

  const [emergencyType, setEmergencyType] = useState(() => {
    return localStorage.getItem('ramito_emergency_type') || 'critical';
  });

  const [emergencyMessage, setEmergencyMessage] = useState(() => {
    return localStorage.getItem('ramito_emergency_message') || 'EL COMPLEJO PERMANECERÁ CERRADO TEMPORALMENTE DEBIDO A FUERZAS MAYOR, LES AGRADECEMOS SU COMPRENSIÓN.';
  });

  const [marqueeText, setMarqueeText] = useState(() => {
    return localStorage.getItem('ramito_marquee_text') || 'COMPLEJO RAMITO FUT SHOW • EL MEJOR NIVEL • RESERVAS ABIERTAS • VEN A JUGAR';
  });

  const [secondaryMarqueeText, setSecondaryMarqueeText] = useState(() => {
    return localStorage.getItem('ramito_secondary_marquee_text') || '';
  });

  const [cashTotal, setCashTotal] = useState<number>(() => {
    return parseInt(localStorage.getItem('ramito_audit_cash') || '15000', 10);
  });
  const [transferTotal, setTransferTotal] = useState<number>(() => {
    return parseInt(localStorage.getItem('ramito_audit_transfer') || '18000', 10);
  });
  const [mpTotal, setMpTotal] = useState<number>(() => {
    return parseInt(localStorage.getItem('ramito_audit_mp') || '12000', 10);
  });

  const [ledgerTransactions, setLedgerTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_ledger_txs');
    return saved ? JSON.parse(saved) : [];
  });

  const [cantinaItems, setCantinaItems] = useState<CantinaItem[]>(() => {
    return getCantinaItems();
  });

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Fetch settings and bookings from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
        if (!isSupabaseConfigured) {
          console.log('Skipping Supabase fetching because configuration is missing/invalid. Offline simulation mode is active.');
          return;
        }
        
        // Load System Settings
        const { data: settings, error: settingsError } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', 1)
          .single();
          
        if (settings && !settingsError) {
          setIsComplexOpen(settings.is_complex_open);
          setAppLicenseActive(settings.app_license_active);
          setWebLicenseActive(settings.web_license_active);
          setAdminPhone(settings.admin_phone || '+51 987 654 321');
          setMarqueeText(settings.marquee_text || 'COMPLEJO RAMITO FUT SHOW • EL MEJOR NIVEL • RESERVAS ABIERTAS • VEN A JUGAR');
          if (settings.secondary_marquee_text !== undefined && settings.secondary_marquee_text !== null) {
            setSecondaryMarqueeText(settings.secondary_marquee_text);
          }
          if (settings.elite_key) setEliteKey(settings.elite_key);
          if (settings.vip_key) setVipKey(settings.vip_key);
          if (settings.universal_user_key) setUniversalUserKey(settings.universal_user_key);
        }

        // Load Bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (bookings && !bookingsError) {
          setAllBookings(bookings);
        }

        // Load Ledger Transactions
        const { data: ledgerTxs, error: ledgerError } = await supabase
          .from('ledger_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (ledgerTxs && !ledgerError) {
          setLedgerTransactions(ledgerTxs);
        }

        // Load Cantina Items
        const { data: cantinaDb, error: cantinaError } = await supabase
          .from('cantina_items')
          .select('*');

        if (cantinaDb && !cantinaError && cantinaDb.length > 0) {
          setCantinaItems(cantinaDb);
        }
      } catch (err) {
        console.error('Error loading data from Supabase', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('ramito_complex_open', isComplexOpen.toString());
  }, [isComplexOpen]);

  useEffect(() => {
    localStorage.setItem('ramito_admin_phone', adminPhone);
  }, [adminPhone]);

  useEffect(() => {
    localStorage.setItem('ramito_elite_key', eliteKey);
  }, [eliteKey]);

  useEffect(() => {
    localStorage.setItem('ramito_vip_key', vipKey);
  }, [vipKey]);

  useEffect(() => {
    localStorage.setItem('ramito_universal_user_key', universalUserKey);
  }, [universalUserKey]);

  useEffect(() => {
    localStorage.setItem('ramito_app_license', appLicenseActive.toString());
  }, [appLicenseActive]);

  useEffect(() => {
    localStorage.setItem('ramito_web_license', webLicenseActive.toString());
  }, [webLicenseActive]);

  useEffect(() => {
    localStorage.setItem('ramito_maintenance', maintenanceMode.toString());
  }, [maintenanceMode]);

  useEffect(() => {
    localStorage.setItem('ramito_emergency_mode', emergencyMode.toString());
  }, [emergencyMode]);

  useEffect(() => {
    localStorage.setItem('ramito_emergency_type', emergencyType);
  }, [emergencyType]);

  useEffect(() => {
    localStorage.setItem('ramito_emergency_message', emergencyMessage);
  }, [emergencyMessage]);

  useEffect(() => {
    localStorage.setItem('ramito_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ramito_all_bookings', JSON.stringify(allBookings));
  }, [allBookings]);

  useEffect(() => {
    localStorage.setItem('ramito_marquee_text', marqueeText);
  }, [marqueeText]);

  useEffect(() => {
    localStorage.setItem('ramito_secondary_marquee_text', secondaryMarqueeText);
  }, [secondaryMarqueeText]);

  useEffect(() => {
    localStorage.setItem('ramito_courts', JSON.stringify(courts));
  }, [courts]);

  useEffect(() => {
    localStorage.setItem('ramito_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Persistir scheduleDays (horarios completos) en localStorage
  useEffect(() => {
    localStorage.setItem('ramito_schedule_days', JSON.stringify(scheduleDays));
  }, [scheduleDays]);

  useEffect(() => {
    localStorage.setItem('ramito_audit_cash', String(cashTotal));
  }, [cashTotal]);

  useEffect(() => {
    localStorage.setItem('ramito_audit_transfer', String(transferTotal));
  }, [transferTotal]);

  useEffect(() => {
    localStorage.setItem('ramito_audit_mp', String(mpTotal));
  }, [mpTotal]);

  useEffect(() => {
    localStorage.setItem('ramito_ledger_txs', JSON.stringify(ledgerTransactions));
  }, [ledgerTransactions]);

  useEffect(() => {
    saveCantinaItems(cantinaItems);
  }, [cantinaItems]);

  const saveSettings = async (newSettings: Partial<any>) => {
    // Update local state IMMEDIATELY
    if (newSettings.is_complex_open !== undefined) setIsComplexOpen(newSettings.is_complex_open);
    if (newSettings.admin_phone !== undefined) setAdminPhone(newSettings.admin_phone);
    if (newSettings.elite_key !== undefined) setEliteKey(newSettings.elite_key);
    if (newSettings.vip_key !== undefined) setVipKey(newSettings.vip_key);
    if (newSettings.universal_user_key !== undefined) setUniversalUserKey(newSettings.universal_user_key);
    if (newSettings.app_license_active !== undefined) {
      setAppLicenseActive(newSettings.app_license_active);
      if (!newSettings.app_license_active) {
        setMaintenanceMode(true);
      }
    }
    if (newSettings.web_license_active !== undefined) {
      try {
        await updateVercelLicense(newSettings.web_license_active);
      } catch (vercelErr) {
        console.error('Error sync Vercel', vercelErr);
      }
      setWebLicenseActive(newSettings.web_license_active);
    }
    if (newSettings.marquee_text !== undefined) setMarqueeText(newSettings.marquee_text);
    if (newSettings.secondary_marquee_text !== undefined) setSecondaryMarqueeText(newSettings.secondary_marquee_text);
    if (newSettings.schedule !== undefined) setSchedule(newSettings.schedule);
    if (newSettings.courts !== undefined) setCourts(newSettings.courts);
    if (newSettings.schedule_days !== undefined) setScheduleDays(newSettings.schedule_days);

    // Then try to sync to Supabase
    try {
      const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
      if (isSupabaseConfigured) {
        let updateData = { ...newSettings };
        if (newSettings.schedule_days !== undefined) {
          const generated = generarMarquee(newSettings.schedule_days);
          setMarqueeText(generated);
          updateData.marquee_text = generated;
        }

        const { error } = await supabase
          .from('system_settings')
          .update(updateData)
          .eq('id', 1);

        if (error) {
          console.warn('Supabase sync warning (algunas columnas podrían no existir):', error);
        }
      }
      showToast('Configuración Guardada', 'success');
    } catch (err) {
      console.error('Error saving settings', err);
      showToast('Error al guardar en la nube');
    }
  };

  const isSystemBlocked = !appLicenseActive || !webLicenseActive;


  return (
    <AppContext.Provider value={{ 
      isComplexOpen, 
      setIsComplexOpen, 
      adminPhone, 
      setAdminPhone,
      stadiumName,
      setStadiumName,
      eliteKey,
      setEliteKey,
      vipKey,
      setVipKey,
      universalUserKey,
      setUniversalUserKey,
      notifications,
      setNotifications,
      allBookings,
      setAllBookings,
      courts,
      setCourts,
      schedule,
      setSchedule,
      appLicenseActive,
      setAppLicenseActive,
      webLicenseActive,
      setWebLicenseActive,
      maintenanceMode,
      setMaintenanceMode,
      emergencyMode,
      setEmergencyMode,
      emergencyType,
      setEmergencyType,
      emergencyMessage,
      setEmergencyMessage,
      marqueeText,
      setMarqueeText,
      secondaryMarqueeText,
      setSecondaryMarqueeText,
      isSystemBlocked,
      toast,
      showToast,
      hideToast,
      saveSettings,
      userAvatar,
      setUserAvatar,
      userName,
      setUserName,
      userRole,
      setUserRole,
      cashTotal,
      setCashTotal,
      transferTotal,
      setTransferTotal,
      mpTotal,
      setMpTotal,
      ledgerTransactions,
      setLedgerTransactions,
      cantinaItems,
      setCantinaItems
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
