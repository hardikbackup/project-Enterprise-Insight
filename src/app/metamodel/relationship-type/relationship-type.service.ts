import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { environment } from '../../../environments/environment';

interface relationshipTypesInterface{
  status: boolean;
  error: string;
  relationship_types: any;
  pages: number;
}

interface relationshipTypeRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface relationshipTypeDetailsResponse{
  status: boolean;
  error: string;
  relationship_data : any;
}

interface RelationshipTypesListInterface{
  status: boolean;
  error: string;
  relationship_types: any;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class RelationshipTypeService {

  constructor(
      private http: HttpClient
  ) { }

  getRelationshipTypes(login_key, sort, page) {
      let token_query = jwt_encode({login_key: login_key, sort: sort, page: page},environment.encode_api_key);
      return this.http.post<relationshipTypesInterface>(environment.server_url + '/relationship/types',{
        token : token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public removeRelationshipType(login_key, relationship_type_ids) {
      let token_query = jwt_encode({ login_key: login_key, ids: relationship_type_ids }, environment.encode_api_key);
      return this.http.post<relationshipTypeRemoveInterface>(environment.server_url + '/delete/relationship/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addRelationshipType(login_key, form_data, object_type_combinations, attribute_tabs) {
      let token_query = jwt_encode({ login_key: login_key, form_data: form_data, combinations : object_type_combinations, attribute_tabs: attribute_tabs }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/create/relationship/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public relationshipTypeDetails(login_key, id) {
      let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
      return this.http.post<relationshipTypeDetailsResponse>(environment.server_url + '/relationship/type/details', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateRelationshipType(login_key, form_data, object_type_combinations, attribute_tabs, update_only_name) {
      let token_query = jwt_encode({ login_key: login_key, form_data: form_data, combinations: object_type_combinations, update_only_name: update_only_name, attribute_tabs: attribute_tabs }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/update/relationship/type', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getRelationshipTypesList(login_key, page) {
    /**Dummy Response*/
    // return Observable.create(observer => {
    //     setTimeout(() => {
    //         var resp = {
    //             status: true,
    //             error: '',
    //             pages: 1,
    //             relationship_types: [
    //                 {
    //                     id: '1',
    //                     name: 'Relationship Type 1',
    //                 },
    //                 {
    //                     id: '2',
    //                     name: 'Relationship Type 2',
    //                 },
    //                 {
    //                     id: '3',
    //                     name: 'Relationship Type 3',
    //                 },
    //                 {
    //                     id: '4',
    //                     name: 'Relationship Type 4',
    //                 },
    //                 {
    //                     id: '5',
    //                     name: 'Relationship Type 5',
    //                 },
    //                 {
    //                     id: '6',
    //                     name: 'Relationship Type 6',
    //                 }
    //             ]
    //         }
    //         observer.next(resp);
    //         observer.complete();
    //     },10)
    // });
    let token_query = jwt_encode({ login_key: login_key, page: page }, environment.encode_api_key);
    return this.http.post<RelationshipTypesListInterface>(environment.server_url + '/relationship/types/list', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getStartLinesList() {
      return [
          {
              id: 'startclassic',
              class: 'mxgraph-sprite mxgraph-startclassic',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_CLASSIC, 1]"
          },
          {
              id: 'startclassicthin',
              class: 'mxgraph-sprite mxgraph-startclassicthin',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_CLASSIC_THIN, 1]"
          },
          {
              id: 'startopen',
              class: 'mxgraph-sprite mxgraph-startopen',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_OPEN, 0]"
          },
          {
              id: 'startopenthin',
              class: 'mxgraph-sprite mxgraph-startopenthin',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_OPEN_THIN, 0]"
          },
          {
              id: 'startopenasync',
              class: 'mxgraph-sprite mxgraph-startopenasync',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['openAsync', 0]"
          },
          {
              id: 'startblock',
              class: 'mxgraph-sprite mxgraph-startblock',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_BLOCK, 1]"
          },
          {
              id: 'startblockthin',
              class: 'mxgraph-sprite mxgraph-startblockthin',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_BLOCK_THIN, 1]"
          },
          {
              id: 'startasync',
              class: 'mxgraph-sprite mxgraph-startasync',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['async', 1]"
          },
          {
              id: 'startoval',
              class: 'mxgraph-sprite mxgraph-startoval',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_OVAL, 1]"
          },
          {
              id: 'startdiamond',
              class: 'mxgraph-sprite mxgraph-startdiamond',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_DIAMOND, 1]"
          },
          {
              id: 'startthindiamond',
              class: 'mxgraph-sprite mxgraph-startthindiamond',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_DIAMOND_THIN, 1]"
          },
          {
              id: 'startclassictrans',
              class: 'mxgraph-sprite mxgraph-startclassictrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_CLASSIC, 0]"
          },
          {
              id: 'startclassicthintrans',
              class: 'mxgraph-sprite mxgraph-startclassicthintrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_CLASSIC_THIN, 0]"
          },
          {
              id: 'startblocktrans',
              class: 'mxgraph-sprite mxgraph-startblocktrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_BLOCK, 0]"
          },
          {
              id: 'startblockthintrans',
              class: 'mxgraph-sprite mxgraph-startblockthintrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_BLOCK_THIN, 0]"
          },
          {
              id: 'startasynctrans',
              class: 'mxgraph-sprite mxgraph-startasynctrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['async', 0]"
          },
          {
              id: 'startovaltrans',
              class: 'mxgraph-sprite mxgraph-startovaltrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_OVAL, 0]"
          },
          {
              id: 'startdiamondtrans',
              class: 'mxgraph-sprite mxgraph-startdiamondtrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_DIAMOND, 0]"
          },
          {
              id: 'startthindiamondtrans',
              class: 'mxgraph-sprite mxgraph-startthindiamondtrans',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "[mxConstants.ARROW_DIAMOND_THIN, 0]"
          },
          {
              id: 'box',
              class: 'mxgraph-box',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['box', 0]"
          },
          {
              id: 'halfCircle',
              class: 'mxgraph-halfCircle',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['halfCircle', 0]"
          },
          {
              id: 'startdash',
              class: 'mxgraph-sprite mxgraph-startdash',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['dash', 0]"
          },
          {
              id: 'startcross',
              class: 'mxgraph-sprite mxgraph-startcross',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['cross', 0]"
          },
          {
              id: 'startcircleplus',
              class: 'mxgraph-sprite mxgraph-startcircleplus',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['circlePlus', 0]"
          },
          {
              id: 'startcircle',
              class: 'mxgraph-sprite mxgraph-startcircle',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['circle', 1]"
          },
          {
              id: 'starterone',
              class: 'mxgraph-sprite mxgraph-starterone',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['ERone', 0]"
          },
          {
              id: 'starteronetoone',
              class: 'mxgraph-sprite mxgraph-starteronetoone',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['ERmandOne', 0]"
          },
          {
              id: 'startermany',
              class: 'mxgraph-sprite mxgraph-startermany',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['ERmany', 0]"
          },
          {
              id: 'starteronetomany',
              class: 'mxgraph-sprite mxgraph-starteronetomany',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['ERoneToMany', 0]"
          },
          {
              id: 'starteroneopt',
              class: 'mxgraph-sprite mxgraph-starteroneopt',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['ERzeroToOne', 1]"
          },
          {
              id: 'startermanyopt',
              class: 'mxgraph-sprite mxgraph-startermanyopt',
              key: "[mxConstants.STYLE_STARTARROW, 'startFill']",
              value: "['ERzeroToMany', 1]"
          },
      ]
  }

    public getEndLinesList() {
        return [
            {
                id: 'endclassic',
                class: 'mxgraph-sprite mxgraph-endclassic',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_CLASSIC, 1]"
            },
            {
                id: 'endclassicthin',
                class: 'mxgraph-sprite mxgraph-endclassicthin',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_CLASSIC_THIN, 1]"
            },
            {
                id: 'endopen',
                class: 'mxgraph-sprite mxgraph-endopen',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_OPEN, 0]"
            },
            {
                id: 'endopenthin',
                class: 'mxgraph-sprite mxgraph-endopenthin',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_OPEN_THIN, 0]"
            },
            {
                id: 'endopenasync',
                class: 'mxgraph-sprite mxgraph-endopenasync',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['openAsync', 0]"
            },
            {
                id: 'endblock',
                class: 'mxgraph-sprite mxgraph-endblock',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_BLOCK, 1]"
            },
            {
                id: 'endblockthin',
                class: 'mxgraph-sprite mxgraph-endblockthin',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_BLOCK_THIN, 1]"
            },
            {
                id: 'endasync',
                class: 'mxgraph-sprite mxgraph-endasync',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['async', 1]"
            },
            {
                id: 'endoval',
                class: 'mxgraph-sprite mxgraph-endoval',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_OVAL, 1]"
            },
            {
                id: 'enddiamond',
                class: 'mxgraph-sprite mxgraph-enddiamond',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_DIAMOND, 1]"
            },
            {
                id: 'endthindiamond',
                class: 'mxgraph-sprite mxgraph-endthindiamond',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_DIAMOND_THIN, 1]"
            },
            {
                id: 'endclassictrans',
                class: 'mxgraph-sprite mxgraph-endclassictrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_CLASSIC, 0]"
            },
            {
                id: 'endclassicthintrans',
                class: 'mxgraph-sprite mxgraph-endclassicthintrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_CLASSIC_THIN, 0]"
            },
            {
                id: 'endblocktrans',
                class: 'mxgraph-sprite mxgraph-endblocktrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_BLOCK, 0]"
            },
            {
                id: 'endblockthintrans',
                class: 'mxgraph-sprite mxgraph-endblockthintrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_BLOCK_THIN, 0]"
            },
            {
                id: 'endasynctrans',
                class: 'mxgraph-sprite mxgraph-endasynctrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['async', 0]"
            },
            {
                id: 'endovaltrans',
                class: 'mxgraph-sprite mxgraph-endovaltrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_OVAL, 0]"
            },
            {
                id: 'enddiamondtrans',
                class: 'mxgraph-sprite mxgraph-enddiamondtrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_DIAMOND, 0]"
            },
            {
                id: 'endthindiamondtrans',
                class: 'mxgraph-sprite mxgraph-endthindiamondtrans',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "[mxConstants.ARROW_DIAMOND_THIN, 0]"
            },
            {
                id: 'endbox',
                class: 'mxgraph-box mxgraph-end-box',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['box', 0]"
            },
            {
                id: 'endhalfCircle',
                class: 'mxgraph-halfCircle mxgraph-end-halfCircle',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['halfCircle', 0]"
            },
            {
                id: 'enddash',
                class: 'mxgraph-sprite mxgraph-enddash',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['dash', 0]"
            },
            {
                id: 'endcross',
                class: 'mxgraph-sprite mxgraph-endcross',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['cross', 0]"
            },

            {
                id: 'endcircleplus',
                class: 'mxgraph-sprite mxgraph-endcircleplus',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['circlePlus', 0]"
            },
            {
                id: 'endcircle',
                class: 'mxgraph-sprite mxgraph-endcircle',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['circle', 1]"
            },
            {
                id: 'enderone',
                class: 'mxgraph-sprite mxgraph-enderone',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['ERone', 0]"
            },
            {
                id: 'enderonetoone',
                class: 'mxgraph-sprite mxgraph-enderonetoone',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['ERmandOne', 0]"
            },
            {
                id: 'endermany',
                class: 'mxgraph-sprite mxgraph-endermany',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['ERmany', 0]"
            },
            {
                id: 'enderonetomany',
                class: 'mxgraph-sprite mxgraph-enderonetomany',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['ERoneToMany', 0]"
            },
            {
                id: 'enderoneopt',
                class: 'mxgraph-sprite mxgraph-enderoneopt',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['ERzeroToOne', 1]"
            },
            {
                id: 'endermanyopt',
                class: 'mxgraph-sprite mxgraph-endermanyopt',
                key: "[mxConstants.STYLE_ENDARROW, 'endFill']",
                value: "['ERzeroToMany', 1]"
            },
        ]
    }
}
