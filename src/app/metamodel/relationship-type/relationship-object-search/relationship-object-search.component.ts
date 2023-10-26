import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModelService } from '../../../model/model.service';
import { AuthService } from '../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-relationship-object-search',
  templateUrl: './relationship-object-search.component.html',
  styleUrls: ['./relationship-object-search.component.css']
})
export class RelationshipObjectSearchComponent implements OnInit {
  loggedInUser: any;
  @Output() exportObjectSelection = new EventEmitter<any>();

  /**From Objects*/
  @ViewChild('fromObjectKeywordEl') fromObjectKeywordEl: ElementRef;
  fromObjectTypes: any;
  fromObjectTypeCurrentPage: number;
  fromObjectTypeMaxShowPage: any;
  fromObjectTypeTotalPages: number;
  fromObjectTypeShowPagination: boolean;
  fromObjectTypesLoading: boolean;

  /**To Objects*/
  @ViewChild('toObjectKeywordEl') toObjectKeywordEl: ElementRef;
  toObjectTypes: any;
  toObjectTypeCurrentPage: number;
  toObjectTypeMaxShowPage: any;
  toObjectTypeTotalPages: number;
  toObjectTypeShowPagination: boolean;
  toObjectTypesLoading: boolean;
  selectedFromObjectType: any;
  selectedToObjectType: any;

  constructor(
      private authService: AuthService,
      private modelService: ModelService,
      private toastCtrl: ToastrService
  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getLoggedInUserObject();
    /**From Objects*/
    this.fromObjectTypes = [];
    this.fromObjectTypeCurrentPage = 1;
    this.fromObjectTypeTotalPages = 0;
    this.fromObjectTypeShowPagination = false;
    this.fromObjectTypesLoading = false;

    /**To Objects*/
    this.toObjectTypes = [];
    this.toObjectTypeCurrentPage = 1;
    this.toObjectTypeTotalPages = 0;
    this.toObjectTypeShowPagination = false;
    this.toObjectTypesLoading = true;
    this.selectedFromObjectType = {};
    this.selectedToObjectType = {};

    this.onSearchFromObjectType(1);
    this.onSearchToObjectType(1);
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
  onSearchToObjectType(page) {
    this.toObjectTypesLoading = true;
    this.toObjectTypes = [];
    let keyword = (this.toObjectKeywordEl) ? this.toObjectKeywordEl.nativeElement.value : '';
    this.modelService.objectTypeSearch(this.loggedInUser['login_key'], keyword, null, page).subscribe(data => {
      this.toObjectTypesLoading = false;
      if (data.status) {
        this.toObjectTypeTotalPages = data.pages;
        this.toObjectTypeCurrentPage = page;
        this.toObjectTypes = data.object_types;

        if (this.toObjectTypeTotalPages > 1) {
          this.toObjectTypeShowPagination = true;
          let new_max_page = this.toObjectTypeCurrentPage + 3;
          this.toObjectTypeMaxShowPage = new Array((new_max_page > this.toObjectTypeTotalPages) ? this.toObjectTypeTotalPages : new_max_page);
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

  onToObjectChecked(event, item) {
    if (event.target.checked) {
      this.selectedToObjectType = { id: item.object_type_id, name: item.name };
    }
    else{
      this.selectedToObjectType = {};
    }

    this.onExportSelectedObj();
  }

  onExportSelectedObj() {
    if (this.selectedFromObjectType && this.selectedToObjectType) {
      this.exportObjectSelection.emit({ from_object_type : this.selectedFromObjectType, to_object_type : this.selectedToObjectType });
    }
    else{
      this.exportObjectSelection.emit(null);
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
    if (this.selectedToObjectType.id == 'any' || !event.target.checked) {
      this.selectedToObjectType = {};
    }
    else{
      this.selectedToObjectType = { id: 'any', name: 'ANY' };
    }

    this.onExportSelectedObj();
  }
}
