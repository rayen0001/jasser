import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ordersApi } from '@/src/api/orders';
import { FILES_BASE_URL } from '@/src/config/api';
import { useAuth } from '@/src/context/auth-context';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { Order } from '@/src/types/models';

export default function OrdersScreen() {
  const { user, token } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const statusStyles = useMemo(() => createStatusStyles(isDark), [isDark]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const orderCount = useMemo(() => orders.length, [orders.length]);

  const loadOrders = useCallback(async () => {
    if (!user?.id || !token) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      setErrorMessage('');
      return;
    }

    setErrorMessage('');

    try {
      const response = await ordersApi.historyPerUser(user.id, token);
      setOrders(response.orders);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function onRefresh() {
    setRefreshing(true);
    await loadOrders();
  }

  if (!user) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={54} color={colors.textSoft} />
        <Text style={styles.heading}>Orders</Text>
        <Text style={styles.helperText}>Sign in to see your order history.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.heading}>Orders</Text>
        <Text style={styles.subheading}>{orderCount} total orders</Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>Loading order history...</Text>
        </View>
      ) : null}

      {!loading && errorMessage ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadOrders()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !errorMessage ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.helperText}>No orders yet. Your checkout results will appear here.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.cardTitle}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <StatusPill status={item.status} statusStyles={statusStyles} appStyles={styles} />
              </View>

              <Text style={styles.address} numberOfLines={2}>
                {item.shippingAddress}
              </Text>

              <View style={styles.itemsList}>
                {item.items.map((orderItem) => (
                  <View key={`${item._id}-${orderItem.productId._id}`} style={styles.orderItemRow}>
                    <Image source={{ uri: getImageUrl(orderItem.productId.thumbnail) }} style={styles.thumbnail} />
                    <View style={styles.orderItemBody}>
                      <Text style={styles.itemName}>{orderItem.productId.name}</Text>
                      <Text style={styles.cardMeta}>Ref: {orderItem.productId.ref}</Text>
                      <Text style={styles.cardMeta}>
                        Qty {orderItem.quantity} · ${orderItem.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.cardBottomRow}>
                <Text style={styles.paymentText}>Payment: {item.paymentMethod}</Text>
                <Text style={styles.totalText}>${item.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          )}
        />
      ) : null}
    </View>
  );
}

function StatusPill({
  status,
  statusStyles,
  appStyles,
}: {
  status: Order['status'];
  statusStyles: ReturnType<typeof createStatusStyles>;
  appStyles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={[appStyles.statusPill, statusStyles[status]]}>
      <Text style={appStyles.statusText}>{status}</Text>
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

function createStatusStyles(isDark: boolean) {
  return StyleSheet.create({
    pending: { backgroundColor: isDark ? '#3f3215' : '#fef3c7' },
    processing: { backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' },
    shipped: { backgroundColor: isDark ? '#312e81' : '#e0e7ff' },
    delivered: { backgroundColor: isDark ? '#14532d' : '#dcfce7' },
    cancelled: { backgroundColor: isDark ? '#7f1d1d' : '#fee2e2' },
  });
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
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
    marginTop: 4,
    color: colors.textMuted,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  helperText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  cardMeta: {
    color: colors.textSoft,
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  address: {
    color: colors.textMuted,
    lineHeight: 19,
  },
  itemsList: {
    gap: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
  orderItemBody: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    color: colors.text,
    fontWeight: '700',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  paymentText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  totalText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 18,
  },
  });
}