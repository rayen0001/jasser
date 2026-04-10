import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { add, remove, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Subscription, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Auth } from 'src/app/services/auth';
import { Cart, CartItem } from 'src/app/services/cart';
import { Orders } from 'src/app/services/orders';

import * as L from 'leaflet';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule, FormsModule],
})
export class CartPage implements OnInit, OnDestroy {
  items: CartItem[] = [];
  subtotal = 0;
  shippingAddress = '';
  paymentMethod = 'cash';
  showMapPicker = false;
  pickedLocationText = '';
  pickedCoordinates: { lat: number; lng: number } | null = null;
  isPlacingOrder = false;
  errorMessage = '';
  successMessage = '';

  readonly addIcon = add;
  readonly removeIcon = remove;
  readonly trashIcon = trashOutline;

  private readonly filesBaseUrl = environment.baseUrl.replace('/api', '');
  private readonly subscriptions = new Subscription();

  // Using any to avoid type conflicts with @types/leaflet
  private mapInstance: any = null;
  private markerInstance: any = null;

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  constructor(
    private cartService: Cart,
    private ordersService: Orders,
    private authService: Auth
  ) {
    addIcons({ add, remove, trashOutline });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.cartService.items$.subscribe((items) => {
        this.items = items;
        this.subtotal = this.cartService.getSubtotal();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroyMapPicker();
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

  increment(productId: string): void {
    void this.cartService.increment(productId);
  }

  decrement(productId: string): void {
    void this.cartService.decrement(productId);
  }

  remove(productId: string): void {
    void this.cartService.remove(productId);
  }

  clearCart(): void {
    void this.cartService.clear();
  }

  openMapPicker(): void {
    this.showMapPicker = true;
    this.errorMessage = '';
    this.pickedLocationText = this.shippingAddress.trim();
    setTimeout(() => this.initializeMapPicker(), 50);
  }

  closeMapPicker(): void {
    this.showMapPicker = false;
    this.destroyMapPicker();
  }

  usePickedLocation(): void {
    if (!this.pickedLocationText) {
      this.errorMessage = 'Pick a location on the map first.';
      return;
    }
    this.shippingAddress = this.pickedLocationText;
    this.closeMapPicker();
  }

  async useCurrentLocation(): Promise<void> {
    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation is not supported in this browser.';
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      await this.updatePickedLocation(position.coords.latitude, position.coords.longitude, true);
    } catch {
      this.errorMessage = 'Unable to access your location.';
    }
  }

  private async initializeMapPicker(): Promise<void> {
    if (!this.showMapPicker || this.mapInstance || !this.mapContainer?.nativeElement) {
      return;
    }

    const mapRoot = this.mapContainer.nativeElement;
    mapRoot.innerHTML = '';

    const defaultCoords = this.pickedCoordinates || { lat: 33.8938, lng: 9.5375 }; // Tunisia center

    this.mapInstance = L.map(mapRoot, { zoomControl: true }).setView(
      [defaultCoords.lat, defaultCoords.lng],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.mapInstance);

    const customIcon = L.divIcon({
      className: 'location-marker',
      html: '<div class="location-marker-pin"></div>',
      iconSize: [24, 40],
      iconAnchor: [12, 40],
    });

    this.markerInstance = L.marker([defaultCoords.lat, defaultCoords.lng], {
      draggable: true,
      icon: customIcon,
    }).addTo(this.mapInstance);

    this.mapInstance.on('click', (event: any) => {
      this.updatePickedLocation(event.latlng.lat, event.latlng.lng, true);
    });

    this.markerInstance.on('dragend', () => {
      if (this.markerInstance) {
        const pos = this.markerInstance.getLatLng();
        this.updatePickedLocation(pos.lat, pos.lng, false);
      }
    });

    await this.updatePickedLocation(defaultCoords.lat, defaultCoords.lng, false);
  }

  private async updatePickedLocation(lat: number, lng: number, moveMap: boolean): Promise<void> {
    this.pickedCoordinates = { lat, lng };

    if (this.markerInstance) {
      this.markerInstance.setLatLng([lat, lng]);
    }

    if (this.mapInstance && moveMap) {
      this.mapInstance.setView([lat, lng], this.mapInstance.getZoom() || 13);
    }

    const addressText = await this.reverseGeocode(lat, lng);
    this.pickedLocationText = addressText || `Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) return null;
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return null;
    }
  }

  private destroyMapPicker(): void {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
    this.markerInstance = null;
  }

  async placeOrder(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.items.length) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }
    if (!this.shippingAddress.trim()) {
      this.errorMessage = 'Shipping address is required.';
      return;
    }

    const user = await this.authService.getUser();
    if (!user?.id) {
      this.errorMessage = 'Please login before placing an order.';
      return;
    }

    this.isPlacingOrder = true;

    try {
      await Promise.all(
        this.items.map((item) =>
          firstValueFrom(
            this.ordersService.create({
              userId: user.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              shippingAddress: this.shippingAddress.trim(),
              paymentMethod: this.paymentMethod,
            })
          )
        )
      );

      await this.cartService.clear();
      this.shippingAddress = '';
      this.paymentMethod = 'cash';
      this.successMessage = 'Order placed successfully!';
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Failed to place order. Please try again.';
    } finally {
      this.isPlacingOrder = false;
    }
  }
}