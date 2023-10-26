import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueriesComponent } from './queries.component';
import { QueriesFormComponent } from './queries-form/queries-form.component';

const routes: Routes = [
  {
    path: '',
    component: QueriesComponent
  },
  {
    path: 'add',
    component: QueriesFormComponent
  },
  {
    path: ':id/edit',
    component: QueriesFormComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QueriesRoutingModule { }
