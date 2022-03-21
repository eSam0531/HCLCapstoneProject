import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';


@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component-tealpanda.html',
  styleUrls: ['./login-status.component-tealpanda.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false;
  userFullName: string;

  menuStatus: boolean = false;

  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService,
              @Inject(OKTA_AUTH) private _oktaAuth: OktaAuth) { }

  ngOnInit(): void {
    //subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated;
        this.getUserDetails();
    });
  }
  getUserDetails() {
    if(this.isAuthenticated){
      //Fetch the logged in user details (user's claims)
      //user full name is exposed as a property type
      this._oktaAuth.getUser().then(
        res => {
          this.userFullName = res.name;

          //retrieve the users email form authenitation response
          const theEmail = res.email;

          //store the email in browser storage
          this.storage.setItem('userEmail', JSON.stringify(theEmail));          
        }
      );
    }
  }

  logout() {
    //terminates the session with Okta and removes current tokens.
    this._oktaAuth.signOut();
  }

  toggleUserMenu() {
    this.menuStatus = !this.menuStatus;
    console.log('USER MENU', this.menuStatus);
  }
}
