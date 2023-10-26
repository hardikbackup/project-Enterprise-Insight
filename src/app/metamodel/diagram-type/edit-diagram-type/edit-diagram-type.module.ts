import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditDiagramTypeComponent } from './edit-diagram-type.component';
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';

@NgModule({
  declarations: [
    EditDiagramTypeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    ReactiveFormsModule,
    NgxFileDropModule,
    FormsModule
  ]
})
export class EditDiagramTypeModule { }
