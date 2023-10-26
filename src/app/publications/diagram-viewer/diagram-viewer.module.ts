import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramViewerComponent } from './diagram-viewer.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [DiagramViewerComponent],
  exports: [
    DiagramViewerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ]
})
export class DiagramViewerModule { }
