import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cart, cartOutline, heart, heartOutline, personOutline, storefrontOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/models/products.models';
import { Cart } from 'src/app/services/cart';
import { Products } from 'src/app/services/products';
import { Wishlist } from 'src/app/services/wishlist';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonButton,
    IonIcon,
  ],
})
export class ShopPage implements OnInit, OnDestroy {
  shopIcon = storefrontOutline;
  cartIcon = cartOutline;
  wishlistIcon = heartOutline;
  profileIcon = personOutline;
  readonly filledHeartIcon = heart;
  readonly filledCartIcon = cart;

  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  private readonly filesBaseUrl = environment.baseUrl.replace('/api', '');
  private readonly subscriptions = new Subscription();
  private wishlistIds = new Set<string>();
  private cartIds = new Set<string>();

  constructor(
    private router: Router,
    private productsService: Products,
    private cartService: Cart,
    private wishlistService: Wishlist
  ) {
    addIcons({ cartOutline, cart, heartOutline, heart, personOutline, storefrontOutline });
  }

  ngOnInit() {
    this.loadProducts();

    this.subscriptions.add(
      this.wishlistService.items$.subscribe((items) => {
        this.wishlistIds = new Set(items.map((item) => item.productId));
      })
    );

    this.subscriptions.add(
      this.cartService.items$.subscribe((items) => {
        this.cartIds = new Set(items.map((item) => item.productId));
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productsService.getAll().subscribe({
      next: (res) => {
        this.products = res.products;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load products.';
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

  isInWishlist(productId: string): boolean {
    return this.wishlistIds.has(productId);
  }

  isInCart(productId: string): boolean {
    return this.cartIds.has(productId);
  }

  goToProductDetails(productId: string): void {
    void this.router.navigate(['/productdetails', productId]);
  }

  async addToCart(product: Product): Promise<void> {
    await this.cartService.add(product, 1);
    this.cartIds.add(product._id);
  }

  async toggleWishlist(product: Product): Promise<void> {
    const added = await this.wishlistService.toggle(product);
    if (added) {
      this.wishlistIds.add(product._id);
      return;
    }
    this.wishlistIds.delete(product._id);
  }
  
}
