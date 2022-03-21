import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component-tealpanda.html',
  styleUrls: ['./search.component-tealpanda.css']
})
export class SearchComponent implements OnInit {
  
  constructor(private router:Router) { }

  ngOnInit(): void {
  }

  doSearch(value:string){
    console.log(`value=${value}`);
    this.router.navigateByUrl(`/search/${value}`);
  }

}
