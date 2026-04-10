import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { Product } from '../models/products.models';

export interface CartItem {
  productId: string;
  name: string;
  ref: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private readonly storageKey = 'shared_cart_items';
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  constructor() {
    void this.hydrate();
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getItemsCount(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  has(productId: string): boolean {
    return this.itemsSubject.value.some((item) => item.productId === productId);
  }

  async add(product: Product, quantity = 1): Promise<void> {
    if (!product?._id || quantity <= 0) {
      return;
    }

    const items = [...this.itemsSubject.value];
    const index = items.findIndex((item) => item.productId === product._id);

    if (index === -1) {
      items.push({
        productId: product._id,
        name: product.name,
        ref: product.ref,
        price: product.price,
        quantity,
        thumbnail: product.thumbnail,
        category: product.category,
      });
    } else {
      items[index] = {
        ...items[index],
        quantity: items[index].quantity + quantity,
        price: product.price,
        name: product.name,
        ref: product.ref,
        thumbnail: product.thumbnail,
        category: product.category,
      };
    }

    await this.persist(items);
  }

  async setQuantity(productId: string, quantity: number): Promise<void> {
    const items = [...this.itemsSubject.value];
    const index = items.findIndex((item) => item.productId === productId);
    if (index === -1) {
      return;
    }

    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index] = { ...items[index], quantity };
    }

    await this.persist(items);
  }

  async increment(productId: string): Promise<void> {
    const item = this.itemsSubject.value.find((entry) => entry.productId === productId);
    if (!item) {
      return;
    }

    await this.setQuantity(productId, item.quantity + 1);
  }

  async decrement(productId: string): Promise<void> {
    const item = this.itemsSubject.value.find((entry) => entry.productId === productId);
    if (!item) {
      return;
    }

    await this.setQuantity(productId, item.quantity - 1);
  }

  async remove(productId: string): Promise<void> {
    const items = this.itemsSubject.value.filter((item) => item.productId !== productId);
    await this.persist(items);
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
      const parsed = JSON.parse(value) as CartItem[];
      this.itemsSubject.next(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.itemsSubject.next([]);
    }
  }

  private async persist(items: CartItem[]): Promise<void> {
    this.itemsSubject.next(items);
    await Preferences.set({ key: this.storageKey, value: JSON.stringify(items) });
  }
}
