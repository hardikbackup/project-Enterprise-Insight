import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { environment } from '../../environments/environment';
import {Observable} from 'rxjs';

interface queriesInterface{
  status: boolean;
  error: string;
  queries: any;
  pages: number;
}

interface queryRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface QueryDetailsResponse{
  status: boolean;
  error: string;
  query_data: any;
}

interface RunQueryInterface{
  status: boolean;
  error: string;
  pages: number;
  items: any;
}

@Injectable({
  providedIn: 'root'
})
export class QueriesService {

  constructor(
      private http: HttpClient
  ) { }

  public getQueries(login_key, sort_by, page) {
    let token_query = jwt_encode({ login_key: login_key, sort: sort_by, page: page },environment.encode_api_key);
    return this.http.post<queriesInterface>(environment.server_url + '/queries',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public removeQuery(login_key, query_ids) {
    let token_query = jwt_encode({ login_key: login_key, query_ids: query_ids }, environment.encode_api_key);
    return this.http.post<queryRemoveInterface>(environment.server_url + '/delete/queries', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateQuery(login_key, id, name, query, update_only_name = false) {
    let token_query = jwt_encode({ login_key: login_key, id: id, name: name, query: query, update_only_name: update_only_name }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/update/query', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public queryDetails(login_key, id) {
    let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
    return this.http.post<QueryDetailsResponse>(environment.server_url + '/query/details', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public addQuery(login_key, name, query) {
    let token_query = jwt_encode({ login_key: login_key, name: name, query: query }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/add/query', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public runQuery(login_key, query, page) {
    let token_query = jwt_encode({ login_key: login_key, query: query, page: page }, environment.encode_api_key);
    return this.http.post<RunQueryInterface>(environment.server_url + '/query/run', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }
}
