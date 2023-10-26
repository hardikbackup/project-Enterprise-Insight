import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelComponent } from './model.component';
import { ViewModelComponent } from './view-model/view-model.component';

const routes: Routes = [
  {
    path: '',
    component: ModelComponent
  },
  {
    path: ':id/:token/view',
    component: ViewModelComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelRoutingModule { }
