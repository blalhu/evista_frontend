import { Injectable } from '@angular/core';
import {Product} from './products/product';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Array<Product> = [];

  constructor(
    private http: HttpClient
  ) { }

  public getProducts(): Array<Product> {
    return this.products;
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
