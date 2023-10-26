import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { RelationshipTypeService } from './relationship-type.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../shared/HelperService';

@Component({
  selector: 'app-relationship-type',
  templateUrl: './relationship-type.component.html',
  styleUrls: ['./relationship-type.component.css']
})
export class RelationshipTypeComponent implements OnInit {
  @ViewChild('confirmDeleteRelationshipItemModal') confirmDeleteRelationshipItemModal: NgbModal;
  loggedInUser: any;
  relationship_types: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  relationshipTypeCheckedItems : any;
  defaultSort: string;
  isLoadingRelationshipTypes: boolean;
  relationshipTypeIds: any;
  relationshipTypeExpandOptions: any;
  renameRelationshipTypeData: any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.relationshipTypeExpandOptions = { id: null, right: null };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameRelationshipTypeData = {};
    }
  }
  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private relationshipTypeService: RelationshipTypeService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.relationship_types = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.isLoadingRelationshipTypes = false;
    this.relationshipTypeIds = [];
    this.eventsService.onPageChange({ section : 'metamodel', page : 'relationship-types' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameRelationshipTypeData = {};
    this.relationshipTypeExpandOptions = { id: null, right: null };
    this.loadRelationshipTypes(this.currentPage);
  }

  loadRelationshipTypes(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.relationshipTypeCheckedItems = {};
    this.isLoadingRelationshipTypes = true;
    this.relationshipTypeService.getRelationshipTypes(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingRelationshipTypes = false;
      this.isAllSelected = false;
      this.isAllReSelected = false;
      /**Append new items*/
      if (page == 1) {
        this.relationshipTypeIds = [];
        this.relationship_types = [];
      }

      for (let i in data.relationship_types) {
        if (this.relationshipTypeIds.indexOf(data.relationship_types[i].id) == -1) {
          this.relationship_types = this.relationship_types.concat(data.relationship_types[i]);
          this.relationshipTypeIds.push(data.relationship_types[i].id);
        }
      }

      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.relationship_types.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadRelationshipTypes(this.currentPage);
        return;
      }
    })
  }

  checkRelationshipTypeItem(event, item) {
    if (event.target.checked) {
      if (!this.relationshipTypeCheckedItems[item.id]) {
        this.relationshipTypeCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.relationshipTypeCheckedItems[item.id]) {
        delete this.relationshipTypeCheckedItems[item.id];
      }
    }
    this.isAllReSelected = this.relationship_types.every((item)=>this.relationshipTypeCheckedItems[item.id]);
  }

  processRelationshipTypeDelete() {
    this.modalService.dismissAll();
    let relationship_type_ids = [];
    if (this.deleteSingleItem) {
      relationship_type_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.relationshipTypeCheckedItems) {
        relationship_type_ids.push(i);
      }
    }

    this.relationshipTypeService.removeRelationshipType(this.loggedInUser['login_key'], relationship_type_ids).subscribe(data => {
      if (data.status) {
        this.relationshipTypeCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Relationship type removed successfully');
        this.loadRelationshipTypes(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    })
  }

  onDeleteMultipleRelationshipTypes() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteRelationshipItemModal, { size : 'sm', centered: true });
  }

  getTotalSelectedRelationshipTypes() {
    return Object.keys(this.relationshipTypeCheckedItems).length;
  }

  sortBy(type) {
    switch (type) {
      case 'name':
        this.defaultSort = (this.defaultSort == 'name_asc') ? 'name_desc' : 'name_asc';
      break;
      case 'from_to':
        this.defaultSort = (this.defaultSort == 'from_to_asc') ? 'from_to_desc' : 'from_to_asc';
      break;
      case 'to_from':
        this.defaultSort = (this.defaultSort == 'to_from_asc') ? 'to_from_desc' : 'to_from_asc';
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

    this.loadRelationshipTypes(this.currentPage);
  }

  onRelationshipTypeOptions(event, item, check_position):boolean {
    if (this.relationshipTypeExpandOptions.id == item.id && (
        (!check_position && this.relationshipTypeExpandOptions.type == 'fixed') ||
        (check_position && this.relationshipTypeExpandOptions.type == 'float')
    )) {
      this.relationshipTypeExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        this.relationshipTypeExpandOptions.id = item.id;
        if (check_position) {
          this.relationshipTypeExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.relationshipTypeExpandOptions.right = window.innerWidth - event.clientX - 55;
          }
          else{
            this.relationshipTypeExpandOptions.right = window.innerWidth - event.clientX - 22;
          }

          // this.relationshipTypeExpandOptions.right = window.innerWidth - event.clientX - 22;
        } else {
          this.relationshipTypeExpandOptions.type = 'fixed';
          this.relationshipTypeExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteRelationshipType(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteRelationshipItemModal, { size : 'sm', centered: true });
  }

  renameRelationshipType(item) {
    this.renameRelationshipTypeData = item;
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
    item.name = new_name;
    this.renameRelationshipTypeData = {};
    this.relationshipTypeService.updateRelationshipType(this.loggedInUser['login_key'], { id: item.id, name: item.name }, [], [], true).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Relationship type renamed successfully');
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renameRelationshipTypeData = {};
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.relationship_types.forEach((item) => {
        this.relationshipTypeCheckedItems[item.id] = item
      });
    }
    else {
      this.relationshipTypeCheckedItems = {}
    }
  }
}
