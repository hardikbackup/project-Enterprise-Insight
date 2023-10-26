import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { UserGroupsService } from './user-groups.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../shared/HelperService';

@Component({
  selector: 'app-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.css']
})

export class UserGroupsComponent implements OnInit {
  @ViewChild('confirmDeleteGroupsItemModal') confirmDeleteGroupsItemModal: NgbModal;
  loggedInUser: any;
  groups: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  groupCheckedItems : any;
  defaultSort: string;
  isLoadingUserGroups: boolean;
  userGroupIds: any;
  groupExpandOptions: any;
  renameGroupData: any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  isAllReSelected:boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.groupExpandOptions = { id: null, right: null };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameGroupData = {};
    }
  }
  constructor(
      private authService: AuthService,
      private groupsService: UserGroupsService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.groups = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.eventsService.onPageChange({ section : 'administration', page : 'user-groups' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.isLoadingUserGroups = false;
    this.userGroupIds = [];
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameGroupData = {};
    this.groupExpandOptions = { id: null, right: null };
    this.loadGroups(this.currentPage);
  }

  loadGroups(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.groupCheckedItems = [];
    this.isLoadingUserGroups = true;
    this.groupsService.getGroups(this.loggedInUser['login_key'],this.defaultSort,page).subscribe(data => {
        this.isLoadingUserGroups = false;
        this.isAllSelected = false;
        this.isAllReSelected = false

      /**Append new items*/
      if (page == 1) {
        this.userGroupIds = [];
        this.groups = [];
      }

      for (let i in data.groups) {
        if (this.userGroupIds.indexOf(data.groups[i].id) == -1) {
          this.groups = this.groups.concat(data.groups[i]);
          this.userGroupIds.push(data.groups[i].id);
        }
      }

        this.firstLoad = true;
        this.currentPage = page;
        this.pages = data.pages;

        if (!this.groups.length && this.currentPage != 1) {
          this.currentPage--;
          this.loadGroups(this.currentPage);
          return;
        }
      })
  }

  checkAllGroupItems(event){
    if (event.target.checked) {
      if (this.groups.length) {
        for (let i in this.groups) {
          if (this.groupCheckedItems.indexOf(this.groups[i].id) == -1) {
            this.groupCheckedItems.push(this.groups[i].id);
          }
        }

        this.isAllSelected = true;
      }
    }
    else{
      this.groupCheckedItems = [];
      this.isAllSelected = false;
    }
  }

  checkGroupItem(event, item) {
    if (event.target.checked) {
      if (!this.groupCheckedItems[item.id]) {
        this.groupCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.groupCheckedItems[item.id]) {
        delete this.groupCheckedItems[item.id];
      }
    }
    this.isAllReSelected = this.groups.every((item)=>this.groupCheckedItems[item.id]);
  }

  processGroupDeleteProcess(){
    this.modalService.dismissAll();
    let group_ids = [];
    if (this.deleteSingleItem) {
      group_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.groupCheckedItems) {
        group_ids.push(i);
      }
    }

    this.groupsService.removeGroup(this.loggedInUser['login_key'], group_ids).subscribe(data => {
      if (data.status) {
        this.groupCheckedItems = {};
        data.pages = 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Group removed successfully');
        this.loadGroups(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    })
  }

  onDeleteMultipleGroups() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteGroupsItemModal, { size : 'sm', centered: true });
  }

  sortBy(type) {
    switch (type) {
      case 'name':
        this.defaultSort = (this.defaultSort == 'name_asc') ? 'name_desc' : 'name_asc';
      break;
      case 'users':
        this.defaultSort = (this.defaultSort == 'users_asc') ? 'users_desc' : 'users_asc';
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

    this.loadGroups(1);
  }

  getTotalSelectedGroups() {
    return Object.keys(this.groupCheckedItems).length;
  }

  onUserTypeOptions(event, item, check_position):boolean {
    if (this.groupExpandOptions.id == item.id && (
        (!check_position && this.groupExpandOptions.type == 'fixed') ||
        (check_position && this.groupExpandOptions.type == 'float')
    )) {
      this.groupExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        this.groupExpandOptions.id = item.id;
        if (check_position) {
          this.groupExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.groupExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.groupExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        } else {
          this.groupExpandOptions.type = 'fixed';
          this.groupExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteGroup(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteGroupsItemModal, { size : 'sm', centered: true });
  }

  renameGroup(item) {
    this.renameGroupData = item;
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
    this.renameGroupData = {};
    this.groupsService.updateGroup(this.loggedInUser['login_key'], item.id, item.name).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Group renamed successfully');
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renameGroupData = {};
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.groups.forEach((item) => {
        if (!(item.name == "All users" || item.name == "Anyone")) {
          this.groupCheckedItems[item.id] = item;
        }
      });
    }
    else {
      this.groupCheckedItems = {}
    }
  }
}
