import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';

interface usersInterface{
  status: boolean;
  error: string;
  users: any;
  pages: number;
}

interface UserRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface UserDetailsResponse{
  status: boolean;
  error: string;
  user : any;
}

interface AvailableGroupsResponse{
  status: boolean;
  error: string;
  groups: any;
}

@Injectable({
  providedIn: 'root'
})

export class UsersService {

  constructor(
      private http: HttpClient
  ) { }

  getUsers(login_key, type, sort, page) {
      let token_query = jwt_encode({ login_key: login_key, type: type, sort: sort, page: page},environment.encode_api_key);
      return this.http.post<usersInterface>(environment.server_url + '/users',{
        token : token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public removeUser(login_key, user_ids) {
      let token_query = jwt_encode({ login_key: login_key, user_ids: user_ids}, environment.encode_api_key);
      return this.http.post<UserRemoveInterface>(environment.server_url + '/delete/user', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addUser(login_key, form_data, selected_group_ids) {
      let token_query = jwt_encode({ login_key: login_key, form_data: form_data, groups: selected_group_ids }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/create/user', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public userDetails(login_key, id) {
      let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
      return this.http.post<UserDetailsResponse>(environment.server_url + '/user/details', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateUser(login_key, id, form_data, group_ids, update_only_name) {
      let token_query = jwt_encode({ login_key: login_key, id: id, form_data: form_data, groups: group_ids, update_only_name: update_only_name }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/update/user', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateUserPassword(login_key, id, password) {
      let token_query = jwt_encode({ login_key: login_key, id: id, password: password }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/update/user/password', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getAvailableGroups(login_key) {
      let token_query = jwt_encode({ login_key: login_key }, environment.encode_api_key);
      return this.http.post<AvailableGroupsResponse>(environment.server_url + '/user/available/groups', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateModelViewerLeftSidebarWidth(login_key, width) {
      let token_query = jwt_encode({ login_key: login_key, width: width }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/user/update/left/sidebar', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

  public inviteUser(login_key, email) {
      let token_query = jwt_encode({ login_key: login_key, email: email }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/invite/user', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }
}


