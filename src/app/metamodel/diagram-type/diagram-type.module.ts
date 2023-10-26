import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramTypeRoutingModule } from './diagram-type-routing.module';
import { DiagramTypeComponent } from './diagram-type.component';
import { SharedModule } from '../../shared/shared.module';
import { EditDiagramTypeModule } from "./edit-diagram-type/edit-diagram-type.module";
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DiagramTypeComponent
  ],
  imports: [
    CommonModule,
    DiagramTypeRoutingModule,
    SharedModule,
    EditDiagramTypeModule,
    ReactiveFormsModule
  ]
})
export class DiagramTypeModule { }
