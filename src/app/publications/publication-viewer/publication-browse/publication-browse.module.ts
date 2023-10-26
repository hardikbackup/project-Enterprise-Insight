import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationBrowseComponent } from './publication-browse.component';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';
import {DiagramViewerModule} from '../../diagram-viewer/diagram-viewer.module';
import { ViewModelModule } from 'src/app/model/view-model/view-model.module';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
      PublicationBrowseComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    DiagramViewerModule,
    ViewModelModule ,
    NgbPopover
  ]
})
export class PublicationBrowseModule { }
