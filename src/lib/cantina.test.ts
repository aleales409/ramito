import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCantinaItems, saveCantinaItems, CantinaItem } from './cantina';

describe('cantina.ts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería retornar los items por defecto si localStorage está vacío', () => {
    const items = getCantinaItems();
    expect(items.length).toBeGreaterThan(0);
    // Verificar que un ítem conocido esté allí
    const gatorade = items.find(i => i.id === 'gatorade_pack');
    expect(gatorade).toBeDefined();
    expect(gatorade?.price).toBe(25);
  });

  it('debería filtrar y eliminar "vests" de la lista de cantina si está en localStorage', () => {
    const mockItems: CantinaItem[] = [
      { id: 'gatorade_pack', name: 'Gatorade Pack', price: 25, stock: 10, type: 'drink', iconId: 'gatorade_pack', showInBooking: true },
      { id: 'vests', name: 'Chalecos', price: 15, stock: 5, type: 'equipment', iconId: 'vests', showInBooking: true }
    ];
    localStorage.setItem('ramito_cantina_items', JSON.stringify(mockItems));

    const items = getCantinaItems();
    // Debe remover "vests"
    const vests = items.find(i => i.id === 'vests');
    expect(vests).toBeUndefined();
    expect(items.length).toBe(1);
  });

  it('debería guardar y recuperar los items correctamente', () => {
    const customItems: CantinaItem[] = [
      { id: 'water_single', name: 'Agua mineral', price: 6, stock: 20, type: 'drink', iconId: 'water', showInBooking: true }
    ];
    saveCantinaItems(customItems);

    const items = getCantinaItems();
    expect(items).toEqual(customItems);
    expect(localStorage.getItem('ramito_cantina_price_water_single')).toBe('6');
  });
});
