import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { ObjectTypeFormComponent } from './object-type-form.component';


@NgModule({
  declarations: [ObjectTypeFormComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    ColorPickerModule
  ]
})
export class ObjectTypeFormModule { }
