import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttributeTypeRoutingModule } from './attribute-type-routing.module';
import { AttributeTypeComponent } from './attribute-type.component';
import { SharedModule } from '../../shared/shared.module';
import { AttributeTypeFormModule } from './attribute-type-form/attribute-type-form.module';

@NgModule({
  declarations: [AttributeTypeComponent],
  imports: [
    CommonModule,
    AttributeTypeRoutingModule,
    SharedModule,
    AttributeTypeFormModule
  ]
})
export class AttributeTypeModule { }
