import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, take } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jwt_encode from 'jwt-encode';
import { Observable } from 'rxjs';

interface ConnectorsInterface{
  status: boolean;
  error: string;
  data_connectors: any;
  pages: number;
  total_pages: number;
}

interface RemoveConnectorInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface ConnectorDetailsResponse{
  status: boolean;
  error: string;
  connector : any;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface ExcelSheetResponse{
  status: boolean;
  sheets: any;
  file_name: string;
  error: string;
}

interface ImportExcelInterface{
  status: boolean;
  objects_created: number;
  model_name: any;
  relationships_created: number;
  attributes_created: number;
  failed_creations: number;
  error: string;
}

interface ExcelImportsInterface{
  status: boolean;
  error: string;
  excel_imports: any;
  pages: number;
}

interface RemoveExcelInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface ExcelImportRecordInterface{
  status: boolean;
  error: string;
  sheets: any;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataConnectorsService {

  constructor(
      private http: HttpClient
  ) { }

  public getConnectors(login_key, sort_by, page) {
    let token_query = jwt_encode({ login_key: login_key, sort: sort_by, page: page },environment.encode_api_key);
    return this.http.post<ConnectorsInterface>(environment.server_url + '/data/connectors',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public connectorDetails(login_key, id) {
    let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
    return this.http.post<ConnectorDetailsResponse>(environment.server_url + '/data-connector/details', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public removeConnectors(login_key, connector_ids) {
    let token_query = jwt_encode({ login_key: login_key, connector_ids: connector_ids }, environment.encode_api_key);
    return this.http.post<RemoveConnectorInterface>(environment.server_url + '/delete/data-connectors', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateConnector(login_key, id, form_data, update_only_name) {
    let token_query = jwt_encode({ login_key: login_key, id: id, form_data: form_data, update_only_name: update_only_name }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/update/data-connector', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public addConnector(login_key, form_data) {
    let token_query = jwt_encode({ login_key: login_key, form_data: form_data }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/add/data-connector', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public fetchExcel(form_data) {
    return this.http.post<ExcelSheetResponse>(environment.server_url + '/data-connector/fetch/excel', form_data).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public onExcelSheetSave(login_key, excel_import_id, import_name, type, sheets)
  {
    let token_query = jwt_encode({ login_key: login_key, excel_import_id: excel_import_id, import_name: import_name, type: type, sheets: sheets }, environment.encode_api_key);
    return this.http.post<ImportExcelInterface>(environment.server_url + '/data-connector/import/excel', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getExcelImports(login_key, sort, page)
  {
    let token_query = jwt_encode({ login_key: login_key, sort: sort, page: page },environment.encode_api_key);
    return this.http.post<ExcelImportsInterface>(environment.server_url + '/excel-imports',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public removeExcelImport(login_key, excel_import_ids) {
    let token_query = jwt_encode({ login_key: login_key, excel_import_ids: excel_import_ids }, environment.encode_api_key);
    return this.http.post<RemoveExcelInterface>(environment.server_url + '/delete/excel-imports', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public renameExcelImport(login_key, id, name) {
    let token_query = jwt_encode({ login_key: login_key, id: id, name: name }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/excel-import/rename', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getExcelImportRecord(login_key, id) {
    let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
    return this.http.post<ExcelImportRecordInterface>(environment.server_url + '/excel-import/get/record', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }
}
