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
  isSystemBlocked: boolean;
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
      isSystemBlocked
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
