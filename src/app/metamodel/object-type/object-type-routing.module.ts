import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ObjectTypeComponent } from './object-type.component';
import { ObjectTypeFormComponent } from './object-type-form/object-type-form.component';

const routes: Routes = [
  {
    path: '',
    component: ObjectTypeComponent
  },
  {
    path: 'add',
    component: ObjectTypeFormComponent
  },
  {
    path: ':id/edit',
    component: ObjectTypeFormComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ObjectTypeRoutingModule { }
