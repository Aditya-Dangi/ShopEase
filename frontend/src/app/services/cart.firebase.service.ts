import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, increment, DocumentData, query } from 'firebase/firestore';
import { environment } from '../../environments/environment';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class CartFirebaseService {
  private app = initializeApp(environment.firebase);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);
  private currentUser: User | null = null;

  constructor() {
    console.log('Firebase service initializing...');

    onAuthStateChanged(this.auth, async (user) => {
      console.log('Auth state changed:', user?.uid || 'anonymous');
      this.currentUser = user;

      if (user) {
        console.log('User signed in, creating cart doc...');
        try {
          const cartRef = doc(this.db, 'carts', user.uid);
          const snap = await getDoc(cartRef);
          if (!snap.exists()) {
            await setDoc(cartRef, { createdAt: serverTimestamp() });
            console.log('Cart document created');
          }
        } catch (error) {
          console.error('Error creating cart:', error);
        }
      }
    });
  }


  // Optional: allow guest cart with anonymous auth
  async ensureSignedIn(): Promise<User> {
    if (this.currentUser) return this.currentUser;
    const cred = await signInAnonymously(this.auth);
    this.currentUser = cred.user;
    return cred.user;
  }

  private itemRef(uid: string, productId: string) {
    return doc(this.db, `carts/${uid}/cartItems/${productId}`);
  }

  async getItems(): Promise<CartItem[]> {
    const user = this.currentUser ?? await this.ensureSignedIn();
    const itemsCol = collection(this.db, `carts/${user.uid}/cartItems`);
    const q = query(itemsCol);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ productId: d.id, ...(d.data() as DocumentData) })) as CartItem[];
  }

  // Upsert item: add if not exists, otherwise increment quantity
  async addItem(item: CartItem): Promise<void> {
    const user = this.currentUser ?? await this.ensureSignedIn();
    const ref = this.itemRef(user.uid, item.productId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        quantity: increment(item.quantity || 1),
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(ref, {
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || '',
        updatedAt: serverTimestamp()
      });
    }
  }

  async setQuantity(productId: string, quantity: number): Promise<void> {
    const user = this.currentUser ?? await this.ensureSignedIn();
    const ref = this.itemRef(user.uid, productId);
    if (quantity <= 0) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { quantity, updatedAt: serverTimestamp() }, { merge: true });
    }
  }

  async removeItem(productId: string): Promise<void> {
    const user = this.currentUser ?? await this.ensureSignedIn();
    await deleteDoc(this.itemRef(user.uid, productId));
  }

  async clearCart(): Promise<void> {
    const user = this.currentUser ?? await this.ensureSignedIn();
    const itemsCol = collection(this.db, `carts/${user.uid}/cartItems`);
    const snap = await getDocs(itemsCol);
    const ops = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(ops);
  }
}
