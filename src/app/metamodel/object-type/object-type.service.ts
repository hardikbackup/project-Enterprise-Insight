import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { environment } from '../../../environments/environment';
import {Observable} from 'rxjs';

interface objectTypesInterface{
  status: boolean;
  error: string;
  object_types: any;
  pages: number;
  total_pages: number;
}

interface objectTypeRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface ObjectTypeDetailsResponse{
  status: boolean;
  error: string;
  object_data : any;
}

interface ShapeImportResponse{
    status: boolean;
    error: string;
    object_data : any;
}

interface ObjectTypeShapesInterface{
    status: boolean;
    error: string;
    shapes: any;
}

@Injectable({
  providedIn: 'root'
})
export class ObjectTypeService {

  constructor(
      private http: HttpClient
  ) { }

  getObjectTypes(login_key, sort_by, page) {
      let token_query = jwt_encode({ login_key: login_key, sort: sort_by, page: page },environment.encode_api_key);
      return this.http.post<objectTypesInterface>(environment.server_url + '/object/types',{
        token : token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public removeObjectType(login_key, object_type_ids) {
      let token_query = jwt_encode({ login_key: login_key, object_type_ids: object_type_ids }, environment.encode_api_key);
      return this.http.post<objectTypeRemoveInterface>(environment.server_url + '/delete/object/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addObjectType(login_key, name, shape_type_color, shape_type_text_color, shape_type_border_color, is_round_corners, shape_icon, attribute_tabs, imported_shapes) {
      let token_query = jwt_encode({
          login_key: login_key,
          name: name,
          shape_type_color: shape_type_color ? shape_type_color : '',
          shape_type_text_color: shape_type_text_color ? shape_type_text_color : '',
          shape_type_border_color: shape_type_border_color ? shape_type_border_color : '',
          shape_icon: shape_icon,
          is_round_corners: is_round_corners,
          attribute_tabs : attribute_tabs,
          imported_shapes: imported_shapes
      }, environment.encode_api_key);

      return this.http.post<DefaultResponse>(environment.server_url + '/create/object/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public objectTypeDetails(login_key, id) {
      let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
      return this.http.post<ObjectTypeDetailsResponse>(environment.server_url + '/object/type/detail', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public async loadAssetImage(name) :Promise<Blob>  {
    try {
        const response = await fetch(environment.app_url + '/assets/shape-icons/' + name);
        const blob = await response.blob();
        return blob;
      } catch (error) {
        console.error('Error loading asset image:', error);
        throw error;
      }
    }

  public updateObjectType(login_key, id, name, shape_type_color, shape_type_text_color, shape_type_border_color, is_round_corners, shape_icon, attribute_tabs, imported_shapes, deleted_shape_type_ids, update_only_name = false) {
      let token_query = jwt_encode({
          login_key: login_key,
          id: id,
          name: name,
          shape_type_color: shape_type_color ? shape_type_color : '',
          shape_type_text_color: shape_type_text_color ? shape_type_text_color : '',
          shape_type_border_color: shape_type_border_color ? shape_type_border_color : '',
          is_round_corners: is_round_corners,
          shape_icon: shape_icon,
          update_only_name: update_only_name,
          attribute_tabs: attribute_tabs,
          imported_shapes: imported_shapes,
          deleted_shape_type_ids: deleted_shape_type_ids
      }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/update/object/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getDefaultShapeStyleIcons() {
      return [
          {
              name: 'Business',
              image: '1.png',
              is_default: true
          },
          {
              name: 'Chime',
              image: '2.png',
              is_default: true
          },
          {
              name: 'RoboMaker',
              image: '3.png',
              is_default: true
          },
          {
              name: 'GameLift',
              image: '4.png',
              is_default: true
          },
          {
              name: 'Connect',
              image: '5.png',
              is_default: true
          },
          {
              name: 'Honeycode',
              image: '6.png',
              is_default: true
          },
          {
              name: 'Pinpoint',
              image: '7.png',
              is_default: true
          },
          {
              name: 'Simple Email Service',
              image: '8.png',
              is_default: true
          },
          {
              name: 'WorkDocs',
              image: '9.png',
              is_default: true
          },
          {
              name: 'WorkMail',
              image: '10.png',
              is_default: true
          },
          {
              name: 'Open 3D-Engine',
              image: '11.png',
              is_default: true
          },
          {
              name: 'Marketplace Dark',
              image: '12.png',
              is_default: true
          },
          {
              name: 'Marketplace Dark',
              image: '13.png',
              is_default: true
          },
          {
              name: 'Actor',
              image: '14.png',
              is_default: true
          },
          {
              name: 'Application Component',
              image: '15.png',
              is_default: true
          },
          {
              name: 'Application Function',
              image: '16.png',
              is_default: true
          }
      ];
  }

  public onShapeImport(form_data){
      return this.http.post<ShapeImportResponse>(environment.server_url + '/object/type/shape-import', form_data).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }
}
