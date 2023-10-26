import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { EventsService } from '../../../shared/EventService';
import { ObjectTypeService } from '../../object-type/object-type.service';
import { MetamodelManagerService } from '../metamodel-manager.service';
import { AttributeTypeService } from '../../attribute-type/attribute-type.service';

@Component({
  selector: 'app-metamodel-manager-form',
  templateUrl: './metamodel-manager-form.component.html',
  styleUrls: ['./metamodel-manager-form.component.css']
})
export class MetamodelManagerFormComponent implements OnInit {
  loggedInUser: any;
  form: UntypedFormGroup;
  objectTypes: any;
  preSelectedObjectTypes: any;
  selectedObjectTypes: any;
  relationshipTypes: any;
  preSelectedRelationshipTypes: any;
  selectedRelationshipTypes: any;
  selectedRelationshipListTypes: any;
  selectedRelationshipTypeParentChilds: any;
  diagramTypes: any;
  preSelectedDiagramTypes: any;
  selectedDiagramTypes: any;
  hasFormSubmitted: boolean;
  metamodelId: string;
  firstLoad: boolean;
  isLoading: boolean;
  currentActiveTab: string;
  isParentChild:boolean = false
  // @HostListener('document:click', ['$event'])
  // clicked(e) {
  //   this.shapeColorActiveTab = e.target.getAttribute('id');
  // }
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private objectTypeService: ObjectTypeService,
      private eventsService: EventsService,
      private metamodelService: MetamodelManagerService,
      private attributeTypeService: AttributeTypeService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.objectTypes = [];
    this.selectedObjectTypes = [];
    this.relationshipTypes = [];
    this.selectedRelationshipTypes = [];
    this.selectedRelationshipListTypes = [];
    this.selectedRelationshipTypeParentChilds = '';
    this.diagramTypes = [];
    this.selectedDiagramTypes = [];

    this.eventsService.onPageChange({ section : 'metamodel', page : 'metamodel-manager' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.hasFormSubmitted = false;
    this.firstLoad = false;
    this.isLoading = false;
    this.currentActiveTab = 'object_types';
    this.metamodelId = '';

    /**Build Form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      default: new UntypedFormControl(null)
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Object Type Details*/
        this.metamodelId = paramMap.get('id');
        this.metamodelService.metamodelDetails(this.loggedInUser['login_key'], this.metamodelId).subscribe(data => {
          if (data.status) {
            try {
              this.form.controls.name.patchValue(data.metamodel_data.name);
              this.form.controls.default.patchValue(data.metamodel_data.default);
              /**Object Types*/
              this.objectTypes = data.metamodel_data.available_object_types;
              this.selectedObjectTypes = this.preSelectedObjectTypes = data.metamodel_data.selected_object_types;

              /**Relationship Types*/
              this.relationshipTypes = data.metamodel_data.available_relationship_types;
              this.selectedRelationshipTypes = this.preSelectedRelationshipTypes = data.metamodel_data.selected_relationship_types;

              let selectedRelationshipTypeParentChilds = []
              for (let type of this.selectedRelationshipTypes) {
                try {
                  let relationshipObj = data.metamodel_data.mapRelationship[type.id];
                  selectedRelationshipTypeParentChilds.push(relationshipObj);
                } catch (ex) {
                  console.log(ex)
                }
              }
              this.selectedRelationshipListTypes = selectedRelationshipTypeParentChilds;

              /**Diagram Types*/
              this.diagramTypes = this.preSelectedDiagramTypes = data.metamodel_data.available_diagram_types;
              this.selectedDiagramTypes = this.preSelectedDiagramTypes = data.metamodel_data.selected_diagram_types;

              this.firstLoad = true;
            } catch (ex) {
              console.log(ex)
            }

          }
          else {
            this.toastCtrl.info(data.error);
            this.router.navigateByUrl('metamodel/metamodel-manager');
          }
        })
      }
      else{
        this.firstLoad = true;
        /**Load Available Object Types*/
        this.attributeTypeService.getAvailableObjectTypes(this.loggedInUser['login_key']).subscribe(data => {
          if (data.status) {
            this.objectTypes = data.object_types;
          }
        });

        /**Load Relationship Types*/
        this.metamodelService.getAvailableRelationshipTypes(this.loggedInUser['login_key']).subscribe(data => {
          if (data.status) {
            this.relationshipTypes = data.relationship_types;
          }
        });

        /**Load Diagram Types*/
        this.metamodelService.getAvailableDiagramTypes(this.loggedInUser['login_key']).subscribe(data => {
          if (data.status) {
            this.diagramTypes = data.diagram_types;
          }
        });
      }
    });
  }

  onMetamodelUpdate() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      if (!this.form.value.name.toString().trim().length) {
        this.hasFormSubmitted = false;
        this.toastCtrl.info('Name is required');
        return false;
      }

      let default_checked = this.form.value.default == true;
      this.isLoading = true;
      if (this.metamodelId) {
        this.metamodelService.updateMetamodel(this.loggedInUser['login_key'], this.metamodelId, this.form.value.name, default_checked, this.selectedObjectTypes, this.selectedRelationshipTypes, this.selectedDiagramTypes, false, this.selectedRelationshipListTypes).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.toastCtrl.success('Metamodel updated successfully');
            this.router.navigateByUrl('metamodel/metamodel-manager');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.metamodelService.addMetamodel(this.loggedInUser['login_key'], this.form.value.name, default_checked, this.selectedObjectTypes, this.selectedRelationshipTypes, this.selectedDiagramTypes, this.selectedRelationshipListTypes).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Metamodel created successfully');
            this.router.navigateByUrl('metamodel/metamodel-manager');
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

  onRelationParentChildItemSelect(event, id) {
    this.selectedRelationshipListTypes.filter(s => {
      if(s.id === id){
        s.parentChild = true;
      }else{
        s.parentChild = false;
      }
    });
  }

  onTabChange(type) {
    this.currentActiveTab = type;
  }

  exportSelectedObjectTypes(event) {
    this.selectedObjectTypes = event;
  }

  exportSelectedRelationshipTypes(event) {
    try {
      this.selectedRelationshipTypes = event;
      let newRelationTypes = []
      const mapRelationType = new Map(
        this.selectedRelationshipListTypes.map(obj => {
          return [obj.id, obj];
        }),
      );

      const mapAvailableRelationType = new Map<any, any>(
        this.relationshipTypes.map(obj => {
          return [obj.id, obj]
        })
      )

      for (let type of event) {
        if (mapRelationType.has(type)) {
          newRelationTypes.push(mapRelationType.get(type));
          continue;
        }
        newRelationTypes.push({ id: type, parentChild: false });
      }

      for (let relation of newRelationTypes) {
        let relationType = mapAvailableRelationType.get(relation.id);
        relation.name = relationType.name;
      }
      newRelationTypes.sort((a, b) => a.name.localeCompare(b.name))
      this.selectedRelationshipListTypes = newRelationTypes;
    } catch (ex) {
      console.log(ex)
    }
  }

  exportSelectedDiagramTypes(event) {
    this.selectedDiagramTypes = event;
  }
}
