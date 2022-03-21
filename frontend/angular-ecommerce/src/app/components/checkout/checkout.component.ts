import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutServiceService } from 'src/app/services/checkout-service.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { CustomValidators } from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component-tealpanda.html',
  styleUrls: ['./checkout.component-tealpanda.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  // FORM STATUS
  customer_status: boolean = false;
  shipping_status: boolean = false;
  billing_status: boolean = false;
  credit_status: boolean = false;

  storage: Storage = sessionStorage;

  constructor(private formBuilder: FormBuilder, private shopformService: ShopFormService,
              private cartService: CartService, private checkoutService: CheckoutServiceService,
              private router: Router) { }

  ngOnInit(): void {
    this.reviewCardDetails();

    //read the users email from browsers storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail'));

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        lastName: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        email: new FormControl(theEmail,
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]
        )
      }),
      shippingAddress: this.formBuilder.group({
        street:new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        country:  new FormControl('', [Validators.required]),
        city: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        state: new FormControl('', [Validators.required]),
        zipcode: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        )
      }),
      billingAddress: this.formBuilder.group({
        street:new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        country: new FormControl('', [Validators.required]),
        city: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        state: new FormControl('', [Validators.required]),
        zipcode: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        )
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('',
        [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
      ),
        cardNumber: new FormControl('',
        [Validators.required, Validators.pattern('[0-9]{16}'), CustomValidators.notOnlyWhitespace]
      ),
        securityCode: new FormControl('',
        [Validators.required, Validators.pattern('[0-9]{3}'), CustomValidators.notOnlyWhitespace]
      ),
        expirationMonth: [''],
        expirationYear:  [''],
      }),
    });

    // populate credit card Months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);
    this.shopformService.getCreditCardMonths(startMonth).subscribe(data =>{
        console.log("Retreived credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
    
    //populate credit card years
    this.shopformService.getCreditCardYears().subscribe(data =>{
      console.log("Retreived credit card years: " + JSON.stringify(data));
      this.creditCardYears = data;
    });

    //populate countries
    this.shopformService.getCountries().subscribe(data => {
      console.log("Retreived countries: " + JSON.stringify(data));
      this.countries = data;
    });


  }
  reviewCardDetails() {
    //subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(totalQuantity =>{
      this.totalQuantity = totalQuantity
    });
    //subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(totalPrice =>{
      this.totalPrice = totalPrice
    });
  }

  onSubmit(){
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    //set up purhcase
    let purchase = new Purchase();

    //pouplate purhcase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purhcase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //call REST API via the checkoutSErvice
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received. \nOrder tracking nubmer ${response.orderTrackingNumber}`);
          //reset the cart
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      });
  }

  get firstName() {return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() {return this.checkoutFormGroup.get('customer.lastName');}
  get email() {return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet() {return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() {return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState() {return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressCountry() {return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressZipCode() {return this.checkoutFormGroup.get('shippingAddress.zipcode');}

  get billingAddressStreet() {return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity() {return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState() {return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressCountry() {return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressZipCode() {return this.checkoutFormGroup.get('billingAddress.zipcode');}

  get creditCardType() {return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode() {return this.checkoutFormGroup.get('creditCard.securityCode');}

  resetCart() {
    //rest cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset form data
    this.checkoutFormGroup.reset();

    //navigate backt othe products page
    this.router.navigateByUrl("/products");

  }

  copyShippingAddressToBillingAddress(event:Event){

    if((<HTMLInputElement>event.target).checked){
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      //bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //but fix for states
      this.billingAddressStates = [];
    }
  }

  handleMonthAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);
    // if the current year equals the selected year, then start with current month
    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.shopformService.getCreditCardMonths(startMonth).subscribe(data =>{
      console.log("Retreived credit card months: " + JSON.stringify(data));
      this.creditCardMonths = data;
    });
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.shopformService.getStates(countryCode).subscribe( data => {
      if (formGroupName === "shippingAddress"){
        this.shippingAddressStates = data;
      }
      else {
        this.billingAddressStates = data;
      }

      //select first state by default
      formGroup.get('state').setValue(data[0]);
    });
  }

   // Change Tab
   activeTab: number = 1;
   changeTab(tab: number) {
     if (
       tab === 2 &&
       this.firstName.value !== '' &&
       this.lastName.value !== '' &&
       this.email.value !== ''
     ) {
       this.activeTab = tab;
       this.customer_status = true;
     } else if (
       tab === 3 &&
       this.shippingAddressStreet.value !== '' &&
       this.shippingAddressCity.value !== '' &&
       this.shippingAddressCountry.value.name !== '' &&
       this.shippingAddressZipCode.value !== '' &&
       this.shippingAddressState.value.name !== ''
     ) {
       if (this.billingAddressCity.value !== '') {
         this.activeTab = tab + 1;
         this.shipping_status = true;
         this.billing_status = true;
         return;
       }
       this.activeTab = tab;
       this.shipping_status = true;
     } else if (
       tab === 4 &&
       this.billingAddressStreet.value !== '' &&
       this.billingAddressCity.value !== '' &&
       this.billingAddressCountry.value.name !== '' &&
       this.billingAddressZipCode.value !== '' &&
       this.billingAddressState.value.name !== ''
     ) {
       this.activeTab = tab;
       this.billing_status = true;
     } else if (
       tab === 5 &&
       this.creditCardType.value !== '' &&
       this.creditCardNameOnCard.value !== '' &&
       this.creditCardNumber.value !== ''
     ) {
       this.activeTab = tab;
       this.credit_status = true;
     }
   }

}
