import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetamodelManagerComponent } from './metamodel-manager.component';
import { MetamodelManagerFormComponent } from './metamodel-manager-form/metamodel-manager-form.component';

const routes: Routes = [
  {
    path: '',
    component: MetamodelManagerComponent
  },
  {
    path: 'add',
    component: MetamodelManagerFormComponent
  },
  {
    path: ':id/edit',
    component: MetamodelManagerFormComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MetamodelManagerRoutingModule { }
