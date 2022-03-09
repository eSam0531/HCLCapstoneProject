import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { CustomValidators } from 'src/app/validators/custom-validators';

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
        firstName: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        lastName: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]
        ),
        email: new FormControl('',
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

  onSubmit(){
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer').value);
    console.log("the email address is: " + this.checkoutFormGroup.get('customer').value.email);
    console.log("the shipping address country is: " + this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log("the shipping address state is: " + this.checkoutFormGroup.get('shippingAddress').value.state.name);

  }

  get firstName() {return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() {return this.checkoutFormGroup.get('customer.lastName');}
  get email() {return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet() {return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() {return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState() {return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressCountry() {return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressZipcode() {return this.checkoutFormGroup.get('shippingAddress.zipcode');}

  get billingAddressStreet() {return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity() {return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState() {return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressCountry() {return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressZipcode() {return this.checkoutFormGroup.get('billingAddress.zipcode');}

  get cardType() {return this.checkoutFormGroup.get('creditCard.cardType');}
  get nameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get cardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get securityCode() {return this.checkoutFormGroup.get('creditCard.securityCode');}

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
