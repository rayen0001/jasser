import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Product, WishlistItem } from '@/src/types/models';

const STORAGE_KEY = 'shared_wishlist_items';

type WishlistContextValue = {
  items: WishlistItem[];
  itemsCount: number;
  has: (productId: string) => boolean;
  add: (product: Product) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toggle: (product: Product) => Promise<boolean>;
  clear: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const persist = useCallback(async (nextItems: WishlistItem[]) => {
    setItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }, []);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) {
          return;
        }

        try {
          const parsed = JSON.parse(raw) as WishlistItem[];
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        } catch {
          setItems([]);
        }
      })
      .catch(() => {
        setItems([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const has = useCallback(
    (productId: string) => items.some((entry) => entry.productId === productId),
    [items]
  );

  const add = useCallback(
    async (product: Product) => {
      if (!product?._id || has(product._id)) {
        return;
      }

      await persist([
        {
          productId: product._id,
          name: product.name,
          ref: product.ref,
          price: product.price,
          thumbnail: product.thumbnail,
          category: product.category,
          addedAt: new Date().toISOString(),
        },
        ...items,
      ]);
    },
    [has, items, persist]
  );

  const remove = useCallback(
    async (productId: string) => {
      await persist(items.filter((entry) => entry.productId !== productId));
    },
    [items, persist]
  );

  const toggle = useCallback(
    async (product: Product) => {
      if (has(product._id)) {
        await remove(product._id);
        return false;
      }

      await add(product);
      return true;
    },
    [add, has, remove]
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      itemsCount: items.length,
      has,
      add,
      remove,
      toggle,
      clear,
    }),
    [add, clear, has, items, remove, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider');
  }
  return context;
}