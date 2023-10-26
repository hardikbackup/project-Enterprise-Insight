import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicationViewComponent } from './embedd/publication-view/publication-view.component';

const routes: Routes = [ {
  path: 'publications/embeded/:id/diagram/:diagramId',
  component: PublicationViewComponent
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
