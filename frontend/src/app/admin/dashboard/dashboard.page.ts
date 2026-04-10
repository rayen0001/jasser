import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Orders } from 'src/app/services/orders';
import { Products } from 'src/app/services/products';
import { Feedbacks } from 'src/app/services/feedback';
import { OrderStats } from 'src/app/models/orders.models';
import { GlobalStats } from 'src/app/models/feedback.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class DashboardPage implements OnInit {
  isLoading = false;
  errorMessage = '';

  orderStats: OrderStats = {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    statusCounts: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
  };

  feedbackStats: GlobalStats = {
    totalFeedbacks: 0,
    averageRate: 0,
    totalHelpful: 0,
    totalUnhelpful: 0,
  };

  productCount = 0;

  constructor(
    private ordersService: Orders,
    private productsService: Products,
    private feedbackService: Feedbacks
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.stats().subscribe({
      next: (res) => {
        this.orderStats = res.stats;
      },
      error: () => {
        this.errorMessage = 'Failed to load dashboard stats.';
      },
    });

    this.productsService.getAll().subscribe({
      next: (res) => {
        this.productCount = res.products.length;
      },
      error: () => {
        this.errorMessage = 'Failed to load product stats.';
      },
    });

    this.feedbackService.globalStats().subscribe({
      next: (res) => {
        this.feedbackStats = res.stats;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load feedback stats.';
        this.isLoading = false;
      },
    });
  }

}
