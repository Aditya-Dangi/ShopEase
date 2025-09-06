import { TestBed } from '@angular/core/testing';

import { CartFirebaseService } from './cart.firebase.service';

describe('CartFirebaseService', () => {
  let service: CartFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
