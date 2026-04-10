import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { chevronBack, chevronForward, cube, grid, logOutOutline, receipt, settingsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-sidbar',
  templateUrl: './sidbar.page.html',
  styleUrls: ['./sidbar.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
  ],
})
export class SidbarPage implements OnInit {
  dashboardIcon = grid;
  productsIcon = cube;
  ordersIcon = receipt;
  settingsIcon = settingsOutline;
  logoutIcon = logOutOutline;
  collapseIcon = chevronBack;
  expandIcon = chevronForward;
  isCollapsed = false;

  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: this.dashboardIcon },
    { label: 'Products', route: '/admin/products', icon: this.productsIcon },
    { label: 'Orders', route: '/admin/orders', icon: this.ordersIcon },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.router.navigateByUrl('/home');
  }
}
