import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { Product } from '../models/products.models';

export interface WishlistItem {
  productId: string;
  name: string;
  ref: string;
  price: number;
  thumbnail?: string;
  category?: string;
  addedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class Wishlist {
  private readonly storageKey = 'shared_wishlist_items';
  private readonly itemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  constructor() {
    void this.hydrate();
  }

  getItems(): WishlistItem[] {
    return this.itemsSubject.value;
  }

  getItemsCount(): number {
    return this.itemsSubject.value.length;
  }

  has(productId: string): boolean {
    return this.itemsSubject.value.some((item) => item.productId === productId);
  }

  async add(product: Product): Promise<void> {
    if (!product?._id || this.has(product._id)) {
      return;
    }

    const items = [
      {
        productId: product._id,
        name: product.name,
        ref: product.ref,
        price: product.price,
        thumbnail: product.thumbnail,
        category: product.category,
        addedAt: new Date().toISOString(),
      },
      ...this.itemsSubject.value,
    ];

    await this.persist(items);
  }

  async remove(productId: string): Promise<void> {
    const items = this.itemsSubject.value.filter((item) => item.productId !== productId);
    await this.persist(items);
  }

  async toggle(product: Product): Promise<boolean> {
    if (this.has(product._id)) {
      await this.remove(product._id);
      return false;
    }

    await this.add(product);
    return true;
  }

  async clear(): Promise<void> {
    await this.persist([]);
  }

  async refresh(): Promise<void> {
    await this.hydrate();
  }

  private async hydrate(): Promise<void> {
    const { value } = await Preferences.get({ key: this.storageKey });
    if (!value) {
      this.itemsSubject.next([]);
      return;
    }

    try {
      const parsed = JSON.parse(value) as WishlistItem[];
      this.itemsSubject.next(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.itemsSubject.next([]);
    }
  }

  private async persist(items: WishlistItem[]): Promise<void> {
    this.itemsSubject.next(items);
    await Preferences.set({ key: this.storageKey, value: JSON.stringify(items) });
  }
}
