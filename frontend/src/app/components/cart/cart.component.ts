import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CartFirebaseService, CartItem } from '../../services/cart.firebase.service';

interface CartView {
  items: CartItem[];
  total: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  animations: [
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal => clicked', animate('100ms ease-out')),
      transition('clicked => normal', animate('200ms ease-out'))
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class CartComponent implements OnInit {
  cart: CartView = { items: [], total: 0 };

  // Animation/feedback
  buttonStates: { [key: string]: 'normal' | 'clicked' } = {};
  busyByItem: { [key: string]: boolean } = {};
  showToast = false;
  toastMessage = '';
  private toastTimer: any = null;

  constructor(private cartService: CartFirebaseService) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  // Pull items from Firestore and recompute total
  async refresh(): Promise<void> {
    const items = await this.cartService.getItems();
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    this.cart = { items, total };
  }

  // Increase quantity by 1 (atomic upsert in Firestore)
  async inc(it: CartItem): Promise<void> {
    if (this.busyByItem[it.productId]) return;
    this.busyByItem[it.productId] = true;

    this.animateButton('inc-' + it.productId);
    try {
      await this.cartService.addItem({ ...it, quantity: 1 });
      await this.refresh();
      this.showToastMsg('Increased ' + it.name + ' quantity');
    } finally {
      this.busyByItem[it.productId] = false;
    }
  }

  // Decrease quantity by 1, or remove when it reaches 0
  async dec(it: CartItem): Promise<void> {
    if (this.busyByItem[it.productId]) return;
    this.busyByItem[it.productId] = true;

    this.animateButton('dec-' + it.productId);
    try {
      const nextQty = it.quantity - 1;
      if (nextQty <= 0) {
        await this.cartService.removeItem(it.productId);
        this.showToastMsg(it.name + ' removed from cart');
      } else {
        await this.cartService.setQuantity(it.productId, nextQty);
        this.showToastMsg('Decreased ' + it.name + ' quantity');
      }
      await this.refresh();
    } finally {
      this.busyByItem[it.productId] = false;
    }
  }

  async remove(it: CartItem): Promise<void> {
    if (this.busyByItem[it.productId]) return;
    this.busyByItem[it.productId] = true;

    this.animateButton('remove-' + it.productId);
    try {
      await this.cartService.removeItem(it.productId);
      await this.refresh();
      this.showToastMsg(it.name + ' removed from cart');
    } finally {
      this.busyByItem[it.productId] = false;
    }
  }

  async clear(): Promise<void> {
    this.animateButton('clear');
    await this.cartService.clearCart();
    await this.refresh();
    this.showToastMsg('Cart cleared');
  }

  // Animation helpers
  private animateButton(buttonId: string): void {
    this.buttonStates[buttonId] = 'clicked';
    setTimeout(() => (this.buttonStates[buttonId] = 'normal'), 250);
  }

  getButtonState(buttonId: string): 'normal' | 'clicked' {
    return this.buttonStates[buttonId] || 'normal';
  }

  private showToastMsg(message: string): void {
    this.toastMessage = message;
    this.showToast = true;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
      this.toastTimer = null;
    }, 2500);
  }

  onImgError(evt: Event): void {
    const img = evt.target as HTMLImageElement | null;
    if (img) img.src = 'https://via.placeholder.com/60x60?text=No+Image';
  }
}
