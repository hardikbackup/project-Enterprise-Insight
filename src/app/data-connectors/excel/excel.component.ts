import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../shared/HelperService';
import { DataConnectorsService } from '../data-connectors.service';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ModelService} from '../../model/model.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-excel',
  templateUrl: './excel.component.html',
  styleUrls: ['./excel.component.css']
})
export class ExcelComponent {
  /**Excel Import*/
  @ViewChild('excelFetchProcessingModal') excelFetchProcessingModal: NgbModal;
  @ViewChild('excelFetchEl') excelFetchEl: ElementRef;
  mappingTypes: any;
  sourceModels: any;
  targetModels: any;
  importPreForm: UntypedFormGroup;
  hasImportPreFormSubmitted: boolean;
  mappingForm: UntypedFormGroup;
  objectColumnOptions: any;
  defaultObjectAttributes: any;
  relationshipColumnOptions: any;
  defaultRelationshipAttributes: any;
  importForm: UntypedFormGroup;
  hasImportFormSubmitted: boolean;
  excelExportResults: any;
  currentActiveTab: string;
  loggedInUser: any;
  excelImportId: string;
  isLoading: boolean;
  adminUser: boolean;
  /**Excel Sheet Import*/
  excelSheets: any;
  selectedSheetIndex: number;
  showExcelImportBtn: boolean;
  excelSheetImportTab: string;
  excelSheetImportProcessing: boolean;
  excelSheetImported: boolean;
  preSelectedFileName: string;

  /**Subscribers*/
  importExcelSubscriber: any;
  excelSheetSelectSubscriber: any;
  isAllReSelected: boolean = false;

  /**Import Logs*/
  @ViewChild('confirmDeleteExcelImportItemModal') confirmDeleteExcelImportItemModal: NgbModal;
  excel_imports: any;
  currentPage: number;
  firstLoad: boolean;
  pages: number;
  isAllSelected: boolean;
  excelImportCheckedItems : any;
  defaultSort: string;
  isLoadingExcelImports: boolean;
  excelImportIds: any;
  excelImportExpandOptions: any;
  renameExcelImportData: any;
  deleteSingleItem: boolean;
  deleteSingleItemData: any;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.action-btn')) {
      this.excelImportExpandOptions = { id: null, right: null };
    }
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      this.renameExcelImportData = {};
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private modalService: NgbModal,
      private helperService: HelperService,
      private dataConnectorService: DataConnectorsService,
      private modelService: ModelService,
      private router: Router,
      private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    /**Initialize*/
    this.adminUser = this.authService.isUserAdmin();
    this.excel_imports = [];
    this.currentPage = 1;
    this.pages = 0;
    this.isAllSelected = false;
    this.defaultSort = 'name_asc';
    this.eventsService.onPageChange({ section : 'model', page : 'data-connectors' });
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.isLoadingExcelImports = false;
    this.excelImportIds = [];
    this.deleteSingleItem = false;
    this.deleteSingleItemData = {};
    this.renameExcelImportData = {};
    this.excelImportExpandOptions = { id: null, right: null };
    this.loadExcelImports(this.currentPage);

    /**Excel Import*/
    this.onExcelImportInit();

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        this.isLoading = true;
        this.excelImportId = paramMap.get('id');
        this.dataConnectorService.getExcelImportRecord(this.loggedInUser['login_key'], this.excelImportId).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.importForm.controls.name.patchValue(data.name);
            this.excelSheets = data.sheets;
            for (let i=0; i<this.excelSheets.length; i++) {
              this.excelSheets[i].options.object_attributes = [];
              this.excelSheets[i].options.relationship_attributes = [];
            }

            this.setExcelSheetOptions();
            this.addObjectRelationshipOptions();
            this.onExcelSheetSelect(this.selectedSheetIndex);
            this.excelSheetImportTab = 'editor';
            this.currentActiveTab = 'excel_import';
          }
          else{
            this.toastCtrl.error(data.error);
          }
        });
      }
    });
  }

  loadExcelImports(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }
    this.excelImportCheckedItems = {};
    this.isLoadingExcelImports = true;
    this.dataConnectorService.getExcelImports(this.loggedInUser['login_key'], this.defaultSort, page).subscribe(data => {
      this.isLoadingExcelImports = false;
      this.isAllSelected = false;
      this.isAllReSelected = false

      /**Append new items*/
      if (page == 1) {
        this.excelImportIds = [];
        this.excel_imports = [];
      }

      for (let i in data.excel_imports) {
        if (this.excelImportIds.indexOf(data.excel_imports[i].id) == -1) {
          this.excel_imports = this.excel_imports.concat(data.excel_imports[i]);
          this.excelImportIds.push(data.excel_imports[i].id);
        }
      }

      this.firstLoad = true;
      this.currentPage = page;
      this.pages = data.pages;

      if (!this.excel_imports.length && this.currentPage != 1) {
        this.currentPage--;
        this.loadExcelImports(this.currentPage);
        return;
      }
    })
  }

  checkExcelImportItem(event, item) {
    if (event.target.checked) {
      if (!this.excelImportCheckedItems[item.id]) {
        this.excelImportCheckedItems[item.id] = item;
      }
    }
    else{
      if (this.excelImportCheckedItems[item.id]) {
        delete this.excelImportCheckedItems[item.id];
      }
    }
    this.isAllReSelected = this.excel_imports.every((item)=>this.excelImportCheckedItems[item.id]);
  }

  totalExcelImportCheckedItems() {
    return Object.keys(this.excelImportCheckedItems).length;
  }

  processExcelImportDelete(){
    this.modalService.dismissAll();
    let excel_import_ids = [];
    if (this.deleteSingleItem) {
      excel_import_ids.push(this.deleteSingleItemData.id);
    }
    else{
      for (let i in this.excelImportCheckedItems) {
        excel_import_ids.push(i);
      }
    }

    this.dataConnectorService.removeExcelImport(this.loggedInUser['login_key'], excel_import_ids).subscribe(data => {
      if (data.status) {
        this.excelImportCheckedItems = {};
        data.pages = data.pages ? data.pages : 1;
        this.currentPage = (this.currentPage > data.pages && this.currentPage !== 1) ? this.currentPage - 1 : this.currentPage;
        this.toastCtrl.success('Excel import removed successfully');
        this.loadExcelImports(this.currentPage);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    })
  }

  onDeleteMultipleExcelImports() {
    this.deleteSingleItem = false;
    this.modalService.open(this.confirmDeleteExcelImportItemModal, { size : 'sm', centered: true });
  }

  sortBy(type) {
    switch (type) {
      case 'name':
        this.defaultSort = (this.defaultSort == 'name_asc') ? 'name_desc' : 'name_asc';
        break;
      case 'has_imported':
        this.defaultSort = (this.defaultSort == 'has_imported_asc') ? 'has_imported_desc' : 'has_imported_asc';
        break;
      case 'import_date':
        this.defaultSort = (this.defaultSort == 'import_date_asc') ? 'import_date_desc' : 'import_date_asc';
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

    this.loadExcelImports(1);
  }


  onExcelImportOptions(event, item, check_position):boolean {
    if (this.excelImportExpandOptions.id == item.id && (
        (!check_position && this.excelImportExpandOptions.type == 'fixed') ||
        (check_position && this.excelImportExpandOptions.type == 'float')
    )) {
      this.excelImportExpandOptions.id = null;
    }
    else{
      if (document.getElementById('rename_' + item.id)) {
        return true;
      }
      else {
        this.excelImportExpandOptions.id = item.id;
        if (check_position) {
          this.excelImportExpandOptions.type = 'float';
          let options_width = 143;
          if (options_width + event.clientX > window.innerWidth) {
            this.excelImportExpandOptions.right = window.innerWidth - event.clientX - 50;
          }
          else{
            this.excelImportExpandOptions.right = window.innerWidth - event.clientX - 170;
          }
        } else {
          this.excelImportExpandOptions.type = 'fixed';
          this.excelImportExpandOptions.right = null;
        }
      }
    }

    return false;
  }

  deleteExcelImport(item) {
    this.deleteSingleItem = true;
    this.deleteSingleItemData = item;
    this.modalService.open(this.confirmDeleteExcelImportItemModal, { size : 'sm', centered: true });
  }

  renameExcelImport(item) {
    this.renameExcelImportData = item;
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
    if (new_name.toString().trim().length) {
      item.name = new_name;
      this.renameExcelImportData = {};
      this.dataConnectorService.renameExcelImport(this.loggedInUser['login_key'], item.id, item.name).subscribe(data => {
        if (data.status) {
          this.toastCtrl.success('Excel import renamed successfully');
        }
        else{
          this.toastCtrl.error(data.error);
        }
      });
    }
    else{
      this.toastCtrl.info('Name is required');
    }
  }

  onCancelRename() {
    this.renameExcelImportData = {};
  }

  dateFormat(date_item) {
    return this.helperService.dateFormat(date_item);
  }

  /**Excel Import*/
  onExcelImportInit() {
    this.excelExportResults = {};
    this.currentActiveTab = 'excel';
    this.excelSheetImportTab = 'init';
    this.preSelectedFileName = '';

    this.excelImportId = '';
    this.excelSheets = [];
    this.selectedSheetIndex = 0;
    this.mappingTypes = [
      {
        id: 'object',
        name: 'Object'
      },
      {
        id: 'relationship',
        name: 'Relationship'
      }
    ];

    this.importPreForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });

    this.mappingForm = new UntypedFormGroup({
      type: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      source_model_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      target_model_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      has_headers: new UntypedFormControl(null),
      reuse_objects: new UntypedFormControl('1')
    });

    this.importForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });

    this.hasImportPreFormSubmitted = false;
    this.hasImportFormSubmitted = false;
    this.objectColumnOptions = this.defaultObjectAttributes = [
      {
        id: 'object_name',
        name: 'Object Name',
        group: 'Global'
      },
      {
        id: 'object_type',
        name: 'Object Type',
        group: 'Global'
      },
    ];

    this.relationshipColumnOptions = this.defaultRelationshipAttributes = [
      {
        id: 'from',
        name: 'From',
        group: 'Global'
      },
      {
        id: 'to',
        name: 'To',
        group: 'Global'
      },
      {
        id: 'type',
        name: 'Type',
        group: 'Global'
      },
    ];

    /**Get default object attributes*/
    this.modelService.onSearchObjectAttributes(this.loggedInUser['login_key'],'',1).subscribe(data => {
      let object_column_items = this.objectColumnOptions;
      if (data.status && data.attributes.length) {
        this.defaultObjectAttributes = object_column_items.concat(data.attributes);
      }
    });

    /**Get default relationship attributes*/
    this.modelService.onSearchRelationshipAttributes(this.loggedInUser['login_key'],'',1).subscribe(data => {
      let relationship_column_items = this.relationshipColumnOptions;
      if (data.status && data.attributes.length) {
        this.defaultRelationshipAttributes = relationship_column_items.concat(data.attributes);
      }
    });
  }

  addObjectRelationshipOptions() {
    for (let i=0; i<this.excelSheets.length; i++) {
      for (let j=0; j<this.excelSheets[i].options.max_columns; j++) {
        /**Set Object Options*/
        if (typeof this.excelSheets[i].options.object_attributes[j] == 'undefined') {
          this.excelSheets[i].options.object_attributes[j] = this.defaultObjectAttributes;
        }

        /**Set Relationship Options*/
        if (typeof this.excelSheets[i].options.relationship_attributes[j] == 'undefined') {
          this.excelSheets[i].options.relationship_attributes[j] = this.defaultRelationshipAttributes;
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.importExcelSubscriber) {
      this.importExcelSubscriber.unsubscribe();
    }

    if (this.excelSheetSelectSubscriber) {
      this.excelSheetSelectSubscriber.unsubscribe();
    }
  }

  onFetchExcelData() {
    this.excelFetchEl.nativeElement.value = null;
    this.excelFetchEl.nativeElement.click();
  }

  onExcelFetchProcess(event) {
    if (event.target.files && event.target.files.length) {
      this.modalService.dismissAll();
      this.modalService.open(this.excelFetchProcessingModal, { size : 'sm', centered: true, backdrop : 'static', keyboard : false });
      let formData = new FormData();
      formData.append('excel', this.excelFetchEl.nativeElement.files[0]);
      formData.append('login_key',this.loggedInUser['login_key']);

      this.dataConnectorService.fetchExcel(formData).subscribe(data => {
        this.modalService.dismissAll();
        if (data.status) {
          if (this.excelSheetImportTab == 'init') {
            this.preSelectedFileName = this.excelFetchEl.nativeElement.files[0].name;
          }
          else{
            this.currentActiveTab = 'excel_import';
            this.excelSheetImportTab = 'editor';
          }

          this.excelSheets = this.excelSheets.concat(data.sheets);
          this.setExcelSheetOptions();

          this.addObjectRelationshipOptions();

          /**If file not selected*/
          if (this.excelSheetImportTab != 'init' && this.selectedSheetIndex == -1) {
            this.onExcelSheetSelect(0);
          }
        }
        else{
          this.toastCtrl.error(data.error);
        }
      });
    }
  }

  onMakeNewSheet() {
    this.excelFetchEl.nativeElement.value = null;
    this.excelFetchEl.nativeElement.click();
  }

  onExcelEditorImportTab() {
    this.excelSheetImportTab = 'import';
    this.onExcelSheetSelect(-1);
  }

  onExcelEditorImportBack(): boolean {
    if (this.excelSheetImported) {
      return false;
    }
    this.excelSheetImportTab = 'editor';
    this.onExcelSheetSelect(0);
    return;
  }

  onExcelEditorImport(type) {
    /**On Excel Import or Save*/
    this.hasImportFormSubmitted = true;
    if (this.importForm.valid) {
      /**Validation changed to be done in backend*/
      this.excelSheetImportProcessing = true;
      this.excelSheetImported = false;
      this.dataConnectorService.onExcelSheetSave(this.loggedInUser['login_key'], this.excelImportId, this.importForm.value.name, type, this.excelSheets).subscribe(resp => {
        this.excelSheetImportProcessing = false;
        this.excelSheetImported = resp.status && type == 'import';

        if (resp.status) {
          if (type == 'save') {
            this.toastCtrl.success('Saved successfully');
            this.onDiscardExcelImport();
          }
          else{
            this.toastCtrl.success('Imported successfully');
            this.excelExportResults = resp;
          }
        }
        else{
          this.toastCtrl.error(resp.error);
        }
      });
    }
  }

  setExcelSheetOptions() {
    for (let i=0; i<this.excelSheets.length; i++) {
      if (!this.excelSheets[i].options) {
        /**Calculate The Longest Column in Sheet*/
        let max_columns = 0;
        for (let j=0; j<this.excelSheets[i].items.length; j++) {
          let total_columns = this.excelSheets[i].items[j].length;
          if (total_columns > max_columns) {
            max_columns = total_columns;
          }
        }

        /**Set sheet default options*/
        this.excelSheets[i].options = {
          source_model_id: null,
          source_model_name: '',
          target_model_id: null,
          target_model_name: '',
          type: 'object',
          has_headers: true,
          reuse_objects: true,
          max_columns: max_columns,
          object_attributes: [],
          relationship_attributes: [],
          column_values: []
        }

        /**Set column values*/
        for (let j=0; j<max_columns; j++) {
          this.excelSheets[i].options.column_values.push({
            id: null,
            name: null,
            group: null,
          });
        }
      }
    }
  }

  onExcelSheetSelect(index): boolean {
    if (this.excelSheetImportTab == 'import') {
      return false;
    }

    this.selectedSheetIndex = index;

    /**Remove old controls*/
    for (let i in this.mappingForm.controls) {
      if (i.indexOf('col_') != -1) {
        this.mappingForm.removeControl(i);
      }
    }

    /**Add new controls and set values*/
    if (this.selectedSheetIndex != -1) {
      for (let i=0; i<this.excelSheets[this.selectedSheetIndex].options.max_columns; i++) {
        let value = null;
        let selected_value = this.excelSheets[this.selectedSheetIndex].options.column_values[i];
        if (selected_value.group) {
          if (selected_value.group == 'Global') {
            /**Reset list options to default to not show previous search list*/
            if (this.excelSheets[this.selectedSheetIndex].options.type == 'object') {
              this.excelSheets[this.selectedSheetIndex].options.object_attributes[i] = this.defaultObjectAttributes;
            }
            else{
              this.excelSheets[this.selectedSheetIndex].options.relationship_attributes[i] = this.defaultRelationshipAttributes;
            }
          }
          else{
            if (this.excelSheets[this.selectedSheetIndex].options.type == 'object') {
              this.onObjectAttributeSearch({ term: selected_value.name }, i)
            }
            else{
              this.onRelationshipAttributeSearch({ term: selected_value.name }, i)
            }
          }

          value = selected_value.id;
        }

        this.mappingForm.addControl('col_' + i, new UntypedFormControl(value));
      }

      /**Prefill form*/
      this.mappingForm.controls['type'].patchValue(this.excelSheets[index].options.type);
      this.mappingForm.controls['source_model_id'].patchValue(this.excelSheets[index].options.source_model_id);
      this.mappingForm.controls['target_model_id'].patchValue(this.excelSheets[index].options.target_model_id);
      this.mappingForm.controls['has_headers'].patchValue(this.excelSheets[index].options.has_headers);
      this.mappingForm.controls['reuse_objects'].patchValue(this.excelSheets[index].options.reuse_objects);

      /**Show results for model Source dropdown*/
      if (this.excelSheets[index].options.source_model_id) {
        this.onSourceModelSearch({ term: this.excelSheets[index].options.source_model_name });
      }
      else{
        this.sourceModels = [];
        this.onSourceModelSearch({ term: '' })
      }

      /**Show results for model Target dropdown*/
      if (this.excelSheets[index].options.target_model_id) {
        this.onSourceModelSearch({ term: this.excelSheets[index].options.target_model_name });
      }
      else{
        this.targetModels = [];
        this.onTargetModelSearch({ term: '' })
      }
    }

    return false;
  }

  onSourceModelSearch(event) {
    this.modelService.onSearchModel(this.loggedInUser['login_key'],event.term, 1).subscribe(data => {
      if (data.status) {
        this.sourceModels = data.models;
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onTargetModelSearch(event) {
    this.modelService.onSearchModel(this.loggedInUser['login_key'],event.term, 1).subscribe(data => {
      if (data.status) {
        this.targetModels = data.models;
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onSheetTypeChange(event) {
    this.excelSheets[this.selectedSheetIndex].options.type = event.id;
    for (let i in this.mappingForm.controls) {
      if (i.indexOf('col_') != -1) {
        this.mappingForm.controls[i].patchValue(null);
      }
    }

    for (let i=0; i<this.excelSheets[this.selectedSheetIndex].options.max_columns; i++) {
      this.excelSheets[this.selectedSheetIndex].options.column_values[i] = {
        id: null,
        name: null,
        group: null
      }
    }
  }

  onSheetSourceModelChange(event) {
    this.excelSheets[this.selectedSheetIndex].options.source_model_id = event.id;
    this.excelSheets[this.selectedSheetIndex].options.source_model_name = event.name;
  }

  onSheetTargetModelChange(event) {
    this.excelSheets[this.selectedSheetIndex].options.target_model_id = event.id;
    this.excelSheets[this.selectedSheetIndex].options.target_model_name = event.name;
  }

  onHasHeadersChange(event) {
    this.excelSheets[this.selectedSheetIndex].options.has_headers = event.target.checked;
  }

  onReuseObjectsChange(event) {
    this.excelSheets[this.selectedSheetIndex].options.reuse_objects = event.target.checked;
  }

  displayCellData(item) {
    return typeof(item) != 'undefined' ? item : '';
  }

  onObjectAttributeSearch(event, index) {
    this.modelService.onSearchObjectAttributes(this.loggedInUser['login_key'],event.term,1).subscribe(data => {
      if (data.status) {
        this.excelSheets[this.selectedSheetIndex].options.object_attributes[index] = this.objectColumnOptions.concat(data.attributes);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  onRelationshipAttributeSearch(event, index) {
    this.modelService.onSearchRelationshipAttributes(this.loggedInUser['login_key'],event.term,1).subscribe(data => {
      if (data.status) {
        this.excelSheets[this.selectedSheetIndex].options.relationship_attributes[index] = this.relationshipColumnOptions.concat(data.attributes);
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  getAttributes(index) {
    return this.mappingForm.value.type == 'object' ? this.excelSheets[this.selectedSheetIndex].options.object_attributes[index] : this.excelSheets[this.selectedSheetIndex].options.relationship_attributes[index];
  }

  onCellAttributesSearch(event, index) {
    return this.mappingForm.value.type == 'object' ? this.onObjectAttributeSearch(event, index) : this.onRelationshipAttributeSearch(event, index);
  }

  onCellColumnChanged(event, index) {
    this.excelSheets[this.selectedSheetIndex].options.column_values[index] = {
      id: event.id,
      name: event.name,
      group: event.group
    };
  }

  showExcelExportResults() {
    return Object.keys(this.excelExportResults).length;
  }

  onDiscardExcelImport() {
    if (this.excelImportId) {
      this.router.navigateByUrl('data-connectors/excel');
    }
    else{
      this.onExcelImportInit();
    }
  }

  onExcelFileEditor() {
    this.hasImportPreFormSubmitted = true;
    if (this.importPreForm.valid) {
      if (Object.keys(this.excelSheets).length) {
        this.importForm.controls.name.patchValue(this.importPreForm.controls.name.value);
        this.currentActiveTab = 'excel_import';
        this.excelSheetImportTab = 'editor';
        this.onExcelSheetSelect(this.selectedSheetIndex);
      }
      else{
        this.toastCtrl.error('Please attach excel file to continue');
      }
    }
  }

  onExcelFileRemove(): boolean {
    this.preSelectedFileName = '';
    this.excelSheets = [];
    return false;
  }
  selectAllRecords(event) {
    const checked = event.target.checked
    this.isAllReSelected = checked;
    if (checked) {
      this.excel_imports.forEach((item) => {
        this.excelImportCheckedItems[item.id] = item
      });
    }
    else {
      this.excelImportCheckedItems = {}
    }
  }
}
