import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { environment } from '../../../environments/environment';
import {Observable} from 'rxjs';

interface settingsDateInterface{
  status: boolean;
  error: string;
  format: any;
  separator: any;
  diagram_new_tab: boolean;
  model_viewer_pages: number;
  exit_behavior: string;
  prompt_diagram_object_delete: boolean;
  region: string;
  is_administrator: boolean;
  currency: string;
}

interface defaultResponse{
  status: boolean;
  error: string;
}

interface settingsInterface{
  status: boolean;
  error: string;
  user_settings: any;
  global_settings: any;
  is_administrator : boolean;
}

interface PublicationSettigsInterface{
  status: boolean;
  error: string;
  publication_settings: any;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(
      private http: HttpClient
  ) {
  }

  getSettings(login_key) {
    // return Observable.create(observer => {
    //   setTimeout(() => {
    //     observer.next({
    //       status: true,
    //       is_administrator: true,
    //       user_settings: {
    //         "diagram_new_tab": false,
    //         "model_viewer_pages": 50,
    //         "exit_behavior": "exit_tab",
    //         "delete_objects_from_diagrams": false,
    //         "prompt_diagram_object_delete": false,
    //         "prompt_diagram_reuse_objects": false,
    //       },
    //       global_settings: {
    //         "format": "day month year",
    //         "separator": ".",
    //         "region": "eu",
    //         "diagram_new_tab": true,
    //         "model_viewer_pages": 150,
    //         "exit_behavior": "exit_to_model",
    //         "delete_objects_from_diagrams": true,
    //         "prompt_diagram_object_delete": true,
    //         "prompt_diagram_reuse_objects": true,
    //         "calculated_minutes": 10,
    //         "currency" : "usd"
    //       },
    //     });
    //     observer.complete();
    //   }, 10);
    // });
    let token_query = jwt_encode({ login_key: login_key },environment.encode_api_key);
    return this.http.post<settingsInterface>(environment.server_url + '/settings',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }
  //get Publication Settings
  getPublicationSettings(login_key) {
      let token_query = jwt_encode({ login_key: login_key },environment.encode_api_key);
      return this.http.post<PublicationSettigsInterface>(environment.server_url + '/settings',{
        token : token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }


  getSettingsDateFormat(login_key) {
    let token_query = jwt_encode({ login_key: login_key },environment.encode_api_key);
    return this.http.post<settingsDateInterface>(environment.server_url + '/settings/date/format',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
}

  public saveSettings(login_key, settings)
  {
    let token_query = jwt_encode({ login_key: login_key, settings: settings },environment.encode_api_key);
    return this.http.post<defaultResponse>(environment.server_url + '/update/settings',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getDateFormatOptions()
  {
    return {
      'day' : 'Day',
      'month' : 'Month',
      'year' : 'Year'
    }
  }

  public getDateSeparatorOptions()
  {
    return {
      'space': 'Space',
      '/': '/',
      '-': '-',
      '.': '.'
    }
  }
}
