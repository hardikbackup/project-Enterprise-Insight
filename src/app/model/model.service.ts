import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
import { take, map } from "rxjs/operators";
import jwt_encode from 'jwt-encode';
import { DOCUMENT } from "@angular/common";
import {Observable} from 'rxjs';

interface ModelsInterface{
  status: boolean;
  error: string;
  users: any;
  pages: number;
  breadcrumbs: any;
  items: any;
}

interface AddObjectTypeInterface{
  status: boolean;
  error: string;
  id: string;
  name: string;
  pages: number;
}

interface AddDiagramInterface{
    status: boolean;
    error: string;
    id: string;
    name: string;
    pages: number;
    diagram_new_tab: boolean;
}

interface AddModelFolderTypeInterface{
  status: boolean;
  error: string;
  id: number;
  name: string;
  pages: any;
}

interface DefaultResponse{
  status: boolean;
  error: string;
}

interface ModelFolderExpandResponse{
  status: boolean;
  error: string;
  models: any;
  pages: any;
  model_viewer_left_sidebar_width: number;
}

interface ObjectPropertiesInterface{
  status: boolean;
  error: string;
  settings: any;
  available_object_types: any;
  object_type_attributes: any;
}

interface ObjectRelationshipInterface{
  status: boolean;
  error: string;
  relationships_data: any;
  pages: any;
}

interface ObjectInlineAttributesInterface{
  status: boolean;
  error: string;
  model_column_width: any;
  object_name_column_width: any;
  object_attributes: any;
  attributes: any;
  pages: any;
  settings: any;
  available_attributes: any;
  selected_attributes: any;
  selected_system_properties: any;
}

interface AddModelInterface{
  status: boolean;
  error: string;
  pages: any;
}

interface DeleteModelsInterface{
  status: boolean;
  error: string;
  page_items: any;
}

interface RelationshipObjectInterface{
  status: boolean;
  error: string;
  pages: any;
  objects_data: any;
}

interface ObjectsSearchInterface{
  status: boolean;
  error: string;
  objects: any;
  pages: number;
}

interface ObjectTypeSearchInterface{
  status: boolean;
  error: string;
  object_types: any;
  pages: number;
}

interface MetamodelSearchInterface{
    status: boolean;
    error: string;
    metamodels: any;
    pages: number;
}

interface DiagramTypeSearchInterface{
    status: boolean;
    error: string;
    diagram_types: any;
    pages: number;
}

interface RelationshipTypeSearchInterface{
  status: boolean;
  error: string;
  relationship_types: any;
  pages: number;
}

interface RelationshipToObjectsSearchInterface{
  status: boolean;
  error: string;
  objects: any;
  pages: number;
}

interface ModelFolderInfoInterface{
  status: boolean;
  error: string;
  info: any;
}

interface MultipleInlineEditorObjects{
    status: boolean;
    error: string;
    objects: any;
    pages: any;
}

interface objectPropertyDetailsResponse{
    status: boolean;
    error: string;
    id: string;
    name: string;
    object_type: string;
    model_name: string;
    created_date: string;
    created_by: string;
    updated_date: string;
    updated_by: string;
}

interface DiagramXMLContent{
    status: boolean;
    error: string;
    xml: any;
    name: string;
    libraries: any;
    diagram_libraries: any;
    diagram_parent_id: any;
    is_manual_imported: any;
    model_id: string;
    model_name: string;
    created_date: string;
    created_by: string;
    updated_by: string;
    updated_date: string;
    exit_behavior: string;
    prompt_diagram_object_delete: string;
    prompt_diagram_reuse_objects: string;
    prompt_diagram_reuse_relationships: string;
}

interface DiagramDefaultSelectedLibraries{
    status: boolean;
    error: string;
    libraries: any;
}

interface DiagramCustomLibraries{
    status: boolean;
    error: string;
    libraries: any;
}

interface DiagramObjectShapeXMLInterface{
    status: boolean;
    error: string;
    object_name: string;
    library_id: string,
    shape_name: string,
    encoded_xml: string
    svg: string;
    export_attributes: any;
}

interface DiagramShapeDetailsXMLInterface{
    status: boolean;
    error: string;
    shape_id: any,
    library_id: any,
    is_default: any;
}

interface DiagramNewObjectsRelationshipsInterface{
    status: boolean;
    error: string;
    objects: any;
    relationships: any;
    settings: any;
    attributes: any;
    showActionButtons: boolean;
}

interface DiagramSVGInterface{
    status: boolean;
    error: string;
    svg: '<svg...',
    svg_padding_top: number;
    svg_padding_left: number;
    settings: any;
}

interface RelationshipDetailsInterface{
    status: boolean;
    error: string;
    relationship_type_name: string;
    from_object_name: string;
    to_object_name: string;
    created_date: string;
    created_by: string;
    type: string;
}

interface RelationshipTypeDetailsInterface{
    status: boolean;
    error: string;
    relationship_type_name: string;
    created_date: string;
    created_by: string;
    updated_date: string;
    updated_by: string;
    type: string;
}

interface DiagramSettingsInterface{
    status: boolean;
    error: string;
    diagram_new_tab: boolean;
    exit_behavior: string;
}

interface DeleteObjectInterface{
    status: boolean;
    error: string;
    pages: any;
    parent_id: string;
    model_id: string;
}

interface UpdateObjectInterface{
    status: boolean;
    error: string;
    model_id: string;
    parent_id: string;
}

interface ModelFolderCopyPasteInterface{
    status: boolean;
    error: string;
    pages: number;
}

interface ViewGeneratorFiltersInterface{
    status: boolean;
    error: string;
    object_types: any;
    relationship_types: any;
    attribute_types: any;
    report_type: string;
    type: string;
    filter_object_types: any;
    filter_relationship_types: any;
    filter_num_levels: number;
    group_options: any;
    name: any;
    layout_type: string;
    relationship_attributes: any;
    relationship_description: string;
}

interface ViewGeneratorDataInterface{
    status: boolean;
    error: string;
    data: any;
    groups: any;
}

interface SaveViewGeneratorInterface{
    status: boolean;
    error: string;
    parent_id: string;
    model_id: string;
    parent_parent_id: string;
    pages: number;
}

interface ImportDiagramInterface{
    status: boolean;
    error: string;
    pages: number;
    diagrams: any;
}

interface ViewObjectShapesInterface{
    status: boolean;
    error: string;
    object_shapes: any;
    relationships: any;
    groups: any;
}

interface ViewExportDiagramInterface{
    status: boolean;
    error: string;
    parent_id: string;
    model_id: string;
    pages: number;
}

interface ModelViewCurrentStateInterface{
    status: boolean;
    error: string;
    params: any;
}

interface ModelViewDeleteObjectRelationshipInterface{
    status: boolean;
    error: string;
    items: any;
}

interface ModelMetamodelDetailsInterface{
    status: boolean;
    error: string;
    metamodels: any;
}

interface RestoreObjectsInterface{
    status: boolean;
    error: string;
    items: any;
}

interface ObjectsUsedDiagramInterface{
    status: boolean;
    error: string;
    has_used_in_diagram: boolean;
}

interface FromObjectsInterface{
    status: boolean;
    error: string;
    objects: any;
}

interface PermissionsInterface{
    status: boolean;
    error: string;
    pages: number;
    permissions: any;
}

interface DiagramDeletedObjectRelationships{
    status: boolean;
    error: string;
    objects: any;
    relationships: any;
}

interface DiagramReuseObjectsInterface{
    status: boolean;
    error: string;
    objects: any;
    relationships: any;
}

interface ChangeLogInterface{
    status: boolean;
    error: string;
    change_logs: any;
    pages: number;
}

interface ChangeLogRenameInterface{
    status: boolean;
    error: string;
    name: string;
}

interface DiagramSearchInterface{
    status: boolean;
    error: string;
    diagrams: any;
}

interface RelationshipDiagramInterface{
    status: boolean;
    error: string;
    pages: number;
    diagrams: any;
}

interface ModelSearchInterface{
    status: boolean;
    error: string;
    models: any;
}

interface ObjectAttributeSearchInterface{
    status: boolean;
    error: string;
    attributes: any;
}

interface DiagramRelationshipsInterface{
    status: boolean;
    error: string;
    relationships_data: any;
}

interface DiagramObjectInterface{
    status: boolean;
    error: string;
    objects_data: any;
}

interface DiagramInfoInterface{
    status: boolean;
    error: string;
    diagram: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  constructor(
      private http: HttpClient,
      @Inject(DOCUMENT) private document: Document
  ) { }

  public getFolderModels(login_key, options, publication_id, sort, page) {
      options.id = options.id ? options.id : 0;
      return this.http.post<ModelsInterface>(environment.server_url + '/models',{
        token : jwt_encode({ login_key: login_key, options: options, sort: sort, publication_id: publication_id, page: page },environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public modelFolderExpand(login_key, model_ids, keyword, show, page, type, token) {
      let params: any = { login_key: login_key, ids: model_ids, keyword: keyword, type: type, show: show, page: page };

      if (show == 'details') {
          params.token = token;
      }

      return this.http.post<ModelFolderExpandResponse>(environment.server_url + '/model/details', {
        token: jwt_encode(params, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addObject(login_key, object_data, options) {
      return this.http.post<AddObjectTypeInterface>(environment.server_url + '/create/object', {
        token: jwt_encode({login_key: login_key, object_data: object_data, options: options }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getObjectProperties(login_key, object_ids) {
      return this.http.post<ObjectPropertiesInterface>(environment.server_url + '/object/details',{
        token : jwt_encode({ login_key: login_key, object_ids: object_ids },environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public getObjectRelationships(login_key, object_id, page) {
      return this.http.post<ObjectRelationshipInterface>(environment.server_url + '/object/relationship',{
        token : jwt_encode({ login_key: login_key, object_id: object_id, page: page },environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

    public getRelationshipObjects(login_key, relationship_type_id, relationship_id, type, object_id, page) {
        return this.http.post<RelationshipObjectInterface>(environment.server_url + '/object/relationship/objects',{
          token : jwt_encode({
              login_key: login_key,
              relationship_type_id: relationship_type_id,
              relationship_id: relationship_id,
              from_object_id: object_id,
              page: page,
              type: type
          },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
              return resp;
            })
        );
    }

    public getDiagramObjects(login_key, diagram_id, page) {
        return this.http.post<DiagramObjectInterface>(environment.server_url + '/diagram/relationship/objects',{
            token : jwt_encode({login_key: login_key, id: diagram_id, page: page },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public updateModelObjectAttributes(login_key, type, object_attributes) {
        return this.http.post<DefaultResponse>(environment.server_url + '/update/object/attributes', {
            token: jwt_encode({ login_key: login_key, object_attributes: object_attributes, type: type }, environment.encode_api_key)
        }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
        );
    }

    public getInlineEditorAttributes(login_key, type, object_ids, folder_id, model_id, diagram_id, view_id, page) {
        folder_id = (folder_id) ? folder_id : null;
        model_id = (model_id) ? model_id : null;
        object_ids = (object_ids.length) ? object_ids : null;
        diagram_id = (diagram_id) ? diagram_id : null;
        view_id = (view_id) ? view_id : null;
        return this.http.post<ObjectInlineAttributesInterface>(environment.server_url + '/object/inline/details',{
            token : jwt_encode({ login_key: login_key, type: type, object_ids: object_ids, folder_id: folder_id, model_id: model_id, diagram_id: diagram_id, view_id: view_id, page: page },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

  public addFolder(login_key, name, options) {
      options.id = options.id ? options.id : 0;
      return this.http.post<AddModelInterface>(environment.server_url + '/create/model', {
        token: jwt_encode({ login_key: login_key, name: name, options: options }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateModelFolder(login_key, name, type, id) {
      return this.http.post<DefaultResponse>(environment.server_url + '/update/model', {
        token: jwt_encode({ login_key: login_key, name: name, type: type, id: id }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addModel(login_key, name, options, metamodel_ids = [], othermetamodel_ids = []) {
      options.id = options.id ? options.id : 0;
      return this.http.post<AddModelFolderTypeInterface>(environment.server_url + '/create/model', {
        token: jwt_encode({ login_key: login_key, name: name, options: options, metamodel_ids: metamodel_ids, othermetamodel_ids: othermetamodel_ids }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public removeModelItems(login_key, selected_items) {
      return this.http.post<DeleteModelsInterface>(environment.server_url + '/delete/models', {
        token: jwt_encode({ login_key: login_key, selected_items: selected_items }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateObjectName(login_key, name, id) {
    return this.http.post<UpdateObjectInterface>(environment.server_url + '/update/object', {
      token: jwt_encode({ login_key: login_key, name: name, id: id }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public deleteObject(login_key, id, delete_from_diagrams = false) {
    return this.http.post<DeleteObjectInterface>(environment.server_url + '/delete/object', {
      token: jwt_encode({ login_key: login_key, id: id, delete_from_diagrams: delete_from_diagrams }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getInlineEditorAvailableAttributes(login_key, type, object_ids, folder_id, model_id, page) {
      folder_id = (folder_id) ? folder_id : null;
      model_id = (model_id) ? model_id : null;
      object_ids = (object_ids.length) ? object_ids : null;
      return this.http.post<ObjectInlineAttributesInterface>(environment.server_url + '/object/available/attributes',{
        token : jwt_encode({ login_key: login_key, type: type, object_ids: object_ids, folder_id: folder_id, model_id: model_id, page: page },environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public updateModelObjectAvailableAttributes(login_key, type, object_ids, folder_id, model_id, attributes) {
      folder_id = (folder_id) ? folder_id : null;
      model_id = (model_id) ? model_id : null;
      object_ids = (object_ids.length) ? object_ids : null;
      return this.http.post<DefaultResponse>(environment.server_url + '/update/object/available/attributes', {
        token: jwt_encode({
            login_key: login_key,
            object_ids: object_ids,
            folder_id: folder_id,
            model_id: model_id,
            type: type,
            attributes: attributes
        },environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public objectSearch(login_key, keyword, page) {
      return this.http.post<ObjectsSearchInterface>(environment.server_url + '/objects/search', {
        token: jwt_encode({ login_key: login_key, keyword: keyword, page: page }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public objectTypeSearch(login_key, keyword, model_id, page) {
      return this.http.post<ObjectTypeSearchInterface>(environment.server_url + '/object/type/search', {
        token: jwt_encode({ login_key: login_key, keyword: keyword, model_id: model_id, page: page }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public diagramTypeSearch(login_key, keyword, model_id, page) {
      return this.http.post<DiagramTypeSearchInterface>(environment.server_url + '/diagram/type/search', {
          token: jwt_encode({ login_key: login_key, keyword: keyword, model_id: model_id, page: page }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

  public relationshipTypeSearch(login_key, object_ids, to_object_id,  keyword, relationship_type_id, page) {
      return this.http.post<RelationshipTypeSearchInterface>(environment.server_url + '/relationship/types/search', {
        token: jwt_encode({ login_key: login_key, from_object_ids: object_ids, to_object_id: to_object_id, keyword: keyword, relationship_type_id: relationship_type_id, page: page }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public addRelationship(login_key, object_ids, relationship_type_id, to_object_id) {
    let token_query = jwt_encode({ login_key: login_key, from_object_ids: object_ids, relationship_type_id: relationship_type_id, to_object_id: to_object_id }, environment.encode_api_key);
    return this.http.post<DefaultResponse>(environment.server_url + '/relationship/create', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public addObjectDiagramRelationship(login_key, object_ids, diagram_id) {
      let token_query = jwt_encode({ login_key: login_key, from_object_ids: object_ids, diagram_id: diagram_id }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/object/diagram/relationship', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

  public relationshipToObjectSearch(login_key, from_object_ids, relationship_type_id, keyword, page) {
      let token_query = jwt_encode({ login_key: login_key, from_object_ids: from_object_ids, relationship_type_id: relationship_type_id, keyword: keyword, page: page }, environment.encode_api_key);
      return this.http.post<RelationshipToObjectsSearchInterface>(environment.server_url + '/relationship/to/object/search', {
        token: token_query
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public relationshipDiagramSearch(login_key, keyword) {
    let token_query = jwt_encode({ login_key: login_key, keyword: keyword, page: 1 }, environment.encode_api_key);
        return this.http.post<DiagramSearchInterface>(environment.server_url + '/relationship/diagram/search', {
        token: token_query
    }).pipe(
        take(1),
        map(resp => {
            return resp;
        })
    );
  }

  public updateDragDropStructure(login_key, id, parent_id) {
      return this.http.post<DefaultResponse>(environment.server_url + '/update/structure', {
        token: jwt_encode({ login_key: login_key, id: id, new_parent_id: parent_id }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
            return resp;
          })
      );
  }

  public clearDragDropClasses() {
    this.document
        .querySelectorAll('.drop-before')
        .forEach(element => element.classList.remove('drop-before'));
    this.document
        .querySelectorAll('.drop-after')
        .forEach(element => element.classList.remove('drop-after'));
    this.document
        .querySelectorAll('.drop-inside')
        .forEach(element => element.classList.remove('drop-inside'));
  }

  public updateInlineEditorColumnsWidth(login_key, width, type, attribute_item) {
    let token_query = jwt_encode({
      login_key: login_key,
      width: width,
      type: type,
      attribute_id: attribute_item ? attribute_item.attribute_id : null
    }, environment.encode_api_key);

    return this.http.post<DefaultResponse>(environment.server_url + '/resize/inline/editor/column', {
      token: token_query
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateInlineEditorRowHeight(login_key, id, type, height) {
    return this.http.post<DefaultResponse>(environment.server_url + '/resize/inline/editor/cell-height', {
      token: jwt_encode({ login_key: login_key, id: id, type: type, height: height }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public getModelFolderInfo(login_key, id, type) {
    return this.http.post<ModelFolderInfoInterface>(environment.server_url + '/model/folder/info', {
      token: jwt_encode({ login_key: login_key, id: id, type: type }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateModelFolderDescription(login_key, id, type, description) {
    return this.http.post<DefaultResponse>(environment.server_url + '/model/folder/update/info', {
      token: jwt_encode({ login_key: login_key, id: id, type: type, description: description }, environment.encode_api_key)
    }).pipe(
        take(1),
        map(resp => {
          return resp;
        })
    );
  }

  public updateObjectDescription(login_key, object_id, description) {
      return this.http.post<DefaultResponse>(environment.server_url + '/object/update/description', {
          token: jwt_encode({ login_key: login_key, id: object_id, description: description }, environment.encode_api_key)
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

  public updateDragDropModelViewerStructure(login_key, drop_items, type, parent_id, parent_type) {
      let token_query = jwt_encode({
          login_key: login_key,
          drop_items: drop_items,
          type: type,
          new_parent_id: parent_id,
          new_parent_type: parent_type
      }, environment.encode_api_key);
      return this.http.post<DefaultResponse>(environment.server_url + '/update/model/viewer/structure', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

  public addMultipleInlineEditorObjects(login_key, new_objects, parent_id, parent_type) {
      let token_query = jwt_encode({
          login_key: login_key,
          new_objects: new_objects,
          parent_id: parent_id,
          parent_type: parent_type
      }, environment.encode_api_key);

      return this.http.post<MultipleInlineEditorObjects>(environment.server_url + '/add/multiple/objects', {
          token: token_query
      }).pipe(
          take(1),
          map(resp => {
              return resp;
          })
      );
  }

    public updateModelObjectAvailableSystemProperties(login_key, object_ids, folder_id, model_id, type, properties) {
        folder_id = (folder_id) ? folder_id : null;
        model_id = (model_id) ? model_id : null;
        object_ids = (object_ids.length) ? object_ids : null;
        let token_query = jwt_encode({
            login_key: login_key,
            object_ids: object_ids,
            folder_id: folder_id,
            model_id: model_id,
            type: type,
            properties: properties
        },environment.encode_api_key);

        return this.http.post<DefaultResponse>(environment.server_url + '/update/object/available/system/properties', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public convertDateFormatToMask(settings) {
      let day_formats = {
          'day' : {
              'placeholder' : 'dd',
              'mask' : '00'
          },
          'month' : {
              'placeholder' : 'mm',
              'mask' : '00'
          },
          'year' : {
              'placeholder' : 'yyyy',
              'mask' : '0000'
          },
      }

      let day_format_obj = settings.date_format.split(' ');
      return {
          placeholder: [day_formats[day_format_obj['0']].placeholder, day_formats[day_format_obj['1']].placeholder, day_formats[day_format_obj['2']].placeholder].join(settings.separator),
          mask: [day_formats[day_format_obj['0']].mask, day_formats[day_format_obj['1']].mask, day_formats[day_format_obj['2']].mask].join(settings.separator),
      };
    }

    public convertDateMaskToDateISOFormat(str, settings) {
          try{
              let format_indexes = ['year','month','day'];
              let day_format_obj = settings.date_format.split(' ');
              let year_index = day_format_obj.indexOf(format_indexes[0]);
              let month_index = day_format_obj.indexOf(format_indexes[1]);
              let day_index = day_format_obj.indexOf(format_indexes[2]);
              let date_obj = str.split(settings.separator);
              let formatted_date = date_obj[year_index] + '-' + date_obj[month_index] + '-' + date_obj[day_index];
              let d = new Date(formatted_date);
              return (d) ? formatted_date : null;
          }
          catch (e) {
              return null;
          }
    }

    public convertISODateToFormat(str, settings) {
        try{
            let settings_obj = settings.date_format.split(' ');
            let format_indexes = ['year','month','day'];
            let first_index = format_indexes.indexOf(settings_obj[0]);
            let second_index = format_indexes.indexOf(settings_obj[1]);
            let third_index = format_indexes.indexOf(settings_obj[2]);
            let date_obj = str.split('-');
            return date_obj[first_index] + settings.separator + date_obj[second_index] + settings.separator + date_obj[third_index];
        }
        catch (e) {
            return null;
        }
    }

    public updateObjectTypeName(login_key, object_id, object_type_id) {
        return this.http.post<DefaultResponse>(environment.server_url + '/update/model/object/type', {
            token: jwt_encode({ login_key: login_key, object_id: object_id, object_type_id: object_type_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public addDiagram(login_key, diagram_data, options) {
        return this.http.post<AddDiagramInterface>(environment.server_url + '/create/diagram', {
            token: jwt_encode({ login_key: login_key, diagram_data: diagram_data, options: options }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public updateDiagramName(login_key, name, id) {
        let token_query = jwt_encode({ login_key: login_key, name: name, id: id }, environment.encode_api_key);
        return this.http.post<DefaultResponse>(environment.server_url + '/update/diagram', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public deleteDiagram(login_key, id) {
        let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
        return this.http.post<DefaultResponse>(environment.server_url + '/delete/diagram', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public objectPropertyDetails(login_key, id) {
        let token_query = jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key);
        return this.http.post<objectPropertyDetailsResponse>(environment.server_url + '/object/property/details', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public updateDiagramXMLContent(login_key, id, xml, diagram_libraries, diagram_svg, svg_padding_top, svg_padding_left, sync, deleted_objects, deleted_relationships) {
        let token_query = jwt_encode({
            login_key: login_key,
            diagram_id: id,
            xml: xml,
            custom_libraries: diagram_libraries,
            svg: diagram_svg,
            svg_padding_top: svg_padding_top,
            svg_padding_left: svg_padding_left,
            sync: sync,
            deleted_objects: deleted_objects,
            deleted_relationships: deleted_relationships
        }, environment.encode_api_key);
        return this.http.post<DefaultResponse>(environment.server_url + '/diagram/update/xml', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramXMLContent(login_key, id,) {
        let token_query = jwt_encode({ login_key: login_key, diagram_id: id }, environment.encode_api_key);
        return this.http.post<DiagramXMLContent>(environment.server_url + '/diagram/get/xml', {
            token: token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    /**Diagram Libraries*/
    public getDiagramDefaultLibraries(login_key, diagram_id) {
        return this.http.post<DiagramDefaultSelectedLibraries>(environment.server_url + '/diagram/default/libraries', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    /**Diagram Custom Libraries*/
    public getDiagramCustomLibraries(login_key, diagram_id) {
        return this.http.post<DiagramCustomLibraries>(environment.server_url + '/diagram/custom/libraries', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    /**Add Diagram Custom Library*/
    public addDiagramCustomLibrary(login_key, diagram_id, name, code, encoded_xml) {
        return this.http.post<DefaultResponse>(environment.server_url + '/diagram/custom/libraries', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id, name: name, code: code, encoded_xml: encoded_xml }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    /**Delete Diagram Custom Library*/
    public deleteDiagramCustomLibrary(login_key, diagram_id, custom_library_id) {
        return this.http.post<DefaultResponse>(environment.server_url + '/diagram/delete/custom/library', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id, custom_library_id: custom_library_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getObjectShapeXML(login_key, diagram_id, object_id) {
        return this.http.post<DiagramObjectShapeXMLInterface>(environment.server_url + '/diagram/object/shape', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id, object_id: object_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getShapeDetailsFromXML(login_key, diagram_id, xml) {
        return this.http.post<DiagramShapeDetailsXMLInterface>(environment.server_url + '/get/shape/from/xml', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id, encoded_xml: xml }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramSVGDetails(login_key, diagram_id) {
        return this.http.post<DiagramSVGInterface>(environment.server_url + '/get/diagram/svg', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public saveDiagramNewObjectsRelationships(login_key, diagram_id, items, relationships, reusable_object_ids, reusable_relationship_ids) {
        return this.http.post<DiagramNewObjectsRelationshipsInterface>(environment.server_url + '/diagram/handle/objects/relationships', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id, items: items, relationships: relationships, 
                reusable_object_ids: reusable_object_ids, reusable_relationship_ids: reusable_relationship_ids }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramReuseObjects(login_key, diagram_id, items) {
        return this.http.post<DiagramReuseObjectsInterface>(environment.server_url + '/diagram/reuse/objects', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id, items: items}, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramReuseRelationships(login_key, diagram_id, items, relationships) {
        return this.http.post<DiagramReuseObjectsInterface>(environment.server_url + '/diagram/reuse/relationships', {
            token: jwt_encode({ login_key: login_key, diagram_id: diagram_id, items: items, relationships: relationships}, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramSVGObjectShapeDetails(login_key,diagram_id,object_id,relationship_id,relationship_type_id,cell_xml)
    {
        return this.http.post<DiagramNewObjectsRelationshipsInterface>(environment.server_url + '/diagram/object/relationship/details', {
            token: jwt_encode({ login_key: login_key, object_id: object_id, relationship_id: relationship_id, relationship_type_id: relationship_type_id, cell_xml: cell_xml }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public deleteRelationships(login_key, relationships, delete_permanent)
    {
        return this.http.post<DefaultResponse>(environment.server_url + '/delete/relationships', {
            token: jwt_encode({ login_key: login_key, relationships: relationships, delete_permanent: delete_permanent}, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getRelationshipDetails(login_key, relationship_id)
    {
        return this.http.post<RelationshipDetailsInterface>(environment.server_url + '/get/relationship/details', {
            token: jwt_encode({ login_key: login_key, relationship_id: relationship_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getRelationshipTypeDetails(login_key, relationship_type_id)
    {
        return this.http.post<RelationshipTypeDetailsInterface>(environment.server_url + '/get/relationship/type/details', {
            token: jwt_encode({ login_key: login_key, relationship_type_id: relationship_type_id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramSettings(login_key)
    {
        return this.http.post<DiagramSettingsInterface>(environment.server_url + '/get/diagram/settings', {
            token: jwt_encode({ login_key: login_key }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public modelFolderCopyPaste(login_key, copy_items, destination_id, destination_type)
    {
        return this.http.post<ModelFolderCopyPasteInterface>(environment.server_url + '/model/folder/copy', {
            token: jwt_encode({ login_key: login_key, copy_items: copy_items, destination_id: destination_id, destination_type: destination_type  }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getViewGeneratorFilters(login_key, model_folder_object_ids, type)
    {
        return this.http.post<ViewGeneratorFiltersInterface>(environment.server_url + '/get/model/generator/filters', {
            token: jwt_encode({ login_key: login_key, ids: model_folder_object_ids, type: type }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getViewGeneratorData(login_key, params) : any{
        params.login_key = login_key;
        return this.http.post<ViewGeneratorDataInterface>(environment.server_url + '/get/model/generator/data', {
            token: jwt_encode(params, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
               return resp;
            })
        );
    }

    public importDiagram(login_key, parent_id, generate_diagram_contents, reuse_objects, diagram_mapping)
    {
        return this.http.post<ImportDiagramInterface>(environment.server_url + '/model/import/diagram', {
            token: jwt_encode({ login_key: login_key, model_folder_id: parent_id, generate_diagram_contents: generate_diagram_contents, reuse_objects : reuse_objects, diagram_mapping: diagram_mapping }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public saveViewGenerator(login_key, params)
    {
        params.login_key = login_key;
        return this.http.post<SaveViewGeneratorInterface>(environment.server_url + '/model/save/view', {
            token: jwt_encode(params, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public deleteView(login_key, id) {
        return this.http.post<DefaultResponse>(environment.server_url + '/delete/view', {
            token: jwt_encode({ login_key: login_key, id: id }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public loadViewObjectShapes(login_key, diagram_type_id, selected_ids, selected_type, filter_object_types, filter_relationship_types, filter_num_levels, type, group_options) {
        let token_query = jwt_encode({
            login_key: login_key,
            diagram_type_id: diagram_type_id,
            selected_ids: selected_ids,
            selected_type: selected_type,
            filter_object_types: filter_object_types,
            filter_relationship_types: filter_relationship_types,
            filter_num_levels: filter_num_levels,
            type: type,
            group_options: group_options
        },environment.encode_api_key);
        return this.http.post<ViewObjectShapesInterface>(environment.server_url + '/load/view/object/shapes',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public saveViewGeneratedDiagram(login_key, name, diagram_type_id, diagram_xml, svg, svg_padding_top, svg_padding_left, selected_ids, selected_type) {
        let token_query = jwt_encode({
            login_key: login_key,
            name: name,
            diagram_type_id: diagram_type_id,
            diagram_xml: diagram_xml,
            svg: svg,
            svg_padding_top: svg_padding_top,
            svg_padding_left: svg_padding_left,
            selected_ids: selected_ids,
            selected_type: selected_type
        },environment.encode_api_key);
        return this.http.post<ViewExportDiagramInterface>(environment.server_url + '/diagram/save/exported',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    sortFolderModelsDynamically(sort, items) {
        switch (sort) {
            case 'name_asc':
                items.sort((a, b) => a.name.localeCompare(b.name))
            break;
            case 'name_desc':
                items.sort((a, b) => -1 * a.name.localeCompare(b.name))
            break;
            case 'created_asc':
                items.sort((a, b) => new Date(a.created_on).getTime() - new Date(b.created_on).getTime())
            break;
            case 'created_desc':
                items.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())
            break;
            case 'updated_asc':
                items.sort((a, b) => new Date(a.updated_on).getTime() - new Date(b.updated_on).getTime())
            break;
            case 'updated_desc':
                items.sort((a, b) => new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime())
            break;
            case 'created_by_asc':
                items.sort((a, b) => a.created_by.localeCompare(b.created_by))
            break;
            case 'created_by_desc':
                items.sort((a, b) => -1 * a.created_by.localeCompare(b.created_by))
            break;
            case 'last_update_by_asc':
                items.sort((a, b) => a.last_updated_by.localeCompare(b.last_updated_by))
            break;
            case 'last_update_by_desc':
                items.sort((a, b) => -1 * a.last_updated_by.localeCompare(b.last_updated_by))
            break;
        }

        return items;
    }

    public saveModelViewerCurrentState(login_key, params) {
        let token_query = jwt_encode({ login_key: login_key, ...params },environment.encode_api_key);
        return this.http.post<DefaultResponse>(environment.server_url + '/model/viewer/update/state',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getModelViewerCurrentState(login_key, token) {
        let token_query = jwt_encode({ login_key: login_key, token: token },environment.encode_api_key);
        return this.http.post<ModelViewCurrentStateInterface>(environment.server_url + '/model/viewer/get/state',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public deleteObjectRelationships(login_key, object_ids, relationship_ids, delete_permanent) {
        let token_query = jwt_encode({ login_key: login_key, object_ids: object_ids, relationship_ids: relationship_ids, delete_permanent: delete_permanent },environment.encode_api_key);
        return this.http.post<ModelViewDeleteObjectRelationshipInterface>(environment.server_url + '/model/viewer/delete/object/relationships',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public metamodelSearch(login_key, keyword, page,default_primary) {
        return this.http.post<MetamodelSearchInterface>(environment.server_url + '/metamodel/search', {
            token: jwt_encode({ login_key: login_key, keyword: keyword, page: page,default_primary:default_primary }, environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public modelMetamodelDetails(login_key, id) {
        let token_query = jwt_encode({ login_key: login_key, id: id },environment.encode_api_key);
        return this.http.post<ModelMetamodelDetailsInterface>(environment.server_url + '/model/metamodel/details',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public modelUpdateMetamodels(login_key, model_id, metamodel_ids, othermetamodel_ids)
    {
        let token_query = jwt_encode({ login_key: login_key, id: model_id, metamodel_ids: metamodel_ids, othermetamodel_ids: othermetamodel_ids },environment.encode_api_key);
        return this.http.post<DefaultResponse>(environment.server_url + '/model/metamodel/update',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public restoreDeletedObjects(login_key, object_ids)
    {
        let token_query = jwt_encode({ login_key: login_key, object_ids: object_ids },environment.encode_api_key);
        return this.http.post<RestoreObjectsInterface>(environment.server_url + '/model/viewer/restore/objects',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public checkObjectsUsedDiagram(login_key, object_ids)
    {
        let token_query = jwt_encode({ login_key: login_key, object_ids: object_ids },environment.encode_api_key);
        return this.http.post<ObjectsUsedDiagramInterface>(environment.server_url + '/model/object/used/diagrams',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getFromObjects(login_key, keyword, relationship_type_id, to_object_id){
        return this.http.post<FromObjectsInterface>(environment.server_url + '/relationship/from/object/search',{
            token : jwt_encode({ login_key: login_key, relationship_type_id: relationship_type_id, to_object_id: to_object_id, keyword: keyword },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public updateRelationship(login_key, relationship_id, from_object_id, relationship_type_id, to_object_id) {
        return this.http.post<DefaultResponse>(environment.server_url + '/relationship/update',{
            token : jwt_encode({ login_key: login_key, relationship_id: relationship_id, from_object_id: from_object_id, relationship_type_id: relationship_type_id, to_object_id: to_object_id },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public handleFavorite(login_key, model_id, state) {
        return this.http.post<DefaultResponse>(environment.server_url + '/model/set/favorite',{
            token : jwt_encode({ login_key: login_key, model_id: model_id, state: state },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public loadPermissions(login_key, type, id, page) {
        return this.http.post<PermissionsInterface>(environment.server_url + '/group/permissions',{
            token : jwt_encode({ login_key: login_key, type: type, id: id, page: page },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public updateGroupPermissions(login_key, filter_type, filter_id, group_id, permission, value) {
        return this.http.post<DefaultResponse>(environment.server_url + '/group/permissions/updates',{
            token : jwt_encode({ login_key: login_key, filter_type: filter_type, filter_id: filter_id, group_id: group_id, permission: permission, value: value },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public modelOrganize(login_key, id, organize) {
        return this.http.post<DefaultResponse>(environment.server_url + '/model/organize',{
            token : jwt_encode({ login_key: login_key, model_id: id, organize: organize },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public diagramDeletedObjectRelationships(login_key, diagram_id, xml) {
        return this.http.post<DiagramDeletedObjectRelationships>(environment.server_url + '/diagram/deleted/object/relationships',{
            token : jwt_encode({ login_key: login_key, diagram_id: diagram_id, xml: xml },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public loadChangeLogs(login_key, id, type, page)
    {
        return this.http.post<ChangeLogInterface>(environment.server_url + '/model/change-logs',{
            token : jwt_encode({ login_key: login_key, id: id, type: type, page: page },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public changeLogRollback(login_key, id)
    {
        return this.http.post<ChangeLogRenameInterface>(environment.server_url + '/model/change-logs/rollback',{
            token : jwt_encode({ login_key: login_key, id: id },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getObjectRelationshipDiagrams(login_key, object_id, page)
    {
        return this.http.post<RelationshipDiagramInterface>(environment.server_url + '/object/relationship/diagrams',{
            token : jwt_encode({ login_key: login_key, object_id: object_id, page: page },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public updateRelationshipAttributes(login_key, relationship_id, attribute_data_items){
        return this.http.post<DefaultResponse>(environment.server_url + '/relationship/update/attributes',{
            token : jwt_encode({ login_key: login_key, relationship_id: relationship_id, attribute_data_items: attribute_data_items },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public updateDiagramRelationship(login_key, object_id, relationship_id, diagram_id){
        return this.http.post<DefaultResponse>(environment.server_url + '/relationship/update/diagram',{
            token : jwt_encode({ login_key: login_key, object_id: object_id, relationship_id: relationship_id, diagram_id: diagram_id },environment.encode_api_key)
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public restoreDeletedRelationships(login_key, relationships)
    {
        let token_query = jwt_encode({ login_key: login_key, relationships: relationships },environment.encode_api_key);
        return this.http.post<DefaultResponse>(environment.server_url + '/model/viewer/restore/relationships',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public onSearchModel(login_key, keyword, page)
    {
        let token_query = jwt_encode({ login_key: login_key, keyword: keyword, page: page },environment.encode_api_key);
        return this.http.post<ModelSearchInterface>(environment.server_url + '/model/search',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public onSearchObjectAttributes(login_key, keyword, page)
    {
        let token_query = jwt_encode({ login_key: login_key, keyword: keyword, page: page },environment.encode_api_key);
        return this.http.post<ObjectAttributeSearchInterface>(environment.server_url + '/object/attributes/search',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public onSearchRelationshipAttributes(login_key, keyword, page)
    {
        let token_query = jwt_encode({ login_key: login_key, keyword: keyword, page: page },environment.encode_api_key);
        return this.http.post<ObjectAttributeSearchInterface>(environment.server_url + '/relationship/attributes/search',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramRelationships(login_key, id, page) {
        let token_query = jwt_encode({ login_key: login_key, id: id, page: page },environment.encode_api_key);
        return this.http.post<DiagramRelationshipsInterface>(environment.server_url + '/diagram/relationships',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }

    public getDiagramInfo(login_key, id) {
        let token_query = jwt_encode({ login_key: login_key, id: id },environment.encode_api_key);
        return this.http.post<DiagramInfoInterface>(environment.server_url + '/diagram/info',{
            token : token_query
        }).pipe(
            take(1),
            map(resp => {
                return resp;
            })
        );
    }
}
