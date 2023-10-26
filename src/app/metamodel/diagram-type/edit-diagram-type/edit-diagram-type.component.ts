import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { EventsService } from '../../../shared/EventService';
import { DiagramTypeService } from "../diagram-type.service";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { RelationshipTypeService } from '../../relationship-type/relationship-type.service';

@Component({
  selector: 'app-edit-diagram-type',
  templateUrl: './edit-diagram-type.component.html',
  styleUrls: ['./edit-diagram-type.component.css']
})
export class EditDiagramTypeComponent implements OnInit {
  @ViewChild('editDiagramTypeModal') editDiagramTypeModal: NgbModal;
  @ViewChild('diagramTypeImportLibraryModal') diagramTypeImportLibraryModal: NgbModal;
  @ViewChild('importLibraryModal') importLibraryModal: NgbModal;
  loggedInUser: any;
  form: UntypedFormGroup;
  hasFormSubmitted: boolean;
  diagramTypeId: string;
  diagramTypeName: string;
  isUpdateFormLoading: boolean;
  hasDiagramUpdateFormSubmitted: boolean;
  firstLoad: boolean;
  isLoading: boolean;
  hasSelectedImportLibrary: boolean;
  isShapeLibraryLoading: boolean;
  isConnectorLibraryLoading: boolean;

  /**Shape Types Libraries & Combinations*/
  popupLibraries: any;
  selectedPopupLibraries: any;
  libraries: any;
  selectedLibraries: any;
  objectTypes: any;
  combinations: any;
  selectedCombinations: any;
  objectTypesCurrentPage: number;
  objectTypesMaxPages: number;
  selectedShapeType: any;
  selectedObjectType: any;
  currentActiveTab: string;

  /**Relationship Types Libraries & Combinations*/
  connectorLibraries: any;

  selectedConnectorLibraries: any;
  selectedConnectorShapeType: any;

  relationshipTypes: any;
  relationshipTypesCurrentPage: number;
  relationshipTypesMaxPages: number;
  selectedRelationshipType: any;
  connectorCombinations: any;
  connectorSelectedCombinations: any;
  selectedConnectors: any;

  /**SocketIO & MX Graph Editor Properties*/
  mxEditorUniqueCode: string;
  mxEditorIframeCode: any;
  socket: any;
  libraryFileUploading: boolean;
  uploadFileDetails: any;

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private diagramTypeService: DiagramTypeService,
      private eventsService: EventsService,
      private modalService: NgbModal,
      private sanitizer: DomSanitizer,
      private relationshipTypesService: RelationshipTypeService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.eventsService.onPageChange({ section : 'metamodel', page : 'diagram-types' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.hasFormSubmitted = false;
    this.firstLoad = false;
    this.isLoading = false;
    this.libraries = [];
    this.popupLibraries = [];
    this.selectedLibraries = [];
    this.combinations = [];
    this.selectedCombinations = [];
    this.selectedShapeType = {};
    this.selectedObjectType = {};
    this.hasSelectedImportLibrary = false;
    this.currentActiveTab = 'shape_types';
    this.diagramTypeName = '';

    /**Relationship Types*/
    this.selectedConnectorLibraries = [];
    this.selectedConnectorShapeType = [];
    this.connectorCombinations = [];
    this.connectorSelectedCombinations = [];
    this.relationshipTypes = [];
    this.selectedRelationshipType = [];

    /**Build Form*/
    this.isUpdateFormLoading = false;
    this.hasDiagramUpdateFormSubmitted = false;
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
      /**Get Diagram Type Details*/
      this.diagramTypeId = paramMap.get('id');
      this.isShapeLibraryLoading = true;
      this.isConnectorLibraryLoading = true;
      this.diagramTypeService.diagramTypeDetails(this.loggedInUser['login_key'], this.diagramTypeId).subscribe(data => {
        this.isShapeLibraryLoading = false;
        this.isConnectorLibraryLoading = false;
        if (data.status) {
          this.form.controls.name.patchValue(data.diagram_type_data.name);
          this.firstLoad = true;
          this.diagramTypeName = data.diagram_type_data.name;
        }
        else{
          this.toastCtrl.error(data.error);
        }
      })

      /**Diagram Type Libraries*/
      this.diagramTypeService.getDiagramTypeLibraryItems(this.loggedInUser['login_key'], this.diagramTypeId).subscribe(data => {
        /**Collect Object Type Libraries*/
        for (let i=0; i<data.libraries.length; i++) {
          this.popupLibraries.push(data.libraries[i]);
          if (!data.libraries[i].is_hidden) {
            this.libraries.push(data.libraries[i]);
          }
        }

        this.selectedPopupLibraries = [];
        this.combinations = data.combinations;
        this.connectorCombinations = data.connector_combinations;
      });

      /**Object Types*/
    }
    else{
      this.diagramTypeService.getDefaultLibraries().subscribe(data=>{
        for (let i=0; i<data.libraries.length; i++) {
          this.popupLibraries.push(data.libraries[i]);
            this.libraries.push(data.libraries[i]);
        }
        this.selectedPopupLibraries = [];
        this.combinations = [];
        this.connectorCombinations = [];
      })
    }
    });
    this.objectTypesCurrentPage = 1;
    this.diagramTypeService.getObjectTypesList(this.loggedInUser['login_key'], this.objectTypesCurrentPage).subscribe(data => {
      this.objectTypesMaxPages = data.pages;
      this.objectTypes = data.object_types;
    });

    /**Relationship Types*/
    this.relationshipTypesCurrentPage = 1;
    this.relationshipTypesService.getRelationshipTypesList(this.loggedInUser['login_key'], this.relationshipTypesCurrentPage).subscribe(data => {
      this.relationshipTypesMaxPages = data.pages;
      this.relationshipTypes = data.relationship_types
    });
  

    /**MX Graph Editor Properties*/
    this.libraryFileUploading = false;
    this.uploadFileDetails = {
      library_name: null,
      library_xml: null,
      library_shapes: []
    };
    this.mxEditorUniqueCode = 'svg_' + uuidv4();
    this.socket = io(environment.editor_node_app_url,{
      query: {
        room: this.mxEditorUniqueCode,
        from: 'pluto_svg'
      }
    });

    this.socket.on('get_library_xml_svg',data => {
      if (data.svg_items && data.svg_items.length) {
        /**Save Custom Library*/
        let shapes = [];
        for (let i=0; i<data.svg_items.length; i++) {
          shapes.push({
            svg: data.svg_items[i].svg,
            encoded_xml: data.svg_items[i].xml,
            type: data.svg_items[i].type,
            library_name: this.uploadFileDetails.library_name,
            is_edge: data.svg_items[i].is_edge,
            shape_style: data.svg_items[i].shape_style,
            children_style: data.svg_items[i].children_style,
          });
        }

        this.diagramTypeService.addDiagramTypeLibrary(this.loggedInUser['login_key'], this.diagramTypeId, this.uploadFileDetails.library_name, '', this.uploadFileDetails.library_xml, shapes).subscribe(data => {
          if (data.status) {
            let lib_obj = {
              id: data.id,
              name: this.uploadFileDetails.library_name,
              is_default: 0,
              is_hidden: true,
              shapes: data.shapes
            };

            this.popupLibraries.push(lib_obj);
            this.selectedPopupLibraries = [data.id];
            this.hasSelectedImportLibrary = true;
          }
          else{
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.toastCtrl.info('Unable to get shapes from the xml');
      }
    });

    let url_scheme = btoa(new URLSearchParams({
      room: this.mxEditorUniqueCode,
    }).toString());
    this.mxEditorIframeCode = this.sanitizer.bypassSecurityTrustResourceUrl(environment.editor_xml_svg_converter_url + '#' + url_scheme);
  }

  onTabChange(type):boolean {
    this.currentActiveTab = type;
    return false;
  }

  onOpenLibraryImportModal() {
    this.libraryFileUploading = false;
    this.hasSelectedImportLibrary = false;
    this.uploadFileDetails = {
      library_name: null,
      library_xml: null,
      library_shapes: []
    };

    /**Clear not default libraries*/
    let li = this.popupLibraries.length
    while (li--) {
      if (!this.popupLibraries[li].is_default) {
        this.popupLibraries.splice(li, 1);
      }
    }

    this.modalService.open(this.diagramTypeImportLibraryModal, { centered: true, windowClass: 'diagram-type-modal' });
  }

  onRenderSafeSVG(svg) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  //

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  onDiagramTypeCombinationUpdate() {
    let diagram_type_name = this.diagramTypeName.trim();
    if (!diagram_type_name.length) {
      this.toastCtrl.info('Please specify Diagram Type name');
      return false;
    }

    this.isLoading = true;

      /**Get Object Type Combination Items*/
      let combination_items = [];
      if (this.combinations.length) {
        for (let i=0; i<this.combinations.length; i++) {
          combination_items.push({
            id: this.combinations[i].id,
            shape_type_id: this.combinations[i].shape_type_id,
            object_type_id: this.combinations[i].object_type_id,
          });
        }
      }

      /**Get Object Type Shape Type Used Libraries*/
      let library_items = [];
      if (this.libraries.length) {
        for (let t=0; t<this.libraries.length; t++) {
          library_items.push({
            id: this.libraries[t].id,
            is_default: this.libraries[t].is_default ? 1 : 0
          });
        }
      }

      /**Get Relationship Type Combination Items*/
      let connector_combination_items = [];
      if (this.connectorCombinations.length) {
        for (let i=0; i<this.connectorCombinations.length; i++) {
          connector_combination_items.push({
            id: this.connectorCombinations[i].id,
            library_id: this.connectorCombinations[i].library_id,
            shape_type_id: this.connectorCombinations[i].shape_type_id,
            relationship_type_id: this.connectorCombinations[i].relationship_type_id,
          });
        }
      }

      if(this.diagramTypeId){
        this.diagramTypeService.updateDiagramCombinations(this.loggedInUser['login_key'], this.diagramTypeId, diagram_type_name, library_items, combination_items, connector_combination_items).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.toastCtrl.success('Diagram Type updated successfully');
          }
          else{
            this.toastCtrl.info(data.error);
          }
        });
      }
      else{
       this.diagramTypeService.addDiagramType(this.loggedInUser['login_key'], null, this.diagramTypeName,library_items, combination_items, connector_combination_items).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.toastCtrl.success('Diagram type created successfully');
            this.router.navigateByUrl('/metamodel/diagram-type')
            
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.libraryFileUploading = true;
    if (files && files.length) {
      if (files[0].fileEntry.isFile) {
        const fileEntry = files[0].fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.uploadFileDetails.library_name = file.name.replace('.xml','');
          this.uploadFileDetails.library_xml = null;
          this.uploadFileDetails.library_shapes = [];
          let fileReader = new FileReader();
              fileReader.onload = () => {
                this.libraryFileUploading = false;
                this.uploadFileDetails.library_xml = fileReader.result;
                this.socket.emit('import_library_xml_svg',{ xml: fileReader.result })
              }
              fileReader.readAsText(file);
        });
      }
      else {
        this.libraryFileUploading = false;
        this.toastCtrl.info('Only xml files are allowed');
      }
    }
  }

  onLoadMoreObjectTypes():boolean {
    this.objectTypesCurrentPage++;
    this.diagramTypeService.getObjectTypesList(this.loggedInUser['login_key'], this.objectTypesCurrentPage).subscribe(data => {
      if (data.status && data.object_types) {
        this.objectTypes = this.objectTypes.concat(data.object_types);
      }
    });
    return false;
  }

  onLibraryCheck(event, library_id):boolean {
    if (event.target.checked) {
      this.selectedLibraries.push(library_id);
    }
    else{
      let get_index = this.selectedLibraries.indexOf(library_id);
      if (get_index !== -1) {
        this.selectedLibraries.splice(get_index, 1);
      }
    }
    return false;
  }

  onDeleteLibrary(library_id):boolean {
    /**Remove from selected Shape and Connector combinations*/
    let li = this.combinations.length
    while (li--) {
      if (this.combinations[li].library_id == library_id) {
        this.combinations.splice(li, 1);
      }
    }

    let li_c = this.connectorCombinations.length
    while (li_c--) {
      if (this.connectorCombinations[li_c].library_id == library_id) {
        this.connectorCombinations.splice(li_c, 1);
      }
    }

    /**Remove Library*/
    for (let i=0; i<this.libraries.length; i++) {
      if (this.libraries[i].id == library_id) {
        this.libraries.splice(i, 1);
        this.onLibraryCheck({ target : { checked: false } }, library_id);
      }
    }

    return false;
  }

  onShapeTypeCheck(event, item, library_id) {
    if (event.target.checked) {
      item.library_id = library_id;
      this.selectedShapeType = item;
    }
    else{
      this.selectedShapeType = {};
    }
  }

  onObjectTypeCheck(event, item) {
    this.selectedObjectType = event.target.checked ? item : {};
  }

  onCombinationCheck(event, item, index) {
    if (event.target.checked) {
      item.index = index;
      this.selectedCombinations.push(item);
    }
    else{
      for (let i=0; i<this.selectedCombinations.length; i++) {
        if (this.selectedCombinations[i].index == item.index) {
          this.selectedCombinations.splice(i, 1);
        }
      }
    }
  }

  onDeleteCombination():boolean {
    let total_combinations_length = this.selectedCombinations.length;
    if (total_combinations_length) {
      let selected_combination_ids = [];
      for (let i=0; i<total_combinations_length; i++) {
        selected_combination_ids.push(this.selectedCombinations[i].index);
      }

      /**Remove from combinations*/
      let li_c = this.combinations.length
      while (li_c--) {
        if (selected_combination_ids.indexOf(this.combinations[li_c].index) !== -1) {
          this.combinations.splice(li_c, 1);
        }
      }

      /**Clear checked items*/
      this.selectedCombinations = [];
    }
    return false;
  }

  onAddCombination():boolean {
    if (!this.selectedShapeType.id) {
      this.toastCtrl.info('Please select Shape Type to continue');
    }
    else if (!this.selectedObjectType.id) {
      this.toastCtrl.info('Please select Object Type to continue');
    }
    else{
      let error_message = null;
      for (let i=0; i<this.combinations.length; i++) {
        if (this.combinations[i].shape_type_id == this.selectedShapeType.id) {
          error_message = 'Shape "' + this.selectedShapeType.name + '" already used for "' + this.combinations[i].object_type_name + '" Object Type, please select another shape';
          break;
        }
      }

      if (error_message) {
        this.toastCtrl.info(error_message);
      }
      else{
        this.combinations.push({
          library_id: this.selectedShapeType.library_id,
          shape_type_id: this.selectedShapeType.id,
          shape_type_name: this.selectedShapeType.name,
          shape_type_svg: this.selectedShapeType.svg,
          object_type_id: this.selectedObjectType.id,
          object_type_name: this.selectedObjectType.name
        });
      }
    }

    return false;
  }

  onCheckPopupLibrary(event, library_id) {
    if (event.target.checked) {
      this.selectedPopupLibraries.push(library_id);
    }
    else{
      let get_index = this.selectedPopupLibraries.indexOf(library_id);
      if (get_index !== -1) {
        this.selectedPopupLibraries.splice(get_index, 1);
      }
    }
  }

  onAddPopupLibraryToUI() {
    if (this.selectedPopupLibraries.length) {
      /**Collect Existing Libraries To Avoid Duplicates For Shape Types Libraries*/
      let selected_library_ids = [];
      for (let i=0; i<this.libraries.length; i++) {
        selected_library_ids.push(this.libraries[i].id);
      }

      /**Append new ones*/
      for (let i=0; i<this.popupLibraries.length; i++) {
        if (selected_library_ids.indexOf(this.popupLibraries[i].id) == -1 && this.selectedPopupLibraries.indexOf(this.popupLibraries[i].id) !== -1) {
          let popup_lib_obj = this.popupLibraries[i];
              popup_lib_obj.is_hidden = false;
          this.libraries.push(popup_lib_obj);
          this.selectedLibraries.push(this.popupLibraries[i].id)
        }
      }

      this.modalService.dismissAll();
    }
    else{
      this.toastCtrl.info('Please select at least one library to add');
    }
  }

  /**Relationship Types*/
  onAddConnectorCombination():boolean {
    if (!Object.keys(this.selectedConnectorShapeType)) {
      this.toastCtrl.info('Please select Shape Type to continue');
    }
    else if (!Object.keys(this.selectedRelationshipType)) {
      this.toastCtrl.info('Please select Relationship Type to continue');
    }
    else{
      let error_message = null;
      for (let i=0; i<this.connectorCombinations.length; i++) {
        if (this.connectorCombinations[i].shape_type_id == this.selectedConnectorShapeType.id) {
          error_message = 'Shape type already used, please select another one';
          break;
        }
      }

      if (error_message) {
        this.toastCtrl.info(error_message);
      }
      else{
        this.connectorCombinations.push({
          library_id: this.selectedConnectorShapeType.library_id,
          shape_type_id: this.selectedConnectorShapeType.id,
          shape_type_name: this.selectedConnectorShapeType.name,
          shape_type_svg: this.selectedConnectorShapeType.svg,
          library_name: this.selectedConnectorShapeType.library_name,
          relationship_type_id: this.selectedRelationshipType.id,
          relationship_type_name: this.selectedRelationshipType.name
        });
      }
    }

    return false;
  }

  onDeleteConnectorCombination():boolean {
    let total_combinations_length = this.connectorSelectedCombinations.length;

    if (total_combinations_length) {
      let selected_combination_ids = [];
      for (let i = 0; i < total_combinations_length; i++) {
        selected_combination_ids.push(this.connectorSelectedCombinations[i].index);
      }

      /**Remove from combinations*/
      let li_c = this.connectorCombinations.length
      while (li_c--) {
        if (selected_combination_ids.indexOf(this.connectorCombinations[li_c].index) !== -1) {
          this.connectorCombinations.splice(li_c, 1);
        }
      }
    }

    /**Clear checked items*/
    this.connectorSelectedCombinations = [];
    return false;
  }

  onConnectorCombinationCheck(event, item, index) {
    if (event.target.checked) {
      item.index = index;
      this.connectorSelectedCombinations.push(item);
    }
    else{
      for (let i=0; i<this.connectorSelectedCombinations.length; i++) {
        if (this.connectorSelectedCombinations[i].index == item.index) {
          this.connectorSelectedCombinations.splice(i, 1);
        }
      }
    }
  }

  onRelationshipTypeCheck(event, item) {
    this.selectedRelationshipType = event.target.checked ? item : {};
  }

  onLoadMoreRelationshipTypes() {
    this.relationshipTypesCurrentPage++;
    this.relationshipTypesService.getRelationshipTypesList(this.loggedInUser['login_key'], this.relationshipTypesCurrentPage).subscribe(data => {
      if (data.status && data.relationship_types) {
        this.relationshipTypes = this.relationshipTypes.concat(data.relationship_types);
      }
    });
    return false;
  }

  onRelationshipTypeLibraryCheck(event, library_id):boolean {
    if (event.target.checked) {
      this.selectedConnectorLibraries.push(library_id);
    }
    else{
      let get_index = this.selectedConnectorLibraries.indexOf(library_id);
      if (get_index !== -1) {
        this.selectedConnectorLibraries.splice(get_index, 1);
      }
    }
    return false;
  }

  onRelationshipShapeTypeCheck(event, item, library) {
    if (event.target.checked) {
      item.library_id = library.id;
      item.library_name = library.name;
      this.selectedConnectorShapeType = item;
    }
    else{
      this.selectedConnectorShapeType = {};
    }
  }
  
  onSelectImportLibrary(event){
    this.hasSelectedImportLibrary=event.target.checked;
    this.selectedPopupLibraries=[]
  }
}
