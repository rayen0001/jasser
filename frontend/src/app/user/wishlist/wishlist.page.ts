import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { cartOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/models/products.models';
import { Cart } from 'src/app/services/cart';
import { Wishlist, WishlistItem } from 'src/app/services/wishlist';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule, FormsModule],
})
export class WishlistPage implements OnInit, OnDestroy {
  items: WishlistItem[] = [];

  readonly cartIcon = cartOutline;
  readonly trashIcon = trashOutline;

  private readonly filesBaseUrl = environment.baseUrl.replace('/api', '');
  private readonly subscriptions = new Subscription();

  constructor(
    private wishlistService: Wishlist,
    private cartService: Cart
  ) {
    addIcons({ cartOutline, trashOutline });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.wishlistService.items$.subscribe((items) => {
        this.items = items;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  remove(productId: string): void {
    void this.wishlistService.remove(productId);
  }

  moveToCart(item: WishlistItem): void {
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

    void this.cartService.add(product, 1);
    void this.wishlistService.remove(item.productId);
  }

  clearWishlist(): void {
    void this.wishlistService.clear();
  }
}
