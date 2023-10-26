import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../auth/auth.service';
import { ModelService } from '../../../../model/model.service';
import {DiagramTypeService} from '../../../diagram-type/diagram-type.service';

@Component({
  selector: 'app-object-type-diagram-type-search',
  templateUrl: './object-type-diagram-type-search.component.html',
  styleUrls: ['./object-type-diagram-type-search.component.css']
})
export class ObjectTypeDiagramTypeSearchComponent implements OnInit {
  @Input() loggedInUser: any;
  @Output() exportObjectDiagramTypeSelection = new EventEmitter<any>();

  /**From Objects*/
  @ViewChild('fromObjectKeywordEl') fromObjectKeywordEl: ElementRef;
  fromObjectTypes: any;
  fromObjectTypeCurrentPage: number;
  fromObjectTypeMaxShowPage: any;
  fromObjectTypeTotalPages: number;
  fromObjectTypeShowPagination: boolean;
  fromObjectTypesLoading: boolean;

  /**To Objects*/
  @ViewChild('toDiagramKeywordEl') toDiagramKeywordEl: ElementRef;
  toDiagramTypes: any;
  toDiagramTypeCurrentPage: number;
  toDiagramTypeMaxShowPage: any;
  toDiagramTypeTotalPages: number;
  toDiagramTypeShowPagination: boolean;
  toDiagramTypesLoading: boolean;
  selectedFromObjectType: any;
  selectedToDiagramType: any;

  constructor(
      private authService: AuthService,
      private modelService: ModelService,
      private toastCtrl: ToastrService,
      private diagramTypeService: DiagramTypeService
  ) { }

  ngOnInit(): void {
    /**From Objects*/
    this.fromObjectTypes = [];
    this.fromObjectTypeCurrentPage = 1;
    this.fromObjectTypeTotalPages = 0;
    this.fromObjectTypeShowPagination = false;
    this.fromObjectTypesLoading = false;

    /**To Objects*/
    this.toDiagramTypes = [];
    this.toDiagramTypeCurrentPage = 1;
    this.toDiagramTypeTotalPages = 0;
    this.toDiagramTypeShowPagination = false;
    this.toDiagramTypesLoading = true;
    this.selectedFromObjectType = {};
    this.selectedToDiagramType = {};

    this.onSearchFromObjectType(1);
    this.onSearchToDiagramType(1);
  }

  /**From Object Search*/
  onSearchFromObjectType(page) {
    this.fromObjectTypesLoading = true;
    this.fromObjectTypes = [];
    let keyword = (this.fromObjectKeywordEl) ? this.fromObjectKeywordEl.nativeElement.value : '';
    this.fromObjectTypeCurrentPage = page;
    this.modelService.objectTypeSearch(this.loggedInUser['login_key'], keyword, null, page).subscribe(data => {
      this.fromObjectTypesLoading = false;
      if (data.status) {
        this.fromObjectTypeTotalPages = data.pages;
        this.fromObjectTypes = data.object_types;

        if (this.fromObjectTypeTotalPages > 1) {
          this.fromObjectTypeShowPagination = true;
          let new_max_page = this.fromObjectTypeCurrentPage + 3;
          this.fromObjectTypeMaxShowPage = new Array((new_max_page > this.fromObjectTypeTotalPages) ? this.fromObjectTypeTotalPages : new_max_page);
        }
      }
      else{
        this.toastCtrl.error('Failed to load objects');
      }
    });
  }

  /**To Object Search*/
  onSearchToDiagramType(page) {
    this.toDiagramTypesLoading = true;
    this.toDiagramTypes = [];
    let keyword = (this.toDiagramKeywordEl) ? this.toDiagramKeywordEl.nativeElement.value : '';
    this.diagramTypeService.diagramTypeSearch(this.loggedInUser['login_key'], keyword, null, page).subscribe(data => {
      this.toDiagramTypesLoading = false;
      if (data.status) {
        this.toDiagramTypeTotalPages = data.pages;
        this.toDiagramTypeCurrentPage = page;
        this.toDiagramTypes = data.diagram_types;

        if (this.toDiagramTypeTotalPages > 1) {
          this.toDiagramTypeShowPagination = true;
          let new_max_page = this.toDiagramTypeCurrentPage + 3;
          this.toDiagramTypeMaxShowPage = new Array((new_max_page > this.toDiagramTypeTotalPages) ? this.toDiagramTypeTotalPages : new_max_page);
        }
      }
      else{
        this.toastCtrl.error('Failed to load objects');
      }
    });
  }

  onFromObjectChecked(event, item) {
    if (event.target.checked) {
      this.selectedFromObjectType = { id: item.object_type_id, name: item.name };
    }
    else{
      this.selectedFromObjectType = {};
    }

    this.onExportSelectedObj();
  }

  onToDiagramChecked(event, item) {
    if (event.target.checked) {
      this.selectedToDiagramType = { id: item.diagram_type_id, name: item.name };
    }
    else{
      this.selectedToDiagramType = {};
    }

    this.onExportSelectedObj();
  }

  onExportSelectedObj() {
    if (this.selectedFromObjectType && this.selectedToDiagramType) {
      this.exportObjectDiagramTypeSelection.emit({ from_object_type : this.selectedFromObjectType, to_diagram_type : this.selectedToDiagramType });
    }
    else{
      this.exportObjectDiagramTypeSelection.emit(null);
    }
  }

  onFromAnyChange(event) {
    if (this.selectedFromObjectType.id == 'any' || !event.target.checked) {
      this.selectedFromObjectType = {};
    }
    else{
      this.selectedFromObjectType = { id: 'any', name: 'ANY' };
    }

    this.onExportSelectedObj();
  }

  onToAnyChange(event) {
    if (this.selectedToDiagramType.id == 'any' || !event.target.checked) {
      this.selectedToDiagramType = {};
    }
    else{
      this.selectedToDiagramType = { id: 'any', name: 'ANY' };
    }

    this.onExportSelectedObj();
  }
}
