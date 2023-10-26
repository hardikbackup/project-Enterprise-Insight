import {Component, Input, OnInit, ViewChild, Inject, HostListener, EventEmitter, Output} from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ModelService } from '../model.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT } from "@angular/common";
import { HelperService } from '../../shared/HelperService';
import { ModelManagerEventService } from '../ModelManagerEventService';

@Component({
  selector: 'app-model-manager-tree',
  templateUrl: './model-manager-tree.component.html',
  styleUrls: ['./model-manager-tree.component.css']
})
export class ModelManagerTreeComponent implements OnInit {
  @Output() parentUncheckEvent = new EventEmitter<any>();
  @ViewChild('updateFolderModal') updateFolderModal: NgbModal;
  @ViewChild('confirmDeleteItemModal') confirmDeleteItemModal: NgbModal;
  @ViewChild('editMetamodelsModal') editMetamodelsModal: NgbModal;
  @ViewChild('permissionsModal') permissionsModal: NgbModal;
  @Input() defaultSort: string;
  @Input() viewMode: string;
  @Input() items: any;
  @Input() level: number;
  @Input() parentId: any;
  @Input() parentType: string;
  @Input() parentPages: number;
  @Input() loggedInUser: any;
  @Input() showFolderCheckboxes: boolean;
  @Input() showActionMenu: boolean;
  @Input() showSystemFields: boolean;
  @Input() modelBrowserSocket: any;
  @Input() allowExpandModels: boolean;
  @Input() publicationModelTree: boolean;
  @Input() publicationId: string = null;
  @Input() modelFolderCopyOptions: any;
  @Input() checkedModelItems: any;
  @Input() modalPopup: boolean;
  @Input() publicationView: boolean;
  isAllReSelected:boolean=false
  currentPage: number;
  openFolders: any;
  isAllSelected: boolean
  folderCheckedItems: any;
  showFolderMenuOptions: any;
  itemSelectTimer: any;
  preventSimpleClick: any;
  updateFolderModelForm: UntypedFormGroup;
  hasFolderUpdateFormSubmitted: any;
  showUpdateFolderModelLoading: boolean;
  updateFolderModelObj: any;
  showOptions: boolean;
  deleteItem: any;
  dropActionTodo: any;
  metamodelForm: UntypedFormGroup;
  hasMetamodelFormSubmitted: boolean;
  availableMetamodels: any;
  availableOtherMetamodels: any;
  showMetamodelLoading: boolean;
  metamodelModelId: string;
  modelExpandOptions: any;
  renameModelData: any;
  organizeModel: any;
  @ViewChild('organizeProcessingModal') organizeProcessingModal: NgbModal;

  /**Permissions*/
  permissions: any;
  isPermissionsLoading: boolean;
  permissionsCurrentPage: number;
  permissionsMaxPage: number;
  selectedPermissionOptions: any;
  admin: boolean;

  /**Subscribers*/
  modelManagerReloadChildSubscriber: any;
  modelManagerDeletedSubscriber: any;
  modelManagerFolderDragDropSubscriber: any;
  modelManagerFolderExpandOptionsSubscriber: any;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.modelExpandOptions = { id: null, right: null };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameModelData = {};
    }
  }

  constructor(
      private modelManagerEventService: ModelManagerEventService,
      private authService: AuthService,
      private modelService: ModelService,
      private modalService: NgbModal,
      private toastCtrl: ToastrService,
      private helperService: HelperService,
      @Inject(DOCUMENT) private document: Document
  ) {
  }

  ngOnInit(): void {
    this.admin = this.authService.isUserAdmin();
    this.currentPage = 1;
    this.openFolders = [];
    this.isAllSelected = false;
    this.folderCheckedItems = [];
    this.showFolderMenuOptions = [];
    this.hasFolderUpdateFormSubmitted = false;
    this.showUpdateFolderModelLoading = false;
    this.showOptions = false;
    this.dropActionTodo = null;
    this.renameModelData = {};
    this.modelExpandOptions = { id: null, right: null };
        this.modelBrowserSocket.on('model_manager_item_rename',(data) => {     
      if (this.parentId == data.parent_id) {
        for (let i=0; i<this.items.length; i++) {
          if (this.items[i].id == data.id) {
            this.items[i].name = data.name;
          }
        }
      }
    });

    /**Tree Expanded Items*/
    this.modelManagerReloadChildSubscriber = this.modelManagerEventService.getModelManagerReloadChildObservable().subscribe(data => {
      /**Reload Child Data*/
      if (data.id == this.parentId) {
        if (this.parentPages !== data.pages) {
          this.parentPages = data.pages;
        }
        this.currentPage = this.currentPage > this.parentPages ? 1 : this.currentPage;

        for (let i=1; i<=this.currentPage; i++) {
          this.loadModelItems(i);
        }
      }
    });

    /**Update pages for deleted items*/
    this.modelManagerDeletedSubscriber = this.modelManagerEventService.getModelFolderDeletedObservable().subscribe(data => {
      if (this.parentId !== 0) {
        let current_item = this.parentId + '_' + this.parentType;
        if (data.parent_data.hasOwnProperty(current_item) && data[current_item] !== this.parentPages) {
          for (let i in data.deleted_items) {
            for (let t in this.items) {
              if (this.items[t].id == data.deleted_items[i].id) {
                this.items.splice(t,1);
              }
            }
          }

          this.parentPages = data[current_item];
          this.currentPage = (this.currentPage > this.parentPages) ? this.parentPages : this.currentPage;
        }
        this.loadModelItems(this.currentPage);
      }
    });


    /**Drag & Drop Subscriber*/
    this.modelManagerFolderDragDropSubscriber = this.modelManagerEventService.getModelFolderChildDragDropObservable().subscribe(data => {
      let check_parent_items = false;
      if (data.from_parent_id == this.parentId) {
        for (let i in this.items) {
          if (this.items[i].id == data.id) {
            this.items.splice(i,1);
          }
        }
      }

      /**Make new load request and append if new ones*/
      if (data.targetId == this.parentId){
        console.log('item parent found for ',data.targetId,this.parentType);
        this.loadModelItems(this.currentPage);
      }


    });

    this.modelManagerFolderExpandOptionsSubscriber = this.modelManagerEventService.getModelFolderExpandOptionsObservable().subscribe(data => {
      if (this.parentId !== data) {
        this.modelExpandOptions = { id: null, right: null };
      }
    });

    this.modelManagerEventService.getAllReSelectedItemsObservable().subscribe(data => {
      this.isAllReSelected = data;
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].checked = data
      }
    })
  }

  ngOnDestroy() {
    if (this.modelManagerReloadChildSubscriber) {
      this.modelManagerReloadChildSubscriber.unsubscribe();
    }

    if (this.modelManagerDeletedSubscriber) {
      this.modelManagerDeletedSubscriber.unsubscribe();
    }

    if (this.modelManagerFolderDragDropSubscriber) {
      this.modelManagerFolderDragDropSubscriber.unsubscribe();
    }

    if (this.modelManagerFolderExpandOptionsSubscriber) {
      this.modelManagerFolderExpandOptionsSubscriber.unsubscribe();
    }
  }

  /**Create Folder for models and folders*/
  onFolderMenuToggle(item):boolean {
    this.showFolderMenuOptions = [];
    return false;
  }

  loadModelItems(page) {
    this.showFolderMenuOptions = [];
    this.folderCheckedItems = [];
    // if (page < 1 || page > this.parentPages) {
    //   return false;
    // }
    this.currentPage = page;
    this.modelService.getFolderModels(this.loggedInUser['login_key'], {id: this.parentId, type: this.parentType}, null, this.defaultSort, page).subscribe(resp => {
      this.parentPages = resp.pages;
      if (resp.status) {
        this.parentPages = resp.pages;
        if (this.items && Object.keys(this.items).length) {
          let item_ids = [];
          for (let i in this.items) {
            item_ids.push(this.items[i].id);
          }

          for (let i in resp.items) {
            if (item_ids.indexOf(resp.items[i].id) == -1) {
              this.items = this.items.concat(resp.items[i]);
            }
          }

          this.items = this.modelService.sortFolderModelsDynamically(this.defaultSort, this.items);
        }
        else{
          this.items = resp.items;
          if (!this.items.length && this.currentPage > 1) {
            this.currentPage--;
            this.loadModelItems(this.currentPage);
          }
        }
      }
    });
  }

  onOpenModelDirectory(item) {
    item['expand'] = !item['expand'];
    this.showFolderMenuOptions = [];

    this.modelService.getFolderModels(this.loggedInUser['login_key'], { id: item.id, type: item.type }, this.publicationId, this.defaultSort, 1).subscribe(resp => {
      if (resp.status) {
        if (item.checked) {
          for (let i=0; i<resp.items.length; i++) {
            let parent_checked = this.checkedModelItems.filter(value => value.id == item.id && value.type == item.type);
            if (parent_checked.length) {
                for (let t=0; t<this.checkedModelItems.length; t++) {
                  let match_found = this.checkedModelItems.filter(value => value.id == resp.items[i].id && value.type == resp.items[i].type);
                  if (match_found.length) {
                    resp.items[i].checked = true;
                  }
                }
            }
            else{
              resp.items[i].checked = true;
            }
          }
        }
        item.items = resp.items;
      }
    });
  }

  onCheckModelTreeItem(event, item) {
    item.checked = event.target.checked;
    /**For Publication Model Tree */
    if (this.publicationModelTree) {
      item.parent_checked = item.checked;
      item = this.onItemChildParentChange(item, item.checked);
      if (!item.checked && this.parentId != 0) {
        this.parentUncheckEvent.emit(this.parentId);
      }
    }
    this.showFolderMenuOptions = [];
    this.modelManagerEventService.onModelTreeCheckedItem({ 'id' : item.id, parent_id: this.parentId, 'name' : item.name, 'type' : item.type, 'checked' : event.target.checked });
  }

  onItemChildParentChange(item, stage) {
    if (item.items) {
      for (let i=0; i<item.items.length; i++) {
        item.items[i].checked = stage;
        if (item.items[i].items && item.items[i].items.length) {
          this.onItemChildParentChange(item.items[i], stage);
        }
      }
    }

    return item;
  }

  onCheckedModeItem(item) {
    item.checked = item.checked ? false : true;
    this.showFolderMenuOptions = [];
    this.modelManagerEventService.onModelTreeCheckedItem({ 'id' : item.id, parent_id: this.parentId, 'name' : item.name, 'type' : item.type, 'checked' : item.checked });
  }

  openFolderCreateModal(item) {
    this.showFolderMenuOptions = [];
    this.modelManagerEventService.onModelNewFolder(item);
  }

  /**Create Object*/
  openObjectCreateModal(item):boolean {
    this.showFolderMenuOptions = [];
    this.modelManagerEventService.onModelNewObject(item);
    return false;
  }

  /**Create Model*/
  openModelCreateModal(item):boolean {
    this.showFolderMenuOptions = [];
    this.modelManagerEventService.onModelNewModel(item);
    return false;
  }

  /**Open Folder Options*/
  onFolderViewOptions(event, item):boolean {
    this.showFolderMenuOptions = Object.keys(this.showFolderMenuOptions).length && this.showFolderMenuOptions.id == item.id ? [] : { id: item.id, type: item.type };
    return false;
  }

  onDeleteModelFolderItem(item):boolean {
    this.deleteItem = item;
    this.modalService.open(this.confirmDeleteItemModal, { size : 'sm', centered: true });
    return false;
  }

  onConfirmDeleteItem() {
    this.modalService.dismissAll();
    for (let i in this.items) {
      if (this.items[i].id == this.deleteItem.id && this.items[i].type == this.deleteItem.type) {
        this.items.splice(i,1);
      }
    }

    this.modelManagerEventService.onChildItemDelete({ id: this.deleteItem.id, parent_id: this.parentId, type: this.deleteItem.type });
    this.deleteItem = {};
  }

  onFolderViewSelect(event, item):boolean {
    this.showFolderMenuOptions = [];
    item.checked = item.checked ? false : true;
    this.modelManagerEventService.onModelTreeCheckedItem({ 'id' : item.id, 'parent_id': this.parentId, 'name' : item.name, 'type' : item.type, 'checked' : item.checked });
    return false;
  }

  onFolderViewFolderSelect(item) {
    this.itemSelectTimer = 0;
    this.preventSimpleClick = false;
    let delay = 200;

    this.itemSelectTimer = setTimeout(() => {
      if (!this.preventSimpleClick) {
        item.checked = item.checked ? false : true;
        this.showFolderMenuOptions = [];
        this.modelManagerEventService.onModelTreeCheckedItem({ 'id' : item.id, 'parent_id': this.parentId, 'name' : item.name, 'type' : item.type, 'checked' : item.checked });
      }
    }, delay);
  }

  onFolderViewFolderExpand(item) {
    this.preventSimpleClick = true;
    clearTimeout(this.itemSelectTimer);
    this.modelService.getFolderModels(this.loggedInUser['login_key'], { id: item.id, type: item.type }, null, this.defaultSort, 1).subscribe(resp => {
      this.currentPage = 1;
      this.parentPages = resp.pages;
      this.parentId = item.id;
      this.modelManagerEventService.onModelTreeCheckedItem({ 'id' : 0, 'type' : 'uncheck_all', 'checked' : false });

      if (resp.status) {
        this.items = resp.items;
      }

      this.modelManagerEventService.onModelFolderViewSelectedFolder({ id: item.id, breadcrumbs: resp.breadcrumbs });
    });
  }

  onFolderModelItemSelect(item):boolean {
    item.checked = item.checked ? false : true;
    this.showFolderMenuOptions = [];
    this.modelManagerEventService.onModelTreeCheckedItem({ 'id' : item.id, 'parent_id': this.parentId, 'name' : item.name, 'type' : item.type, 'checked' : item.checked });
    return false;
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  addFolderModel(type, item) {
    this.showOptions = false;
    if (type == 'folder') {
      this.modelManagerEventService.onModelNewFolder({ id: item.id, 'type' : 'folder' });
    }
    else{
      this.modelManagerEventService.onModelNewModel({ id: item.id, 'type' : 'model' });
    }
  }

  onEditModelFolderItem(item) {
    this.hasFolderUpdateFormSubmitted = false;
    this.updateFolderModelObj = item;

    /**Initialize Form*/
    this.updateFolderModelForm = new UntypedFormGroup({
      name: new UntypedFormControl(item.name, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });
    this.modalService.open(this.updateFolderModal, { size : 'sm', centered: true });
  }

  onUpdateFolderModel() {
    this.hasFolderUpdateFormSubmitted = true;
    if (this.updateFolderModelForm.value.name.length) {
      this.modalService.dismissAll();
      this.updateFolderModelObj.name = this.updateFolderModelForm.value.name;
      this.toastCtrl.success((this.updateFolderModelObj.type == 'model' ? 'Model' : 'Folder') + ' updated successfully');
      this.modelService.updateModelFolder(this.loggedInUser['login_key'],this.updateFolderModelForm.value.name,this.updateFolderModelObj.type,this.updateFolderModelObj.id).subscribe(data => {});
    }
  }

  onShowOptions() {
    this.showOptions = !this.showOptions;
  }

  onRowItemCheck(item) {
    this.onCheckModelTreeItem({ target : { checked : !item.checked } }, item);
  }

  onOpenModelItem(item) {
    item.checked = true;
    this.showFolderMenuOptions = [];
    this.modelManagerEventService.onModelTreeCheckedItem({ 'id' : item.id, 'parent_id': this.parentId, 'name' : item.name, 'type' : item.type, 'checked' : true, 'open_models' : true });
  }

  /**Drag & Drop*/
  dragMoved(event, drag_item, parent_id) {
    let e = this.document.elementFromPoint(event.pointerPosition.x,event.pointerPosition.y);
    if (!e) {
      this.clearDragInfo();
      return;
    }

    this.modelManagerEventService.onModelFolderDragRoot(true);

    let is_root_drag = e.classList.contains('model-root-drop');
    let container = e;
    if (!is_root_drag) {
      container = e.classList.contains('drag_item') ? e : e.closest('.drag_item');
    }

    let is_bottom_drag = false;
    let action_type;
    if (!container) {
      /**Check if moving to the bottom*/
      if (e.classList.contains('list-view')) {
        let main_container = document.getElementById('main_0');
        if (main_container) {
          main_container.classList.add('drop-after');
        }

        container = main_container;
        is_bottom_drag = true;
        action_type = 'after';
      }
      else{
        this.clearDragInfo();
        return;
      }
    }

    this.dropActionTodo = {
      targetId: container.getAttribute('id'),
      id: drag_item.id,
      from_parent_id: parent_id,
      model_to_model : false
    };

    const targetRect = container.getBoundingClientRect();
    const oneThird = targetRect.height / 1.9;

    if (!is_bottom_drag) {
      if (event.pointerPosition.y - targetRect.top < oneThird) {
          action_type = 'before';
          this.dropActionTodo.targetId = is_root_drag ? '0' : e.closest('ul').getAttribute('id');
      } else {
        action_type = 'inside';
        if (container.classList.contains('drag_item_model')) {
          this.dropActionTodo.model_to_model = true;
        }
        else{
          let previous_target_id = this.dropActionTodo.targetId;
          setTimeout(function(){
            let current_insert_el = document.getElementsByClassName('drop-inside');
            if (current_insert_el.length) {
              let current_target_id = current_insert_el[0].getAttribute('data-id-ref');
              if (previous_target_id == current_target_id) {
                if (!current_insert_el[0].classList.contains('show')) {
                  current_insert_el[0].dispatchEvent(new Event('customOpenDirectory'));
                }
              }
            }
          },800);
        }
      }
    }

    this.dropActionTodo.action = action_type;
    this.showDragInfo();
  }

  showDragInfo() {
    this.clearDragInfo();
    if (this.dropActionTodo && this.dropActionTodo.targetId) {
      this.document.getElementById(this.dropActionTodo.targetId).classList.add("drop-" + this.dropActionTodo.action);
      this.modelManagerEventService.onModelFolderDragDropped(this.dropActionTodo);
    }
    else{
      this.modelManagerEventService.onModelFolderDragDropped({});
    }
    this.modelManagerEventService.onModelFolderDragRoot(true);
  }

  clearDragInfo(dropped = false) {
    /**Drag Drop*/
    this.modelManagerEventService.onModelFolderDragDropped({});
    if (dropped) {
      this.dropActionTodo = null;
    }

    this.modelService.clearDragDropClasses();
  }

  onModelOptions(event, item, check_position):boolean {
    event.stopPropagation();
    if (this.modelExpandOptions.id == item.id && (
        (!check_position && this.modelExpandOptions.type == 'fixed') ||
        (check_position && this.modelExpandOptions.type == 'float')
    )) {
      this.modelExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        this.modelExpandOptions.id = item.id;
        if (check_position) {
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.modelExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.modelExpandOptions.right = window.innerWidth - event.clientX - 170;
          }

          this.modelExpandOptions.type = 'float';

        } else {
          this.modelExpandOptions.type = 'fixed';
          this.modelExpandOptions.right = null;
        }
      }
    }

    this.modelManagerEventService.onModelFolderExpandOptionsObservable(this.parentId);
    return false;
  }

  onRenameModel(item) {
    this.renameModelData = item;
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
    this.renameModelData = {};
    this.modelService.updateModelFolder(this.loggedInUser['login_key'],item.name,item.type,item.id).subscribe(data => {});
    // this.modelManagerEventService.onModelFolderRename({ id: item.id, name: item.name, type: item.type, parent_id: this.parentId });
    this.modelBrowserSocket.emit('model_manager_item_rename',{ id: item.id, name: item.name, type: item.type, parent_id: this.parentId });
    this.toastCtrl.success((item.type == 'model' ? 'Model' : 'Folder') + ' updated successfully');
  }

  onCancelRename() {
    this.renameModelData = {};
  }

  onCopyModelFolder(item) {
    this.modelManagerEventService.onModelFolderCopyOptions({
      id: item.id,
      name: item.name,
      type: item.type,
      parent_id: this.parentId,
      action: 'copy'
    });
  }

  onPasteModelFolder(item) {
    this.modelManagerEventService.onModelFolderCopyOptions({
      id: item.id,
      name: item.name,
      type: item.type,
      parent_id: this.parentId,
      action: 'paste'
    });
  }

  onEditMetamodels(item) {
    this.hasMetamodelFormSubmitted = false;
    this.availableMetamodels = [];
    this.showMetamodelLoading = false;
    /**Initialize Form*/
    this.metamodelForm = new UntypedFormGroup({
      metamodel_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      other_metamodel_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: []
      }),
    });

    this.modelService.modelMetamodelDetails(this.loggedInUser['login_key'], item.id).subscribe(data => {
      let metamodel_ids = [];
      let other_metamodel_ids = []
      if (data.status) {
       
        for (let i = 0; i < data.metamodels.length; i++) {
          let modelMetaModelRelationship = data.metamodels[i].modelMetaModelRelationship
          if (modelMetaModelRelationship == null || modelMetaModelRelationship == "primary") {
            metamodel_ids.push(data.metamodels[i].metamodel_id);
          }else if(modelMetaModelRelationship == "secondary"){
            data.metamodels[i].other_metamodel_id = data.metamodels[i].metamodel_id;
            other_metamodel_ids.push(data.metamodels[i].other_metamodel_id)
          }
        }

        this.availableMetamodels = data.metamodels.filter(m => m.modelMetaModelRelationship == null || m.modelMetaModelRelationship == 'primary')
        this.availableOtherMetamodels = data.metamodels.filter(m => m.modelMetaModelRelationship == 'secondary')
        this.metamodelForm.controls.metamodel_id.patchValue(metamodel_ids);
        this.metamodelForm.controls.other_metamodel_id.patchValue(other_metamodel_ids);
      }

      // if (!metamodel_ids.length) {
        this.onMetamodelSearch({ term: '' });
      // }

      // if (!other_metamodel_ids.length){
        this.onOtherMetamodelSearch({term: ''});
      // }
    });

    this.metamodelModelId = item.id;
    this.modalService.open(this.editMetamodelsModal, { size: 'sm', centered: true });
  }

  onMetamodelSearch(event) {
    this.modelService.metamodelSearch(this.loggedInUser['login_key'], event.term, 1,null).subscribe(data => {
      this.availableMetamodels = data.metamodels;
    });
  }

  onOtherMetamodelSearch(event) {
    this.modelService.metamodelSearch(this.loggedInUser['login_key'], event.term, 1,null).subscribe(data => {
      let otherMetaModels = [];
      for (let model of data.metamodels){
        otherMetaModels.push({
          defaultFlag: model.defaultFlag,
          name: model.name,
          other_metamodel_id: model.metamodel_id
        })
      }
      this.availableOtherMetamodels = otherMetaModels;
    });
  }

  onMetamodelUpdate() {
    this.hasMetamodelFormSubmitted = true;
    if (this.metamodelForm.valid) {
      this.showMetamodelLoading = true;
      this.modelService.modelUpdateMetamodels(this.loggedInUser['login_key'], this.metamodelModelId, this.metamodelForm.value.metamodel_id, 
        this.metamodelForm.value.other_metamodel_id
      ).subscribe(data => {
        this.showMetamodelLoading = false;
        if (data.status) {
          this.modalService.dismissAll();
          this.toastCtrl.success('Metamodels updated successfully');
        }
        else {
          this.toastCtrl.error(data.error);
        }
      });
    }
  }

  onParentUncheck(parent_id) {
    for (let i=0; i<this.items.length; i++) {
      if (this.items[i].id == parent_id) {
        this.items[i].checked = false;
        this.parentUncheckEvent.emit(this.parentId);
      }
    }
  }

  onHandleFavorite(item) {
    let favorite_state = item.is_favorite ? false : true;
    item.is_favorite = favorite_state;
    this.modelService.handleFavorite(this.loggedInUser['login_key'], item.id, favorite_state).subscribe(data => {

    });
  }

  /**Permissions*/
  onOpenPermissionsModal(item){
    this.permissions = [];
    this.permissionsCurrentPage = this.permissionsMaxPage = 1;
    this.isPermissionsLoading = true;
    this.selectedPermissionOptions = { id: item.id, name: item.name, type: 'model' };
    this.modalService.open(this.permissionsModal, { windowClass: 'wider-modal import-diagrams', centered: true });
    this.loadMorePermissions(this.permissionsCurrentPage);
  }

  loadMorePermissions(page) {
    this.permissionsCurrentPage = page;
    this.modelService.loadPermissions(this.loggedInUser['login_key'], this.selectedPermissionOptions.type, this.selectedPermissionOptions.id, page).subscribe(data => {
      this.isPermissionsLoading = false;
      if (data.status) {
        this.permissions = this.permissions.concat(data.permissions);
        this.permissionsMaxPage = data.pages;
      }
      else{
        this.modalService.dismissAll();
        this.toastCtrl.error(data.error);
      }
    });
  }

  onPermissionUpdate(event, group_id, value) {
    this.modelService.updateGroupPermissions(this.loggedInUser['login_key'], this.selectedPermissionOptions.type, this.selectedPermissionOptions.id, group_id, value, event.target.checked).subscribe(data => {
      if (data.error) {
        this.toastCtrl.error(data.error);
      }
    });
  }

  onOrganizeModel(item) {
    this.modelExpandOptions = {};
    this.organizeModel = { id: item.id, name: item.name }
    this.modalService.open(this.organizeProcessingModal, { size : 'sm', centered: true, backdrop : 'static', keyboard : false });
    this.modelService.modelOrganize(this.loggedInUser['login_key'], item.id, true).subscribe(data => {
      if (data.status) {
        this.modelBrowserSocket.emit('model_organize',{ model_id: item.id });
        this.modalService.dismissAll();
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }
}
