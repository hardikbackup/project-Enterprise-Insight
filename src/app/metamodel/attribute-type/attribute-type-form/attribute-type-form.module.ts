import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AttributeTypeFormComponent } from './attribute-type-form.component';


@NgModule({
  declarations: [AttributeTypeFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    NgSelectModule
  ]
})
export class AttributeTypeFormModule { }
