import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FILES_BASE_URL } from '@/src/config/api';
import { useCart } from '@/src/context/cart-context';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { useWishlist } from '@/src/context/wishlist-context';
import { Product } from '@/src/types/models';

export default function WishlistScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { items, clear, remove } = useWishlist();
  const { add } = useCart();

  async function moveToCart(item: (typeof items)[number]) {
    const product: Product = {
      _id: item.productId,
      name: item.name,
      ref: item.ref,
      desc: item.name,
      price: item.price,
      category: item.category || 'Other',
      stock: 1,
      remisComposerd: { enabled: false, percentage: 0 },
      thumbnail: item.thumbnail,
      images: item.thumbnail ? [item.thumbnail] : [],
      createdAt: item.addedAt,
    };

    await add(product, 1);
    await remove(item.productId);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Wishlist</Text>
        {items.length ? (
          <Pressable onPress={clear}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Your wishlist is empty.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/product/${item.productId}`)} style={styles.card}>
            <Image source={{ uri: getImageUrl(item.thumbnail) }} style={styles.thumbnail} />
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.category || 'Other'}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={() => void moveToCart(item)}>
                  <Text style={styles.actionText}>Move to cart</Text>
                </Pressable>
                <Pressable style={styles.removeButton} onPress={() => void remove(item.productId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}
      />
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

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  clearText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  listContent: {
    gap: 10,
    paddingBottom: 120,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    color: colors.textSoft,
  },
  price: {
    color: colors.success,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 12,
  },
  });
}