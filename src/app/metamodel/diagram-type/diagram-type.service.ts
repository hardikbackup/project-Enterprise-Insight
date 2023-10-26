import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { environment } from '../../../environments/environment';

interface DiagramTypeInterface{
  status: boolean;
  error: string;
  diagram_types: any;
  pages: number;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface DiagramTypeDetailsResponse{
  status: boolean;
  error: string;
  diagram_type_data : {
    id: number;
    name: string;
  }
}

interface DiagramTypeDeleteInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface DiagramTypeSearchInterface{
  status: boolean;
  error: string;
  diagram_types: any;
  pages: number;
}

interface DiagramTypeLibraryItemsInterface{
    status: boolean;
    error: string;
    libraries: any;
    combinations: any;
    connector_combinations: any;
}

interface ObjectTypesInterface{
    status: boolean;
    error: string;
    object_types: any;
    pages: number;
}

interface DiagramTypeAddLibraryInterface{
    status: boolean;
    error: string;
    id: string;
    shapes: any;
}

interface DiagramTypesListInterface{
    status: boolean;
    error: string;
    diagram_types: any;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramTypeService {

  constructor(
      private http: HttpClient
  ) { }

  getDiagramTypes(login_key, sort, page) {
      let token_query = jwt_encode({ login_key: login_key, sort: sort, page: page },environment.encode_api_key);
      return this.http.post<DiagramTypeInterface>(environment.server_url + '/diagram/types',{
        token : token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addDiagramType(login_key, diagram_type_id, name, library_items, combinations, connector_combination_items) {
    let token_query = jwt_encode({
      login_key: login_key,
      library_items: library_items,
      diagram_type_id: diagram_type_id,
      name: name,
      combinations: combinations ,
      connector_combinations: connector_combination_items
  }, environment.encode_api_key);;
      return this.http.post<DefaultResponse>(environment.server_url + '/diagram/types/create', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public diagramTypeDetails(login_key, id) {
    let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
    return this.http.post<DiagramTypeDetailsResponse>(environment.server_url + '/diagram/type/detail', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateDiagramType(login_key, id, name) {
      let token_query = jwt_encode({login_key: login_key, id: id, name: name}, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/update/diagram/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public removeDiagramType(login_key, diagram_type_ids) {
      let token_query = jwt_encode({ login_key: login_key, diagram_type_ids: diagram_type_ids }, environment.encode_api_key);
      return this.http.post<DiagramTypeDeleteInterface>(environment.server_url + '/delete/diagram/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public diagramTypeSearch(login_key, keyword, model_id = null, page) {
      let token_query = jwt_encode({ login_key: login_key, keyword: keyword, model_id: model_id, page: page }, environment.encode_api_key);
      return this.http.post<DiagramTypeSearchInterface>(environment.server_url + '/diagram/type/search', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getDiagramTypeLibraryItems(login_key, diagram_type_id) {
      // /**Dummy Response*/
      // return Observable.create(observer => {
      //     setTimeout(() => {
      //         var resp = {
      //             status: true,
      //             error: '',
      //             libraries: [
      //                 {
      //                     id: '1',
      //                     name: 'General',
      //                     is_default: '1',
      //                     shapes: [
      //                         {
      //                           id: '100',
      //                           name: 'Rectangle',
      //                           svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="1.44" y="7.68" width="28.8" height="14.4" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g></g><g></g><g></g></g></svg>',
      //                         },
      //                         {
      //                             id: '101',
      //                             name: 'Rounded Rectangle',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="1.44" y="7.68" width="28.8" height="14.4" rx="2.16" ry="2.16" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g></g><g></g><g></g></g></svg>'
      //                         },
      //                     ]
      //                 },
      //                 {
      //                     id: '2',
      //                     name: 'Misc',
      //                     is_default: '1',
      //                     shapes: [
      //                         {
      //                             id: '102',
      //                             name: 'Text',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="0.73" y="7.3" width="29.2" height="14.6" fill="none" stroke="white" pointer-events="stroke" visibility="hidden" stroke-width="9"></rect><rect x="0.73" y="7.3" width="29.2" height="14.6" fill="none" stroke="none" pointer-events="all"></rect></g><g style=""><g transform="scale(0.73)"><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="137%" height="137%"><div style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 38px; height: 1px; padding-top: 20px; margin-left: 2px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">Text</div></div></div></foreignObject></g></g></g><g></g><g></g></g></svg>'
      //                         },
      //                         {
      //                             id: '103',
      //                             name: 'Textbox',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="1.65" y="6.6" width="28.5" height="18" fill="none" stroke="white" pointer-events="stroke" visibility="hidden" stroke-width="9"></rect><rect x="1.65" y="6.6" width="28.5" height="18" fill="none" stroke="none" pointer-events="all"></rect></g><g style=""><g transform="scale(0.15)"><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="667%" height="667%"><div style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 182px; height: 1px; padding-top: 34px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 130px; overflow: hidden; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; "><h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div></div></div></foreignObject></g></g></g><g></g><g></g></g></svg>'
      //                         },
      //                         {
      //                             id: '104',
      //                             name: 'Textbox',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="1.65" y="6.6" width="28.5" height="18" fill="none" stroke="white" pointer-events="stroke" visibility="hidden" stroke-width="9"></rect><rect x="1.65" y="6.6" width="28.5" height="18" fill="none" stroke="none" pointer-events="all"></rect></g><g style=""><g transform="scale(0.15)"><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="667%" height="667%"><div style="display: flex; align-items: unsafe flex-start; justify-content: unsafe flex-start; width: 182px; height: 1px; padding-top: 34px; margin-left: 16px;"><div style="box-sizing: border-box; font-size: 0; text-align: left; max-height: 130px; overflow: hidden; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; "><h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div></div></div></foreignObject></g></g></g><g></g><g></g></g></svg>'
      //                         },
      //                     ]
      //                 },
      //                 {
      //                     name: 'Custom Library',
      //                     is_default: '0',
      //                     shapes: [
      //                         {
      //                             id: '105',
      //                             name: 'Ellipse',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><ellipse cx="15.84" cy="14.88" rx="14.399999999999999" ry="9.6" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></ellipse></g></g><g></g><g></g></g></svg>'
      //                         },
      //                         {
      //                             id: '106',
      //                             name: 'Square',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="2.38" y="1.36" width="27.2" height="27.2" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g></g><g></g><g></g></g></svg>'
      //                         },
      //                         {
      //                             id: '107',
      //                             name: 'Square',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="2.38" y="1.36" width="27.2" height="27.2" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g></g><g></g><g></g></g></svg>'
      //                         },
      //                         {
      //                             id: '108',
      //                             name: 'Square',
      //                             svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="2.38" y="1.36" width="27.2" height="27.2" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g></g><g></g><g></g></g></svg>'
      //                         },
      //                     ]
      //                 }
      //             ],
      //             combinations: [
      //                 {
      //                     id: '1',
      //                     library_id: '1',
      //                     shape_type_id: '1',
      //                     shape_type_name: 'Rectangle',
      //                     shape_type_svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="1.44" y="7.68" width="28.8" height="14.4" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g></g><g></g><g></g></g></svg>',
      //                     object_type_id: '2',
      //                     object_type_name: 'Object Type 1',
      //                 },
      //                 {
      //                     id: '2',
      //                     library_id: '1',
      //                     shape_type_id: '2',
      //                     shape_type_name: 'Rectangle v2',
      //                     shape_type_svg: '<svg style="left: 1px; top: 1px; width: 32px; height: 30px; display: block; position: relative; overflow: hidden;"><g><g></g><g><g style="visibility: visible;" transform="translate(0.5,0.5)"><rect x="1.44" y="7.68" width="28.8" height="14.4" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g></g><g></g><g></g></g></svg>',
      //                     object_type_id: '2',
      //                     object_type_name: 'Object Type 3',
      //                 },
      //             ],
      //         }
      //         observer.next(resp);
      //         observer.complete();
      //     },10)
      // });
      let token_query = jwt_encode({ login_key: login_key, diagram_type_id: diagram_type_id }, environment.encode_api_key);
      return this.http.post<DiagramTypeLibraryItemsInterface>(environment.server_url + '/diagram/type/library/items', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

    public getObjectTypesList(login_key, page) {
        let token_query = jwt_encode({ login_key: login_key, page: page }, environment.encode_api_key);
        return this.http.post<ObjectTypesInterface>(environment.server_url + '/object/types/list', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
              return resp;
            })
      );
    }

    public updateDiagramCombinations(login_key, diagram_type_id, name, library_items, combinations, connector_combination_items) {
        let token_query = jwt_encode({
            login_key: login_key,
            library_items: library_items,
            diagram_type_id: diagram_type_id,
            name: name,
            combinations: combinations ,
            connector_combinations: connector_combination_items
        }, environment.encode_api_key);
        return this.http.post<DefaultResponse>(environment.server_url + '/diagram/type/update/combinations', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public addDiagramTypeLibrary(login_key, diagram_type_id, name, code, xml, shapes) {
        /**Dummy Response*/
        let token_query = jwt_encode({ login_key: login_key, diagram_type_id: diagram_type_id, name: name, code: code, encoded_xml: xml, shapes: shapes }, environment.encode_api_key);
        return this.http.post<DiagramTypeAddLibraryInterface>(environment.server_url + '/diagram/type/add/library', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    getExportDiagramTypes(params) {
        let token_query = jwt_encode(params,environment.encode_api_key);
        return this.http.post<DiagramTypeInterface>(environment.server_url + '/load/view/diagram/types',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }
    getDefaultLibraries() {
      return this.http.post<any>(environment.server_url + '/api/get-all-default-libraries',{}).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }
}
