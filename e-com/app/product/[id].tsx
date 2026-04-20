import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { feedbackApi } from '@/src/api/feedback';
import { productsApi } from '@/src/api/products';
import { FILES_BASE_URL } from '@/src/config/api';
import { useAuth } from '@/src/context/auth-context';
import { useCart } from '@/src/context/cart-context';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { useWishlist } from '@/src/context/wishlist-context';
import { Feedback, Product, ProductStats } from '@/src/types/models';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const { add: addToCart, has: inCart } = useCart();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const productId = typeof id === 'string' ? id : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const averageRating = useMemo(() => {
    if (stats) {
      return stats.averageRate.toFixed(1);
    }

    if (product?.averageRate !== undefined) {
      return product.averageRate.toFixed(1);
    }

    return '0.0';
  }, [product?.averageRate, stats]);

  const loadFeedback = useCallback(async () => {
    if (!productId) {
      return;
    }

    setFeedbackLoading(true);
    try {
      const feedbackResponse = await feedbackApi.getPerProduct(productId);
      setFeedbacks(feedbackResponse.feedbacks);
    } catch {
      setFeedbacks([]);
    }

    if (token) {
      try {
        const statsResponse = await feedbackApi.statsPerProduct(productId, token);
        setStats(statsResponse.stats);
      } catch {
        setStats(null);
      }
    } else {
      setStats(null);
    }

    setFeedbackLoading(false);
  }, [productId, token]);

  const loadData = useCallback(async () => {
    if (!productId) {
      setErrorMessage('Missing product id.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await productsApi.getOne(productId);
      setProduct(response.product);
      await loadFeedback();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load product details.');
    } finally {
      setIsLoading(false);
    }
  }, [loadFeedback, productId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function submitFeedback() {
    setFeedbackMessage('');

    if (!user || !token) {
      setFeedbackMessage('Please sign in to post feedback.');
      return;
    }

    if (!product) {
      return;
    }

    if (rating < 1 || rating > 5) {
      setFeedbackMessage('Please choose a rating from 1 to 5.');
      return;
    }

    setFeedbackSubmitting(true);
    try {
      await feedbackApi.create(
        {
          productId: product._id,
          userId: user.id,
          rating,
          comment: comment.trim() || undefined,
        },
        token
      );

      setComment('');
      setRating(5);
      setFeedbackMessage('Feedback posted successfully.');
      await loadFeedback();
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : 'Failed to post feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.note}>Loading product...</Text>
      </View>
    );
  }

  if (errorMessage || !product) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{errorMessage || 'Product not found.'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: getImageUrl(product.thumbnail) }} style={styles.heroImage} />
      <Text style={styles.metaLine}>
        {product.category} - {product.ref}
      </Text>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productDesc}>{product.desc}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>${getDiscountedPrice(product).toFixed(2)}</Text>
        {product.remisComposerd?.enabled ? (
          <>
            <Text style={styles.oldPrice}>${product.price.toFixed(2)}</Text>
            <Text style={styles.discount}>-{product.remisComposerd.percentage}%</Text>
          </>
        ) : null}
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoItem}>Stock: {product.stock}</Text>
        <Text style={styles.infoItem}>Rating: {averageRating}/5</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryButton} onPress={() => void addToCart(product, 1)}>
          <Text style={styles.primaryButtonText}>{inCart(product._id) ? 'Added to Cart' : 'Add to Cart'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void toggleWishlist(product)}>
          <Text style={styles.secondaryButtonText}>
            {inWishlist(product._id) ? 'Remove Wishlist' : 'Add Wishlist'}
          </Text>
        </Pressable>
      </View>

      {product.images?.length ? (
        <ScrollView horizontal contentContainerStyle={styles.gallery} showsHorizontalScrollIndicator={false}>
          {product.images.map((img) => (
            <Image key={img} source={{ uri: getImageUrl(img) }} style={styles.galleryImage} />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Post feedback</Text>
        {!user ? <Text style={styles.note}>Sign in to share your review.</Text> : null}

        {user ? (
          <>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((starValue) => (
                <Pressable key={starValue} onPress={() => setRating(starValue)}>
                  <Ionicons
                    name={starValue <= rating ? 'star' : 'star-outline'}
                    size={24}
                    color={starValue <= rating ? '#f59e0b' : colors.textSoft}
                  />
                </Pressable>
              ))}
              <Text style={styles.note}>{rating}/5</Text>
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Tell others about the product"
              placeholderTextColor={colors.textSoft}
              multiline
              value={comment}
              onChangeText={setComment}
            />

            <Pressable style={styles.primaryButton} onPress={submitFeedback} disabled={feedbackSubmitting}>
              {feedbackSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Submit feedback</Text>
              )}
            </Pressable>
          </>
        ) : null}

        {feedbackMessage ? <Text style={styles.note}>{feedbackMessage}</Text> : null}
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Recent feedback</Text>
        {feedbackLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {!feedbackLoading && !feedbacks.length ? <Text style={styles.note}>No feedback yet.</Text> : null}

        {feedbacks.map((item) => (
          <View key={item._id} style={styles.feedbackItem}>
            <Image source={{ uri: getUserAvatar(item.userId) }} style={styles.feedbackAvatar} />
            <View style={styles.feedbackBody}>
              <Text style={styles.feedbackAuthor}>{getReviewerName(item)}</Text>
              <View style={styles.inlineRow}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Ionicons
                    key={`${item._id}-${starValue}`}
                    name={starValue <= item.rating ? 'star' : 'star-outline'}
                    size={14}
                    color={starValue <= item.rating ? '#f59e0b' : colors.textSoft}
                  />
                ))}
              </View>
              {item.comment ? <Text style={styles.feedbackComment}>{item.comment}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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

function getUserAvatar(user?: Feedback['userId']): string {
  const avatar = user?.avatar?.trim();
  if (avatar) {
    return avatar;
  }

  const seed = [user?.username, user?.firstname, user?.lastname].filter(Boolean).join(' ').trim() || 'guest';
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=b6e3f4,ffd5dc,c0aede,ffdfbf`;
}

function getReviewerName(feedback: Feedback): string {
  return (
    [feedback.userId.firstname, feedback.userId.lastname].filter(Boolean).join(' ').trim() ||
    feedback.userId.username
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
    paddingBottom: 120,
    gap: 10,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
  heroImage: {
    width: '100%',
    height: 260,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  metaLine: {
    color: colors.textSoft,
    fontWeight: '600',
  },
  productName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 28,
  },
  productDesc: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 24,
  },
  oldPrice: {
    color: colors.textSoft,
    textDecorationLine: 'line-through',
  },
  discount: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    marginTop: 2,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  infoItem: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  gallery: {
    gap: 8,
    paddingVertical: 4,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 17,
  },
  note: {
    color: colors.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: colors.surface,
    color: colors.text,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  feedbackItem: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  feedbackBody: {
    flex: 1,
    gap: 4,
  },
  feedbackAuthor: {
    color: colors.text,
    fontWeight: '700',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 2,
  },
  feedbackComment: {
    color: colors.textMuted,
    lineHeight: 19,
  },
  });
}