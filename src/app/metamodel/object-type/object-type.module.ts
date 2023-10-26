import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectTypeRoutingModule } from './object-type-routing.module';
import { ObjectTypeComponent } from './object-type.component';
import { SharedModule } from '../../shared/shared.module';
import { ObjectTypeFormModule } from './object-type-form/object-type-form.module';

@NgModule({
  declarations: [ObjectTypeComponent],
  imports: [
    CommonModule,
    ObjectTypeRoutingModule,
    SharedModule,
    ObjectTypeFormModule
  ]
})
export class ObjectTypeModule { }
