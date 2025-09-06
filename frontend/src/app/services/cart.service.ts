import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  sessionId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private base = 'http://localhost:8080/api/cart';
  
  // BehaviorSubject to track cart count
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize cart count on service creation
    this.initializeCart();
  }

  private initializeCart(): void {
    this.getCart().subscribe({
      next: (cart) => this.updateCartCount(cart),
      error: (err) => console.error('Failed to initialize cart', err)
    });
  }

  private updateCartCount(cart: Cart): void {
    this.cartCountSubject.next(cart.totalItems);
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.base, { withCredentials: true });
  }

  addItem(productId: number, quantity = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.base}/items`, { productId, quantity }, { withCredentials: true })
      .pipe(tap(cart => this.updateCartCount(cart)));
  }

  updateItem(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.base}/items/${productId}?quantity=${quantity}`, {}, { withCredentials: true })
      .pipe(tap(cart => this.updateCartCount(cart)));
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.base}/items/${productId}`, { withCredentials: true })
      .pipe(tap(cart => this.updateCartCount(cart)));
  }

  clear(): Observable<void> {
    return this.http.delete<void>(this.base, { withCredentials: true })
      .pipe(tap(() => this.cartCountSubject.next(0)));
  }
}
