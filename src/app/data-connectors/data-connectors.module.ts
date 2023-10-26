import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataConnectorsRoutingModule } from './data-connectors-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DataConnectorsComponent } from './data-connectors.component';
import { DataConnectorFormModule } from './data-connector-form/data-connector-form.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExcelModule } from './excel/excel.module';

@NgModule({
  declarations: [DataConnectorsComponent],
  imports: [
    CommonModule,
    DataConnectorsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    DataConnectorFormModule,
    ExcelModule,
    NgSelectModule
  ]
})
export class DataConnectorsModule { }
