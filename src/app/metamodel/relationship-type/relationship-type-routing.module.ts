import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RelationshipTypeComponent } from './relationship-type.component';
import { RelationshipTypeFormComponent } from './relationship-type-form/relationship-type-form.component';

const routes: Routes = [
  {
    path: '',
    component: RelationshipTypeComponent
  },
  {
    path: 'add',
    component: RelationshipTypeFormComponent
  },
  {
    path: ':id/edit',
    component: RelationshipTypeFormComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RelationshipTypeRoutingModule { }
