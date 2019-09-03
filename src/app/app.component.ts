import { Component } from '@angular/core';
import {ProductService} from './product.service';
import {CartService} from './cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  constructor(
    public productService: ProductService,
    public cartService: CartService
  ) {}

}
