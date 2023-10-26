import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  HostListener,
  Inject,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EventsService } from "../../shared/EventService";
import { AuthService } from "../../auth/auth.service";
import { ModelService } from "../model.service";
import { AttributeTypeService } from "../../metamodel/attribute-type/attribute-type.service";
import { ToastrService } from "ngx-toastr";
import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModelEventService } from "./ModelEventService";
import { environment } from "../../../environments/environment";
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DOCUMENT } from "@angular/common";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { DomSanitizer, Title } from "@angular/platform-browser";
import * as SvgPanZoom from "svg-pan-zoom";
import { ViewGenerationEventService } from "./view-generation/ViewGenerationEventService";
import { DiagramTypeService } from "../../metamodel/diagram-type/diagram-type.service";
import { UsersService } from "../../administration/users/users.service";
import { ModelManagerEventService } from "../ModelManagerEventService";
import { HelperService } from "../../shared/HelperService";
import { SettingsService } from "../../administration/settings/settings.service";
import { RelationshipTypeService } from "../../metamodel/relationship-type/relationship-type.service";

export function checkDecimal(value, min, max, decimal_places) {
  if (value == null || value == "") {
    return null;
  }

  let user_value = parseFloat(value);
  if (
    isNaN(user_value) ||
    (min && user_value < parseFloat(min)) ||
    (max && user_value > parseFloat(max))
  ) {
    return { invalid_decimal: true };
  } else {
    if (Math.floor(user_value) === user_value) {
      return null;
    } else {
      let decimal_places_found =
        user_value.toString().split(".")[1].length || 0;
      if (decimal_places && decimal_places_found > decimal_places) {
        return { invalid_decimal: true };
      }
    }
  }

  return null;
}

export function checkInteger(value, min, max) {
  if (value == null || value == "") {
    return null;
  }

  let user_value = parseInt(value);

  if (
    isNaN(user_value) ||
    (min && user_value < parseFloat(min)) ||
    (max && user_value > parseFloat(max)) ||
    value.toString().includes(".")
  ) {
    return { invalid_integer: true };
  }

  return null;
}

export function checkDecimalFieldValue(min, max, decimal_places): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return checkDecimal(control.value, min, max, decimal_places);
  };
}

export function checkIntegerValue(min, max): ValidatorFn {
  return (control: UntypedFormControl): ValidationErrors | null => {
    return checkInteger(control.value, min, max);
  };
}

@Component({
  selector: "app-view-model",
  templateUrl: "./view-model.component.html",
  styleUrls: ["./view-model.component.css"],
})
export class ViewModelComponent implements OnInit {
  @ViewChild("modelKeywordSearchEl") modelKeywordSearchEl: ElementRef;
  @ViewChild("excelPasteErrorModal") excelPasteErrorModal: NgbModal;
  @ViewChild("deleteInlineEditorObjectModal")
  deleteInlineEditorObjectModal: NgbModal;
  @ViewChild("diagramSvgContainerEl") diagramSvgContainerEl: ElementRef;
  @ViewChild("viewEditorContainerEl") viewEditorContainerEl: ElementRef;
  @ViewChild("saveViewModal") saveViewModal: NgbModal;
  @ViewChild("copyPasteModelViewModal") copyPasteModelViewModal: NgbModal;
  @ViewChild("openMultipleModelsModal") openMultipleModelsModal: NgbModal;
  @ViewChild("diagramReuseObjectModal") diagramReuseObjectModal: NgbModal;
  @ViewChild("diagramReuseRelationshipsModal") diagramReuseRelationshipsModal: NgbModal;
  @ViewChild("changeLogModal") changeLogModal: NgbModal;
  @Input() modelIds: any;
  @Output() exportViewMode = new EventEmitter<string>();
  generatedSvg: string;
  modelActivePage: string;
  models: any;
  loggedInUser: any;
  firstLoad: boolean;
  showModelMenu: boolean;
  expandedTreeModelObjects: any;
  objectIdNames: any;
  generalTabExpanded: boolean;
  displayTabOptions: any;
  keyword: string;
  isTreeMenuActive: boolean;
  defaultPageTitle: string;
  diagramNewTab: boolean;
  diagramExitBehavior: string;
  available_iframe_height: number;
  showOnlyHeader: boolean;
  leftSidebarWidth: number;
  modelViewFolderCopyOptions: any;
  modelViewPasteOptions: any;
  currentPageDetails: {
    token: string;
    expandedFolderIds: any;
    expandedObjectIds: any;
    expandedModelsIds: any;
    currentActivePage: string;
    selectedModelIds: any;
    selectedObjectIds: any;
    selectedDiagramIds: any;
    selectedFolderIds: any;
    selectedViewsIds: any;
  };
  defaultObjectCreateData: any;
  isLoadingMultipleModels: boolean;
  mainSettings: any;
  chainObjectRelationshipOptions: any;
  isChainRelationshipModal: boolean;
  diagramDeleteItems: any;
  diagramObjectReuseOptions: any;
  diagramObjectReuseRelationships: any;
  promptDiagramReuseRelationships: boolean = false;
  selectedMultipleItems: any;
  @ViewChild("diagramObjectRelationshipModal")
  diagramObjectRelationshipModal: NgbModal;
  openDiagramIds: any;

  /**Add Relationship*/
  @ViewChild("relationshipCreateModal") relationshipCreateModal: NgbModal;
  relationshipCreateForm: UntypedFormGroup;
  hasRelationshipCreateFormSubmitted: boolean;
  hasRelationshipCreateFormLoading: boolean;
  relationshipToObjects: any;
  relationshipCreateTypes: any;
  selectedRelationshipTypeId: string;
  relationshipObjectSplit: string;
  lastAddedRelationshipTypeId: string;
  relationshipDiagrams: any;

  /**Open Models*/
  modelOpenItems: any;
  currentOpenModelsPage: number;
  totalOpenModelPages: number;
  showOpenModelPagination: boolean;
  modelOpenSelectedModels: any;

  /**Inline Editor*/
  allSelectedItemObj: any;
  isMultipleColumnOrdering: boolean;
  inlineEditorActiveTab: string;

  /**Properties Page*/
  objectAttributesForm: UntypedFormGroup;
  selectedObjectIds: any;
  selectedMultipleObjects: any;
  selectedFolderId: number;
  selectedModelId: any;
  selectedViewGeneratorId: any;
  selectedDiagramId: any;
  selectedDiagramDetails: any;
  selectedDiagramParentId: any;
  selectedDiagramSVG: any;
  selectedDiagramSVGPaddingLeft: number;
  selectedDiagramSVGPaddingTop: number;
  selectedDiagramSVGLoading: boolean;
  isLoadingPropertiesPage: boolean;
  modelObjectTypesSelected: any;
  modelObjectAttributes: any;
  isLoadingPropertiesAttributes: boolean;
  showStandAlonePage: boolean;
  standAlongPageUrl: string;
  modelFolderInfo: any;
  editModelFolderDescription: boolean;
  modelFolderInfoForm: UntypedFormGroup;
  sharedObjectProperties: any;
  sharedObjectAttributeIds: any;
  sharedObjectAttributeValues: any;
  editPropertiesMode: boolean;
  showEditAllButton: boolean;
  noSharedObjectAttributesFound: boolean;
  selectedPropertiesTabIndex: number;
  objectAttributeTabs: any;
  hideGeneralTabModifiableAttributes: boolean;

  /**Inline Editors Page*/
  isLoadingInlineEditorPage: boolean;
  inlineEditorAttributes: any;
  objectInlineAttributesForm: UntypedFormGroup;
  relationshipInlineAttributeForm: UntypedFormGroup;
  isInlineEditorAttributesLoading: boolean;
  inlineAvailableAttributesForm: UntypedFormGroup;
  inlineEditorSelectedAttributes: any;
  inlinePages: number;
  inlineCurrentPage: number;
  maxShowInlinePage: any;
  showInlinePagination: boolean;
  inlineModalLoading: boolean;
  inlineModalAttributePages: number;
  inlineModalCurrentPage: number;
  inlineModalMaxShowPage: any;
  inlineModalPagination: boolean;
  inlineModalAttributes: any;
  showInlineModalAttributes: boolean;
  inlineEditorModelColumnWidth: number;
  inlineEditorObjectNameColumnWidth: number;
  inlineEditorFromObjectColumnWidth: number;
  inlineEditorRelationshipColumnWidth: number;
  inlineEditorToObjectColumnWidth: number;
  inlineEditorSystemPropertyColumnWidths: any;
  inlineEditorActiveCellData: any;
  inlineExcelPasteValidationError: any;
  settings: any;
  dateFormatMask: any;
  inlineEditorSelectedSystemProperties: any;
  inlineEditorActiveRowData: any;
  inlineEditorTableWidth: number;
  inlineEditorTableFirstColumnWidth: number;
  inlineEditorTableAttributesColumnWidth: number;
  inlineEditorRowContextMenuOptions: any;
  inlineEditorUniqueNum: string;
  inlineEditorLastDeletedObjects: any;
  inlineEditorLastDeletedRelationships: any;

  /**View Generator*/
  hasViewGenerated: boolean;
  expandViewFilterExpandOptions: any;
  viewGeneratorAvailableObjectTypes: any;
  viewGeneratorAvailableRelationshipTypes: any;
  viewGeneratorGroupRelationshipTypes: any;
  viewGeneratorGroupObjectTypes: any;
  viewGeneratorRelationshipTypesAttributes: any;
  viewGeneratorAvailableAttributeTypes: any;
  viewGeneratorSelectedFilterObjectTypes: any;
  viewGeneratorSelectedFilterRelationshipTypes: any;
  viewGeneratorSelectedGroupOptions: any;
  viewGeneratorSelectedlevelOptions: any;
  viewGeneratorSelectedModelFolderObject: any;
  viewGeneratorReportType: string;
  viewGeneratorSelectedLayout: string;
  viewGeneratorRelationshipAttribute: string;
  isViewGeneratorLoading: boolean;
  isViewGeneratorFiltersLoading: boolean;
  viewGeneratorData: any;
  viewGeneratorGroups: any;
  viewGeneratorObjectIds: any;
  viewGeneratorContainerWidth: number;
  viewGeneratorContainerCurrentWidth: number;
  saveModelForm: UntypedFormGroup;
  allObjectIdsContainedInView: any;

  /**Inline Editor Object Create*/
  @ViewChild("inlineEditorNewObjectNameRef")
  inlineEditorNewObjectNameRef: ElementRef;
  availableObjectTypes: any;
  availableInlineObjects: any;
  availableInlineRelationships: any;

  /**Relationships Page*/
  isLoadingRelationshipsPage: boolean;

  /**Change Log*/
  changeLogsLoading: boolean;
  changeLogs: any;
  changeLogsPages: number;
  changeLogCurrentPage: number;
  changeLogBackLoading: boolean;
  changeLogOptions: any;
  changeLogIds: any;

  /**Observables*/
  modelViewSelectedObjectsSubscriber: any;
  modelViewCreateModelSubscriber: any;
  modelViewFolderSelectedSubscriber: any;
  modelViewModelSelectedSubscriber: any;
  modelViewModelClosedSubscriber: any;
  modelViewInlineEditorPrefillCompletedSubscriber: any;
  modelViewInlineEditorUncheckSelectedRowSubscriber: any;
  modelViewObjectDragEditorSubscriber: any;
  modelViewDiagramSelectedSubscriber: any;
  modelViewNewDiagramCreatedSubscriber: any;
  modelViewGeneratorSelectedSubscriber: any;
  modelViewDiagramImportSubscriber: any;
  modelViewExportPositionsReceivedSubscriber: any;
  modelViewerCopyPasteSubscriber: any;
  modelViewDeleteObjectsSubscriber: any;
  modelViewCurrentPageStateSubscriber: any;
  modelViewObjectTypeCreateStateSubscriber: any;
  modelOpenModelCheckedSubscriber: any;
  modelViewChainItemSubscriber: any;
  modelOpenRelationshipModalSubscriber: any;
  modelViewChangeLogSubscriber: any;

  /**SocketIO & MX Graph Editor Properties*/
  showDragToEditorLoader: boolean;
  isObjectDragToEditor: boolean;
  mxEditorModeEnabled: boolean;
  mxEditorHideTreeViewModeEnabled: boolean;
  mxEditorIframeCode: any;
  mxEditorUniqueCode: string;
  mxEditorLoading: boolean;
  mxEditorObjectShapeDetails: any;
  mxEditorDiagramImportIframe: any;
  diagram_socket: any;
  modelViewSocket: any;
  modelBrowserSocket: any;

  /**Diagram SVG Properties*/
  diagramSvgPanZoom: SvgPanZoom.Instance = null;
  diagramSvgPanZoomOptions: any;
  needsToInitDiagramSvgPanZoom = false;

  /**Import Diagram*/
  @ViewChild('processingModal') processingModal: NgbModal;
  @ViewChild('importDiagramModal') importDiagramModal: NgbModal;
  @ViewChild('diagramImportFileEl') diagramImportFileEl: ElementRef;
  @ViewChild('exportViewGeneratorModal') exportViewGeneratorModal: NgbModal;
  @ViewChild('tdElement') tdElement: ElementRef; // Reference to the td element
  @ViewChild('tdForDropDown') tdForDropDown: ElementRef; // Reference to the td element

  diagramImportOptions: any;
  diagramImportedFiles: any;
  diagramImportSavedMappings: any;
  importDiagramForm: UntypedFormGroup;
  diagramTypesList: any;
  diagramTypesMaxPages: number;
  diagramTypesCurrentPage: number;
  isDiagramTypesListLoading: boolean;
  diagramImportMappingSubmitted: boolean;
  diagramImportSelectedFiles: any;
  diagramImportSelectedType: any;
  isDiagramImportLoading: boolean;
  diagramImportSVGSocket: any;
  diagramImportShowNameField: any;

  /**Export View Generator to Diagrams.net*/
  diagramExportSelectedType: any;
  isDiagramExportTypesLoading: boolean;
  isDiagramExportLoading: boolean;
  diagramExportFormSubmitted: boolean;
  exportViewGeneratorForm: UntypedFormGroup;
  exportDiagramTypesList: any;
  exportDiagramTypesCurrentPage: number;
  exportDiagramTypesMaxPages: number;
  error: boolean;
  errorMsg: string;
  private debounceSubject = new Subject<number>();
  modelsOriginal:any
  viewGeneratorFilterLevel: number = 2;
  numberOfLevels = [
    { level: 0, name: "0" },
    { level: 1, name: "1" },
    { level: 2, name: "2" },
    { level: 3, name: "3" },
    { level: 4, name: "4" },
    { level: 5, name: "5" },
    { level: 6, name: "6" },
    { level: 7, name: "7" },
    { level: 8, name: "8" },
  ];

  @HostListener("document:click", ["$event"])
  clicked(e) {
    if (e.target.closest(".field-select-container")) {
      this.inlineEditorActiveCellData = {};
    } else {
      this.showInlineModalAttributes = false;
    }

    if (!e.target.closest(".model_tree_view_options")) {
      this.modelEventService.onModelViewTreeItemExpanded(null);
    }

    if (!e.target.closest(".model_folder_options")) {
      this.modelEventService.onModelViewTreeItemModelFolderMenuExpanded(null);
    }

    if (!e.target.closest(".inline-editor-body")) {
      this.inlineEditorRowContextMenuOptions = {};
    }

    this.isTreeMenuActive = !!e.target.closest(".inner-sidebar");

    /**Diagram SVG Click*/
    if (e.target.closest(".content-viewer") && this.selectedDiagramSVG) {
      let object_id = e.target.getAttribute("pluto-object-id");
      let cell_xml = e.target.getAttribute("pluto-cell-xml");
      let relationship_id = e.target.getAttribute("pluto-relationship-id");
      let relationship_type_id = e.target.getAttribute(
        "pluto-relationship-type-id"
      );
      if (object_id || relationship_id || relationship_type_id || cell_xml) {
        this.onLoadDiagramSVGObjectDetails(
          object_id,
          relationship_id,
          relationship_type_id,
          cell_xml
        );
      }
    }

    /**View Generator*/
    if (!e.target.closest(".view-generator-container")) {
      this.expandViewFilterExpandOptions = {};
    }

    if (!e.target.closest(".manage-row-container")) {
      this.inlineEditorRowContextMenuOptions = {};
    }
  }

  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    if (this.isTreeMenuActive) {
      event.preventDefault();
      let current_element = null;
      if (this.selectedObjectIds.length) {
        current_element = document.getElementById(this.selectedObjectIds["0"]);
      } else if (this.selectedFolderId) {
        current_element = document.getElementById(
          this.selectedFolderId.toString()
        );
      } else if (this.selectedModelId) {
        current_element = document.getElementById(this.selectedModelId);
      } else if (this.selectedDiagramId) {
        current_element = document.getElementById(this.selectedDiagramId);
      }

      if (current_element) {
        let next_tree_element;
        if (event.key == "ArrowUp" && current_element.previousElementSibling) {
          next_tree_element = current_element.previousElementSibling;
        }

        if (event.key == "ArrowDown" && current_element.nextElementSibling) {
          next_tree_element = current_element.nextElementSibling;
        }

        if (next_tree_element) {
          let next_clickable =
            next_tree_element.getElementsByClassName("tree-link-item");
          if (next_clickable && next_clickable.length) {
            next_clickable["0"].click();
          }
        }
      }
    } else if (
      (event.key == "Backspace" || event.key == "Delete") &&
      this.modelActivePage == "in-line-editor" &&
      this.inlineEditorActiveRowData.id
    ) {
      this.modalService.open(this.deleteInlineEditorObjectModal, {
        centered: true,
      });
    }

    /**F2 key press*/
    if (event.key == "F2") {
      let active_item = document
        .getElementsByClassName("active-model-item")
        ["0"].getElementsByClassName("rename-item-btn");
      if (active_item.length) {
        let el: HTMLElement = active_item[0] as HTMLElement;
        el.click();
      }
    }

    /**CTRL+Z for deleted objects in Inline Editor*/
    if (event.keyCode == 90 && (event.ctrlKey || event.metaKey)) {
      if (this.inlineEditorLastDeletedObjects.length) {
        let deleted_objects = this.inlineEditorLastDeletedObjects;
        /**Revert back to avoid double click*/
        this.inlineEditorLastDeletedObjects = [];
        this.modalService.open(this.processingModal, {
          size: "sm",
          centered: true,
        });

        this.modelService
          .restoreDeletedObjects(
            this.loggedInUser["login_key"],
            deleted_objects
          )
          .subscribe((data) => {
            this.modalService.dismissAll();
            if (data.status) {
              if (data.items.length) {
                for (let i = 0; i < data.items.length; i++) {
                  if (
                    data.items[i].model_id &&
                    this.modelViewSocket[data.items[i].model_id]
                  ) {
                    this.modelViewSocket[data.items[i].model_id].emit(
                      "pluto_model_object_create",
                      {
                        parent_id: data.items[i].parent_id,
                        parent_parent_id: data.items[i].parent_parent_id,
                      }
                    );
                  }
                }
              }

              this.onPageChange("in-line-editor");
            } else {
              this.toastCtrl.error(data.error);
            }
          });
      } else if (this.inlineEditorLastDeletedRelationships.length) {
        let deleted_relationships = this.inlineEditorLastDeletedRelationships;
        /**Revert back to avoid double click*/
        this.inlineEditorLastDeletedRelationships = [];
        this.modalService.open(this.processingModal, {
          size: "sm",
          centered: true,
        });

        this.modelService
          .restoreDeletedRelationships(
            this.loggedInUser["login_key"],
            deleted_relationships
          )
          .subscribe((data) => {
            this.modalService.dismissAll();
            if (data.status) {
              this.onPageChange("in-line-editor");
            } else {
              this.toastCtrl.error(data.error);
            }
          });
      }
    }

    if (event.key == "Escape") {
      this.chainObjectRelationshipOptions = {
        from_object_id: "",
        from_object_name: "",
        to_object_id: "",
        to_object_name: "",
      };
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private authService: AuthService,
    private toastCtrl: ToastrService,
    private modelService: ModelService,
    private modalService: NgbModal,
    private modelEventService: ModelEventService,
    private attributeTypeService: AttributeTypeService,
    @Inject(DOCUMENT) private document: Document,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private viewGenerationEventService: ViewGenerationEventService,
    private diagramTypeService: DiagramTypeService,
    private userService: UsersService,
    private modelManagerEventService: ModelManagerEventService,
    private helperService: HelperService,
    private settingsService: SettingsService,
    private relationshipTypeService: RelationshipTypeService
  ) {
    /**Selected Object Changes*/
    this.modelViewSelectedObjectsSubscriber = this.modelEventService
      .getModelViewViewSelectedObservable()
      .subscribe((data) => {
        let has_different_types = false;
        if (data.multiple) {
          for (let i in data.ids) {
            let get_index = this.selectedObjectIds.indexOf(data.ids[i]);
            if (get_index == -1) {
              this.selectedObjectIds.push(data.ids[i]);
              this.selectedMultipleObjects.push({
                id: data.ids[i],
                name: data.name,
                parent_id: data.parent_id,
              });
            } else {
              this.selectedObjectIds.splice(get_index, 1);
              for (let t = 0; t < this.selectedMultipleObjects.length; t++) {
                if (this.selectedMultipleObjects[t].id == data.ids[i]) {
                  this.selectedMultipleObjects.splice(t, 1);
                }
              }
            }
          }

          let has_other_items = this.selectedMultipleItems.filter(
            (resp) => resp.type != "object"
          );
          has_different_types = !!has_other_items.length;
        } else {
          this.selectedFolderId = 0;
          this.selectedModelId = 0;
          this.selectedViewGeneratorId = 0;
          this.selectedObjectIds = data.ids;
          this.selectedMultipleObjects = [
            {
              id: data.ids[0],
              name: data.name,
              parent_id: data.parent_id,
            },
          ];

          this.selectedMultipleItems = [];
        }

        let has_added = this.selectedMultipleItems.filter(
          (resp) => resp.id == data.ids[0] && resp.type == "object"
        );
        if (has_added.length && data.multiple) {
          this.selectedMultipleItems = this.selectedMultipleItems.filter(
            (resp) => resp.id != data.ids[0]
          );
        } else {
          this.selectedMultipleItems.push({
            id: data.ids[0],
            name: data.name,
            parent_id: data.parent_id,
            model_id: data.parent_model_id,
            type: "object",
          });
        }

        if (!data.multiple && !this.mxEditorModeEnabled) {
          this.selectedDiagramId = 0;
        }

        /**Update Tab Options*/
        if (!has_different_types) {
          this.onShowTabs("object");
        }

        if (this.selectedObjectIds.length && !has_different_types) {
          if (
            !this.modelActivePage ||
            this.modelActivePage == "content-viewer"
          ) {
            this.modelActivePage = "view-generator";
          }

          if (!this.mxEditorModeEnabled) {
            this.onPageChange(this.modelActivePage);
          }
        } else {
          this.modelActivePage = "";
        }

        if (!this.objectIdNames[data.ids[0]]) {
          this.objectIdNames[data.ids[0]] = data.name;
        }

        /**Update current page stats*/
        if (!has_different_types) {
          this.currentPageDetails.selectedModelIds = [];
          this.currentPageDetails.selectedObjectIds = this.selectedObjectIds;
          this.currentPageDetails.selectedDiagramIds = [];
          this.currentPageDetails.selectedFolderIds = [];
          this.currentPageDetails.selectedViewsIds = [];
          this.onProcessCurrentStateSave();
        }

        /**Process selected objects*/
        this.handleAllSelectedItems("object", data);
      });

    /**Selected Folder*/
    this.modelViewFolderSelectedSubscriber = this.modelEventService
      .getModelViewFolderSelectedObservable()
      .subscribe((data) => {
        if (!data.multiple) {
          this.selectedMultipleItems = [];
        }

        this.mxEditorModeEnabled = false;
        this.mxEditorHideTreeViewModeEnabled = true;
        let first_selected = !this.selectedMultipleItems.length;
        if (first_selected) {
          this.selectedFolderId = data.id;
          this.selectedModelId = 0;
          this.selectedDiagramId = 0;
          this.selectedObjectIds = [];
          this.selectedMultipleObjects = [];
          this.selectedViewGeneratorId = 0;
          if (
            !this.modelActivePage ||
            this.modelActivePage == "content-viewer"
          ) {
            this.modelActivePage = "in-line-editor";
          }

          /**Update current page stats*/
          this.currentPageDetails.selectedModelIds = [];
          this.currentPageDetails.selectedObjectIds = [];
          this.currentPageDetails.selectedDiagramIds = [];
          this.currentPageDetails.selectedFolderIds = [data.id];
          this.currentPageDetails.selectedViewsIds = [];
          this.onProcessCurrentStateSave();

          this.onPageChange(this.modelActivePage);

          this.handleAllSelectedItems("folder", data.id);
          this.setNavigationPageChange(this.mxEditorModeEnabled);
          this.eventsService.onHeaderChange({ hide_header: false });
        }

        let has_added = this.selectedMultipleItems.filter(
          (resp) => resp.id == data.id && resp.type == "folder"
        );
        if (has_added.length) {
          this.selectedMultipleItems = this.selectedMultipleItems.filter(
            (resp) => resp.id != data.id
          );
        } else {
          this.selectedMultipleItems.push({
            id: data.id,
            name: data.name,
            parent_id: data.parent_id,
            model_id: data.parent_model_id,
            type: "folder",
          });
        }

        /**Update Tab Options*/
        this.onShowTabs("folder");
      });

    /**Selected Model*/
    this.modelViewModelSelectedSubscriber = this.modelEventService
      .getModelViewModelSelectedObservable()
      .subscribe((model_id) => {
        this.selectedMultipleItems = [];
        this.onModelSelect(model_id);
      });

    this.modelViewDiagramSelectedSubscriber = this.modelEventService
      .getModelViewDiagramSelectedObservable()
      .subscribe((data) => {
        if (data.edit_mode && this.openDiagramIds.indexOf(data.id) != -1) {
          this.toastCtrl.info("Diagram is already open in another browser");
          return false;
        }

        if (!data.multiple) {
          this.selectedMultipleItems = [];
        }

        let first_selected = !this.selectedMultipleItems.length;
        /**Update Tab Options*/
        this.selectedDiagramId = data.id;
        this.selectedDiagramDetails = {};

        if (this.diagramNewTab) {
          this.mxEditorModeEnabled = false;
        } else {
          this.mxEditorModeEnabled = !!data.edit_mode;
        }

        if (first_selected) {
          this.mxEditorHideTreeViewModeEnabled = true;
          this.setNavigationPageChange(this.mxEditorModeEnabled);
          this.eventsService.onHeaderChange({ hide_header: false });
          this.selectedDiagramParentId = data.parent_id;
          this.selectedModelId = 0;
          this.selectedFolderId = 0;
          this.selectedObjectIds = [];
          this.selectedMultipleObjects = [];

          /**Update current page stats*/
          this.currentPageDetails.selectedModelIds = [];
          this.currentPageDetails.selectedObjectIds = [];
          this.currentPageDetails.selectedDiagramIds = [data.id];
          this.currentPageDetails.selectedFolderIds = [];
          this.currentPageDetails.selectedViewsIds = [];
        }

        if (data.edit_mode) {
          this.handleDiagramNewTab();
        } else {
          if (first_selected) {
            this.onProcessCurrentStateSave();
          }

          this.modelActivePage =
            [
              "content-viewer",
              "properties",
              "in-line-editor",
              "relationships",
            ].indexOf(this.modelActivePage) == -1
              ? "content-viewer"
              : this.modelActivePage;
          this.onPageChange(this.modelActivePage);

          let has_added = this.selectedMultipleItems.filter(
            (resp) => resp.id == data.id && resp.type == "diagram"
          );
          if (has_added.length) {
            this.selectedMultipleItems = this.selectedMultipleItems.filter(
              (resp) => resp.id != data.id
            );
          } else {
            this.selectedMultipleItems.push({
              id: data.id,
              name: data.name,
              parent_id: data.parent_id,
              model_id: data.parent_model_id,
              type: "diagram",
            });
          }
        }

        this.onShowTabs("diagram");
      });

    this.modelViewGeneratorSelectedSubscriber = this.modelEventService
      .getModelViewGeneratorSelectedObservable()
      .subscribe((data) => {
        if (!data.multiple) {
          this.selectedMultipleItems = [];
        }

        let first_selected = !this.selectedMultipleItems.length;
        this.selectedModelId = 0;

        /**Update Tab Options*/
        if (first_selected) {
          this.selectedFolderId = 0;
          this.selectedDiagramId = 0;
          this.selectedObjectIds = [];
          this.selectedMultipleObjects = [];
          this.selectedViewGeneratorId = data.id;
          this.modelActivePage = "view-generator";

          /**Update current page stats*/
          this.currentPageDetails.selectedModelIds = [];
          this.currentPageDetails.selectedObjectIds = [];
          this.currentPageDetails.selectedDiagramIds = [];
          this.currentPageDetails.selectedFolderIds = [];
          this.currentPageDetails.selectedViewsIds = [
            this.selectedViewGeneratorId,
          ];
          this.onProcessCurrentStateSave();

          this.onPageChange(this.modelActivePage);
        }

        let has_added = this.selectedMultipleItems.filter(
          (resp) => resp.id == data.id && resp.type == "view"
        );
        if (has_added.length) {
          this.selectedMultipleItems = this.selectedMultipleItems.filter(
            (resp) => resp.id != data.id
          );
        } else {
          this.selectedMultipleItems.push({
            id: data.id,
            name: data.name,
            parent_id: data.parent_id,
            model_id: data.parent_model_id,
            type: "view",
          });
        }

        this.onShowTabs("view");
      });

    /**On Model Closed*/
    this.modelViewModelClosedSubscriber = this.modelEventService
      .getModelViewModelClosedObservable()
      .subscribe((id) => {
        for (let i in this.modelIds) {
          if (this.modelIds[i] == id) {
            this.modelIds.splice(i, 1);
          }
        }

        if (!this.modelIds.length) {
          this.onEditorClose();
        }
      });

    /**On Inline Editor Prefill Completed*/
    this.modelViewInlineEditorPrefillCompletedSubscriber =
      this.modelEventService
        .getModelViewInlineEditorPrefillCompletedObservable()
        .subscribe((data) => {
          this.onResizeCellHeightPrefill(
            data,
            this.inlineEditorActiveCellData.attribute_data,
            this.inlineEditorActiveCellData.object_start_index
          );
        });

    /**On Inline Editor Uncheck Selected Row*/
    this.modelViewInlineEditorUncheckSelectedRowSubscriber =
      this.modelEventService
        .getModelViewInlineEditorRowUncheckObservable()
        .subscribe(() => {
          this.inlineEditorActiveRowData = {};
          this.inlineEditorRowContextMenuOptions = {};
        });

    /**On Object Drag Editor*/
    this.modelViewObjectDragEditorSubscriber = this.modelEventService
      .getModelViewObjectDragEditorObservable()
      .subscribe((data) => {
        switch (data.type) {
          case "drag":
            this.showDragToEditorLoader = true;
            break;
          case "drop":
            this.showDragToEditorLoader = false;
            if (data.object.type == "object") {
              this.isObjectDragToEditor = true;
              this.modelService
                .getObjectShapeXML(
                  this.loggedInUser["login_key"],
                  this.selectedDiagramId,
                  data.object.id
                )
                .subscribe((shape_data) => {
                  if (shape_data.status) {
                    data.object.name = shape_data.object_name;

                    /**Handle Export Attributes*/
                    let exp_attributes = <any>shape_data.export_attributes;
                    if (exp_attributes) {
                      for (let i = 0; i < exp_attributes.length; i++) {
                        exp_attributes[i].mx_label = this.renderPropertiesValue(
                          exp_attributes[i],
                          true
                        );
                      }
                    }

                    this.diagram_socket.emit("object_drag_pluto", {
                      object: data.object,
                      shape_encoded_xml: shape_data.encoded_xml,
                      pointer_x: data.pointer_x,
                      pointer_y: data.pointer_y,
                      export_attributes: exp_attributes,
                    });
                  } else {
                    this.toastCtrl.info(
                      "Sorry this object cannot be used in this diagram"
                    );
                  }
                });
            } else {
              this.toastCtrl.info(
                "Only objects are allowed to be drag & dropped into Diagram"
              );
            }
            break;
          case "clear":
            this.showDragToEditorLoader = false;
            this.selectedObjectIds = [];
            this.selectedMultipleObjects = [];
            this.selectedMultipleItems = [];
            this.onPageChange(this.modelActivePage);
            break;
        }
      });

    this.modelViewNewDiagramCreatedSubscriber = this.modelEventService
      .getModelViewNewDiagramObservable()
      .subscribe((data) => {
        this.selectedDiagramParentId = data.parent_id;
        this.selectedModelId = 0;
        this.selectedFolderId = 0;
        this.selectedObjectIds = [];
        this.selectedMultipleObjects = [];
        this.selectedDiagramId = data.id;
        this.handleDiagramNewTab();
      });

    /**On Diagram Import*/
    this.modelViewDiagramImportSubscriber = this.modelEventService
      .getModelViewDiagramImportObservable()
      .subscribe((data) => {
        this.diagramImportOptions = {
          model_id: data.model_id,
          parent_id: data.parent_id,
          parent_parent_id: data.parent_parent_id,
        };

        this.diagramImportFileEl.nativeElement.value = null;
        this.diagramImportFileEl.nativeElement.click();
      });

    /**On Diagram Export*/
    this.modelViewExportPositionsReceivedSubscriber =
      this.viewGenerationEventService
        .getViewExportPositionsReceivedObservable()
        .subscribe((data) => {
          data.group_options = this.viewGeneratorSelectedGroupOptions;
          let d = <any>data;
          d.region = this.mainSettings.region;
          d.relationship_start_lines =
            this.relationshipTypeService.getStartLinesList();
          d.relationship_end_lines =
            this.relationshipTypeService.getEndLinesList();
          this.diagramImportSVGSocket.emit(
            "diagram_view_generation_box_export",
            d
          );
        });

    /**On Copy/Paste logic for tree items*/
    this.modelViewerCopyPasteSubscriber = this.modelEventService
      .getModelViewCopyPasteObservable()
      .subscribe((data) => {
        if (data.action == "copy") {
          this.modelViewFolderCopyOptions = this.selectedMultipleItems;
          this.modelViewPasteOptions = {};
        } else {
          this.modelViewPasteOptions = data;
          this.modalService.open(this.copyPasteModelViewModal, {
            size: "xl",
            centered: true,
            backdrop: "static",
            keyboard: false,
          });
          let copy_items = [];
          for (let i = 0; i < this.selectedMultipleItems.length; i++) {
            copy_items.push({
              id: this.selectedMultipleItems[i].id,
              type: this.selectedMultipleItems[i].type,
            });
          }
          this.modelService
            .modelFolderCopyPaste(
              this.loggedInUser["login_key"],
              copy_items,
              this.modelViewPasteOptions.id,
              this.modelViewPasteOptions.type
            )
            .subscribe((resp) => {
              this.modalService.dismissAll();
              if (resp.status) {
                this.modelEventService.onModelViewObjectCreateForChild(
                  this.modelViewPasteOptions
                );
                this.modelViewPasteOptions.parent_parent_id =
                  this.modelViewPasteOptions.parent_id;
                this.modelViewPasteOptions.parent_id =
                  this.modelViewPasteOptions.id;
                this.modelViewPasteOptions.pages = resp.pages;

                /**Show new created content & arrow icon for target*/
                if (this.modelViewSocket[data.model_id]) {
                  this.modelViewSocket[data.model_id].emit(
                    "pluto_model_folder_create",
                    this.modelViewPasteOptions
                  );
                }

                /**Clear selection*/
                this.modelViewFolderCopyOptions = {};
                this.modelViewPasteOptions = {};
                this.toastCtrl.success("Successfully pasted");
              } else {
                this.toastCtrl.error(resp.error);
              }
            });
        }
      });

    this.modelViewCurrentPageStateSubscriber = this.modelEventService
      .getModelViewCurrentPageStateObservable()
      .subscribe((data) => {
        switch (data.action) {
          case "expand":
            if (data.type == "model") {
              this.currentPageDetails.expandedModelsIds.push(data.id);
            } else if (data.type == "folder") {
              this.currentPageDetails.expandedFolderIds.push(data.id);
            } else if (data.type == "object") {
              this.currentPageDetails.expandedObjectIds.push(data.id);
            }
            break;
          case "collapse":
            let index_num;
            if (data.type == "model") {
              index_num = this.currentPageDetails.expandedModelsIds.indexOf(
                data.id
              );
              if (index_num != -1) {
                this.currentPageDetails.expandedModelsIds.splice(index_num, 1);
              }
            } else if (data.type == "folder") {
              index_num = this.currentPageDetails.expandedFolderIds.indexOf(
                data.id
              );
              if (index_num != -1) {
                this.currentPageDetails.expandedFolderIds.splice(index_num, 1);
              }
            } else if (data.type == "object") {
              index_num = this.currentPageDetails.expandedObjectIds.indexOf(
                data.id
              );
              if (index_num != -1) {
                this.currentPageDetails.expandedObjectIds.splice(index_num, 1);
              }
            }
            break;
        }

        this.onProcessCurrentStateSave();
      });

    this.modelViewObjectTypeCreateStateSubscriber = this.modelEventService
      .getModelObjectTypeCreateStateObservable()
      .subscribe((data) => {
        this.defaultObjectCreateData = data;
      });

    /**On Open Models Checked Subscriber*/
    this.modelOpenModelCheckedSubscriber = this.modelManagerEventService
      .getModelTreeCheckedObservable()
      .subscribe((data) => {
        if (data.checked) {
          let has_found = this.modelOpenSelectedModels.filter(
            (item) => item.id == data.id
          );
          if (!has_found.length) {
            this.modelOpenSelectedModels.push(data);
          }
        } else {
          this.modelOpenSelectedModels = this.modelOpenSelectedModels.filter(
            (item) => {
              if (item.id != data.id) {
                return item;
              }
            }
          );
        }
      });

    /**Object Chain Click Subscriber*/
    this.modelViewChainItemSubscriber = this.modelEventService
      .getModelViewChainItemObservable()
      .subscribe((data) => {
        if (
          this.chainObjectRelationshipOptions.from_object_id == data.id ||
          this.chainObjectRelationshipOptions.to_object_id == data.id
        ) {
          this.chainObjectRelationshipOptions = {
            from_object_id: "",
            from_object_name: "",
            to_object_id: "",
            to_object_name: "",
          };
        } else {
          if (this.chainObjectRelationshipOptions.from_object_id) {
            this.chainObjectRelationshipOptions.to_object_id = data.id;
            this.chainObjectRelationshipOptions.to_object_name = data.name;
            this.isChainRelationshipModal = true;
            this.onOpenRelationshipModal();
          } else {
            this.chainObjectRelationshipOptions.from_object_id = data.id;
            this.chainObjectRelationshipOptions.from_object_name = data.name;
          }
        }
      });

    /**Open Relationship Modal*/
    this.modelOpenRelationshipModalSubscriber = this.modelEventService
      .getOpenRelationshipModalObservable()
      .subscribe(() => {
        this.isChainRelationshipModal = false;
        this.chainObjectRelationshipOptions = {
          from_object_id: "",
          from_object_name: "",
          to_object_id: "",
        };
        this.onOpenRelationshipModal();
      });

    /**Open Change Log*/
    this.modelViewChangeLogSubscriber = this.modelEventService
      .getModelViewChangeLogSubjectObservable()
      .subscribe((data) => {
        this.changeLogOptions = data;
        this.changeLogsLoading = true;
        this.changeLogs = [];
        this.changeLogCurrentPage = this.changeLogsPages = 1;
        this.modalService.open(this.changeLogModal, {
          windowClass: "wider-modal import-diagrams",
          centered: true,
          size: "xl",
        });
        this.changeLogIds = [];
        this.loadChangeLogs(this.changeLogCurrentPage);
      });
  }

  ngAfterContentInit() {
    if (window.location.hash.length && window.location.hash !== "#model") {
      this.mxEditorModeEnabled = true;
    } else {
      this.showStandAlonePage = true;
      this.showOnlyHeader = false;
      // this.showStandAlonePage = document.getElementById('main_header') ? false : true;
      // console.log('AFTER INIT ',this.showStandAlonePage,document.getElementById('main_header'))
    }

    this.route.paramMap.subscribe((paramMap) => {
      let param_ids = paramMap.get("id");
      let token = paramMap.get("token");
      this.currentPageDetails = {
        currentActivePage: "",
        token: token,
        expandedFolderIds: [],
        expandedObjectIds: [],
        expandedModelsIds: [],

        selectedModelIds: [],
        selectedObjectIds: [],
        selectedDiagramIds: [],
        selectedFolderIds: [],
        selectedViewsIds: [],
      };

      /**Set token based data*/
      let is_diagram_open = false;
      this.modelService
        .getModelViewerCurrentState(this.loggedInUser["login_key"], token)
        .subscribe((data) => {
          if (data.status) {
            this.currentPageDetails = <any>data;
            let selected_tab = null;
            this.selectedObjectIds = this.currentPageDetails.selectedObjectIds;
            this.selectedModelId = this.currentPageDetails.selectedModelIds
              .length
              ? this.currentPageDetails.selectedModelIds[0]
              : null;
            this.selectedFolderId = this.currentPageDetails.selectedFolderIds
              .length
              ? this.currentPageDetails.selectedFolderIds[0]
              : null;

            if (!this.mxEditorModeEnabled) {
              this.selectedDiagramId = this.currentPageDetails
                .selectedDiagramIds.length
                ? this.currentPageDetails.selectedDiagramIds[0]
                : null;
            }

            this.selectedViewGeneratorId = this.currentPageDetails
              .selectedViewsIds.length
              ? this.currentPageDetails.selectedViewsIds[0]
              : null;
            if (this.selectedObjectIds.length) {
              selected_tab = "object";
            } else if (this.selectedModelId) {
              selected_tab = "model";
            } else if (this.selectedFolderId) {
              selected_tab = "folder";
            } else if (this.selectedDiagramId) {
              selected_tab = "diagram";
            } else if (this.selectedViewGeneratorId) {
              selected_tab = "view";
            }

            if (selected_tab) {
              this.onShowTabs(selected_tab);
            }

            if (this.currentPageDetails.currentActivePage) {
              if (!is_diagram_open) {
                is_diagram_open = true;
                this.onPageChange(this.currentPageDetails.currentActivePage);
              }
            }
          }
        });

      if (!this.modelIds && param_ids) {
        this.modelIds = paramMap.get("id").split("&");
        this.standAlongPageUrl = "";
        /**If Diagram ID Available*/
        if (window.location.hash) {
          let hash_data = window.location.hash.substring(1);
          if (hash_data !== "model") {
            this.selectedDiagramId = window.location.hash.substring(1);
            this.displayTabOptions.content_viewer = true;
            this.displayTabOptions.properties = true;
            this.displayTabOptions.in_line_editor = false;
            this.displayTabOptions.view_generator = true;
            this.displayTabOptions.relationships = false;
            this.mxEditorModeEnabled = true;
            this.mxEditorHideTreeViewModeEnabled = true;
            this.selectedModelId = 0;
            this.selectedFolderId = 0;
            this.selectedObjectIds = [];
            this.selectedMultipleObjects = [];
            this.modelActivePage = "diagram-editor";

            if (!is_diagram_open) {
              is_diagram_open = true;
              this.onPageChange(this.modelActivePage);
            }
          }
        }

        this.setNavigationPageChange(this.mxEditorModeEnabled);
        this.eventsService.onHeaderChange({ hide_header: false });
      } else if (this.modelIds) {
        this.standAlongPageUrl =
          environment.app_url +
          "/model/" +
          this.modelIds.join("&") +
          "/" +
          uuidv4() +
          "/view";
      }

      /**Connect to Model Socket*/
      this.setModelViewSocketFor(this.modelIds);
      this.modelService
        .modelFolderExpand(
          this.loggedInUser["login_key"],
          this.modelIds,
          "",
          "details",
          1,
          "model_folder",
          token
        )
        .subscribe((data) => {
          if (data.status) {
            this.leftSidebarWidth = data.model_viewer_left_sidebar_width
              ? data.model_viewer_left_sidebar_width
              : environment.model_viewer_default_left_sidebar_width;
            let has_token_data = false;
            for (let i = 0; i < data.models.length; i++) {
              if (data.models[i].items.length) {
                has_token_data = true;
                data.models[i].expand = true;
              }
            }

            if (!has_token_data) {
              data.models["0"]["pre_load"] = true;
            }

          this.models = data.models;
          this.modelsOriginal = [...data.models]
          this.firstLoad = true;
        }
        else {
          this.toastCtrl.info('Model not found');
        }
      });

      this.modelService
        .getDiagramSettings(this.loggedInUser["login_key"])
        .subscribe((data) => {
          this.diagramNewTab = data.diagram_new_tab;
          if (this.mxEditorModeEnabled) {
            if (this.selectedDiagramId && this.diagramNewTab) {
              this.showStandAlonePage = false;
            }
          }
        });
    });
  }

  ngAfterViewChecked() {
    if (this.needsToInitDiagramSvgPanZoom && this.diagramSvgContainerEl) {
      if (this.diagramSvgPanZoom) {
        this.diagramSvgPanZoom.destroy();
      }

      this.diagramSvgPanZoom = SvgPanZoom(
        "#diagram_svg_container svg:first-child",
        {
          zoomEnabled: true,
          controlIconsEnabled: false,
          fit: true,
          center: true,
          panEnabled: true,
        }
      );

      this.diagramSvgPanZoom.enableDblClickZoom();
      this.needsToInitDiagramSvgPanZoom = false;
      this.diagramSvgPanZoom.zoom(0.7);

      let svg_zoom_options = this.diagramSvgPanZoom.getPan();
      this.diagramSvgPanZoomOptions = {
        svg_x: svg_zoom_options.x,
        svg_y: svg_zoom_options.y,
        document_x: this.diagramSvgContainerEl.nativeElement.clientWidth,
        document_y: this.diagramSvgContainerEl.nativeElement.clientHeight,
      };
    }
  }

  ngOnInit(): void {
    this.generalTabExpanded = false;
    this.modelActivePage = "";
    this.keyword = "";
    this.firstLoad = false;
    this.showModelMenu = false;
    this.selectedObjectIds = [];
    this.selectedMultipleObjects = [];
    this.selectedFolderId = 0;
    this.selectedModelId = 0;
    this.selectedDiagramId = 0;
    this.selectedDiagramDetails = {};
    this.models = [];
    this.expandedTreeModelObjects = [];
    this.objectIdNames = [];
    this.showStandAlonePage = false;
    this.displayTabOptions = {
      content_viewer: true,
      properties: true,
      in_line_editor: true,
      view_generator: true,
      relationships: true,
    };
    this.defaultPageTitle = this.titleService.getTitle();
    this.isTreeMenuActive = true;
    this.diagramNewTab = false;
    this.selectedDiagramSVGLoading = false;
    this.selectedDiagramSVG = {};
    this.selectedDiagramSVGPaddingLeft = 0;
    this.selectedDiagramSVGPaddingTop = 0;
    this.available_iframe_height = 600;
    this.showOnlyHeader = false;
    this.leftSidebarWidth = 337;
    this.modelViewFolderCopyOptions = {};
    this.currentPageDetails = {
      token: "",
      currentActivePage: "",
      expandedFolderIds: [],
      expandedObjectIds: [],
      expandedModelsIds: [],

      selectedModelIds: [],
      selectedObjectIds: [],
      selectedDiagramIds: [],
      selectedFolderIds: [],
      selectedViewsIds: [],
    };
    this.isMultipleColumnOrdering = false;
    this.defaultObjectCreateData = {};
    this.modelOpenItems = [];
    this.modelOpenSelectedModels = [];
    this.chainObjectRelationshipOptions = {
      from_object_id: "",
      from_object_name: "",
      to_object_id: "",
    };
    this.selectedRelationshipTypeId = "";
    this.relationshipObjectSplit = "__##__";
    this.selectedMultipleItems = [];

    /**Properties Page*/
    this.isLoadingPropertiesPage = false;
    this.isLoadingPropertiesAttributes = false;
    this.modelObjectTypesSelected = [];
    this.modelObjectAttributes = [];
    this.objectAttributesForm = new UntypedFormGroup({});
    this.sharedObjectProperties = [];
    this.sharedObjectAttributeIds = [];
    this.sharedObjectAttributeValues = [];
    this.editPropertiesMode = false;
    this.showEditAllButton = true;
    this.noSharedObjectAttributesFound = false;
    this.openDiagramIds = [];
    this.selectedPropertiesTabIndex = -1;
    this.objectAttributeTabs = [];
    this.hideGeneralTabModifiableAttributes = false;

    /**Inline Editors Page*/
    this.isLoadingInlineEditorPage = false;
    this.inlineEditorAttributes = [];
    this.isInlineEditorAttributesLoading = false;
    this.objectInlineAttributesForm = new UntypedFormGroup({});
    this.inlineAvailableAttributesForm = new UntypedFormGroup({});
    this.relationshipInlineAttributeForm = new UntypedFormGroup({});
    this.inlinePages = 0;
    this.inlineCurrentPage = 1;
    this.showInlinePagination = false;
    this.inlineEditorSelectedAttributes = [];
    this.allSelectedItemObj = {
      model_id: null,
      folder_id: null,
      model_objects: [],
    };
    this.inlineEditorSelectedSystemProperties = {};
    this.inlineEditorSystemPropertyColumnWidths = {
      created_by: 142,
      created_date: 142,
      updated_by: 142,
      updated_date: 142,
      object_type: 142,
      description: 142,
    };
    this.inlineEditorRowContextMenuOptions = {};
    this.inlineModalAttributePages = 1;
    this.inlineModalCurrentPage = 1;
    this.inlineModalPagination = false;
    this.inlineModalAttributes = [];
    this.inlineModalLoading = false;
    this.showInlineModalAttributes = false;
    this.inlineEditorActiveCellData = {
      object_id: null,
      attribute_id: null,
      attribute_data: null,
      object_start_index: null,
    };
    this.inlineEditorActiveRowData = {};
    this.inlineEditorRowContextMenuOptions = {};
    this.inlineEditorTableFirstColumnWidth = 50;
    this.inlineEditorTableAttributesColumnWidth = 142;
    this.inlineEditorLastDeletedObjects = [];
    this.inlineEditorLastDeletedRelationships = [];
    this.availableInlineObjects = [];
    this.availableInlineRelationships = [];

    /**View Generator*/
    this.hasViewGenerated = false;
    this.expandViewFilterExpandOptions = {};
    this.isViewGeneratorLoading = false;
    this.viewGeneratorAvailableObjectTypes = {
      current_model_types: [],
      other_model_types: []
    };
    this.viewGeneratorAvailableRelationshipTypes = {
      current_model_types: [],
      other_model_types: []
    };
    this.viewGeneratorGroupRelationshipTypes = [];
    this.viewGeneratorGroupObjectTypes = [];
    this.viewGeneratorRelationshipTypesAttributes = [];
    this.viewGeneratorRelationshipTypesAttributes = [];
    this.viewGeneratorAvailableAttributeTypes = [];
    this.viewGeneratorSelectedFilterObjectTypes = [];
    this.viewGeneratorSelectedFilterRelationshipTypes = [];
    this.viewGeneratorSelectedGroupOptions = {};
    this.viewGeneratorSelectedlevelOptions = {};
    this.viewGeneratorSelectedModelFolderObject = {
      ids: null,
      type: "",
    };
    this.isViewGeneratorFiltersLoading = false;
    this.viewGeneratorData = [];
    this.viewGeneratorGroups = [];
    this.viewGeneratorObjectIds = [];
    this.viewGeneratorReportType = "box";
    this.viewGeneratorRelationshipAttribute = "";

    /**Relationships Page*/
    this.isLoadingRelationshipsPage = false;

    /**MX Graph Editor Properties*/
    this.mxEditorUniqueCode = uuidv4();
    this.isObjectDragToEditor = false;
    this.diagram_socket = null;
    this.modelViewSocket = {};
    this.mxEditorLoading = false;
    this.mxEditorModeEnabled = false;
    this.mxEditorHideTreeViewModeEnabled = true;
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.modelBrowserSocket = io(environment.editor_node_app_url, {
      query: {
        model_viewer: "model_view_page",
        from: "PlutoUI",
        get_open_diagrams: true,
      },
    });

    this.modelBrowserSocket.on("diagram_open_handle", (data) => {
      if (data.diagram_id == this.selectedDiagramId) {
        console.log("EMIT received");
        this.toastCtrl.info("Diagram is already open by " + data.user);
        this.router.navigateByUrl(
          "model/" +
            this.modelIds.join("&") +
            "/" +
            this.currentPageDetails.token +
            "/view"
        );
      }
    });

    /**When Diagram Type removed, update popup diagram type options if is open*/
    this.modelBrowserSocket.on("pluto_diagram_type_removed", (data) => {
      let diagram_modal = document.getElementById("create_diagram_modal");
      if (diagram_modal) {
        let diagram_modal_parent = diagram_modal.getAttribute("data-parent");
        this.modelEventService.onModelViewDiagramTypeDeletedSubject({
          parent: diagram_modal_parent,
          diagram_types: data,
        });
      }
    });

    this.modelBrowserSocket.on("model_view_model_deleted", (data) => {
      let match_found = false;
      for (let i = 0; i < this.models.length; i++) {
        if (this.models[i].id == data) {
          this.models.splice(i, 1);
          match_found = true;
        }
      }

      if (match_found) {
        let index_num = this.modelIds.indexOf(data);
        if (index_num != -1) {
          this.modelIds.splice(index_num, 1);
        }

        if (!this.modelIds.length) {
          this.router.navigateByUrl("model");
        }
      }
    });

    this.modelBrowserSocket.on("mx_editor_xml_updated", (data) => {
      if (this.selectedDiagramId == data.diagram_id) {
        if (this.diagram_socket) {
          this.diagram_socket.emit("mx_editor_xml_update_process", data);
        }

        if (this.modelActivePage == "content-viewer") {
          this.onPageChange("content-viewer");
        }
      }
    });

    this.modelBrowserSocket.on("model_manager_item_rename", (data) => {
      for (let i = 0; i < this.models.length; i++) {
        if (this.models[i].id == data.id) {
          this.models[i].name = data.name;
        }
      }
    });

    this.modelBrowserSocket.on("properties_page_changes", (data) => {
      switch (this.modelActivePage) {
        case "properties":
          let has_match_found = false;
          if (data.type == "objects") {
            for (let i in this.sharedObjectProperties) {
              if (data.object_ids.indexOf(i) != -1) {
                has_match_found = true;
              }
            }
          }

          if (data.type == "description") {
            if (
              this.selectedModelId == data.id ||
              this.selectedDiagramId == data.id ||
              this.selectedFolderId == data.id ||
              this.selectedViewGeneratorId == data.id
            ) {
              has_match_found = true;
            }
          }

          if (has_match_found) {
            /**Trigger Page Change to Display the Properties in view mode*/
            this.onPageChange("properties");
          }
          break;
        case "in-line-editor":
          /**Do not reload current window, only other browser tabs*/
          if (this.inlineEditorUniqueNum != data.ui_num) {
            for (let i in this.inlineEditorAttributes) {
              if (data.object_ids.indexOf(i) != -1) {
                this.loadInlineAttributes(this.inlineCurrentPage);
              }
            }
          }

          break;
      }
    });

    /**On model organize refresh to page 1*/
    this.modelBrowserSocket.on("model_organize", (data) => {
      if (this.modelIds.indexOf(data.model_id) !== -1) {
        this.modelService
          .modelFolderExpand(
            this.loggedInUser["login_key"],
            [data.model_id],
            "",
            "details",
            1,
            "model_folder",
            this.loggedInUser["login_key"]
          )
          .subscribe((resp) => {
            if (resp.status) {
              for (let i = 0; i < this.models.length; i++) {
                if (this.models[i].id == data.model_id) {
                  this.models[i] = resp.models["0"];
                  this.models[i].items = [];
                  this.models[i].expand = true;
                  this.modelService
                    .modelFolderExpand(
                      this.loggedInUser["login_key"],
                      [this.models[i].id],
                      this.keyword,
                      "items",
                      1,
                      "model_folder",
                      null
                    )
                    .subscribe((data) => {
                      this.models[i].items = data.models;
                      this.models[i].items.pages = data.pages ? data.pages : 1;
                    });
                }
              }
            } else {
              this.toastCtrl.info("Model not found");
            }
          });
      }
    });

    /**On Diagram Open Models*/
    this.modelBrowserSocket.on("open_diagrams", (data) => {
      console.log("open diagrams received");
      this.openDiagramIds = data;
    });

    /**Diagram Import Iframe*/
    let diagram_svg_url_scheme = btoa(
      new URLSearchParams({
        room: this.mxEditorUniqueCode + "_diagram_svg",
      }).toString()
    );
    this.mxEditorDiagramImportIframe =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        environment.editor_xml_svg_converter_url + "#" + diagram_svg_url_scheme
      );
    this.diagramImportSVGSocket = io(environment.editor_node_app_url, {
      query: {
        room: this.mxEditorUniqueCode + "_diagram_svg",
        from: "pluto",
      },
    });

    this.diagramImportSVGSocket.on("diagram_svg_received", (data) => {
      this.diagramImportedFiles = data.diagram_files;
      this.modalService.dismissAll();
      this.modalService.open(this.importDiagramModal, {
        windowClass: "wider-modal import-diagrams",
        centered: true,
      });
    });

    this.diagramImportSVGSocket.on("view_generator_export_received", (data) => {
      this.modelService
        .saveViewGeneratedDiagram(
          this.loggedInUser["login_key"],
          this.exportViewGeneratorForm.value.name,
          this.exportDiagramTypesList[this.diagramExportSelectedType].id,
          data.xml,
          data.svg,
          data.svg_padding_top,
          data.svg_padding_left,
          this.viewGeneratorSelectedModelFolderObject.ids,
          this.viewGeneratorSelectedModelFolderObject.type
        )
        .subscribe((data) => {
          if (data.status) {
            this.modalService.dismissAll();

            if (data.model_id && this.modelViewSocket[data.model_id]) {
              this.modelViewSocket[data.model_id].emit(
                "pluto_model_folder_create",
                { parent_id: data.parent_id }
              );
            } else {
              this.modelEventService.onModelViewObjectCreateForChild({
                parent_id: data.parent_id,
                pages: data.pages,
              });
            }

            this.toastCtrl.success("Diagram saved successfully");
          } else {
            this.isDiagramExportLoading = false;
            this.toastCtrl.error(data.error);
          }
        });
    });

    /**Update Diagram Import SVG with objects created*/
    this.diagramImportSVGSocket.on(
      "editor_save_diagram_svg_process",
      (data) => {
        for (let i = 0; i < data.diagram_files.length; i++) {
          this.modelService
            .updateDiagramXMLContent(
              this.loggedInUser["login_key"],
              data.diagram_files[i].diagram_id,
              data.diagram_files[i].xml,
              [],
              data.diagram_files[i].svg,
              data.diagram_files[i].svg_padding_top,
              data.diagram_files[i].svg_padding_left,
              false,
              [],
              []
            )
            .subscribe(() => {});
        }
      }
    );

    this.settingsService.getSettingsDateFormat(this.loggedInUser['login_key']).subscribe(data => {
      this.mainSettings = data;
    });
    
    this.debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.onGenerateView();
    });
  }

  ngOnDestroy() {
    if (this.modelViewSelectedObjectsSubscriber) {
      this.modelViewSelectedObjectsSubscriber.unsubscribe();
    }

    if (this.modelViewFolderSelectedSubscriber) {
      this.modelViewFolderSelectedSubscriber.unsubscribe();
    }

    if (this.modelViewModelSelectedSubscriber) {
      this.modelViewModelSelectedSubscriber.unsubscribe();
    }

    if (this.modelViewModelClosedSubscriber) {
      this.modelViewModelClosedSubscriber.unsubscribe();
    }

    if (this.modelViewInlineEditorPrefillCompletedSubscriber) {
      this.modelViewInlineEditorPrefillCompletedSubscriber.unsubscribe();
    }

    if (this.modelViewInlineEditorUncheckSelectedRowSubscriber) {
      this.modelViewInlineEditorUncheckSelectedRowSubscriber.unsubscribe();
    }

    if (this.modelViewObjectDragEditorSubscriber) {
      this.modelViewObjectDragEditorSubscriber.unsubscribe();
    }

    if (this.modelViewDiagramSelectedSubscriber) {
      this.modelViewDiagramSelectedSubscriber.unsubscribe();
    }

    if (this.modelViewNewDiagramCreatedSubscriber) {
      this.modelViewNewDiagramCreatedSubscriber.unsubscribe();
    }

    if (this.modelViewGeneratorSelectedSubscriber) {
      this.modelViewGeneratorSelectedSubscriber.unsubscribe();
    }

    if (this.modelViewDiagramImportSubscriber) {
      this.modelViewDiagramImportSubscriber.unsubscribe();
    }

    if (this.modelViewExportPositionsReceivedSubscriber) {
      this.modelViewExportPositionsReceivedSubscriber.unsubscribe();
    }

    if (this.modelViewerCopyPasteSubscriber) {
      this.modelViewerCopyPasteSubscriber.unsubscribe();
    }

    if (this.modelViewObjectTypeCreateStateSubscriber) {
      this.modelViewObjectTypeCreateStateSubscriber.unsubscribe();
    }

    if (this.diagram_socket) {
      console.log("DS disconnecting");
      this.diagram_socket.disconnect();
    }

    if (this.diagramImportSVGSocket) {
      this.diagramImportSVGSocket.disconnect();
    }

    if (Object.keys(this.modelViewSocket).length) {
      for (let i = 0; i < this.modelViewSocket.length; i++) {
        this.modelViewSocket[i].disconnect();
      }
    }

    if (this.modelViewDeleteObjectsSubscriber) {
      this.modelViewDeleteObjectsSubscriber.unsubscribe();
    }

    if (this.modelViewCurrentPageStateSubscriber) {
      this.modelViewCurrentPageStateSubscriber.unsubscribe();
    }

    if (this.modelOpenModelCheckedSubscriber) {
      this.modelOpenModelCheckedSubscriber.unsubscribe();
    }

    if (this.modelViewChainItemSubscriber) {
      this.modelViewChainItemSubscriber.unsubscribe();
    }

    if (this.modelOpenRelationshipModalSubscriber) {
      this.modelOpenRelationshipModalSubscriber.unsubscribe();
    }

    if (this.modelViewChangeLogSubscriber) {
      this.modelViewChangeLogSubscriber.unsubscribe();
    }
  }

  onPageChange(page) {
    console.log("CALLED ", page);
    this.modelActivePage = page;
    this.modelObjectTypesSelected = [];
    this.modelObjectAttributes = [];
    this.sharedObjectProperties = [];
    this.sharedObjectAttributeIds = [];
    this.objectAttributeTabs = [];
    this.sharedObjectAttributeValues = [];
    this.noSharedObjectAttributesFound = false;
    this.expandViewFilterExpandOptions = {};
    this.isMultipleColumnOrdering = false;
    this.inlineEditorLastDeletedObjects = [];
    this.selectedPropertiesTabIndex = -1;

    this.currentPageDetails.currentActivePage = page;
    this.onProcessCurrentStateSave();

    switch (page) {
      case "content-viewer":
        this.mxEditorObjectShapeDetails = null;
        if (!this.selectedDiagramId) {
          return false;
        }

        this.selectedDiagramSVGLoading = true;
        this.modelService
          .getDiagramSVGDetails(
            this.loggedInUser["login_key"],
            this.selectedDiagramId
          )
          .subscribe((data) => {
            this.selectedDiagramSVGLoading = false;
            if (data.svg) {
              this.settings = data.settings;
              this.selectedDiagramSVG = this.onRenderSafeSVG(data.svg);
              this.needsToInitDiagramSvgPanZoom = true;
              this.dateFormatMask = this.modelService.convertDateFormatToMask(
                this.settings
              ); //data.settings
            } else {
              this.selectedDiagramSVG = null;
            }
          });
        this.titleService.setTitle(this.defaultPageTitle);
        break;
      case "diagram-editor":
        if (!this.selectedDiagramId) {
          return false;
        }
        this.mxEditorLoading = true;
        this.showDragToEditorLoader = false;
        this.available_iframe_height =
          this.calculateAvailableIframeHeight(true);
        if (!this.diagram_socket) {
          console.log("socket create", this.selectedDiagramId);
          this.diagram_socket = io(environment.editor_node_app_url, {
            query: {
              room: this.mxEditorUniqueCode,
              from: "PlutoUI",
            },
          });
        }

        // console.log('check 1');
        this.modelBrowserSocket.emit(
          "check_open_diagram",
          this.selectedDiagramId
        );

        /**Pass Diagram XML to mxEditor*/
        this.modelService
          .getDiagramXMLContent(
            this.loggedInUser["login_key"],
            this.selectedDiagramId
          )
          .subscribe((data) => {
            if (data.status) {
              let url_scheme = btoa(
                new URLSearchParams({
                  room: this.mxEditorUniqueCode,
                  diagram_id: this.selectedDiagramId,
                  diagram_name: data.name,
                  is_manual_imported: data.is_manual_imported,
                  xml: data.xml,
                  libraries: JSON.stringify(data.libraries),
                  diagram_libraries: JSON.stringify(data.diagram_libraries),
                  model_id: data.model_id,
                  model_name: data.model_name,
                  created_date: data.created_date,
                  created_by: data.created_by,
                  updated_by: data.updated_by,
                  updated_date: data.updated_date,
                  exit_behavior: data.exit_behavior,
                  prompt_diagram_object_delete:
                    data.prompt_diagram_object_delete.toString(),
                  prompt_diagram_reuse_objects:
                    data.prompt_diagram_reuse_objects.toString(),
                  prompt_diagram_reuse_relationships: 
                  data.prompt_diagram_reuse_relationships? data.prompt_diagram_reuse_relationships.toString():"false",
                  login_key: this.loggedInUser["login_key"],
                  user_name: this.loggedInUser["name"],
                }).toString()
              );

              this.selectedDiagramParentId = data.diagram_parent_id;
              this.mxEditorIframeCode =
                this.sanitizer.bypassSecurityTrustResourceUrl(
                  environment.editor_app_url + "#" + url_scheme
                );
              this.mxEditorLoading = false;
              this.diagramExitBehavior = data.exit_behavior;
              this.titleService.setTitle(data.name);
            } else {
              this.mxEditorLoading = false;
              this.error = true;
              this.errorMsg = data.error;
            }
          });

        /**Diagram Updated*/
        this.diagram_socket.on("editor_diagram_update", (data) => {
          if (!data.params.svg_padding_update) {
            data.params.svg_padding_top = null;
            data.params.svg_padding_left = null;
          }

          this.modelService
            .updateDiagramXMLContent(
              this.loggedInUser["login_key"],
              this.selectedDiagramId,
              data.xml,
              data.custom_diagram_libraries,
              data.diagram_svg,
              data.params.svg_padding_top,
              data.params.svg_padding_left,
              data.params.sync,
              data.params.deleted_objects,
              data.params.deleted_relationships
            )
            .subscribe(() => {
              console.log("updating backend");
            });

          this.modelBrowserSocket.emit("mx_editor_xml_updated", data);
        });

        this.diagram_socket.on("check_diagram_deleted_objects", (data) => {
          this.modelService
            .diagramDeletedObjectRelationships(
              this.loggedInUser["login_key"],
              data.diagram_id,
              data.xml
            )
            .subscribe((resp) => {
              if (resp.status) {
                if (resp.objects.length || resp.relationships.length) {
                  this.diagramDeleteItems = {
                    objects: resp.objects,
                    selected_object_ids: [],
                    relationships: resp.relationships,
                    selected_relationship_ids: [],
                  };

                  /**Pre selected objects*/
                  for (let i = 0; i < resp.objects.length; i++) {
                    this.diagramDeleteItems.selected_object_ids.push(
                      resp.objects[i].id
                    );
                  }

                  /**Pre selected relationships*/
                  for (let i = 0; i < resp.relationships.length; i++) {
                    this.diagramDeleteItems.selected_relationship_ids.push(
                      resp.relationships[i].id
                    );
                  }

                  this.modalService.open(this.diagramObjectRelationshipModal, {
                    windowClass: "wider-modal",
                    centered: true,
                    backdrop: "static",
                    keyboard: false,
                  });
                } else {
                  this.diagram_socket.emit("process_xml_update", {
                    delete_object_ids: [],
                    delete_relationship_ids: [],
                  });
                }
              } else {
                this.toastCtrl.error(resp.error);
              }
            });
        });

        /**When removed object from Editor and Model*/
        this.diagram_socket.on("pluto_remove_objects", (data) => {
          for (let i = 0; i < data.object_ids.length; i++) {
            this.modelService
              .deleteObject(this.loggedInUser["login_key"], data.object_ids[i])
              .subscribe((resp) => {
                if (resp.status && this.modelViewSocket[resp.model_id]) {
                  this.modelViewSocket[resp.model_id].emit(
                    "pluto_model_object_delete",
                    { id: data.object_ids[i], parent_id: resp.parent_id }
                  );
                }
              });
          }
        });

        /**When removed relationships from Model*/
        this.diagram_socket.on("pluto_remove_relationships", (data) => {
          let relationship_data = [];
          for (let i = 0; i < data.relationship_ids.length; i++) {
            relationship_data.push({
              id: data.relationship_ids[i],
              type: "object_relationship",
            });
          }
          this.modelService
            .deleteRelationships(
              this.loggedInUser["login_key"],
              relationship_data,
              true
            )
            .subscribe(() => {});
        });

        /**FullScreen Logic*/
        this.diagram_socket.on("pluto_update_window_mode", () => {
          this.mxEditorModeEnabled = false;
          this.mxEditorHideTreeViewModeEnabled = true;
          this.eventsService.onPageChange({
            hide_sidebar: false,
            section: "models",
            page: "models",
          });
          if (this.selectedObjectIds.length) {
            this.selectedDiagramId = null;
            this.onPageChange("view-generator");
          } else if (this.selectedDiagramId) {
            this.onPageChange("content-viewer");
          }

          /**Remove hash from URL if any*/
          window.location.hash = "model";
          this.eventsService.onHeaderChange({ hide_header: false });
        });

        /**Exit Diagram*/
        this.diagram_socket.on("pluto_exit_diagram", (data) => {
          if (
            this.diagramExitBehavior == "exit_to_model" ||
            (this.diagramExitBehavior == "exit_tab" && !data.has_other_tab)
          ) {
            this.router.navigateByUrl(
              "model/" +
                this.modelIds.join("&") +
                "/" +
                this.currentPageDetails.token +
                "/view"
            );
          } else {
            window.top.close();
          }
        });

        /**Tree View Hide & Show Logic*/
        this.diagram_socket.on("pluto_update_tree_view_mode", (mode) => {
          this.mxEditorHideTreeViewModeEnabled = mode == "visible";
          this.diagram_socket.emit("pluto_set_editor_fit_one_page", {});
        });

        /**Header Hide & Show Logic*/
        this.diagram_socket.on("pluto_set_header_toggle", (mode) => {
          this.showOnlyHeader = mode == "collapsed";
          // this.eventsService.onHeaderChange({ hide_header: hide_sidebar });
          this.available_iframe_height = this.calculateAvailableIframeHeight(
            this.showOnlyHeader
          );
          this.diagram_socket.emit("pluto_set_editor_fit_one_page", {});
        });

        /**Hide Open Models*/
        this.diagram_socket.on("pluto_toggle_model_browser", (data) => {
          this.mxEditorHideTreeViewModeEnabled = data == "hide";
          console.log(this.mxEditorHideTreeViewModeEnabled);
          this.diagram_socket.emit("pluto_set_editor_fit_one_page", {});
        });

        /**When Object Name Changed In Editor*/
        this.diagram_socket.on(
          "pluto_rename_objects",
          (object_rename_items) => {
            for (let i = 0; i < object_rename_items.length; i++) {
              /**Update Backend*/
              this.modelService
                .updateObjectName(
                  this.loggedInUser["login_key"],
                  object_rename_items[i].name,
                  object_rename_items[i].object_id
                )
                .subscribe((data) => {
                  if (
                    data.status &&
                    data.model_id &&
                    this.modelViewSocket[data.model_id]
                  ) {
                    /**Emit Socket*/
                    this.modelViewSocket[data.model_id].emit(
                      "pluto_model_object_rename",
                      {
                        id: object_rename_items[i].object_id,
                        name: object_rename_items[i].name,
                      }
                    );
                  }
                });
            }
          }
        );

        /**Get Object Details For Editor*/
        this.diagram_socket.on("pluto_get_object_details", (object_id) => {
          this.modelService
            .getObjectProperties(this.loggedInUser["login_key"], [object_id])
            .subscribe((data) => {
              if (data.status) {
                this.settings = data.settings;
                this.editPropertiesMode = false;
                this.showEditAllButton = true;

                let total_attributes =
                  data.object_type_attributes["0"].attributes.length;
                if (total_attributes) {
                  for (let i = 0; i < total_attributes; i++) {
                    data.object_type_attributes["0"].attributes[i].mx_label =
                      this.renderPropertiesValue(
                        data.object_type_attributes["0"].attributes[i],
                        true
                      );
                  }
                }
              }
              this.diagram_socket.emit("object_properties_received", data);
            });
        });

        /**Get Relationship & Relationship Type Details*/
        this.diagram_socket.on(
          "pluto_get_relationship_type_details",
          (data) => {
            if (data.relationship_id) {
              this.modelService
                .getRelationshipDetails(
                  this.loggedInUser["login_key"],
                  data.relationship_id
                )
                .subscribe((resp) => {
                  resp.type = "relationship";
                  this.diagram_socket.emit(
                    "relationship_properties_received",
                    resp
                  );
                });
            } else {
              this.modelService
                .getRelationshipTypeDetails(
                  this.loggedInUser["login_key"],
                  data.relationship_type_id
                )
                .subscribe((resp) => {
                  resp.type = "relationship_type";
                  this.diagram_socket.emit(
                    "relationship_properties_received",
                    resp
                  );
                });
            }
          }
        );

        /**mxEditor asked for shape details*/
        this.diagram_socket.on("pluto_get_shape_xml", (data) => {
          this.modelService
            .getShapeDetailsFromXML(
              this.loggedInUser["login_key"],
              this.selectedDiagramId,
              data.xml
            )
            .subscribe((resp) => {
              if (resp.status) {
                this.diagram_socket.emit("update_shape_found_properties", {
                  data: resp,
                  unique_id: data.unique_id,
                });
              }
            });
        });

        /**When New Objects & Relationships Received From Diagram*/
        this.diagram_socket.on("pluto_update_objects_relationships", (data) => {
          console.log('pluto_update_objects_relationships', data)
          this.promptDiagramReuseRelationships = data.prompt_diagram_reuse_relationships; // set flag for reuse
          if (data.prompt_diagram_reuse_objects) {
            this.diagramObjectReuseOptions = {
              selected_object_ids: [],
              diagram_mx_options: data,
              isLoading: true,
              objects: [],
            };
            this.diagramObjectReuseRelationships = {
              selected_relationship_ids: [],
              isLoading: true,
              relationships: [],
              diagram_mx_options: data
            };
            this.modalService.open(this.diagramReuseObjectModal, {
              windowClass: "wider-modal",
              centered: true,
              backdrop: "static",
              keyboard: false,
            });
            this.modelService
              .getDiagramReuseObjects(
                this.loggedInUser["login_key"],
                this.selectedDiagramId,
                data.mx_objects
              )
              .subscribe((resp) => {
                if (resp.status) {
                  if (resp.objects.length) {
                    this.diagramObjectReuseOptions.objects = resp.objects;
                    this.diagramObjectReuseOptions.isLoading = false;
                  } else if (data.prompt_diagram_reuse_relationships) {
                    this.modalService.dismissAll();
                    this.openReuseRelationshipsModel();
                  } else {
                    this.onSaveDiagramNewObjectsRelationships(data, [], []);
                    this.modalService.dismissAll();
                  }
                } else {
                  this.toastCtrl.error(resp.error);
                  this.modalService.dismissAll();
                }
              });
          } else if (data.prompt_diagram_reuse_relationships) {
            this.diagramObjectReuseRelationships = {
              selected_relationship_ids: [],
              isLoading: true,
              relationships: [],
              diagram_mx_options: data
            };
            console.log('#2428 prompt_diagram_reuse_relationships')
            this.openReuseRelationshipsModel();
          } else {
            this.onSaveDiagramNewObjectsRelationships(data, [], []);
          }
        });
        break;
      case "in-line-editor":
        if (
          !this.selectedObjectIds.length &&
          !this.selectedModelId &&
          !this.selectedFolderId &&
          !this.selectedDiagramId &&
          !this.selectedViewGeneratorId
        ) {
          return false;
        }

        this.inlineCurrentPage = 1;
        this.inlineEditorActiveCellData = {
          object_id: null,
          attribute_id: null,
          attribute_data: null,
          object_start_index: null,
        };
        this.inlineEditorActiveTab = this.inlineEditorActiveTab
          ? this.inlineEditorActiveTab
          : "objects";
        this.loadInlineAttributes(this.inlineCurrentPage);
        this.titleService.setTitle(this.defaultPageTitle);
        break;
      case "properties":
        if (
          !this.selectedObjectIds.length &&
          !this.selectedModelId &&
          !this.selectedFolderId &&
          !this.selectedDiagramId &&
          !this.selectedViewGeneratorId
        ) {
          return false;
        }
        this.isLoadingPropertiesPage = true;
        this.modelFolderInfo = {};
        this.editModelFolderDescription = false;

        /**Get Object Properties*/
        if (this.selectedObjectIds.length) {
          this.modelService
            .getObjectProperties(
              this.loggedInUser["login_key"],
              this.selectedObjectIds
            )
            .subscribe((data) => {
              if (data.status) {
                this.settings = data.settings;
                this.editPropertiesMode = false;
                this.showEditAllButton = true;
                this.dateFormatMask = this.modelService.convertDateFormatToMask(
                  this.settings
                );
                this.modelObjectAttributes = data.object_type_attributes;

                /**Remove old set of controls*/
                if (this.objectAttributesForm.controls) {
                  for (let i in this.objectAttributesForm.controls) {
                    this.objectAttributesForm.removeControl(i);
                  }
                }

                /**Shared Object Properties*/
                let object_combined_attribute_values = [];
                let object_attribute_ids = [];
                let attribute_objects = [];
                let object_data_properties = [];
                let attribute_tabs = [];
                let total_objects_selected = data.object_type_attributes.length;
                let has_object_with_no_attributes = false;
                for (let i = 0; i < total_objects_selected; i++) {
                  // attribute_tabs.push(data.object_type_attributes[i].tabs)
                  this.objectIdNames[data.object_type_attributes[i].id] =
                    data.object_type_attributes[i].name;
                  object_data_properties[data.object_type_attributes[i].id] = {
                    name: data.object_type_attributes[i].name,
                    object_type: data.object_type_attributes[i].object_type,
                  };
                  if (data.object_type_attributes[i].attributes.length) {
                    object_attribute_ids[i] = [];
                    for (
                      let t = 0;
                      t < data.object_type_attributes[i].attributes.length;
                      t++
                    ) {
                      let attribute_id =
                        data.object_type_attributes[i].attributes[t]
                          .attribute_id;
                      if (!object_combined_attribute_values[attribute_id]) {
                        object_combined_attribute_values[attribute_id] =
                          data.object_type_attributes[i].attributes[t];
                        object_combined_attribute_values[
                          attribute_id
                        ].shared_values = [];
                        object_combined_attribute_values[
                          attribute_id
                        ].has_changed = false;
                        object_combined_attribute_values[
                          attribute_id
                        ].is_various = false;
                      }

                      if (
                        data.object_type_attributes[i].attributes[t]
                          .selected_value.length
                      ) {
                        let attr_value;
                        if (
                          ["multiple-list", "date_range"].indexOf(
                            data.object_type_attributes[i].attributes[t].type
                          ) != -1
                        ) {
                          object_combined_attribute_values[
                            attribute_id
                          ].shared_values.push(
                            data.object_type_attributes[i].attributes[t]
                              .selected_value
                          );
                          attr_value =
                            object_combined_attribute_values[attribute_id]
                              .shared_values;
                        } else {
                          object_combined_attribute_values[
                            attribute_id
                          ].shared_values.push(
                            data.object_type_attributes[i].attributes[t]
                              .selected_value[0]
                          );
                          attr_value =
                            data.object_type_attributes[i].attributes[t]
                              .selected_value[0];
                        }

                        object_combined_attribute_values[
                          attribute_id
                        ].shared_values =
                          object_combined_attribute_values[
                            attribute_id
                          ].shared_values.concat(attr_value);
                      } else {
                        object_combined_attribute_values[
                          attribute_id
                        ].shared_values.push(null);
                      }

                      /**Combine attributes to find shared ones*/
                      object_attribute_ids[i].push(attribute_id);

                      /**Collect attribute objects to show when multiple shared selected*/
                      if (!attribute_objects[attribute_id]) {
                        attribute_objects[attribute_id] = [];
                      }

                      if (
                        attribute_objects[attribute_id].indexOf(
                          data.object_type_attributes[i].id
                        ) == -1
                      ) {
                        attribute_objects[attribute_id].push(
                          data.object_type_attributes[i].id
                        );
                      }
                    }
                  } else {
                    has_object_with_no_attributes = true;
                  }

                  for (
                    let t = 0;
                    t < data.object_type_attributes[i].tabs.length;
                    t++
                  ) {
                    attribute_tabs.push(data.object_type_attributes[i].tabs[t]);
                  }
                }

                if (
                  has_object_with_no_attributes &&
                  total_objects_selected > 1
                ) {
                  object_attribute_ids = [];
                }

                let object_attribute_tabs_list = [];
                if (object_attribute_ids.length) {
                  let shared_attribute_ids = object_attribute_ids.reduce(
                    (p, c) => p.filter((e) => c.includes(e))
                  );
                  let object_ids_used = [];

                  /**Add new form controls*/
                  for (let i = 0; i < shared_attribute_ids.length; i++) {
                    let attribute_id = shared_attribute_ids[i];
                    let attribute_item_name = "attribute_" + attribute_id;
                    let attribute_value = null;

                    /**Get attribute used in tabs*/
                    let found_tabs = attribute_tabs.filter(
                      (tab) => tab.attribute_ids.indexOf(attribute_id) != -1
                    );
                    let tab_names = [
                      ...new Set(found_tabs.map((tab_data) => tab_data.name)),
                    ].join(", ");
                    if (
                      typeof object_attribute_tabs_list[tab_names] ==
                      "undefined"
                    ) {
                      object_attribute_tabs_list[tab_names] = [];
                    }

                    object_attribute_tabs_list[tab_names].push(attribute_id);

                    /**If one object selected return value, otherwise check if the value is the same or assign null with Various flag*/
                    let has_same_values = false;
                    if (
                      object_combined_attribute_values[attribute_id]
                        .shared_values.length
                    ) {
                      if (this.modelObjectAttributes.length == 1) {
                        attribute_value =
                          object_combined_attribute_values[attribute_id]
                            .shared_values[0];
                      } else {
                        /**Different logics to check if same value for multiple list or date range*/
                        if (
                          object_combined_attribute_values[attribute_id].type ==
                          "multiple-list"
                        ) {
                          has_same_values = this.checkMultiListMatch(
                            object_combined_attribute_values[attribute_id]
                              .shared_values
                          );
                        } else if (
                          object_combined_attribute_values[attribute_id].type ==
                          "date_range"
                        ) {
                          has_same_values = this.checkDateRangeMatch(
                            object_combined_attribute_values[attribute_id]
                              .shared_values
                          );
                        } else {
                          has_same_values = object_combined_attribute_values[
                            attribute_id
                          ].shared_values.every(
                            (val, i, arr) => val === arr[0]
                          );
                        }

                        if (has_same_values) {
                          attribute_value =
                            object_combined_attribute_values[attribute_id]
                              .shared_values[0];
                        } else {
                          object_combined_attribute_values[
                            attribute_id
                          ].is_various = true;
                        }
                      }
                    }

                    switch (
                      object_combined_attribute_values[attribute_id].type
                    ) {
                      case "text":
                        this.objectAttributesForm.addControl(
                          attribute_item_name,
                          new UntypedFormControl(attribute_value)
                        );
                        break;
                      case "list":
                        this.objectAttributesForm.addControl(
                          attribute_item_name,
                          new UntypedFormControl(attribute_value)
                        );
                        break;
                      case "boolean":
                        attribute_value = attribute_value == "true" ? 1 : 0;
                        this.objectAttributesForm.addControl(
                          attribute_item_name,
                          new UntypedFormControl(attribute_value)
                        );
                        break;
                      case "date":
                        if (attribute_value !== null && this.settings) {
                          attribute_value =
                            this.modelService.convertISODateToFormat(
                              attribute_value,
                              this.settings
                            );
                        }

                        this.objectAttributesForm.addControl(
                          attribute_item_name,
                          new UntypedFormControl(attribute_value)
                        );
                        break;
                      case "date_range":
                        /**From Date*/
                        let from_value = null;
                        let to_value = null;
                        if (attribute_value != null && this.settings) {
                          if (attribute_value[0] !== null) {
                            from_value =
                              this.modelService.convertISODateToFormat(
                                attribute_value[0],
                                this.settings
                              );
                          }

                          /**To Date*/
                          if (attribute_value[1] !== null) {
                            to_value = this.modelService.convertISODateToFormat(
                              attribute_value[1],
                              this.settings
                            );
                          }
                        }

                        this.objectAttributesForm.addControl(
                          attribute_item_name + "_from",
                          new UntypedFormControl(from_value)
                        );
                        this.objectAttributesForm.addControl(
                          attribute_item_name + "_to",
                          new UntypedFormControl(to_value)
                        );
                        break;
                      case "integer":
                        this.objectAttributesForm.addControl(
                          attribute_item_name,
                          new UntypedFormControl(attribute_value, [
                            checkIntegerValue(
                              object_combined_attribute_values[attribute_id]
                                .values[0],
                              object_combined_attribute_values[attribute_id]
                                .values[1]
                            ),
                          ])
                        );
                        break;
                      case "decimal":
                        this.objectAttributesForm.addControl(
                          attribute_item_name,
                          new UntypedFormControl(
                            attribute_value,
                            checkDecimalFieldValue(
                              object_combined_attribute_values[attribute_id]
                                .values[0],
                              object_combined_attribute_values[attribute_id]
                                .values[1],
                              object_combined_attribute_values[attribute_id]
                                .decimal_places
                            )
                          )
                        );
                        break;
                      case "multiple-list":
                        this.objectAttributesForm.addControl(
                          attribute_item_name,
                          new UntypedFormControl(attribute_value)
                        );
                        break;
                    }

                    /**Collect used names*/
                    if (attribute_objects[attribute_id]) {
                      object_ids_used = object_ids_used.concat(
                        attribute_objects[attribute_id]
                      );
                    }
                  }

                  /**Filter duplicates*/
                  object_ids_used.filter(function (item, pos, self) {
                    return self.indexOf(item) == pos;
                  });

                  /**Collect Shared Objects*/
                  for (let i = 0; i < object_ids_used.length; i++) {
                    this.sharedObjectProperties[object_ids_used[i]] =
                      object_data_properties[object_ids_used[i]];
                  }

                  this.sharedObjectAttributeIds = shared_attribute_ids;
                  this.sharedObjectAttributeValues =
                    object_combined_attribute_values;
                } else {
                  /**If one object selected without attributes just display the info*/
                  if (data.object_type_attributes.length == 1) {
                    this.sharedObjectProperties[
                      data.object_type_attributes[0].id
                    ] = data.object_type_attributes[0];
                  } else {
                    this.noSharedObjectAttributesFound = true;
                  }
                }

                this.objectAttributeTabs = object_attribute_tabs_list;
                this.isLoadingPropertiesPage = false;
              } else {
                this.isLoadingPropertiesPage = false;
                this.toastCtrl.info(data.error);
              }
            });
        } else if (
          this.selectedModelId ||
          this.selectedFolderId ||
          this.selectedDiagramId ||
          this.selectedViewGeneratorId
        ) {
          /**Get Model/Folder Info*/
          let type = "model";
          let model_folder_id = this.selectedModelId;
          if (this.selectedFolderId) {
            type = "folder";
            model_folder_id = this.selectedFolderId;
          } else if (this.selectedDiagramId) {
            type = "diagram";
            model_folder_id = this.selectedDiagramId;
          } else if (this.selectedViewGeneratorId) {
            type = "view";
            model_folder_id = this.selectedViewGeneratorId;
          }

          this.modelService
            .getModelFolderInfo(
              this.loggedInUser["login_key"],
              model_folder_id,
              type
            )
            .subscribe((data) => {
              this.isLoadingPropertiesPage = false;
              // if (data.status) {
              this.modelFolderInfoForm = new UntypedFormGroup({
                description: new UntypedFormControl(data.info.description),
              });
              this.modelFolderInfo = data.info;
              // }
              // else{
              //   this.toastCtrl.error(data.error);
              // }
            });
        }
        this.titleService.setTitle(this.defaultPageTitle);
        break;
      case "view-generator":
        if (
          !this.selectedObjectIds.length &&
          !this.selectedModelId &&
          !this.selectedFolderId &&
          !this.selectedDiagramId &&
          !this.selectedViewGeneratorId
        ) {
          return false;
        }

        this.titleService.setTitle(this.defaultPageTitle);
        this.viewGeneratorAvailableObjectTypes = {
          current_model_types: [],
          other_model_types: []
        };
        this.viewGeneratorAvailableRelationshipTypes = {
          current_model_types: [],
          other_model_types: []
        };
        this.viewGeneratorGroupRelationshipTypes = [];
        this.viewGeneratorGroupObjectTypes = [];
        this.viewGeneratorRelationshipTypesAttributes = [];
        this.viewGeneratorAvailableAttributeTypes = [];

        this.viewGeneratorSelectedFilterObjectTypes = [];
        this.viewGeneratorSelectedFilterRelationshipTypes = [];
        this.viewGeneratorSelectedGroupOptions = {};
        this.viewGeneratorSelectedlevelOptions = {};
        this.isViewGeneratorFiltersLoading = true;

        if (this.selectedViewGeneratorId) {
          this.viewGeneratorSelectedModelFolderObject.ids = [
            this.selectedViewGeneratorId,
          ];
          this.viewGeneratorSelectedModelFolderObject.type = "view";
        } else {
          if (this.selectedModelId) {
            this.viewGeneratorSelectedModelFolderObject.ids = [
              this.selectedModelId,
            ];
            this.viewGeneratorSelectedModelFolderObject.type = "model";
          } else if (this.selectedFolderId) {
            this.viewGeneratorSelectedModelFolderObject.ids = [
              this.selectedFolderId,
            ];
            this.viewGeneratorSelectedModelFolderObject.type = "folder";
          } else {
            this.viewGeneratorSelectedModelFolderObject.ids =
              this.selectedObjectIds;
            this.viewGeneratorSelectedModelFolderObject.type = "object";
          }
        }

        this.viewGeneratorContainerWidth =
          this.viewGeneratorContainerCurrentWidth =
            this.viewEditorContainerEl.nativeElement.clientWidth;

        /**Get Graph Details*/
        this.modelService
          .getViewGeneratorFilters(
            this.loggedInUser["login_key"],
            this.viewGeneratorSelectedModelFolderObject.ids,
            this.viewGeneratorSelectedModelFolderObject.type
          )
          .subscribe((data) => {
            /**Prepare Current & Other Model Object Type Groups*/
            this.viewGeneratorAvailableObjectTypes = {
              current_model_types: [],
              other_model_types: [],
            };

            for (let i = 0; i < data.object_types.length; i++) {
              if (data.object_types[i].is_other_model) {
                this.viewGeneratorAvailableObjectTypes.other_model_types.push(
                  data.object_types[i]
                );
              } else {
                this.viewGeneratorAvailableObjectTypes.current_model_types.push(
                  data.object_types[i]
                );
              }
            }

            //**Prepare Relationship type attributes  */
            this.viewGeneratorRelationshipTypesAttributes =
              data.relationship_attributes;

            /**Prepare Current & Other Model Relationship Type Groups*/
            this.viewGeneratorGroupRelationshipTypes = data.relationship_types;
            this.viewGeneratorGroupObjectTypes = data.object_types;
            this.viewGeneratorAvailableRelationshipTypes = {
              current_model_types: [],
              other_model_types: [],
            };

            for (let i = 0; i < data.relationship_types.length; i++) {
              if (data.relationship_types[i].is_other_model) {
                this.viewGeneratorAvailableRelationshipTypes.other_model_types.push(
                  data.relationship_types[i]
                );
              } else {
                this.viewGeneratorAvailableRelationshipTypes.current_model_types.push(
                  data.relationship_types[i]
                );
              }
            }

            this.viewGeneratorAvailableAttributeTypes = data.attribute_types;

            if (this.viewGeneratorSelectedModelFolderObject.type == "view") {
              this.viewGeneratorSelectedFilterObjectTypes =
                data.filter_object_types;
              this.viewGeneratorSelectedFilterRelationshipTypes =
                data.filter_relationship_types;
              this.viewGeneratorSelectedGroupOptions =
                data.group_options == null ? {} : data.group_options;
              this.viewGeneratorReportType = data.type;
              this.viewGeneratorRelationshipAttribute =
                data.relationship_description;
              this.viewGeneratorSelectedlevelOptions = this.numberOfLevels.filter(it => it.level == data.filter_num_levels).length > 0 ?
                this.numberOfLevels.filter(it => it.level == data.filter_num_levels)[0] : {}
              this.viewGeneratorFilterLevel =
                data.filter_num_levels;
              this.viewGeneratorSelectedLayout = data.layout_type
                ? data.layout_type
                : "top_to_bottom";
            } else {
              this.viewGeneratorSelectedLayout = this
                .viewGeneratorSelectedLayout
                ? this.viewGeneratorSelectedLayout
                : "top_to_bottom";
                this.viewGeneratorSelectedlevelOptions = { level: 2, name: '2'}
                this.viewGeneratorFilterLevel = 2;
            }
            console.log(this.viewGeneratorSelectedlevelOptions)
            this.isViewGeneratorFiltersLoading = false;
            this.onGenerateView();
          });
        break;
      case "relationships":
        if (
          !this.selectedObjectIds.length &&
          !this.selectedModelId &&
          !this.selectedFolderId &&
          !this.selectedDiagramId &&
          !this.selectedViewGeneratorId &&
          !this.selectedDiagramId
        ) {
          return false;
        }
        this.isLoadingRelationshipsPage = true;
        this.titleService.setTitle(this.defaultPageTitle);
        if (this.selectedDiagramId) {
          this.modelService
            .getDiagramInfo(
              this.loggedInUser["login_key"],
              this.selectedDiagramId
            )
            .subscribe((data) => {
              if (data.status) {
                this.selectedDiagramDetails = data.diagram;
                this.modelEventService.onModelViewRelationshipsReload({
                  id: this.selectedDiagramId,
                  type: "diagram",
                });
              } else {
                this.toastCtrl.error(data.error);
              }
            });
        }
        break;
    }
  }

  checkMultiListMatch(multi_list_values): boolean {
    /**Sort arrays and make JSON for farther checking*/
    let multi_list_json = [];

    for (let i = 0; i < multi_list_values.length; i++) {
      multi_list_json.push(
        JSON.stringify(
          multi_list_values[i] === null ? null : multi_list_values[i].sort()
        )
      );
    }

    /**Check for duplicates*/
    return multi_list_json.every((val, i, arr) => val === arr[0]);
  }

  checkDateRangeMatch(values): boolean {
    /**Sort arrays and make JSON for farther checking*/
    let multi_list_json = [];

    for (let i = 0; i < values.length; i++) {
      multi_list_json.push(
        values[i] == null ? "" : values[i]["0"] + "_" + values[i]["1"]
      );
    }

    /**Check for duplicates*/
    return multi_list_json.every((val, i, arr) => val === arr[0]);
  }

  handleInlineEditorAttributes(data, page) {
    let is_objects_tab = this.inlineEditorActiveTab == "objects";
    this.inlineEditorAttributes = [];
    this.inlineCurrentPage = page;
    this.inlinePages = data.pages;
    this.inlineEditorSelectedAttributes = data.selected_attributes;
    this.settings = data.settings;
    this.dateFormatMask = this.modelService.convertDateFormatToMask(
      this.settings
    );
    this.inlineEditorSelectedSystemProperties = data.selected_system_properties;
    this.inlineEditorModelColumnWidth = data.model_column_width;
    if (is_objects_tab) {
      this.inlineEditorObjectNameColumnWidth = data.object_name_column_width;
    } else {
      this.inlineEditorFromObjectColumnWidth = data.from_object_column_width;
      this.inlineEditorRelationshipColumnWidth =
        data.relationship_type_column_width;
      this.inlineEditorToObjectColumnWidth = data.to_object_column_width;
    }

    this.inlineEditorActiveRowData = {};
    this.inlineEditorRowContextMenuOptions = {};

    /**Calculate Inline Editor Table Width*/
    this.calculateInlineEditorTableWidth();

    /**Remove old set of inline controls*/
    if (this.objectInlineAttributesForm.controls) {
      for (let i in this.objectInlineAttributesForm.controls) {
        this.objectInlineAttributesForm.removeControl(i);
      }
    }

    /**Add new inline form controls*/
    let inline_attribute_data = [];
    for (let i in data.object_attributes) {
      let item;
      if (is_objects_tab) {
        item = {
          id: data.object_attributes[i].id,
          model_name: data.object_attributes[i].model_name,
          model_id: data.object_attributes[i].model_id,
          object_type_id: data.object_attributes[i].object_type_id,
          name: data.object_attributes[i].name,
        };
      } else {
        item = {
          /**Object Relationships*/
          id: data.object_attributes[i].id,
          relationship_type_id: data.object_attributes[i].relationship_type_id,
          relationship_type_name:
            data.object_attributes[i].relationship_type_name,
          from_object_id: data.object_attributes[i].from_object_id,
          from_object_name: data.object_attributes[i].from_object_name,
          to_object_id: data.object_attributes[i].to_object_id,
          to_object_name: data.object_attributes[i].to_object_name,
          relationship_type_metamodel:
            data.object_attributes[i].relationship_type_metamodel,

          /**Diagram Relationships*/
          object_id: data.object_attributes[i].object_id,
          object_name: data.object_attributes[i].object_name,
          diagram_id: data.object_attributes[i].diagram_id,
          diagram_name: data.object_attributes[i].diagram_name,
          model_name: data.object_attributes[i].model_name,
        };
      }

      inline_attribute_data[data.object_attributes[i].id] = {
        ...item,
        row_height: data.object_attributes[i].row_height
          ? data.object_attributes[i].row_height
          : 30,
        created_date: data.object_attributes[i].created_date,
        created_by: data.object_attributes[i].created_by,
        updated_date: data.object_attributes[i].updated_date,
        updated_by: data.object_attributes[i].updated_by,
        object_type: data.object_attributes[i].object_type,
        description: data.object_attributes[i].description,
        attributes: [],
      };

      if (is_objects_tab) {
        /**Add Name Control*/
        this.objectInlineAttributesForm.addControl(
          "object_name_inline_" + data.object_attributes[i].id,
          new UntypedFormControl(data.object_attributes[i].name, [
            Validators.required,
          ])
        );

        /**Add Type Control*/
        this.objectInlineAttributesForm.addControl(
          "object_type_inline_" + data.object_attributes[i].id,
          new UntypedFormControl(data.object_attributes[i].object_type_id, [
            Validators.required,
          ])
        );
      } else {
        /**Add From Name Control*/
        this.objectInlineAttributesForm.addControl(
          "object_from_name_inline_" + data.object_attributes[i].id,
          new UntypedFormControl(data.object_attributes[i].from_object_name, [
            Validators.required,
          ])
        );

        /**Add Relationship Type Control*/
        this.objectInlineAttributesForm.addControl(
          "relationship_type_inline_" + data.object_attributes[i].id,
          new UntypedFormControl(
            data.object_attributes[i].relationship_type_id,
            [Validators.required]
          )
        );

        /**Add To Name Control*/
        this.objectInlineAttributesForm.addControl(
          "object_to_name_inline_" + data.object_attributes[i].id,
          new UntypedFormControl(data.object_attributes[i].to_object_name, [
            Validators.required,
          ])
        );
      }

      for (let t in data.object_attributes[i].attributes) {
        let attribute_item_name =
          "attribute_inline_" +
          data.object_attributes[i].id +
          "_" +
          data.object_attributes[i].attributes[t].attribute_id;

        let attribute_value = null;
        switch (data.object_attributes[i].attributes[t].type) {
          case "text":
          case "integer":
          case "decimal":
          case "list":
            attribute_value = data.object_attributes[i].attributes[t]
              .selected_value.length
              ? data.object_attributes[i].attributes[t].selected_value["0"]
              : "";
            break;
          case "boolean":
            attribute_value =
              data.object_attributes[i].attributes[t].selected_value.length &&
              data.object_attributes[i].attributes[t].selected_value["0"] ==
                "true"
                ? "true"
                : null;
            break;
          case "multiple-list":
            attribute_value =
              data.object_attributes[i].attributes[t].selected_value;
            break;
          case "date":
            attribute_value = data.object_attributes[i].attributes[t]
              .selected_value.length
              ? data.object_attributes[i].attributes[t].selected_value["0"]
              : "";
            if (this.settings && attribute_value) {
              attribute_value = this.modelService.convertISODateToFormat(
                attribute_value,
                this.settings
              );
            }
            break;
          case "date_range":
            let from_value =
              data.object_attributes[i].attributes[t].selected_value[0];
            let to_value =
              data.object_attributes[i].attributes[t].selected_value[1];
            if (this.settings) {
              from_value = from_value
                ? this.modelService.convertISODateToFormat(
                    from_value,
                    this.settings
                  )
                : null;
              to_value = from_value
                ? this.modelService.convertISODateToFormat(
                    to_value,
                    this.settings
                  )
                : null;
            }
            attribute_value = [from_value, to_value];
            break;
        }

        /**Add Attribute Controls*/
        switch (data.object_attributes[i].attributes[t].type) {
          case "decimal":
            this.objectInlineAttributesForm.addControl(
              attribute_item_name,
              new UntypedFormControl(
                attribute_value,
                checkDecimalFieldValue(
                  data.object_attributes[i].attributes[t].values[0],
                  data.object_attributes[i].attributes[t].values[1],
                  data.object_attributes[i].attributes[t].decimal_places
                )
              )
            );
            break;
          case "integer":
            this.objectInlineAttributesForm.addControl(
              attribute_item_name,
              new UntypedFormControl(attribute_value, [
                checkIntegerValue(
                  data.object_attributes[i].attributes[t].values[0],
                  data.object_attributes[i].attributes[t].values[1]
                ),
              ])
            );
            break;
          case "date_range":
            this.objectInlineAttributesForm.addControl(
              attribute_item_name + "_from",
              new UntypedFormControl(attribute_value[0])
            );
            this.objectInlineAttributesForm.addControl(
              attribute_item_name + "_to",
              new UntypedFormControl(attribute_value[1])
            );
            break;
          default:
            this.objectInlineAttributesForm.addControl(
              attribute_item_name,
              new UntypedFormControl(attribute_value)
            );
            break;
        }

        inline_attribute_data[data.object_attributes[i].id]["attributes"][
          data.object_attributes[i].attributes[t].attribute_id
        ] = data.object_attributes[i].attributes[t];
      }
    }

    this.inlineEditorAttributes = inline_attribute_data;
    this.isLoadingInlineEditorPage = false;
    this.inlinePages = data.pages;
    this.inlineCurrentPage = page;

    if (this.inlinePages > 1) {
      this.showInlinePagination = true;
      let new_max_page = this.inlineCurrentPage + 5;
      this.maxShowInlinePage = new Array(
        new_max_page > this.inlinePages ? this.inlinePages : new_max_page
      );
      window.scroll(0, 0);
    }

    /**Inline Attributes Modal*/
    this.inlineModalAttributes = [];
    /**Remove old set of modal available attributes controls*/
    if (this.inlineAvailableAttributesForm.controls) {
      for (let i in this.inlineAvailableAttributesForm.controls) {
        this.inlineAvailableAttributesForm.removeControl(i);
      }
    }

    this.onShowInlineAvailableAttributes(1);
    if (is_objects_tab) {
      this.availableObjectTypes = [{ object_type_id: "", name: "Select" }];
      this.onViewObjectTypeSearch({ term: "" });
    }
  }

  loadInlineAttributes(page) {
    if (page == 0 || (page > this.inlinePages && this.inlinePages !== 0)) {
      return false;
    }
    this.isLoadingInlineEditorPage = true;
    this.modelService
      .getInlineEditorAttributes(
        this.loggedInUser["login_key"],
        this.inlineEditorActiveTab,
        this.selectedObjectIds,
        this.selectedFolderId,
        this.selectedModelId,
        this.selectedDiagramId,
        this.selectedViewGeneratorId,
        page
      )
      .subscribe((data) => {
        if (data.status) {
          this.handleInlineEditorAttributes(data, page);
        } else {
          this.isLoadingInlineEditorPage = false;
          this.toastCtrl.info(data.error);
        }
      });
  }

  onModelMenuToggle(): boolean {
    this.showModelMenu = !this.showModelMenu;
    return false;
  }

  onObjectAttributeUpdate(): boolean {
    if (this.objectAttributesForm.valid) {
      let attribute_data_items = {
        ids: [],
        attributes: [],
      };

      let form_data = this.objectAttributesForm.value;
      /**Collect form data*/
      for (let i = 0; i < this.sharedObjectAttributeIds.length; i++) {
        let attribute_id = this.sharedObjectAttributeIds[i];
        if (this.sharedObjectAttributeValues[attribute_id].edit) {
          let attribute_item_name = "attribute_" + attribute_id;
          let attribute_value = form_data[attribute_item_name];
          let date_range_from = form_data[attribute_item_name + "_from"];
          let date_range_to = form_data[attribute_item_name + "_to"];
          if (
            (typeof date_range_from !== "undefined" &&
              date_range_from !== null) ||
            (typeof date_range_to !== "undefined" && date_range_to !== null) ||
            (typeof form_data[attribute_item_name] !== "undefined" &&
              attribute_value !== null)
          ) {
            let attribute_type =
              this.sharedObjectAttributeValues[attribute_id].type;
            switch (attribute_type) {
              case "date":
                if (attribute_value) {
                  attribute_value =
                    this.modelService.convertDateMaskToDateISOFormat(
                      attribute_value,
                      this.settings
                    );
                }
                break;
              case "date_range":
                console.log(
                  "value update",
                  form_data[attribute_item_name + "_from"],
                  form_data[attribute_item_name + "_to"]
                );
                let from_value = form_data[attribute_item_name + "_from"] || "";
                if (from_value) {
                  from_value = this.modelService.convertDateMaskToDateISOFormat(
                    from_value,
                    this.settings
                  );
                }

                let to_value = form_data[attribute_item_name + "_to"] || "";
                if (to_value) {
                  to_value = this.modelService.convertDateMaskToDateISOFormat(
                    to_value,
                    this.settings
                  );
                }

                attribute_value =
                  from_value || to_value
                    ? from_value + "__##__" + to_value
                    : null;
                break;
              case "integer":
                attribute_value = parseInt(
                  attribute_value.toString().replace(".", "")
                );
                attribute_value = isNaN(attribute_value)
                  ? ""
                  : attribute_value.toString();
                break;
              case "decimal":
                attribute_value = parseFloat(attribute_value.toString());
                attribute_value = isNaN(attribute_value)
                  ? ""
                  : attribute_value.toString();
                break;
              case "boolean":
                attribute_value = attribute_value.toString();
                attribute_value = isNaN(attribute_value)
                  ? attribute_value
                  : attribute_value == "1"
                  ? "true"
                  : "false";
                break;
              case "multiple-list":
                attribute_value =
                  attribute_value && attribute_value.length
                    ? attribute_value.join("__##__")
                    : "";
                break;
            }

            attribute_data_items["attributes"].push({
              attribute_id: attribute_id,
              value:
                attribute_value === null
                  ? null
                  : attribute_value.length
                  ? attribute_value
                  : null,
            });
          }
        }
      }

      if (attribute_data_items["attributes"].length) {
        for (let object_id in this.sharedObjectProperties) {
          attribute_data_items["ids"].push(object_id);
        }

        /**Update Object Attributes*/
        this.isLoadingPropertiesAttributes = true;
        console.log("pre update", attribute_data_items);
        this.modelService
          .updateModelObjectAttributes(
            this.loggedInUser["login_key"],
            "objects",
            attribute_data_items
          )
          .subscribe((data) => {
            this.isLoadingPropertiesAttributes = false;
            if (data.status) {
              this.toastCtrl.success("Attributes updated successfully");
              this.modelBrowserSocket.emit("properties_page_changes", {
                type: "objects",
                object_ids: Object.keys(this.sharedObjectProperties),
              });
            } else {
              this.toastCtrl.info(data.error);
            }
          });

        this.editPropertiesMode = false;
        this.showEditAllButton = true;
      } else {
        this.toastCtrl.info("No attributes edited");
      }
    }

    return false;
  }

  onRelationshipAttributeUpdate() {
    if (this.objectAttributesForm.valid) {
      let attribute_data_items = [];
      let form_data = this.objectAttributesForm.value;
      /**Collect form data*/
      for (
        let i = 0;
        i < this.mxEditorObjectShapeDetails.attributes.length;
        i++
      ) {
        if (this.mxEditorObjectShapeDetails.attributes[i].edit) {
          let attribute_id =
            this.mxEditorObjectShapeDetails.attributes[i].attribute_id;
          let attribute_item_name = "attribute_" + attribute_id;
          let attribute_value = form_data[attribute_item_name];
          let date_range_from = form_data[attribute_item_name + "_from"];
          let date_range_to = form_data[attribute_item_name + "_to"];

          if (
            (typeof date_range_from !== "undefined" &&
              date_range_from !== null) ||
            (typeof date_range_to !== "undefined" && date_range_to !== null) ||
            (typeof form_data[attribute_item_name] !== "undefined" &&
              attribute_value !== null)
          ) {
            let attribute_type =
              this.mxEditorObjectShapeDetails.attributes[i].type;
            switch (attribute_type) {
              case "date":
                if (attribute_value) {
                  attribute_value =
                    this.modelService.convertDateMaskToDateISOFormat(
                      attribute_value,
                      this.settings
                    );
                }
                break;
              case "date_range":
                let from_value = form_data[attribute_item_name + "_from"] || "";
                if (from_value) {
                  from_value = this.modelService.convertDateMaskToDateISOFormat(
                    from_value,
                    this.settings
                  );
                }

                let to_value = form_data[attribute_item_name + "_to"] || "";
                if (to_value) {
                  to_value = this.modelService.convertDateMaskToDateISOFormat(
                    to_value,
                    this.settings
                  );
                }

                attribute_value =
                  from_value || to_value
                    ? from_value + "__##__" + to_value
                    : null;
                break;
              case "integer":
                attribute_value = parseInt(
                  attribute_value.toString().replace(".", "")
                );
                attribute_value = isNaN(attribute_value)
                  ? ""
                  : attribute_value.toString();
                break;
              case "decimal":
                attribute_value = parseFloat(attribute_value.toString());
                attribute_value = isNaN(attribute_value)
                  ? ""
                  : attribute_value.toString();
                break;
              case "boolean":
                attribute_value = attribute_value.toString();
                attribute_value = isNaN(attribute_value)
                  ? attribute_value
                  : attribute_value == "1"
                  ? "true"
                  : "false";
                break;
              case "multiple-list":
                attribute_value =
                  attribute_value && attribute_value.length
                    ? attribute_value.join("__##__")
                    : "";
                break;
            }

            attribute_data_items.push({
              attribute_id: attribute_id,
              value:
                attribute_value === null
                  ? null
                  : attribute_value.length
                  ? attribute_value
                  : null,
            });
          }
        }
      }

      if (attribute_data_items.length) {
        this.mxEditorObjectShapeDetails.loading = true;
        this.modelService
          .updateRelationshipAttributes(
            this.loggedInUser["login_key"],
            this.mxEditorObjectShapeDetails.relationship_id,
            attribute_data_items
          )
          .subscribe((data) => {
            this.mxEditorObjectShapeDetails.loading = false;
            if (data.status) {
              this.onLoadDiagramSVGObjectDetails(
                null,
                this.mxEditorObjectShapeDetails.relationship_id,
                null,
                this.mxEditorObjectShapeDetails.cell_xml
              );
            } else {
              this.toastCtrl.error(data.error);
            }
          });
      } else {
        this.toastCtrl.info("No fields updated");
      }
    }
  }

  exportModelSelectedObjectTypes(event) {
    this.modelObjectTypesSelected = event;
  }

  /**Inline Editor*/
  onInlineObjectAttributeUpdate(
    id?,
    default_attribute_id?,
    show_notification = true
  ): boolean {
    let attribute_data_items = {};
    let form_data = this.objectInlineAttributesForm.value;
    /**Collect form data*/
    let is_valid = true;
    for (let i in this.inlineEditorAttributes) {
      if (this.inlineEditorAttributes[i].id == id) {
        attribute_data_items = {
          ids: [this.inlineEditorAttributes[i].id],
          attributes: [],
        };

        for (let t in this.inlineEditorSelectedAttributes) {
          let is_date_range =
            typeof this.objectInlineAttributesForm.controls[
              "attribute_inline_" +
                this.inlineEditorAttributes[i].id +
                "_" +
                this.inlineEditorSelectedAttributes[t].attribute_id +
                "_from"
            ] != "undefined" &&
            typeof this.objectInlineAttributesForm.controls[
              "attribute_inline_" +
                this.inlineEditorAttributes[i].id +
                "_" +
                this.inlineEditorSelectedAttributes[t].attribute_id +
                "_to"
            ] != "undefined";
          if (
            typeof this.objectInlineAttributesForm.controls[
              "attribute_inline_" +
                this.inlineEditorAttributes[i].id +
                "_" +
                this.inlineEditorSelectedAttributes[t].attribute_id
            ] == "undefined" &&
            !is_date_range
          ) {
            continue;
          }

          let add_item = true;

          if (
            default_attribute_id &&
            this.inlineEditorSelectedAttributes[t].attribute_id !==
              default_attribute_id
          ) {
            add_item = is_date_range;
          }

          is_valid = is_date_range
            ? true
            : this.objectInlineAttributesForm.controls[
                "attribute_inline_" +
                  this.inlineEditorAttributes[i].id +
                  "_" +
                  this.inlineEditorSelectedAttributes[t].attribute_id
              ].valid;
          if (add_item && is_valid) {
            let attribute_item_name =
              "attribute_inline_" +
              this.inlineEditorAttributes[i].id +
              "_" +
              this.inlineEditorSelectedAttributes[t].attribute_id;
            if (
              typeof form_data[attribute_item_name] !== "undefined" ||
              is_date_range
            ) {
              let attribute_type =
                this.inlineEditorAttributes[i]["attributes"][
                  this.inlineEditorSelectedAttributes[t].attribute_id
                ].type;
              let attribute_value = form_data[attribute_item_name];
              let attribute_value_format;
              switch (attribute_type) {
                case "boolean":
                  attribute_value = attribute_value.toString();
                  attribute_value_format = [attribute_value];
                  break;
                case "integer":
                  attribute_value = parseInt(
                    attribute_value.toString().replace(".", "")
                  );
                  attribute_value = isNaN(attribute_value)
                    ? ""
                    : attribute_value.toString();
                  attribute_value_format = [attribute_value];
                  break;
                case "decimal":
                  attribute_value = parseFloat(attribute_value.toString());
                  attribute_value = isNaN(attribute_value)
                    ? ""
                    : attribute_value.toString();
                  attribute_value_format = [attribute_value];
                  break;
                case "date":
                  if (attribute_value) {
                    attribute_value =
                      this.modelService.convertDateMaskToDateISOFormat(
                        attribute_value,
                        this.settings
                      );
                  }
                  attribute_value_format = [attribute_value];
                  break;
                case "date_range":
                  let from_date = "";
                  if (form_data[attribute_item_name + "_from"]) {
                    from_date =
                      this.modelService.convertDateMaskToDateISOFormat(
                        form_data[attribute_item_name + "_from"],
                        this.settings
                      );
                  }

                  let to_date = "";
                  if (form_data[attribute_item_name + "_to"]) {
                    to_date = this.modelService.convertDateMaskToDateISOFormat(
                      form_data[attribute_item_name + "_to"],
                      this.settings
                    );
                  }

                  attribute_value =
                    from_date || to_date
                      ? from_date + "__##__" + to_date
                      : null;
                  attribute_value_format = [from_date, to_date];
                  break;
                case "multiple-list":
                  attribute_value =
                    attribute_value && attribute_value.length
                      ? attribute_value.join("__##__")
                      : "";
                  attribute_value_format = form_data[attribute_item_name];
                  break;
              }

              // let attribute_value_format = (attribute_type == 'multiple-list') ? form_data[attribute_item_name] : [attribute_value];

              this.inlineEditorAttributes[i]["attributes"][
                this.inlineEditorSelectedAttributes[t].attribute_id
              ].selected_value = attribute_value_format;

              attribute_data_items["attributes"].push({
                attribute_id:
                  this.inlineEditorSelectedAttributes[t].attribute_id,
                value: attribute_value,
              });
            }
          }
        }
      }
    }

    /**Update Object Inline Attributes*/
    if (attribute_data_items["attributes"].length) {
      this.modelService
        .updateModelObjectAttributes(
          this.loggedInUser["login_key"],
          this.inlineEditorActiveTab,
          attribute_data_items
        )
        .subscribe((data) => {
          if (show_notification) {
            if (data.status) {
              if (id && this.inlineEditorActiveTab == "objects") {
                this.inlineEditorUniqueNum = uuidv4();
                this.modelBrowserSocket.emit("properties_page_changes", {
                  type: "objects",
                  object_ids: [id],
                  ui_num: this.inlineEditorUniqueNum,
                });
              }
            } else {
              this.toastCtrl.info(data.error);
            }
          }
        });
    }
    return false;
  }


  onModelKeywordSearch(event: Event) {
    this.keyword = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterModels(this.modelsOriginal, this.keyword);
  }
  filterModels(models, searchText) {
    if (!searchText) {
      this.models = [...models];
      return;
    }
    this.models = models.map((model) => {
      const filteredItems = this.filterItemsRecursive(model.items, searchText);
      return { ...model, items: filteredItems };
    });
  }

  filterItemsRecursive(items, searchText) {
    return items.flatMap((item) => {
      const filteredItems = item.items
        ? this.filterItemsRecursive(item.items, searchText) : [];
      if (item.name.toLowerCase().includes(searchText)) {
        return [{ ...item, items: filteredItems }];
      }
      return filteredItems;
    });
  }

  onEditorClose() {
    this.exportViewMode.emit("close");
  }

  /**Properties*/
  onEditAllPropertyFields(mode): boolean {
    this.editPropertiesMode = mode;
    this.showEditAllButton = !mode;
    for (let i in this.sharedObjectAttributeValues) {
      this.sharedObjectAttributeValues[i].edit = mode;
    }

    return false;
  }

  renderPropertiesValue(item, render_full = false, show_blank = false) {
    let value = item.selected_value;
    if (value && value.length) {
      let property_text;
      switch (item.type) {
        case "date":
          property_text = value["0"];
          if (
            this.settings &&
            ["properties", "in-line-editor"].indexOf(this.modelActivePage) == -1
          ) {
            property_text = this.modelService.convertISODateToFormat(
              property_text,
              this.settings
            );
          }
          break;
        case "date_range":
          let from_date = value["0"];
          let to_date = value["1"];

          if (this.settings) {
            if (from_date) {
              from_date = this.modelService.convertISODateToFormat(
                from_date,
                this.settings
              );
            }

            if (to_date) {
              to_date = this.modelService.convertISODateToFormat(
                to_date,
                this.settings
              );
            }
          }

          property_text = from_date + " - " + to_date;
          break;
        case "boolean":
          if (value["0"] == null) {
            value["0"] = "false";
          }

          property_text = value["0"];
          break;
        case "multiple-list":
          property_text = value.join(", ");
          break;
        default:
          property_text = value["0"];
          break;
      }

      return item.full_preview || render_full
        ? property_text
        : property_text
        ? property_text.substring(0, 35)
        : "";
    } else {
      if (show_blank) {
        return "";
      } else {
        return item.type == "date" ? "No Date" : "-";
      }
    }
  }

  getAttributeTextLength(item) {
    let value = item.selected_value;
    if (value.length) {
      return item.type == "multiple-list"
        ? value.join(", ").length
        : value.length;
    } else {
      return 0;
    }
  }

  onEditAttributeItem(item) {
    item.edit = !item.edit;
  }

  viewFullText(item) {
    item.full_preview = !item.full_preview;
  }

  onDisplayInlineAvailableAttributes() {
    this.showInlineModalAttributes = !this.showInlineModalAttributes;
    this.isMultipleColumnOrdering = false;
  }

  onShowInlineAvailableAttributes(page) {
    this.inlineModalLoading = true;
    this.modelService
      .getInlineEditorAvailableAttributes(
        this.loggedInUser["login_key"],
        this.inlineEditorActiveTab,
        this.selectedObjectIds,
        this.selectedFolderId,
        this.selectedModelId,
        page
      )
      .subscribe((data) => {
        this.inlineModalLoading = false;
        if (data.status) {
          this.inlineModalAttributes = data.attributes;
          this.inlineModalAttributePages = data.pages;
          this.inlineModalCurrentPage = page;

          /**Remove old set of modal available attributes controls*/
          if (this.inlineAvailableAttributesForm.controls) {
            for (let i in this.inlineAvailableAttributesForm.controls) {
              this.inlineAvailableAttributesForm.removeControl(i);
            }
          }

          /**Add new inline modal form controls*/
          for (let i in data.attributes) {
            if (data.attributes[i].type == "attribute") {
              let attribute_item_name =
                "available_modal_attribute_" + data.attributes[i].attribute_id;
              this.inlineAvailableAttributesForm.addControl(
                attribute_item_name,
                new UntypedFormControl(data.attributes[i].selected)
              );
            }
          }

          this.inlineModalPagination = !!(
            this.inlineModalAttributePages < this.inlineModalAttributePages &&
            this.inlineModalAttributePages > 1
          );
          if (this.inlineModalAttributePages > 1) {
            // this.inlineModalPagination = true;
            let new_max_page = this.inlineModalCurrentPage + 5;
            this.inlineModalMaxShowPage = new Array(
              new_max_page > this.inlineModalAttributePages
                ? this.inlineModalAttributePages
                : new_max_page
            );
          } else {
            this.inlineModalMaxShowPage = 0;
          }
        } else {
          this.toastCtrl.error("Unable to fetch available attributes");
        }
      });
  }

  onObjectAvailableAttributesUpdate(event, item) {
    this.modelService
      .updateModelObjectAvailableAttributes(
        this.loggedInUser["login_key"],
        this.inlineEditorActiveTab,
        this.selectedObjectIds,
        this.selectedFolderId,
        this.selectedModelId,
        [{ id: item.attribute_id, selected: event.target.checked }]
      )
      .subscribe((data) => {
        if (data.status) {
          /**Update Inline Editor Columns*/
          this.loadInlineAttributes(this.inlineCurrentPage);
        } else {
          this.toastCtrl.error("Unable to update attributes");
        }
      });
  }

  /**This is used to either show/hide the Add Object button for In Line Editor*/
  handleAllSelectedItems(type, data) {
    switch (type) {
      case "model":
        this.allSelectedItemObj.model_id = data;
        this.allSelectedItemObj.folder_id = null;
        this.allSelectedItemObj.model_objects = [];
        break;
      case "folder":
        this.allSelectedItemObj.model_id = null;
        this.allSelectedItemObj.folder_id = data;
        this.allSelectedItemObj.model_objects = [];
        break;
      case "object":
        this.allSelectedItemObj.model_id = null;
        this.allSelectedItemObj.folder_id = null;

        if (data.multiple) {
          let allow_add_model = true;
          for (let i in this.allSelectedItemObj.model_objects) {
            /**Check Model*/
            if (
              this.allSelectedItemObj.model_objects[i].model_id ==
              data.parent_model_id
            ) {
              allow_add_model = false;
              let allow_add_parent = true;

              for (let t in this.allSelectedItemObj.model_objects[i].items) {
                if (
                  this.allSelectedItemObj.model_objects[i].items[t].parent_id ==
                  data.parent_id
                ) {
                  allow_add_parent = false;
                  let object_index = this.allSelectedItemObj.model_objects[
                    i
                  ].items[t].object_ids.indexOf(data.ids["0"]);
                  if (object_index == -1) {
                    this.allSelectedItemObj.model_objects[i].items[
                      t
                    ].object_ids.push(data.ids["0"]);
                  } else {
                    this.allSelectedItemObj.model_objects[i].items[
                      t
                    ].object_ids.splice(object_index, 1);
                    if (
                      !this.allSelectedItemObj.model_objects[i].items[t]
                        .object_ids.length
                    ) {
                      this.allSelectedItemObj.model_objects[i].items.splice(
                        t,
                        1
                      );
                    }
                  }
                }
              }

              if (allow_add_parent) {
                this.allSelectedItemObj.model_objects[i].items.push({
                  parent_id: data.parent_id,
                  parent_type: data.parent_type,
                  object_ids: [data.ids["0"]],
                });
              } else {
                /**Clean Up Models*/
                if (!this.allSelectedItemObj.model_objects[i].items.length) {
                  this.allSelectedItemObj.model_objects.splice(i, 1);
                }
              }
            }
          }

          if (allow_add_model) {
            this.allSelectedItemObj.model_objects.push({
              model_id: data.parent_model_id,
              items: [
                {
                  parent_id: data.parent_id,
                  parent_type: data.parent_type,
                  object_ids: [data.ids["0"]],
                },
              ],
            });
          }
        } else {
          this.allSelectedItemObj.model_objects = [
            {
              model_id: data.parent_model_id,
              items: [
                {
                  parent_id: data.parent_id,
                  parent_type: data.parent_type,
                  object_ids: [data.ids["0"]],
                },
              ],
            },
          ];
        }
        break;
    }
  }

  getInlineEditorObjectCreateParent() {
    if (this.allSelectedItemObj.model_id || this.allSelectedItemObj.folder_id) {
      if (this.allSelectedItemObj.model_id) {
        return {
          parent_id: this.allSelectedItemObj.model_id,
          parent_parent_id: this.allSelectedItemObj.model_id,
          type: "model",
        };
      } else {
        return {
          parent_id: this.allSelectedItemObj.folder_id,
          parent_parent_id: this.allSelectedItemObj.model_id,
          type: "folder",
        };
      }
    } else {
      if (this.allSelectedItemObj.model_objects.length == 1) {
        if (this.allSelectedItemObj.model_objects[0]["items"].length > 1) {
          return {
            parent_id: this.allSelectedItemObj.model_objects[0].model_id,
            parent_parent_id: this.allSelectedItemObj.model_objects[0].model_id,
            type: "model",
          };
        } else {
          return {
            parent_id:
              this.allSelectedItemObj.model_objects[0]["items"]["0"].parent_id,
            parent_parent_id: this.allSelectedItemObj.model_objects[0].model_id,
            type: this.allSelectedItemObj.model_objects[0]["items"]["0"]
              .parent_type,
          };
        }
      }
    }

    return null;
  }

  onInlineObjectCreate(value) {
    let object_name = this.inlineEditorNewObjectNameRef.nativeElement.value;

    if (object_name && value && value.object_type_id) {
      let get_obj = this.getInlineEditorObjectCreateParent();
      if (get_obj) {
        this.modelService
          .addObject(
            this.loggedInUser["login_key"],
            { name: object_name, object_type_id: value.object_type_id },
            { id: get_obj.parent_id, type: get_obj.type }
          )
          .subscribe((data) => {
            if (data.status) {
              this.toastCtrl.success("Object created successfully");

              /**Update Child*/
              if (this.modelViewSocket[get_obj.parent_parent_id]) {
                this.modelViewSocket[get_obj.parent_parent_id].emit(
                  "pluto_model_object_create",
                  {
                    parent_id: get_obj.parent_id,
                    parent_parent_id: get_obj.parent_parent_id,
                    pages: data.pages,
                    type: "object",
                  }
                );
              }

              if (
                this.selectedModelId &&
                this.selectedModelId == get_obj.parent_id
              ) {
                console.log("append to model");
              } else if (
                this.selectedFolderId &&
                this.selectedFolderId == get_obj.parent_id
              ) {
                console.log("append to folder");
              } else {
                /**Update Selected Objects*/
                if (document.getElementById("object_tree_item_" + data.id)) {
                  this.selectedObjectIds.push(data.id);
                  this.selectedMultipleObjects.push({
                    id: data.id,
                    parent_id: get_obj.parent_id,
                    name: object_name,
                  });
                }
              }

              this.onPageChange(this.modelActivePage);

              //Add to child if expanded
              //Add to model viewer if on top
              //Add to Inline Editor
            } else {
              this.toastCtrl.info(data.error);
            }
          });
      } else {
        this.toastCtrl.error("Unable to find parent folder/model");
      }
    }
    // this.hasInlineObjectCreateFormSubmitted = true;
    // if (this.inlineObjectCreateForm.valid) {

    // }
  }

  onViewObjectTypeSearch(event) {
    if (this.selectedModelId == 0) {
      this.selectedModelId = null
    }
    this.modelService
      .objectTypeSearch(
        this.loggedInUser["login_key"],
        event.term,
        this.selectedModelId,
        1
      )
      .subscribe((data) => {
        this.availableObjectTypes = data.object_types;
      });
  }

  onInlineEditorColumnResize(width, type, process_save = false, item?) {
    let new_width = width < 30 ? 30 : parseInt(width);
    if (this.isMultipleColumnOrdering) {
      this.inlineEditorModelColumnWidth = new_width;

      if (this.inlineEditorActiveTab == "objects") {
        this.inlineEditorObjectNameColumnWidth = new_width;
      } else {
        this.inlineEditorFromObjectColumnWidth = new_width;
        this.inlineEditorRelationshipColumnWidth = new_width;
        this.inlineEditorToObjectColumnWidth = new_width;
      }

      for (let i = 0; i < this.inlineEditorSelectedAttributes.length; i++) {
        this.inlineEditorSelectedAttributes[i].width = new_width;
      }
      this.inlineEditorSystemPropertyColumnWidths.created_by = new_width;
      this.inlineEditorSystemPropertyColumnWidths.created_date = new_width;
      this.inlineEditorSystemPropertyColumnWidths.updated_by = new_width;
      this.inlineEditorSystemPropertyColumnWidths.updated_date = new_width;
      this.inlineEditorSystemPropertyColumnWidths.object_type = new_width;
      this.inlineEditorSystemPropertyColumnWidths.description = new_width;
    } else {
      switch (type) {
        case "model":
          this.inlineEditorModelColumnWidth = new_width;
          break;
        case "object_name":
          this.inlineEditorObjectNameColumnWidth = new_width;
          break;
        case "attribute":
          item.width = new_width;
          break;
        case "created_by":
          this.inlineEditorSystemPropertyColumnWidths.created_by = new_width;
          break;
        case "created_date":
          this.inlineEditorSystemPropertyColumnWidths.created_date = new_width;
          break;
        case "updated_by":
          this.inlineEditorSystemPropertyColumnWidths.updated_by = new_width;
          break;
        case "updated_date":
          this.inlineEditorSystemPropertyColumnWidths.updated_date = new_width;
          break;
        case "object_type":
          this.inlineEditorSystemPropertyColumnWidths.object_type = new_width;
          break;
        case "description":
          this.inlineEditorSystemPropertyColumnWidths.description = new_width;
          break;
        case "from_object":
          this.inlineEditorFromObjectColumnWidth = new_width;
          break;
        case "relationship_type":
          this.inlineEditorRelationshipColumnWidth = new_width;
          break;
        case "to_object":
          this.inlineEditorToObjectColumnWidth = new_width;
          break;
      }
    }

    this.calculateInlineEditorTableWidth();

    if (process_save) {
      if (this.isMultipleColumnOrdering) {
        let types = [
          "attribute",
          "created_by",
          "created_date",
          "updated_by",
          "updated_date",
          "description",
        ];
        if (this.inlineEditorActiveTab == "objects") {
          types = types.concat(["model", "object_name", "object_type"]);
        } else {
          types = types.concat([
            "from_object",
            "relationship_type",
            "to_object",
          ]);
        }

        for (let i = 0; i < types.length; i++) {
          this.modelService
            .updateInlineEditorColumnsWidth(
              this.loggedInUser["login_key"],
              new_width,
              types[i],
              {}
            )
            .subscribe(() => {});
        }

        for (let i = 0; i < this.inlineEditorSelectedAttributes.length; i++) {
          this.modelService
            .updateInlineEditorColumnsWidth(
              this.loggedInUser["login_key"],
              new_width,
              "attribute",
              this.inlineEditorSelectedAttributes[i]
            )
            .subscribe(() => {});
        }
      } else {
        this.modelService
          .updateInlineEditorColumnsWidth(
            this.loggedInUser["login_key"],
            new_width,
            type,
            item
          )
          .subscribe(() => {});
      }
      this.isMultipleColumnOrdering = false;
    }
  }

  onInlineEditorRowHeightResize(event, item, save) {
    /**Set new height*/
    if (event.height) {
      if (this.inlineEditorAttributes[item.value.id]) {
        this.inlineEditorAttributes[item.value.id].row_height = event.height;
      }

      item.value.row_height = parseInt(event.height);
    } else if (save) {
      /**Save new height*/
      let type =
        this.inlineEditorActiveTab == "objects" ? "object" : "relationship";
      this.modelService
        .updateInlineEditorRowHeight(
          this.loggedInUser["login_key"],
          item.value.id,
          type,
          item.value.row_height
        )
        .subscribe(() => {});
    }
  }

  onInlineEditorObjectCellClick(
    object_id,
    object_type_id,
    attribute_id,
    attribute_data,
    index
  ) {
    this.inlineEditorActiveRowData = {};
    this.inlineEditorRowContextMenuOptions = {};
    this.inlineEditorActiveCellData = {
      object_id: object_id,
      object_type_id: object_type_id,
      attribute_id: attribute_id,
      attribute_data: attribute_data,
      object_start_index: index,
    };

    this.isMultipleColumnOrdering = false;
  }

  onInlineEditorRelCellClick(item, type, index) {
    this.inlineEditorActiveCellData = {
      relationship_id: item.id,
      index: index,
    };

    switch (type) {
      case "from_object":
        this.inlineEditorActiveCellData.from_object_id = item.from_object_id;
        this.availableInlineObjects = [
          {
            object_id: item.from_object_id,
            name: item.from_object_name,
            model_id: item.from_model_id,
            model_name: item.from_model_name,
          },
        ];
        this.objectInlineAttributesForm.controls[
          "object_from_name_inline_" + item.id
        ].patchValue(item.from_object_id);
        break;
      case "to_object":
        this.inlineEditorActiveCellData.to_object_id = item.to_object_id;
        this.availableInlineObjects = [
          {
            object_id: item.to_object_id,
            name: item.to_object_name,
            model_id: item.to_model_id,
            model_name: item.to_model_name,
          },
        ];
        this.objectInlineAttributesForm.controls[
          "object_to_name_inline_" + item.id
        ].patchValue(item.to_object_id);
        break;
      case "relationship_type":
        this.inlineEditorActiveCellData.relationship_type_id =
          item.relationship_type_id;
        console.log("metamodel name", item);
        this.availableInlineRelationships = [
          {
            relationship_type_id: item.relationship_type_id,
            name: item.relationship_type_name,
            metamodel_name: item.relationship_type_metamodel,
          },
        ];
        break;
    }
  }

  onInlineEditorHeaderClick() {
    this.isMultipleColumnOrdering = false;
  }

  onInlineEditorCellDoubleClick(
    object_id,
    object_type_id,
    attribute_id,
    attribute_data,
    index
  ) {
    this.inlineEditorActiveRowData = {};
    this.inlineEditorRowContextMenuOptions = {};
    this.inlineEditorActiveCellData = {
      object_id: object_id,
      object_type_id: object_type_id,
      attribute_id: attribute_id,
      attribute_data: attribute_data,
      object_start_index: index,
    };

    this.isMultipleColumnOrdering = false;
  }

  onInlineEditorObjectUpdate(event, object_id) {
    if (
      this.objectInlineAttributesForm.controls[
        "object_type_inline_" + object_id
      ].valid
    ) {
      let object_type_id =
        this.objectInlineAttributesForm.controls[
          "object_type_inline_" + object_id
        ].value;
      this.modelService
        .updateObjectTypeName(
          this.loggedInUser["login_key"],
          object_id,
          object_type_id
        )
        .subscribe((data) => {
          if (data.status) {
            this.inlineEditorAttributes[object_id].object_type = event.name;
            this.inlineEditorAttributes[object_id].object_type_id =
              object_type_id;
            this.objectInlineAttributesForm.controls[
              "object_type_inline_" + object_id
            ].patchValue(object_type_id);

            this.inlineEditorUniqueNum = uuidv4();
            this.modelBrowserSocket.emit("properties_page_changes", {
              type: "objects",
              object_ids: [object_id],
              ui_num: this.inlineEditorUniqueNum,
            });
          }
        });
    }
  }

  onResizeCellHeightPrefill(event, attribute_data, object_start_index) {
    if (event.width && event.height) {
      let e = this.document.elementFromPoint(
        event.width,
        event.height
      ) as HTMLElement;
      if (e && e.classList.contains("edite-content-wrap")) {
        let attr_index_obj = e.closest("td").getAttribute("id").split("_");

        let target_index = parseInt(attr_index_obj[2]);
        if (object_start_index < attr_index_obj[2]) {
          let index = 0;

          for (let i in this.inlineEditorAttributes) {
            let element_obj = document.getElementById(
              "attr_cell_" + index + "_" + attr_index_obj[3]
            ) as HTMLElement;
            if (
              index > object_start_index &&
              index <= target_index &&
              (!attribute_data.attribute_id ||
                this.inlineEditorAttributes[i].attributes[
                  attribute_data.attribute_id
                ])
            ) {
              /**If Last One*/
              if (index == target_index) {
                element_obj.classList.remove("inline-cell-lr");
                element_obj.classList.add("inline-cell-lrb");
              } else {
                element_obj.classList.remove("inline-cell-lrb");
                element_obj.classList.add("inline-cell-lr");
              }

              /**Process Updates*/
              if (event.process) {
                /**Attribute Update*/
                if (attribute_data.attribute_id) {
                  this.inlineEditorAttributes[i].attributes[
                    attribute_data.attribute_id
                  ].selected_value = attribute_data.selected_value;
                  let attribute_value;
                  let attribute_form_value;
                  if (attribute_data.type == "multiple-list") {
                    attribute_value = attribute_data.selected_value
                      ? attribute_data.selected_value.join("__##__")
                      : "";
                    attribute_form_value = attribute_data.selected_value;
                  } else {
                    attribute_value = attribute_data.selected_value["0"];
                    attribute_form_value = attribute_value;
                  }

                  let attribute_item_name =
                    "attribute_inline_" + i + "_" + attribute_data.attribute_id;
                  if (
                    this.objectInlineAttributesForm.controls[
                      attribute_item_name
                    ]
                  ) {
                    this.objectInlineAttributesForm.controls[
                      attribute_item_name
                    ].patchValue(attribute_form_value);
                  }

                  let attribute_data_items = {
                    object_ids: [i],
                    attributes: [
                      {
                        attribute_id: attribute_data.attribute_id,
                        value: attribute_value,
                      },
                    ],
                  };

                  /**Update Attribute*/
                  this.modelService
                    .updateModelObjectAttributes(
                      this.loggedInUser["login_key"],
                      this.inlineEditorActiveTab,
                      attribute_data_items
                    )
                    .subscribe(() => {});
                } else {
                  /**Object Name Update*/
                  this.inlineEditorAttributes[i].name = attribute_data.name;
                  let control_name = "object_name_inline_" + i;
                  if (this.objectInlineAttributesForm.controls[control_name]) {
                    this.objectInlineAttributesForm.controls[
                      control_name
                    ].patchValue(attribute_data.name);
                  }
                  this.modelService
                    .updateObjectName(
                      this.loggedInUser["login_key"],
                      attribute_data.name,
                      i
                    )
                    .subscribe(() => {});
                }
              }
            } else {
              element_obj.classList.remove("inline-cell-lr", "inline-cell-lrb");
            }
            index++;
          }
        } else {
          this.cleanInlineEditorPrefillClasses();
        }
      } else {
        this.cleanInlineEditorPrefillClasses();
      }
    }
  }

  cleanInlineEditorPrefillClasses() {
    this.document
      .querySelectorAll(".attr-cell-prefill")
      .forEach((element) =>
        element.classList.remove("inline-cell-lr", "inline-cell-lrb")
      );
  }

  onEditModelDescription() {
    this.editModelFolderDescription = true;
  }

  onDiscardEditModelDescription() {
    this.modelFolderInfoForm.controls["description"].patchValue(
      this.modelFolderInfo.description
    );
    this.editModelFolderDescription = false;
  }

  onModelFolderInfoFormSubmit() {
    let type = "model";
    let model_folder_id = this.selectedModelId;
    if (this.selectedFolderId) {
      type = "folder";
      model_folder_id = this.selectedFolderId;
    } else if (this.selectedDiagramId) {
      type = "diagram";
      model_folder_id = this.selectedDiagramId;
    } else if (this.selectedViewGeneratorId) {
      type = "view";
      model_folder_id = this.selectedViewGeneratorId;
    }

    this.modelService
      .updateModelFolderDescription(
        this.loggedInUser["login_key"],
        model_folder_id,
        type,
        this.modelFolderInfoForm.value.description
      )
      .subscribe((data) => {
        if (data.status) {
          this.modelFolderInfo.description =
            this.modelFolderInfoForm.value.description;
          this.editModelFolderDescription = false;
          this.toastCtrl.success("Description successfully updated");

          this.modelBrowserSocket.emit("properties_page_changes", {
            type: "description",
            id: model_folder_id,
            item_type: type,
          });
        } else {
          this.toastCtrl.error(data.error);
        }
      });
  }

  onObjectDescriptionEdit(item) {
    item.edit_description = !item.edit_description;
  }

  onObjectDescriptionDiscard(item) {
    item.edit_description = false;
  }

  onObjectDescriptionSave(item) {
    let description = document.getElementById(
      "object_description_" + item.id
    ) as HTMLTextAreaElement;
    this.modelService
      .updateObjectDescription(
        this.loggedInUser["login_key"],
        item.id,
        description.value
      )
      .subscribe((data) => {
        if (data.status) {
          item.edit_description = false;
          item.description = description.value;
        } else {
          this.toastCtrl.error(data.error);
        }
      });
  }

  onInlineObjectNameUpdate(object_id, process_db = false) {
    if (
      this.objectInlineAttributesForm.controls[
        "object_name_inline_" + object_id
      ].valid
    ) {
      let object_name =
        this.objectInlineAttributesForm.controls[
          "object_name_inline_" + object_id
        ].value;
      if (process_db) {
        this.modelService
          .updateObjectName(
            this.loggedInUser["login_key"],
            object_name,
            object_id
          )
          .subscribe((data) => {
            if (data.status) {
              this.inlineEditorAttributes[object_id].name = object_name;
              /**Keep only model_id based logic once API completed, delete onUpdateInlineObjectNameProps*/
              if (data.model_id) {
                this.modelViewSocket[data.model_id].emit(
                  "pluto_model_object_rename",
                  {
                    id: object_id,
                    name: object_name,
                    parent_id: data.parent_id,
                    type: "object",
                  }
                );

                this.inlineEditorUniqueNum = uuidv4();
                this.modelBrowserSocket.emit("properties_page_changes", {
                  type: "objects",
                  object_ids: [object_id],
                  ui_num: this.inlineEditorUniqueNum,
                });
              } else {
                this.onUpdateInlineObjectNameProps(object_id, object_name);
              }
            }
          });
      } else {
        this.onUpdateInlineObjectNameProps(object_id, object_name);
      }
    }
  }

  onUpdateInlineObjectNameProps(object_id, object_name) {
    this.inlineEditorAttributes[object_id].name = object_name;
    let element = document.getElementById("object_tree_item_" + object_id);
    if (element) {
      element.setAttribute("name", object_name);
      document.getElementById(
        "object_tree_item_" + object_id + "_name"
      ).textContent = object_name;
    }
  }

  displayCurrencySymbol(currency) {
    let currency_symbols = this.attributeTypeService.getCurrencyIcons();
    return currency_symbols[currency];
  }

  displayCurrencyIcon(item): boolean {
    return item.currency && item.selected_value.length;
  }

  onInlineEditorCellEnter(row_index, cell_index, prefix) {
    // 'attr_cell_' + index + '_' + attr_idx + '_container'
    let next_row_cell = document.getElementById('attr_cell_' + (row_index + 1) + '_' + cell_index + prefix) as HTMLInputElement;
    if (next_row_cell) {
      next_row_cell.focus();
      next_row_cell.click();
    }
    else {
      this.inlineEditorNewObjectNameRef.nativeElement.focus();
      this.inlineEditorNewObjectNameRef.nativeElement.click();
    }
  }
  
  InlineNameChangeEventHandler(row_index) {
    // 'object_name_inline_' + item.value.id
    let inline_editor_rows = Object.keys(this.inlineEditorAttributes);
    let nextObjectCell = inline_editor_rows[row_index + 1];
    if (nextObjectCell) {
      let next_row_cell = document.getElementById('object_name_inline_' + nextObjectCell) as HTMLInputElement;
      if (next_row_cell) {
        next_row_cell.focus()
        next_row_cell.click();
      }
      else {
        this.inlineEditorNewObjectNameRef.nativeElement.focus();
        this.inlineEditorNewObjectNameRef.nativeElement.click();
      }
    }
  }

  onProcessInlineEditorRowObjectDelete() {
    this.modalService.dismissAll();
    switch (this.inlineEditorActiveTab) {
      case "objects":
        let object_ids = [];
        if (this.isMultipleColumnOrdering) {
          for (let i in this.inlineEditorAttributes) {
            object_ids.push(i);
          }
        } else {
          let object_id = this.inlineEditorActiveRowData.id
            ? this.inlineEditorActiveRowData.id
            : this.inlineEditorRowContextMenuOptions.id;
          /**Remove From Inline Editor*/
          for (let i in this.inlineEditorAttributes) {
            if (object_id == i) {
              delete this.inlineEditorAttributes[i];
            }
          }

          object_ids = [object_id];
        }

        /**Check if in list of selected objects*/
        let total_selected_object_ids = this.selectedObjectIds.length;
        if (total_selected_object_ids) {
          for (let i = 0; i < object_ids.length; i++) {
            let object_list_index = this.selectedObjectIds.indexOf(
              object_ids[i]
            );
            if (object_list_index !== -1) {
              if (total_selected_object_ids == 1) {
                this.selectedObjectIds = [];
                this.selectedMultipleObjects = [];
              } else {
                this.selectedObjectIds.splice(object_list_index, 1);
                for (let t = 0; t < this.selectedMultipleObjects.length; t++) {
                  if (this.selectedMultipleObjects[t].id == object_ids[i]) {
                    this.selectedMultipleObjects.splice(t, 1);
                  }
                }
              }
            }
          }
        }

        this.modelService
          .deleteObjectRelationships(
            this.loggedInUser["login_key"],
            object_ids,
            [],
            false
          )
          .subscribe((data) => {
            if (data.status) {
              this.inlineEditorLastDeletedObjects = object_ids;
              if (this.isMultipleColumnOrdering) {
                this.inlineEditorAttributes = [];
              } else {
                if (this.selectedFolderId || this.selectedModelId) {
                  this.loadInlineAttributes(this.inlineCurrentPage);
                }
              }

              if (data.items.length) {
                for (let i = 0; i < data.items.length; i++) {
                  if (
                    this.modelViewSocket[data.items[i].model_id] != undefined
                  ) {
                    this.modelViewSocket[data.items[i].model_id].emit(
                      "pluto_model_object_delete",
                      data.items[i]
                    );
                  }
                }
              }

              if (this.isMultipleColumnOrdering) {
                this.modelActivePage = "properties";
                this.onModelSelect(this.modelIds[0]);
              }
            } else {
              this.toastCtrl.error(data.error);
            }
          });
        break;
      case "relationships":
        let relationships = [];
        if (this.isMultipleColumnOrdering) {
          for (let i in this.inlineEditorAttributes) {
            relationships.push({
              id: this.inlineEditorAttributes[i].id,
              type: this.inlineEditorAttributes[i].diagram_id
                ? "diagram_relationship"
                : "object_relationship",
            });
          }
        } else {
          let selected_item = this.inlineEditorActiveRowData.id
            ? this.inlineEditorActiveRowData
            : this.inlineEditorRowContextMenuOptions;
          relationships.push({
            id: selected_item.id,
            type: selected_item.item.diagram_id
              ? "diagram_relationship"
              : "object_relationship",
          });
        }

        /**Delete Relationships & update Inline Editor*/
        this.modelService
          .deleteRelationships(
            this.loggedInUser["login_key"],
            relationships,
            false
          )
          .subscribe((data) => {
            if (data.status) {
              this.inlineEditorLastDeletedRelationships = relationships;
              this.loadInlineAttributes(
                this.isMultipleColumnOrdering
                  ? this.inlinePages - 1
                  : this.inlinePages
              );
            } else {
              this.toastCtrl.error(data.error);
            }
          });
        break;
    }
  }

  onPropertiesDateSelect(attribute) {
    let input_value_obj =
      this.objectAttributesForm.controls["attribute_" + attribute.attribute_id]
        .value;
    if (this.settings) {
      let settings_obj = this.settings.date_format.split(" ");
      let first_index = input_value_obj[settings_obj[0]];
      let second_index = input_value_obj[settings_obj[1]];
      let third_index = input_value_obj[settings_obj[2]];
      let property_text =
        first_index +
        this.settings.separator +
        second_index +
        this.settings.separator +
        third_index;
      attribute.selected_value = [property_text];
    }
  }

  public onExcelClipboardPaste(event, type, attribute_obj, index?) {
    this.inlineEditorActiveRowData = {};
    this.inlineEditorRowContextMenuOptions = {};
    let clipboardData = event.clipboardData;
    let data = clipboardData.getData("text");
    let row_data = data.split("\n");
    if (row_data.length) {
      this.inlineExcelPasteValidationError = this.checkExcelDataAttributes(
        "check",
        row_data,
        type,
        attribute_obj,
        index
      );
      if (Object.keys(this.inlineExcelPasteValidationError).length) {
        this.modalService.open(this.excelPasteErrorModal, { centered: true });
      } else {
        this.checkExcelDataAttributes(
          "update",
          row_data,
          type,
          attribute_obj,
          index
        );
      }
    } else {
      alert("No clipboard data");
    }
  }

  public getExcelDataValidate(
    process_type,
    attribute_obj,
    attribute_type,
    attribute_name,
    value
  ) {
    let has_error = false;
    let error = [];

    switch (attribute_type) {
      case "text":
        break;
      case "date":
        /**Validate Y-m-d*/
        if (
          process_type == "check" &&
          value &&
          value.match(/^\d{4}-\d{2}-\d{2}$/) == null
        ) {
          has_error = true;
          error = [
            attribute_name +
              " should be in YYYY-MM-DD format and received" +
              value,
          ];
        }
        break;
      case "boolean":
        let boolean_value = value.toLowerCase();
        if (
          process_type == "check" &&
          ["true", "false"].indexOf(boolean_value) == -1
        ) {
          has_error = true;
          error = [
            attribute_name +
              " should contain either true or false, provided " +
              value,
          ];
        }
        break;
      case "integer":
        if (
          process_type == "check" &&
          checkInteger(
            value,
            attribute_obj.values["0"],
            attribute_obj.values["1"]
          )
        ) {
          has_error = true;
          let integer_error_text = [];
          if (attribute_obj.values["0"] !== "") {
            integer_error_text.push("from " + attribute_obj.values["0"]);
          }

          if (attribute_obj.values["1"] !== "") {
            integer_error_text.push("up to " + attribute_obj.values["1"]);
          }

          error = [
            attribute_name +
              (integer_error_text.length
                ? " should be " + integer_error_text.join(" ")
                : ""),
          ];
        }
        break;
      case "decimal":
        if (
          process_type == "check" &&
          checkDecimal(
            value,
            attribute_obj.values["0"],
            attribute_obj.values["1"],
            attribute_obj.decimal_places
          )
        ) {
          has_error = true;

          let decimal_error_text = [];
          if (attribute_obj.values["0"] !== "") {
            decimal_error_text.push("from " + attribute_obj.values["0"]);
          }

          if (attribute_obj.values["1"] !== "") {
            decimal_error_text.push("up to " + attribute_obj.values["1"]);
          }

          error = [
            attribute_name +
              (decimal_error_text.length
                ? " should be " + decimal_error_text.join(" ")
                : ""),
          ];
        }
        break;
      case "list":
        if (
          process_type == "check" &&
          attribute_obj.values.indexOf(value) == "-1"
        ) {
          has_error = true;
          error = [attribute_name + " has no option " + value];
        }
        break;
      case "multiple-list":
        let multiple_items = value.split(",");
        if (process_type == "check") {
          for (let m = 0; m < multiple_items.length; m++) {
            if (attribute_obj.values.indexOf(multiple_items[m]) == "-1") {
              has_error = true;
              error.push(
                attribute_name + " has no option " + multiple_items[m]
              );
            }
          }
        }

        value = multiple_items;
        break;
    }

    return {
      has_error: has_error,
      error: error,
      value: value,
    };
  }

  public checkExcelDataAttributes(
    process_type,
    row_data,
    paste_element_type,
    attribute_obj,
    index
  ) {
    let has_error = false;
    let errors = {};
    let save_status = false;
    let model_id = null;
    let object_type_id = null;
    let new_row_objects = [];
    let first_object = [];
    let n = 1;

    for (let i = 0; i < row_data.length; i++) {
      let inline_editor_rows = Object.keys(this.inlineEditorAttributes);
      let object_id = inline_editor_rows[i];
      /**If have row in Inline Editor*/
      if (object_id && this.inlineEditorAttributes[object_id]) {
        if (i == 0) {
          model_id = this.inlineEditorAttributes[object_id].model_id;
          object_type_id =
            this.inlineEditorAttributes[object_id].object_type_id;
          first_object = this.inlineEditorAttributes[object_id];
        }

        errors[object_id] = {
          name: this.inlineEditorAttributes[object_id].name,
          errors: [],
        };

        let columns = row_data[i].split("\t");

        /**Object Name*/
        if (paste_element_type == "object") {
          if (process_type == "check") {
            if (typeof columns["0"] == "undefined" || !columns["0"].length) {
              errors[object_id].errors.push(
                this.inlineEditorAttributes[object_id].name +
                  " should not be empty"
              );
            }

            if (typeof columns["1"] != "undefined") {
              let match_object_type_id = this.searchObjectTypeMatchByName(
                columns["1"]
              );
              if (!match_object_type_id) {
                errors[object_id].errors.push(
                  this.inlineEditorAttributes[object_id].name +
                    " found no matches by " +
                    columns["1"]
                );
              }
            }
          } else {
            /**Process update*/
            this.modelViewSocket[model_id].emit("inline_editor_object_update", {
              type: "name_update",
              object_id: object_id,
              value: columns["0"],
            });

            if (
              this.objectInlineAttributesForm.controls[
                "object_name_inline_" + object_id
              ]
            ) {
              this.objectInlineAttributesForm.controls[
                "object_name_inline_" + object_id
              ].patchValue(columns["0"]);
              this.onInlineObjectNameUpdate(object_id, true);
            }

            if (typeof columns["1"] != "undefined") {
              let match_object_type_id = this.searchObjectTypeMatchByName(
                columns["1"]
              );
              if (match_object_type_id) {
                this.modelService
                  .updateObjectTypeName(
                    this.loggedInUser["login_key"],
                    object_id,
                    match_object_type_id
                  )
                  .subscribe((data) => {
                    if (data.status) {
                      this.modelViewSocket[model_id].emit(
                        "inline_editor_object_update",
                        {
                          type: "object_type_update",
                          object_type: columns["1"],
                          object_id: object_id,
                          object_type_id: match_object_type_id,
                        }
                      );
                    }
                  });
              }
            }
          }
        }

        /**Object Type*/
        if (paste_element_type == "object_type") {
          if (process_type == "check") {
            if (typeof columns["0"] == "undefined" || !columns["0"].length) {
              errors[object_id].errors.push(
                this.inlineEditorAttributes[object_id].name +
                  " has no object type"
              );
            } else {
              let match_object_type_id = this.searchObjectTypeMatchByName(
                columns["0"]
              );
              if (!match_object_type_id) {
                errors[object_id].errors.push(
                  this.inlineEditorAttributes[object_id].name +
                    " found no matches by " +
                    columns["0"]
                );
              }
            }
          } else {
            /**Process update*/
            let match_object_type_id = this.searchObjectTypeMatchByName(
              columns["0"]
            );
            if (match_object_type_id) {
              this.modelService
                .updateObjectTypeName(
                  this.loggedInUser["login_key"],
                  object_id,
                  match_object_type_id
                )
                .subscribe((data) => {
                  if (data.status) {
                    this.modelViewSocket[model_id].emit(
                      "inline_editor_object_update",
                      {
                        type: "object_type_update",
                        object_type: columns["0"],
                        object_id: object_id,
                        object_type_id: match_object_type_id,
                      }
                    );
                  }
                });
            }
          }
        }

        /**Attributes*/
        if (this.inlineEditorSelectedAttributes[i]) {
          for (
            let s = index;
            s <= this.inlineEditorSelectedAttributes.length;
            s++
          ) {
            /**Skip first index on object paste*/
            let col_index;
            switch (paste_element_type) {
              case "object":
                col_index = s + 2;
                break;
              case "object_type":
                col_index = s + 1;
                break;
              default:
                col_index = s;
                break;
            }
            // let col_index = (paste_element_type == 'object') ? s + 2 : s;
            if (typeof columns[col_index] == "undefined") {
              continue;
            }

            let attribute_id =
              this.inlineEditorSelectedAttributes[s].attribute_id;
            let attribute_validate = this.getExcelDataValidate(
              process_type,
              this.inlineEditorAttributes[object_id].attributes[attribute_id],
              this.inlineEditorAttributes[object_id].attributes[attribute_id]
                .type,
              this.inlineEditorAttributes[object_id].attributes[attribute_id]
                .name,
              columns[col_index]
            );

            if (attribute_validate.has_error) {
              for (let e = 0; e < attribute_validate.error.length; e++) {
                errors[object_id].errors.push(attribute_validate.error[e]);
              }
            } else {
              if (
                process_type == "update" &&
                this.inlineEditorAttributes[object_id].attributes[attribute_id]
                  .type == "multiple"
              ) {
                columns[col_index] = attribute_validate.value;
              }
            }

            if (process_type == "update") {
              /**Process update*/
              this.modelViewSocket[model_id].emit(
                "inline_editor_object_update",
                {
                  type: "attribute_update",
                  object_id: object_id,
                  attribute_id: attribute_id,
                  value: columns[col_index],
                }
              );
              if (
                this.objectInlineAttributesForm.controls[
                  "attribute_inline_" + object_id + "_" + attribute_id
                ]
              ) {
                this.onInlineObjectAttributeUpdate(
                  object_id,
                  attribute_id,
                  false
                );
              }
            }
          }
        }
      } else {
        let new_object_key = "new_obj_" + n;
        let object_attributes = [];
        errors[new_object_key] = {
          name: "New Object " + n,
          errors: [],
        };

        if (paste_element_type == "object") {
          let columns = row_data[i].split("\t");
          if (typeof columns["0"] == "undefined" || !columns["0"].length) {
            has_error = true;
            errors[new_object_key].errors.push(
              "Object Name can not be empty, please paste data to object name cell"
            );
          } else {
            /**Handle Object Type Update*/
            if (typeof columns["1"] == "undefined") {
              errors[new_object_key].errors.push(
                "Object Type not found - " + columns["1"]
              );
            } else {
              let match_object_type_id = this.searchObjectTypeMatchByName(
                columns["1"]
              );
              if (match_object_type_id) {
                object_type_id = match_object_type_id;
              } else {
                errors[new_object_key].errors.push(
                  "Object Type not found - " + columns["1"]
                );
              }
            }

            /**Attributes*/
            if (this.inlineEditorSelectedAttributes[i]) {
              for (
                let s = index;
                s <= this.inlineEditorSelectedAttributes.length;
                s++
              ) {
                /**Skip first index on object paste*/
                let col_index = s + 2;
                if (typeof columns[col_index] == "undefined") {
                  continue;
                }

                let attribute_id =
                  this.inlineEditorSelectedAttributes[s].attribute_id;
                let attribute_validate = this.getExcelDataValidate(
                  process_type,
                  first_object["attributes"][attribute_id],
                  first_object["attributes"][attribute_id].type,
                  first_object["attributes"][attribute_id].name,
                  columns[col_index]
                );
                if (attribute_validate.has_error) {
                  for (let e = 0; e < attribute_validate.error.length; e++) {
                    has_error = true;
                    errors[new_object_key].errors.push(
                      attribute_validate.error[e]
                    );
                  }
                } else {
                  if (
                    process_type == "update" &&
                    first_object["attributes"][attribute_id].type == "multiple"
                  ) {
                    columns[col_index] =
                      attribute_validate.value &&
                      attribute_validate.value.length
                        ? attribute_validate.value.join("__##__")
                        : "";
                  }
                }

                if (process_type == "update") {
                  object_attributes.push({
                    attribute_id: attribute_id,
                    value: columns[col_index],
                  });
                }
              }
            }

            new_row_objects.push({
              model_id: model_id,
              object_type_id: object_type_id,
              name: columns["0"],
              attributes: object_attributes,
            });
          }
        } else {
          errors[new_object_key] = {
            name: "New Object",
            errors: [
              "Object Name can not be empty, please paste data to object name cell",
            ],
          };
        }

        n++;
      }
    }

    /**Process update*/
    if (process_type == "update" && new_row_objects.length) {
      let get_obj = this.getInlineEditorObjectCreateParent();
      if (get_obj) {
        this.modelService
          .addMultipleInlineEditorObjects(
            this.loggedInUser["login_key"],
            new_row_objects,
            get_obj.parent_id,
            get_obj.type
          )
          .subscribe((data) => {
            if (data.status) {
              this.toastCtrl.success("Object created successfully");

              /**Update Child*/
              if (get_obj.parent_parent_id) {
                this.modelViewSocket[get_obj.parent_parent_id].emit(
                  "pluto_model_object_create",
                  {
                    parent_id: get_obj.parent_id,
                    parent_parent_id: get_obj.parent_parent_id,
                    pages: data.pages,
                  }
                );
              }

              if (
                this.selectedModelId &&
                this.selectedModelId == get_obj.parent_id
              ) {
                console.log("append to model");
              } else if (
                this.selectedFolderId &&
                this.selectedFolderId == get_obj.parent_id
              ) {
                console.log("append to folder");
              } else {
                /**Update Selected Objects*/
                for (let i = 0; i < data.objects.length; i++) {
                  if (
                    document.getElementById(
                      "object_tree_item_" + data.objects[i].id
                    )
                  ) {
                    this.selectedObjectIds.push(data.objects[i].id);
                    this.selectedMultipleObjects.push({
                      id: data.objects[i].id,
                      parent_id: get_obj.parent_id,
                      name: data.objects[i].name,
                    });
                  }
                }
              }

              this.onPageChange(this.modelActivePage);
            }
          });
      }
    }

    return process_type == "check" ? (has_error ? errors : {}) : save_status;
  }

  public onObjectSystemAvailableAttributesUpdate(event, type) {
    this.modelService
      .updateModelObjectAvailableSystemProperties(
        this.loggedInUser["login_key"],
        this.selectedObjectIds,
        this.selectedFolderId,
        this.selectedModelId,
        this.inlineEditorActiveTab,
        [{ type: type, selected: event.target.checked }]
      )
      .subscribe((data) => {
        if (data.status) {
          /**Update Inline Editor Columns*/
          this.loadInlineAttributes(this.inlineCurrentPage);
        } else {
          this.toastCtrl.error("Unable to update attributes");
        }
      });
  }

  public getPropertyAttributeColumns(attributes) {
    let first_obj = [];
    let second_obj = [];
    let middle_index = Math.ceil(attributes.length / 2);
    for (let i = 0; i < attributes.length; i++) {
      if (i < middle_index) {
        first_obj.push(attributes[i]);
      } else {
        second_obj.push(attributes[i]);
      }
    }

    return [first_obj, second_obj];
  }

  onInlineEditorRowNumberClick(item) {
    this.inlineEditorRowContextMenuOptions = {};
    if (this.inlineEditorActiveRowData.id == item.key) {
      this.inlineEditorActiveRowData = {};
    } else {
      this.inlineEditorActiveRowData = {
        id: item.key,
        item: item.value,
      };
    }

    this.isMultipleColumnOrdering = false;
  }

  onInlineEditorCellFitSize(event, type, item?) {
    let closest_th = event.target.closest("th");
    if (closest_th) {
      let index_num = [...closest_th.parentElement.childNodes].indexOf(
        closest_th
      );
      let inline_editor_rows = document.getElementsByClassName(
        "inline-editor-row-item"
      );
      if (inline_editor_rows.length) {
        let max_width = 0;
        for (let i = 0; i < inline_editor_rows.length; i++) {
          let cols = inline_editor_rows[i].getElementsByTagName("td");
          let content_container = cols[index_num].getElementsByClassName(
            "inline-display-text"
          );
          if (content_container.length) {
            let el: HTMLElement = content_container[0] as HTMLElement;
            let item_width = el.offsetWidth;
            if (item_width > max_width) {
              max_width = item_width;
            }
          }
        }

        max_width += 30;
        this.onInlineEditorColumnResize(max_width, type, true, item);
      }
    }

    this.isMultipleColumnOrdering = false;
  }

  calculateInlineEditorTableWidth() {
    let inline_editor_table_width =
      this.inlineEditorTableFirstColumnWidth +
      this.inlineEditorTableAttributesColumnWidth;
    for (let i = 0; i < this.inlineEditorSelectedAttributes.length; i++) {
      inline_editor_table_width += this.inlineEditorSelectedAttributes[i].width;
    }

    /**Check if Objects or Relationships tab is open*/
    if (this.inlineEditorActiveTab == "objects") {
      inline_editor_table_width += this.inlineEditorObjectNameColumnWidth;
    } else {
      inline_editor_table_width +=
        this.inlineEditorFromObjectColumnWidth +
        this.inlineEditorRelationshipColumnWidth +
        this.inlineEditorToObjectColumnWidth;
    }

    if (this.inlineEditorSelectedSystemProperties.model_name) {
      inline_editor_table_width += this.inlineEditorModelColumnWidth;
    }

    if (this.inlineEditorSelectedSystemProperties.created_by) {
      inline_editor_table_width +=
        this.inlineEditorSystemPropertyColumnWidths.created_by;
    }

    if (this.inlineEditorSelectedSystemProperties.created_date) {
      inline_editor_table_width +=
        this.inlineEditorSystemPropertyColumnWidths.created_date;
    }

    if (this.inlineEditorSelectedSystemProperties.updated_by) {
      inline_editor_table_width +=
        this.inlineEditorSystemPropertyColumnWidths.updated_by;
    }

    if (this.inlineEditorSelectedSystemProperties.updated_date) {
      inline_editor_table_width +=
        this.inlineEditorSystemPropertyColumnWidths.updated_date;
    }

    if (this.inlineEditorSelectedSystemProperties.object_type) {
      inline_editor_table_width +=
        this.inlineEditorSystemPropertyColumnWidths.object_type;
    }

    if (this.inlineEditorSelectedSystemProperties.description) {
      inline_editor_table_width +=
        this.inlineEditorSystemPropertyColumnWidths.description;
    }

    this.inlineEditorTableWidth = inline_editor_table_width;
  }

  onDisplayRowManageOptions(event, item): boolean {
    let left =
      event.clientX -
      document.getElementById("left_sidebar_menu").clientWidth -
      document.getElementById("inner_sidebar").clientWidth -
      30;
    this.inlineEditorRowContextMenuOptions =
      this.inlineEditorRowContextMenuOptions.id == item.id &&
      this.inlineEditorRowContextMenuOptions.active
        ? {}
        : { id: item.id, item: item, left: left, active: true };
    return false;
  }

  onPrepareInlineRowDelete(item): boolean {
    this.inlineEditorRowContextMenuOptions = {
      id: item.id,
      item: item,
      active: false,
    };
    this.modalService.open(this.deleteInlineEditorObjectModal, {
      centered: true,
    });
    return false;
  }

  searchObjectTypeMatchByName(name) {
    let match_object_type_id = null;
    for (let i in this.availableObjectTypes) {
      if (this.availableObjectTypes[i].name == name) {
        match_object_type_id = this.availableObjectTypes[i].object_type_id;
      }
    }

    return match_object_type_id;
  }

  setNavigationPageChange(hide_sidebar) {
    this.eventsService.onPageChange({
      hide_sidebar: hide_sidebar,
      section: "models",
      page: "models",
    });
  }

  onRenderSafeSVG(svg) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  onCloseObjectShapeDetails() {
    this.mxEditorObjectShapeDetails = null;
  }

  calculateAvailableIframeHeight(calculate_header_height) {
    let body = document.body,
      html = document.documentElement;
    let max_height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    let header_height = calculate_header_height ? 92 : 0;
    return max_height - header_height - 10;
  }

  handleDiagramNewTab() {
    if (this.diagramNewTab) {
      if (this.standAlongPageUrl) {
        window.open(
          this.standAlongPageUrl + "#" + this.selectedDiagramId,
          "_blank"
        );
      } else {
        let new_location =
          environment.app_url +
          location.pathname +
          (location.search ? location.search : "");
        window.open(new_location + "#" + this.selectedDiagramId, "_blank");
      }

      /**Display SVG on current tab*/
      this.modelActivePage = "content-viewer";
      this.onProcessCurrentStateSave();
      this.onPageChange(this.modelActivePage);
    } else {
      window.location.hash = this.selectedDiagramId;
    }
  }

  hasDiagramSVG(): boolean {
    return !!(
      this.selectedDiagramSVG && Object.keys(this.selectedDiagramSVG).length
    );
  }

  onDiagramSVGZoom(type): boolean {
    let style_attributes;
    let zoom_pan_options = { x: 0, y: 0 };
    switch (type) {
      case "in":
        this.diagramSvgPanZoom.zoomIn();
        style_attributes =
          "width:" +
          (this.diagramSvgContainerEl.nativeElement.clientWidth + 50) +
          "px;height:" +
          (this.diagramSvgContainerEl.nativeElement.clientHeight + 50) +
          "px";
        let zoom_in_pan_coordinates = this.diagramSvgPanZoom.getPan();
        zoom_pan_options.x = zoom_in_pan_coordinates.x + 20;
        zoom_pan_options.y = zoom_in_pan_coordinates.y + 5;
        break;
      case "out":
        /**Do not allow to zoom out after 200px height*/
        if (this.diagramSvgContainerEl.nativeElement.clientHeight < 200) {
          return false;
        }
        this.diagramSvgPanZoom.zoomOut();
        let zoom_out_pan_coordinates = this.diagramSvgPanZoom.getPan();
        zoom_pan_options.x = zoom_out_pan_coordinates.x - 20;
        zoom_pan_options.y = zoom_out_pan_coordinates.y - 5;
        style_attributes =
          "width:" +
          (this.diagramSvgContainerEl.nativeElement.clientWidth - 50) +
          "px;height:" +
          (this.diagramSvgContainerEl.nativeElement.clientHeight - 50) +
          "px";
        break;
      case "reset":
        this.diagramSvgPanZoom.zoom(0.7);
        style_attributes =
          "width:" +
          this.diagramSvgPanZoomOptions.document_x +
          "px;height:" +
          this.diagramSvgPanZoomOptions.document_x +
          "px;";
        zoom_pan_options = {
          x: this.diagramSvgPanZoomOptions.svg_x,
          y: this.diagramSvgPanZoomOptions.svg_y,
        };
        break;
    }

    this.diagramSvgContainerEl.nativeElement.setAttribute(
      "style",
      style_attributes
    );

    /**Center Horizontally on zoom in/out*/
    // this.diagramSvgPanZoom.center();
    this.diagramSvgPanZoom.pan(zoom_pan_options);
    return false;
  }

  onMxEditorToggleTreeMenu() {
    this.mxEditorHideTreeViewModeEnabled =
      !this.mxEditorHideTreeViewModeEnabled;
    this.diagram_socket.emit("pluto_set_editor_fit_one_page", {
      show_hide_model_btn: !this.mxEditorHideTreeViewModeEnabled,
    });
  }

  /**View Generator*/
  onViewGeneratorFilterExpand(event, type) {
    this.expandViewFilterExpandOptions.type =
      this.expandViewFilterExpandOptions.type == type ? null : type;
  }
  onViewNumOfLevelFilterExpand(event, type) {
    this.expandViewFilterExpandOptions.type =
      this.expandViewFilterExpandOptions.type == type ? null : type;
  }

  onViewGeneratorFilterObjectTypeChange(event, id): boolean {
    let get_index = this.viewGeneratorSelectedFilterObjectTypes.indexOf(id);
    if (get_index == -1) {
      if (event.target.checked) {
        this.viewGeneratorSelectedFilterObjectTypes.push(id);
      }
    } else {
      this.viewGeneratorSelectedFilterObjectTypes.splice(get_index, 1);
    }

    this.onGenerateView();
    return false;
  }

  onViewGeneratorFilterRelationshipTypeChange(event, id): boolean {
    let get_index =
      this.viewGeneratorSelectedFilterRelationshipTypes.indexOf(id);
    if (get_index == -1) {
      if (event.target.checked) {
        this.viewGeneratorSelectedFilterRelationshipTypes.push(id);
      }
    } else {
      this.viewGeneratorSelectedFilterRelationshipTypes.splice(get_index, 1);
    }

    this.onGenerateView();
    return false;
  }

  onViewGeneratorReportChange(type) {
    this.viewGeneratorReportType = type;
    this.onGenerateView();
  }

  onViewGeneratorFilterRelationshipAttributeChange(event, id) {
    this.viewGeneratorRelationshipAttribute = event.target.checked ? id : "";
    this.onGenerateView();
  }

  onViewGeneratorGroupAttributeTypeChange(event, item): boolean {
    this.viewGeneratorSelectedGroupOptions = event.target.checked
      ? { id: item.id, type: "attribute", name: item.name }
      : {};
    this.onGenerateView();
    return false;
  }

  onViewGeneratorGroupRelationshipTypeChange(event, item): boolean {
    this.viewGeneratorSelectedGroupOptions = event.target.checked
      ? { id: item.id, type: "relationship", name: item.name }
      : {};
    this.onGenerateView();
    return false;
  }
  
  onViewGeneratorGroupObjectTypeChange(event, item): boolean {
    this.viewGeneratorSelectedGroupOptions = event.target.checked
      ? { id: item.id, type: "model", name: item.name }
      : {};
    this.onGenerateView();
    return false;
  }

  onViewGeneratorGroupLevelTypeChange(event, item): boolean {
    console.log("item", item);
    if (item === '9') {
      console.log("event.target.checked", event.target.checked);
      this.viewGeneratorSelectedlevelOptions = event.target.checked
        ? { level: 9, name: "Unlimited" }
        : {};
        this.viewGeneratorFilterLevel = 9
    } else {
      this.viewGeneratorSelectedlevelOptions = event.target.checked
        ? { level: item.level, name: item.name }
        : {};
        this.viewGeneratorFilterLevel = item.level
    }
    console.log(
      " this.viewGeneratorSelectedlevelOptions",
      this.viewGeneratorSelectedlevelOptions
    );

    this.onGenerateView();
    return false;
  }

  onViewGeneratorLayoutChange(type) {
    this.expandViewFilterExpandOptions = { type: null };
    this.viewGeneratorSelectedLayout = type;
    this.viewGenerationEventService.onViewGenerationLayoutChange(type);
  }

  /**Calculate total nested items*/
  calculate_total_items(items, total) {
    total += items.length;
    for (let i = 0; i < items.length; i++) {
      return this.calculate_total_items(items[i].items, total);
    }

    return total;
  }

  onGenerateView(): boolean {
    if (!this.viewGeneratorSelectedlevelOptions) {
      return;
    }
    this.expandViewFilterExpandOptions = { type: null };
    let filter_level = this.viewGeneratorFilterLevel;
    if (Number.isInteger(filter_level)) {
      let params = this.generateViewGenerationFilters(filter_level);
      this.viewGeneratorGroups = [];
      this.viewGeneratorData = [];
      this.viewGeneratorObjectIds = [];
      this.hasViewGenerated = false;
      this.modelService
        .getViewGeneratorData(this.loggedInUser["login_key"], params)
        .subscribe((data) => {
          if (data.status) {
            // this.viewGeneratorGroups = data.groups;
            // this.viewGeneratorData = data.data;
            this.allObjectIdsContainedInView = data.data.map((d) => d.id);
            if (this.viewGeneratorReportType == "hierarchy") {
              let root_nodes = data.data;
              if (root_nodes.length > 1) {
                for (let i = 0; i < root_nodes.length; i++) {
                  root_nodes[i].total_items = this.calculate_total_items(
                    data.data[i].items,
                    0
                  );
                }

                root_nodes.sort(function (a, b) {
                  return a.total_items - b.total_items;
                });

                root_nodes.filter(function (data) {
                  let other_roots = root_nodes.filter((d) => {
                    return d.id != data.id;
                  });

                  /**Check if duplicate found in nested hierarchy*/
                  let check_nested_match = function (items, id, matches_found) {
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].id == id) {
                        matches_found++;
                      }

                      if (items[i].items.length) {
                        matches_found += check_nested_match(
                          items[i].items,
                          id,
                          matches_found
                        );
                      }
                    }
                    return matches_found;
                  };

                  let has_duplicate = check_nested_match(
                    other_roots,
                    data.id,
                    0
                  );
                  if (has_duplicate) {
                    root_nodes = other_roots;
                  }
                });
              }

              /**Root items export attribute labels*/
              this.viewGeneratorGroups = [];
              this.viewGeneratorData =
                this.set_export_attribute_labels(root_nodes);

              for (let i = 0; i < this.viewGeneratorData.length; i++) {
                this.viewGeneratorData[i].first_layer_subs =
                  this.viewGeneratorData[i].items.length;
                this.viewGeneratorData[i].total_nested =
                  this.viewGeneratorHierarchyChild(
                    this.viewGeneratorData[i].items,
                    0
                  );
              }
            } else {
              let group_data = <any>data.groups;
              for (let i = 0; i < group_data.length; i++) {
                if (
                  group_data[i].export_attributes &&
                  group_data[i].export_attributes.length
                ) {
                  for (
                    let t = 0;
                    t < group_data[i].export_attributes.length;
                    t++
                  ) {
                    group_data[i].export_attributes[t].mx_label =
                      this.renderPropertiesValue(
                        group_data[i].export_attributes[t],
                        true
                      );
                  }
                }
              }

              this.viewGeneratorGroups = group_data;
              this.viewGeneratorData = data.data;

              for (let i = 0; i < this.viewGeneratorData.length; i++) {
                this.viewGeneratorObjectIds.push(this.viewGeneratorData[i].id);
              }
            }

            this.hasViewGenerated = true;
          } else {
            this.toastCtrl.error(data.error);
          }
        });
    } else {
      this.toastCtrl.info("Please specify valid level");
    }

    return false;
  }

  set_export_attribute_labels(items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].export_attributes && items[i].export_attributes.length) {
        for (let t = 0; t < items[i].export_attributes.length; t++) {
          items[i].export_attributes[t].mx_label = this.renderPropertiesValue(
            items[i].export_attributes[t],
            true
          );
        }
      }

      if (items[i].items.length) {
        this.set_export_attribute_labels(items[i].items);
      }
    }

    return items;
  }

  viewGeneratorHierarchyChild(items, count) {
    let total_subs = items.length;
    if (total_subs) {
      count += 1;
      for (let i = 0; i < items.length; i++) {
        if (items[i].items.length) {
          return this.viewGeneratorHierarchyChild(items[i].items, count);
        }
      }
    }

    return count;
  }

  hasMoreObjectsSelected() {
    return Object.keys(this.sharedObjectProperties).length > 1;
  }

  /**View Generation*/
  onViewGeneratorZoom(type) {
    // switch (type) {
    //   case 'in':
    //     this.viewGeneratorContainerCurrentWidth += 50;
    //   break;
    //   case 'out':
    //     this.viewGeneratorContainerCurrentWidth -= 50;
    //   break;
    //   case 'fit':
    //     this.viewGeneratorContainerCurrentWidth = this.viewGeneratorContainerWidth;
    //   break;
    // }
    this.viewGenerationEventService.onViewGenerationBoxZoomChange(type);
  }

  onShowSaveViewModal() {
    /**Initialize Form*/
    if (this.selectedViewGeneratorId) {
      this.isViewGeneratorLoading = true;
      let filter_level = this.viewGeneratorFilterLevel
      if (Number.isInteger(filter_level)) {
        let params = <any>this.generateViewGenerationFilters(filter_level);
        params.id = this.selectedViewGeneratorId;
        params.layout_type = this.viewGeneratorSelectedLayout;
        params.view_svg = this.generatedSvg;
        this.modelService
          .saveViewGenerator(this.loggedInUser["login_key"], params)
          .subscribe((data) => {
            this.isViewGeneratorLoading = false;
            if (data.status) {
              this.toastCtrl.info("View successfully updated");
            } else {
              this.toastCtrl.error(data.error);
            }
          });
      } else {
        this.toastCtrl.info("Please specify valid level");
      }
    } else {
      this.saveModelForm = new UntypedFormGroup({
        name: new UntypedFormControl(null, {
          updateOn: "change",
          validators: [Validators.required],
        }),
      });

      this.modalService.open(this.saveViewModal, {
        size: "sm",
        centered: true,
      });
    }
  }

  onProcessSaveModel() {
    console.log("onProcessSaveModel");
    if (this.saveModelForm.value.name != null) {
      let filter_level = this.viewGeneratorFilterLevel;
      let params = <any>this.generateViewGenerationFilters(filter_level);
      params.name = this.saveModelForm.value.name;
      params.layout_type = this.viewGeneratorSelectedLayout;
      params.view_svg = this.generatedSvg;
      this.modelService
        .saveViewGenerator(this.loggedInUser["login_key"], params)
        .subscribe((data) => {
          if (data.status) {
            this.modalService.dismissAll();
            if (this.selectedViewGeneratorId) {
              this.toastCtrl.info("View updated successfully");
            } else {
              this.toastCtrl.success("View created successfully");
              if (data.model_id && this.modelViewSocket[data.model_id]) {
                this.modelViewSocket[data.model_id].emit(
                  "pluto_model_object_create",
                  {
                    parent_id: data.parent_id,
                    parent_parent_id: data.parent_parent_id,
                  }
                );
              } else {
                this.modelEventService.onModelViewObjectCreateForChild({
                  parent_id: data.parent_id,
                  pages: data.pages,
                });
              }
            }
          } else {
            this.toastCtrl.error(data.error);
          }
        });
    }
  }

  hasLoggedInUser() {
    return !!(
      this.loggedInUser !== null && Object.keys(this.loggedInUser).length
    );
  }

  generateViewGenerationFilters(filter_level) {
    return {
      id: null,
      selected_ids: this.viewGeneratorSelectedModelFolderObject.ids,
      selected_type: this.viewGeneratorSelectedModelFolderObject.type,
      type: this.viewGeneratorReportType,
      relationship_description: this.viewGeneratorRelationshipAttribute,
      filter_object_types: this.viewGeneratorSelectedFilterObjectTypes,
      filter_relationship_types:
        this.viewGeneratorSelectedFilterRelationshipTypes,
      filter_num_levels: filter_level,
      group_options: Object.keys(this.viewGeneratorSelectedGroupOptions).length
        ? this.viewGeneratorSelectedGroupOptions
        : null,
      name: null,
      all_object_ids: this.allObjectIdsContainedInView,
    };
  }

  /**Diagram Import*/
  onDiagramImportProcess(event) {
    if (event.target.files && event.target.files.length) {
      /**Clear old data*/
      this.diagramImportedFiles = [];
      this.diagramImportSavedMappings = [];
      this.diagramTypesList = [];
      this.diagramImportSelectedType = null;
      this.diagramTypesMaxPages = this.diagramTypesCurrentPage = 1;
      this.diagramImportMappingSubmitted = false;
      this.diagramImportSelectedFiles = [];
      this.isDiagramImportLoading = false;

      this.loadDiagramTypes(this.diagramTypesCurrentPage);

      this.importDiagramForm = new UntypedFormGroup({
        diagram_name: new UntypedFormControl(null, {
          updateOn: "change",
          validators: [Validators.required],
        }),
        generate_diagram_contents: new UntypedFormControl(true, {
          updateOn: "change",
        }),
        reuse_objects: new UntypedFormControl(null, {
          updateOn: "change",
        }),
      });

      let total_files = event.target.files.length;
      this.diagramImportShowNameField = total_files == 1;

      this.modalService.dismissAll();
      this.modalService.open(this.processingModal, {
        size: "sm",
        centered: true,
      });

      /**Read imported files*/
      let imported_files = [];
      for (let i = 0; i < total_files; i++) {
        let fileReader = new FileReader();
        fileReader.onload = () => {
          let file_name = event.target.files[i].name
            .split(".")
            .slice(0, -1)
            .join(".");
          imported_files.push({
            name: file_name,
            content: fileReader.result,
          });

          /**Default diagram name to imported file name*/
          if (this.diagramImportShowNameField) {
            this.importDiagramForm.controls.diagram_name.patchValue(file_name);
          }

          /**Once all files read, show import popup*/
          if (i == total_files - 1) {
            this.diagramImportSVGSocket.emit(
              "editor_extract_diagram_xml_svg",
              imported_files
            );
          }
        };
        fileReader.readAsText(event.target.files[i]);
      }
    }
  }

  loadDiagramTypes(page) {
    this.isDiagramTypesListLoading = true;
    this.diagramTypesCurrentPage = page;
    this.diagramTypeService
      .getDiagramTypes(
        this.loggedInUser["login_key"],
        "name_asc",
        this.diagramTypesCurrentPage
      )
      .subscribe((data) => {
        if (data.status) {
          this.diagramTypesMaxPages = data.pages;
          this.diagramTypesList = this.diagramTypesList.length
            ? this.diagramTypesList.concat(data.diagram_types)
            : data.diagram_types;
          this.isDiagramTypesListLoading = false;
        } else {
          this.isDiagramTypesListLoading = false;
          this.toastCtrl.info("Unable to get diagram templates");
        }
      });
  }

  onCreateDiagramImportMapping(): boolean {
    this.diagramImportMappingSubmitted = true;
    if (!this.diagramImportShowNameField || this.importDiagramForm.valid) {
      if (!this.diagramImportSelectedFiles.length) {
        this.toastCtrl.info("Please select imported file");
      } else {
        if (!this.diagramImportSelectedFiles.length) {
          this.toastCtrl.error("Please select at least one imported file");
          return false;
        }

        let diagram_type_id = null;
        let diagram_type_name = null;
        if (this.diagramImportSelectedType != null) {
          diagram_type_id =
            this.diagramTypesList[this.diagramImportSelectedType].id;
          diagram_type_name =
            this.diagramTypesList[this.diagramImportSelectedType].name;
        }

        if (!diagram_type_id || !diagram_type_name) {
          this.toastCtrl.info("Please select diagram type to continue");
          return false;
        }

        for (let i = 0; i < this.diagramImportSelectedFiles.length; i++) {
          this.diagramImportSavedMappings.push({
            diagram_name: this.diagramImportShowNameField
              ? this.importDiagramForm.value.diagram_name
              : this.diagramImportedFiles[this.diagramImportSelectedFiles[i]]
                  .name,
            file_name:
              this.diagramImportedFiles[this.diagramImportSelectedFiles[i]]
                .name,
            file_content:
              this.diagramImportedFiles[this.diagramImportSelectedFiles[i]]
                .content,
            diagram_type_id: diagram_type_id,
            diagram_type_name: diagram_type_name,
            svg: this.diagramImportedFiles[this.diagramImportSelectedFiles[i]]
              .svg,
            svg_padding_top:
              this.diagramImportedFiles[this.diagramImportSelectedFiles[i]]
                .svg_padding_top,
            svg_padding_left:
              this.diagramImportedFiles[this.diagramImportSelectedFiles[i]]
                .svg_padding_left,
          });
        }

        /**Reset Form*/
        this.diagramImportMappingSubmitted = false;
        this.importDiagramForm.controls.diagram_name.patchValue(null);
        this.diagramImportSelectedFiles = [];
        this.diagramImportSelectedType = null;
      }
    }
  }

  onSelectAllDiagramFiles() {
    let total_files_selected = this.diagramImportedFiles.length;
    for (let i = 0; i < total_files_selected; i++) {
      let get_index = this.diagramImportSelectedFiles.indexOf(i);
      if (get_index == -1) {
        this.diagramImportSelectedFiles.push(i);
      }
    }

    this.diagramImportShowNameField = total_files_selected == 1;
    if (
      this.diagramImportShowNameField &&
      this.importDiagramForm.controls.diagram_name.value == null
    ) {
      this.importDiagramForm.controls.diagram_name.patchValue(
        this.diagramImportedFiles[this.diagramImportSelectedFiles[0]].name
      );
    }
  }

  onDiagramImportFileSelect(event, index) {
    if (event.target.checked) {
      this.diagramImportSelectedFiles.push(index);
    } else {
      let get_index = this.diagramImportSelectedFiles.indexOf(index);
      if (get_index !== -1) {
        this.diagramImportSelectedFiles.splice(get_index, 1);
      }
    }

    let total_files_selected = this.diagramImportSelectedFiles.length;
    this.diagramImportShowNameField =
      total_files_selected == 1 || this.diagramImportedFiles.length == 1;
    if (
      total_files_selected &&
      this.importDiagramForm.controls.diagram_name.value == null
    ) {
      this.importDiagramForm.controls.diagram_name.patchValue(
        this.diagramImportedFiles[this.diagramImportSelectedFiles[0]].name
      );
    }
  }

  onDiagramImportTypeChange(event, index) {
    this.diagramImportSelectedType = event.target.checked ? index : null;
  }

  onDeleteDiagramImportMapping(index) {
    this.diagramImportSavedMappings.splice(index, 1);
  }

  onProcessDiagramImport() {
    this.isDiagramImportLoading = true;
    let generate_diagram_contents =
      !!this.importDiagramForm.value.generate_diagram_contents;
    let reuse_objects = !!this.importDiagramForm.value.reuse_objects;
    this.modelService
      .importDiagram(
        this.loggedInUser["login_key"],
        this.diagramImportOptions.parent_id,
        generate_diagram_contents,
        reuse_objects,
        this.diagramImportSavedMappings
      )
      .subscribe((data) => {
        if (data.status) {
          /**Process SVG Update*/
          if (data.diagrams.length) {
            this.diagramImportSVGSocket.emit(
              "editor_save_diagram_svg",
              data.diagrams
            );
          }

          this.modalService.dismissAll();
          this.toastCtrl.success("Diagrams imported successfully");

          /**Append new created item*/
          if (
            this.modelViewSocket[this.diagramImportOptions.model_id] !=
            undefined
          ) {
            this.modelViewSocket[this.diagramImportOptions.model_id].emit(
              "pluto_model_diagram_create",
              {
                parent_id: this.diagramImportOptions.parent_id,
                parent_parent_id: this.diagramImportOptions.parent_parent_id,
                pages: data.pages,
              }
            );
          }
        } else {
          this.isDiagramImportLoading = false;
          this.toastCtrl.error(data.error);
        }
      });
  }

  /**Export View Generator to Diagrams.net*/
  loadExportDiagramTypes(page) {
    this.isDiagramExportTypesLoading = true;
    this.exportDiagramTypesCurrentPage = page;
    // login_key: this.loggedInUser['login_key']
    let filter_level = this.viewGeneratorFilterLevel;
    if (Number.isInteger(filter_level)) {
      let params = <any>this.generateViewGenerationFilters(filter_level);
      params.login_key = this.loggedInUser["login_key"];

      this.diagramTypeService
        .getExportDiagramTypes(params)
        .subscribe((data) => {
          if (data.status) {
            this.exportDiagramTypesMaxPages = data.pages;
            this.exportDiagramTypesList = this.exportDiagramTypesList.length
              ? this.exportDiagramTypesList.concat(data.diagram_types)
              : data.diagram_types;
            this.isDiagramExportTypesLoading = false;
          } else {
            this.isDiagramExportTypesLoading = false;
            this.toastCtrl.info("Unable to get diagram templates");
          }
        });
    } else {
      this.toastCtrl.info("Please specify valid level");
    }
  }

  onExportViewToMxGraph() {
    this.exportDiagramTypesMaxPages = this.exportDiagramTypesCurrentPage = 1;
    this.isDiagramExportLoading = false;
    this.diagramExportSelectedType = null;
    this.diagramExportFormSubmitted = false;
    this.exportDiagramTypesList = [];
    this.exportViewGeneratorForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: "change",
        validators: [Validators.required],
      }),
    });
    this.loadExportDiagramTypes(this.exportDiagramTypesCurrentPage);
    this.modalService.open(this.exportViewGeneratorModal, {
      windowClass: "wider-modal export-diagrams",
      centered: true,
    });
  }

  onDiagramExportTypeChange(event, index) {
    this.diagramExportSelectedType = event.target.checked ? index : null;
  }

  onProcessExportViewGenerator(): boolean {
    this.diagramExportFormSubmitted = true;
    if (this.exportViewGeneratorForm.valid) {
      if (this.diagramExportSelectedType == null) {
        this.toastCtrl.info("Please select Diagram Template to continue");
        return false;
      }

      this.isDiagramExportLoading = true;
      let filter_level = this.viewGeneratorFilterLevel;
      this.modelService
        .loadViewObjectShapes(
          this.loggedInUser["login_key"],
          this.exportDiagramTypesList[this.diagramExportSelectedType].id,
          this.viewGeneratorSelectedModelFolderObject.ids,
          this.viewGeneratorSelectedModelFolderObject.type,
          this.viewGeneratorSelectedFilterObjectTypes,
          this.viewGeneratorSelectedFilterRelationshipTypes,
          filter_level,
          this.viewGeneratorReportType,
          Object.keys(this.viewGeneratorSelectedGroupOptions).length
            ? this.viewGeneratorSelectedGroupOptions
            : null
        )
        .subscribe((data) => {
          let object_shapes = <any>data.object_shapes;
          for (let i = 0; i < object_shapes.length; i++) {
            if (
              object_shapes[i].export_attributes &&
              object_shapes[i].export_attributes.length
            ) {
              for (
                let t = 0;
                t < object_shapes[i].export_attributes.length;
                t++
              ) {
                object_shapes[i].export_attributes[t].mx_label =
                  this.renderPropertiesValue(
                    object_shapes[i].export_attributes[t],
                    true
                  );
              }
            }
          }

          switch (this.viewGeneratorReportType) {
            case "box":
              this.viewGenerationEventService.onViewGenerationExportDiagrams({
                name: this.exportViewGeneratorForm.value.name,
                diagram_type_id:
                  this.exportDiagramTypesList[this.diagramExportSelectedType]
                    .id,
                objects: object_shapes,
                relationships: data.relationships,
                groups: data.groups,
              });
              break;
            case "hierarchy":
              /**Collect Encoded XML into object*/
              let object_encoded_xmls = {};
              for (let i = 0; i < object_shapes.length; i++) {
                object_encoded_xmls[data.object_shapes[i].id] =
                  object_shapes[i].encoded_xml;
              }

              let padding = 20;
              let hierarchy_objects = this.getHierarchyObjectPositions(
                this.viewGeneratorData,
                [],
                0,
                0,
                0,
                padding
              );
              this.diagramImportSVGSocket.emit(
                "diagram_view_generation_hierarchy_export",
                {
                  hierarchy_objects: hierarchy_objects,
                  view_generator_data: this.viewGeneratorData,
                  object_encoded_xmls: object_encoded_xmls,
                  region: this.mainSettings.region,
                }
              );
              break;
          }
        });
    }
  }

  getHierarchyObjectPositions(items, objects, parent_id, top, left, padding) {
    for (let i = 0; i < items.length; i++) {
      let el = document.getElementById(
        "hierarchy_object_" + parent_id + "_" + items[i].id
      );
      if (el) {
        let rect_obj = el.getBoundingClientRect();
        top = top ? top : rect_obj.top;
        left = left ? left : rect_obj.left;
        objects.push({
          id: items[i].id,
          parent_id: parent_id,
          name: items[i].name,
          width: rect_obj.width,
          height: rect_obj.height,
          top_left_y: rect_obj.top - top + padding,
          top_left_x: rect_obj.left - left + padding,
          subs: items[i].items.length,
        });

        if (items[i].items.length) {
          this.getHierarchyObjectPositions(
            items[i].items,
            objects,
            items[i].id,
            top,
            left,
            padding
          );
        }
      }
    }

    return objects;
  }

  onModelViewerLeftSidebarResize(event) {
    this.leftSidebarWidth = event < 200 ? 200 : event;
  }

  onModelViewerLeftSidebarUpdate() {
    this.userService
      .updateModelViewerLeftSidebarWidth(
        this.loggedInUser["login_key"],
        this.leftSidebarWidth
      )
      .subscribe((data) => {
        if (!data.status) {
          this.toastCtrl.error(data.error);
        }
      });
  }

  onShowTabs(type) {
    let total_multiple_selected = this.selectedMultipleItems.length;
    switch (type) {
      case "model":
        this.displayTabOptions.content_viewer = false;
        this.displayTabOptions.properties = true;
        this.displayTabOptions.in_line_editor = true;
        this.displayTabOptions.view_generator = true;
        this.displayTabOptions.relationships = false;
        break;
      case "folder":
        if (total_multiple_selected > 1) {
          this.unsetAllTabs();
        } else {
          this.displayTabOptions.content_viewer = false;
          this.displayTabOptions.properties = true;
          this.displayTabOptions.in_line_editor = true;
          this.displayTabOptions.view_generator = true;
          this.displayTabOptions.relationships = false;
        }
        break;
      case "diagram":
        if (total_multiple_selected > 1) {
          this.unsetAllTabs();
        } else {
          this.displayTabOptions.content_viewer = true;
          this.displayTabOptions.properties = true;
          this.displayTabOptions.in_line_editor = true;
          this.displayTabOptions.view_generator = false;
          this.displayTabOptions.relationships = true;
        }
        break;
      case "view":
        if (total_multiple_selected > 1) {
          this.unsetAllTabs();
        } else {
          this.displayTabOptions.content_viewer = false;
          this.displayTabOptions.properties = true;
          this.displayTabOptions.in_line_editor = true;
          this.displayTabOptions.relationships = false;
          this.displayTabOptions.view_generator = true;
        }
        break;
      case "object":
        this.displayTabOptions.content_viewer = false;
        this.displayTabOptions.properties = true;
        this.displayTabOptions.in_line_editor = true;
        this.displayTabOptions.view_generator = true;
        this.displayTabOptions.relationships =
          this.selectedObjectIds.length == 1;
        break;
    }
  }

  unsetAllTabs() {
    this.displayTabOptions.content_viewer = false;
    this.displayTabOptions.properties = false;
    this.displayTabOptions.in_line_editor = false;
    this.displayTabOptions.view_generator = false;
    this.displayTabOptions.relationships = false;
  }

  onModelSelect(model_id) {
    /**Update Tab Options*/
    this.onShowTabs("model");

    this.mxEditorModeEnabled = false;
    this.mxEditorHideTreeViewModeEnabled = true;

    this.selectedFolderId = 0;
    this.selectedModelId = model_id;
    this.selectedDiagramId = 0;
    this.selectedObjectIds = [];
    this.selectedMultipleObjects = [];
    this.selectedViewGeneratorId = 0;

    if (!this.modelActivePage || this.modelActivePage == "content-viewer") {
      this.modelActivePage = "view-generator";
    }

    /**Update current page stats*/
    this.currentPageDetails.selectedModelIds = [model_id];
    this.currentPageDetails.selectedObjectIds = [];
    this.currentPageDetails.selectedDiagramIds = [];
    this.currentPageDetails.selectedFolderIds = [];
    this.currentPageDetails.selectedViewsIds = [];
    this.onProcessCurrentStateSave();

    this.onPageChange(this.modelActivePage);

    this.handleAllSelectedItems("model", model_id);
    this.setNavigationPageChange(this.mxEditorModeEnabled);
  }

  onProcessCurrentStateSave() {
    this.modelService
      .saveModelViewerCurrentState(
        this.loggedInUser["login_key"],
        this.currentPageDetails
      )
      .subscribe(() => {});
  }

  onToggleMultipleColumn() {
    this.isMultipleColumnOrdering = !this.isMultipleColumnOrdering;
    this.inlineEditorActiveRowData = {};
  }

  onViewGeneratorDeleteItems(items) {
    this.modelService
      .deleteObjectRelationships(
        this.loggedInUser["login_key"],
        items.object_ids,
        items.relationship_ids,
        true
      )
      .subscribe((data) => {
        if (data.status) {
          if (data.items.length) {
            for (let i = 0; i < data.items.length; i++) {
              if (this.modelViewSocket[data.items[i].model_id] != undefined) {
                this.modelViewSocket[data.items[i].model_id].emit(
                  "pluto_model_object_delete",
                  data.items[i]
                );
              }
            }
          }
        } else {
          this.toastCtrl.error(data.error);
          this.onPageChange("view-generator");
        }
      });
  }

  onSelectMultipleModels() {
    this.isLoadingMultipleModels = true;
    this.currentOpenModelsPage = 1;
    this.modelOpenSelectedModels = [];
    this.loadOpenModels(this.currentOpenModelsPage);
    this.modalService.open(this.openMultipleModelsModal, {
      windowClass: "wide-modal import-diagrams",
      centered: true,
    });
  }

  loadOpenModels(page) {
    if (
      page == 0 ||
      (page > this.totalOpenModelPages && this.totalOpenModelPages !== 0)
    ) {
      return false;
    }
    this.isLoadingMultipleModels = true;
    this.modelService
      .getFolderModels(
        this.loggedInUser["login_key"],
        { id: null, type: null },
        null,
        "name_asc",
        page
      )
      .subscribe((data) => {
        this.isLoadingMultipleModels = false;
        this.currentOpenModelsPage = page;

        if (page == 1) {
          this.modelOpenItems = [];
        }

        if (Object.keys(this.modelOpenItems).length) {
          this.modelOpenItems = this.modelOpenItems.concat(data.items);
        } else {
          this.modelOpenItems = data.items;
        }

        if (!this.modelOpenItems.length && this.currentOpenModelsPage > 1) {
          this.currentOpenModelsPage--;
          this.loadOpenModels(this.currentOpenModelsPage);
          return;
        }

        this.totalOpenModelPages = data.pages ? data.pages : 1;
        this.showOpenModelPagination =
          this.totalOpenModelPages > this.currentOpenModelsPage;
      });

    return false;
  }

  onImportSelectedOpenModels() {
    this.modalService.dismissAll();
    if (this.modelOpenSelectedModels.length) {
      let selected_models = [];
      for (let i = 0; i < this.models.length; i++) {
        selected_models.push(this.models[i].id);
      }

      for (let i = 0; i < this.modelOpenSelectedModels.length; i++) {
        if (selected_models.indexOf(this.modelOpenSelectedModels[i].id) == -1) {
          this.modelOpenSelectedModels[i].pre_load = true;
          this.models.push(this.modelOpenSelectedModels[i]);
          this.setModelViewSocketFor([this.modelOpenSelectedModels[i].id]);
        }
      }
    }
  }

  setModelViewSocketFor(model_ids) {
    let $this = this;
    for (let i = 0; i < model_ids.length; i++) {
      this.modelViewSocket[model_ids[i]] = io(environment.editor_node_app_url, {
        query: {
          model: model_ids[i],
          from: "pluto",
          login_key: this.loggedInUser["login_key"],
        },
      });

      this.modelViewSocket[model_ids[i]].on(
        "pluto_model_diagram_rename",
        (data) => {
          if ($this.diagram_socket) {
            $this.diagram_socket.emit("diagram_title_rename", data);
          }
        }
      );

      this.modelViewSocket[model_ids[i]].on(
        "pluto_model_object_create",
        (data) => {
          if (
            $this.selectedFolderId == data.parent_id ||
            $this.selectedModelId == data.parent_id ||
            $this.selectedModelId == data.parent_parent_id ||
            $this.selectedObjectIds.indexOf(data.parent_id) != -1 ||
            $this.selectedObjectIds.indexOf(data.parent_parent_id) != -1
          ) {
            if ($this.modelActivePage == "in-line-editor") {
              $this.loadInlineAttributes($this.inlineCurrentPage);
            }
          }
        }
      );

      this.modelViewSocket[model_ids[i]].on(
        "inline_editor_object_update",
        (data) => {
          if ($this.modelActivePage == "in-line-editor") {
            switch (data.type) {
              case "name_update":
                if (
                  this.objectInlineAttributesForm != undefined &&
                  this.objectInlineAttributesForm.controls[
                    "object_name_inline_" + data.object_id
                  ]
                ) {
                  this.objectInlineAttributesForm.controls[
                    "object_name_inline_" + data.object_id
                  ].patchValue(data.value);
                  this.onInlineObjectNameUpdate(data.object_id);
                }
                break;
              case "object_type_update":
                if (
                  this.inlineEditorAttributes != undefined &&
                  this.inlineEditorAttributes[data.object_id] != undefined
                ) {
                  this.inlineEditorAttributes[data.object_id].object_type =
                    data.object_type;
                  this.inlineEditorAttributes[data.object_id].object_type_id =
                    data.object_type_id;
                  this.objectInlineAttributesForm.controls[
                    "object_type_inline_" + data.object_id
                  ].patchValue(data.object_type_id);
                }
                break;
              case "attribute_update":
                if (
                  this.objectInlineAttributesForm != undefined &&
                  this.objectInlineAttributesForm.controls[
                    "attribute_inline_" +
                      data.object_id +
                      "_" +
                      data.attribute_id
                  ]
                ) {
                  this.objectInlineAttributesForm.controls[
                    "attribute_inline_" +
                      data.object_id +
                      "_" +
                      data.attribute_id
                  ].patchValue(data.value);
                }
                break;
            }
          }
        }
      );

      this.modelViewSocket[model_ids[i]].on(
        "model_view_delete_object",
        (data) => {
          let selectedObjectIndex = $this.selectedObjectIds.indexOf(
            data.object_id
          );
          if (selectedObjectIndex != -1) {
            $this.selectedObjectIds.splice(selectedObjectIndex, 1);

            for (let i = 0; i < $this.selectedMultipleObjects.length; i++) {
              if ($this.selectedMultipleObjects[i].id == data.object_id) {
                $this.selectedMultipleObjects.splice(i, 1);
              }
            }

            if (
              [
                "properties",
                "in-line-editor",
                "view-generator",
                "relationships",
              ].indexOf($this.modelActivePage) != -1
            ) {
              if ($this.selectedObjectIds.length) {
                $this.onPageChange($this.modelActivePage);
              } else {
                /**Model do not have a Relationship Tab*/
                if ($this.modelActivePage == "relationships") {
                  $this.modelActivePage = "view-generator";
                }
                $this.onModelSelect(data.model_id);
              }
            }

            $this.selectedMultipleObjects = [];
            console.log("was part of selection");
          }
        }
      );

      /**If deleted diagram was open in Content Viewer*/
      this.modelViewSocket[model_ids[i]].on(
        "pluto_model_diagram_delete",
        (data) => {
          if (this.selectedDiagramId == data.id) {
            this.selectedDiagramId = null;
            this.modelActivePage = "";
          }
        }
      );

      /**If object deleted, check if it's displayed in Inline Editor or Properties, if so refresh page*/
      this.modelViewSocket[model_ids[i]].on(
        "pluto_model_object_delete",
        (data) => {
          switch (this.modelActivePage) {
            case "in-line-editor":
              if (this.inlineEditorAttributes[data.id]) {
                this.loadInlineAttributes(this.inlineCurrentPage);
              }
              break;
            case "view-generator":
              let reload_view_generator = false;
              if (this.viewGeneratorReportType == "hierarchy") {
                reload_view_generator = this.checkHierarchyObjectMatch(
                  [data.id],
                  this.viewGeneratorData,
                  reload_view_generator
                );
              } else {
                for (let i = 0; i < this.viewGeneratorData.length; i++) {
                  if (data.id == this.viewGeneratorData[i].id) {
                    reload_view_generator = true;
                  }
                }
              }

              if (reload_view_generator) {
                this.onGenerateView();
              }
              break;
          }
        }
      );

      this.modelViewSocket[model_ids[i]].on(
        "pluto_model_relationship_create",
        (data) => {
          let object_ids = [data.from_object_id, data.to_object_id];
          if (this.modelActivePage == "view-generator") {
            let reload_view_generator = false;
            if (this.viewGeneratorReportType == "hierarchy") {
              reload_view_generator = this.checkHierarchyObjectMatch(
                object_ids,
                this.viewGeneratorData,
                reload_view_generator
              );
            } else {
              for (let i = 0; i < this.viewGeneratorData.length; i++) {
                if (object_ids.indexOf(this.viewGeneratorData[i].id) != -1) {
                  reload_view_generator = true;
                }
              }
            }

            if (reload_view_generator) {
              this.onGenerateView();
            }
          }
        }
      );

      /**If relationship deleted*/
      this.modelViewSocket[model_ids[i]].on(
        "pluto_model_relationship_delete",
        (data) => {
          if (this.modelActivePage == "view-generator") {
            if (this.viewGeneratorReportType == "box") {
              let reload_view_generator = false;
              for (let i = 0; i < this.viewGeneratorData.length; i++) {
                if (this.viewGeneratorData[i].relationships.length) {
                  for (
                    let t = 0;
                    t < this.viewGeneratorData[i].relationships.length;
                    t++
                  ) {
                    if (
                      this.viewGeneratorData[i].relationships[t].id == data.id
                    ) {
                      reload_view_generator = true;
                    }
                  }
                }
              }

              if (reload_view_generator) {
                this.onGenerateView();
              }
            }
          }
        }
      );
    }
  }

  checkHierarchyObjectMatch(ids, items, stage) {
    for (let i = 0; i < items.length; i++) {
      if (ids.indexOf(items[i].id) != -1) {
        stage = true;
      }

      if (items[i].items.length) {
        stage = this.checkHierarchyObjectMatch(ids, items[i].items, stage);
      }
    }
    return stage;
  }

  onInlineEditorTabChange(page) {
    this.inlineEditorActiveTab = page;
    this.inlineEditorAttributes = [];
    this.inlineEditorLastDeletedObjects = [];
    this.inlineEditorLastDeletedRelationships = [];
    this.loadInlineAttributes(1);
  }

  onOpenRelationshipModal() {
    this.hasRelationshipCreateFormSubmitted = false;
    this.hasRelationshipCreateFormLoading = false;

    /**Initialize Form*/
    this.relationshipCreateForm = new UntypedFormGroup({
      relationship_type: new UntypedFormControl(null, {
        updateOn: "change",
        validators: [Validators.required],
      }),
      to_object: new UntypedFormControl(null, {
        updateOn: "change",
      }),
      diagram_id: new UntypedFormControl(null, {
        updateOn: "change",
      }),
    });

    this.modalService.open(this.relationshipCreateModal, {
      size: "sm",
      centered: true,
    });
    this.selectedRelationshipTypeId = "";
    if (this.isChainRelationshipModal) {
      this.relationshipCreateTypes = [
        { relationship_type_id: "any", name: "ANY" },
      ];
      this.relationshipCreateForm.controls.relationship_type.patchValue("any");
      this.relationshipToObjects = [
        {
          object_id: this.chainObjectRelationshipOptions.to_object_id,
          name: this.chainObjectRelationshipOptions.to_object_name,
        },
      ];
      this.relationshipCreateForm.controls.to_object.patchValue(
        this.chainObjectRelationshipOptions.to_object_id
      );
    }

    this.onRelationshipTypeSearch({
      term: "",
      relationship_type_id: this.lastAddedRelationshipTypeId,
    });
  }

  onObjectSaveRelationship(): boolean {
    this.hasRelationshipCreateFormSubmitted = true;
    if (this.relationshipCreateForm.valid) {
      if (this.selectedRelationshipTypeId == "navigates_to") {
        this.modelService
          .addObjectDiagramRelationship(
            this.loggedInUser["login_key"],
            this.selectedObjectIds,
            this.relationshipCreateForm.value.diagram_id
          )
          .subscribe((data) => {
            this.hasRelationshipCreateFormLoading = false;
            if (data.status) {
              this.toastCtrl.success("New relationship created successfully");
              this.modalService.dismissAll();
            } else {
              this.toastCtrl.error(data.error);
            }
          });
      } else {
        let to_object_id = this.isChainRelationshipModal
          ? this.chainObjectRelationshipOptions.to_object_id
          : this.relationshipCreateForm.value.to_object;
        this.hasRelationshipCreateFormLoading = true;
        this.modelService
          .addRelationship(
            this.loggedInUser["login_key"],
            this.selectedObjectIds,
            this.relationshipCreateForm.value.relationship_type,
            to_object_id
          )
          .subscribe((data) => {
            this.hasRelationshipCreateFormLoading = false;
            if (data.status) {
              let s_prefix = this.selectedObjectIds.length > 1 ? "s" : "";
              this.lastAddedRelationshipTypeId =
                this.relationshipCreateForm.value.relationship_type;
              this.toastCtrl.success(
                "New relationship" + s_prefix + " created successfully"
              );
              this.modalService.dismissAll();
            } else {
              this.toastCtrl.error(data.error);
            }
          });
      }
    }

    return false;
  }

  /**As Ng-Select passes only group name and not other attributes, using this approach to attach model id to model name to get the Current Model label */
  handleToObjectModelName(objects) {
    for (let i = 0; i < objects.length; i++) {
      objects[i].model_name_label =
        objects[i].model_name +
        this.relationshipObjectSplit +
        objects[i].model_id;
    }

    this.relationshipToObjects = objects;
  }

  onRelationshipToObjectSearch(event) {
    if (this.selectedRelationshipTypeId == "navigates_to") {
      this.onRelationshipDiagramSearch({ term: "" });
    } else {
      let selected_objects = this.isChainRelationshipModal
        ? [this.chainObjectRelationshipOptions.from_object_id]
        : this.selectedObjectIds;
      this.modelService
        .relationshipToObjectSearch(
          this.loggedInUser["login_key"],
          selected_objects,
          this.selectedRelationshipTypeId,
          event.term,
          1
        )
        .subscribe((data) => {
          this.handleToObjectModelName(
            data.status && data.objects.length ? data.objects : []
          );
        });
    }
  }

  onRelationshipTypeChange(event) {
    this.selectedRelationshipTypeId = event.relationship_type_id;
    if (this.selectedRelationshipTypeId == "navigates_to") {
      this.relationshipCreateForm.controls["to_object"].removeValidators([
        Validators.required,
      ]);
      this.relationshipCreateForm.controls["diagram_id"].addValidators([
        Validators.required,
      ]);
      this.onRelationshipDiagramSearch({ term: "" });
    } else {
      this.relationshipCreateForm.controls["to_object"].addValidators([
        Validators.required,
      ]);
      this.relationshipCreateForm.controls["diagram_id"].removeValidators([
        Validators.required,
      ]);
      let selected_objects = this.isChainRelationshipModal
        ? [this.chainObjectRelationshipOptions.from_object_id]
        : this.selectedObjectIds;
      this.modelService
        .relationshipToObjectSearch(
          this.loggedInUser["login_key"],
          selected_objects,
          this.selectedRelationshipTypeId,
          "",
          1
        )
        .subscribe((data) => {
          this.handleToObjectModelName(
            data.status && data.objects.length ? data.objects : []
          );
        });
    }
  }

  onRelationshipTypeSearch(event) {
    let to_object_id = this.isChainRelationshipModal
      ? this.chainObjectRelationshipOptions.to_object_id
      : null;
    let selected_objects = this.isChainRelationshipModal
      ? [this.chainObjectRelationshipOptions.from_object_id]
      : this.selectedObjectIds;
    this.modelService
      .relationshipTypeSearch(
        this.loggedInUser["login_key"],
        selected_objects,
        to_object_id,
        event.term,
        event.relationship_type_id,
        1
      )
      .subscribe((data) => {
        this.relationshipCreateTypes =
          data.status && data.relationship_types.length
            ? data.relationship_types
            : [];
        /**Add Diagram Navigation*/
        if (!to_object_id) {
          this.relationshipCreateTypes.push({
            metamodel_name: "Diagram Relationship",
            name: "Navigates To",
            relationship_type_id: "navigates_to",
          });
        }

        /**Set previous value*/
        if (this.lastAddedRelationshipTypeId) {
          if (this.lastAddedRelationshipTypeId == "navigates_to") {
            this.relationshipCreateForm.controls.relationship_type.patchValue(
              "navigates_to"
            );
          } else {
            for (let i = 0; i < this.relationshipCreateTypes.length; i++) {
              if (
                this.lastAddedRelationshipTypeId ==
                this.relationshipCreateTypes[i].relationship_type_id
              ) {
                this.relationshipCreateForm.controls.relationship_type.patchValue(
                  this.lastAddedRelationshipTypeId
                );
              }
            }
          }
        }
      });

    //event.relationship_type_id
  }

  onRelationshipDiagramSearch(event) {
    this.modelService
      .relationshipDiagramSearch(this.loggedInUser["login_key"], event.term)
      .subscribe((data) => {
        this.relationshipDiagrams = data.status ? data.diagrams : [];
      });
  }

  displaySelectedObjectNames() {
    if (this.isChainRelationshipModal) {
      return this.chainObjectRelationshipOptions.from_object_name;
    } else {
      let object_names = [];
      for (let i = 0; i < this.selectedMultipleObjects.length; i++) {
        object_names.push(this.selectedMultipleObjects[i].name);
      }
      return object_names.join(", ");
    }
  }

  onInlineFromObjectSearch(event, item) {
    this.availableInlineObjects = [];
    this.modelService
      .getFromObjects(
        this.loggedInUser["login_key"],
        event.term,
        item.relationship_type_id,
        item.to_object_id
      )
      .subscribe((data) => {
        if (data.status) {
          this.availableInlineObjects = data.objects;
        }
      });
  }

  onInlineToObjectSearch(event, item) {
    this.availableInlineObjects = [];
    this.modelService
      .relationshipToObjectSearch(
        this.loggedInUser["login_key"],
        [item.from_object_id],
        item.relationship_type_id,
        event.term,
        1
      )
      .subscribe((data) => {
        if (data.status) {
          this.availableInlineObjects = data.objects;
        }
      });
  }

  onInlineRelationshipTypeSearch(event, item) {
    this.availableInlineRelationships = [];
    this.modelService
      .relationshipTypeSearch(
        this.loggedInUser["login_key"],
        [item.from_object_id],
        item.to_object_id,
        event.term,
        null,
        1
      )
      .subscribe((data) => {
        if (data.status) {
          this.availableInlineRelationships = data.relationship_types;
        }
      });
  }

  onFromObjectChange(event, item) {
    item.from_object_id = event.object_id;
    item.from_object_name = event.name;
    item.from_model_name = event.model_name;
    item.from_model_id = event.model_id;
    this.modelService
      .updateRelationship(
        this.loggedInUser["login_key"],
        item.id,
        item.from_object_id,
        item.relationship_type_id,
        item.to_object_id
      )
      .subscribe((data) => {
        console.log(data);
      });

    this.inlineEditorActiveCellData = {};
    console.log("from object changed", event, item);
  }

  onToObjectChange(event, item) {
    item.to_object_id = event.object_id;
    item.to_object_name = event.name;
    item.to_model_name = event.model_name;
    item.to_model_id = event.model_id;
    this.modelService
      .updateRelationship(
        this.loggedInUser["login_key"],
        item.id,
        item.from_object_id,
        item.relationship_type_id,
        item.to_object_id
      )
      .subscribe((data) => {
        console.log(data);
      });

    this.inlineEditorActiveCellData = {};
  }

  onInlineRelationshipTypeChange(event, item) {
    item.relationship_type_id = event.relationship_type_id;
    item.relationship_type_name = event.name;
    item.relationship_type_metamodel = event.metamodel_name;
    this.modelService
      .updateRelationship(
        this.loggedInUser["login_key"],
        item.id,
        item.from_object_id,
        item.relationship_type_id,
        item.to_object_id
      )
      .subscribe(() => {});

    this.inlineEditorActiveCellData = {};
  }

  displayRelationshipGroupModel(name) {
    let model_obj = name.split(this.relationshipObjectSplit);
    return (
      model_obj[0] +
      (this.modelIds.indexOf(model_obj[1]) == -1 ? "" : " (Current)")
    );
  }

  onSelectDiagramObject(event, id, type) {
    let index = this.diagramDeleteItems.selected_object_ids.indexOf(id);
    if (
      (type == "yes" && event.target.checked) ||
      (type == "no" && !event.target.checked)
    ) {
      if (index == -1) {
        this.diagramDeleteItems.selected_object_ids.push(id);
      }
    } else {
      if (index != -1) {
        this.diagramDeleteItems.selected_object_ids.splice(index, 1);
      }
    }
  }

  onSelectDiagramRelationship(event, id, type) {
    let index = this.diagramDeleteItems.selected_relationship_ids.indexOf(id);
    if (
      (type == "yes" && event.target.checked) ||
      (type == "no" && !event.target.checked)
    ) {
      if (index == -1) {
        this.diagramDeleteItems.selected_relationship_ids.push(id);
      }
    } else {
      if (index != -1) {
        this.diagramDeleteItems.selected_relationship_ids.splice(index, 1);
      }
    }
  }

  onSaveDeleteObjectDiagram(discard = false) {
    let options = {
      delete_object_ids: this.diagramDeleteItems.selected_object_ids,
      delete_relationship_ids:
        this.diagramDeleteItems.selected_relationship_ids,
    };

    if (discard) {
      options.delete_object_ids = [];
      options.delete_relationship_ids = [];
    }

    this.diagram_socket.emit("process_xml_update", options);
    this.modalService.dismissAll();
  }

  onSaveDiagramNewObjectsRelationships(data, reusable_object_ids, reusable_relationship_ids) {
    console.log('Saving diagram with ', reusable_object_ids)
    console.log('Rusable relations ', reusable_relationship_ids)
    this.modelService
      .saveDiagramNewObjectsRelationships(
        this.loggedInUser["login_key"],
        this.selectedDiagramId,
        data.mx_objects,
        data.mx_relationships,
        reusable_object_ids,
        reusable_relationship_ids
      )
      .subscribe((data) => {
        if (data.status) {
          if (data.objects.length || data.relationships) {
            /**Trigger Update Data in XML with new objects and relationships*/
            this.diagram_socket.emit("update_editor_new_objects", {
              objects: data.objects,
              relationships: data.relationships,
            });

            /**Rename Tree View Objects If any updates*/
            if (data.objects.length) {
              for (let i = 0; i < data.objects.length; i++) {
                let element = document.getElementById(
                  "object_tree_item_" + data.objects[i].object_id
                );
                if (element) {
                  element.setAttribute("name", data.objects[i].name);
                  document.getElementById(
                    "object_tree_item_" + data.objects[i].object_id + "_name"
                  ).textContent = data.objects[i].name;
                }
              }

              /**Trigger Update Tree View to load new objects*/
              this.modelEventService.onModelObjectsCreatedFromMX(
                this.selectedDiagramParentId
              );
            } else {
              this.modalService.dismissAll();
            }
          } else {
            /**Trigger Update Data in XML with new objects and relationships*/
            this.diagram_socket.emit("update_editor_new_objects", {
              objects: [],
              relationships: [],
            });
          }
        } else {
          this.modalService.dismissAll();
        }
      });
  }

  onSelectDiagramReuseObject(event, id, type) {
    let index = this.diagramObjectReuseOptions.selected_object_ids.indexOf(id);
    if (
      (type == "yes" && event.target.checked) ||
      (type == "no" && !event.target.checked)
    ) {
      if (index == -1) {
        this.diagramObjectReuseOptions.selected_object_ids.push(id);
      }
    } else {
      if (index != -1) {
        this.diagramObjectReuseOptions.selected_object_ids.splice(index, 1);
      }
    }
  }

  onSelectDiagramReuseRelationship(event, id, type) {
    let index = this.diagramObjectReuseRelationships.selected_relationship_ids.indexOf(id);
    if (
      (type == "yes" && event.target.checked) ||
      (type == "no" && !event.target.checked)
    ) {
      if (index == -1) {
        this.diagramObjectReuseRelationships.selected_relationship_ids.push(id);
      }
    } else {
      if (index != -1) {
        this.diagramObjectReuseRelationships.selected_relationship_ids.splice(index, 1);
      }
    }
  }

  openReuseRelationshipsModel() {
    console.log('#7660 prompt_diagram_reuse_relationships')
    this.diagramObjectReuseRelationships.relationships= [];
    this.diagramObjectReuseRelationships.isLoading = true;
    this.modalService.open(this.diagramReuseRelationshipsModal, {
      windowClass: "wider-modal",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    this.modelService
      .getDiagramReuseRelationships(
        this.loggedInUser["login_key"],
        this.selectedDiagramId,
        this.diagramObjectReuseRelationships.diagram_mx_options.mx_objects,
        this.diagramObjectReuseRelationships.diagram_mx_options.mx_relationships
      )
      .subscribe((resp) => {
        if (resp.status) {
          console.log(resp)
          this.diagramObjectReuseRelationships.isLoading = false;
          if (resp.relationships.length) {
            this.diagramObjectReuseRelationships.relationships = resp.relationships;
            this.diagramObjectReuseOptions.isLoading = false;
          } else {
            this.onSaveDiagramNewObjectsRelationships(this.diagramObjectReuseRelationships.diagram_mx_options, [], []);
            this.modalService.dismissAll();
          }
        } else {
          this.toastCtrl.error(resp.error);
          this.modalService.dismissAll();
        }
      });
  }

  onProcessDiagramReuseObjects() {
    console.log('____________ show reuse relationships ____________ ', this.promptDiagramReuseRelationships)
    //TODO add relationship dialog.. 
    if (this.promptDiagramReuseRelationships) {
      this.openReuseRelationshipsModel();
    } else {
      console.log('=======> promptDiagramReuseRelationships false so saving..')
      this.diagramObjectReuseOptions.isLoading = true;
      this.onSaveDiagramNewObjectsRelationships(
        this.diagramObjectReuseOptions.diagram_mx_options,
        this.diagramObjectReuseOptions.selected_object_ids,
        []
      );
      setTimeout(() => {
        this.diagramObjectReuseOptions.isLoading = false;
        this.modalService.dismissAll();
      }, 1000);
    }   
  }

  onProcessDiagramReuseRelationships() {
    console.log("#7719 Saving reuse objects and relationships")
    console.log('Objects ', this.diagramObjectReuseOptions.selected_object_ids)
    console.log('Relationships ', this.diagramObjectReuseRelationships.selected_relationship_ids)
    this.diagramObjectReuseRelationships.isLoading = false;
    this.onSaveDiagramNewObjectsRelationships(
      this.diagramObjectReuseRelationships.diagram_mx_options,
      this.diagramObjectReuseOptions.selected_object_ids,
      this.diagramObjectReuseRelationships.selected_relationship_ids
    );
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 1000);
  }

  diagramObjectReuseDismiss() {
    this.modalService.dismissAll();
    if (this.promptDiagramReuseRelationships) {
      this.openReuseRelationshipsModel();
    }
  }

  diagramRelationshipsReuseDismiss() {
    this.modalService.dismissAll();
  }

  onEditAllRelationshipFields() {
    for (
      let i = 0;
      i < this.mxEditorObjectShapeDetails.attributes.length;
      i++
    ) {
      this.mxEditorObjectShapeDetails.attributes[i].edit = true;
    }

    this.mxEditorObjectShapeDetails.editAll = true;
    this.mxEditorObjectShapeDetails.showDiscard = true;
  }

  onDiscardRelationshipChanges() {
    for (
      let i = 0;
      i < this.mxEditorObjectShapeDetails.attributes.length;
      i++
    ) {
      this.mxEditorObjectShapeDetails.attributes[i].edit = false;
    }

    this.mxEditorObjectShapeDetails.editAll = false;
    this.mxEditorObjectShapeDetails.showDiscard = false;
  }

  onLoadDiagramSVGObjectDetails(
    object_id,
    relationship_id,
    relationship_type_id,
    cell_xml
  ) {
    this.modelService
      .getDiagramSVGObjectShapeDetails(
        this.loggedInUser["login_key"],
        this.selectedDiagramId,
        object_id,
        relationship_id,
        relationship_type_id,
        cell_xml
      )
      .subscribe((data) => {
        if (data.status) {
          this.mxEditorObjectShapeDetails = data;
          this.mxEditorObjectShapeDetails.showActionButtons =
            relationship_id && data.attributes.length;
        } else {
          this.mxEditorObjectShapeDetails = { type: "not_found" };
          this.mxEditorObjectShapeDetails.showActionButtons = false;
        }

        if (relationship_id) {
          this.mxEditorObjectShapeDetails.cell_xml = cell_xml;
          this.mxEditorObjectShapeDetails.relationship_id = relationship_id;

          /**Remove old set of controls*/
          if (this.objectAttributesForm.controls) {
            for (let i in this.objectAttributesForm.controls) {
              this.objectAttributesForm.removeControl(i);
            }
          }

          for (
            let i = 0;
            i < this.mxEditorObjectShapeDetails.attributes.length;
            i++
          ) {
            let attribute_value = null;
            switch (this.mxEditorObjectShapeDetails.attributes[i].type) {
              case "text":
              case "integer":
              case "decimal":
              case "list":
                attribute_value = this.mxEditorObjectShapeDetails.attributes[i]
                  .selected_value.length
                  ? this.mxEditorObjectShapeDetails.attributes[i]
                      .selected_value["0"]
                  : "";
                break;
              case "boolean":
                attribute_value =
                  this.mxEditorObjectShapeDetails.attributes[i].selected_value
                    .length &&
                  this.mxEditorObjectShapeDetails.attributes[i].selected_value[
                    "0"
                  ] == "true"
                    ? "true"
                    : null;
                break;
              case "multiple-list":
                attribute_value =
                  this.mxEditorObjectShapeDetails.attributes[i].selected_value;
                break;
              case "date":
                attribute_value = this.mxEditorObjectShapeDetails.attributes[i]
                  .selected_value.length
                  ? this.mxEditorObjectShapeDetails.attributes[i]
                      .selected_value["0"]
                  : "";
                if (this.settings && attribute_value) {
                  attribute_value = this.modelService.convertISODateToFormat(
                    attribute_value,
                    this.settings
                  );
                }
                break;
              case "date_range":
                let from_value =
                  this.mxEditorObjectShapeDetails.attributes[i]
                    .selected_value[0];
                let to_value =
                  this.mxEditorObjectShapeDetails.attributes[i]
                    .selected_value[1];
                if (this.settings) {
                  from_value = from_value
                    ? this.modelService.convertISODateToFormat(
                        from_value,
                        this.settings
                      )
                    : null;
                  to_value = from_value
                    ? this.modelService.convertISODateToFormat(
                        to_value,
                        this.settings
                      )
                    : null;
                }
                attribute_value = [from_value, to_value];
                break;
            }

            /**Add Attribute Controls*/
            switch (this.mxEditorObjectShapeDetails.attributes[i].type) {
              case "decimal":
                this.objectAttributesForm.addControl(
                  "attribute_" +
                    this.mxEditorObjectShapeDetails.attributes[i].attribute_id,
                  new UntypedFormControl(
                    attribute_value,
                    checkDecimalFieldValue(
                      this.mxEditorObjectShapeDetails.attributes[i].values[0],
                      this.mxEditorObjectShapeDetails.attributes[i].values[1],
                      this.mxEditorObjectShapeDetails.attributes[i]
                        .decimal_places
                    )
                  )
                );
                break;
              case "integer":
                this.objectAttributesForm.addControl(
                  "attribute_" +
                    this.mxEditorObjectShapeDetails.attributes[i].attribute_id,
                  new UntypedFormControl(attribute_value, [
                    checkIntegerValue(
                      this.mxEditorObjectShapeDetails.attributes[i].values[0],
                      this.mxEditorObjectShapeDetails.attributes[i].values[1]
                    ),
                  ])
                );
                break;
              case "date_range":
                this.objectAttributesForm.addControl(
                  "attribute_" +
                    this.mxEditorObjectShapeDetails.attributes[i].attribute_id +
                    "_from",
                  new UntypedFormControl(attribute_value[0])
                );
                this.objectAttributesForm.addControl(
                  "attribute_" +
                    this.mxEditorObjectShapeDetails.attributes[i].attribute_id +
                    "_to",
                  new UntypedFormControl(attribute_value[1])
                );
                break;
              default:
                this.objectAttributesForm.addControl(
                  "attribute_" +
                    this.mxEditorObjectShapeDetails.attributes[i].attribute_id,
                  new UntypedFormControl(attribute_value)
                );
                break;
            }
          }
        }
      });
  }

  onChangeRollback(item) {
    item.loading = true;
    this.modelService
      .changeLogRollback(this.loggedInUser["login_key"], item.id)
      .subscribe((data) => {
        item.loading = false;
        if (data.status) {
          this.changeLogOptions.name = data.name;
          this.modelEventService.onModelFolderObjectRename(
            this.changeLogOptions
          );
          this.toastCtrl.success("Reverted back successfully");
          this.modalService.dismissAll();
        } else {
          this.toastCtrl.error(data.error);
        }
      });
    return false;
  }

  loadChangeLogs(page) {
    this.changeLogCurrentPage = page;
    this.modelService
      .loadChangeLogs(
        this.loggedInUser["login_key"],
        this.changeLogOptions.id,
        this.changeLogOptions.type,
        this.changeLogCurrentPage
      )
      .subscribe((resp) => {
        this.changeLogsLoading = false;
        if (resp.status) {
          this.changeLogsPages = resp.pages;
          for (let i in resp.change_logs) {
            if (this.changeLogIds.indexOf(resp.change_logs[i].id) == -1) {
              this.changeLogs = this.changeLogs.concat(resp.change_logs[i]);
              this.changeLogIds.push(resp.change_logs[i].id);
            }
          }
        } else {
          this.toastCtrl.error(resp.error);
        }
      });
  }

  onSwitchPropertyAttributeTab(index) {
    if (index === -1) {
      this.hideGeneralTabModifiableAttributes = false;
    } else {
      this.hideGeneralTabModifiableAttributes = true;
    }

    this.selectedPropertiesTabIndex = index;
  }

  onToggleAttributeTab(item) {
    item.collapsed = !item.collapsed;
  }

  filterTabAttributes(attribute_ids, available_attributes) {
    return available_attributes.filter(
      (data) => attribute_ids.indexOf(data.attribute_id) != -1
    );
  }

  onToggleGeneralTab() {
    this.generalTabExpanded = !this.generalTabExpanded;
  }

  onSvgGenerated(e) {
    console.log("onSvgGenerated");
    console.log(e);

    this.generatedSvg = e;
  }

  removeActiveCellClass() {
    const td = this.tdElement.nativeElement;
    const tdForDropDown = this.tdForDropDown.nativeElement;
    if (td) {
      td.classList.remove('active-cell');
      tdForDropDown.classList.remove('active-cell');
    }
  }
  
}
