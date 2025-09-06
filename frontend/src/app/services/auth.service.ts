import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { User } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    // Listen to Firebase auth state changes
    this.firebaseService.onAuthStateChanged((user: User | null) => {
      if (user) {
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User'
        };
        this.currentUserSubject.next(authUser);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async register(email: string, password: string, displayName: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.firebaseService.register(email, password, displayName);
      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.firebaseService.login(email, password);
      return { success: true, message: 'Login successful!' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await this.firebaseService.logout();
      return { success: true, message: 'Logged out successfully!' };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, message: 'Error logging out' };
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/email-already-in-use':
        return 'Email is already registered';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      default:
        return 'An error occurred. Please try again';
    }
  }
}

