import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isComplexOpen: boolean;
  setIsComplexOpen: (isOpen: boolean) => void;
  adminPhone: string;
  setAdminPhone: (phone: string) => void;
  eliteKey: string;
  setEliteKey: (key: string) => void;
  vipKey: string;
  setVipKey: (key: string) => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  allBookings: any[];
  setAllBookings: React.Dispatch<React.SetStateAction<any[]>>;
  appLicenseActive: boolean;
  setAppLicenseActive: (active: boolean) => void;
  webLicenseActive: boolean;
  setWebLicenseActive: (active: boolean) => void;
  marqueeText: string;
  setMarqueeText: (text: string) => void;
  isSystemBlocked: boolean;
  toast: { message: string; type: 'error' | 'success'; visible: boolean };
  showToast: (message: string, type?: 'error' | 'success') => void;
  hideToast: () => void;
  saveSettings: (newSettings: Partial<any>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isComplexOpen, setIsComplexOpen] = useState(() => {
    const saved = localStorage.getItem('ramito_complex_open');
    return saved !== null ? saved === 'true' : true;
  });

  const [adminPhone, setAdminPhone] = useState(() => {
    return localStorage.getItem('ramito_admin_phone') || '+51 987 654 321';
  });

  const [eliteKey, setEliteKey] = useState(() => {
    return localStorage.getItem('ramito_elite_key') || '123456';
  });

  const [vipKey, setVipKey] = useState(() => {
    return localStorage.getItem('ramito_vip_key') || '654321';
  });

  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [allBookings, setAllBookings] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_all_bookings');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: 'Viernes 15 Mayo', time: '19:00', field: 'Cancha 1', status: 'pending_approval', amount: '$45.00', user: 'Agus Castro' },
      { id: '2', date: 'Sábado 16 Mayo', time: '21:00', field: 'Cancha 2', status: 'upcoming', amount: '$30.00', user: 'Juan Perez' }
    ];
  });

  const [appLicenseActive, setAppLicenseActive] = useState(() => {
    const saved = localStorage.getItem('ramito_app_license');
    return saved !== null ? saved === 'true' : true;
  });

  const [webLicenseActive, setWebLicenseActive] = useState(() => {
    const saved = localStorage.getItem('ramito_web_license');
    return saved !== null ? saved === 'true' : true;
  });

  const [marqueeText, setMarqueeText] = useState(() => {
    return localStorage.getItem('ramito_marquee_text') || 'COMPLEJO RAMITO FUT SHOW • EL MEJOR NIVEL • RESERVAS ABIERTAS • VEN A JUGAR';
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
        const { supabase } = await import('../lib/supabase');
        
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
          if (settings.elite_key) setEliteKey(settings.elite_key);
          if (settings.vip_key) setVipKey(settings.vip_key);
        }

        // Load Bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (bookings && !bookingsError) {
          setAllBookings(bookings);
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
    localStorage.setItem('ramito_app_license', appLicenseActive.toString());
  }, [appLicenseActive]);

  useEffect(() => {
    localStorage.setItem('ramito_web_license', webLicenseActive.toString());
  }, [webLicenseActive]);

  useEffect(() => {
    localStorage.setItem('ramito_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ramito_all_bookings', JSON.stringify(allBookings));
  }, [allBookings]);

  useEffect(() => {
    localStorage.setItem('ramito_marquee_text', marqueeText);
  }, [marqueeText]);

  const saveSettings = async (newSettings: Partial<any>) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('system_settings')
        .update(newSettings)
        .eq('id', 1);
        
      if (error) throw error;
      
      // Update local state
      if (newSettings.is_complex_open !== undefined) setIsComplexOpen(newSettings.is_complex_open);
      if (newSettings.admin_phone !== undefined) setAdminPhone(newSettings.admin_phone);
      if (newSettings.elite_key !== undefined) setEliteKey(newSettings.elite_key);
      if (newSettings.vip_key !== undefined) setVipKey(newSettings.vip_key);
      if (newSettings.app_license_active !== undefined) setAppLicenseActive(newSettings.app_license_active);
      if (newSettings.web_license_active !== undefined) setWebLicenseActive(newSettings.web_license_active);
      if (newSettings.marquee_text !== undefined) setMarqueeText(newSettings.marquee_text);
      
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
      eliteKey,
      setEliteKey,
      vipKey,
      setVipKey,
      notifications,
      setNotifications,
      allBookings,
      setAllBookings,
      appLicenseActive,
      setAppLicenseActive,
      webLicenseActive,
      setWebLicenseActive,
      marqueeText,
      setMarqueeText,
      isSystemBlocked,
      toast,
      showToast,
      hideToast,
      saveSettings
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
