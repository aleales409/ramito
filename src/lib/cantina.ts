export interface CantinaItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  type: 'drink' | 'equipment' | 'extra';
  iconId: string;
  showInBooking: boolean;
}

const DEFAULT_ITEMS: CantinaItem[] = [
  {
    id: 'gatorade_pack',
    name: 'Pack Hidratación (2 Gatorade + 2 Aguas)',
    price: 25,
    stock: 15,
    type: 'drink',
    iconId: 'gatorade_pack',
    showInBooking: true
  },
  {
    id: 'gatorade_single',
    name: 'Gatorade Helado',
    price: 8,
    stock: 30,
    type: 'drink',
    iconId: 'gatorade',
    showInBooking: false
  },
  {
    id: 'water_single',
    name: 'Mineral Helada',
    price: 5,
    stock: 50,
    type: 'drink',
    iconId: 'water',
    showInBooking: false
  },
  {
    id: 'beer_single',
    name: 'Cerveza Helada',
    price: 10,
    stock: 24,
    type: 'drink',
    iconId: 'beer',
    showInBooking: false
  },
  {
    id: 'ball',
    name: 'Alquiler Pelota Profesional FIFA',
    price: 10,
    stock: 3,
    type: 'equipment',
    iconId: 'ball',
    showInBooking: true
  },
  {
    id: 'bbq',
    name: 'Parrilla Completa + Bolsa Carbón',
    price: 30,
    stock: 2,
    type: 'extra',
    iconId: 'bbq',
    showInBooking: true
  }
];

export function getCantinaItems(): CantinaItem[] {
  const stored = localStorage.getItem('ramito_cantina_items');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce removal of vests (chalecos no van) as requested
        const filtered = parsed.filter((item: any) => item.id !== 'vests');
        if (filtered.length !== parsed.length) {
          localStorage.setItem('ramito_cantina_items', JSON.stringify(filtered));
        }
        return filtered;
      }
    } catch {
      // Fallback
    }
  }

  // Build items list with possible existing single LocalStorage values
  const items: CantinaItem[] = [
    {
      id: 'gatorade_pack',
      name: localStorage.getItem('ramito_cantina_name_gatorade_pack') || 'Pack Hidratación (2 Gatorade + 2 Aguas)',
      price: parseFloat(localStorage.getItem('ramito_cantina_price_gatorade_pack') || '25'),
      stock: parseInt(localStorage.getItem('ramito_cantina_stock_gatorade_pack') || '15', 10),
      type: 'drink',
      iconId: 'gatorade_pack',
      showInBooking: true
    },
    {
      id: 'gatorade_single',
      name: localStorage.getItem('ramito_cantina_name_gatorade_single') || 'Gatorade Helado',
      price: parseFloat(localStorage.getItem('ramito_cantina_price_gatorade_single') || '8'),
      stock: parseInt(localStorage.getItem('ramito_cantina_stock_gatorade_single') || '30', 10),
      type: 'drink',
      iconId: 'gatorade',
      showInBooking: false
    },
    {
      id: 'water_single',
      name: localStorage.getItem('ramito_cantina_name_water_single') || 'Mineral Helada',
      price: parseFloat(localStorage.getItem('ramito_cantina_price_water_single') || '5'),
      stock: parseInt(localStorage.getItem('ramito_cantina_stock_water_single') || '50', 10),
      type: 'drink',
      iconId: 'water',
      showInBooking: false
    },
    {
      id: 'beer_single',
      name: localStorage.getItem('ramito_cantina_name_beer_single') || 'Cerveza Helada',
      price: parseFloat(localStorage.getItem('ramito_cantina_price_beer_single') || '10'),
      stock: parseInt(localStorage.getItem('ramito_cantina_stock_beer_single') || '24', 10),
      type: 'drink',
      iconId: 'beer',
      showInBooking: false
    },
    {
      id: 'ball',
      name: localStorage.getItem('ramito_cantina_name_ball') || 'Alquiler Pelota Profesional FIFA',
      price: parseFloat(localStorage.getItem('ramito_cantina_price_ball') || '10'),
      stock: parseInt(localStorage.getItem('ramito_cantina_stock_ball') || '3', 10),
      type: 'equipment',
      iconId: 'ball',
      showInBooking: true
    },
    {
      id: 'bbq',
      name: localStorage.getItem('ramito_cantina_name_bbq') || 'Parrilla Completa + Bolsa Carbón',
      price: parseFloat(localStorage.getItem('ramito_cantina_price_bbq') || '30'),
      stock: parseInt(localStorage.getItem('ramito_cantina_stock_bbq') || '2', 10),
      type: 'extra',
      iconId: 'bbq',
      showInBooking: true
    }
  ];

  // Save them so the array starts filled and fully synchronized
  saveCantinaItems(items);
  return items;
}

export function saveCantinaItems(items: CantinaItem[]): void {
  localStorage.setItem('ramito_cantina_items', JSON.stringify(items));
  
  // Keep legacy individual items in local storage in sync in case other views expect them
  items.forEach(item => {
    if (item.id === 'gatorade_pack') {
      localStorage.setItem('ramito_cantina_price_gatorade_pack', String(item.price));
      localStorage.setItem('ramito_cantina_name_gatorade_pack', item.name);
      localStorage.setItem('ramito_cantina_stock_gatorade_pack', String(item.stock));
    } else if (item.id === 'gatorade_single') {
      localStorage.setItem('ramito_cantina_price_gatorade_single', String(item.price));
      localStorage.setItem('ramito_cantina_name_gatorade_single', item.name);
      localStorage.setItem('ramito_cantina_stock_gatorade_single', String(item.stock));
    } else if (item.id === 'water_single') {
      localStorage.setItem('ramito_cantina_price_water_single', String(item.price));
      localStorage.setItem('ramito_cantina_name_water_single', item.name);
      localStorage.setItem('ramito_cantina_stock_water_single', String(item.stock));
    } else if (item.id === 'beer_single') {
      localStorage.setItem('ramito_cantina_price_beer_single', String(item.price));
      localStorage.setItem('ramito_cantina_name_beer_single', item.name);
      localStorage.setItem('ramito_cantina_stock_beer_single', String(item.stock));
    } else if (item.id === 'vests') {
      localStorage.setItem('ramito_cantina_price_vests', String(item.price));
      localStorage.setItem('ramito_cantina_name_vests', item.name);
      localStorage.setItem('ramito_cantina_stock_vests', String(item.stock));
    } else if (item.id === 'ball') {
      localStorage.setItem('ramito_cantina_price_ball', String(item.price));
      localStorage.setItem('ramito_cantina_name_ball', item.name);
      localStorage.setItem('ramito_cantina_stock_ball', String(item.stock));
    } else if (item.id === 'bbq') {
      localStorage.setItem('ramito_cantina_price_bbq', String(item.price));
      localStorage.setItem('ramito_cantina_name_bbq', item.name);
      localStorage.setItem('ramito_cantina_stock_bbq', String(item.stock));
    }
  });
}
