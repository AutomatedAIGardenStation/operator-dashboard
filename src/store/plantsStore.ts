import { create } from 'zustand';
import { Plant, HarvestJob, CreatePlantRequest, UpdatePlantRequest } from '../api/types';
import * as plantsApi from '../api/plants';
import * as harvestApi from '../api/harvest';

interface PlantsState {
  plants: Plant[];
  harvestQueue: HarvestJob[];
  loading: boolean;
  error: string | null;

  fetchPlants: () => Promise<void>;
  createPlant: (plant: CreatePlantRequest) => Promise<void>;
  updatePlant: (id: number, plant: UpdatePlantRequest) => Promise<void>;
  fetchHarvestQueue: () => Promise<void>;
  triggerHarvest: (id: string) => Promise<void>;
}

export const usePlantsStore = create<PlantsState>((set, get) => ({
  plants: [],
  harvestQueue: [],
  loading: false,
  error: null,

  fetchPlants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await plantsApi.getPlants();
      set({ plants: response.plants, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch plants', loading: false });
    }
  },

  createPlant: async (plant: CreatePlantRequest) => {
    set({ loading: true, error: null });
    try {
      const newPlant = await plantsApi.createPlant(plant);
      set((state) => ({
        plants: [...state.plants, newPlant],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create plant', loading: false });
    }
  },

  updatePlant: async (id: number, plantUpdates: UpdatePlantRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedPlant = await plantsApi.updatePlant(id, plantUpdates);
      set((state) => ({
        plants: state.plants.map((p) => (p.id === id ? updatedPlant : p)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update plant', loading: false });
    }
  },

  fetchHarvestQueue: async () => {
    set({ loading: true, error: null });
    try {
      const response = await harvestApi.getQueue();
      set({ harvestQueue: response.tasks, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch harvest queue', loading: false });
    }
  },

  triggerHarvest: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await harvestApi.triggerHarvest(id);
      // Wait for the action to complete, then refetch or optimistically update
      await get().fetchHarvestQueue();
    } catch (err: any) {
      set({ error: err.message || 'Failed to trigger harvest', loading: false });
    }
  },
}));
