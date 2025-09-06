import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPage {
  content: Product[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
}

export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getProducts(page = 0, size = 12, category?: string, query?: string,
              sortBy = 'createdAt', order = 'desc'): Observable<ProductPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('order', order);

    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    if (query && query.trim()) {
      params = params.set('q', query.trim());
    }

    return this.http.get<ProductPage>(`${this.apiUrl}/products`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  syncProducts(): Observable<string> {
    return this.http.post(`${this.apiUrl}/sync/products`, {}, { responseType: 'text' });
  }
}
