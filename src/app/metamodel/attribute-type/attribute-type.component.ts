import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AttributeTypeService } from './attribute-type.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../shared/HelperService';

@Component({
  selector: 'app-attribute-type',
  templateUrl: './attribute-type.component.html',
  styleUrls: ['./attribute-type.component.css']
})
export class AttributeTypeComponent implements OnInit {
  @ViewChild('confirmDeleteAttributeTypeItemModal') confirmDeleteAttributeTypeItemModal: NgbModal;
  loggedInUser: any;
  attribute_types: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  attributeTypeCheckedItems : any;
  defaultSort: string;
  isLoadingAttributeTypes: boolean;
  attributeTypeIds: any;
  attributeTypeExpandOptions: any;
  renameAttributeTypeData: any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.attributeTypeExpandOptions = { id: null, right: null };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameAttributeTypeData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private attributeTypeService: AttributeTypeService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.attribute_types = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.eventsService.onPageChange({ section : 'metamodel', page : 'attribute-types' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.isLoadingAttributeTypes = false;
    this.attributeTypeIds = [];
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameAttributeTypeData = {};
    this.attributeTypeExpandOptions = { id: null, right: null };
    this.loadAttributeTypes(this.currentPage);
  }

  loadAttributeTypes(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.attributeTypeCheckedItems = {};
    this.isLoadingAttributeTypes = true;
    this.attributeTypeService.getAttributeTypes(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingAttributeTypes = false;
      this.isAllSelected = false;
      this.isAllReSelected = false

      /**Append new items*/
      if (page == 1) {
        this.attributeTypeIds = [];
        this.attribute_types = [];
      }

      for (let i in data.attribute_types) {
        if (this.attributeTypeIds.indexOf(data.attribute_types[i].id) == -1) {
          this.attribute_types = this.attribute_types.concat(data.attribute_types[i]);
          this.attributeTypeIds.push(data.attribute_types[i].id);
        }
      }

      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.attribute_types.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadAttributeTypes(this.currentPage);
        return;
      }
    })
  }

  checkAttributeTypeItem(event, item) {
    if (event.target.checked) {
      if (!this.attributeTypeCheckedItems[item.id]) {
        this.attributeTypeCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.attributeTypeCheckedItems[item.id]) {
        delete this.attributeTypeCheckedItems[item.id];
      }
    }
    this.isAllReSelected = this.attribute_types.every((item)=>this.attributeTypeCheckedItems[item.id]);
  }

  totalAttributeTypeCheckedItems() {
    return Object.keys(this.attributeTypeCheckedItems).length;
  }

  processAttributeTypeDelete(){
    this.modalService.dismissAll();
    let attribute_type_ids = [];
    if (this.deleteSingleItem) {
      attribute_type_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.attributeTypeCheckedItems) {
        attribute_type_ids.push(i);
      }
    }

    this.attributeTypeService.removeAttributeType(this.loggedInUser['login_key'], attribute_type_ids).subscribe(data => {
      if (data.status) {
        this.attributeTypeCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Attribute type removed successfully');
        this.loadAttributeTypes(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    })
  }

  onDeleteMultipleAttributeTypes() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteAttributeTypeItemModal, { size : 'sm', centered: true });
  }

  sortBy(type) {
    switch (type) {
      case 'name':
        this.defaultSort = (this.defaultSort == 'name_asc') ? 'name_desc' : 'name_asc';
      break;
      case 'format':
        this.defaultSort = (this.defaultSort == 'format_asc') ? 'format_desc' : 'format_asc';
      break;
      case 'created':
        this.defaultSort = (this.defaultSort == 'created_date_asc') ? 'created_date_desc' : 'created_date_asc';
      break;
      case 'updated':
        this.defaultSort = (this.defaultSort == 'updated_date_asc') ? 'updated_date_desc' : 'updated_date_asc';
      break;
      case 'created_by':
        this.defaultSort = (this.defaultSort == 'created_by_asc') ? 'created_by_desc' : 'created_by_asc';
      break;
      case 'updated_by':
        this.defaultSort = (this.defaultSort == 'updated_by_asc') ? 'updated_by_desc' : 'updated_by_asc';
      break;
      case 'export_to_diagram':
        this.defaultSort = (this.defaultSort == 'export_to_diagram_asc') ? 'export_to_diagram_desc' : 'export_to_diagram_asc';
        break;
    }

    this.loadAttributeTypes(1);
  }

  onAttributeTypeOptions(event, item, check_position):boolean {
    if (this.attributeTypeExpandOptions.id == item.id && (
        (!check_position && this.attributeTypeExpandOptions.type == 'fixed') ||
        (check_position && this.attributeTypeExpandOptions.type == 'float')
    )) {
      this.attributeTypeExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        this.attributeTypeExpandOptions.id = item.id;
        if (check_position) {
          this.attributeTypeExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.attributeTypeExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.attributeTypeExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        } else {
          this.attributeTypeExpandOptions.type = 'fixed';
          this.attributeTypeExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteAttributeType(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteAttributeTypeItemModal, { size : 'sm', centered: true });
  }

  renameAttributeType(item) {
    this.renameAttributeTypeData = item;
  }

  onRenameKeyup(event, item) {
    if (event.keyCode == 13) {
      event.target.value = this.helperService.removeExtraSymbols(event.target.value);
      if (event.target.value.length) {
        this.onSaveRename(event.target.value, item);
      }
      else{
        event.target.focus();
        this.toastCtrl.info('Only alphanumeric characters are allowed');
      }
    }
  }

  onSaveRename(new_name, item) {
    if (new_name.toString().trim().length) {
      item.name = new_name;
      this.renameAttributeTypeData = {};
      this.attributeTypeService.updateAttributeType(this.loggedInUser['login_key'], { id: item.id, name: item.name }, true).subscribe(data => {
        if (data.status) {
          this.toastCtrl.success('Attribute type renamed successfully');
        }
        else{
          this.toastCtrl.error(data.error);
        }
      });
    }
    else{
      this.toastCtrl.info('Name is required');
    }
  }

  onCancelRename() {
    this.renameAttributeTypeData = {};
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onExportToDiagramEditor(event, item) {
    this.attributeTypeService.updateExportToDiagramFlag(this.loggedInUser['login_key'],item.id,event.target.checked).subscribe(data => {
      if (!data.status) {
        this.toastCtrl.error(data.error);
      }
    });
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.attribute_types.forEach((item) => {
        this.attributeTypeCheckedItems[item.id] = item
      });
    }
    else {
      this.attributeTypeCheckedItems = {}
    }
  }
}
