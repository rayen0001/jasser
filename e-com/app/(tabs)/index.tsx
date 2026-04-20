import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FILES_BASE_URL } from '@/src/config/api';
import { productsApi } from '@/src/api/products';
import { useAuth } from '@/src/context/auth-context';
import { useCart } from '@/src/context/cart-context';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { useWishlist } from '@/src/context/wishlist-context';
import { Product } from '@/src/types/models';

export default function ShopScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { add: addToCart, has: inCart } = useCart();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await productsApi.getAll();
      setProducts(response.products);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.heading}>Shop</Text>
        <Text style={styles.subheading}>Discover products and open details instantly.</Text>
        {!user ? (
          <Pressable style={styles.authButton} onPress={() => router.push('/auth')}>
            <Text style={styles.authButtonText}>Sign in</Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Loading products...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadProducts} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/product/${item._id}`)} style={styles.card}>
              <Image source={{ uri: getImageUrl(item.thumbnail) }} style={styles.thumbnail} />
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.category} - {item.ref}
              </Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.desc}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>${getDiscountedPrice(item).toFixed(2)}</Text>
                {item.remisComposerd?.enabled ? (
                  <>
                    <Text style={styles.oldPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.discount}>-{item.remisComposerd.percentage}%</Text>
                  </>
                ) : null}
              </View>

              <Text style={styles.stock}>Stock: {item.stock}</Text>

              <View style={styles.actionsRow}>
                <Pressable style={styles.mainAction} onPress={() => void addToCart(item, 1)}>
                  <Ionicons name={inCart(item._id) ? 'cart' : 'cart-outline'} size={16} color="#fff" />
                  <Text style={styles.mainActionText}>Cart</Text>
                </Pressable>

                <Pressable style={styles.secondaryAction} onPress={() => void toggleWishlist(item)}>
                  <Ionicons
                    name={inWishlist(item._id) ? 'heart' : 'heart-outline'}
                    size={16}
                    color={inWishlist(item._id) ? '#b91c1c' : colors.text}
                  />
                  <Text style={styles.secondaryActionText}>Wishlist</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.stateText}>No products found.</Text>}
        />
      ) : null}
    </View>
  );
}

function getImageUrl(path?: string): string {
  if (!path) {
    return 'https://ionicframework.com/docs/img/demos/card-media.png';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${FILES_BASE_URL}${path}`;
}

function getDiscountedPrice(product: Product): number {
  const discount = product.remisComposerd?.enabled ? product.remisComposerd.percentage : 0;
  if (!discount) {
    return product.price;
  }

  return Math.max(0, Number((product.price * (1 - discount / 100)).toFixed(2)));
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  headerBlock: {
    marginBottom: 14,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subheading: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 15,
  },
  authButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  authButtonText: {
    color: isDark ? '#000' : '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardMeta: {
    marginTop: 2,
    color: colors.textSoft,
    fontSize: 13,
  },
  cardDesc: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: colors.textSoft,
  },
  discount: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  stock: {
    marginTop: 8,
    color: colors.textMuted,
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  mainAction: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mainActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryAction: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryActionText: {
    color: colors.text,
    fontWeight: '700',
  },
  centerState: {
    marginTop: 20,
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  });
}
