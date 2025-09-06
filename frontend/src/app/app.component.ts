import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { CartFirebaseService } from './services/cart.firebase.service';
import { AuthService, AuthUser } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('badgePulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.3)' })),
      transition('normal => pulse', animate('200ms ease-out')),
      transition('pulse => normal', animate('300ms ease-in'))
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ShopEase';
  cartCount = 0;
  badgeState = 'normal';
  currentUser: AuthUser | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private cartFirebaseService: CartFirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Current user:', user);
      this.loadCartCount(); // Reload cart when user changes
    });
    this.subscriptions.push(authSub);

    // Set up periodic cart count refresh
    this.setupCartRefresh();
  }

  private setupCartRefresh(): void {
    // Refresh cart count every 2 seconds when user is active
    const refreshInterval = setInterval(async () => {
      if (this.currentUser) {
        await this.loadCartCount();
      }
    }, 2000);

    // Clean up interval on destroy
    this.subscriptions.push({
      unsubscribe: () => clearInterval(refreshInterval)
    } as Subscription);
  }

  async loadCartCount(): Promise<void> {
    try {
      const items = await this.cartFirebaseService.getItems();
      const previousCount = this.cartCount;
      this.cartCount = items.reduce((total, item) => total + item.quantity, 0);

      // Animate badge when count increases
      if (this.cartCount > previousCount && this.cartCount > 0) {
        this.badgeState = 'pulse';
        setTimeout(() => this.badgeState = 'normal', 500);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
      this.cartCount = 0;
    }
  }

  async onLogout(): Promise<void> {
    try {
      const result = await this.authService.logout();
      if (result.success) {
        console.log('Logout successful');
        this.cartCount = 0; // Reset cart count on logout
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
