import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../../shared/EventService';
import { AuthService } from '../../auth/auth.service';
import { SettingsService } from './settings.service';
import { ToastrService } from 'ngx-toastr';
import {AttributeTypeService} from '../../metamodel/attribute-type/attribute-type.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm: UntypedFormGroup;
  isLoading: boolean;
  loggedInUser: any;
  dateFormatOptions: any;
  dateSeparatorOptions: any;
  hasFormSubmitted: boolean;
  regions: any;
  currentActiveTab: string;
  isAdminSettings: boolean;
  currencyOptions: any;
  heatmapColor1: string;
  heatmapColor2: string;
  heatmapColor3: string;
  heatmapColor4: string;
  heatmapColor5: string;
  isShowHeatmapColor1: boolean;
  isShowHeatmapColor2: boolean;
  isShowHeatmapColor3 : boolean;
  isShowHeatmapColor4: boolean;
  isShowHeatmapColor5:boolean ;
  presetColors: any
  constructor(
      private router: Router,
      private eventsService: EventsService,
      private authService: AuthService,
      private settingsService: SettingsService,
      private toastCtrl: ToastrService,
      private attributeTypeService: AttributeTypeService
  ) {
    
   }

  ngOnInit(): void {
    this.heatmapColor1 = "#000000";
    this.heatmapColor2 = "#828282";
    this.heatmapColor3 = "#bdbdbd";
    this.heatmapColor4 = "#333333";
    this.heatmapColor5 = "#000000";
    this.presetColors = ["#333333", "#4f4f4f","#828282","#bdbdbd","#e0e0e0","#f2f2f2","#ea5857","#f29a4a", "#f2c94b","#239653", "#29ad61", "#6ecf97", "#2e80ed","#2d9bdb", "#55ccf2","#9a51e0","#b96bdc","#d595eb",];
    this.isLoading = false;
    this.hasFormSubmitted = false;
    this.eventsService.onPageChange({ section : 'administration', page : 'settings' });
    this.dateFormatOptions = this.settingsService.getDateFormatOptions();
    this.dateSeparatorOptions = this.settingsService.getDateSeparatorOptions();
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.currentActiveTab = 'global';
    this.regions = [
      {
        name: 'US',
        code: 'us'
      },
      {
        name: 'Europe',
        code: 'eu'
      }
    ];
    this.currencyOptions = this.attributeTypeService.getCurrencyOptions();
    this.isAdminSettings = false;
    this.settingsService.getSettings(this.loggedInUser['login_key']).subscribe((data:any) => {
      if (data.status) {
        this.isAdminSettings = data.is_administrator;
        /**Set user settings*/
          this.settingsForm = new UntypedFormGroup({
          user_diagram_new_tab: new UntypedFormControl(data.user_settings.diagram_new_tab),
          user_prompt_diagram_object_delete: new UntypedFormControl(data.user_settings.prompt_diagram_object_delete),
          user_prompt_diagram_reuse_objects: new UntypedFormControl(data.user_settings.prompt_diagram_reuse_objects),
          user_prompt_diagram_reuse_relationships: new UntypedFormControl(data.user_settings.prompt_diagram_reuse_relationships),
          user_model_viewer_pages: new UntypedFormControl(data.user_settings.model_viewer_pages,{
            updateOn: 'change',
            // validators: [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]
          }),
          // user_model_tree_viewer_pages: new UntypedFormControl(data.user_settings.model_tree_viewer_pages,{
          //   updateOn: 'change',
          //   validators: [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]
          // }),
          user_exit_behavior: new UntypedFormControl(data.user_settings.exit_behavior ? data.user_settings.exit_behavior : 'exit_tab'),
        });
        this.heatmapColor1 = data.publication_settings ? data.publication_settings.color_code_1 : this.heatmapColor1;
        this.heatmapColor2 = data.publication_settings ? data.publication_settings.color_code_2 : this.heatmapColor2;
        this.heatmapColor3 = data.publication_settings ? data.publication_settings.color_code_3 : this.heatmapColor3;
        this.heatmapColor4 = data.publication_settings ? data.publication_settings.color_code_4 : this.heatmapColor4;
        this.heatmapColor5 = data.publication_settings ? data.publication_settings.color_code_5 : this.heatmapColor5;
        /**Set Global Settings*/
        if (this.isAdminSettings) {
          let date_obj = data.global_settings.format.split(' ');
          this.settingsForm.addControl('global_date_format1',new UntypedFormControl(date_obj['0'],{
            updateOn: 'change',
          }));

          this.settingsForm.addControl('global_date_format2',new UntypedFormControl(date_obj['1'],{
            updateOn: 'change',
          }));

          this.settingsForm.addControl('global_date_format3',new UntypedFormControl(date_obj['2'],{
            updateOn: 'change',
          }));

          this.settingsForm.addControl('global_date_separator',new UntypedFormControl(data.global_settings.separator,{
            updateOn: 'change',
          }));

          this.settingsForm.addControl('global_model_viewer_pages',new UntypedFormControl(data.global_settings.model_viewer_pages,{
            updateOn: 'change',
             validators: [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]
          }));

          // this.settingsForm.addControl('global_model_tree_viewer_pages',new UntypedFormControl(data.global_settings.model_tree_viewer_pages,{
          //   updateOn: 'change',
          //   // validators: [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]
          // }));

          this.settingsForm.addControl('global_diagram_new_tab',new UntypedFormControl(data.global_settings.diagram_new_tab));
          this.settingsForm.addControl('global_prompt_diagram_object_delete',new UntypedFormControl(data.global_settings.prompt_diagram_object_delete));
          this.settingsForm.addControl('global_prompt_diagram_reuse_objects',new UntypedFormControl(data.global_settings.prompt_diagram_reuse_objects));
          this.settingsForm.addControl('global_prompt_diagram_reuse_relationships',new UntypedFormControl(data.global_settings.prompt_diagram_reuse_relationships));
          this.settingsForm.addControl('global_exit_behavior',new UntypedFormControl(data.global_settings.exit_behavior ? data.global_settings.exit_behavior : 'exit_tab'));
          this.settingsForm.addControl('global_region',new UntypedFormControl(data.global_settings.region));
          this.settingsForm.addControl('global_calculated_minutes',new UntypedFormControl(data.global_settings.calculated_minutes,{
            updateOn: 'change',
            // validators: [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]
          }));
          this.settingsForm.addControl('global_currency',new UntypedFormControl(data.global_settings.currency));
          this.settingsForm.addControl('refresh_token_validity',new UntypedFormControl(data.global_settings.refresh_token_validity===null?'':data.global_settings.refresh_token_validity
            ,{
            updateOn: 'change',
           validators: [Validators.required, Validators.pattern("^(?:[1-9]|[12][0-9]|30)$")]
          }));
          this.settingsForm.addControl('access_token_validity',new UntypedFormControl(data.global_settings.access_token_validity===null?'':data.global_settings.access_token_validity,{
          
           validators: [Validators.required, Validators.pattern("^(?:[1-9]|1[0-9]|2[0-4])$")]
          }));
          this.settingsForm.addControl('required_special_character',new UntypedFormControl(data.global_settings.required_special_character));
          this.settingsForm.addControl('required_number',new UntypedFormControl(data.global_settings.required_number));
          this.settingsForm.addControl('required_minimum_length',new UntypedFormControl(data.global_settings.required_minimum_length));
          this.settingsForm.addControl('password_length',new UntypedFormControl(data.global_settings.password_length,{
            updateOn: 'change',   
          }));
          this.settingsForm.addControl('required_capital_letter',new UntypedFormControl(data.global_settings.required_capital_letter));
        }
      }
      else{
        this.toastCtrl.error(data.error);
        this.router.navigateByUrl('dashboard');
      }
    });
  }


  onSettingsUpdate() {
    this.hasFormSubmitted = true;
    if (this.settingsForm.valid) {
      this.isLoading = true;
      /**Prepare settings data*/
      let settings = {
        user_settings: {
          diagram_new_tab: this.settingsForm.value.user_diagram_new_tab,
          model_viewer_pages: this.settingsForm.value.user_model_viewer_pages,
          model_tree_viewer_pages: this.settingsForm.value.model_tree_viewer_pages,
          exit_behavior:this.settingsForm.value.user_exit_behavior,
          prompt_diagram_object_delete: this.settingsForm.value.user_prompt_diagram_object_delete,
          prompt_diagram_reuse_objects: this.settingsForm.value.user_prompt_diagram_reuse_objects,
          prompt_diagram_reuse_relationships: this.settingsForm.value.user_prompt_diagram_reuse_relationships,
        },
        global_settings: {},
        publication_settings:{}
      }  

      if (this.isAdminSettings) {
        settings.global_settings = {
          format: this.settingsForm.value.global_date_format1 + ' ' + this.settingsForm.value.global_date_format2 + ' ' + this.settingsForm.value.global_date_format3,
          separator: this.settingsForm.value.global_date_separator,
          region: this.settingsForm.value.global_region,
          diagram_new_tab: this.settingsForm.value.global_diagram_new_tab,
          model_viewer_pages: this.settingsForm.value.global_model_viewer_pages,
          model_tree_viewer_pages: this.settingsForm.value.global_model_tree_viewer_pages,
          exit_behavior:this.settingsForm.value.global_exit_behavior,
          prompt_diagram_object_delete: this.settingsForm.value.global_prompt_diagram_object_delete,
          prompt_diagram_reuse_objects: this.settingsForm.value.global_prompt_diagram_reuse_objects,
          prompt_diagram_reuse_relationships: this.settingsForm.value.global_prompt_diagram_reuse_relationships,
          currency: this.settingsForm.value.global_currency,
          calculated_minutes: this.settingsForm.value.global_calculated_minutes,
          refresh_token_validity: this.settingsForm.value.refresh_token_validity,
          access_token_validity: this.settingsForm.value.access_token_validity,
          required_special_character: this.settingsForm.value.required_special_character,
          required_number: this.settingsForm.value.required_number,
          required_minimum_length:  this.settingsForm.value.required_minimum_length,
          password_length: this.settingsForm.value.password_length,
          required_capital_letter: this.settingsForm.value.required_capital_letter,
        }
       }
       settings.publication_settings = {
        color_code_1:this.heatmapColor1,
        color_code_2:this.heatmapColor2,
        color_code_3:this.heatmapColor3,
        color_code_4:this.heatmapColor4,
        color_code_5:this.heatmapColor5
       }

      this.settingsService.saveSettings(this.loggedInUser['login_key'], settings).subscribe(data => {
        this.isLoading = false;
        if (data.status) {
          this.toastCtrl.success('Settings successfully updated')
        }
        else{
          this.toastCtrl.error(data.error);
        }
      })
    }
  }

  onTabChange(type) {
    this.currentActiveTab = type;
  }
  onShowColorPicker(type) {
    switch (type) {
      case "heatmap_color1":
        this.isShowHeatmapColor1 = true;
        break;
      case "heatmap_color2":
        this.isShowHeatmapColor2 = true;
        break;
      case "heatmap_color3":
        this.isShowHeatmapColor3 = true;
        break;
      case "heatmap_color4":
        this.isShowHeatmapColor4 = true;
        break;
      case "heatmap_color5":
        this.isShowHeatmapColor5 = true;
        break;
    }
  }
}
