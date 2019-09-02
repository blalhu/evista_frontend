import {Injectable, OnInit} from '@angular/core';
import {CartItem} from './cart/cartItem';
import {Product} from './products/product';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ProductService} from './product.service';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: Array<CartItem> = [];
  private itemsSubject = new BehaviorSubject<Array<CartItem>>(this.items);

  private orderResourceUrl :string = 'http://127.0.0.1:16480/api/orders/';

  constructor(
    private productService: ProductService,
    private http: HttpClient
  ) {
      productService.getProductUpdateObserver().subscribe((products) => {
        this.loadFromLocalStorage();
        this.itemsSubject.subscribe(value => {
          localStorage.setItem('cart-content', this.toJsonString());
        });
      });
  }

  getItems(): Array<CartItem> {
    return this.items;
  }

  public addItem( product: Product ) {
    if ( product.availableAmount < 1 ) {
      alert('No more products left!');
      return;
    }
    if ( this.itemAlreadyAdded( product ) ) {
      this.increaseItemAmount( product );
      return;
    }
    let cartItem = new CartItem();
    cartItem.product        = product;
    cartItem.requiredAmount = 1;
    this.items.push( cartItem );
    this.itemsSubject.next(this.items); //TODO: find an AOP way!
  }

  public increaseItemAmount( product: Product ) {
    let item = this.findItem(product);
    if ( item.requiredAmount + 1 > product.availableAmount ) {
      alert('No more products left!');
      return;
    }
    item.requiredAmount++;
    this.itemsSubject.next(this.items); //TODO: find an AOP way!
  }

  public decreaseItemAmount( product: Product ) {
    let item = this.findItem(product);
    if (item.requiredAmount - 1 < 1) {
      this.removeItem( product );
      return;
    }
    item.requiredAmount--;
    this.itemsSubject.next(this.items); //TODO: find an AOP way!
  }

  public removeItem( product: Product ) {
    if (!confirm('Are you sure you want to remove this item?')) {
      return;
    }
    let item = this.findItem(product);
    if ( item === null ) {
      throw new Error('Cannot find the item to delete!');
    }
    let index = this.items.indexOf(item, 0);
    if (index > -1) {
      this.items.splice(index, 1);
    }
    this.itemsSubject.next(this.items); //TODO: find an AOP way!
  }

  private findItem( testableProduct: Product ): CartItem|null {
    for (let i in this.items) {
      let currentItem = this.items[i];
      let product = currentItem.product;
      if (product.id === testableProduct.id) {
        return currentItem;
      }
    }
    return null;
  }

  private itemAlreadyAdded(testableProduct: Product): boolean {
    return this.findItem(testableProduct) !== null;
  }

  public toJsonString(): string {
    let jsonObj = { items: [] };
    for (let i in this.items) {
      let currentItem = this.items[i];
      jsonObj.items.push({
        id: currentItem.product.id,
        amount: currentItem.requiredAmount,
      });
    }
    return JSON.stringify(jsonObj);
  }

  public loadFromLocalStorage() {
    let jsonObj = JSON.parse( localStorage.getItem('cart-content') );
    if ( jsonObj === null ) {
      return;
    }
    this.items.splice(0, this.items.length);
    for (let i in jsonObj.items) {
      let item = jsonObj.items[i];
      let product = this.productService.getProductById( item.id );
      let cartItem = new CartItem();
      cartItem.product = product;
      cartItem.requiredAmount = item.amount;
      this.items.push( cartItem );
    }
  }

  public saveCart() {
    if (this.items.length < 1) {
      alert('Your cart is empty!');
      return;
    }
    this.http.post(
      this.orderResourceUrl,
      this.toJsonString(),
      {observe: 'response'}
    )
      .pipe(
        catchError(this.handleHttpError())
      )
      .subscribe(
        (res) => {
          if (res == null) {
            return;
          }
        for (let i in this.items) {
          let boughtItem = this.items[i];
          let product = this.productService.getProductById( boughtItem.product.id );
          product.availableAmount = product.availableAmount - boughtItem.requiredAmount;
        }
        this.items.splice(0, this.items.length);
        this.itemsSubject.next(this.items);
      }
    );
  }

  private handleHttpError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      alert('There was an error while we want to record your order!');
      console.error(error);
      return of(result as T);
    };
  }

}
