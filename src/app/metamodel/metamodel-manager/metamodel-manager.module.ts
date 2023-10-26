import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetamodelManagerRoutingModule } from './metamodel-manager-routing.module';
import { MetamodelManagerComponent } from './metamodel-manager.component';
import { SharedModule } from '../../shared/shared.module';
import { MetamodelManagerFormModule } from './metamodel-manager-form/metamodel-manager-form.module';

@NgModule({
  declarations: [
    MetamodelManagerComponent
  ],
  imports: [
    CommonModule,
    MetamodelManagerRoutingModule,
    SharedModule,
    MetamodelManagerFormModule
  ]
})
export class MetamodelManagerModule { }
