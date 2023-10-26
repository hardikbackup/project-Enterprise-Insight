import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import jwt_encode from 'jwt-encode';

interface FavoriteModelsInterface{
  status: boolean;
  error: string;
  models: any;
  has_more_models: boolean
}

interface PopularDiagramsInterface{
  status: boolean;
  error: string;
  diagrams: any;
}

interface PopularModelsInterface{
  status: boolean;
  error: string;
  models: any;
}

interface PopularQueriesInterface{
  status: boolean;
  error: string;
  queries: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
      private http: HttpClient,
  ) { }

  public getFavoriteModels(login_key, show_all) {
    return this.http.post<FavoriteModelsInterface>(environment.server_url + '/favorite/models',{
      token : jwt_encode({ login_key: login_key, show_all: show_all },environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getPopularDiagrams(login_key) {
    return this.http.post<PopularDiagramsInterface>(environment.server_url + '/popular/diagrams',{
      token : jwt_encode({ login_key: login_key },environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getPopularModels(login_key) {
    return this.http.post<PopularModelsInterface>(environment.server_url + '/popular/models',{
      token : jwt_encode({ login_key: login_key },environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getPopularQueries(login_key) {
    return this.http.post<PopularQueriesInterface>(environment.server_url + '/popular/queries',{
      token : jwt_encode({ login_key: login_key },environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }
}
