import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttributeTypeComponent } from './attribute-type.component';
import { AttributeTypeFormComponent } from './attribute-type-form/attribute-type-form.component';

const routes: Routes = [
  {
    path: '',
    component: AttributeTypeComponent
  },
  {
    path: 'add',
    component: AttributeTypeFormComponent
  },
  {
    path: ':id/edit',
    component: AttributeTypeFormComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttributeTypeRoutingModule { }
