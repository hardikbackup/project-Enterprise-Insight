import { Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModelEventService } from '../ModelEventService';
import { ModelService } from '../../model.service';
import { AuthService } from '../../../auth/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttributeTypeService } from '../../../metamodel/attribute-type/attribute-type.service';
import { DOCUMENT } from "@angular/common";
import { DiagramTypeService } from "../../../metamodel/diagram-type/diagram-type.service";
import { DomSanitizer} from '@angular/platform-browser';
import * as FileSaver  from 'file-saver';
import { HelperService } from 'src/app/shared/HelperService';
import { CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-model-object-tree',
  templateUrl: './model-object-tree.component.html',
  styleUrls: ['./model-object-tree.component.css']
})

export class ModelObjectTreeComponent implements OnInit {
  @ViewChild('modelKeywordSearchEl') modelKeywordSearchEl: ElementRef;
  @Output() expandChildItemRemoved = new EventEmitter<any>();
  @Input() items: any;
  @Input() level: number;
  @Input() parentId: number;
  @Input() parentType: string;
  @Input('parentPages') pages: number;
  @Input() selectedFolderId: any;
  @Input() selectedModelId: any;
  @Input() selectedDiagramId: any;
  @Input() selectedViewGeneratorId: any;
  @Input() parentModelId: string;
  @Input() selectedObjectIds: any;
  @Input() selectedMultipleObjects: any;
  @Input() keyword: string;
  @Input() modelViewSocket: any;
  @Input() loggedInUser: any;
  @Input() modelBrowserSocket: any;
  @Input() modelViewFolderCopyOptions: any;
  @Input() oldPageDetailsState: any;
  @Input() defaultObjectCreateData: any;
  @Input() isMxGraphMode: boolean;
  @Input() currentPageDetails: any;
  @Input() mainSettings: any;
  @Input() chainObjectRelationshipOptions: any;
  @Input() selectedMultipleItems: any;
  @Input() openDiagramIds: any;
  maxAllowedPaginationPages: number;
  selectedTreeObjectIds: any;
  showModelMenu: any;
  currentPage: number;
  maxShowPage: any;
  showPagination: boolean;
  modelFolderOptionId: any;
  deleteItem: any;
  dropItemActionTodo: any;
  mxEditorDragObject: boolean;
  mxEditorDragObjectCoordinates: any;
  @ViewChild('confirmDeleteItemModal') confirmDeleteItemModal: NgbModal;
  @ViewChild('downloadingModal') downloadingModal: NgbModal;
  modelViewExpandOptions: any;
  draggableItemShapeItem: any;
  modelViewCurrentSocket: any;
  deletedDiagramTypesList: any;
  diagramTypeSearchKeyword: string;
  folderModelChildCreateOptions: any;
  organizeModel: any;
  @ViewChild('organizeProcessingModal') organizeProcessingModal: NgbModal;

  /**Create Folder*/
  @ViewChild('createFolderModal') createFolderModal: NgbModal;
  folderCreateForm: UntypedFormGroup;
  hasFolderCreateFormSubmitted: boolean;
  showAddFolderLoading: boolean;

  /**Create Object*/
  availableObjectTypes: any;
  @ViewChild('createObjectModal') createObjectModal: NgbModal;
  objectCreateForm: UntypedFormGroup;
  showAddObjectLoading: boolean;
  hasObjectCreateFormSubmitted: boolean;

  /**Rename Object & Diagram & Folder & View*/
  renameObject: any;
  renameDiagram: any;
  renameFolder: any;
  renameViewGenerator: any;
  showDeleteDiagramButtonLoading: boolean;
  showDeleteDiagramButton: boolean;

  /**Permissions*/
  @ViewChild('permissionsModal') permissionsModal: NgbModal;
  permissions: any;
  isPermissionsLoading: boolean;
  permissionsCurrentPage: number;
  permissionsMaxPage: number;
  selectedPermissionOptions: any;
  admin: boolean;

  /**Create Diagram*/
  availableDiagramTypes: any;
  @ViewChild('createDiagramModal') createDiagramModal: NgbModal;
  diagramCreateForm: UntypedFormGroup;
  showAddDiagramLoading: boolean;
  hasDiagramCreateFormSubmitted: boolean;

  /**Subscribers*/
  modelTreeFolderSelectedSubscriber: any;
  modelTreeModelSelectedSubscriber: any;
  modelViewerObjectCreatedSubscriber: any;
  modelViewTreeItemExpandedSubscriber: any;
  modelViewTreeItemModelFolderMenuSubscriber: any;
  modelViewObjectDeleteSubscriber: any;
  modelViewTreeExpandSubscriber: any;
  modelTreeDiagramSelectedSubscriber: any;
  modelObjectsCreatedFromMXSubscriber: any;
  modelViewDiagramTypeDeletedSubscriber: any;
  modelFolderObjectRenameSubscriber: any;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameObject = { id: null };
      this.renameDiagram = { id: null };
      this.renameViewGenerator = { id: null };
    }
  }
  constructor(
      private modelEventService: ModelEventService,
      private modelService: ModelService,
      private authService: AuthService,
      private attributeTypeService: AttributeTypeService,
      private modalService: NgbModal,
      private toastCtrl: ToastrService,
      private diagramTypeService: DiagramTypeService,
      @Inject(DOCUMENT) private document: Document,
      private sanitizer: DomSanitizer,
      private helperService: HelperService
  ) {
    /**Folder Selected Tree*/
    this.modelTreeFolderSelectedSubscriber = this.modelEventService.getModelViewFolderSelectedObservable().subscribe(data => {
      this.selectedFolderId = data;
      this.selectedTreeObjectIds = [];
      this.selectedObjectIds = [];
      this.selectedMultipleObjects = [];
      this.selectedDiagramId = 0;
    });

    /**Model Selected Tree*/
    this.modelTreeModelSelectedSubscriber = this.modelEventService.getModelViewModelSelectedObservable().subscribe(data => {
      this.selectedFolderId = 0;
      this.selectedTreeObjectIds = [];
      this.selectedModelId = data;
      this.selectedDiagramId = 0;
      this.selectedViewGeneratorId = 0;
    });

    /**Diagram Selected Tree*/
    this.modelTreeDiagramSelectedSubscriber = this.modelEventService.getModelViewDiagramSelectedObservable().subscribe(data => {
      this.selectedFolderId = 0;
      this.selectedTreeObjectIds = [];
      this.selectedObjectIds = [];
      this.selectedMultipleObjects = [];
      this.selectedDiagramId = data.diagram_id;
    });

    /**Object Created In Model Viewer*/
    this.modelViewerObjectCreatedSubscriber = this.modelEventService.getModelViewObjectCreateForChildObservable().subscribe(data => {
      if (data.parent_id == this.parentId) {
        for (let i=1; i<=data.pages; i++) {
          this.appendNewAddedItems();
        }

        this.calculateMaxPages();
      } else if (data.parent_parent_id && data.parent_parent_id == this.parentId) {
        for (let i=1; i<this.items.length; i++) {
          if (this.items[i].id == data.parent_id) {
            this.items[i].has_childs = true;
          }
        }
      }
    });

    /**When tree view item expanded, hide other open items*/
    this.modelViewTreeItemExpandedSubscriber = this.modelEventService.getModelViewTreeItemExpandedObservable().subscribe(data => {
      // this.expandedItemId = data;
      this.modelViewExpandOptions.id = data;
      // this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
    });

    /**When model and folder menu options show*/
    this.modelViewTreeItemModelFolderMenuSubscriber = this.modelEventService.getModelViewTreeItemModelFolderMenuObservable().subscribe(data => {
      this.modelFolderOptionId = this.modelFolderOptionId == data ? null : data;
    });

    /**When delete object request received from inline editor, need to remove from list*/
    this.modelViewObjectDeleteSubscriber = this.modelEventService.getModelViewInlineEditorObjectDeleteObservable().subscribe(data => {
      let delete_record_found = false;
      for (let i in this.items) {
        if (this.items[i].id == data) {
          delete_record_found = true;
          this.items.splice(i,1);
        }
      }

      if (delete_record_found) {
        this.loadModelViewItems(this.currentPage);
      }
    });

    /**Expand models on search*/
    this.modelViewTreeExpandSubscriber = this.modelEventService.getModelViewTreeExpandObservable().subscribe(data => {
      if (this.parentId == data) {
        for (let i in this.items) {
          this.modelService.modelFolderExpand(this.loggedInUser['login_key'], [this.items[i].id], this.keyword, 'items', 1, 'model_folder', null).subscribe(data => {
            this.items[i].items = data.models;
            this.items[i].pages = data.pages ? data.pages : 1;
          });
        }
      }
    });

    /**MX Editor New Objects Created, Update Tree View*/
    this.modelObjectsCreatedFromMXSubscriber = this.modelEventService.getModelObjectsCreatedFromMXObservable().subscribe(diagram_parent_id => {
      if (diagram_parent_id == this.parentId) {
        this.loadModelViewItems(this.currentPage, true);
      }
    });

    /**When Diagram Type removed and we have it open in popup*/
    this.modelViewDiagramTypeDeletedSubscriber = this.modelEventService.getModelViewDiagramTypeDeletedObservable().subscribe(data => {
      if (data.parent == this.parentId) {
        /**Check already selected value*/
        let diagram_type_id = this.diagramCreateForm.controls['diagram_type_id'].value;
        let term = '';
        if (diagram_type_id && data.diagram_types.includes(diagram_type_id)) {
          this.diagramCreateForm.controls['diagram_type_id'].patchValue(null);
        }
        else{
          term = this.diagramTypeSearchKeyword;
        }

        this.onDiagramTypeSearch({ term: term });
      }
    });

    this.modelFolderObjectRenameSubscriber = this.modelEventService.getModelFolderObjectRenameSubjectObservable().subscribe(data => {
      if (data.parent_id == this.parentId) {
        for (let i in this.items) {
          if (this.items[i].id == data.id) {
            this.items[i].name = data.name;
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.admin = this.authService.isUserAdmin();
    this.showModelMenu = [];
    this.selectedTreeObjectIds = [];
    this.currentPage = 1;
    this.modelFolderOptionId = null;
    this.maxAllowedPaginationPages = 3;
    this.pages = this.pages ? this.pages : 1;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deletedDiagramTypesList = [];
    this.diagramTypeSearchKeyword = '';
    this.mxEditorDragObject = null;
    this.mxEditorDragObjectCoordinates = {
      pointer_x: 0,
      pointer_y: 0
    }
    this.draggableItemShapeItem = {
      object_id: null,
      svg: null
    };

    this.calculateMaxPages();
    if (this.parentId == 0 && this.items['0']['pre_load']) {
      for (let i in this.items) {
        this.onOpenModelObjectItem({}, this.items[i], false);
      }
    }

    //#region Sort Model Objects
    this.items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') {
          return -1;
      } else if (a.type !== 'folder' && b.type === 'folder') {
          return 1;
      }
      return a.name.localeCompare(b.name);
    });
    //#endregion

    /**Rename Model Objects*/
    this.renameObject = {};
    this.renameDiagram = {};
    this.renameFolder = {};
    this.renameViewGenerator = {};
    this.showDeleteDiagramButtonLoading = false;
    this.showDeleteDiagramButton = false;

    this.folderModelChildCreateOptions = {};

    /**Model Object Create*/
    if (this.parentId == 0) {
      this.modelViewCurrentSocket = null;
    }
    else{
      if (this.parentType == 'model') {
        this.modelViewCurrentSocket = this.modelViewSocket[this.parentId];
      }
      else{
        this.modelViewCurrentSocket = this.modelViewSocket;
      }

      this.modelViewSocket = this.modelViewCurrentSocket;
      this.modelViewCurrentSocket.on('pluto_model_object_create',data => {
        if (this.parentId == data.parent_id) {
          if (this.currentPage == this.pages) {
            this.appendNewAddedItems();
          }
          else {
            this.pages = data.pages ? data.pages : 1;
            this.calculateMaxPages();
          }
        }
        else if (data.parent_parent_id == this.parentId) {
          /**Set Has Childs Arrow*/
          this.setHasChildsArrow(data.parent_id);
        }
      });

      /**Model Object, Folder, Diagram, View Rename*/
      this.modelViewCurrentSocket.on('pluto_model_object_rename',data => {
        let set_content = true;
        if (data.parent_id == this.parentId) {
          for (let i=0; i<this.items.length; i++) {
            if (this.items[i].id == data.id && data.type == this.items[i].type) {
              this.items[i].name = data.name;
              set_content = false;
            }
          }
        }

        /**Set attribute as when received from MxGraph we don't have parent ids*/
        let element_ref = document.getElementById('object_tree_item_' + data.id);
        if (element_ref) {
          let name  = this.helperService.extractModulusSubstring(data.name);
          element_ref.setAttribute('name', name[0]);
          if (set_content) {
            document.getElementById('object_tree_item_' + data.id + '_name').textContent = name[0];
          }
        }
      });

      /**Model Object Delete*/
      this.modelViewCurrentSocket.on('pluto_model_object_delete',data => {
        if (data.parent_id == this.parentId) {
          this.processDeletedPages(data);
        }

        this.modelViewCurrentSocket.emit('model_view_delete_object',{ object_id: data.id, model_id: this.parentModelId })
      });

      /**Model Diagram Create*/
      this.modelViewCurrentSocket.on('pluto_model_diagram_create',data => {
        if (data.parent_id == this.parentId) {
          if (this.currentPage == this.pages) {
            this.appendNewAddedItems();
          }
          else {
            this.pages = data.pages ? data.pages : 1;
            this.calculateMaxPages();
          }
        }
        else if (data.parent_parent_id && data.parent_parent_id == this.parentId) {
          /**Show arrow icon*/
          for (let i=1; i<this.items.length; i++) {
            if (this.items[i].id == data.parent_id) {
              this.items[i].has_childs = true;
            }
          }
        }
      });

      /**Model Diagram Delete*/
      this.modelViewCurrentSocket.on('pluto_model_diagram_delete',data => {
        if (data.parent_id == this.parentId) {
          this.processDeletedPages(data);
        }  
      });

      /**Model View Delete*/
      this.modelViewCurrentSocket.on('pluto_model_view_delete',data => {
        if (data.parent_id == this.parentId) {
          this.processDeletedPages(data);
        }
      });

      /**Model Folder Create*/
      this.modelViewCurrentSocket.on('pluto_model_folder_create',data => {
        if (data.parent_id == this.parentId) {
          if (this.currentPage == this.pages) {
            this.appendNewAddedItems();
          }
          else {
            this.calculateMaxPages();
          }
        }
        else if (data.parent_parent_id == this.parentId) {
          /**Set Has Childs Arrow*/
          this.setHasChildsArrow(data.parent_id);
        }
      });

      /**Model Folder Delete*/
      this.modelViewCurrentSocket.on('pluto_model_folder_delete',data => {
        if (data.parent_id == this.parentId) {
          this.processDeletedPages(data);
        }
      });

      /**Drag & Drop*/
      this.modelViewCurrentSocket.on('model_view_tree_drag_drop',data => {
        if (this.parentId == data.parent_id) {
          this.items = this.items.filter((value, index) => {
            return data.drop_item_ids.indexOf(value.id) == -1;
          });

          if (!this.items.length) {
            this.expandChildItemRemoved.emit({ id: this.parentId, target_id: data.target_id, target_parent_id: data.target_parent_id });
            // this.modelViewSocket.emit('on_has_child_arrow_remove',{ id: this.parentId, parent_parent_id: this.pare })
          }

          for (let i=1; i<=this.currentPage; i++){
            this.loadModelViewItems(i, true);
          }
        }
        else if(this.parentId == data.target_parent_id) {
          for (let i=0; i<this.items.length; i++) {
            if (this.items[i].id == data.target_id) {
              this.items[i].has_childs = true;
            }
          }
        }
      });

      /**Has child flag handle*/
      this.modelViewCurrentSocket.on('handle_item_has_child_flag',data => {
        if (data.parent_parent_id == this.parentId) {
          for (let i=0; i<this.items.length; i++) {
            if (this.items[i].id == data.data.id && this.items[i].id != data.data.target_id) {
              this.items[i].has_childs = data.data.has_childs;
            }
          }
        }
      });
    }
  }

  calculateMaxPages() {
    if (this.pages > 1) {
      let new_max_page = this.currentPage + this.maxAllowedPaginationPages;
      this.maxShowPage = new Array((new_max_page > this.pages) ? this.pages : new_max_page);
      this.showPagination = true;
    }
    else{
      this.showPagination = false;
    }
  }

  ngOnDestroy() {
    if (this.modelTreeFolderSelectedSubscriber) {
      this.modelTreeFolderSelectedSubscriber.unsubscribe();
    }

    if (this.modelTreeModelSelectedSubscriber) {
      this.modelTreeModelSelectedSubscriber.unsubscribe();
    }

    if (this.modelViewerObjectCreatedSubscriber) {
      this.modelViewerObjectCreatedSubscriber.unsubscribe();
    }

    if (this.modelViewTreeItemExpandedSubscriber) {
      this.modelViewTreeItemExpandedSubscriber.unsubscribe();
    }

    if (this.modelViewTreeItemModelFolderMenuSubscriber) {
      this.modelViewTreeItemModelFolderMenuSubscriber.unsubscribe();
    }

    if (this.modelViewObjectDeleteSubscriber) {
      this.modelViewObjectDeleteSubscriber.unsubscribe();
    }

    if (this.modelViewTreeExpandSubscriber) {
      this.modelViewTreeExpandSubscriber.unsubscribe();
    }

    if (this.modelTreeDiagramSelectedSubscriber) {
      this.modelTreeDiagramSelectedSubscriber.unsubscribe();
    }

    if (this.modelObjectsCreatedFromMXSubscriber) {
      this.modelObjectsCreatedFromMXSubscriber.unsubscribe();
    }

    if (this.modelViewDiagramTypeDeletedSubscriber) {
      this.modelViewDiagramTypeDeletedSubscriber.unsubscribe();
    }

    if (this.modelFolderObjectRenameSubscriber) {
      this.modelFolderObjectRenameSubscriber.unsubscribe();
    }
  }

  onOpenModelObjectItem(event, item, menu_changed = false, token = null) {
    item['expand'] = !item['expand'];
    this.showModelMenu = [];

    if (item['expand']) {
      let type = item.type == 'object' ? 'object' : 'model_folder';
      this.modelService.modelFolderExpand(this.loggedInUser['login_key'], [item.id], this.keyword, 'items', 1, type, token).subscribe(data => {
        item.items = data.models;
        item.pages = data.pages ? data.pages : 1;
        if (menu_changed) {
          this.modelEventService.onModelViewTreeItemModelFolderMenuExpanded(this.modelFolderOptionId);
        }
      });
    }

    this.modelEventService.onModelViewCurrentPageStateChange({
      id: item.id,
      action: item['expand'] ? 'expand' : 'collapse',
      type: item.type,
    });
  }

  onObjectViewOptions(event, item, check_position):boolean {
    /**Hide/Show Object Context Menu*/
    if (this.modelViewExpandOptions.id == item.id && (
        (!check_position && this.modelViewExpandOptions.type == 'fixed') ||
        (check_position && this.modelViewExpandOptions.type == 'float')
    )) {
      this.modelViewExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        if (!this.selectedMultipleItems.filter(data => data.type == item.type && data.id == item.id).length) {
          this.onModelViewItemSelect({}, item);
        }

        this.modelViewExpandOptions.id = item.id;
        if (check_position) {
          if (document.getElementById('left_sidebar_menu')) {
            this.modelViewExpandOptions.type = 'float';
            let options_width = 143;
            let left_sidebar_menu = document.getElementById('left_sidebar_menu').offsetWidth;
            let container_width = document.getElementById('model_viewer_tree').offsetWidth;
            let layer_x = event.clientX - left_sidebar_menu;
            if (options_width + layer_x > container_width) {
              this.modelViewExpandOptions.left = container_width - options_width - 20;
            }
            else{
              this.modelViewExpandOptions.left = event.layerX - 30;
            }
          }
        } else {
          this.modelViewExpandOptions.type = 'fixed';
          this.modelViewExpandOptions.left = null;
        }
      }
    }

    this.triggerModelObjectContextMenuChange(this.modelViewExpandOptions.id);

    /**Hide Model Folder Context Menu*/
    this.triggerModelFolderContextMenuChange(null);
    return false;
  }

  openObjectCreateModal(item) {
    this.modelFolderOptionId = null;
    this.showModelMenu = [];
    this.hasObjectCreateFormSubmitted = false;
    this.showAddObjectLoading = false;
    this.modelViewExpandOptions = {};
    this.folderModelChildCreateOptions = { id: item.id, type: item.type };

    /**Initialize Form*/
    this.objectCreateForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      object_type_id: new UntypedFormControl('', {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });

    this.modalService.open(this.createObjectModal, { size : 'sm', centered: true });
    if (this.defaultObjectCreateData.object_type_id) {
      this.availableObjectTypes = this.defaultObjectCreateData.object_types;
      this.objectCreateForm.controls.object_type_id.patchValue(this.defaultObjectCreateData.object_type_id);
    }
    else{
      this.availableObjectTypes = [{ object_type_id : '', name: 'Select' }];
      this.onObjectTypeSearch({ term: '' });
    }

    /**Uncheck Inline Editor Selected Row*/
    this.modelEventService.onModelViewInlineEditorRowUncheck(true);
  }

  onObjectCreate() {
    if (this.objectCreateForm.value.name.toString().trim().length) {
      this.hasObjectCreateFormSubmitted = true;
      if (this.objectCreateForm.valid) {
        this.showAddObjectLoading = true;
        let default_object_type = this.availableObjectTypes.filter(data => {
          return data.object_type_id == this.objectCreateForm.value.object_type_id
        });

        this.modelViewCurrentSocket.emit('pluto_model_object_create',{ parent_id: this.folderModelChildCreateOptions.id, parent_parent_id: this.parentId });

        this.modelService.addObject(this.loggedInUser['login_key'], this.objectCreateForm.value, { id: this.folderModelChildCreateOptions.id, type: this.folderModelChildCreateOptions.type }).subscribe(data => {
          this.showAddObjectLoading = false;
          if (data.status) {
            this.toastCtrl.success('Object created successfully')
            this.modalService.dismissAll();

            /**For next time remember the object type selection for all levels*/
            this.modelEventService.onModelObjectTypeCreateState({ object_type_id: default_object_type[0].object_type_id, object_types: this.availableObjectTypes});

            /**Let other browsers & tabs know about new object*/
            if (this.modelViewCurrentSocket) {
              this.modelViewCurrentSocket.emit('pluto_model_object_create',{ parent_id: this.folderModelChildCreateOptions.id, parent_parent_id: this.parentId });
            }
          }
          else{
            this.toastCtrl.info(data.error);
          }
        });
      }
    }
    else{
      this.toastCtrl.info('Object name can\'t be empty')
    }
  }

  openFolderCreateModal(item) {
    this.modelFolderOptionId = null;
    this.showModelMenu = [];
    this.hasFolderCreateFormSubmitted = false;
    this.modelViewExpandOptions = {};
    this.folderModelChildCreateOptions = { id: item.id, type: item.type };

    /**Initialize Form*/
    this.folderCreateForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });
    this.modalService.open(this.createFolderModal, { size : 'sm', centered: true });

    /**Uncheck Inline Editor Selected Row*/
    this.modelEventService.onModelViewInlineEditorRowUncheck(true);
  }

  onModelFolderCreate() {
    this.hasFolderCreateFormSubmitted = true;
    if (this.folderCreateForm.valid) {
      if (!this.folderCreateForm.value.name.toString().trim().length) {
        this.toastCtrl.info('Folder name can\'t be empty')
        return false;
      }

      this.showAddFolderLoading = true;
      this.modelService.addFolder(this.loggedInUser['login_key'], this.folderCreateForm.value.name, { id: this.folderModelChildCreateOptions.id, type: 'folder' }).subscribe(data => {
        if (data.status) {
          this.toastCtrl.success('New folder created successfully')
          this.showAddFolderLoading = false;
          this.modalService.dismissAll();

          /**Socket Emit*/
          if (this.modelViewCurrentSocket) {
            this.modelViewCurrentSocket.emit('pluto_model_folder_create',  { parent_id: this.folderModelChildCreateOptions.id, parent_parent_id: this.parentId });
          }
        }
        else{
          this.toastCtrl.info(data.error);
        }
      });
    }
  }

  openObjectDiagramModal(item) {
    this.modelFolderOptionId = null;
    this.showModelMenu = [];
    this.hasDiagramCreateFormSubmitted = false;
    this.showAddDiagramLoading = false;
    this.modelViewExpandOptions = {};
    this.folderModelChildCreateOptions = { id: item.id, type: item.type };

    /**Initialize Form*/
    this.diagramCreateForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      diagram_type_id: new UntypedFormControl('', {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });

    this.availableDiagramTypes = [{ diagram_type_id : '', name: 'Select' }];
    this.modalService.open(this.createDiagramModal, { size : 'sm', centered: true });
    this.onDiagramTypeSearch({ term: '' });
  }

  onDiagramTypeSearch(event) {
    this.diagramTypeSearchKeyword = event.term;
    this.diagramTypeService.diagramTypeSearch(this.loggedInUser['login_key'], event.term, this.parentModelId, 1).subscribe(data => {
      this.availableDiagramTypes = data.diagram_types;
    });
  }

  onDiagramCreate() {
    this.hasDiagramCreateFormSubmitted = true;
    if (this.diagramCreateForm.valid) {
      if (!this.diagramCreateForm.value.name.toString().trim().length) {
        this.toastCtrl.info('Diagram name can\'t be empty')
        return false;
      }

      this.showAddDiagramLoading = true;
      this.modelService.addDiagram(this.loggedInUser['login_key'], this.diagramCreateForm.value, { id: this.folderModelChildCreateOptions.id, type: this.folderModelChildCreateOptions.type }).subscribe(data => {
        if (data.status) {
          // data.diagram_new_tab = true;

          this.toastCtrl.success('Diagram created successfully')
          this.showAddDiagramLoading = false;
          this.modalService.dismissAll();

          /**Emit Socket*/
          if (this.modelViewCurrentSocket) {
            this.modelViewCurrentSocket.emit('pluto_model_diagram_create', { parent_id: this.folderModelChildCreateOptions.id, parent_parent_id: this.parentId });
          }
          /**Check settings to open in a new window or current tab*/
          this.modelEventService.onModelViewNewDiagramCreated({ id: data.id, name: data.name, parent_id: this.folderModelChildCreateOptions.id });
        }
        else{
          this.toastCtrl.info(data.error);
        }
      });
    }
  }

  handleShiftHoldMultiSelection(event) {
    let added_objects = [];
    let selected_items = document.getElementsByClassName('tree-item-selected');
    if (selected_items.length) {
      let last_element_index;
      if (event.target.classList.contains('tree-item')) {
        last_element_index = parseInt(event.target.getAttribute('data-index'));
      }
      else{
        let last_element = event.target.closest('.tree-item');
        if (!last_element) {
          return [];
        }

        last_element_index = parseInt(last_element.getAttribute('data-index'));
      }

      let first_item_index = parseInt(selected_items[0].getAttribute('data-index'));
      let tree_items = document.getElementsByClassName('tree-item');
      for (let i=0; i<tree_items.length; i++) {
        let index_num = parseInt(tree_items[i].getAttribute('data-index'));

        if (tree_items[i].getAttribute('data-parent-id') == this.parentId.toString() &&
            (
                (
                    index_num > first_item_index &&
                    index_num < last_element_index
                )
                ||
                (
                    index_num >= last_element_index &&
                    index_num < first_item_index
                )
            )
        ) {
          let selected_object_id = tree_items[i].getAttribute('data-id');
          let get_middle_index = this.selectedTreeObjectIds.indexOf(selected_object_id);
          if (get_middle_index == -1) {
            this.selectedTreeObjectIds.push(selected_object_id);
            added_objects.push(selected_object_id)
            let type = tree_items[i].getAttribute('data-type');
            let id = tree_items[i].getAttribute('data-id');
            let options = {
              id: id,
              ids: [id],
              name : tree_items[i].getAttribute('data-name'),
              multiple: true,
              parent_model_id : this.parentModelId,
              parent_id: this.parentId,
              parent_type: this.parentType,
              type: tree_items[i].getAttribute('data-type'),
            };

            switch (type) {
              case 'object':
                this.modelEventService.onModelViewSelectedItem(options);
              break;
              case 'folder':
                this.modelEventService.onModelViewFolderSelected(options);
              break;
              case 'view':
                this.modelEventService.onModelViewGeneratorSelected(options);
              break;
              case 'diagram':
                this.modelEventService.onModelViewDiagramSelected(options);
              break;
            }
            // this.modelEventService.onModelViewSelectedItem({
            //   ids: [tree_items[i].getAttribute('data-id')],
            //   name : tree_items[i].getAttribute('data-name'),
            //   multiple: true,
            //   parent_model_id : this.parentModelId,
            //   parent_id: this.parentId,
            //   parent_type: this.parentType,
            //   type: tree_items[i].getAttribute('data-type'),
            // });
          }
        }
      }
    }

    return added_objects;
  }

  onModelViewItemSelect(event, item, manual_select = false, edit_mode = false):boolean {
    let has_multiple_selected = !!(event.shiftKey || event.ctrlKey || event.metaKey || manual_select);
    switch (item.type) {
      case 'object':
        if (this.renameObject.id == item.id) {
          return false;
        }

        this.selectedModelId = 0;
        let get_index = this.selectedTreeObjectIds.indexOf(item.id);
        let added_objects = [];
        if (has_multiple_selected) {
          if (event.shiftKey) {
            added_objects = this.handleShiftHoldMultiSelection(event);
          }

          if (get_index == -1) {
            this.selectedTreeObjectIds.push(item.id);
          }
          else{
            if (!event.shiftKey) {
              this.selectedTreeObjectIds.splice(get_index, 1);
            }
          }
        }
        else{
            this.selectedTreeObjectIds = [item.id];
            this.selectedDiagramId = 0;
            this.selectedFolderId = 0;
            this.selectedViewGeneratorId = 0;
        }

        if (added_objects.indexOf(item.id) == -1) {
          this.modelEventService.onModelViewSelectedItem({
            ids: [item.id],
            name : item.name,
            multiple: has_multiple_selected,
            parent_model_id : this.parentModelId,
            parent_id: this.parentId,
            parent_type: this.parentType,
            type: 'object'
          });
        }
      break;
      case 'folder':
        if (this.renameFolder.id == item.id || this.isMxGraphMode) {
          return false;
        }

        this.selectedModelId = 0;
        this.selectedFolderId = item.id;
        if (!has_multiple_selected) {
          this.selectedTreeObjectIds = [];
          this.selectedDiagramId = 0;
          this.selectedViewGeneratorId = 0;
        }

        if (event.shiftKey) {
          this.handleShiftHoldMultiSelection(event);
        }

        this.modelEventService.onModelViewFolderSelected({
          id: item.id,
          name : item.name,
          multiple: has_multiple_selected,
          parent_model_id : this.parentModelId,
          parent_id: this.parentId,
          parent_type: this.parentType,
          type: 'folder'
        });
      break;
      case 'model':
        if (this.isMxGraphMode) {
          return false;
        }
        this.selectedTreeObjectIds = [];
        this.selectedFolderId = 0;
        this.selectedDiagramId = 0;
        this.selectedViewGeneratorId = 0;
        this.selectedModelId = item.id;
        this.modelEventService.onModelViewModelSelected(this.selectedModelId);
      break;
      case 'diagram':
        if (this.renameDiagram.id == item.id || this.isMxGraphMode) {
          return false;
        }

        this.selectedModelId = 0;
        if (!has_multiple_selected) {
          this.selectedFolderId = 0;
          this.selectedTreeObjectIds = [];
          this.selectedViewGeneratorId = 0;
          this.selectedDiagramId = item.id;
        }

        if (event.shiftKey) {
          this.handleShiftHoldMultiSelection(event);
        }

        this.modelEventService.onModelViewDiagramSelected({
          id: item.id,
          name: item.name,
          multiple: has_multiple_selected,
          parent_model_id : this.parentModelId,
          parent_id: this.parentId,
          parent_type: this.parentType,
          type: 'diagram',
          edit_mode: edit_mode
        });
      break;
      case 'view':
        if (this.renameViewGenerator.id == item.id || this.isMxGraphMode) {
          return false;
        }

        if (!has_multiple_selected) {
          this.selectedFolderId = 0;
          this.selectedTreeObjectIds = [];
          this.selectedModelId = 0;
          this.selectedDiagramId = 0;
          this.selectedViewGeneratorId = item.id;
        }

        if (event.shiftKey) {
          this.handleShiftHoldMultiSelection(event);
        }

        this.modelEventService.onModelViewGeneratorSelected({
          id: item.id,
          name: item.name,
          multiple: has_multiple_selected,
          parent_model_id : this.parentModelId,
          parent_id: this.parentId,
          parent_type: this.parentType,
          type: 'view',
        });
      break;
    }

    /**Hide model context menu*/
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
    this.modelEventService.onModelViewTreeItemExpanded(null);

    /**Hide model folder context menu*/
    this.triggerModelFolderContextMenuChange(null);
    return false;
  }

  loadModelViewItems(page, check_matches = false) {
    this.currentPage = page;
    let type = this.parentType == 'object' ? 'object' : 'model_folder';
    this.modelService.modelFolderExpand(this.loggedInUser['login_key'], [this.parentId], this.keyword, 'items', page, type, null).subscribe(data => {
      /**In case of deleted items when no page found, show previous page*/
      if (this.currentPage > 1 && !this.items.length) {
        this.loadModelViewItems(this.currentPage - 1, check_matches);
      }

      if (check_matches) {
        if (Object.keys(this.items).length) {
            let item_ids = [];
            for (let i in this.items) {
              item_ids.push(this.items[i].id);
            }

            for (let i in data.models) {
              if (item_ids.indexOf(data.models[i].id) == -1) {
                this.items = this.items.concat(data.models[i]);
              }
            }
        }
        else{
          this.items = data.models;
        }
      }
      else{
        this.items = data.models;
      }


      this.pages = data.pages ? data.pages : 1;

      this.calculateMaxPages();
    });
  }

  onShowModelFolderMenuOptions(id) {
    /**Show/Hide Model Folder Context Menu*/
    this.triggerModelFolderContextMenuChange(id);

    /**Hide Object Context Menu*/
    this.triggerModelObjectContextMenuChange(null);
  }

  /**Object Rename Update*/
  onObjectRename(event, item) {
    item.show_options = false;
    this.renameObject = item;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
  }

  /**On Object Select*/
  onObjectSelect(event, item) {
    item.show_options = false;
    this.onModelViewItemSelect(event, item, true);
  }

  /**Object Rename Update*/
  onDiagramRenameModal(event, item) {
    item.show_options = false;
    this.renameDiagram = item;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
  }

  /**Folder Rename*/
  onFolderRename(event, item) {
    item.show_options = false;
    this.renameFolder = item;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
  }

  /**View Rename*/
  onViewRename(event, item) {
    item.show_options = false;
    this.renameViewGenerator = item;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
  }

  onViewDelete(event, item):boolean {
    item.show_options = false;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deleteItem = { item: item, type: 'view' };
    this.showDeleteDiagramButton = this.showDeleteDiagramButtonLoading = false;
    this.modalService.open(this.confirmDeleteItemModal, { size : 'sm', centered: true });
    return false;
  }

  processDeletedPages(item) {
    /**Delete from page*/
    let has_found = false;
    for (let i in this.items) {
      if (this.items[i].id == item.id) {
        this.items.splice(i,1);
        has_found = true;
      }
    }

    /**Calculate new pages after deleting an object*/
    if (has_found) {
      if (this.currentPage == 1) {
        if (!this.items.length) {
          this.expandChildItemRemoved.emit({ id: this.parentId, target_id: null, target_parent_id: null });
        }
      }
      else{
        this.appendNewAddedItems();
      }
    }
  }

  onObjectDelete(event, item):boolean {
    item.show_options = false;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deleteItem = { item: item, type: 'object' };
    this.showDeleteDiagramButton = this.showDeleteDiagramButtonLoading = false;

    /**Find if used in Diagram*/
    this.showDeleteDiagramButtonLoading = true;
    let object_ids = this.selectedMultipleObjects.map(data => data.id);
    this.modelService.checkObjectsUsedDiagram(this.loggedInUser['login_key'], object_ids).subscribe(data => {
      this.showDeleteDiagramButtonLoading = false;
      this.showDeleteDiagramButton = data.has_used_in_diagram;
    });

    this.modalService.open(this.confirmDeleteItemModal, { size : 'sm', centered: true });
    /**Uncheck Inline Editor Selected Row*/
    this.modelEventService.onModelViewInlineEditorRowUncheck(true);
    return false;
  }

  onFolderDelete(item):boolean {
    item.show_options = false;
    this.deleteItem = { item: item, type: 'folder' };
    this.showDeleteDiagramButton = this.showDeleteDiagramButtonLoading = false;
    this.modalService.open(this.confirmDeleteItemModal, { size : 'sm', centered: true });
    /**Uncheck Inline Editor Selected Row*/
    this.modelEventService.onModelViewInlineEditorRowUncheck(true);
    return false;
  }

  onDiagramDelete(event, item):boolean {
    item.show_options = false;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };
    this.deleteItem = { item: item, type: 'diagram' };
    this.showDeleteDiagramButton = this.showDeleteDiagramButtonLoading = false;
    this.modalService.open(this.confirmDeleteItemModal, { size : 'sm', centered: true });
    return false;
  }

  onProcessDeleteItem(delete_from_diagrams = false) {
    this.modalService.dismissAll();
    for (let i=0; i<this.selectedMultipleItems.length; i++) {
      switch (this.selectedMultipleItems[i].type) {
        case 'object':
          this.modelService.deleteObject(this.loggedInUser['login_key'], this.selectedMultipleItems[i].id, delete_from_diagrams).subscribe(data => {
            if (data.status) {
              if (this.modelViewCurrentSocket) {
                this.modelViewCurrentSocket.emit('pluto_model_object_delete', this.selectedMultipleItems[i]);
              }
            }
          });
        break;
        case 'folder':
          this.modelService.removeModelItems(this.loggedInUser['login_key'], [{ id: this.selectedMultipleItems[i].id, type: 'folder' }]).subscribe(data => {
            if (data.status) {
              /**Emit Socket*/
              this.deleteItem.item.parent_id = this.parentId;
              if (this.modelViewCurrentSocket) {
                this.modelViewCurrentSocket.emit('pluto_model_folder_delete', this.selectedMultipleItems[i]);
              }
            }
            else{
              this.toastCtrl.error(data.error);
            }
          });
        break;
        case 'diagram':
          this.modelService.deleteDiagram(this.loggedInUser['login_key'], this.selectedMultipleItems[i].id).subscribe(data => {
            if (data.status) {
              /**Emit Socket*/
              if (this.modelViewCurrentSocket) {
                this.modelViewCurrentSocket.emit('pluto_model_diagram_delete', this.selectedMultipleItems[i]);
              }
            }
            else{
              this.toastCtrl.error(data.error);
            }
          });
        break;
        case 'view':
          this.modelService.deleteView(this.loggedInUser['login_key'], this.selectedMultipleItems[i].id).subscribe(data => {
            if (data.status) {
              /**Emit Socket*/
              this.deleteItem.item.parent_id = this.parentId;
              if (this.modelViewCurrentSocket) {
                this.modelViewCurrentSocket.emit('pluto_model_view_delete', this.selectedMultipleItems[i]);
              }
            }
            else{
              this.toastCtrl.error(data.error);
            }
          });
        break;
        case 'model':
          this.modelService.removeModelItems(this.loggedInUser['login_key'], [{ id: this.selectedMultipleItems[i].id, type: 'model' }]).subscribe(data => {
            if (data.status) {
              /**Emit Socket*/
              this.modelBrowserSocket.emit('model_view_model_deleted',this.selectedMultipleItems[i].id);
            }
            else{
              this.toastCtrl.error(data.error);
            }
          });
        break;
      }
    }
  }

  appendNewAddedItems() {
    let type = this.parentType == 'object' ? 'object' : 'model_folder';
    this.modelService.modelFolderExpand(this.loggedInUser['login_key'], [this.parentId], this.keyword, 'items', this.currentPage, type, null).subscribe(data => {
      for (let i in data.models) {
        let allow_add = true;
        for (let t in this.items) {
          if (allow_add && data.models[i].id == this.items[t].id) {
            allow_add = false;
          }
        }

        if (allow_add) {
          this.items.push(data.models[i]);
        }
      }

      this.pages = data.pages ? data.pages : 1;
      this.calculateMaxPages();
    });
  }

  onModelClose(event, id) {
    for (let i in this.items) {
      if (this.items[i].id == id) {
        this.items.splice(i,1);
      }
    }
    this.modelEventService.onModelViewModelClose(id);
  }

  onObjectAddRelationship(event, item) {
    if (this.selectedObjectIds.indexOf(item.id) == -1) {
      this.selectedObjectIds = [item.id];
      this.selectedMultipleObjects = [item];
      this.onModelViewItemSelect(event, item);
    }

    item.show_options = false;
    this.modelViewExpandOptions = { id: null, right: null, type: 'fixed' };

    /**Open Relationship Modal*/
    this.modelEventService.onOpenRelationshipModal({ model_id: this.selectedModelId });

    /**Uncheck Inline Editor Selected Row*/
    this.modelEventService.onModelViewInlineEditorRowUncheck(true);
  }

  onObjectTypeSearch(event) {
    this.modelService.objectTypeSearch(this.loggedInUser['login_key'], event.term, this.parentModelId, 1).subscribe(data => {
      this.availableObjectTypes = data.object_types;
    });
  }

  onFolderViewOptions(event, item, check_position) {
    /**Open Model Folder Menu*/
    /**Hide/Show Object Context Menu*/
    if (this.modelViewExpandOptions.id == item.id && (
        (!check_position && this.modelViewExpandOptions.type == 'fixed') ||
        (check_position && this.modelViewExpandOptions.type == 'float')
    )) {
      this.modelViewExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        if (!this.selectedMultipleItems.filter(data => data.type == item.type && data.id == item.id).length) {
          this.onModelViewItemSelect({}, item);
        }

        this.modelViewExpandOptions.id = item.id;
        if (check_position) {
          this.modelViewExpandOptions.type = 'float';

          let options_width = 143;
          let container_width = document.getElementById('model_viewer_tree').offsetWidth;
          if (options_width + event.layerX >= container_width) {
            if (item.type == 'model') {
              this.modelViewExpandOptions.right = 0;
            }
            else{
              this.modelViewExpandOptions.left = container_width - options_width - 20;
            }
          }
          else{
            if (item.type == 'model') {
              this.modelViewExpandOptions.right = container_width - (options_width + event.layerX);
            }
            else{
              this.modelViewExpandOptions.left = event.layerX - 30;
            }
          }

          /**Used this approach to fix style issues associated with only root model element*/
        } else {
          this.modelViewExpandOptions.type = 'fixed';
          this.modelViewExpandOptions.left = null;
        }
      }
    }

    this.triggerModelObjectContextMenuChange(this.modelViewExpandOptions.id);
    return false;
  }

  triggerModelFolderContextMenuChange(model_folder_id) {
    this.modelEventService.onModelViewTreeItemModelFolderMenuExpanded(model_folder_id);
  }

  triggerModelObjectContextMenuChange(expanded_item_id) {
    this.modelEventService.onModelViewTreeItemExpanded(expanded_item_id);
  }

  /**Drag & Drop*/
  dragItemMoved(event, item, parent_id) {
    if (item.type == 'object' && this.renameObject.id == item.id) {
      return false;
    }
  
    /**Check if dragged object is part of selection, otherwise select dragging object*/
    if (!this.isMxGraphMode && item.type == 'object' && this.selectedObjectIds.length && this.selectedObjectIds.indexOf(item.id) == -1) {
        this.onModelViewItemSelect({}, item);
    }

    /**Process highlighting*/
    let e = this.document.elementFromPoint(event.pointerPosition.x,event.pointerPosition.y);
    if (e) {
      let container = e.classList.contains('drag_item') ? e : e.closest('.drag_item');
      /**Drop to Diagram*/
      if (!container) {
        this.clearDragItemInfo();
        if (item.type == 'object' && (e.classList.contains('object-drag-diagram-container') || e.closest('.object-drag-diagram-container'))) {
          event.source._dragRef.reset();
          if (!this.draggableItemShapeItem || this.draggableItemShapeItem.object_id != item.id) {
            this.modelService.getObjectShapeXML(this.loggedInUser['login_key'],this.selectedDiagramId, item.id).subscribe(shape_data => {
              if (shape_data.status && shape_data.svg) {
                this.draggableItemShapeItem = {
                  object_id: item.id,
                  svg: shape_data.svg
                }
              }
              else{
                this.draggableItemShapeItem.object_id = item.id;
                this.draggableItemShapeItem.svg = null;
              }
            });
          }

          if (this.draggableItemShapeItem && this.draggableItemShapeItem.object_id == item.id && this.draggableItemShapeItem.svg) {
            let el = document.getElementsByClassName('cdk-drag-preview');
            if (el.length) {
              el['0'].classList.add('object-drag-shape-item');
              let svg_el = el['0'].getElementsByClassName('svg-draw-container');
                  svg_el['0'].innerHTML = this.draggableItemShapeItem.svg;
            }
          }

          this.mxEditorDragObject = item;
          this.mxEditorDragObjectCoordinates.pointer_x = event.pointerPosition.x;
          let main_header_el = document.getElementById('main_header');
          this.mxEditorDragObjectCoordinates.pointer_y = event.pointerPosition.y - (main_header_el ? main_header_el.offsetHeight : 0);
          this.modelEventService.onModelViewObjectDragEditor({ 'type': 'drag', 'object': item });
        }
        return;
      }

      this.mxEditorDragObject = null;
      this.modelEventService.onModelViewObjectDragEditor({ 'type': 'drag', 'object': null });

      this.dropItemActionTodo = {
        targetId: container.getAttribute('id'),
        targetType: container.getAttribute('data-type'),
        targetParentId: container.getAttribute('data-parent-id'),
        id: item.id,
        from_parent_id: parent_id,
        type: item.type
      };

      /**Cancel drop if dragging into wrong object*/
      if (
          (this.dropItemActionTodo.targetType == 'object' && item.type !== 'object') ||
          ['view','diagram'].indexOf(this.dropItemActionTodo.targetType) != -1
      ) {
        this.clearDragItemInfo();
        return;
      }

      // if (this.dropItemActionTodo.targetType == 'object') {
      //   this.dropItemActionTodo.targetId = container.getAttribute('data-parent-id');
      //   this.dropItemActionTodo.targetType = container.getAttribute('data-parent-type');
      // }

      const targetRect = container.getBoundingClientRect();
      const oneThird = targetRect.height / 1.5;
      //
      if (this.dropItemActionTodo.from_parent_id != this.dropItemActionTodo.targetId) {
        let action_type;
        if (event.pointerPosition.y - targetRect.top < oneThird) {
          action_type = 'before';
        } else {
          action_type = 'inside';
        }

        this.dropItemActionTodo.action = action_type;
        this.showDragItemInfo();
      }
    }
    else{
      this.clearDragItemInfo();
    }
  }

  showDragItemInfo() {
    if (this.dropItemActionTodo && this.dropItemActionTodo.targetId) {
      // this.document.getElementById(this.dropItemActionTodo.targetId).classList.add("drop-" + this.dropItemActionTodo.action);
    }
  }

  clearDragItemInfo(dropped = false) {
    /**Drag Drop*/
    this.dropItemActionTodo = null;
    this.modelService.clearDragDropClasses();
  }

  dragItemEnded(event) {
    /**If not in same directory*/
    if (this.mxEditorDragObject) {
      this.modelEventService.onModelViewObjectDragEditor({ 'type': 'drop', 'object': this.mxEditorDragObject, 'pointer_x': this.mxEditorDragObjectCoordinates.pointer_x, 'pointer_y': this.mxEditorDragObjectCoordinates.pointer_y });
    }
    else{
      /**Do not allow drag & drop inside Tree when Diagram is open*/
      if (!this.isMxGraphMode) {
        if (this.dropItemActionTodo && this.dropItemActionTodo.from_parent_id !== this.dropItemActionTodo.targetId) {
          let drop_items = [
            {
              id: this.dropItemActionTodo.id,
              type: this.dropItemActionTodo.type
            }
          ];
          let drop_item_ids = [this.dropItemActionTodo.id];
          /**Include target update*/
          let unique_parent_ids = [this.dropItemActionTodo.targetId];
          if (this.selectedMultipleItems.length) {
            for (let i=0; i<this.selectedMultipleItems.length; i++) {
              drop_items.push({
                id: this.selectedMultipleItems[i].id,
                type: this.selectedMultipleItems[i].type
              });

              if (unique_parent_ids.indexOf(this.selectedMultipleItems[i].parent_id) == -1) {
                unique_parent_ids.push(this.selectedMultipleItems[i].parent_id);
              }

              drop_item_ids.push(this.selectedMultipleItems[i].id);
            }
          }
          else{
            unique_parent_ids.push(this.dropItemActionTodo.from_parent_id);
          }

          // let multiple_selected_objects = this.selectedMultipleObjects;
          this.modelService.updateDragDropModelViewerStructure(this.loggedInUser['login_key'], drop_items, this.dropItemActionTodo.type, this.dropItemActionTodo.targetId, this.dropItemActionTodo.targetType).subscribe(data => {
            if (data.status) {
              /**Load new content & remove from UI*/
              for (let i=0; i<unique_parent_ids.length; i++) {
                this.modelViewCurrentSocket.emit('model_view_tree_drag_drop',{ parent_id: unique_parent_ids[i], drop_item_ids: drop_item_ids, target_id: this.dropItemActionTodo.targetId, target_parent_id: this.dropItemActionTodo.targetParentId })
              }
            }
          });
        }
      }

      this.modelEventService.onModelViewObjectDragEditor({ 'type': 'clear' });
    }

    this.modelService.clearDragDropClasses();
  }

  onSelectEditDiagram(event, item) {
    this.onModelViewItemSelect(event, item, false, true);
  }

  onRenderSafeSVG(svg) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
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
    switch (item.type) {
      case 'object':
        this.modelService.updateObjectName(this.loggedInUser['login_key'], item.name, this.renameObject.id).subscribe(data => {
          if (data.status) {
            this.toastCtrl.success('Object updated successfully')
            this.renameObject = {};
            this.modalService.dismissAll();
          }
          else{
            this.toastCtrl.info(data.error);
          }
        });
      break;
      case 'diagram':
        let diagram_rename_id = this.renameDiagram.id;
        this.modelService.updateDiagramName(this.loggedInUser['login_key'], item.name, diagram_rename_id).subscribe(data => {
          if (data.status) {
            this.toastCtrl.success('Diagram updated successfully')
            this.renameDiagram.name = item.name;
            this.renameDiagram.parent_id = this.parentId;
            /**Emit Socket*/
            if (this.modelViewCurrentSocket) {
              this.modelViewCurrentSocket.emit('pluto_model_diagram_rename', { name: item.name, diagram_id: diagram_rename_id });
            }
          }
          else{
            this.toastCtrl.info(data.error);
          }
        });
      break;
      case 'folder':
        this.modelService.updateModelFolder(this.loggedInUser['login_key'], item.name, 'folder', this.renameFolder.id).subscribe(data => {
          if (data.status) {
            this.toastCtrl.success('Folder updated successfully')
          }
          else{
            this.toastCtrl.info(data.error);
          }
        });
      break;
      case 'view':
        this.modelService.updateModelFolder(this.loggedInUser['login_key'], item.name, 'view', this.renameViewGenerator.id).subscribe(data => {
          if (data.status) {
            this.toastCtrl.success('View Generator updated successfully')
          }
          else{
            this.toastCtrl.info(data.error);
          }
        });
      break;
    }

    /**Emit Socket*/
    if (this.modelViewCurrentSocket) {
      this.modelViewCurrentSocket.emit('pluto_model_object_rename', {
        id: item.id,
        name: item.name,
        parent_id: this.parentId,
        type: item.type
      });
    }

    this.renameObject = {};
    this.renameDiagram = {};
    this.renameFolder = {};
    this.renameViewGenerator = {};
  }

  onCancelRename() {
    this.renameObject = {};
    this.renameDiagram = {};
    this.renameFolder = {};
    this.renameViewGenerator = {};
  }

  onDiagramDownload(event, item) {
    item.show_options = false;
    this.modelViewExpandOptions = {};
    this.modelService.getDiagramXMLContent(this.loggedInUser['login_key'],item.id).subscribe(data => {
      FileSaver.saveAs(new Blob([data.xml], {type: "text/plain;charset=utf-8"}), item.name + '.xml');
      this.modalService.dismissAll();
    });
    this.modalService.open(this.downloadingModal, { size : 'sm', centered: true });
  }

  onSelectDiagramFilesImport(id, parent_parent_id) {
    this.modelFolderOptionId = null;
    this.modelViewExpandOptions = {};
    this.modelEventService.onModelViewDiagramImport({ model_id: this.parentModelId, parent_id: id, parent_parent_id: parent_parent_id });
  }

  /**Root Model Right Click options*/
  onModelCreateOptions(event, element) {
    document.getElementById(element).click();
  }

  onModelDelete(event, item) {
    this.modelViewExpandOptions = {};
    this.deleteItem = { item: item, type: 'model' };
    this.showDeleteDiagramButton = this.showDeleteDiagramButtonLoading = false;
    this.modalService.open(this.confirmDeleteItemModal, { size : 'sm', centered: true });
  }

  onModelFolderItemCopy(event, item) {
    this.modelViewExpandOptions = {};
    this.modelEventService.onModelViewCopyPaste({ action : 'copy' });
    this.toastCtrl.success('Successfully copied to clipboard');
  }

  onModelFolderItemPaste(event, item) {
    this.modelViewExpandOptions = {};
    this.modelEventService.onModelViewCopyPaste({ id : item.id, name: item.name, parent_id: this.parentId, type: item.type, model_id: this.parentModelId ? this.parentModelId : item.id, action : 'paste' });
  }

  disableDragItem(item):boolean{
    return this.renameDiagram.id == item.id;
  }

  onExpandChildItemRemoved(data) {
    this.modelViewCurrentSocket.emit('handle_item_has_child_flag',{ data: data, parent_parent_id: this.parentId });
  }

  setHasChildsArrow(id) {
    for (let i=0; i<this.items.length; i++) {
      if (this.items[i].id == id) {
        this.items[i].has_childs = true;
      }
    }
  }

  onObjectDoubleClick(item) {
    /**Append to Diagram Editor*/
    if (this.isMxGraphMode) {
      this.modelEventService.onModelViewObjectDragEditor({ 'type': 'drop', 'object': item, 'pointer_x': 0, 'pointer_y': 0 });
    }
  }

  onObjectChainClick(event, item) {
    this.modelEventService.onModelViewChainItem({
      id: item.id,
      name: item.name,
      model_id: this.parentModelId
    });
  }

  /**Permissions*/
  onOpenPermissionsModal(item){
    this.modelViewExpandOptions = {};
    this.permissions = [];
    this.permissionsCurrentPage = this.permissionsMaxPage = 1;
    this.isPermissionsLoading = true;
    this.selectedPermissionOptions = { id: item.id, name: item.name, type: item.type };
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
    this.modelViewExpandOptions = {};
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

  onOpenChangeLog(item) {
    this.modelViewExpandOptions = {};
    this.modelEventService.onModelViewChangeLogSubjectModal({ id: item.id, name: item.name, type: item.type, parent_id: this.parentId, parent_model_id: this.parentModelId });
  }

  isCheckedItem(item, type):boolean {
    switch (type) {
      case 'folder':
        return this.selectedFolderId == item.id || this.selectedMultipleItems.filter(data => data.id == item.id && data.type == 'folder').length;
      break;
      case 'object':
        return this.selectedObjectIds.indexOf(item.id) != -1 || this.selectedMultipleItems.filter(data => data.id == item.id && data.type == 'object').length;
      break;
      case 'diagram':
        return this.selectedDiagramId == item.id || this.selectedMultipleItems.filter(data => data.id == item.id && data.type == 'diagram').length;
      break;
      case 'view':
        return this.selectedViewGeneratorId == item.id || this.selectedMultipleItems.filter(data => data.id == item.id && data.type == 'view').length;
      break;
    }
  }

  onCheckOnlyObjectsSelected():boolean{
    return !this.selectedMultipleItems.filter(data => data.type != 'object').length;
  }

  allowPasteToObject():boolean{
    return this.modelViewFolderCopyOptions.length && !this.selectedMultipleItems.filter(data => data.type != 'object').length;
  }
}
