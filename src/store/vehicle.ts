import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VehicleData {
  makeId:    string | null;
  make:      string;
  modelId:   string | null;
  model:     string;
  year:      string;
  vehicleId: string | null;
  slug:      string;
  engine:    string;
}

const EMPTY: VehicleData = {
  makeId: null, make: '', modelId: null, model: '',
  year: '', vehicleId: null, slug: '', engine: '',
};

interface VehicleStore {
  vehicle:      VehicleData;
  setMake:      (make: string, makeId: string) => void;
  setModel:     (model: string, modelId: string) => void;
  setYear:      (year: string) => void;
  setVehicleId: (vehicleId: string) => void;
  setEngine:    (engine: string) => void;
  setVehicle:   (v: Partial<VehicleData>) => void;
  reset:        () => void;
  label:        () => string;
}

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set, get) => ({
      vehicle: EMPTY,

      setMake: (make, makeId) => set({
        vehicle: { ...EMPTY, make, makeId },
      }),

      setModel: (model, modelId) => set((s) => ({
        vehicle: { ...s.vehicle, model, modelId, year: '', vehicleId: null, slug: '', engine: '' },
      })),

      setYear: (year) => set((s) => ({
        vehicle: { ...s.vehicle, year, vehicleId: null, slug: '' },
      })),

      setVehicleId: (vehicleId) => set((s) => ({
        vehicle: { ...s.vehicle, vehicleId },
      })),

      setEngine: (engine) => set((s) => ({
        vehicle: { ...s.vehicle, engine },
      })),

      setVehicle: (v) => set((s) => ({
        vehicle: { ...s.vehicle, ...v },
      })),

      reset: () => set({ vehicle: EMPTY }),

      label: () => {
        const v = get().vehicle;
        if (!v.make) return '';
        return [v.make, v.model, v.year, v.engine].filter(Boolean).join(' ');
      },
    }),
    {
      name: 'kibilov-vehicle',
      // sessionStorage — tab-ზე ინახება, browser close-ზე იწმინდება
      storage: {
        getItem: (k) => { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
        setItem: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
        removeItem: (k) => { try { sessionStorage.removeItem(k); } catch {} },
      },
    }
  )
);
