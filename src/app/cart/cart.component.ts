import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CartItem} from './cartItem';
import {CartService} from '../cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  private items: Array<CartItem>;

  constructor(
    public cartService: CartService
  ) {
  }

  ngOnInit() {
    this.items = this.cartService.getItems();
  }
}
