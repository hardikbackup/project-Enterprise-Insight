import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataConnectorFormComponent } from './data-connector-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    DataConnectorFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class DataConnectorFormModule { }
