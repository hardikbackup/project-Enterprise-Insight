import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { EventsService } from '../../../shared/EventService';
import { ObjectTypeService } from '../object-type.service';
import { AttributeTypeService } from '../../attribute-type/attribute-type.service';
import { v4 as uuidv4 } from 'uuid';
import { runInThisContext } from 'vm';
@Component({
  selector: 'app-object-type-form',
  templateUrl: './object-type-form.component.html',
  styleUrls: ['./object-type-form.component.css']
})
export class ObjectTypeFormComponent implements OnInit {
  @ViewChild('shapeKeywordSearchEl') shapeKeywordSearchEl: ElementRef;
  @ViewChild('shapeImportFileEl') shapeImportFileEl: ElementRef;
  @ViewChild('tabNameEl') tabNameEl: ElementRef;
  loggedInUser: any;
  form: UntypedFormGroup;
  attributeTypes: any;
  preSelectedAttributeTypes: any;
  selectedAttributeTypes: any;
  hasFormSubmitted: boolean;
  objectTypeId: string;
  firstLoad: boolean;
  isLoading: boolean;
  currentActiveTab: string;
  shapeColorActiveTab: string;
  availableShapeTypes: any;
  deletedShapeTypeIds: any;
  selectedShapeTypeImage: string;
  selectedShapeTypeName: string;
  searchShapeIconKeyword: string;
  showSearchShapeResults: boolean;
  shapeTypeColor: string;
  shapeTypePrevColor: string;
  shapeTypeTextColor: string;
  shapeTypeTextPrevColor: string;
  shapeTypeBorderColor: string;
  shapeTypeBorderPrevColor: string;
  showShapeBorderColorPicker: string;
  showShapeColorPicker: boolean;
  showShapeTextColorPicker: boolean;
  showShapeBorderPicker: boolean;
  presetColors: any;
  attributeTabs: any;
  selectedAttributeTabIndex: number;
  availableAttributeTypes: any;
  @HostListener('document:click', ['$event'])
  clicked(e) {
    this.shapeColorActiveTab = e.target.getAttribute('id');
    if (!e.target.closest('.search-shape-container')) {
      this.showSearchShapeResults = false;
    }
  }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastCtrl: ToastrService,
    private objectTypeService: ObjectTypeService,
    private attributeTypeService: AttributeTypeService,
    private eventsService: EventsService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.attributeTypes = [];
    this.selectedAttributeTypes = [];
    this.eventsService.onPageChange({ section: 'metamodel', page: 'object-types' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.hasFormSubmitted = false;
    this.firstLoad = false;
    this.isLoading = false;
    this.currentActiveTab = 'general';
    this.shapeColorActiveTab = '';
    this.selectedShapeTypeImage = null;
    this.searchShapeIconKeyword = '';
    this.showSearchShapeResults = false;
    this.shapeTypeColor = '';
    this.shapeTypePrevColor = '';
    this.shapeTypeTextColor = '';
    this.shapeTypeBorderColor = '';
    this.objectTypeId = '';
    this.availableShapeTypes = [];


    this.showShapeColorPicker = false;
    this.showShapeTextColorPicker = false;
    this.showShapeBorderPicker = false;
    this.deletedShapeTypeIds = [];
    this.presetColors = ['#333333', '#4f4f4f', '#828282', '#bdbdbd', '#e0e0e0', '#f2f2f2', '#ea5857', '#f29a4a', '#f2c94b', '#239653', '#29ad61', '#6ecf97', '#2e80ed', '#2d9bdb', '#55ccf2', '#9a51e0', '#b96bdc', '#d595eb'];
    this.attributeTabs = [];
    this.selectedAttributeTabIndex = -1;
    this.availableAttributeTypes = [];
    this.selectedShapeTypeName = null;

    /**Build Form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      is_round_corners: new UntypedFormControl(null)
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Object Type Details*/
        this.objectTypeId = paramMap.get('id');
        this.objectTypeService.objectTypeDetails(this.loggedInUser['login_key'], this.objectTypeId).subscribe(data => {
          if (data.status) {
            /**Set form fields*/
            this.form.controls.name.patchValue(data.object_data.name);
            this.form.controls.is_round_corners.patchValue(data.object_data.is_round_corners);
          
            this.availableShapeTypes  = data.object_data.shapes;
            let shapeName = this.availableShapeTypes.filter(a => a.image === data.object_data.shape_icon);
            if (shapeName.length > 0) {
              this.selectedShapeTypeName = shapeName[0].name;
              this.selectedShapeTypeImage = data.object_data.shape_icon;
            } else {
              this.selectedShapeTypeImage = null;
            }
              
            /**Handle other attributes*/
            this.attributeTypes = data.object_data.available_attribute_types;
            this.attributeTabs = data.object_data.attribute_tabs;
            this.firstLoad = true;
            this.shapeTypeColor = this.shapeTypePrevColor = data.object_data.shape_type_color;
            this.shapeTypeTextColor = this.shapeTypeTextPrevColor = data.object_data.shape_type_text_color;
            this.shapeTypeBorderColor = this.shapeTypeBorderPrevColor = data.object_data.shape_type_border_color;
          }
          else {
            this.toastCtrl.info(data.error);
            this.router.navigateByUrl('metamodel/object-type');
          }
        })
      }
      else {
        const promises = this.objectTypeService.getDefaultShapeStyleIcons().map(s => {
          return this.objectTypeService.loadAssetImage(s.image)
            .then(blob => {
              return {
                name: s.name,
                blob: blob
              };
            });
        });
    
        Promise.all(promises)
          .then(results => {
            results.forEach(result => {
              this.appendDefaultShapes(result.name, result.blob);
            });
          })
    
        this.attributeTabs.push({
          id: null,
          name: "General",
          attribute_ids: []
        });
        this.selectedAttributeTabIndex = 0;
        this.shapeTypeColor = '#e0e0e0';
        this.shapeTypePrevColor = '#e0e0e0';
        this.shapeTypeTextColor = '#000000';
        this.shapeTypeBorderColor = '#000000';
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

  onSaveColor(type) {
    switch (type) {
      case 'shape_type':
        this.shapeTypePrevColor = this.shapeTypeColor;
        break;
      case 'shape_type_text':
        this.shapeTypeTextPrevColor = this.shapeTypeTextColor;
        break;
      case 'shape_type_border':
        this.shapeTypeBorderPrevColor = this.shapeTypeBorderColor;
        break;
    }

    this.onCloseColorPicker(type, false);
  }

  onObjectTypeUpdate() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      if (!this.form.value.name.toString().trim().length) {
        this.hasFormSubmitted = false;
        this.toastCtrl.info('Name is required');
        return false;
      }

      this.isLoading = true;
      let imported_shapes = [];
      for (let i = 0; i < this.availableShapeTypes.length; i++) {
        imported_shapes.push({
          id: this.availableShapeTypes[i].id,
          name: this.availableShapeTypes[i].name,
          image: this.availableShapeTypes[i].image,
        });
      }

      if (this.objectTypeId) {
        this.objectTypeService.updateObjectType(this.loggedInUser['login_key'], this.objectTypeId, this.form.value.name, this.shapeTypeColor, this.shapeTypeTextColor, this.shapeTypeBorderColor, !!this.form.value.is_round_corners, this.selectedShapeTypeImage, this.attributeTabs, imported_shapes, this.deletedShapeTypeIds, false).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.toastCtrl.success('Object type updated successfully');
            this.router.navigateByUrl('metamodel/object-type');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else {
        this.objectTypeService.addObjectType(this.loggedInUser['login_key'], this.form.value.name, this.shapeTypeColor, this.shapeTypeTextColor, this.shapeTypeBorderColor, !!this.form.value.is_round_corners, this.selectedShapeTypeImage, this.attributeTabs, imported_shapes).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Object type created successfully');
            this.router.navigateByUrl('metamodel/object-type');
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

  exportSelectedTypes(event) {
    this.attributeTabs[this.selectedAttributeTabIndex].attribute_ids = event;
  }

  onTabChange(type) {
    this.currentActiveTab = type;
  }

  onSelectShapeIcon(item) {
    this.selectedShapeTypeImage = item.image;
    this.selectedShapeTypeName = item.name;
    this.showSearchShapeResults = false;
  }

  onShapeIconSearch(e) {
    this.showSearchShapeResults = true;
    this.searchShapeIconKeyword = e.target.value.trim().toLowerCase();
    for (let i = 0; i < this.availableShapeTypes.length; i++) {
      if (this.searchShapeIconKeyword.length) {
        this.availableShapeTypes[i].hide = this.availableShapeTypes[i].name.toLowerCase().startsWith(this.searchShapeIconKeyword) ? null : true;
      }
      else {
        this.availableShapeTypes[i].hide = null;
      }
    }
  }

  onToggleSearchResults() {
    this.showSearchShapeResults = !this.showSearchShapeResults;
  }

  onShapeIconKeywordSearch() {
    this.shapeKeywordSearchEl.nativeElement.dispatchEvent(new Event('keyup'));
  }

  onSelectShapeImages() {
    this.shapeImportFileEl.nativeElement.value = null;
    this.shapeImportFileEl.nativeElement.click();
  }

  appendDefaultShapes(name, blob: Blob) {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      this.availableShapeTypes.push({
        id: null,
        name: name,
        image: fileReader.result,
        temporary: true
      });
    }
    fileReader.readAsDataURL(blob);
  }

  onShapeImportProcess(event) {
    if (event.target.files) {
      let allowed_max_size = 2 * 1024 * 1024//2mb;
      let total_files = event.target.files.length;
      for (let i = 0; i < total_files; i++) {
        if (event.target.files[i].size > allowed_max_size) {
          this.toastCtrl.info(event.target.files[i] + ' exceeds 2mb limit');
        }
        else {
          let fileReader = new FileReader();
          fileReader.onload = () => {
            let file_name = event.target.files[i].name.split('.').slice(0, -1).join('.');
            this.availableShapeTypes.push({
              id: null,
              name: file_name,
              image: fileReader.result,
              temporary: true
            });

            this.showSearchShapeResults = true;
          }

          fileReader.readAsDataURL(event.target.files[i]);
        }
      }
    }
  }

  onCloseColorPicker(type, overwrite = false) {
    switch (type) {
      case 'shape_type':
        if (overwrite) {
          this.shapeTypeColor = this.shapeTypePrevColor;
          // this.form.controls.shape_type_color.patchValue(this.shapeTypeColor);
        }

        this.showShapeColorPicker = false;
        break;
      case 'shape_type_text':
        if (overwrite) {
          this.shapeTypeTextColor = this.shapeTypeTextPrevColor;
          // this.form.controls.shape_type_text_color.patchValue(this.shapeTypeTextColor);
        }

        this.showShapeTextColorPicker = false;
        break;
      case 'shape_type_border':
        if (overwrite) {
          this.shapeTypeBorderColor = this.shapeTypeBorderPrevColor;
          // this.form.controls.shape_type_border_color.patchValue(this.shapeTypeBorderColor);
        }

        this.showShapeBorderPicker = false;
        break;
    }
  }

  onColorPickerChange(type, is_open) {
    if (!is_open) {
      this.onCloseColorPicker(type, true);
    }
  }

  onShowShapeIcons() {
    this.showSearchShapeResults = true;
  }

  onDeleteShapeTypeImage(item, index) {
    if (item.id && item.id != 'temporary') {
      this.deletedShapeTypeIds.push(item.id);
    }
    this.availableShapeTypes.splice(index, 1);
  }

  checkShapeImageSelected(item): boolean {
    return (item.id && item.id == this.selectedShapeTypeImage) || (item.is_default && item.image == this.selectedShapeTypeImage);
  }

  onShowColorPicker(type) {
    switch (type) {
      case 'shape_type':
        this.showShapeColorPicker = true;
        break;
      case 'shape_type_text':
        this.showShapeTextColorPicker = true;
        break;
      case 'shape_type_border':
        this.showShapeBorderPicker = true;
        break;
    }
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
