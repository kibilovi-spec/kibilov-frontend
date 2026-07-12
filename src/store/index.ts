import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { getToken, setToken, setRefreshToken, removeToken } from '@/lib/api';

// ── Auth Store ────────────────────────────────────────────────────────────────
interface User { id: string; name: string; email: string; phone?: string; role: 'USER' | 'ADMIN'; b2bStatus?: string; b2bDiscount?: number; b2bTier?: string; avatar?: string; createdAt?: string; }
interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  login: async (email, password) => {
    const r = await api.post('/api/auth/login', { email, password });
    const { user, accessToken, refreshToken } = r.data;
    setToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
    set({ user });
  },
  register: async (name, email, phone, password) => {
    const r = await api.post('/api/auth/register', { name, email, phone, password });
    const { user, accessToken, refreshToken } = r.data;
    setToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
    set({ user });
  },
  logout: async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    removeToken();
    set({ user: null });
  },
  fetchMe: async () => {
    if (!getToken()) { set({ initialized: true }); return; }
    try {
      const r = await api.get('/api/auth/me');
      set({ user: r.data.user || r.data, initialized: true });
    } catch {
      removeToken();
      set({ user: null, initialized: true });
    }
  },
}));

// ── Cart Store ────────────────────────────────────────────────────────────────
interface CartItem {
  id: string; productId: string; quantity: number; price: number;
  reservedUntil?: string | null;
  product?: { nameKa: string; images: string[]; sku: string; stock: number; };
}
interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  fetchCart: async () => {
    if (!getToken()) return;
    try {
      const r = await api.get('/api/cart');
      set({ items: r.data?.data?.items || r.data?.items || r.data || [] });
    } catch { set({ items: [] }); }
  },
  addItem: async (productId, quantity = 1) => {
    try {
      const r = await api.post('/api/cart', { productId, quantity });
      set({ items: r.data?.data?.items || r.data?.items || r.data || [] });
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'add_to_cart', { items: [{ item_id: productId, quantity }] });
      }
    } catch (e: any) {
      throw e;
    }
  },
  updateItem: async (productId, quantity) => {
    if (quantity <= 0) { get().removeItem(productId); return; }
    try {
      const r = await api.put(`/api/cart/${productId}`, { quantity });
      set({ items: r.data?.data?.items || r.data?.items || r.data || [] });
    } catch {}
  },
  removeItem: async (productId) => {
    try {
      const r = await api.delete(`/api/cart/${productId}`);
      set({ items: r.data?.data?.items || r.data?.items || r.data || [] });
    } catch {
      set(s => ({ items: s.items.filter(i => i.productId !== productId) }));
    }
  },
  clearCart: async () => {
    try { await api.delete('/api/cart'); } catch {}
    set({ items: [] });
  },
}));

// ── Lang Store ────────────────────────────────────────────────────────────────
interface LangState { lang: 'ka' | 'en' | 'ru'; setLang: (l: 'ka' | 'en' | 'ru') => void; _hasHydrated: boolean; setHasHydrated: (b: boolean) => void; }
const useLangStore = create<LangState>()(
  persist(
    (set) => ({ lang: 'ka', setLang: (lang) => set({ lang }), _hasHydrated: false, setHasHydrated: (b) => set({ _hasHydrated: b }) }),
    {
      name: 'kibilov-lang',
      skipHydration: true,
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true); },
    }
  )
);
export { useLangStore };
export function useLang() {
  const state = useLangStore();
  return { ...state, lang: state._hasHydrated ? state.lang : 'ka' };
}

interface WishlistState {
  items: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  isWished: (id: string) => boolean;
  fetchWishlist: () => Promise<void>;
}
export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  toggle: (id) => {
    const already = get().items.includes(id);
    set(s => ({ items: already ? s.items.filter(i=>i!==id) : [...s.items, id] }));
    if (already) {
      api.delete(`/api/wishlist/${id}`).catch(() => {
        set(s => ({ items: s.items.includes(id) ? s.items : [...s.items, id] }));
      });
    } else {
      api.post(`/api/wishlist/${id}`).catch(() => {
        set(s => ({ items: s.items.filter(i=>i!==id) }));
      });
    }
  },
  has: (id) => get().items.includes(id),
  isWished: (id) => get().items.includes(id),
  fetchWishlist: async () => {
    try {
      const r = await api.get('/api/wishlist');
      const ids = (r.data?.data || []).map((w: any) => w.productId);
      set({ items: ids });
    } catch {}
  },
}));
