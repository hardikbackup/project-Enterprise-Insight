import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationsFormComponent } from './publications-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
      PublicationsFormComponent
  ],
  imports: [
      CommonModule,
      ReactiveFormsModule,
      RouterModule,
      SharedModule,
      NgSelectModule
  ]
})
export class PublicationsFormModule { }
