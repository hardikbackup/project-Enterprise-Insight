import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { SharedModule } from '../../shared/shared.module';
import { UsersFormModule } from './users-form/users-form.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [UsersComponent],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    UsersFormModule,
    ReactiveFormsModule
  ]
})
export class UsersModule { }
