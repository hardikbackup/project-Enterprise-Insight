import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueriesFormComponent } from './queries-form.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
      QueriesFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class QueriesFormModule { }
