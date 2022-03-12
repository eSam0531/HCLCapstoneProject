import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';


@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false;
  userFullName: string;

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
        }
      );
    }
  }

  logout() {
    //terminates the session with Okta and removes current tokens.
    this._oktaAuth.signOut();
  }
}
