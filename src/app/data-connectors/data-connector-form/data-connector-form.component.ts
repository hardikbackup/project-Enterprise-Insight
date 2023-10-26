import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { EventsService } from '../../shared/EventService';
import { DataConnectorsService } from '../data-connectors.service';

@Component({
  selector: 'app-data-connector-form',
  templateUrl: './data-connector-form.component.html',
  styleUrls: ['./data-connector-form.component.css']
})
export class DataConnectorFormComponent {
  loggedInUser: any;
  form: UntypedFormGroup;
  hasFormSubmitted: boolean;
  connectorId: string;
  firstLoad: boolean;
  isLoading: boolean;
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private dataConnectorService: DataConnectorsService,
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.eventsService.onPageChange({ section : 'model', page : 'data-connectors' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.firstLoad = false;
    this.hasFormSubmitted = false;
    this.isLoading = false;
    this.connectorId = '';

    /**Build Form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      client_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      client_secret: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      object_permission: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      relationship_permission: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      attribute_permission: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      model_permission: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Group Details*/
        this.connectorId = paramMap.get('id');
        this.dataConnectorService.connectorDetails(this.loggedInUser['login_key'], this.connectorId).subscribe(data => {
          if (data.status) {
            this.form.controls.name.patchValue(data.connector.name);
            this.form.controls.client_id.patchValue(data.connector.client_id);
            this.form.controls.client_secret.patchValue(data.connector.client_secret);
            this.form.controls.object_permission.patchValue(data.connector.object_permission);
            this.form.controls.relationship_permission.patchValue(data.connector.object_permission);
            this.form.controls.attribute_permission.patchValue(data.connector.object_permission);
            this.form.controls.model_permission.patchValue(data.connector.object_permission);
            this.firstLoad = true;
          }
          else{
            this.toastCtrl.error(data.error);
            this.router.navigateByUrl('data-connectors');
          }
        });
      }
      else{
        this.form.controls.permission.patchValue('read');
      }

      this.loggedInUser = this.authService.getLoggedInUserObject();
    })
  }

  onDataConnectorSave() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      this.isLoading = true;

      /**Update Form*/
      if (this.connectorId) {
        this.dataConnectorService.updateConnector(this.loggedInUser['login_key'], this.connectorId, this.form.value, false).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to users*/
            this.toastCtrl.success('Data connector updated successfully');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.dataConnectorService.addConnector(this.loggedInUser['login_key'], this.form.value).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Data connector created successfully');
            this.router.navigateByUrl('data-connectors');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
    }
  }
}
