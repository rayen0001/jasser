import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/home/home.page').then( m => m.HomePage),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.page').then( m => m.DashboardPage)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/orders/orders.page').then( m => m.OrdersPage)
      },
      {
        path: 'products',
        loadComponent: () => import('./admin/products/products.page').then( m => m.ProductsPage)
      },
    ]
  },
  {
    path: 'user',
    loadComponent: () => import('./user/home/home.page').then( m => m.HomePage),
    children: [
        {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full'
  },
        {
    path: 'shop',
    loadComponent: () => import('./user/shop/shop.page').then( m => m.ShopPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./user/cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./user/wishlist/wishlist.page').then( m => m.WishlistPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./user/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'orders',
    loadComponent: () => import('./user/orders/orders.page').then( m => m.OrdersPage)
  },
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.page').then( m => m.AuthPage)
  },
  {
    path: 'productdetails/:id',
    loadComponent: () => import('./productdetails/productdetails.page').then( m => m.ProductdetailsPage)
  },


];
