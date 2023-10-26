import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelationshipTypeRoutingModule } from './relationship-type-routing.module';
import { RelationshipTypeComponent } from './relationship-type.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RelationshipTypeFormModule } from './relationship-type-form/relationship-type-form.module';

@NgModule({
  declarations: [RelationshipTypeComponent],
    exports: [

    ],
  imports: [
    CommonModule,
    RelationshipTypeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    RelationshipTypeFormModule
  ]
})
export class RelationshipTypeModule { }
