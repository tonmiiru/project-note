import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { login as apiLogin, signup as apiSignup } from '@/lib/api';
import { Session, User } from '@supabase/supabase-js';
type UserTier = 'free' | 'plus';
type AuthState = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  tier: UserTier;
};
type AuthActions = {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  upgrade: () => Promise<boolean>; // Mock upgrade for now
  _setSession: (session: Session | null) => void;
};
async function apiUpgrade(): Promise<{ success: boolean }> {
  // This is a mock API call. In a real app, this would trigger a payment flow
  // and update the user's tier in Supabase via an edge function.
  return Promise.resolve({ success: true });
}
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      session: null,
      user: null,
      isAuthenticated: false,
      tier: 'free',
      login: async (email, password) => {
        const session = await apiLogin(email, password);
        if (session) {
          set((state) => {
            state.session = session;
            state.user = session.user;
            state.isAuthenticated = true;
            state.tier = (session.user?.user_metadata?.tier as UserTier) || 'free';
          });
          return true;
        }
        return false;
      },
      signup: async (email, password) => {
        const session = await apiSignup(email, password);
        if (session) {
          set((state) => {
            state.session = session;
            state.user = session.user;
            state.isAuthenticated = true;
            state.tier = (session.user?.user_metadata?.tier as UserTier) || 'free';
          });
          return true;
        }
        return false;
      },
      logout: () => {
        set((state) => {
          state.session = null;
          state.user = null;
          state.isAuthenticated = false;
          state.tier = 'free';
        });
      },
      upgrade: async () => {
        const { success } = await apiUpgrade();
        if (success) {
          set((state) => {
            // In a real app, you would re-fetch the user/session to get the updated tier
            state.tier = 'plus';
            if (state.user?.user_metadata) {
              state.user.user_metadata.tier = 'plus';
            }
          });
        }
        return success;
      },
      _setSession: (session) => {
        set((state) => {
          state.session = session;
          state.user = session?.user ?? null;
          state.isAuthenticated = !!session;
          state.tier = (session?.user?.user_metadata?.tier as UserTier) || 'free';
        });
      },
    })),
    {
      name: 'pointflow-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setSession(state.session);
        }
      },
    }
  )
);