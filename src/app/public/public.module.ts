import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { PublicationViewComponent } from './embedd/publication-view/publication-view.component';
import { SharedModule } from '../shared/shared.module';
import { DiagramViewerModule } from '../publications/diagram-viewer/diagram-viewer.module';


@NgModule({
  declarations: [
    PublicationViewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DiagramViewerModule,
    PublicRoutingModule
  ]
})
export class PublicModule { }
