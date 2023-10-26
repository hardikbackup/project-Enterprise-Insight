import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { ObjectTypeService } from './object-type.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../shared/HelperService';

@Component({
  selector: 'app-object-type',
  templateUrl: './object-type.component.html',
  styleUrls: ['./object-type.component.css']
})
export class ObjectTypeComponent implements OnInit {
  @ViewChild('confirmDeleteObjectTypeItemModal') confirmDeleteObjectTypeItemModal: NgbModal;
  loggedInUser: any;
  object_types: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  objectTypeCheckedItems : any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  defaultSort: string;
  objectTypeIds: any;
  isLoadingObjectTypes: boolean;
  objectTypeExpandOptions: any;
  renameObjectTypeData: any;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.objectTypeExpandOptions = { id: null, right: null, type: 'fixed' };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameObjectTypeData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private objectTypeService: ObjectTypeService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.object_types = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.isLoadingObjectTypes = false;
    this.objectTypeIds = [];
    this.eventsService.onPageChange({ section : 'metamodel', page : 'object-types' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.objectTypeExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameObjectTypeData = {};
    this.loadObjectTypes(this.currentPage);
  }

  loadObjectTypes(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.objectTypeCheckedItems = {};
    this.isLoadingObjectTypes = true;
    this.objectTypeService.getObjectTypes(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingObjectTypes = false;

      /**Append new items*/
      if (page == 1) {
        this.objectTypeIds = [];
        this.object_types = [];
      }

      for (let i in data.object_types) {
        if (this.objectTypeIds.indexOf(data.object_types[i].id) == -1) {
          this.object_types = this.object_types.concat(data.object_types[i]);
          this.objectTypeIds.push(data.object_types[i].id);
        }
      }

      this.isAllSelected = false;
      this.isAllReSelected = false
      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.object_types.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadObjectTypes(this.currentPage);
        return;
      }
    })
  }

  checkObjectTypeItem(event, item) {
    if (event.target.checked) {
      if (!this.objectTypeCheckedItems[item.id]) {
        this.objectTypeCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.objectTypeCheckedItems[item.id]) {
        delete this.objectTypeCheckedItems[item.id];}
    }
    this.isAllReSelected = this.object_types.every((item)=>this.objectTypeCheckedItems[item.id]);
  }

  processObjectTypeDelete() {
    this.modalService.dismissAll();
    let object_type_ids = [];

    if (this.deleteSingleItem) {
      object_type_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.objectTypeCheckedItems) {
        object_type_ids.push(i);
      }
    }


    this.objectTypeService.removeObjectType(this.loggedInUser['login_key'], object_type_ids).subscribe(data => {
      if (data.status) {
        this.objectTypeCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Object type removed successfully');
        this.loadObjectTypes(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  getTotalSelectedObjectTypes() {
    return Object.keys(this.objectTypeCheckedItems).length;
  }

  onDeleteMultipleObjectTypes() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteObjectTypeItemModal, { size : 'sm', centered: true });
  }

  sortBy(type) {
    switch (type) {
      case 'name':
        this.defaultSort = (this.defaultSort == 'name_asc') ? 'name_desc' : 'name_asc';
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
    }
    this.loadObjectTypes(1);
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onObjectTypeOptions(event, item, check_position):boolean {
    if (this.objectTypeExpandOptions.id == item.id && (
          (!check_position && this.objectTypeExpandOptions.type == 'fixed') ||
          (check_position && this.objectTypeExpandOptions.type == 'float')
    )) {
      this.objectTypeExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else{
        this.objectTypeExpandOptions.id = item.id;
        if (check_position) {
          this.objectTypeExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.objectTypeExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.objectTypeExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        }
        else{
          this.objectTypeExpandOptions.type = 'fixed';
          this.objectTypeExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteObjectType(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteObjectTypeItemModal, { size : 'sm', centered: true });
  }

  renameObjectType(item) {
    this.renameObjectTypeData = item;
  }

  onRenameKeyup(event, item) {
    if (event.keyCode == 13) {
      let new_name = event.target.value.trim();
      if (new_name.length) {
        this.onSaveRename(new_name, item);
      }
      else{
        event.target.focus();
      }
    }
  }

  onPreSaveRename(item) {
    let rename_el = <HTMLInputElement>document.getElementById('rename_' + item.id);
    let new_name = rename_el.value.trim();
    if (new_name.length) {
      this.onSaveRename(new_name, item);
    }
    else{
      rename_el.focus();
    }
  }

  onSaveRename(new_name, item) {
    if (!new_name.toString().trim().length) {
      this.toastCtrl.info('Name is required');
      return false;
    }

    item.name = new_name;
    this.renameObjectTypeData = {};
    this.objectTypeService.updateObjectType(this.loggedInUser['login_key'], item.id, item.name, '', '', false, '', [], [], [], true).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Object renamed successfully');
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renameObjectTypeData = {};
  }

  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.object_types.forEach((item) => {
        this.objectTypeCheckedItems[item.id] = item
      });
    }
    else {
      this.objectTypeCheckedItems = {}
    }
  }
}
