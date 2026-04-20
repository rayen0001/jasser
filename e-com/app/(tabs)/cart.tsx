import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FILES_BASE_URL } from '@/src/config/api';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { useCart } from '@/src/context/cart-context';

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { items, subtotal, increment, decrement, remove, clear } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Cart</Text>
        {items.length ? (
          <Pressable onPress={clear}>
            <Text style={styles.clearText}>Clear cart</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: getImageUrl(item.thumbnail) }} style={styles.thumbnail} />
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.ref}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>

              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyButton} onPress={() => void decrement(item.productId)}>
                  <Text style={styles.qtyButtonText}>-</Text>
                </Pressable>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Pressable style={styles.qtyButton} onPress={() => void increment(item.productId)}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
                <Pressable style={styles.removeButton} onPress={() => void remove(item.productId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <Pressable
          style={[styles.checkoutButton, !items.length && styles.checkoutButtonDisabled]}
          disabled={!items.length}
          onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </Pressable>
      </View>
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
    paddingBottom: 130,
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
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  qtyButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  qtyText: {
    minWidth: 22,
    textAlign: 'center',
    color: colors.text,
    fontWeight: '700',
  },
  removeButton: {
    marginLeft: 'auto',
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
  checkoutBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: colors.textSoft,
    fontSize: 12,
  },
  totalValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkoutButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  });
}