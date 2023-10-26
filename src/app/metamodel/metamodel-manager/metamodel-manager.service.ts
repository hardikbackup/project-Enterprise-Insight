import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, take } from 'rxjs/operators';
import jwt_encode from 'jwt-encode';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MetaModelsInterface{
  status: boolean;
  error: string;
  metamodels: any;
  pages: number;
  total_pages: number;
}

interface MetaModelRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface AvailableRelationshipTypesInterface{
  status: boolean;
  error: string;
  relationship_types: any;
}

interface AvailableDiagramTypesInterface{
  status: boolean;
  error: string;
  diagram_types: any;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface MetamodelDetailInterface{
  status: boolean;
  metamodel_data: any;
  error: string;
}

@Injectable({
  providedIn: 'root'
})

export class MetamodelManagerService {

  constructor(
      private http: HttpClient
  ) { }

  public getMetamodels(login_key, sort_by, page) {
    let token_query = jwt_encode({ login_key: login_key, sort: sort_by, page: page },environment.encode_api_key);
    return this.http.post<MetaModelsInterface>(environment.server_url + '/metamodels',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public removeMetamodel(login_key, metamodel_ids) {
    let token_query = jwt_encode({ login_key: login_key, metamodel_ids: metamodel_ids }, environment.encode_api_key);
    return this.http.post<MetaModelRemoveInterface>(environment.server_url + '/delete/metamodel', {
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
    // return Observable.create(observer => {
    //   setTimeout(() => {
    //     observer.next({
    //       status: true,
    //       relationship_types: [
    //         {
    //           id: 1,
    //           name: "Relationship Type 1",
    //         },
    //         {
    //           id: 2,
    //           name: "Relationship Type 2",
    //         },
    //         {
    //           id: 3,
    //           name: "Relationship Type 3",
    //         },
    //         {
    //           id: 4,
    //           name: "Relationship Type 4",
    //         },
    //         {
    //           id: 5,
    //           name: "Relationship Type 5",
    //         },
    //       ],
    //     });
    //     observer.complete();
    //   }, 10);
    // });

    return this.http.post<AvailableRelationshipTypesInterface>(environment.server_url + '/user/available/relationship/types', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getAvailableDiagramTypes(login_key) {
    let token_query = jwt_encode({ login_key: login_key }, environment.encode_api_key);
    // return Observable.create(observer => {
    //   setTimeout(() => {
    //     observer.next({
    //       status: true,
    //       diagram_types: [
    //         {
    //           id: 11,
    //           name: "Diagram Type 1",
    //         },
    //         {
    //           id: 12,
    //           name: "Diagram Type 2",
    //         },
    //         {
    //           id: 13,
    //           name: "Diagram Type 3",
    //         },
    //         {
    //           id: 14,
    //           name: "Diagram Type 4",
    //         },
    //       ],
    //     });
    //     observer.complete();
    //   }, 10);
    // });
    return this.http.post<AvailableDiagramTypesInterface>(environment.server_url + '/user/available/diagram/types', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public addMetamodel(login_key, name, default_checked, object_type_ids, relationship_type_ids, diagram_type_ids, relationship_type_list_object) {
    let relationship_type_map_ids = relationship_type_list_object.reduce(
      (obj, item) => Object.assign(obj, { [item.id]: item }), {});
    let token_query = jwt_encode({ login_key: login_key, name: name, default: default_checked, object_type_ids: object_type_ids, relationship_type_ids: relationship_type_ids, diagram_type_ids: diagram_type_ids, relationship_type_map_ids:relationship_type_map_ids }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/create/metamodel', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public metamodelDetails(login_key, id) {
    let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
    // return Observable.create(observer => {
    //   setTimeout(() => {
    //     observer.next({
    //       status: true,
    //       metamodel_data: {
    //         id: 1,
    //         name: "Some Metamodel",
    //         default: false,
    //         available_object_types: [
    //           {
    //             id: 1,
    //             name: "Obj Type 1",
    //           },
    //           {
    //             id: 2,
    //             name: "Obj Type 2",
    //           },
    //         ],
    //         selected_object_types: [
    //           {
    //             id: 2,
    //             name: "Obj Type 2",
    //           },
    //         ],
    //         available_relationship_types: [
    //           {
    //             id: 3,
    //             name: "Rel Type 3",
    //           },
    //           {
    //             id: 4,
    //             name: "Rel Type 4",
    //           },
    //         ],
    //         selected_relationship_types: [
    //           {
    //             id: 4,
    //             name: "Rel Type 4",
    //           },
    //         ],
    //         available_diagram_types: [
    //           {
    //             id: 11,
    //             name: "Diagram Type 11",
    //           },
    //           {
    //             id: 12,
    //             name: "Diagram Type 12",
    //           },
    //           {
    //             id: 13,
    //             name: "Diagram Type 13",
    //           },
    //           {
    //             id: 14,
    //             name: "Diagram Type 14",
    //           },
    //         ],
    //         selected_diagram_types: [
    //           {
    //             id: 11,
    //             name: "Diagram Type 11",
    //           },
    //         ]
    //       },
    //     });
    //     observer.complete();
    //   }, 10);
    // })

    return this.http.post<MetamodelDetailInterface>(environment.server_url + '/metamodel/detail', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateMetamodel(login_key, id, name, default_checked, object_type_ids, relationship_type_ids, diagram_type_ids, update_only_name,
    relationship_type_list_object) {
    let relationship_type_map_ids = relationship_type_list_object.reduce(
      (obj, item) => Object.assign(obj, { [item.id]: item }), {});
    console.log(relationship_type_map_ids);
    let token_query = jwt_encode({ login_key: login_key, id: id, name: name, default: default_checked, object_type_ids: object_type_ids, relationship_type_ids: relationship_type_ids, diagram_type_ids: diagram_type_ids, update_only_name: update_only_name, relationship_type_map_ids:relationship_type_map_ids }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/update/metamodel', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateDefaultFlag(login_key, id, default_checked,default_primary) {
    let token_query = jwt_encode({ login_key: login_key, id: id, default: default_checked,default_primary:default_primary }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/update/metamodel/default', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public exportXMLMetaModel(login_key, metamodels): Observable<any> {
    let token_query = jwt_encode({ login_key: login_key, metaModels:metamodels}, environment.encode_api_key);
    return this.http.post<any>(environment.server_url + '/metamodel/export-to-xml',{
      token: token_query
    }, { responseType: 'xml' as 'json' }).pipe(map((resp:any)=>{
      console.log(resp)
      return resp;
    })
    );
  }
  public fetchXML(form_data) {
    return this.http.post<any>(environment.server_url + '/metamodel/import-xml', form_data).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }
}