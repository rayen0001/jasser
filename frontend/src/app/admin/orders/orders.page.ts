import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Orders } from 'src/app/services/orders';
import { Order, OrderStatus } from 'src/app/models/orders.models';

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
  savingOrderId: string | null = null;
  readonly statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(private ordersService: Orders) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.getAll().subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load orders.';
        this.isLoading = false;
      },
    });
  }

  updateStatus(order: Order, status: string): void {
    if (!this.statuses.includes(status as OrderStatus)) {
      return;
    }

    this.savingOrderId = order._id;
    this.ordersService.updateStatus(order._id, status as OrderStatus).subscribe({
      next: (res) => {
        order.status = res.order.status;
        this.savingOrderId = null;
      },
      error: () => {
        this.errorMessage = `Failed to update status for order ${order._id}.`;
        this.savingOrderId = null;
      },
    });
  }

}
