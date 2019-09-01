import { Component, OnInit } from '@angular/core';
import { Product } from './product';
import { HttpClient } from '@angular/common/http';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  products: Array<Product> = [];

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.updateProducts();
  }
  public updateProducts() {
    this.http.get(
      'http://127.0.0.1:16480/api/products/',
      {observe: 'response'}
    ).subscribe(
      res => {
        this.responseToProducts(res.body);
      }
    );
  }
  private responseToProducts( responseObject ) {
    this.products = [];
    for (let i in responseObject.products) {
      let product = responseObject.products[i];
      this.products.push({
        id:              product['product-id'],
        name:            product['name'],
        availableAmount: product['available-amount']
      });
    }
  }
}


