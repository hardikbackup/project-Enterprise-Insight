import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterLayoutComponent } from './master-layout/master-layout.component';
import { RouterModule } from '@angular/router';
import { DualListBoxComponent } from './dual-list-box/dual-list-box.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { RelationshipObjectSearchComponent } from '../metamodel/relationship-type/relationship-object-search/relationship-object-search.component';
import { HeaderComponent } from './header/header.component';
import { ModelManagerTreeComponent } from '../model/model-manager-tree/model-manager-tree.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        MasterLayoutComponent,
        DualListBoxComponent,
        BreadcrumbsComponent,
        RelationshipObjectSearchComponent,
        HeaderComponent,
        ModelManagerTreeComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        DragDropModule,
        NgSelectModule,
        ReactiveFormsModule
    ],
    exports: [
        MasterLayoutComponent,
        DualListBoxComponent,
        BreadcrumbsComponent,
        RelationshipObjectSearchComponent,
        HeaderComponent,
        ModelManagerTreeComponent
    ],
})
export class SharedModule { }
