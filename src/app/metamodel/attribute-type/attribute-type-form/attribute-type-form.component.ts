import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { EventsService } from '../../../shared/EventService';
import { AttributeTypeService } from '../attribute-type.service';
import { HelperService } from '../../../shared/HelperService';
import { QueriesService } from '../../../queries/queries.service';
import { SettingsService } from '../../../administration/settings/settings.service';

@Component({
  selector: 'app-attribute-type-form',
  templateUrl: './attribute-type-form.component.html',
  styleUrls: ['./attribute-type-form.component.css']
})
export class AttributeTypeFormComponent implements OnInit {
  @ViewChild('fromNumberDecimalEl') fromNumberDecimalEl: ElementRef;
  @ViewChild('toNumberDecimalEl') toNumberDecimalEl: ElementRef;
  @ViewChild('fromNumberIntegerEl') fromNumberIntegerEl: ElementRef;
  @ViewChild('toNumberIntegerEl') toNumberIntegerEl: ElementRef;
  @ViewChild('listItemRef') listItemRef: ElementRef;
  @ViewChild('decimalPlacesEl') decimalPlacesEl: ElementRef;
  loggedInUser: any;
  form: UntypedFormGroup;
  hasFormSubmitted: boolean;
  objectTypes: any;
  relationshipTypes: any;
  defaultAttributeFormat: string;
  attributeListItems: any;
  attributeSelectedObjectTypes: any;
  attributeSelectedRelationshipTypes: any;
  attributePreSelectedObjectTypes: any;
  attributePreSelectedRelationshipTypes: any;
  attributeTypeId: string;
  firstLoad: boolean;
  isLoading: boolean;
  attributeTypesList: any;
  currencyOptions: any;
  hasDecimalCurrencyChecked: boolean;
  hasIntegerCurrencyChecked: boolean;
  currentActiveTab: string;
  settings: any;
  /**Calculation Queries*/
  queryForm: UntypedFormGroup;
  hasQueryFormSubmitted: boolean;
  hasQueryReportRun: boolean;
  isQueryLoading: boolean;
  queryResults: any;
  queryResultIds: any;
  currentPage: number;
  pages: number;
  hasReportRun: boolean;
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private attributeTypeService: AttributeTypeService,
      private eventsService: EventsService,
      private helperService: HelperService,
      private queryService: QueriesService,
      private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.objectTypes = [];
    this.relationshipTypes = [];
    this.attributeListItems = [];
    this.attributePreSelectedObjectTypes = [];
    this.attributePreSelectedRelationshipTypes = [];
    this.attributeSelectedObjectTypes = [];
    this.attributeSelectedRelationshipTypes = [];
    this.eventsService.onPageChange({ section : 'metamodel', page : 'attribute-types' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.defaultAttributeFormat = '';
    this.firstLoad = false;
    this.hasFormSubmitted = false;
    this.isLoading = false;
    this.attributeTypeId = '';
    this.attributeTypesList = this.attributeTypeService.getDefaultTypesList();
    this.currencyOptions = this.attributeTypeService.getCurrencyOptions();
    this.currentActiveTab = 'general';
    this.hasDecimalCurrencyChecked = false;
    this.hasIntegerCurrencyChecked = false;

    this.hasQueryReportRun = false;
    this.hasQueryFormSubmitted = false;
    this.isQueryLoading = false;
    this.queryResults = [];
    this.queryResultIds = [];
    this.currentPage = this.pages = 1;
    this.hasReportRun = false;

    /**Build Form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      format: new UntypedFormControl('', {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      decimal_from_number: new UntypedFormControl(null),
      decimal_to_number: new UntypedFormControl(null),
      decimal_currency: new UntypedFormControl(null, {
        updateOn: 'change'
      }),
      decimal_places: new UntypedFormControl(null),
      integer_from_number: new UntypedFormControl(null),
      integer_to_number: new UntypedFormControl(null),
      integer_currency: new UntypedFormControl(null, {
        updateOn: 'change'
      }),
      boolean_default: new UntypedFormControl(null, {
        updateOn: 'change'
      }),
      export_to_diagram: new UntypedFormControl(null, {
        updateOn: 'change'
      }),
    });

    this.queryForm = new UntypedFormGroup({
      query: new UntypedFormControl(null),
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Group Details*/
        this.attributeTypeId = paramMap.get('id');
        this.attributeTypeService.attributeDetails(this.loggedInUser['login_key'], this.attributeTypeId).subscribe(data => {
          if (data.status) {
            /**Fill Form*/
            this.form.controls.name.patchValue(data.attribute_data.name);
            this.form.controls.format.patchValue(data.attribute_data.format);
            this.form.controls.export_to_diagram.patchValue(data.attribute_data.export_to_diagram);
            this.objectTypes = data.attribute_data.available_object_types;
            this.relationshipTypes = data.attribute_data.available_relationship_types;

            switch (data.attribute_data.format) {
              case 'text':
              case 'date':
              case 'date_range':

              break;
              case 'decimal':
                this.form.controls.decimal_from_number.patchValue(data.attribute_data.number_options.from_number);
                this.form.controls.decimal_to_number.patchValue(data.attribute_data.number_options.to_number);
                this.form.controls.decimal_currency.patchValue(data.attribute_data.number_options.currency ? data.attribute_data.number_options.currency : '');
                this.form.controls.decimal_places.patchValue(data.attribute_data.number_options.decimal_places);
                this.hasDecimalCurrencyChecked = !!data.attribute_data.number_options.currency;
                if (!this.hasDecimalCurrencyChecked) {
                  this.form.controls.decimal_currency.disable();
                }
              break;
              case 'integer':
                this.form.controls.integer_from_number.patchValue(data.attribute_data.number_options.from_number);
                this.form.controls.integer_to_number.patchValue(data.attribute_data.number_options.to_number);
                this.form.controls.integer_currency.patchValue(data.attribute_data.number_options.currency);
                this.hasIntegerCurrencyChecked = !!data.attribute_data.number_options.currency;
                if (!this.hasIntegerCurrencyChecked) {
                  this.form.controls.integer_currency.disable();
                }
              break;
              case 'boolean':
                this.form.controls.boolean_default.patchValue(data.attribute_data.boolean_options.default);
              break;
              case 'list':
              case 'multiple-list':
                this.attributeListItems = data.attribute_data.list_options;
              break;
            }

            this.defaultAttributeFormat = data.attribute_data.format;
            this.attributePreSelectedObjectTypes = data.attribute_data.selected_object_types;
            this.attributePreSelectedRelationshipTypes = data.attribute_data.selected_relationship_types;
            this.firstLoad = true;

            /**Queries*/
            if (data.attribute_data.query) {
              this.queryForm.controls.query.patchValue(data.attribute_data.query);
              this.loadQueryResults(1);
            }
          }
          else {
            this.toastCtrl.error(data.error);
            this.router.navigateByUrl('metamodel/attribute-types');
          }
        });
      }
      else{
        /**Load Available Object Types*/
        this.attributeTypeService.getAvailableObjectTypes(this.loggedInUser['login_key']).subscribe(data => {
          if (data.status) {
            this.objectTypes = data.object_types;
            this.firstLoad = true;
          }
        });

        /**Load Available Relationship Types*/
        this.attributeTypeService.getAvailableRelationshipTypes(this.loggedInUser['login_key']).subscribe(data => {
          if (data.status) {
            this.relationshipTypes = data.relationship_types;
            this.firstLoad = true;
          }
        });
      }

      this.loggedInUser = this.authService.getLoggedInUserObject();
    });

    this.settingsService.getSettingsDateFormat(this.loggedInUser['login_key']).subscribe(data => {
      if (data.status) {
        this.settings = data;
      }
    });
  }

  onAttributeTypeUpdate() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      if (!this.form.value.name.toString().trim().length) {
        this.toastCtrl.info('Name is required');
        return false;
      }

      let form_data = {
        id : this.attributeTypeId,
        name : this.form.value.name,
        query: this.queryForm.value.query,
        format : this.defaultAttributeFormat,
        export_to_diagram : this.form.value.export_to_diagram,
        object_type_ids : [],
        relationship_type_ids: [],
        list_options : [],
        number_options : {
          from_number : null,
          to_number : null,
          currency : null,
          decimal_places : null
        },
        boolean_options : {
          default : null
        }
      };

      switch (this.defaultAttributeFormat) {
        case 'text':
        case 'date':
        case 'date_range':
          //skip
        break;
        case 'boolean':
          form_data.boolean_options.default = this.form.value.boolean_default;
        break;
        case 'decimal':
          /**Validation for Decimal*/
          if (
              (this.form.value.decimal_from_number && !this.numberCheck(this.form.value.decimal_from_number)) ||
              (this.form.value.decimal_to_number && !this.numberCheck(this.form.value.decimal_to_number)) ||
              (this.form.value.decimal_places && !this.numberCheck(this.form.value.decimal_places))
          ) {
            return false;
          }

          if (this.hasDecimalCurrencyChecked && !this.form.value.decimal_currency) {
            return false;
          }

          form_data.number_options.from_number = this.form.value.decimal_from_number;
          form_data.number_options.to_number = this.form.value.decimal_to_number;
          form_data.number_options.currency = this.hasDecimalCurrencyChecked ? this.form.value.decimal_currency : null;
          form_data.number_options.decimal_places = this.form.value.decimal_places;
        break;
        case 'integer':
          /**Validation for Integer*/
          if (
              (this.form.value.integer_from_number && !this.numberCheck(this.form.value.integer_from_number)) ||
              (this.form.value.integer_to_number && !this.numberCheck(this.form.value.integer_to_number))
          ) {
            return false;
          }

          if (this.hasIntegerCurrencyChecked && !this.form.value.integer_currency) {
            return false;
          }

          form_data.number_options.from_number = this.form.value.integer_from_number;
          form_data.number_options.to_number = this.form.value.integer_to_number;
          form_data.number_options.currency = this.hasIntegerCurrencyChecked ? this.form.value.integer_currency : null;
        break;
        case 'list':
        case 'multiple-list':
          if (this.attributeListItems.length) {
            form_data.list_options = this.attributeListItems;
          }
          else{
            this.toastCtrl.info('Please select at least one list item to continue');
            return false;
          }
        break;
      }

      /**Assign selected Object Type Ids*/
      form_data.object_type_ids = this.attributeSelectedObjectTypes;
      form_data.relationship_type_ids = this.attributeSelectedRelationshipTypes;
      this.isLoading = true;
      if (this.attributeTypeId) {
        this.attributeTypeService.updateAttributeType(this.loggedInUser['login_key'],form_data, false).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Attribute Type updated successfully');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.attributeTypeService.addAttributeType(this.loggedInUser['login_key'],form_data).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Attribute Type created successfully');
            this.router.navigateByUrl('metamodel/attribute-type');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
    }
  }

  onAttributeFormatChange() {
    this.defaultAttributeFormat = this.form.value.format;
    switch (this.defaultAttributeFormat){
      case 'list':
      case 'multiple-list':
        this.attributeListItems = [];
      break;
      case 'decimal':
        this.form.controls.decimal_currency.patchValue('');
        this.hasDecimalCurrencyChecked = false;
      break;
      case 'integer':
        this.form.controls.integer_currency.patchValue('');
        this.hasIntegerCurrencyChecked = false;
      break;
    }
  }

  onAddListItem() {
    if (this.listItemRef.nativeElement.value.length) {
      this.attributeListItems = this.attributeListItems ? this.attributeListItems : [];
      this.attributeListItems.push(this.listItemRef.nativeElement.value);
      this.listItemRef.nativeElement.value = '';
    }
  }

  onDeleteListItem(index) {
    this.attributeListItems.splice(index, 1);
  }

  exportSelectedObjectTypes(event) {
    this.attributeSelectedObjectTypes = event;
  }

  exportSelectedRelationshipTypes(event) {
    this.attributeSelectedRelationshipTypes = event;
  }

  onDecimalCurrencyChanged(event) {
    this.form.controls.decimal_currency.patchValue('');
    this.hasDecimalCurrencyChecked = event.target.checked;
    if (this.hasDecimalCurrencyChecked) {
      this.form.controls.decimal_currency.enable();
    }
    else{
      this.form.controls.decimal_currency.disable();
    }
  }

  onIntegerCurrencyChanged(event) {
    this.form.controls.integer_currency.patchValue('');
    this.hasIntegerCurrencyChecked = event.target.checked;
    if (this.hasIntegerCurrencyChecked) {
      this.form.controls.integer_currency.enable();
    }
    else{
      this.form.controls.integer_currency.disable();
    }
  }

  numberCheck(value) {
    return Number.isInteger(parseInt(value));
  }

  onTabChange(type) {
    this.currentActiveTab = type;
  }

  convertDateTimeFormat(date_item) {
    return this.helperService.dateTimeFormat(date_item);
  }

  loadQueryResults(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }

    this.isQueryLoading = true;
    this.hasQueryReportRun = true;
    this.queryService.runQuery(this.loggedInUser['login_key'], this.queryForm.controls.query.value, page).subscribe(data => {
      this.isLoading = false;
      this.isQueryLoading = false;
      if (data.status) {
        /**Append new items*/
        if (page == 1) {
          this.queryResultIds = [];
          this.queryResults = [];
        }

        for (let i in data.items) {
          if (this.queryResultIds.indexOf(data.items[i].id) == -1) {
            this.queryResults = this.queryResults.concat(data.items[i]);
            this.queryResultIds.push(data.items[i].id);
          }
        }

        this.firstLoad = true;
        this.currentPage = page;
        this.pages = data.pages;

        if (!this.queryResults.length && this.currentPage != 1) {
          this.currentPage--;
          this.loadQueryResults(this.currentPage);
          return;
        }
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }
}
