import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetamodelManagerFormComponent } from './metamodel-manager-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
      MetamodelManagerFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule
  ]
})
export class MetamodelManagerFormModule { }
