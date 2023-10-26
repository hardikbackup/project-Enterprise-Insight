import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { EventsService } from '../../../shared/EventService';
import { RelationshipTypeService } from '../relationship-type.service';
import { AttributeTypeService } from '../../attribute-type/attribute-type.service';

@Component({
  selector: 'app-relationship-type-form',
  templateUrl: './relationship-type-form.component.html',
  styleUrls: ['./relationship-type-form.component.css']
})
export class RelationshipTypeFormComponent implements OnInit {
  @ViewChild('tabNameEl') tabNameEl: ElementRef;
  loggedInUser: any;
  form: UntypedFormGroup;
  hasFormSubmitted: boolean;
  relationshipTypeId: string;
  firstLoad: boolean;
  isLoading: boolean;
  selectedObjectType: any;
  combinations: any;
  selectedCombinations: any;
  allCombinationsSelected: boolean;
  hasBIDirectionalRelationship: boolean;
  attributeTypes: any;
  preSelectedAttributeTypes: any;
  selectedAttributeTypes: any;
  currentActiveTab: string;
  startLinesList: any;
  endLinesList: any;
  startLine: string;
  endLine: string;
  startEndLineExpandType: string;
  attributeTabs: any;
  selectedAttributeTabIndex: number;
  availableAttributeTypes: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastCtrl: ToastrService,
    private relationshipTypeService: RelationshipTypeService,
    private eventsService: EventsService,
    private attributeTypeService: AttributeTypeService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.hasFormSubmitted = false;
    this.firstLoad = false;
    this.isLoading = false;
    this.combinations = [];
    this.selectedCombinations = [];
    this.allCombinationsSelected = false;
    this.relationshipTypeId = '';
    this.attributeTypes = [];
    // this.preSelectedAttributeTypes = [];
    this.selectedAttributeTypes = [];
    this.currentActiveTab = 'object_types';
    this.attributeTabs = [];
    this.selectedAttributeTabIndex = -1;
    this.availableAttributeTypes = [];

    this.startLinesList = this.relationshipTypeService.getStartLinesList();
    this.endLinesList = this.relationshipTypeService.getEndLinesList();
    this.startEndLineExpandType = '';
    this.startLine = this.endLine = '';

    this.eventsService.onPageChange({ section: 'metamodel', page: 'relationship-types' })

    /**Build Form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      from_to_description: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      to_from_description: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      bi_directional_relationship: new UntypedFormControl(null),
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Relationship Type Details*/
        this.relationshipTypeId = paramMap.get('id');
        this.relationshipTypeService.relationshipTypeDetails(this.loggedInUser['login_key'], this.relationshipTypeId).subscribe(data => {
          if (data.status) {
            this.form.controls.name.patchValue(data.relationship_data.name);
            this.form.controls.from_to_description.patchValue(data.relationship_data.from_to_description);
            this.form.controls.to_from_description.patchValue(data.relationship_data.to_from_description);
            this.form.controls.bi_directional_relationship.patchValue(data.relationship_data.bi_directional_relationship);
            this.startLine = data.relationship_data.start_line;
            this.endLine = data.relationship_data.end_line;
            this.combinations = data.relationship_data.combinations;
            this.hasBIDirectionalRelationship = data.relationship_data.bi_directional_relationship;
            this.attributeTabs = typeof (data.relationship_data.attribute_tabs) != 'undefined' ? data.relationship_data.attribute_tabs : [];

            /**Attribute Types*/
            if (typeof data.relationship_data.available_attribute_types != 'undefined') {
              this.attributeTypes = data.relationship_data.available_attribute_types;
            }

            this.firstLoad = true;
          }
          else {
            this.toastCtrl.info('Relationship Type not found');
            this.router.navigateByUrl('metamodel/relationship-type');
          }
        });
      }
      else {
        this.attributeTabs.push({
          id: null,
          name: "General",
          attribute_ids: []
        });
        this.selectedAttributeTabIndex = 0;
        /**Load Available Attribute Types*/
        this.attributeTypeService.getAvailableAttributeTypes(this.loggedInUser['login_key']).subscribe(data => {
          if (data.status) {
            this.attributeTypes = data.attribute_types;
            this.firstLoad = true;
            this.availableAttributeTypes = this.attributeTypes;
          }
        });
      }
    });
  }

  onRelationshipTypeUpdate() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      if (!this.form.value.name.toString().trim().length) {
        this.hasFormSubmitted = false;
        this.toastCtrl.info('Name is required');
        return false;
      }

     // check combination validations 
      if(!this.isValidCombination()){
        this.hasFormSubmitted = false;
        this.toastCtrl.error('Error, Contradictory overlap rule(s)');
        return false;
      }

      this.isLoading = true;

      /**Object type combinations*/
      let object_combinations_data = [];
      for (let i in this.combinations) {
        let description = document.getElementById('combination_' + i) as HTMLInputElement;
        object_combinations_data.push({
          id: this.combinations[i].id ? this.combinations[i].id : null,
          from_object_type_id: this.combinations[i].from_object_type.id,
          to_object_type_id: this.combinations[i].to_object_type.id,
          description: (description) ? description.value : '',
          containment: this.combinations[i].containment
        });
      }

      let form_data = <any>this.form.value;
      form_data.start_line = this.startLine ? this.startLine : null;
      form_data.end_line = this.endLine ? this.endLine : null;

      if (this.relationshipTypeId) {
        form_data.id = this.relationshipTypeId;
        this.relationshipTypeService.updateRelationshipType(this.loggedInUser['login_key'], form_data, object_combinations_data, this.attributeTabs, false).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the relationship types*/
            this.toastCtrl.success('Relationship type updated successfully');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else {
        this.relationshipTypeService.addRelationshipType(this.loggedInUser['login_key'], form_data, object_combinations_data, this.attributeTabs).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the relationship types*/
            this.toastCtrl.success('Relationship type created successfully');
            this.router.navigateByUrl('metamodel/relationship-type');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }

      return;
    }
  }
  
  isValidCombination() {
    let bothCombinations = this.combinations.filter(obj => obj.containment === "both")
    for (let i = 0; i < bothCombinations.length; i++) {
      for (let j = i + 1; j < bothCombinations.length; j++) {
        // from object to to object && toobject to from object.
        if (bothCombinations[i].from_object_type.id == bothCombinations[j].to_object_type.id
          && bothCombinations[i].to_object_type.id == bothCombinations[j].from_object_type.id) {
          return false;
        }
      }
    }
    return true;
  }

  onCreateCombination() {
    /**Append old description to combinations*/
    if (this.selectedObjectType) {
      let has_duplicates_found = false;
      for (let i = 0; i < this.combinations.length; i++) {
        if (this.combinations[i].from_object_type.id == this.selectedObjectType.from_object_type.id && this.combinations[i].to_object_type.id == this.selectedObjectType.to_object_type.id) {
          has_duplicates_found = true;
          break;
        }
      }

      if (has_duplicates_found) {
        this.toastCtrl.info('The selected combination already exists');
      }
      else {
        let combination_obj = {
          from_object_type: this.selectedObjectType.from_object_type,
          to_object_type: this.selectedObjectType.to_object_type,
          description: this.form.controls.from_to_description.value,
          containment: ''
        };

        if (this.selectedObjectType.from_object_type.id == 'any' && this.selectedObjectType.to_object_type.id == 'any') {
          this.combinations = [combination_obj];
          this.selectedCombinations = [];
        }
        else {
          /**Check if has any to any*/
          let any_combination_found = false;
          for (let i = 0; i < this.combinations.length; i++) {
            if (this.combinations[i].from_object_type.id == 'any' && this.combinations[i].to_object_type.id == 'any') {
              any_combination_found = true;
            }
          }

          if (any_combination_found) {
            this.toastCtrl.info('Any to Any combination found, please delete it first to add a new ones');
          }
          else {
            this.selectedCombinations = [];
            this.combinations.push(combination_obj);
          }
        }
      }
    }
    else {
      this.toastCtrl.error('Please select objects to continue');
    }
  }

  onCombinationSelect(event, index) {
    let get_index = this.selectedCombinations.indexOf(index);
    if (get_index == -1) {
      if (event.target.checked) {
        this.selectedCombinations.push(index);
      }
    }
    else {
      this.selectedCombinations.splice(get_index, 1);
    }

    this.allCombinationsSelected = false;
  }

  hasCombinationChecked(id): boolean {
    return this.selectedCombinations.indexOf(id) != -1;
  }

  onCheckAllCombinations(event) {
    this.allCombinationsSelected = event.target.checked;

    for (let i in this.combinations) {
      let get_index = this.selectedCombinations.indexOf(i);
      if (this.allCombinationsSelected) {
        if (get_index == -1) {
          this.selectedCombinations.push(i);
        }
      }
      else {
        if (get_index !== -1) {
          this.selectedCombinations.splice(get_index, 1);
        }
      }
    }
  }

  onDeleteCombination() {
    if (this.selectedCombinations.length) {
      let selected_combinations = this.selectedCombinations;
      this.combinations = this.combinations.filter(function (data, index) {
        if (selected_combinations.indexOf(index.toString()) == -1) {
          return data;
        }
      })

      this.selectedCombinations = [];
    }

    this.allCombinationsSelected = false;
  }

  onObjectFromToSelected(data) {
    this.selectedObjectType = data;
  }

  onBIDirectionalChange(event) {
    this.hasBIDirectionalRelationship = event.target.checked;
    if (this.hasBIDirectionalRelationship) {
      this.form.controls.to_from_description.patchValue(this.form.controls.from_to_description.value);
    }
  }

  onFromToDescriptionChange(event) {
    if (this.hasBIDirectionalRelationship) {
      this.form.controls.to_from_description.patchValue(event.target.value);
    }
  }

  exportSelectedTypes(event) {
    this.attributeTabs[this.selectedAttributeTabIndex].attribute_ids = event;
  }

  onTabChange(type) {
    this.currentActiveTab = type;
  }

  onExpandLineDropdown(type) {
    this.startEndLineExpandType = (type == this.startEndLineExpandType) ? '' : type;
  }

  onStartLineSelect(type) {
    this.startLine = type;
  }

  onEndLineSelect(type) {
    this.endLine = type;
  }

  getStartLineClass() {
    let c = this.startLinesList.filter(data => {
      if (data.id == this.startLine) {
        return data.class;
      }
    })
    return c.length ? c[0].class : '';
  }

  getEndLineClass() {
    let c = this.endLinesList.filter(data => {
      if (data.id == this.endLine) {
        return data.class;
      }
    })
    return c.length ? c[0].class : '';
  }

  onContainmentCheck(event, item, value) {
    item.containment = (event.target.checked && item.containment != value) ? value : '';
  }

  onAddTab() {
    if (this.tabNameEl.nativeElement.value.length) {
      this.attributeTabs.push({
        id: null,
        name: this.tabNameEl.nativeElement.value,
        attribute_ids: []
      });

      this.tabNameEl.nativeElement.value = '';
    }
    else {
      this.tabNameEl.nativeElement.focus();
    }
  }

  onRemoveTab(index) {
    if (this.selectedAttributeTabIndex == index) {
      this.selectedAttributeTabIndex = -1;
    }
    this.attributeTabs.splice(index, 1);
  }

  onAttributeTabChange(event, index) {
    if (event.target.checked) {
      this.selectedAttributeTabIndex = index;
      this.availableAttributeTypes = this.attributeTypes;
      let pre_selected_attributes = [];
      if (this.attributeTabs[this.selectedAttributeTabIndex].attribute_ids.length) {
        for (let i = 0; i < this.availableAttributeTypes.length; i++) {
          if (this.attributeTabs[this.selectedAttributeTabIndex].attribute_ids.indexOf(this.availableAttributeTypes[i].id) != -1) {
            pre_selected_attributes.push(this.availableAttributeTypes[i]);
          }
        }
      }

      this.preSelectedAttributeTypes = pre_selected_attributes;
    }
    else {
      this.selectedAttributeTabIndex = -1;
      this.preSelectedAttributeTypes = [];
    }
  }
}
