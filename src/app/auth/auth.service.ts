import { Injectable } from '@angular/core';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import jwt_encode from 'jwt-encode';
import jwt_decode from 'jwt-decode';

interface LoginResponse{
  status: boolean;
  user: any;
  error: string;
  is_publication_viewer: boolean;
  accessToken:string;
  refreshToken:string;
  accessTokenExpiryAt:string;
  refreshTokenExpiryAt:string;
}

interface DefaultResponse {
  status: boolean;
  error: string;
}

interface RegisterResponse{
  status: boolean;
  user: any;
  error: string;
}

interface CheckTokenInterface{
    status: boolean;
    error: string;
    email: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
      private http: HttpClient
  ) {

  }

  public isAuthenticated() {
    return localStorage.getItem('user') ? true : false;
  }

  public getLoggedInUser() {
    return localStorage.getItem('user');
  }

  public getLoggedInUserObject() {
    return jwt_decode(this.getLoggedInUser());
  }

  public getLoggedInUserToken() {
    let decoded_obj = jwt_decode(this.getLoggedInUser());
    return decoded_obj['login_key'];
  }

  public isUserAdmin() {
    let decoded_obj = jwt_decode(this.getLoggedInUser());
    return decoded_obj['user_role']  === "A";
  }

  public isPortalUser() {
    let decoded_obj = jwt_decode(this.getLoggedInUser());
    return decoded_obj['user_role']  === "PR";
  }

  public getUserId() {
    let decoded_obj = jwt_decode(this.getLoggedInUser());
    return decoded_obj['id'];
  }

  public getAuthToken() {
    return localStorage.getItem('access_token');
  }

  public getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  getLogin(email, password): Observable<LoginResponse> {
      let token_query = jwt_encode({ email: email, password: password },environment.encode_api_key);
      return this.http.post<LoginResponse>(environment.server_url + '/api/login', { token : token_query }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      )
  }

  public onForgotPassword(email) {
      let token_query = jwt_encode({ email: email },environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/api/forgot/password', { token : token_query }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public onResetPassword(password, code) {
      let token_query = jwt_encode({ password: password, code: code },environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/api/reset/password', { token : token_query }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      )
  }

  public onRegister(username, email, password) {
      let token_query = jwt_encode({ username: username, email: email, password: password },environment.encode_api_key);
      return this.http.post<RegisterResponse>(environment.server_url + '/api/register', { token : token_query }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      )
  }

  public checkInviteToken(invite_token) {
      let token_query = jwt_encode({ invite_token: invite_token },environment.encode_api_key);
      return this.http.post<CheckTokenInterface>(environment.server_url + '/api/check/invite/token', { token : token_query }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      )
  }

  public onCompleteInvitation(invite_token, first_name, last_name, password) {
      let token_query = jwt_encode({ invite_token: invite_token, first_name: first_name, last_name: last_name, password: password },environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/api/complete/invitation', { token : token_query }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      )
  }

  public getGlobalSettings(){
    return this.http.get<DefaultResponse>(environment.server_url + '/global-settings', {}).pipe(
      take(1),
      map(resp => {
          return resp;
      })
  )
  }
  public refreshToken(refresh_token){
    console.log(refresh_token)
    return this.http.post<any>(environment.server_url + '/api/auth/get-new-token',{refreshToken:refresh_token}).pipe(
      take(1),
      map(resp=>{
        return resp;
      })
    )
  }
}
