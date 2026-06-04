import { describe, it, expect } from 'vitest';
import { generarMarquee, ScheduleDay } from './scheduleUtils';

describe('scheduleUtils.ts', () => {
  it('debería formatear correctamente los días y horarios para la marquesina', () => {
    const mockSchedule: Record<string, ScheduleDay> = {
      lunes: { morning: '08:00-12:00', afternoon: '14:00-18:00', night: '20:00-23:00' },
      martes: { morning: '09:00-12:00', afternoon: '', night: '20:00-22:00' }
    };

    const marquee = generarMarquee(mockSchedule);
    expect(marquee).toContain('Lunes 08:00-12:00 / 14:00-18:00 / 20:00-23:00');
    expect(marquee).toContain('Martes 09:00-12:00 / 20:00-22:00');
    expect(marquee).toContain(' – '); // separador
  });

  it('debería omitir los días que no tienen horarios definidos', () => {
    const mockSchedule: Record<string, ScheduleDay> = {
      miércoles: { morning: '', afternoon: '', night: '' }
    };
    const marquee = generarMarquee(mockSchedule);
    expect(marquee).toBe('');
  });
});
