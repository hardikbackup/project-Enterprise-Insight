import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModelRoutingModule } from './model-routing.module';
import { ModelComponent } from './model.component';
import { SharedModule } from '../shared/shared.module';
import { ViewModelModule } from './view-model/view-model.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling'

@NgModule({
    declarations: [
        ModelComponent
    ],
    exports: [

    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ModelRoutingModule,
        SharedModule,
        ViewModelModule,
        NgSelectModule,
        DragDropModule,
        ScrollingModule
    ]
})
export class ModelModule { }
