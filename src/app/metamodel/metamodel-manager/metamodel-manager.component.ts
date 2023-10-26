import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { MetamodelManagerService } from './metamodel-manager.service';
import { HelperService } from '../../shared/HelperService';
import { map, take } from 'rxjs/operators';
import{saveAs} from 'file-saver'

@Component({
  selector: 'app-metamodel-manager',
  templateUrl: './metamodel-manager.component.html',
  styleUrls: ['./metamodel-manager.component.css']
})
export class MetamodelManagerComponent implements OnInit {
  @ViewChild('confirmDeleteMetamodelItemModal') confirmDeleteMetamodelItemModal: NgbModal;
  @ViewChild('xmlFileFetech') xmlFileFetech: ElementRef;
  xmlFileName: any;
  loggedInUser: any;
  metamodels: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  metaModelCheckedItems : any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  defaultSort: string;
  metaModelIds: any;
  isLoadingMetamodels: boolean;
  metaModelExpandOptions: any;
  renameMetamodelData: any;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.metaModelExpandOptions = { id: null, right: null, type: 'fixed' };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameMetamodelData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private metamodelService: MetamodelManagerService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.metamodels = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.isLoadingMetamodels = false;
    this.metaModelIds = [];
    this.eventsService.onPageChange({ section : 'metamodel', page : 'metamodel-manager' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.metaModelExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameMetamodelData = {};
    this.loadMetamodels(this.currentPage);
  }

  loadMetamodels(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.metaModelCheckedItems = {};
    this.isLoadingMetamodels = true;
    this.metamodelService.getMetamodels(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingMetamodels = false;

      /**Append new items*/
      if (page == 1) {
        this.metaModelIds = [];
        this.metamodels = [];
      }

      for (let i in data.metamodels) {
        if (this.metaModelIds.indexOf(data.metamodels[i].id) == -1) {
          this.metamodels = this.metamodels.concat(data.metamodels[i]);
          this.metaModelIds.push(data.metamodels[i].id);
        }
      }

      this.isAllSelected = false;
      this.isAllReSelected = false
      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.metamodels.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadMetamodels(this.currentPage);
        return;
      }
    })
  }

  checkMetamodelItem(event, item) {
    if (event.target.checked) {
      if (!this.metaModelCheckedItems[item.id]) {
        this.metaModelCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.metaModelCheckedItems[item.id]) {
        delete this.metaModelCheckedItems[item.id];}
    }
    this.isAllReSelected = this.metamodels.every((item)=>this.metaModelCheckedItems[item.id]);
  }

  processMetamodelDelete() {
    this.modalService.dismissAll();
    let metamodel_ids = [];

    if (this.deleteSingleItem) {
      metamodel_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.metaModelCheckedItems) {
        metamodel_ids.push(i);
      }
    }

    this.metamodelService.removeMetamodel(this.loggedInUser['login_key'], metamodel_ids).subscribe(data => {
      if (data.status) {
        this.metaModelCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Metamodel' + (metamodel_ids.length > 1 ? 's' : '') + ' removed successfully');
        this.loadMetamodels(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  getTotalSelectedMetamodels() {
    return Object.keys(this.metaModelCheckedItems).length;
  }

  onDeleteMultipleMetamodels() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteMetamodelItemModal, { size : 'sm', centered: true });
  }

  sortBy(type) {
    switch (type) {
      case 'name':
        this.defaultSort = (this.defaultSort == 'name_asc') ? 'name_desc' : 'name_asc';
      break;
      case 'default':
        this.defaultSort = (this.defaultSort == 'default_asc') ? 'default_desc' : 'default_asc';
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
    this.loadMetamodels(1);
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onMetamodelOptions(event, item, check_position):boolean {
    if (this.metaModelExpandOptions.id == item.id && (
        (!check_position && this.metaModelExpandOptions.type == 'fixed') ||
        (check_position && this.metaModelExpandOptions.type == 'float')
    )) {
      this.metaModelExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else{
        this.metaModelExpandOptions.id = item.id;
        if (check_position) {
          this.metaModelExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.metaModelExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.metaModelExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        }
        else{
          this.metaModelExpandOptions.type = 'fixed';
          this.metaModelExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteMetamodel(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteMetamodelItemModal, { size : 'sm', centered: true });
  }

  renameMetamodel(item) {
    this.renameMetamodelData = item;
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
    this.renameMetamodelData = {};
    this.metamodelService.updateMetamodel(this.loggedInUser['login_key'],item.id,item.name,false,[],[],[],true,[]).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Metamodel renamed successfully');
      }
      else {
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renameMetamodelData = {};
  }

  onMetamodelDefaultUpdate(event, item) {
    item.default=!item.default
    if(event.target.checked===false){
      item['default_primary']= false
    }
    this.metamodelService.updateDefaultFlag(this.loggedInUser['login_key'],item.id,event.target.checked,item.default_primary).subscribe(data => {
      if (!data.status) {
        this.toastCtrl.error(data.error);
      }
    });
  }

  onMetamodelPrimaryDefaultUpdate(item,event){
    this.metamodelService.updateDefaultFlag(this.loggedInUser['login_key'],item.id,item.default,true).subscribe(data => {
      if (!data.status) {
        this.toastCtrl.error(data.error);
      }
    });
  }

  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.metamodels.forEach((item) => {
        this.metaModelCheckedItems[item.id] = item
      });
    }
    else {
      this.metaModelCheckedItems = {}
    }
  }

  onXmlFileFetechData(event) {
     if (event.target.files && event.target.files.length) {
      this.xmlFileName = this.xmlFileFetech.nativeElement.files[0].name;
      let formData = new FormData();
      console.log(this.xmlFileFetech.nativeElement.files[0])
      formData.append('file', this.xmlFileFetech.nativeElement.files[0]);
      formData.append('login_key',this.loggedInUser['login_key']);
      this.metamodelService.fetchXML(formData).subscribe(data => {
        this.modalService.dismissAll();
        if (data.status) {
          this.toastCtrl.success('imported successfully');
            this.xmlFileName = this.xmlFileFetech.nativeElement.files[0].name;
            this.loadMetamodels(this.currentPage);
          }
          else{
            this.toastCtrl.error(data.error);
          }
        });
    }
  }

  onFetchXmlData(){
    this.xmlFileFetech.nativeElement.value = null;
    this.xmlFileFetech.nativeElement.click();
  }

  onRemoveXmlFile() {
    this.xmlFileName = ''
  }

  exportMetaModels() {
    let metaModelSelectedItems = Object.keys(this.metaModelCheckedItems);
    let payloadData = []
    for (let i = 0; i < metaModelSelectedItems.length; i++) {
      payloadData.push({
        id: metaModelSelectedItems[i]
      })
    }
     if (payloadData) {
      this.metamodelService.exportXMLMetaModel(this.loggedInUser['login_key'], payloadData)
        .subscribe((data: any) => {
          let xmlFile = new Blob([data], { type: 'application/xml' })
          saveAs(xmlFile,'metamodel.xml')
        })
    }
}
}
