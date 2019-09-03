import { Injectable } from '@angular/core';
import {Product} from './products/product';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Array<Product> = [];

  private productResourceUrl: string = 'http://127.0.0.1:16480/api/products/';

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
      this.productResourceUrl,
      {observe: 'response'}
    )
      .pipe(
        catchError(this.handleHttpError())
      )
      .subscribe(
      (res: HttpResponse<Object>) => {
        try {
          this.responseToProducts(res.body);
          this.productUpdateObserver.next(this.products);
        } catch (e) {
          console.error(e);
          alert('There was an error while trying to access your data!');
        }
      }
    );
  }

  public responseToProducts( responseObject ) {
    this.products = [];
    if ( !responseObject.hasOwnProperty('products') ) {
      throw new Error();
    }
    for (let i in responseObject.products) {
      let product = responseObject.products[i];
      if (
        !product.hasOwnProperty('product-id')
        || !product.hasOwnProperty('name')
        || !product.hasOwnProperty('available-amount')
      ) {
        throw new Error();
      }
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

  private handleHttpError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

}
