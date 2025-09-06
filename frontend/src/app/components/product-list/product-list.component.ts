import { Component, OnInit } from '@angular/core';
import { ProductService, Product, ProductPage, Category } from '../../services/product.service';
import { CartFirebaseService } from '../../services/cart.firebase.service'; // Fixed import
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  animations: [
    // Step 3: button press animation
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal => clicked', animate('100ms ease-out')),
      transition('clicked => normal', animate('200ms ease-out'))
    ]),
    // Step 3: toast slide in/out
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
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 12;

  selectedCategory = 'all';
  searchQuery = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  loading = false;
  error = '';

  // Step 3 additions
  buttonStates: { [productId: number]: 'normal' | 'clicked' } = {};
  showToast = false;
  toastMessage = '';
  private toastTimer?: any;
  private adding: Record<number, boolean> = {};

  // Fixed constructor - inject the correct service
  constructor(
    private productService: ProductService,
    private cartFirebaseService: CartFirebaseService // Fixed injection
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => { this.categories = categories; },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories. Make sure backend is running on port 8080.';
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts(
      this.currentPage,
      this.pageSize,
      this.selectedCategory,
      this.searchQuery,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (response: ProductPage) => {
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Make sure backend is running on port 8080.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  syncProducts(): void {
    this.loading = true;
    this.productService.syncProducts().subscribe({
      next: (response) => {
        console.log('Sync response:', response);
        this.loadProducts();
      },
      error: (error) => {
        console.error('Sync failed:', error);
        this.error = 'Failed to sync products from external API.';
        this.loading = false;
      }
    });
  }

  onImgError(evt: Event): void {
    const img = evt.target as HTMLImageElement | null;
    if (img) {
      img.src = 'https://via.placeholder.com/300x250?text=No+Image';
    }
  }

  // In product-list.component.ts
  async addToCart(product: Product): Promise<void> {
    if (this.adding[product.id]) return;
    this.adding[product.id] = true;

    // Animate button
    this.buttonStates[product.id] = 'clicked';
    setTimeout(() => (this.buttonStates[product.id] = 'normal'), 250);

    // Use the real name field (change property here)
    const cartItem = {
      productId: product.id.toString(),
      name: product.name,          // ← was product.title
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl      // ensure this matches Product.image or .thumbnail
        || 'https://via.placeholder.com/60x60?text=No+Image'
    };

    try {
      await this.cartFirebaseService.ensureSignedIn();
      await this.cartFirebaseService.addItem(cartItem);
      this.showSuccessToast(`${cartItem.name} added to cart!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      this.showSuccessToast('Error adding item to cart');
    } finally {
      this.adding[product.id] = false;
    }
  }



  // used by template to bind animation state
  getButtonState(productId: number): 'normal' | 'clicked' {
    return this.buttonStates[productId] || 'normal';
  }

  private showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.showToast = false), 3000);
  }
}
