import { Injectable } from '@angular/core';
import {Product} from './products/product';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Array<Product> = [];

  private productUpdateObserver: Subject<Array<Product>>;

  constructor(
    private http: HttpClient
  ) {
    this.productUpdateObserver = new Subject();
  }

  public getProducts(): Array<Product> {
    return this.products;
  }

  public getProductUpdateObserver() {
    return this.productUpdateObserver;
  }

  public updateProducts() {
    this.http.get(
      'http://127.0.0.1:16480/api/products/',
      {observe: 'response'}
    ).subscribe(
      res => {
        this.responseToProducts(res.body);
        this.productUpdateObserver.next(this.products);
      }
    );
  }
  public responseToProducts( responseObject ) {
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
  public getProductById( id: number ): Product|null {
    for (let i in this.products) {
      let product = this.products[i];
      if (product.id === id) {
        return product;
      }
    }
    return null;
  }
}
