import { Component, HostListener, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../shared/EventService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../shared/HelperService';
import { DataConnectorsService } from './data-connectors.service';

@Component({
  selector: 'app-data-connectors',
  templateUrl: './data-connectors.component.html',
  styleUrls: ['./data-connectors.component.css']
})
export class DataConnectorsComponent {
  @ViewChild('confirmDeleteConnectorItemModal') confirmDeleteConnectorItemModal: NgbModal;
  /**Data Connectors*/
  loggedInUser: any;
  data_connectors: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  connectorCheckedItems : any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  defaultSort: string;
  connectorIds: any;
  isLoadingConnectors: boolean;
  connectorExpandOptions: any;
  renameConnectorData: any;
  currentActiveTab: string;
  adminUser: boolean;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.connectorExpandOptions = { id: null, right: null, type: 'fixed' };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameConnectorData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private dataConnectorService: DataConnectorsService,
      private modalService: NgbModal,
      private helperService: HelperService,
  ) {

  }

  ngOnInit(): void {
    /**Initialize*/
    this.adminUser = this.authService.isUserAdmin();
    this.data_connectors = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.isLoadingConnectors = false;
    this.connectorIds = [];
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameConnectorData = {};
    this.eventsService.onPageChange({ section : 'model', page : 'data-connectors' })
    this.connectorExpandOptions = { id: null, right: null, type: 'fixed' };
    if(this.adminUser) {
      this.loadConnectors(this.currentPage);
      this.currentActiveTab = 'api_clients';  
    }
    else
      this.currentActiveTab = 'excel';
    // this.excelSheetImportTab = '';
    // this.excelSheets = [];
    // this.showExcelImportBtn = false;
    // this.excelSheetImportProcessing = false;
    // this.excelSheetImported = false;
    
  }

  loadConnectors(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.connectorCheckedItems = {};
    this.isLoadingConnectors = true;
    this.dataConnectorService.getConnectors(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingConnectors = false;

      /**Append new items*/
      if (page == 1) {
        this.connectorIds = [];
        this.data_connectors = [];
      }

      for (let i in data.data_connectors) {
        if (this.connectorIds.indexOf(data.data_connectors[i].id) == -1) {
          this.data_connectors = this.data_connectors.concat(data.data_connectors[i]);
          this.connectorIds.push(data.data_connectors[i].id);
        }
      }

      this.isAllSelected = false;
      this.isAllReSelected = false
      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.data_connectors.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadConnectors(this.currentPage);
        return;
      }
    })
  }

  checkConnectorItem(event, item) {
    if (event.target.checked) {
      if (!this.connectorCheckedItems[item.id]) {
        this.connectorCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.connectorCheckedItems[item.id]) {
        delete this.connectorCheckedItems[item.id];}
    }
    this.isAllReSelected = this.data_connectors.every((item)=>this.connectorCheckedItems[item.id])
  }

  processConnectorDelete() {
    this.modalService.dismissAll();
    let connector_ids = [];

    if (this.deleteSingleItem) {
      connector_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.connectorCheckedItems) {
        connector_ids.push(i);
      }
    }


    this.dataConnectorService.removeConnectors(this.loggedInUser['login_key'], connector_ids).subscribe(data => {
      if (data.status) {
        this.connectorCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Data connectors removed successfully');
        this.loadConnectors(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  getTotalSelectedConnectors() {
    return Object.keys(this.connectorCheckedItems).length;
  }

  onDeleteMultipleConnectors() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteConnectorItemModal, { size : 'sm', centered: true });
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
    this.loadConnectors(1);
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onConnectorOptions(event, item, check_position):boolean {
    if (this.connectorExpandOptions.id == item.id && (
        (!check_position && this.connectorExpandOptions.type == 'fixed') ||
        (check_position && this.connectorExpandOptions.type == 'float')
    )) {
      this.connectorExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else{
        this.connectorExpandOptions.id = item.id;
        if (check_position) {
          this.connectorExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.connectorExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.connectorExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        }
        else{
          this.connectorExpandOptions.type = 'fixed';
          this.connectorExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  renameObjectType(item) {
    this.renameConnectorData = item;
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
    this.renameConnectorData = {};
    this.dataConnectorService.updateConnector(this.loggedInUser['login_key'], item.id, { name: item.name }, true).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Connector renamed successfully');
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renameConnectorData = {};
  }

  deleteConnector(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteConnectorItemModal, { size : 'sm', centered: true });
  }

  onTabChange(type) {
    this.currentActiveTab = type;
  }

  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.data_connectors.forEach((item) => {
        this.connectorCheckedItems[item.id] = item
      });
    }
    else {
      this.connectorCheckedItems = {}
    }
  }
}
