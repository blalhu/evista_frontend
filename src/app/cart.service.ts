import {Injectable, OnInit} from '@angular/core';
import {CartItem} from './cart/cartItem';
import {Product} from './products/product';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: Array<CartItem> = [];
  private itemsSubject = new BehaviorSubject<Array<CartItem>>(this.items)

  constructor() {
    this.itemsSubject.subscribe(value => {
      localStorage.setItem('cart-content', this.toJsonString());
    });
  }

  getItems(): Array<CartItem> {
    console.log(localStorage.getItem('cart-content'));
    return this.items;
  }

  public addItem( product: Product ) {
    if ( this.itemAlreadyAdded( product ) ) {
      this.increaseItemAmount( product );
      this.itemsSubject.next(this.items); //TODO: find an AOP way!
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
    item.requiredAmount++;
    this.itemsSubject.next(this.items); //TODO: find an AOP way!
  }
  public decreaseItemAmount( product: Product ) {
    let item = this.findItem(product);
    item.requiredAmount--;
    this.itemsSubject.next(this.items); //TODO: find an AOP way!
  }
  public removeItem( product: Product ) {
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

}
