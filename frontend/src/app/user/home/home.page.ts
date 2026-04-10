import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { cartOutline, heartOutline, personOutline, storefrontOutline,receipt } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon,
    RouterLink,
    CommonModule,
    FormsModule,
  ],
})
export class HomePage implements OnInit {
  shopIcon = storefrontOutline;
  cartIcon = cartOutline;
  wishlistIcon = heartOutline;
  profileIcon = personOutline;
  ordersIcon = receipt;
  constructor() {
    addIcons({ cartOutline, heartOutline, personOutline, storefrontOutline, receipt });
  }

  ngOnInit() {}
}