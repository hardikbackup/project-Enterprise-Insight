import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGroupsRoutingModule } from './user-groups-routing.module';
import { UserGroupsComponent } from './user-groups.component';
import { SharedModule } from '../../shared/shared.module';
import { UserGroupFormModule } from './user-group-form/user-group-form.module';

@NgModule({
  declarations: [UserGroupsComponent],
  imports: [
    CommonModule,
    UserGroupsRoutingModule,
    UserGroupFormModule,
    SharedModule
  ]
})
export class UserGroupsModule { }
