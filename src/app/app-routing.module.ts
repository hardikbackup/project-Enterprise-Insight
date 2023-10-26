import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  { path: 'metamodel', loadChildren: () => import('./metamodel/metamodel.module').then(m => m.MetamodelModule), canActivate: [AuthGuard] },
  { path: 'publications', loadChildren: () => import('./publications/publications.module').then(m => m.PublicationsModule), canActivate: [AuthGuard] },
  { path: 'administration', loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule), canActivate: [AuthGuard] },
  { path: 'model', loadChildren: () => import('./model/model.module').then(m => m.ModelModule), canActivate: [AuthGuard] },
  { path: 'data-connectors', loadChildren: () => import('./data-connectors/data-connectors.module').then(m => m.DataConnectorsModule), canActivate: [AuthGuard] },
  { path: 'queries', loadChildren: () => import('./queries/queries.module').then(m => m.QueriesModule), canActivate: [AuthGuard] },
  { path: 'public', loadChildren: () => import('./public/public.module').then(m => m.PublicModule)}
];

@NgModule({
  imports: [
      RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
