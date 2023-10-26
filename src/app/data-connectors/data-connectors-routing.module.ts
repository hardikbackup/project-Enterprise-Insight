import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataConnectorsComponent } from './data-connectors.component';
import { DataConnectorFormComponent } from './data-connector-form/data-connector-form.component';
import { ExcelComponent } from './excel/excel.component';

const routes: Routes = [
  {
    path: '',
    component: DataConnectorsComponent
  },
  {
    path: 'add',
    component: DataConnectorFormComponent
  },
  {
    path: ':id/edit',
    component: DataConnectorFormComponent
  },
  {
    path: 'excel',
    component: ExcelComponent
  },
  {
    path: 'excel/:id',
    component: ExcelComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataConnectorsRoutingModule {

}
