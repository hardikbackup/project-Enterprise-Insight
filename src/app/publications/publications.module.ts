import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationsRoutingModule } from './publications-routing.module';
import { PublicationsComponent } from './publications.component';
import { SharedModule } from '../shared/shared.module';
import { PublicationsFormModule } from './publications-form/publications-form.module';
import { PublicationViewerComponent } from './publication-viewer/publication-viewer.component';
import { PublicationBrowseModule } from './publication-viewer/publication-browse/publication-browse.module';
import { RouterModule } from '@angular/router';
import  {DiagramViewerModule } from './diagram-viewer/diagram-viewer.module';

@NgModule({
  declarations: [
    PublicationsComponent,
    PublicationViewerComponent,
  ],
  imports: [
    CommonModule,
    PublicationsRoutingModule,
    PublicationsFormModule,
    PublicationBrowseModule,
    DiagramViewerModule,
    SharedModule,
    RouterModule
  ]
})
export class PublicationsModule { }
