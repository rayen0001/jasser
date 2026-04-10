import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from 'src/app/models/orders.models';
import { Auth } from 'src/app/services/auth';
import { Orders } from 'src/app/services/orders';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';

  private readonly filesBaseUrl = environment.baseUrl.replace('/api', '');

  constructor(
    private ordersService: Orders,
    private authService: Auth
  ) {}

  ngOnInit() {
    void this.loadOrdersHistory();
  }

  async loadOrdersHistory(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await this.authService.getUser();
      if (!user?.id) {
        this.errorMessage = 'Please login to view your orders.';
        this.orders = [];
        this.isLoading = false;
        return;
      }

      const res = await firstValueFrom(this.ordersService.historyPerUser(user.id));
      this.orders = [...res.orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      this.errorMessage = 'Failed to load order history.';
      this.orders = [];
    } finally {
      this.isLoading = false;
    }
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

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
