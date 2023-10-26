import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../shared/EventService';
import { ModelService } from './model.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { HelperService } from '../shared/HelperService';
import { ModelManagerEventService} from './ModelManagerEventService';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})

export class ModelComponent implements OnInit {
  @ViewChild('createFolderModal') createFolderModal: NgbModal;
  @ViewChild('createModelModal') createModelModal: NgbModal;
  @ViewChild('deleteSelectedModelFolderModal') deleteSelectedModelFolderModal: NgbModal;
  @ViewChild('copyPasteModelFolderModal') copyPasteModelFolderModal: NgbModal;
  loggedInUser: any;
  globalViewMode: string;
  managerViewMode: string;
  modelFolderItems: any;
  currentPage: number;
  totalPages: number;
  showPagination: boolean;
  firstLoad: boolean;
  isAllSelected: boolean;
  isMainAllSelected: boolean;
  openFolders: any;
  selectedTreeModelIds: any;
  selectedTreeFolderIds: any;
  selectedTreeItems: any;
  modelFolderItemDetails: any;
  allowAddNewModel: boolean;
  allowAddNewFolder: boolean;
  folderViewFolderId: string;
  deleteCustomSelected: any;
  deleteCustomSelectedTotal: number;
  defaultSort: string;
  modelsLoading: boolean;
  modelIds: any;
  modelFolderCopyOptions: any;
  modelFolderPasteOptions: any;
  modelFolderRootContextOptions: any;
  modelBrowserSocket: any;
  showRootDropContainer: boolean;

  /**Folder Create*/
  managerFolderCreateForm: UntypedFormGroup;
  hasFolderCreateFormSubmitted: boolean;
  showAddFolderLoading: boolean;
  modelFolderCreateOptions: any;

  /**Model Create*/
  managerModelCreateForm: UntypedFormGroup;
  hasModelCreateFormSubmitted: boolean;
  showAddModelLoading: boolean;
  modelModelCreateOptions: any;
  availableMetamodels: any;
  availableOtherMetamodels: any;

  /**Drag & Drop*/
  dragDropOptions: any;

  /**Observables*/
  modelTreeCheckedSubscriber: any;
  modelManagerNewChildFolderSubscriber: any;
  modelManagerNewModelSubscriber: any;
  modelManagerChildDeleteSubscriber: any;
  modelManagerFolderViewFolderSubscriber: any;
  modelFolderDragDroppedSubscriber: any;
  modelFolderCopyOptionsSubscriber: any;
  modelFolderDragRootSubscriber: any;
  isAllReSelected: boolean = false;
  /**Breadcrumbs*/
  breadcrumbs: any;

  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.model_root_paste_container')) {
        this.modelFolderRootContextOptions.show = false;
    }
  }

  constructor(
      private router: Router,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private modelService: ModelService,
      private modelManagerEventService: ModelManagerEventService,
      private modalService: NgbModal,
      private location: Location,
      private helperService: HelperService
  ) {
    /**Tree Check Items*/
    this.modelTreeCheckedSubscriber = this.modelManagerEventService.getModelTreeCheckedObservable().subscribe(data => {
      if (!data.checked) {
        this.isAllReSelected = false;
      }
      let get_index
      switch (data.type) {
       case 'model':
          get_index = this.selectedTreeModelIds.indexOf(data.id);
          if (get_index == -1) {
            if (data.checked) {
              this.selectedTreeModelIds.push(data.id);
            }
          } else if(!data.open_models) {
            this.selectedTreeModelIds.splice(get_index, 1);
          }
        break;
        case 'folder':
          get_index = this.selectedTreeFolderIds.indexOf(data.id);
          if (get_index == -1) {
            if (data.checked) {
              this.selectedTreeFolderIds.push(data.id);
            }
          } else {
            this.selectedTreeFolderIds.splice(get_index, 1);
          }
        break;
        case 'uncheck_all':
          this.selectedTreeModelIds = [];
          this.selectedTreeFolderIds = [];
          this.selectedTreeItems = [];
        break;
      }

      /**Global Checks*/
      if (data.type != 'uncheck_all') {
        let has_found_index = null;
        for (let i in this.selectedTreeItems) {
          if (this.selectedTreeItems[i].id == data.id && this.selectedTreeItems[i].type == data.type) {
            has_found_index = i;
          }
        }

        if (has_found_index == null) {
          this.selectedTreeItems.push({ id: data.id, name: data.name, type: data.type});
        }
        else{
          this.selectedTreeItems.splice(has_found_index, 1);
        }
      }

      /**Add Model/Folder buttons*/
      let total_folder_items = this.selectedTreeFolderIds.length;
      let total_model_items = this.selectedTreeModelIds.length;
      if (this.managerViewMode == 'folder-view') {
        this.allowAddNewModel = true;
        this.allowAddNewFolder = true;
      }
      else{
        this.allowAddNewModel = !total_model_items && total_folder_items <= 1;
        this.allowAddNewFolder = !total_model_items;
      }

      if (data.open_models) {
        this.openSelectedModels();
      }
    });

    /**Child Folder Modal Create*/
    this.modelManagerNewChildFolderSubscriber = this.modelManagerEventService.getModelNewFolderObservable().subscribe(data => {
      this.onOpenNewFolderModal(data);
    })

    /**Child Model Modal Create*/
    this.modelManagerNewModelSubscriber = this.modelManagerEventService.getModelFolderNewModelObservable().subscribe(data => {
      this.onOpenNewModelModal(data);
    });

    /**Child Item Delete*/
    this.modelManagerChildDeleteSubscriber = this.modelManagerEventService.getModelItemDeletedObservable().subscribe(item => {
      this.onProcessDeleteItems([item]);
    });

    /**Breadcrumbs*/
    this.modelManagerFolderViewFolderSubscriber = this.modelManagerEventService.getModelFolderViewSelectedFolderObservable().subscribe(data => {
      this.folderViewFolderId = data.id;
      this.breadcrumbs = data.breadcrumbs;
    });

    /**Drag & Drop*/
    this.modelFolderDragDroppedSubscriber = this.modelManagerEventService.getModelFolderDragDroppedObservable().subscribe(data => {
      this.dragDropOptions = data;
    });

    /**Copy Model & Folder*/
    this.modelFolderCopyOptionsSubscriber = this.modelManagerEventService.getModelFolderCopyOptionsObservable().subscribe(data => {
      if (data.action == 'copy') {
        this.modelFolderCopyOptions = data;
        this.modelFolderPasteOptions = {};
        this.toastCtrl.success('Successfully copied to clipboard');
      }
      else{
        this.modelFolderPasteOptions = data;
        this.onProcessPaste();
      }
    });

    /**Drop Root*/
    this.modelFolderDragRootSubscriber = this.modelManagerEventService.getModelFolderDragRootObservable().subscribe(show => {
      this.showRootDropContainer = show;
    });
  }

  ngOnInit(): void {
    /**Initialize*/
    this.globalViewMode = 'manager';
    if (!this.firstLoad) {
      this.managerViewMode = 'tree-view';
    }

    this.modelFolderItems = [];
    this.openFolders = [];
    this.currentPage = 1;
    this.isAllSelected = false;
    this.isMainAllSelected = false;
    this.selectedTreeModelIds = [];
    this.selectedTreeFolderIds = [];
    this.selectedTreeItems = [];
    this.breadcrumbs = [];
    this.modelFolderItemDetails = [];
    this.allowAddNewModel = true;
    this.allowAddNewFolder = true;
    this.folderViewFolderId = '';
    this.defaultSort = 'name_asc';
    this.modelFolderCopyOptions = {};
    this.modelFolderRootContextOptions = {
      show: false
    };
    this.showRootDropContainer = false;

    /**Folder Create default root*/
    // this.managerFolderCreateForm = new FormGroup({});
    this.hasFolderCreateFormSubmitted = false;
    this.modelFolderCreateOptions = { id : '0', type : '' };

    /**Model Create default root*/
    this.managerModelCreateForm = new UntypedFormGroup({});
    this.hasModelCreateFormSubmitted = false;
    this.modelModelCreateOptions = { id : '0', type : '' };
    this.availableMetamodels = [];

    /**Drag & Drop*/
    this.dragDropOptions = {};

    this.eventsService.onPageChange({ section : 'models', page : 'models' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.modelsLoading = false;
    this.modelIds = [];
    this.loadModels(this.currentPage,false);

    this.modelBrowserSocket = io(environment.editor_node_app_url,{
      query: {
        model_viewer: 'model_view_page',
        from: 'PlutoUI'
      }
    });

    /**On delete items*/
    this.modelBrowserSocket.on('model_manager_delete_items',(resp) => {
      let data = resp.data;
      let items = resp.items;
      let custom_delete = resp.custom_delete;

      let pages_data = [];
      let root_level_pages = this.totalPages;
      for (let i in data.page_items) {
        /**Check for root level first*/
        if (!data.page_items[i].id) {
          root_level_pages = data.page_items[i].pages;
        }

        pages_data[data.page_items[i].id + '_' + data.page_items[i].type] = data.page_items[i].pages;
      }

      if (data.page_items.length) {

        /**Delete old items*/
        let delete_pages_data = [];
        for (let i in items) {
          delete_pages_data.push(items[i].id + '_' + items[i].type);
        }

        /**Remove selected items and update pages*/
        for (let i in delete_pages_data) {
          this.modelFolderItems = this.updateAndDeleteManagerTreeItems(this.modelFolderItems, delete_pages_data[i], pages_data);
        }

        /**Emit to change already generated pages*/
        this.modelManagerEventService.onModelFolderDeleted({ parent_data: pages_data, deleted_items: items });

        /**Update root expanded items*/
        if (root_level_pages !== this.totalPages) {
          let expanded_items = [];
          for (let i in this.modelFolderItems) {
            if (this.modelFolderItems[i].expand) {
              expanded_items.push(this.modelFolderItems[i].id + '_' + this.modelFolderItems[i].type);
            }
          }

          this.totalPages = root_level_pages;
          this.currentPage = (this.currentPage <= this.totalPages) ? this.currentPage : 1;
        }
      }
      else{
        this.currentPage = 1;
      }

      // this.loadModels(this.currentPage, true);

      if (custom_delete) {
        for (let i in items) {
          /**Clean Tree Items*/
          for (let t in this.selectedTreeItems) {
            if (this.selectedTreeItems[t].id == items[i].id) {
              this.selectedTreeItems.splice(t,1);
            }
          }

          /**Clean Folder Items*/
          for (let t in this.selectedTreeFolderIds) {
            if (this.selectedTreeFolderIds[t] == items[i].id) {
              this.selectedTreeFolderIds.splice(t,1);
            }
          }

          /**Clean Model Items*/
          for (let t in this.selectedTreeModelIds) {
            if (this.selectedTreeModelIds[t] == items[i].id) {
              this.selectedTreeModelIds.splice(t,1);
            }
          }
        }
      }
      else{
        this.selectedTreeItems = [];
        this.selectedTreeFolderIds = [];
        this.selectedTreeModelIds = [];

        this.modelManagerEventService.onModelFolderDeleted({ parent_data: pages_data, deleted_items: items });
      }

      for (let i=0; i<items.length; i++) {
        if (items[i].type == 'model') {
          this.modelBrowserSocket.emit('model_view_model_deleted',items[i].id);
        }
      }
    })

    /**On Add Item*/
    this.modelBrowserSocket.on('model_manager_item_create',(resp) => {
      let data = resp.data;
      let options = resp.options;
      if (options.id) {
        /**Update Pagination and reload parent*/
        this.modelFolderItems = this.updateItemPagination(this.modelFolderItems, options, data.pages);
        options.pages = data.pages;
        this.modelManagerEventService.onModelManagerReloadChild(options);
      }
      else{
        /**If root level*/
        this.totalPages = data.pages;
        if (this.currentPage == 1) {
          this.loadModels(1, true);
        }
        else{
          this.loadModels(this.currentPage, true);
        }
      }
    });

    // /**On Rename Item*/
    // this.modelBrowserSocket.on('model_manager_item_rename',data => {
    //   this.modelManagerEventService.onChildItemRename(data);
    // });
  }

  ngOnDestroy() {
    if (this.modelTreeCheckedSubscriber) {
      this.modelTreeCheckedSubscriber.unsubscribe();
    }

    if (this.modelManagerNewChildFolderSubscriber) {
      this.modelManagerNewChildFolderSubscriber.unsubscribe();
    }

    if (this.modelManagerNewModelSubscriber) {
      this.modelManagerNewModelSubscriber.unsubscribe();
    }

    if (this.modelManagerChildDeleteSubscriber) {
      this.modelManagerChildDeleteSubscriber.unsubscribe();
    }

    if (this.modelManagerFolderViewFolderSubscriber) {
      this.modelManagerFolderViewFolderSubscriber.unsubscribe();
    }

    if (this.modelFolderDragDroppedSubscriber) {
      this.modelFolderDragDroppedSubscriber.unsubscribe();
    }

    if (this.modelFolderCopyOptionsSubscriber) {
      this.modelFolderCopyOptionsSubscriber.unsubscribe();
    }

    if (this.modelFolderDragRootSubscriber) {
      this.modelFolderDragRootSubscriber.unsubscribe();
    }

    if (this.modelBrowserSocket) {
      this.modelBrowserSocket.disconnect();
    }
  }

  updateAndDeleteManagerTreeItems(model_manager_tree_data, delete_item, updated_pages) {
    for (let i in model_manager_tree_data) {
      let tree_key = model_manager_tree_data[i].id + '_' + model_manager_tree_data[i].type;
      if (delete_item == tree_key) {
        model_manager_tree_data.splice(i,1);
      }
    }

    return model_manager_tree_data;
  }

  loadModels(page, check_matches = true):boolean {
    if (page == 0 || (page > this.totalPages && this.totalPages !== 0)) {
      return false;
    }
    this.modelsLoading = true;
    this.modelService.getFolderModels(this.loggedInUser['login_key'],{ id: null, type: null },null,this.defaultSort,page).subscribe(data => {
      this.modelsLoading = false;
      this.isAllSelected = false;
      this.firstLoad = true;
      this.currentPage = page;

      if (page == 1 && !check_matches) {
        this.modelIds = [];
        this.modelFolderItems = [];
      }

      if (Object.keys(this.modelFolderItems).length) {
        if (!check_matches) {
          this.modelFolderItems = this.modelFolderItems.concat(data.items);
        }
      }
      else{
        this.modelFolderItems = data.items;
      }

      for (let i in data.items) {
        if (this.modelIds.indexOf(data.items[i].id) == -1) {
          this.modelIds.push(data.items[i].id);
          if (check_matches) {
            this.modelFolderItems = this.modelFolderItems.concat(data.items[i]);
          }
        }
      }

      if (check_matches) {
        this.modelFolderItems = this.modelService.sortFolderModelsDynamically(this.defaultSort, this.modelFolderItems);
      }

      if (!this.modelFolderItems.length && this.currentPage > 1) {
        this.currentPage--;
        this.loadModels(this.currentPage);
        return;
      }

      this.totalPages = data.pages ? data.pages : 1;

      // this.totalPages = data.total_pages;

      this.showPagination = this.totalPages > this.currentPage;
      this.breadcrumbs = data.breadcrumbs;

      if (check_matches) {
        // window.scroll(0,0);
      }

    })

    return false;
  }

  onDeleteMultipleModels():boolean {
    this.deleteCustomSelected = this.selectedTreeItems;
    for (let i in this.deleteCustomSelected) {
      this.deleteCustomSelected[i].checked = true;
    }

    this.deleteCustomSelectedTotal = this.deleteCustomSelected.length;
    this.modalService.open(this.deleteSelectedModelFolderModal, { size: 'sm', centered: true });

    return false;
  }

  onCustomDeleteItemChanged(event,item) {
    item.checked = event.target.checked;
    let total_checked = 0;
    for (let i in this.deleteCustomSelected) {
      if (this.deleteCustomSelected[i].checked) {
        total_checked++;
      }
    }

    this.deleteCustomSelectedTotal = total_checked;
  }

  onCustomDeleteProcess():boolean {
    let custom_delete_items = [];
    for (let i in this.deleteCustomSelected) {
      if (this.deleteCustomSelected[i].checked) {
        custom_delete_items.push({ id: this.deleteCustomSelected[i].id, type: this.deleteCustomSelected[i].type });
        if (this.deleteCustomSelected[i].type == 'model') {
          this.modelBrowserSocket.emit('model_view_model_deleted',this.deleteCustomSelected[i].id);
        }
      }
    }

    this.modalService.dismissAll();
    this.onProcessDeleteItems(custom_delete_items, true);

    /**When whole selection deleted*/
    if (this.deleteCustomSelected.length == this.deleteCustomSelectedTotal) {
      this.allowAddNewModel = this.allowAddNewFolder = true;
    }

    return false;
  }

  onProcessDeleteItems(items, custom_delete = false) {
    /**Remove extra items from request as API was crashing*/
    let delete_items = items;
    if (!custom_delete) {
      delete_items = [
        {
          id: items[0].id,
          type: items[0].type
        }
      ]
    }

    this.modelService.removeModelItems(this.loggedInUser['login_key'], delete_items).subscribe(data => {
      if (data.status) {
        this.toastCtrl.success('Items removed successfully');
        this.modelBrowserSocket.emit('model_manager_delete_items',{ data: data, items: items, custom_delete: custom_delete });
      }
      else{
        this.toastCtrl.error(data.error);
      }
    })
  }

  openSelectedModels() {
    let selected_items = [];
    for (let i in this.selectedTreeItems) {
      selected_items.push(this.selectedTreeItems[i].id);
    }
    this.router.navigateByUrl('/model/' + selected_items.join('&') + '/' + this.helperService.generateUniqueNum(3) + '/view');
    // this.location.replaceState('/model/' + selected_items.join('&') + '/' + this.helperService.generateUniqueNum(3) + '/view');
    this.globalViewMode = 'editor';
  }

  onOpenNewFolderModal(item) {
    if (item) {
      this.modelFolderCreateOptions = { id : item.id, type : item.type };
    }
    else{
        if (this.selectedTreeFolderIds.length) {
          this.modelFolderCreateOptions = { id : this.selectedTreeFolderIds['0'].id, type : 'folder' };
        }
        else if (this.selectedTreeModelIds.length){
          this.modelFolderCreateOptions = { id : this.selectedTreeModelIds['0'].id, type : 'folder' };
        }
    }

    this.hasFolderCreateFormSubmitted = false;

    /**Initialize Form*/
    this.managerFolderCreateForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });
    this.modalService.open(this.createFolderModal, { size : 'sm', centered: true });
  }

  onOpenNewModelModal(item) {
    /**When creating model for any checked folder*/
    if (this.selectedTreeFolderIds.length) {
      this.modelModelCreateOptions = { id : this.selectedTreeFolderIds['0'], type : 'model' };
    }
    else{
      /**When creating model from sub folder*/
      if (item) {
        this.modelModelCreateOptions = { id : item.id, type : 'model' };
      }
      else{
        this.modelModelCreateOptions = { id : 0, type : 'model' };
      }
    }

    this.hasModelCreateFormSubmitted = false;

    /**Initialize Form*/
    this.managerModelCreateForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      metamodel_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      other_metamodel_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: []
      }),
    });

    this.modalService.open(this.createModelModal, { size : 'sm', centered: true });

    // if (this.defaultObjectCreateData.object_type_id) {
    //   this.availableObjectTypes = this.defaultObjectCreateData.object_types;
    //   this.objectCreateForm.controls.object_type_id.patchValue(this.defaultObjectCreateData.object_type_id);
    // }
    // else{
      this.availableMetamodels = [{ metamodel_id : '', name: 'Select' }];
      this.availableOtherMetamodels = [{ other_metamodel_id : '', name: 'Select' }];
      this.onMetamodelSearch({ term: '' });
      this.onOtherMetamodelSearch({ term: '' });
  }

  onMetamodelSearch(event) {
    this.modelService.metamodelSearch(this.loggedInUser['login_key'], event.term, 1,true).subscribe(data => {
      this.availableMetamodels = data.metamodels;
      let newavailableMetamodels=[]
      for(const obj of this.availableMetamodels){
        if(obj.defaultFlag && obj.default_primary){
          newavailableMetamodels.push(obj.metamodel_id)
        }
      }
      this.managerModelCreateForm.get('metamodel_id').patchValue(newavailableMetamodels)
    });
  }

  onOtherMetamodelSearch(event) {
    this.modelService.metamodelSearch(this.loggedInUser['login_key'], event.term, 1,false).subscribe(data => {
      let otherMetaModels = [];
      for (let model of data.metamodels){
        otherMetaModels.push({
          defaultFlag: model.defaultFlag,
          name: model.name,
          other_metamodel_id: model.metamodel_id,
          default_primary:model.default_primary
        })
      }
      this.availableOtherMetamodels = otherMetaModels;
      let newavailableOtherMetamodels=[]
      for(const obj of this.availableOtherMetamodels){
        if(obj.defaultFlag && obj.default_primary===false){
          newavailableOtherMetamodels.push(obj.other_metamodel_id)
        }
      }
      this.managerModelCreateForm.get('other_metamodel_id').patchValue(newavailableOtherMetamodels)
    });
  }

  onManagerModelFolderSave(options) {
    options.type = 'folder';
    if (this.managerFolderCreateForm.valid) {
      this.showAddFolderLoading = true;
      if (this.managerViewMode == 'folder-view') {
          options.id = (this.selectedTreeFolderIds.length == 1) ? this.selectedTreeFolderIds['0'] : this.folderViewFolderId;
      }
      else{
        options.id = (this.modelFolderCreateOptions && this.modelFolderCreateOptions.id) ? this.modelFolderCreateOptions.id : (this.selectedTreeFolderIds.length) ? this.selectedTreeFolderIds['0'] : 0;
      }

      this.modelService.addFolder(this.loggedInUser['login_key'],this.managerFolderCreateForm.value.name,options).subscribe(data => {
        this.showAddFolderLoading = false;
        if (data.status) {
          this.toastCtrl.success('New folder created successfully');
          this.modalService.dismissAll();
          this.modelFolderCreateOptions = { id : '0', type : '' };
          this.modelBrowserSocket.emit('model_manager_item_create',{ data: data, options: options });
        }
        else {
          this.toastCtrl.info(data.error);
        }
      });
    }
  }

  onManagerModelSave(options) {
    options.type = 'model';
    this.hasModelCreateFormSubmitted = true;
    if (this.managerModelCreateForm.valid) {
      this.showAddModelLoading = true;

      // if (this.managerViewMode == 'folder-view') {
      //   options.id = (this.selectedTreeFolderIds.length == 1) ? this.selectedTreeFolderIds['0'] : this.folderViewFolderId;
      // }

      this.modelService.addModel(this.loggedInUser['login_key'], this.managerModelCreateForm.value.name, options, this.managerModelCreateForm.value.metamodel_id,
        this.managerModelCreateForm.value.other_metamodel_id
      ).subscribe(data => {
        this.showAddModelLoading = false;
        if (data.status) {
          this.toastCtrl.success('New model created successfully');
          this.modalService.dismissAll();

          this.modelBrowserSocket.emit('model_manager_item_create', { data: data, options: options });
        }
        else {
          this.toastCtrl.info(data.error);
        }
      });
    }
  }

  updateItemPagination(model_manager_tree_data, item, pages) {
    for (let i in model_manager_tree_data) {
      if (model_manager_tree_data[i].id == item.id && model_manager_tree_data[i].type == item.type) {
        model_manager_tree_data[i].pages = pages;
      }
      else if (model_manager_tree_data[i].items) {
        this.updateItemPagination(model_manager_tree_data[i].items, item, pages);
      }
    }

    return model_manager_tree_data;
  }

  onViewModeChange(type):boolean {
    this.managerViewMode = type;
    this.folderViewFolderId = (this.managerViewMode == 'folder-view') ? '0' : '';
    this.ngOnInit();
    return false;
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  /**Model Folder Details Box Actions*/
  onModelFolderDetailsRename() {
    // console.log(this.modelFolderItemDetails);
  }

  onManagerCloseWindow(event) {
    // if (this.managerViewMode == 'folder-view') {
    //   console.log(this.folderViewFolderId);
    // }
    if (event == 'close') {
      this.location.replaceState('/model');
      this.globalViewMode = 'manager';
    }
  }

  drop(event) {
    this.showRootDropContainer = false;
    if (this.dragDropOptions && this.dragDropOptions.id && this.dragDropOptions.targetId) {
      if (!this.dragDropOptions.model_to_model) {
        this.dragDropOptions.targetId = this.dragDropOptions.targetId.replace('main_','');
        // this.dragDropOptions.targetId = this.dragDropOptions.targetId == '0' ? '' : this.dragDropOptions.targetId;
        /**If not in same directory*/
        if (this.dragDropOptions.from_parent_id !== this.dragDropOptions.targetId) {

          this.modelService.updateDragDropStructure(this.loggedInUser['login_key'], this.dragDropOptions.id, this.dragDropOptions.targetId).subscribe(data => {
            if (data.status) {
              /**Moved From*/
              if (this.dragDropOptions.from_parent_id == '0') {
                for (let i in this.modelFolderItems) {
                  if (this.modelFolderItems[i].id == this.dragDropOptions.id) {
                    this.modelFolderItems.splice(i,1);
                  }
                }

                /**Remove from models*/
                let model_ids_index = this.modelIds.indexOf(this.dragDropOptions.id);
                if (model_ids_index !== -1) {
                  this.modelIds.splice(model_ids_index,1);
                }
              }

              // if (this.dragDropOptions.targetId == 0 || this.dragDropOptions.from_parent_id == 0) {
              //   for (let i=1; i<=this.currentPage; i++) {
              //     this.loadModels(i, true);
              //   }
              // }

              this.modelManagerEventService.onModelFolderChildDragDrop(this.dragDropOptions);
            }
          });
        }
      }
    }

    this.modelService.clearDragDropClasses();
  }

  sortBy(type) {
    switch (type) {
      case 'name':
        this.defaultSort = (this.defaultSort == 'name_asc') ? 'name_desc' : 'name_asc';
      break;
      case 'created':
        this.defaultSort = (this.defaultSort == 'created_asc') ? 'created_desc' : 'created_asc';
      break;
      case 'updated':
        this.defaultSort = (this.defaultSort == 'updated_asc') ? 'updated_desc' : 'updated_asc';
      break;
      case 'created_by':
        this.defaultSort = (this.defaultSort == 'created_by_asc') ? 'created_by_desc' : 'created_by_asc';
      break;
      case 'last_update_by':
        this.defaultSort = (this.defaultSort == 'last_update_by_asc') ? 'last_update_by_desc' : 'last_update_by_asc';
      break;
    }

    this.loadModels(1, false);
  }

  onModelManagerRootOptions(event):boolean {
    if (Object.keys(this.modelFolderCopyOptions).length) {
      this.modelFolderRootContextOptions = {
        show: true,
        left: event.clientX - 150
      }
    }
    else{
      this.toastCtrl.info('No copied items found in clipboard');
    }

    return false;
  }

  onRootPasteProcess() {
    this.modelFolderPasteOptions = {
      name: 'Model Manager',
      id: 0
    }

    this.modelFolderRootContextOptions.show = false;
    this.onProcessPaste();
  }

  onProcessPaste() {
    this.modalService.open(this.copyPasteModelFolderModal, {
      size: 'xl',
      centered: true,
      backdrop : 'static',
      keyboard : false
    });
    let copy_items = [{
      id: this.modelFolderCopyOptions.id,
      type: this.modelFolderCopyOptions.type
    }];
    this.modelService.modelFolderCopyPaste(this.loggedInUser['login_key'], copy_items, this.modelFolderPasteOptions.id, this.modelFolderPasteOptions.type).subscribe(data => {
      this.modalService.dismissAll();
      if (data.status) {
        let options = { id: this.modelFolderPasteOptions.id, type: this.modelFolderPasteOptions.type, pages: data.pages };
        this.modelFolderItems = this.updateItemPagination(this.modelFolderItems, options, data.pages);
        this.modelManagerEventService.onModelManagerReloadChild(options);

        /**Clear selection*/
        this.modelFolderCopyOptions = {};
        this.modelFolderPasteOptions = {};

        this.toastCtrl.success('Successfully pasted');
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }
  
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (this.isAllReSelected == true) {
      for (let i in this.modelFolderItems) {
        const existingItems = this.selectedTreeItems.filter((it: any) => it.id == this.modelFolderItems[i].id)
        if (existingItems.length == 0) {
          this.selectedTreeItems.push({
            id: this.modelFolderItems[i].id,
            name: this.modelFolderItems[i].name,
            type: this.modelFolderItems[i].type
          })
        }
      }
    } else {
      this.selectedTreeItems = []
      this.selectedTreeModelIds = []
    }
    this.modelManagerEventService.reSelectedItems(this.isAllReSelected)
  }
}
