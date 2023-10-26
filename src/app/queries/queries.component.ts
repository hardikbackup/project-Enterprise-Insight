import {Component, HostListener, ViewChild} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../shared/EventService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../shared/HelperService';
import { QueriesService } from './queries.service';

@Component({
  selector: 'app-query',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.css']
})
export class QueriesComponent {
  @ViewChild('confirmDeleteQueryItemModal') confirmDeleteQueryItemModal: NgbModal;
  loggedInUser: any;
  object_types: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  queryCheckedItems : any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  defaultSort: string;
  queryIds: any;
  isLoadingQueries: boolean;
  queryExpandOptions: any;
  renameQueryData: any;
  queries: any;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.queryExpandOptions = { id: null, right: null, type: 'fixed' };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameQueryData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private queryService: QueriesService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.queries = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.isLoadingQueries = false;
    this.queryIds = [];
    this.eventsService.onPageChange({ section : 'models', page : 'queries' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.queryExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameQueryData = {};
    this.loadQueries(this.currentPage);
  }

  loadQueries(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.queryCheckedItems = {};
    this.isLoadingQueries = true;
    this.queryService.getQueries(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingQueries = false;

      /**Append new items*/
      if (page == 1) {
        this.queryIds = [];
        this.object_types = [];
      }

      for (let i in data.queries) {
        if (this.queryIds.indexOf(data.queries[i].id) == -1) {
          this.object_types = this.object_types.concat(data.queries[i]);
          this.queryIds.push(data.queries[i].id);
        }
      }

      this.isAllSelected = false;
      this.isAllReSelected = false
      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.object_types.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadQueries(this.currentPage);
        return;
      }
    })
  }

  checkQueryItem(event, item) {
    if (event.target.checked) {
      if (!this.queryCheckedItems[item.id]) {
        this.queryCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.queryCheckedItems[item.id]) {
        delete this.queryCheckedItems[item.id];}
    }
    this.isAllReSelected = this.object_types.every((item)=>this.queryCheckedItems[item.id]);
  }

  processQueryDelete() {
    this.modalService.dismissAll();
    let object_type_ids = [];

    if (this.deleteSingleItem) {
      object_type_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.queryCheckedItems) {
        object_type_ids.push(i);
      }
    }


    this.queryService.removeQuery(this.loggedInUser['login_key'], object_type_ids).subscribe(data => {
      if (data.status) {
        this.queryCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Object type removed successfully');
        this.loadQueries(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  getTotalSelectedQueries() {
    return Object.keys(this.queryCheckedItems).length;
  }

  onDeleteMultipleQueries() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteQueryItemModal, { size : 'sm', centered: true });
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
    this.loadQueries(1);
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onQueryOptions(event, item, check_position):boolean {
    if (this.queryExpandOptions.id == item.id && (
        (!check_position && this.queryExpandOptions.type == 'fixed') ||
        (check_position && this.queryExpandOptions.type == 'float')
    )) {
      this.queryExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else{
        this.queryExpandOptions.id = item.id;
        if (check_position) {
          this.queryExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.queryExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.queryExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        }
        else{
          this.queryExpandOptions.type = 'fixed';
          this.queryExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteQuery(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteQueryItemModal, { size : 'sm', centered: true });
  }

  renameQuery(item) {
    this.renameQueryData = item;
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
    this.renameQueryData = {};
    this.queryService.updateQuery(this.loggedInUser['login_key'], item.id, item.name, null, true).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Query renamed successfully');
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renameQueryData = {};
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.object_types.forEach((item) => {
        this.queryCheckedItems[item.id] = item
      });
    }
    else {
      this.queryCheckedItems = {}
    }
  }
}
