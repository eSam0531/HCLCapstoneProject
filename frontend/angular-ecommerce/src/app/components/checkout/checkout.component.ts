import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { ShopFormService } from 'src/app/services/shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
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

  constructor(private formBuilder: FormBuilder, private shopformService: ShopFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        country: [''],
        city: [''],
        state: [''],
        zipcode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        country: [''],
        city: [''],
        state: [''],
        zipcode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
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

  onSubmit(){
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer').value);
    console.log("the email address is: " + this.checkoutFormGroup.get('customer').value.email);
    console.log("the shipping address country is: " + this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log("the shipping address state is: " + this.checkoutFormGroup.get('shippingAddress').value.state.name);

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

}
