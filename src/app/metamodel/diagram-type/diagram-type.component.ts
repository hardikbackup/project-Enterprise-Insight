import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DiagramTypeService } from "./diagram-type.service";
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { HelperService } from '../../shared/HelperService';

@Component({
  selector: 'app-diagram-type',
  templateUrl: './diagram-type.component.html',
  styleUrls: ['./diagram-type.component.css']
})
export class DiagramTypeComponent implements OnInit {
 @ViewChild('confirmDeleteDiagramTypeItemModal') confirmDeleteDiagramTypeItemModal: NgbModal;
  form: UntypedFormGroup;
  hasFormSubmitted: boolean;
  isLoading: boolean;
  loggedInUser: any;
  diagram_types: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  diagramTypeCheckedItems : any;
  defaultSort: string;
  isLoadingDiagramTypes: boolean;
  diagramTypeIds: any;
  diagramTypeExpandOptions: any;
  renameDiagramTypeData: any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  modelBrowserSocket: any;
  isAllReSelected: boolean = false;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.diagramTypeExpandOptions = { id: null, right: null };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameDiagramTypeData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private diagramTypeService: DiagramTypeService,
      private modalService: NgbModal,
      private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.diagram_types = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.eventsService.onPageChange({ section : 'metamodel', page : 'diagram-types' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.isLoadingDiagramTypes = false;
    this.diagramTypeIds = [];
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameDiagramTypeData = {};
    this.diagramTypeExpandOptions = { id: null, right: null };
    this.loadDiagramTypes(this.currentPage);

    /**Build Form*/
    this.hasFormSubmitted = false;
    this.isLoading = false;
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });

    this.modelBrowserSocket = io(environment.editor_node_app_url,{
      query: {
        model_viewer: 'model_view_page',
        from: 'PlutoUI'
      }
    });
  }

  loadDiagramTypes(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.diagramTypeCheckedItems = {};
    this.isLoadingDiagramTypes = true;
    this.diagramTypeService.getDiagramTypes(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingDiagramTypes = false;
      this.isAllSelected = false;
      this.isAllReSelected = false

      /**Append new items*/
      if (page == 1) {
        this.diagramTypeIds = [];
        this.diagram_types = [];
      }

      for (let i in data.diagram_types) {
        if (this.diagramTypeIds.indexOf(data.diagram_types[i].id) == -1) {
          this.diagram_types = this.diagram_types.concat(data.diagram_types[i]);
          this.diagramTypeIds.push(data.diagram_types[i].id);
        }
      }

      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.diagram_types.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadDiagramTypes(this.currentPage);
        return;
      }
    })
  }

  checkDiagramTypeItem(event, item) {
    if (event.target.checked) {
      if (!this.diagramTypeCheckedItems[item.id]) {
        this.diagramTypeCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.diagramTypeCheckedItems[item.id]) {
        delete this.diagramTypeCheckedItems[item.id];}
    }
    this.isAllReSelected = this.diagram_types.every((item)=>this.diagramTypeCheckedItems[item.id]);
  }

  processDiagramTypeDelete() {
    this.modalService.dismissAll();
    let diagram_type_ids = [];
    if (this.deleteSingleItem) {
      diagram_type_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.diagramTypeCheckedItems) {
        diagram_type_ids.push(i);
      }
    }

    this.diagramTypeService.removeDiagramType(this.loggedInUser['login_key'], diagram_type_ids).subscribe(data => {
      if (data.status) {
        this.diagramTypeCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Diagram type removed successfully');

        /**Emit change*/
        this.modelBrowserSocket.emit('pluto_diagram_type_removed',diagram_type_ids);

        /**Load new data set*/
        this.loadDiagramTypes(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    })
  }

  getTotalSelectedDiagramTypes() {
    return Object.keys(this.diagramTypeCheckedItems).length;
  }

  onDeleteMultipleDiagramTypes() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteDiagramTypeItemModal, { size : 'sm', centered: true });
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
    this.loadDiagramTypes(1);
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  onDiagramTypeAdd():boolean {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      if (!this.form.value.name.toString().trim().length) {
        this.toastCtrl.info('Name is required');
        return false;
      }

      this.isLoading = true;
      return;
    }
  }

  onDiagramTypeOptions(event, item, check_position):boolean {
    if (this.diagramTypeExpandOptions.id == item.id && (
        (!check_position && this.diagramTypeExpandOptions.type == 'fixed') ||
        (check_position && this.diagramTypeExpandOptions.type == 'float')
    )) {
      this.diagramTypeExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        this.diagramTypeExpandOptions.id = item.id;
        if (check_position) {
          this.diagramTypeExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.diagramTypeExpandOptions.right = window.innerWidth - event.clientX - 60;
          }
          else{
            this.diagramTypeExpandOptions.right = window.innerWidth - event.clientX - 200;
          }

          // this.diagramTypeExpandOptions.right = window.innerWidth - event.clientX - 200;
        } else {
          this.diagramTypeExpandOptions.type = 'fixed';
          this.diagramTypeExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteDiagramType(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteDiagramTypeItemModal, { size : 'sm', centered: true });
  }

  renameDiagramType(item) {
    this.renameDiagramTypeData = item;
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
    this.renameDiagramTypeData = {};
    this.diagramTypeService.updateDiagramType(this.loggedInUser['login_key'], item.id, item.name).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Diagram type renamed successfully');
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onCancelRename() {
    this.renameDiagramTypeData = {};
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.diagram_types.forEach((item) => {
        this.diagramTypeCheckedItems[item.id] = item
      });
    }
    else {
      this.diagramTypeCheckedItems = {}
    }
  }
}
