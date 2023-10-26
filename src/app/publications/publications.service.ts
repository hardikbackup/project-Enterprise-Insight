import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, take } from 'rxjs/operators';
import jwt_encode from 'jwt-encode';
import { HttpClient } from '@angular/common/http';

interface PublicationsInterface{
  status: boolean;
  error: string;
  publications: any;
  pages: number;
  total_pages: number;
}

interface PublicationsRemoveInterface{
  status: boolean;
  error: string;
  pages: number;
}

interface PublicationDetailInterface{
  status: boolean;
  error: string;
  publication: any;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface DiagramSearchInterface{
  status: boolean;
  error: string;
  diagrams: any;
}

interface DiagramLinkedObjects{
  status: boolean;
  error: string;
  objects: any;
}

interface LinkedObjectDiagrams{
  status: boolean;
  error: string;
  diagrams: any;
  pages: number;
}

interface DiagramDetailsInterface{
  status: boolean;
  error: string;
  diagram: any;
}

interface DiagramColorInterface{
  status: boolean;
  error: string;
  match_objects: any;
  other_objects: any;
  match_values: any;
}

interface DiagramHeatmapInterface{
  status: boolean;
  error: string;
  objects: any;
  match_values: any;
}

@Injectable({
  providedIn: 'root'
})
export class PublicationsService {

  constructor(private http: HttpClient) {

  }

  public getPublications(login_key, show_svg, sort_by, page) {
    let token_query = jwt_encode({ login_key: login_key, show_svg: show_svg, sort: sort_by, page: page },environment.encode_api_key);
    return this.http.post<PublicationsInterface>(environment.server_url + '/publications',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getPublicationViewer(login_key, show_svg, sort_by, page) {
    let token_query = jwt_encode({ login_key: login_key, show_svg: show_svg, sort: sort_by, page: page },environment.encode_api_key);
    return this.http.post<PublicationsInterface>(environment.server_url + '/publications/viewer',{
      token : token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public removePublication(login_key, publication_ids) {
    let token_query = jwt_encode({ login_key: login_key, publication_ids: publication_ids }, environment.encode_api_key);
    return this.http.post<PublicationsRemoveInterface>(environment.server_url + '/delete/publication', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public publicationDetails(login_key, id, id1) {
    let token_query = jwt_encode({ login_key: login_key, id: id, id1: id1 }, environment.encode_api_key);
    return this.http.post<PublicationDetailInterface>(environment.server_url + '/publication/detail', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public publicationEmbededDetails(publicationId, diagramId) {
    let token_query = jwt_encode({ login_key: '', id: publicationId, id1: diagramId }, environment.encode_api_key);
    return this.http.post<PublicationDetailInterface>(environment.server_url + '/public/publication/view', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }
  
  public updatePublication(login_key, id, name, diagram_id, checked_model_items, group_ids, update_only_name) {
    let token_query = jwt_encode({ login_key: login_key, id: id, name: name, diagram_id: diagram_id, checked_model_items: checked_model_items, group_ids: group_ids, update_only_name: update_only_name }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/update/publication', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public addPublication(login_key, name, diagram_id, checked_model_items, group_ids) {
    let token_query = jwt_encode({ login_key: login_key, name: name, diagram_id: diagram_id, checked_model_items: checked_model_items, group_ids: group_ids }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/create/publication', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public diagramSearch(login_key, keyword, checked_items) {
    return this.http.post<DiagramSearchInterface>(environment.server_url + '/diagram/search', {
      token: jwt_encode({ login_key: login_key, keyword: keyword, checked_items: checked_items }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public objectLinkedDiagrams(login_key, diagram_id) {
    return this.http.post<DiagramLinkedObjects>(environment.server_url + '/publication/linked/objects', {
      token: jwt_encode({ login_key: login_key, diagram_id: diagram_id }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public objectLinkedDiagramsPublic(publication_id, diagram_id) {
    return this.http.post<DiagramLinkedObjects>(environment.server_url + '/public/publication/linked/objects', {
      token: jwt_encode({ login_key: '', publication_id: publication_id, diagram_id: diagram_id }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getLinkedObjectDiagrams(login_key, object_id, page)
  {
    return this.http.post<LinkedObjectDiagrams>(environment.server_url + '/object/linked/diagrams', {
      token: jwt_encode({ login_key: login_key, object_id: object_id, page: page }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getDiagramDetails(login_key, diagram_id)
  {
    return this.http.post<DiagramDetailsInterface>(environment.server_url + '/diagram/details', {
      token: jwt_encode({ login_key: login_key, diagram_id: diagram_id }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public diagramColorMap(login_key, diagram_id, attribute_id, selected_value, object_ids)
  {
    let token_query = jwt_encode({ login_key: login_key, diagram_id: diagram_id, attribute_id: attribute_id, selected_value: selected_value, object_ids: object_ids }, environment.encode_api_key);
    return this.http.post<DiagramColorInterface>(environment.server_url + '/diagram/color', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public diagramHeatMap(login_key, diagram_id, attribute_id, selected_value, object_ids)
  {
    let token_query = jwt_encode({ login_key: login_key, diagram_id: diagram_id, attribute_id: attribute_id, selected_value: selected_value, object_ids: object_ids }, environment.encode_api_key);
    return this.http.post<DiagramHeatmapInterface>(environment.server_url + '/diagram/heatmap', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public relationshipColorMap(login_key, diagram_id, attribute_id, selected_value, relationship_ids)
  {
    let token_query = jwt_encode({ login_key: login_key, diagram_id: diagram_id, attribute_id: attribute_id, selected_value: selected_value, relationship_ids: relationship_ids }, environment.encode_api_key);
    return this.http.post<any>(environment.server_url + '/diagram/relationship/color', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public relationshipHeatMap(login_key, diagram_id, attribute_id, selected_value, relationship_ids)
  {
    let token_query = jwt_encode({ login_key: login_key, diagram_id: diagram_id, attribute_id: attribute_id, selected_value: selected_value, relationship_ids: relationship_ids }, environment.encode_api_key);
    return this.http.post<any>(environment.server_url + '/diagram/relationship/heatmap', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }
}
