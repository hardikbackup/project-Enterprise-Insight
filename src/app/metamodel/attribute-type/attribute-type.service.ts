import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { environment } from '../../../environments/environment';

interface attributeTypesInterface{
  status: boolean;
  error: string;
  attribute_types: any;
  pages: number;
}

interface AttributeTypeRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface AttributeTypeDetailsResponse{
  status: boolean;
  error: string;
  attribute_data : any;
}

interface AvailableObjectTypesInterface{
  status: boolean;
  error: string;
  object_types: any;
}

interface AvailableRelationshipTypesInterface{
    status: boolean;
    error: string;
    relationship_types: any;
}

interface AvailableAttributeTypesInterface{
  status: boolean,
  error: string,
  attribute_types: any;
}

@Injectable({
  providedIn: 'root'
})
export class AttributeTypeService {

  constructor(
      private http: HttpClient
  ) { }

  getAttributeTypes(login_key, sort, page) {
      let token_query = jwt_encode({ login_key: login_key, sort: sort, page: page },environment.encode_api_key);
      return this.http.post<attributeTypesInterface>(environment.server_url + '/attribute/types',{
        token : token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public removeAttributeType(login_key, attribute_type_ids) {
      let token_query = jwt_encode({ login_key: login_key, attribute_type_ids: attribute_type_ids }, environment.encode_api_key);
      return this.http.post<AttributeTypeRemoveInterface>(environment.server_url + '/delete/attribute/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getAvailableObjectTypes(login_key) {
      let token_query = jwt_encode({ login_key: login_key }, environment.encode_api_key);
      return this.http.post<AvailableObjectTypesInterface>(environment.server_url + '/user/available/object/types', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getAvailableRelationshipTypes(login_key) {
      let token_query = jwt_encode({ login_key: login_key }, environment.encode_api_key);
      return this.http.post<AvailableRelationshipTypesInterface>(environment.server_url + '/user/available/relationship/types', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

  public addAttributeType(login_key, form_data) {
      let token_query = jwt_encode({ login_key: login_key, form_data: form_data }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/attribute/type/create', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public attributeDetails(login_key, id) {
      let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
      return this.http.post<AttributeTypeDetailsResponse>(environment.server_url + '/attribute/type/detail', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateAttributeType(login_key, form_data, update_only_name) {
      let token_query = jwt_encode({ login_key: login_key, form_data: form_data, update_only_name: update_only_name }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/attribute/type/update', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getAvailableAttributeTypes(login_key) {
      let token_query = jwt_encode({ login_key: login_key }, environment.encode_api_key);
      return this.http.post<AvailableAttributeTypesInterface>(environment.server_url + '/user/available/attribute/types', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getDefaultTypesList() {
    return [
        {
            id : 'text',
            name : 'Text',
        },
        {
            id : 'date',
            name : 'Date',
        },
        {
            id : 'date_range',
            name : 'Date Range',
        },
        {
            id : 'decimal',
            name : 'Decimal',
        },
        {
            id : 'integer',
            name : 'Integer',
        },
        {
            id : 'boolean',
            name : 'Boolean'
        },
        {
            id : 'list',
            name : 'List'
        },
        {
            id : 'multiple-list',
            name : 'Multi-Select List'
        },
        {
            id : 'url',
            name : 'URL'
        },
    ];
  }

  public getCurrencyOptions() {
    return {
        'usd' : 'USD',
        'gbp' : 'GBP',
        'aud' : 'AUD',
        'eur' : 'EUR'
    };
  }

  public getCurrencyIcons() {
    return {
      'usd' : '$',
      'gbp' : '£',
      'aud' : 'AU$',
      'eur' : '€'
    };
  }

  public updateExportToDiagramFlag(login_key, id, export_to_diagram) {
      let token_query = jwt_encode({ login_key: login_key, id: id, export_to_diagram: export_to_diagram }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/attribute/type/export/diagram', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }
}
