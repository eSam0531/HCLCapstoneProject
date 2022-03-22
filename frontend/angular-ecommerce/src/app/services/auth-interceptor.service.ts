import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { from, lastValueFrom, Observable } from 'rxjs';
import { OKTA_AUTH } from '@okta/okta-angular';
import { ACCESS_TOKEN_STORAGE_KEY, OktaAuth } from '@okta/okta-auth-js';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request,next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    
    //only add an access token for secured endpoints
    const securedEndpoints = ['http://localhost:8080/api/orders'];

    if(securedEndpoints.some(url => request.urlWithParams.includes(url))){
      //get access token
      const accessToken = await this.oktaAuth.getAccessToken();

      //clone the request and add new header with access token
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });
    }

    //continue other interceptors in the chain.
    //if there are no intercepteors, make the call to REST API
    return await lastValueFrom(next.handle(request));

  }
}
