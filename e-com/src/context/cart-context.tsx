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

import { CartItem, Product } from '@/src/types/models';

const STORAGE_KEY = 'shared_cart_items';

type CartContextValue = {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  has: (productId: string) => boolean;
  add: (product: Product, quantity?: number) => Promise<void>;
  increment: (productId: string) => Promise<void>;
  decrement: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const persist = useCallback(async (nextItems: CartItem[]) => {
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
          const parsed = JSON.parse(raw) as CartItem[];
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
    async (product: Product, quantity = 1) => {
      if (!product?._id || quantity <= 0) {
        return;
      }

      const nextItems = [...items];
      const index = nextItems.findIndex((entry) => entry.productId === product._id);

      if (index === -1) {
        nextItems.push({
          productId: product._id,
          name: product.name,
          ref: product.ref,
          price: product.price,
          quantity,
          thumbnail: product.thumbnail,
          category: product.category,
        });
      } else {
        nextItems[index] = {
          ...nextItems[index],
          quantity: nextItems[index].quantity + quantity,
          price: product.price,
          name: product.name,
          ref: product.ref,
          thumbnail: product.thumbnail,
          category: product.category,
        };
      }

      await persist(nextItems);
    },
    [items, persist]
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const nextItems = [...items];
      const index = nextItems.findIndex((entry) => entry.productId === productId);
      if (index === -1) {
        return;
      }

      if (quantity <= 0) {
        nextItems.splice(index, 1);
      } else {
        nextItems[index] = {
          ...nextItems[index],
          quantity,
        };
      }

      await persist(nextItems);
    },
    [items, persist]
  );

  const increment = useCallback(
    async (productId: string) => {
      const item = items.find((entry) => entry.productId === productId);
      if (!item) {
        return;
      }

      await setQuantity(productId, item.quantity + 1);
    },
    [items, setQuantity]
  );

  const decrement = useCallback(
    async (productId: string) => {
      const item = items.find((entry) => entry.productId === productId);
      if (!item) {
        return;
      }

      await setQuantity(productId, item.quantity - 1);
    },
    [items, setQuantity]
  );

  const remove = useCallback(
    async (productId: string) => {
      await persist(items.filter((entry) => entry.productId !== productId));
    },
    [items, persist]
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const value = useMemo<CartContextValue>(() => {
    const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    return {
      items,
      itemsCount,
      subtotal,
      has,
      add,
      increment,
      decrement,
      remove,
      clear,
    };
  }, [add, clear, decrement, has, increment, items, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}