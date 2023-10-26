import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { UsersService } from './users.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../shared/HelperService';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  @ViewChild('confirmDeleteUserItemModal') confirmDeleteUserItemModal: NgbModal;
  @ViewChild('inviteUserModal') inviteUserModal: NgbModal;
  usersType: string;
  loggedInUser: any;
  users: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  isMainAllSelected: boolean;
  userCheckedItems : any;
  defaultSort: string;
  isLoadingUsers: boolean;
  userIds: any;
  userExpandOptions: any;
  renameUserData: any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  inviteUserForm: UntypedFormGroup;
  hasFolderCreateFormSubmitted: boolean;
  isInvitationLoading: boolean;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.userExpandOptions = { id: null, right: null };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameUserData = {};
    }
  }
  constructor(
      private authService: AuthService,
      private usersService: UsersService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.users = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.isMainAllSelected = false;
    this.defaultSort = 'first_name_asc';
    this.eventsService.onPageChange({ section : 'administration', page : 'users' });
    this.isLoadingUsers = false;
    this.userIds = [];
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameUserData = {};
    this.userExpandOptions = { id: null, right: null };
    this.usersType = 'active';
    /**Load Users*/
    this.loadUsers(this.currentPage);
  }

  loadUsers(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.userCheckedItems = [];
    this.isLoadingUsers = true;
    this.usersService.getUsers(this.loggedInUser['login_key'],this.usersType,this.defaultSort,page).subscribe(data => {
      this.isLoadingUsers = false;
      this.isAllSelected = false;
      this.isAllReSelected = false
      /**Append new items*/
      if (page == 1) {
        this.userIds = [];
        this.users = [];
      }

      for (let i in data.users) {
        if (this.userIds.indexOf(data.users[i].id) == -1) {
          this.users = this.users.concat(data.users[i]);
          this.userIds.push(data.users[i].id);
        }
      }

      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.users.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadUsers(this.currentPage);
        return;
      }
    })
  }

  checkUserItem(event, item) {
    if (event.target.checked) {
      if (!this.userCheckedItems[item.id]) {
        this.userCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.userCheckedItems[item.id]) {
        delete this.userCheckedItems[item.id];
      }
    }

    this.isMainAllSelected = false;
    this.isAllReSelected = this.users.every((item)=>this.userCheckedItems[item.id]);
  }

  processUserDeleteProcess(){
    this.modalService.dismissAll();
    let user_ids = [];
    if (this.deleteSingleItem) {
      user_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.userCheckedItems) {
        user_ids.push(this.userCheckedItems[i].id);
      }
    }

    this.usersService.removeUser(this.loggedInUser['login_key'], user_ids).subscribe(data => {
      if (data.status) {
        this.userCheckedItems = {};
        data.pages = 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('User removed successfully');
        this.loadUsers(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    })
  }

  onDeleteMultipleUsers() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteUserItemModal, { size : 'sm', centered: true });
  }

  getTotalSelectedUsers() {
    return Object.keys(this.userCheckedItems).length;
  }

  sortBy(type) {
    switch (type) {
      case 'first_name':
        this.defaultSort = (this.defaultSort == 'first_name_asc') ? 'first_name_desc' : 'first_name_asc';
      break;
      case 'last_name':
        this.defaultSort = (this.defaultSort == 'last_name_asc') ? 'last_name_desc' : 'last_name_asc';
      break;
      case 'email':
        this.defaultSort = (this.defaultSort == 'email_asc') ? 'email_desc' : 'email_asc';
      break;
      case 'last_login':
        this.defaultSort = (this.defaultSort == 'last_login_asc') ? 'last_login_desc' : 'last_login_asc';
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

    this.loadUsers(1);
  }

  onUserOptions(event, item, check_position):boolean {
    if (this.userExpandOptions.id == item.id && (
        (!check_position && this.userExpandOptions.type == 'fixed') ||
        (check_position && this.userExpandOptions.type == 'float')
    )) {
      this.userExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        this.userExpandOptions.id = item.id;
        if (check_position) {
          this.userExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.userExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.userExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        } else {
          this.userExpandOptions.type = 'fixed';
          this.userExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteUser(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteUserItemModal, { size : 'sm', centered: true });
  }

  renameUser(item) {
    this.renameUserData = item;
  }

  onRenameKeyup(event, item) {
    if (event.keyCode == 13) {
      let first_name_el = <HTMLInputElement>document.getElementById('rename_first_' + item.id);
      let last_name_el = <HTMLInputElement>document.getElementById('rename_last_' + item.id);
      let first_name = first_name_el.value.trim();
      let last_name = last_name_el.value.trim();
      if (first_name.length && last_name.length) {
        this.usersService.updateUser(this.loggedInUser['login_key'], item.id, { first_name: first_name, last_name: last_name }, [], true).subscribe(data => {
          if (data.status) {
            this.renameUserData = {};
            item.first_name = first_name;
            item.last_name = last_name;
            this.toastCtrl.success('User renamed successfully');
          }
          else{
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.toastCtrl.info('Please specify both first/last names to continue');
      }
    }
  }

  onCancelRename() {
    this.renameUserData = {};
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onTabChange(type):boolean {
    this.usersType = type;
    this.loadUsers(1);
    return false;
  }

  onInviteUser():boolean{
    /**Initialize Form*/
    this.inviteUserForm = new UntypedFormGroup({
      email: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required, Validators.email]
      })
    });
    this.hasFolderCreateFormSubmitted = false;
    this.isInvitationLoading = false;
    this.modalService.open(this.inviteUserModal, { size : 'sm', centered: true });
    return false;
  }

  onSendInvitation(){
    this.hasFolderCreateFormSubmitted = true;
    if (this.inviteUserForm.valid) {
      this.isInvitationLoading = true;
      this.usersService.inviteUser(this.loggedInUser['login_key'], this.inviteUserForm.value.email).subscribe(data => {
        this.isInvitationLoading = false;
        if (data.status) {
          this.modalService.dismissAll();
          this.toastCtrl.success('Invitation sent successfully');
          if (this.usersType == 'invited') {
            this.loadUsers(this.currentPage);
          }
        }
        else{
          this.toastCtrl.error(data.error);
        }
      });
    }
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.users.forEach((item) => {
        this.userCheckedItems[item.id] = item
      });
    }
    else {
      this.userCheckedItems = {}
    }
  }
}
