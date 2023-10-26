import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserGroupsComponent } from './user-groups.component';
import { UserGroupFormComponent } from './user-group-form/user-group-form.component';

const routes: Routes = [
  {
    path: '',
    component: UserGroupsComponent
  },
  {
    path: 'add',
    component: UserGroupFormComponent
  },
  {
    path: ':id/edit',
    component: UserGroupFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserGroupsRoutingModule { }
