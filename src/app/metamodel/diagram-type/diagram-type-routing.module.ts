import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiagramTypeComponent } from "./diagram-type.component";
import { EditDiagramTypeComponent } from "./edit-diagram-type/edit-diagram-type.component";

const routes: Routes = [
  {
    path: '',
    component: DiagramTypeComponent
  },
  {
    path:'add',
    component:EditDiagramTypeComponent
  },
  {
    path: ':id/edit',
    component: EditDiagramTypeComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiagramTypeRoutingModule { }
