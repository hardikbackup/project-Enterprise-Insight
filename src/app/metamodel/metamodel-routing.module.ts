import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  { path: 'metamodel-manager', loadChildren: () => import('./metamodel-manager/metamodel-manager.module').then(m => m.MetamodelManagerModule) },
  { path: 'attribute-type', loadChildren: () => import('./attribute-type/attribute-type.module').then(m => m.AttributeTypeModule) },
  { path: 'object-type', loadChildren: () => import('./object-type/object-type.module').then(m => m.ObjectTypeModule) },
  { path: 'relationship-type', loadChildren: () => import('./relationship-type/relationship-type.module').then(m => m.RelationshipTypeModule) },
  { path: 'diagram-type', loadChildren: () => import('./diagram-type/diagram-type.module').then(m => m.DiagramTypeModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MetamodelRoutingModule { }
