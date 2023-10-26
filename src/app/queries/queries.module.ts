import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueriesRoutingModule } from './queries-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QueriesComponent } from './queries.component';
import { QueriesFormModule } from './queries-form/queries-form.module';


@NgModule({
  declarations: [
    QueriesComponent
  ],
  imports: [
    CommonModule,
    QueriesRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule,
    QueriesFormModule
  ]
})
export class QueriesModule { }
