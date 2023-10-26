import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewModelComponent } from './view-model.component';
import { ObjectRelationshipTreeComponent } from './object-relationship-tree/object-relationship-tree.component';
import { ModelObjectTreeComponent } from './model-object-tree/model-object-tree.component';
import { SharedModule } from '../../shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableColumnResizeDirective } from './directives/table-column-resize.directive';
import { TableCellHeightResizeDirective } from './directives/table-cell-height-resize.directive';
import { TableRowHeightResizeDirective } from './directives/table-row-height-resize.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { BoxViewComponent } from './view-generation/box-view/box-view.component';
import { HierarchyViewComponent } from './view-generation/hierarchy-view/hierarchy-view.component';
import { LeftSidebarResizeDirective } from './directives/left-sidebar-resize.directive';
import { VariousTextComponent } from './elements/various-text/various-text.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
    declarations: [
        ViewModelComponent,
        ObjectRelationshipTreeComponent,
        ModelObjectTreeComponent,
        TableColumnResizeDirective,
        TableCellHeightResizeDirective,
        TableRowHeightResizeDirective,
        BoxViewComponent,
        HierarchyViewComponent,
        LeftSidebarResizeDirective,
        VariousTextComponent,
    ],
    exports: [
        ViewModelComponent,
        BoxViewComponent,
        HierarchyViewComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        NgSelectModule,
        DragDropModule,
        NgbModule,
        NgxMaskModule.forRoot()
    ]
})
export class ViewModelModule { }
