import { Component, HostListener, OnInit, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../shared/EventService';
import { PublicationsService } from './publications.service';
import { HelperService } from '../shared/HelperService';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css']
})
export class PublicationsComponent implements OnInit {
  @ViewChild('confirmDeletePublicationItemModal') confirmDeletePublicationItemModal: NgbModal;
  @Input() mode: string;
  loggedInUser: any;
  publications: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  publicationCheckedItems : any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  defaultSort: string;
  publicationIds: any;
  isLoadingPublications: boolean;
  publicationExpandOptions: any;
  renamePublicationData: any;
  defaultListTab: string;
  showPublicationDetails: any;
  hasPublications: boolean;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.publicationExpandOptions = { id: null, right: null, type: 'fixed' };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renamePublicationData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private publicationService: PublicationsService,
      private modalService: NgbModal,
      private helperService: HelperService,
      private sanitizer: DomSanitizer,
      private cdRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.mode = this.mode ? this.mode : 'manage';
    this.publications = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.isLoadingPublications = false;
    this.publicationIds = [];
    this.eventsService.onPageChange({ section : 'publication', page : 'publications' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.publicationExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renamePublicationData = {};
    if(this.mode == 'view') {
      this.defaultListTab = 'box';
    } else {
      this.defaultListTab = 'list';
    }
    this.showPublicationDetails = {
      show: false,
      details: {}
    };
    this.loadPublications(this.currentPage);
  }

  loadPublications(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.publicationCheckedItems = {};
    this.isLoadingPublications = true;

    let data;
    if(this.mode == 'view') {
      this.publicationService.getPublicationViewer(this.loggedInUser['login_key'], this.defaultListTab == 'box', this.defaultSort, page).subscribe(data => {
        this.afterPublicaitonGet(data, page);
      });
    } else {
      this.publicationService.getPublications(this.loggedInUser['login_key'], this.defaultListTab == 'box', this.defaultSort, page).subscribe(data => {
        this.afterPublicaitonGet(data, page);
      });
    }
  }

  private afterPublicaitonGet(data: any, page: any) {
    this.isLoadingPublications = false;

    if (data.publications && data.publications.length > 0) {
      this.hasPublications = true;
    } else {
      this.hasPublications = false;
    }

    /**Append new items*/
    if (page == 1) {
      this.publicationIds = [];
      this.publications = [];
    }

    for (let i in data.publications) {
      if (this.publicationIds.indexOf(data.publications[i].id) == -1) {
        this.publications = this.publications.concat(data.publications[i]);
        this.publicationIds.push(data.publications[i].id);
      }
    }

    this.isAllSelected = false;
    this.isAllReSelected = false
    this.firstLoad = true;
    this.currentPage = page;
    this.pages = data.pages;

    if (!this.publications.length && this.currentPage != 1) {
      this.currentPage--;
      this.loadPublications(this.currentPage);
    }
  }

  checkPublicationItem(event, item) {
    if (event.target.checked) {
      if (!this.publicationCheckedItems[item.id]) {
        this.publicationCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.publicationCheckedItems[item.id]) {
        delete this.publicationCheckedItems[item.id];
      }

      if (!Object.keys(this.publicationCheckedItems).length) {
        this.showPublicationDetails.show = false;
      }
    }
    this.isAllReSelected = this.publications.every((item) => this.publicationCheckedItems[item.id]);
  }

  processPublicationDelete() {
    this.modalService.dismissAll();
    let publication_ids = [];

    if (this.deleteSingleItem) {
      publication_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.publicationCheckedItems) {
        publication_ids.push(i);
      }
    }

    this.publicationService.removePublication(this.loggedInUser['login_key'], publication_ids).subscribe(data => {
      if (data.status) {
        this.publicationCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Publication' + (publication_ids.length > 1 ? 's' : '') + ' removed successfully');
        this.loadPublications(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  getTotalSelectedPublications() {
    return Object.keys(this.publicationCheckedItems).length;
  }

  onDeleteMultiplePublications() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeletePublicationItemModal, { size : 'sm', centered: true });
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
    this.loadPublications(1);
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onPublicationOptions(event, item, check_position):boolean {
    if (this.publicationExpandOptions.id == item.id && (
        (!check_position && this.publicationExpandOptions.type == 'fixed') ||
        (check_position && this.publicationExpandOptions.type == 'float')
    )) {
      this.publicationExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else{
        this.publicationExpandOptions.id = item.id;
        if (check_position) {
          this.publicationExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.publicationExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.publicationExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        }
        else{
          this.publicationExpandOptions.type = 'fixed';
          this.publicationExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deletePublication(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeletePublicationItemModal, { size : 'sm', centered: true });
  }

  renamePublication(item) {
    this.renamePublicationData = item;
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
    this.renamePublicationData = {};
    this.publicationService.updatePublication(this.loggedInUser['login_key'], item.id, item.name, null, [], [], true).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Publication renamed successfully');
      }
      else {
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renamePublicationData = {};
  }

  onTabChange(type) {
    this.defaultListTab = type;
    this.loadPublications(1);
  }

  onDisplaySVG(svg) {
    return this.sanitizer.bypassSecurityTrustHtml(svg)
  }

  hasPublicationChecked(id):boolean {
    let is_checked = false;
    for (let i in this.publicationCheckedItems) {
      if (!is_checked && this.publicationCheckedItems[i].id == id) {
        is_checked = true;
      }
    }
    return is_checked;
  }

  onPublicationDetails() {
    let total_items_selected = Object.keys(this.publicationCheckedItems).length;
    if (!total_items_selected) {
      this.toastCtrl.info('Please select a publication first');
      return false;
    }

    this.showPublicationDetails.details = this.publicationCheckedItems[Object.keys(this.publicationCheckedItems)[0]];
    this.showPublicationDetails.show = true;
  }

  onCloseDetails() {
    this.showPublicationDetails.show = false;
  }

  generatePublicationURL(id) {
    return '/publications/' + (this.mode == 'manage' ? id + '/edit' : 'viewer/' + id);
  }
 
  embededView(item) {
  return  item.type === 'view' ? '/publications/viewer/' + item.publication_id + '/view/' + item.id : 
  '/publications/embeded/' + item.publication_id + '/diagram/' + item.id;
 }

  generatePublicationViewerUrl(item) {
    return  item.type === 'view' ? '/publications/viewer/' + item.publication_id + '/view/' + item.id : 
    '/publications/viewer/' + item.publication_id + '/diagram/' + item.id;
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.publications.forEach((item) => {
        this.publicationCheckedItems[item.id] = item
      });
    }
    else {
      this.publicationCheckedItems = {}
    }
  }

}
