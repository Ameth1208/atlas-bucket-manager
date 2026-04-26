'use client';
import { create } from 'zustand';

export type SetupStep = 1 | 2 | 3;

export interface AdminForm {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

interface SetupStore {
  step: SetupStep;
  loading: boolean;
  admin: AdminForm;
  setStep: (step: SetupStep) => void;
  setLoading: (loading: boolean) => void;
  setAdmin: (admin: Partial<AdminForm>) => void;
  reset: () => void;
}

const initialAdmin: AdminForm = {
  name: '',
  email: '',
  password: '',
  confirm: '',
};

export const useSetupStore = create<SetupStore>((set) => ({
  step: 1,
  loading: false,
  admin: initialAdmin,

  setStep: (step) => set({ step }),
  setLoading: (loading) => set({ loading }),

  setAdmin: (partial) =>
    set((state) => ({
      admin: { ...state.admin, ...partial },
    })),

  reset: () =>
    set({
      step: 1,
      loading: false,
      admin: initialAdmin,
    }),
}));
