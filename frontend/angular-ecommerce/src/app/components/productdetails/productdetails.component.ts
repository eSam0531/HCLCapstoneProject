import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {

  product: Product = new Product();

  constructor(private productService: ProductService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.handleProductDetails();
    })
  }
  handleProductDetails() {
    //get the "id" param string. conver string to a number using the "+" symbol
    const theProductId: number = +this.route.snapshot.paramMap.get("id");

    this.productService.getProduct(theProductId).subscribe(data=>{
      this.product=data;
    });
  }

}
