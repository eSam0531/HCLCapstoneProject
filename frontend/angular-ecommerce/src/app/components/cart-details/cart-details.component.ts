import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuanity: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  listCartDetails() {
    //get a handle to the cart itmes
    this.cartItems = this.cartService.cartItems;

    //subscribe to thte cart total price
    this.cartService.totalPrice.subscribe(data =>
      this.totalPrice = data
    );

    //subscribe to the cart total quantity
    this.cartService.totalQuantity.subscribe(data =>
      this.totalQuanity = data
    );

    //compute cart total price and quantity
    this.cartService.computeCartTotals();

  }

  incrementQuantity(theCartItem: CartItem){
    this.cartService.addToCart(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem){
    this.cartService.decrementQuanity(theCartItem);
  }

  remove(theCartItem: CartItem){
    this.cartService.remove(theCartItem);
  }

}
