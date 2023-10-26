import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { RelationshipTypeFormComponent } from './relationship-type-form.component';
import { ObjectTypeDiagramTypeSearchComponent } from './object-type-diagram-type-search/object-type-diagram-type-search.component';

@NgModule({
  declarations: [RelationshipTypeFormComponent, ObjectTypeDiagramTypeSearchComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class RelationshipTypeFormModule { }
