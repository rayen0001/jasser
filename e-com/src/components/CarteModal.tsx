import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { useAppTheme } from '@/src/hooks/use-app-theme';

export type CardType =
  | 'amex'
  | 'discover'
  | 'diners'
  | 'mastercard'
  | 'jcb15'
  | 'jcb'
  | 'maestro'
  | 'visa'
  | 'unionpay'
  | 'unknown';

const CARD_PATTERNS: { regex: RegExp; type: CardType; mask: string }[] = [
  { regex: /^3[47]\d{0,13}/, type: 'amex', mask: '#### ###### #####' },
  { regex: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/, type: 'discover', mask: '#### #### #### ####' },
  { regex: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/, type: 'diners', mask: '#### ###### ####' },
  { regex: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/, type: 'mastercard', mask: '#### #### #### ####' },
  { regex: /^(?:2131|1800)\d{0,11}/, type: 'jcb15', mask: '#### ###### #####' },
  { regex: /^(?:35\d{0,2})\d{0,12}/, type: 'jcb', mask: '#### #### #### ####' },
  { regex: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/, type: 'maestro', mask: '#### #### #### ####' },
  { regex: /^4\d{0,15}/, type: 'visa', mask: '#### #### #### ####' },
  { regex: /^62\d{0,14}/, type: 'unionpay', mask: '#### #### #### ####' },
];

const CARD_COLORS: Record<CardType, { light: string; dark: string }> = {
  visa: { light: '#03A9F4', dark: '#0288D1' },
  mastercard: { light: '#03A9F4', dark: '#0288D1' },
  amex: { light: '#ab47bc', dark: '#7b1fa2' },
  discover: { light: '#66bb6a', dark: '#388e3c' },
  diners: { light: '#26c6da', dark: '#0097a7' },
  jcb: { light: '#ef5350', dark: '#d32f2f' },
  jcb15: { light: '#ef5350', dark: '#d32f2f' },
  maestro: { light: '#ffeb3b', dark: '#f9a825' },
  unionpay: { light: '#26c6da', dark: '#0097a7' },
  unknown: { light: '#bdbdbd', dark: '#616161' },
};

function detectCardType(raw: string): CardType {
  for (const { regex, type } of CARD_PATTERNS) {
    if (regex.test(raw)) return type;
  }
  return 'unknown';
}

function formatCardNumber(raw: string, type: CardType): string {
  const digits = raw.replace(/\D/g, '');
  const isAmex = type === 'amex';
  const isDiners = type === 'diners';
  const isJcb15 = type === 'jcb15';

  if (isAmex || isJcb15) {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }

  if (isDiners) {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 14);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }

  return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

function maxDigits(type: CardType): number {
  if (type === 'amex') return 15;
  if (type === 'diners') return 14;
  if (type === 'jcb15') return 15;
  return 16;
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const TEST_CARDS = [
  '4000056655665556',
  '5200828282828210',
  '371449635398431',
  '6011000990139424',
  '30569309025904',
  '3566002020360505',
  '6200000000000005',
  '6759649826438453',
];

interface CardFrontProps {
  number: string;
  name: string;
  expiry: string;
  lightColor: string;
  darkColor: string;
}

function CardFront({ number, name, expiry, lightColor, darkColor }: CardFrontProps) {
  const displayNumber = number || '0123 4567 8910 1112';
  const displayName = name || 'JOHN DOE';
  const displayExpiry = expiry || '01/23';

  return (
    <Svg viewBox="0 0 750 471" width="100%" height="100%">
      <Path
        d="M40,0h670c22.1,0,40,17.9,40,40v391c0,22.1-17.9,40-40,40H40c-22.1,0-40-17.9-40-40V40C0,17.9,17.9,0,40,0z"
        fill={lightColor}
      />
      <Path
        d="M750,431V193.2c-217.6-57.5-556.4-13.5-750,24.9V431c0,22.1,17.9,40,40,40h670C732.1,471,750,453.1,750,431z"
        fill={darkColor}
      />

      <SvgText x="60" y="295" fill="#FFFFFF" fontFamily="Courier" fontWeight="600" fontSize="48" letterSpacing="4">
        {displayNumber}
      </SvgText>
      <SvgText x="54" y="390" fill="rgba(255,255,255,0.6)" fontFamily="Helvetica" fontSize="22">
        cardholder name
      </SvgText>
      <SvgText x="480" y="389" fill="rgba(255,255,255,0.6)" fontFamily="Helvetica" fontSize="22">
        expiration
      </SvgText>
      <SvgText x="65" y="242" fill="rgba(255,255,255,0.6)" fontFamily="Helvetica" fontSize="22">
        card number
      </SvgText>
      <SvgText x="54" y="428" fill="#FFFFFF" fontFamily="Courier" fontWeight="400" fontSize="30" textAnchor="start">
        {displayName.toUpperCase()}
      </SvgText>

      <SvgText x="574" y="434" fill="#FFFFFF" fontFamily="Courier" fontWeight="400" fontSize="32">
        {displayExpiry}
      </SvgText>
      <SvgText x="480" y="417" fill="#FFFFFF" fontFamily="Helvetica" fontWeight="300" fontSize="15">
        VALID
      </SvgText>
      <SvgText x="480" y="436" fill="#FFFFFF" fontFamily="Helvetica" fontWeight="300" fontSize="15">
        THRU
      </SvgText>
      <Polygon points="554.5,421 540.4,414.2 540.4,427.9" fill="#FFFFFF" />

      <Path
        d="M168.1,143.6H82.9c-10.2,0-18.5-8.3-18.5-18.5V74.9c0-10.2,8.3-18.5,18.5-18.5h85.3c10.2,0,18.5,8.3,18.5,18.5v50.2C186.6,135.3,178.3,143.6,168.1,143.6z"
        fill="#FFFFFF"
      />
      <Rect x="82" y="70" width="1.5" height="60" fill="#4C4C4C" />
      <Rect x="167.4" y="70" width="1.5" height="60" fill="#4C4C4C" />
      <Path
        d="M125.5,130.8c-10.2,0-18.5-8.3-18.5-18.5c0-4.6,1.7-8.9,4.7-12.3c-3-3.4-4.7-7.7-4.7-12.3c0-10.2,8.3-18.5,18.5-18.5s18.5,8.3,18.5,18.5c0,4.6-1.7,8.9-4.7,12.3c3,3.4,4.7,7.7,4.7,12.3C143.9,122.5,135.7,130.8,125.5,130.8z"
        fill="#4C4C4C"
      />
      <Rect x="82.8" y="82.1" width="25.8" height="1.5" fill="#4C4C4C" />
      <Rect x="82.8" y="117.9" width="26.1" height="1.5" fill="#4C4C4C" />
      <Rect x="142.4" y="82.1" width="25.8" height="1.5" fill="#4C4C4C" />
      <Rect x="142" y="117.9" width="26.2" height="1.5" fill="#4C4C4C" />
    </Svg>
  );
}

interface CardBackProps {
  security: string;
  name: string;
  darkColor: string;
}

function CardBack({ security, name, darkColor }: CardBackProps) {
  const displayCvv = security || '985';
  const displayName = name || 'John Doe';

  return (
    <Svg viewBox="0 0 750 471" width="100%" height="100%">
      <Path
        d="M40,0h670c22.1,0,40,17.9,40,40v391c0,22.1-17.9,40-40,40H40c-22.1,0-40-17.9-40-40V40C0,17.9,17.9,0,40,0z"
        fill={darkColor}
      />

      <Rect y="61.6" width="750" height="78" fill="#111111" />
      <Path
        d="M701.1,249.1H48.9c-3.3,0-6-2.7-6-6v-52.5c0-3.3,2.7-6,6-6h652.1c3.3,0,6,2.7,6,6v52.5C707.1,246.4,704.4,249.1,701.1,249.1z"
        fill="#F2F2F2"
      />
      <Rect x="42.9" y="198.6" width="664.1" height="10.5" fill="#D8D2DB" />
      <Rect x="42.9" y="224.5" width="664.1" height="10.5" fill="#D8D2DB" />
      <Path
        d="M701.1,184.6H618h-8h-10v64.5h10h8h83.1c3.3,0,6-2.7,6-6v-52.5C707.1,187.3,704.4,184.6,701.1,184.6z"
        fill="#C4C4C4"
      />

      <SvgText x="622" y="227" fontFamily="Courier" fontWeight="400" fontSize="27" fill="#111111">
        {displayCvv}
      </SvgText>
      <SvgText x="518" y="280" fill="rgba(255,255,255,0.6)" fontFamily="Helvetica" fontSize="24">
        security code
      </SvgText>
      <Rect x="58.1" y="378.6" width="375.5" height="13.5" fill="#EAEAEA" />
      <Rect x="58.1" y="405.6" width="421.7" height="13.5" fill="#EAEAEA" />
      <SvgText x="59.5" y="429" fontFamily="serif" fontSize="34" fill="#111111" fontStyle="italic">
        {displayName}
      </SvgText>
    </Svg>
  );
}

export interface CarteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    name: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardType: CardType;
  }) => void;
}

export default function CarteModal({ visible, onClose, onSubmit }: CarteModalProps) {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const flipAnim = useRef(new Animated.Value(0)).current;

  const cardType = detectCardType(cardNumber.replace(/\D/g, ''));
  const { light, dark } = CARD_COLORS[cardType];

  const flipToFront = () => {
    if (isFlipped) {
      setIsFlipped(false);
      Animated.spring(flipAnim, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  const flipToBack = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const handleCardNumberChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    const type = detectCardType(digits);
    const max = maxDigits(type);
    const trimmed = digits.slice(0, max);
    setCardNumber(formatCardNumber(trimmed, type));
  };

  const handleExpiryChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    setExpiry(formatExpiry(digits));
  };

  const handleCvvChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3);
    setCvv(digits);
  };

  const handleGenerateRandom = () => {
    const random = TEST_CARDS[Math.floor(Math.random() * TEST_CARDS.length)];
    const type = detectCardType(random);
    setCardNumber(formatCardNumber(random, type));
  };

  const handleReset = () => {
    setName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit?.({
      name,
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiry,
      cvv,
      cardType,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Payment Information</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => (isFlipped ? flipToFront() : flipToBack())}
              style={styles.cardContainer}>
              <Animated.View
                style={[
                  styles.cardFace,
                  { transform: [{ rotateY: frontInterpolate }] },
                  isFlipped && styles.hiddenFace,
                ]}>
                <CardFront
                  number={cardNumber}
                  name={name}
                  expiry={expiry}
                  lightColor={light}
                  darkColor={dark}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardBack,
                  { transform: [{ rotateY: backInterpolate }] },
                  !isFlipped && styles.hiddenFace,
                ]}>
                <CardBack security={cvv} name={name} darkColor={dark} />
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  maxLength={26}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textSoft}
                  autoCapitalize="characters"
                  onFocus={flipToFront}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Card Number</Text>
                  <TouchableOpacity onPress={handleGenerateRandom}>
                    <Text style={styles.generateBtn}>generate random</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.textSoft}
                  keyboardType="number-pad"
                  onFocus={flipToFront}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldGroup, styles.flex1, { marginRight: 8 }]}> 
                  <Text style={styles.label}>Expiration (mm/yy)</Text>
                  <TextInput
                    style={styles.input}
                    value={expiry}
                    onChangeText={handleExpiryChange}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.textSoft}
                    keyboardType="number-pad"
                    onFocus={flipToFront}
                    returnKeyType="next"
                  />
                </View>

                <View style={[styles.fieldGroup, styles.flex1]}>
                  <Text style={styles.label}>Security Code</Text>
                  <TextInput
                    style={styles.input}
                    value={cvv}
                    onChangeText={handleCvvChange}
                    placeholder={cardType === 'amex' ? '0000' : '000'}
                    placeholderTextColor={colors.textSoft}
                    keyboardType="number-pad"
                    secureTextEntry
                    onFocus={flipToBack}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: dark }]} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Confirm Payment</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginLeft: 32,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  cardContainer: {
    width: '100%',
    aspectRatio: 750 / 471,
    marginBottom: 24,
    transform: [{ perspective: 1000 }],
  },
  cardFace: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  hiddenFace: {
    pointerEvents: 'none',
  },
  form: {
    gap: 12,
    marginBottom: 20,
  },
  fieldGroup: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  generateBtn: {
    fontSize: 11,
    color: isDark ? '#000' : '#fff',
    backgroundColor: colors.text,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  });
}
