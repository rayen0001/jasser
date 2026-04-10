import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonContent, IonIcon ,IonBackButton,IonButtons,IonHeader, IonToolbar} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, heartOutline, arrowBackOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/models/products.models';
import { Products } from 'src/app/services/products';
import { Cart } from 'src/app/services/cart';
import { Wishlist } from 'src/app/services/wishlist';
@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.page.html',
  styleUrls: ['./productdetails.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton, IonIcon,IonBackButton,IonButtons,IonHeader, IonToolbar],
})
export class ProductdetailsPage implements OnInit {
  product: Product | null = null;
  isLoading = false;
  errorMessage = '';

  readonly cartIcon = cartOutline;
  readonly wishlistIcon = heartOutline;
  readonly backIcon = arrowBackOutline;

  private readonly filesBaseUrl = environment.baseUrl.replace('/api', '');

  constructor(
    private route: ActivatedRoute,
    private productsService: Products,
    private cartService: Cart,
    private wishlistService: Wishlist
  ) {
    addIcons({ cartOutline, heartOutline, arrowBackOutline });
  }

  ngOnInit() {
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

}
