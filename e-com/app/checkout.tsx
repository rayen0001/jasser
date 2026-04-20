import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ordersApi } from '@/src/api/orders';
import CarteModal from '@/src/components/CarteModal';
import { useAuth } from '@/src/context/auth-context';
import { useCart } from '@/src/context/cart-context';
import { useAppTheme } from '@/src/hooks/use-app-theme';

type PaymentMethod = 'cash' | 'card';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { user, token } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [shippingAddress, setShippingAddress] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const total = useMemo(() => subtotal, [subtotal]);

  async function placeOrder() {
    setErrorMessage('');
    setSuccessMessage('');

    if (!items.length) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!shippingAddress.trim()) {
      setErrorMessage('Shipping address is required.');
      return;
    }

    if (!user || !token) {
      setErrorMessage('Please login before placing an order.');
      return;
    }

    if (paymentMethod === 'card') {
      const cardError = validateCard(cardName, cardNumber, cardExpiry, cardCvv);
      if (cardError) {
        setErrorMessage(cardError);
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      await Promise.all(
        items.map((item) =>
          ordersApi.create(
            {
              userId: user.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              shippingAddress: shippingAddress.trim(),
              paymentMethod,
            },
            token
          )
        )
      );

      await clear();
      setSuccessMessage('Payment verified and order placed successfully.');
      setShippingAddress('');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setTimeout(() => {
        router.replace('/(tabs)/cart');
      }, 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardShell}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Checkout</Text>
        <Text style={styles.subheading}>Complete your payment and confirm delivery details.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order summary</Text>
          <Text style={styles.summaryText}>Items: {items.length}</Text>
          <Text style={styles.summaryTotal}>Total: ${total.toFixed(2)}</Text>
        </View>

        <Text style={styles.label}>Shipping address</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Street, city, ZIP..."
          placeholderTextColor={colors.textSoft}
          value={shippingAddress}
          onChangeText={setShippingAddress}
        />

        <Text style={styles.label}>Payment method</Text>
        <View style={styles.methodRow}>
          <Pressable
            onPress={() => setPaymentMethod('cash')}
            style={[styles.methodChip, paymentMethod === 'cash' && styles.methodChipActive]}>
            <Text style={[styles.methodChipText, paymentMethod === 'cash' && styles.methodChipTextActive]}>Cash</Text>
          </Pressable>
          <Pressable
            onPress={() => setPaymentMethod('card')}
            style={[styles.methodChip, paymentMethod === 'card' && styles.methodChipActive]}>
            <Text style={[styles.methodChipText, paymentMethod === 'card' && styles.methodChipTextActive]}>Card</Text>
          </Pressable>
        </View>

        {paymentMethod === 'card' ? (
          <View style={styles.cardBlock}>
            <Pressable style={styles.cardModalTrigger} onPress={() => setShowCardModal(true)}>
              <Text style={styles.cardModalTriggerTitle}>Open card input modal</Text>
              <Text style={styles.cardModalTriggerSubtitle}>Tap to enter card details with the visual card form.</Text>
            </Pressable>

            {cardNumber ? (
              <View style={styles.cardPreviewBox}>
                <Text style={styles.cardPreviewTitle}>Card saved</Text>
                <Text style={styles.cardPreviewText}>Name: {cardName || '-'}</Text>
                <Text style={styles.cardPreviewText}>Number: **** **** **** {cardNumber.slice(-4)}</Text>
                <Text style={styles.cardPreviewText}>Expiry: {cardExpiry || '-'}</Text>
              </View>
            ) : (
              <Text style={styles.cardMissingText}>No card details yet. Open the modal and confirm payment details first.</Text>
            )}
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        <Pressable style={styles.payButton} onPress={placeOrder} disabled={isPlacingOrder}>
          {isPlacingOrder ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>Pay & Place Order</Text>}
        </Pressable>
      </ScrollView>

      <CarteModal
        visible={showCardModal}
        onClose={() => setShowCardModal(false)}
        onSubmit={(data) => {
          setCardName(data.name);
          setCardNumber(data.cardNumber);
          setCardExpiry(data.expiry);
          setCardCvv(data.cvv);
          setShowCardModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function validateCard(name: string, numberRaw: string, expiryRaw: string, cvvRaw: string): string | null {
  if (!name.trim()) {
    return 'Card holder name is required.';
  }

  const number = numberRaw.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(number)) {
    return 'Card number must contain 13 to 19 digits.';
  }

  if (!isLuhnValid(number)) {
    return 'Card number is not valid.';
  }

  const expiry = expiryRaw.trim();
  const expiryMatch = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!expiryMatch) {
    return 'Expiry must be in MM/YY format.';
  }

  const month = Number(expiryMatch[1]);
  const year = Number(expiryMatch[2]) + 2000;
  const now = new Date();
  const expiryDate = new Date(year, month, 0, 23, 59, 59);
  if (expiryDate < now) {
    return 'Card is expired.';
  }

  if (!/^\d{3,4}$/.test(cvvRaw.trim())) {
    return 'CVV must be 3 or 4 digits.';
  }

  return null;
}

function isLuhnValid(number: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  keyboardShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 10,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subheading: {
    color: colors.textMuted,
    marginBottom: 6,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    backgroundColor: colors.surface,
    gap: 4,
  },
  summaryTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  summaryText: {
    color: colors.textMuted,
  },
  summaryTotal: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 20,
  },
  label: {
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  methodChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  methodChipText: {
    color: colors.text,
    fontWeight: '600',
  },
  methodChipTextActive: {
    color: colors.primary,
  },
  cardBlock: {
    gap: 8,
  },
  cardModalTrigger: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  cardModalTriggerTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  cardModalTriggerSubtitle: {
    color: colors.textSoft,
  },
  cardPreviewBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  cardPreviewTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  cardPreviewText: {
    color: colors.textMuted,
  },
  cardMissingText: {
    color: colors.danger,
    fontWeight: '600',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineField: {
    flex: 1,
    gap: 4,
  },
  errorText: {
    color: colors.danger,
  },
  successText: {
    color: colors.success,
  },
  payButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  });
}