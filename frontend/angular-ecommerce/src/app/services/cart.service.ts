import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  //subject is subclass of Observable
  // used to publish event in code since our event will be sent to all subscribers
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  //storage: Storage = sessionStorage;
  storage: Storage = localStorage;

  constructor() { 
    //read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems'));

    if(data != null){
      this.cartItems = data;
      //compute the toals base on the data that is read from storage
      this.computeCartTotals();
    }
  }

  addToCart(theCartItem: CartItem){
    //check if we already have the item in out cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if(this.cartItems.length>0){
    // find the item in the cart based on the item id
      // if true returns first element that passes test
      // if nothing is true returns undefined
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);

    }

    //check if we found item
    alreadyExistsInCart = (existingCartItem != undefined);

    if(alreadyExistsInCart){
      //increment the quantity
      existingCartItem.quantity++;
    }
    else{
      //add the item to the cart
      this.cartItems.push(theCartItem);
    }

    // compute the cart total price and total quantity
    this.computeCartTotals();

  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number =  0;

    for (let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    } 

    //publish the new values
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data for debugging
    this.logCartData(totalPriceValue, totalQuantityValue);

    //persist cart data
    this.persistCartItems();

  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart')
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity:${tempCartItem.quantity},
       unitPrice:${tempCartItem.unitPrice}, subTotalPrice:${subTotalPrice}`);
    }
    console.log(`totalPrice:${totalPriceValue.toFixed(2)}, totalQuanity:${totalQuantityValue}`);
    console.log('------')
  }

  decrementQuanity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if(theCartItem.quantity===0){
      this.remove(theCartItem);
    }
    else{
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    //get index of item in the cart array
    const itemIndex = this.cartItems.findIndex(tempCartItem =>
      tempCartItem.id==theCartItem.id
    );
    
    //if found, remove the itme from the cart at given array index
    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }

  }

}
