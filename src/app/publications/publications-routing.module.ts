import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicationsComponent } from './publications.component';
import { PublicationsFormComponent } from './publications-form/publications-form.component';
import { PublicationViewerComponent } from './publication-viewer/publication-viewer.component';
import { PublicationBrowseComponent } from './publication-viewer/publication-browse/publication-browse.component';
import { DiagramViewerComponent } from './diagram-viewer/diagram-viewer.component';

const routes: Routes = [
  {
    path: '',
    component: PublicationsComponent
  },
  {
    path: 'add',
    component: PublicationsFormComponent
  },
  {
    path: ':id/edit',
    component: PublicationsFormComponent
  },
  {
    path: 'viewer',
    component: PublicationViewerComponent
  },
  {
    path: 'viewer/:id',
    component: PublicationBrowseComponent
  },
  {
    path: 'viewer/:id/diagram/:diagramId',
    component: PublicationBrowseComponent
  },
  {
    path: 'viewer/:id/view/:viewid',
    component: PublicationBrowseComponent
  },
  {
    path: 'viewer/view/:viewid',
    component: PublicationBrowseComponent
  },
  {
    path: 'diagram/:id',
    component: DiagramViewerComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicationsRoutingModule { }
