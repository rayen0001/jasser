import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonAvatar,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRange,
  IonSpinner,
  IonTextarea,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, heartOutline, arrowBackOutline, star, starOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/models/products.models';
import { Products } from 'src/app/services/products';
import { Cart } from 'src/app/services/cart';
import { Wishlist } from 'src/app/services/wishlist';
import { Feedbacks } from 'src/app/services/feedback';
import { Auth } from 'src/app/services/auth';
import { CreateFeedbackPayload, Feedback, ProductStats } from 'src/app/models/feedback.models';
import { AuthUser } from 'src/app/models/auth.models';
@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.page.html',
  styleUrls: ['./productdetails.page.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRange,
    IonSpinner,
    IonTextarea,
    IonText,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class ProductdetailsPage implements OnInit {
  product: Product | null = null;
  isLoading = false;
  errorMessage = '';
  feedbacks: Feedback[] = [];
  feedbackStats: ProductStats | null = null;
  feedbackLoading = false;
  feedbackError = '';
  feedbackSuccess = '';
  currentUser: AuthUser | null = null;
  feedbackForm = {
    rating: 5,
    comment: '',
  };

  readonly cartIcon = cartOutline;
  readonly wishlistIcon = heartOutline;
  readonly backIcon = arrowBackOutline;
  readonly starIcon = star;
  readonly starOutlineIcon = starOutline;
  readonly feedbackEmptyIcon = chatbubbleEllipsesOutline;
  readonly ratingIcons = [1, 2, 3, 4, 5];

  private readonly filesBaseUrl = environment.baseUrl.replace('/api', '');

  constructor(
    private route: ActivatedRoute,
    private productsService: Products,
    private cartService: Cart,
    private wishlistService: Wishlist,
    private feedbackService: Feedbacks,
    private auth: Auth
  ) {
    addIcons({ cartOutline, heartOutline, arrowBackOutline, star, starOutline, chatbubbleEllipsesOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.loadSession();
    this.loadProduct();
  }

  loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.errorMessage = 'Product id not found in URL.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.productsService.getOne(productId).subscribe({
      next: (res) => {
        this.product = res.product;
        this.isLoading = false;
        void this.loadFeedback(productId);
      },
      error: () => {
        this.errorMessage = 'Failed to load product details.';
        this.isLoading = false;
      },
    });
  }

  getImageUrl(path?: string): string {
    if (!path) {
      return 'https://ionicframework.com/docs/img/demos/card-media.png';
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.filesBaseUrl}${path}`;
  }

  getDiscountedPrice(product: Product): number {
    const discount = product.remisComposerd?.enabled ? product.remisComposerd.percentage : 0;
    if (!discount) {
      return product.price;
    }
    return Math.max(0, Number((product.price * (1 - discount / 100)).toFixed(2)));
  }

  addToCart(): void {
    if (!this.product) return;
    void this.cartService.add(this.product, 1);
  }

  addToWishlist(): void {
    if (!this.product) return;
    void this.wishlistService.add(this.product);
  }

  async submitFeedback(): Promise<void> {
    if (!this.product) {
      return;
    }

    if (!this.currentUser) {
      this.feedbackError = 'Please sign in to post feedback.';
      return;
    }

    const rating = Number(this.feedbackForm.rating);
    if (!rating || rating < 1 || rating > 5) {
      this.feedbackError = 'Please choose a rating from 1 to 5.';
      return;
    }

    this.feedbackLoading = true;
    this.feedbackError = '';
    this.feedbackSuccess = '';

    const payload: CreateFeedbackPayload = {
      productId: this.product._id,
      userId: this.currentUser.id,
      rating,
      comment: this.feedbackForm.comment.trim() || undefined,
    };

    try {
      const response = await firstValueFrom(this.feedbackService.create(payload));
      this.feedbacks = [response.feedback, ...this.feedbacks];
      this.feedbackForm.comment = '';
      this.feedbackForm.rating = 5;
      this.feedbackSuccess = 'Feedback posted successfully.';
      await this.refreshFeedbackStats();
    } catch {
      this.feedbackError = 'Failed to post feedback.';
    } finally {
      this.feedbackLoading = false;
    }
  }

  getUserAvatar(user?: Feedback['userId']): string {
    const avatar = user?.avatar?.trim();
    if (avatar) {
      return avatar;
    }

    const seed = [user?.username, user?.firstname, user?.lastname].filter(Boolean).join(' ').trim() || 'guest';
    return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,ffd5dc,c0aede,ffdfbf`;
  }

  getReviewerName(feedback: Feedback): string {
    return [feedback.userId.firstname, feedback.userId.lastname].filter(Boolean).join(' ').trim() || feedback.userId.username;
  }

  getAverageRating(): string {
    if (this.feedbackStats) {
      return this.feedbackStats.averageRate.toFixed(1);
    }

    if (this.product?.averageRate !== undefined) {
      return this.product.averageRate.toFixed(1);
    }

    return '0.0';
  }

  isStarFilled(starIndex: number, rating: number): boolean {
    return starIndex <= rating;
  }

  private async loadSession(): Promise<void> {
    this.currentUser = await this.auth.getUser();
  }

  private async loadFeedback(productId: string): Promise<void> {
    this.feedbackLoading = true;
    this.feedbackError = '';

    try {
      const feedbackResponse = await firstValueFrom(this.feedbackService.getPerProduct(productId));
      this.feedbacks = feedbackResponse.feedbacks;
    } catch {
      this.feedbackError = 'Feedback could not be loaded right now.';
    }

    await this.refreshFeedbackStats(productId);
    this.feedbackLoading = false;
  }

  private async refreshFeedbackStats(productId?: string): Promise<void> {
    const currentProductId = productId || this.product?._id;
    if (!currentProductId) {
      return;
    }

    try {
      const statsResponse = await firstValueFrom(this.feedbackService.statsPerProduct(currentProductId));
      this.feedbackStats = statsResponse.stats;
    } catch {
      this.feedbackStats = null;
    }
  }

}
