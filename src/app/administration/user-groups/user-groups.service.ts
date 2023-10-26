import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { HttpClient } from '@angular/common/http';

interface GroupsInterface{
  status: boolean;
  error: string;
  groups: any;
  pages: number;
}

interface GroupRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface GroupDetailsResponse{
  status: boolean;
  error: string;
  name: string;
  total_users: number;
}

@Injectable({
  providedIn: 'root'
})

export class UserGroupsService {

  constructor(
      private http: HttpClient
  ) { }

  getGroups(login_key, sort, page) {
      let token_query = jwt_encode({ login_key: login_key, sort: sort, page: page },environment.encode_api_key);
      return this.http.post<GroupsInterface>(environment.server_url + '/groups',{
        token : token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public removeGroup(login_key, group_ids) {
      let token_query = jwt_encode({ login_key: login_key, group_ids: group_ids }, environment.encode_api_key);
      return this.http.post<GroupRemoveInterface>(environment.server_url + '/delete/group', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addGroup(login_key, name) {
      let token_query = jwt_encode({login_key: login_key, name: name}, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/create/group', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public groupDetails(login_key, id) {
      let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
      return this.http.post<GroupDetailsResponse>(environment.server_url + '/group/details', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateGroup(login_key, id, name) {
      let token_query = jwt_encode({ login_key: login_key, id: id, name: name }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/update/group', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }
}
