import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModelEventService {
    //Model View Editor
    private modelViewSelectedItemsSubject = new Subject<any>();
    private modelViewFolderSelectedSubject = new Subject<any>();
    private modelViewModelSelectedSubject = new Subject<any>();
    private modelViewModelClosedSubject = new Subject<any>();
    private modelViewObjectCreateForChildSubject = new Subject<any>();
    private modelViewTreeExpandedOptionsSubject = new Subject<any>();
    private modelViewTreeItemModelFolderMenuSubject = new Subject<any>();
    private modelViewInlineEditorObjectDeleteSubject = new Subject<any>();
    private modelViewTreeDragDropSubject = new Subject<any>();
    private modelViewTreeExpandSubject = new Subject<any>();
    private modelViewInlineEditorRowUncheckSubject = new Subject<any>();
    private modelViewObjectMxDragEditorSubject = new Subject<any>();
    private modelViewDiagramSelectedSubject = new Subject<any>();
    private modelViewNewDiagramCreatedSubject = new Subject<any>();
    private modelViewDiagramTypeDeletedSubject = new Subject<any>();
    private modelViewGeneratorSelectedSubject = new Subject<any>();
    private modelViewDiagramImportSubject = new Subject<any>();
    private modelObjectsCreatedFromMXSubject = new Subject<any>();
    private modelViewCopyPasteSubject = new Subject<any>();
    private modelViewDeleteObjectsSubject = new Subject<any>();
    private modelViewCurrentPageStateSubject = new Subject<any>();
    private modelObjectTypeCreateStateSubject = new Subject<any>();
    private modelViewChainItemSubject = new Subject<any>();
    private openRelationshipModalSubject = new Subject<any>();
    private modelViewChangeLogSubject = new Subject<any>();
    private modelObjectRenameSubject = new Subject<any>();
    private modelViewRelationshipsSubject = new Subject<any>();

    /**Model Selected Objects for Model View Page*/
    getModelViewViewSelectedObservable(): Subject<any> { return this.modelViewSelectedItemsSubject; }
    onModelViewSelectedItem(data) { this.modelViewSelectedItemsSubject.next(data); }

    /**Model Viewer Folder Selected*/
    getModelViewFolderSelectedObservable(): Subject<any> { return this.modelViewFolderSelectedSubject; }
    onModelViewFolderSelected(data) { this.modelViewFolderSelectedSubject.next(data); }

    /**Model Viewer Model Selected*/
    getModelViewModelSelectedObservable(): Subject<any> { return this.modelViewModelSelectedSubject; }
    onModelViewModelSelected(data) { this.modelViewModelSelectedSubject.next(data); }

    getModelViewModelClosedObservable(): Subject<any> { return this.modelViewModelClosedSubject; }
    onModelViewModelClose(data) { this.modelViewModelClosedSubject.next(data); }

    getModelViewObjectCreateForChildObservable(): Subject<any> { return this.modelViewObjectCreateForChildSubject; }
    onModelViewObjectCreateForChild(data) { this.modelViewObjectCreateForChildSubject.next(data); }

    /**Model Viewer Prefill Completed*/
    getModelViewInlineEditorPrefillCompletedObservable(): Subject<any> { return this.modelViewObjectCreateForChildSubject; }
    onModelViewInlineEditorPrefillCompleted(data) { this.modelViewObjectCreateForChildSubject.next(data); }

    /**Model Viewer Tree Item Expanded*/
    getModelViewTreeItemExpandedObservable(): Subject<any> { return this.modelViewTreeExpandedOptionsSubject; }
    onModelViewTreeItemExpanded(data) { this.modelViewTreeExpandedOptionsSubject.next(data); }

    /**Model Viewer Folder Expanded*/
    getModelViewTreeItemModelFolderMenuObservable(): Subject<any> { return this.modelViewTreeItemModelFolderMenuSubject; }
    onModelViewTreeItemModelFolderMenuExpanded(data) { this.modelViewTreeItemModelFolderMenuSubject.next(data); }

    /**Model Viewer Inline Editor Object Delete*/
    getModelViewInlineEditorObjectDeleteObservable(): Subject<any> { return this.modelViewInlineEditorObjectDeleteSubject; }
    onModelViewInlineEditorObjectDelete(data) { this.modelViewInlineEditorObjectDeleteSubject.next(data); }

    /**Model Viewer Tree Menu Drag & Drop*/
    getModelViewTreeDragDropObservable(): Subject<any> { return this.modelViewTreeDragDropSubject; }

    /**Model Viewer Tree Menu Expand*/
    getModelViewTreeExpandObservable(): Subject<any> { return this.modelViewTreeExpandSubject; }
    onModelViewTreeExpanded(data) { this.modelViewTreeExpandSubject.next(data); }

    /**Model Viewer Inline Editor Active Row Uncheck*/
    getModelViewInlineEditorRowUncheckObservable(): Subject<any> { return this.modelViewInlineEditorRowUncheckSubject; }
    onModelViewInlineEditorRowUncheck(data) { this.modelViewInlineEditorRowUncheckSubject.next(data); }

    /**Model Viewer Object Moves to Editor*/
    getModelViewObjectDragEditorObservable(): Subject<any> { return this.modelViewObjectMxDragEditorSubject; }
    onModelViewObjectDragEditor(data) { this.modelViewObjectMxDragEditorSubject.next(data); }

    /**Model Viewer Diagram Select*/
    getModelViewDiagramSelectedObservable(): Subject<any> { return this.modelViewDiagramSelectedSubject; }
    onModelViewDiagramSelected(data) { this.modelViewDiagramSelectedSubject.next(data); }

    /**Model Viewer Generator Select*/
    getModelViewGeneratorSelectedObservable(): Subject<any> { return this.modelViewGeneratorSelectedSubject; }
    onModelViewGeneratorSelected(data) { this.modelViewGeneratorSelectedSubject.next(data); }

    /**Model Objects Created in Mx Editor, Update Tree View*/
    getModelObjectsCreatedFromMXObservable(): Subject<any> { return this.modelObjectsCreatedFromMXSubject; }
    onModelObjectsCreatedFromMX(data) { this.modelObjectsCreatedFromMXSubject.next(data); }

    /**Model Objects Created in Mx Editor, Update Tree View*/
    getModelViewNewDiagramObservable(): Subject<any> { return this.modelViewNewDiagramCreatedSubject; }
    onModelViewNewDiagramCreated(data) { this.modelViewNewDiagramCreatedSubject.next(data); }

    /**When Diagram Type Deleted and modal is open in Model Viewer, remove the selected diagram types from modal*/
    getModelViewDiagramTypeDeletedObservable(): Subject<any> { return this.modelViewDiagramTypeDeletedSubject; }
    onModelViewDiagramTypeDeletedSubject(data) { this.modelViewDiagramTypeDeletedSubject.next(data); }

    /**Model Folder Diagram Import*/
    getModelViewDiagramImportObservable(): Subject<any> { return this.modelViewDiagramImportSubject; }
    onModelViewDiagramImport(data) { this.modelViewDiagramImportSubject.next(data); }

    /**Copy & Paste Logic*/
    getModelViewCopyPasteObservable(): Subject<any> { return this.modelViewCopyPasteSubject; }
    onModelViewCopyPaste(data) { this.modelViewCopyPasteSubject.next(data); }

    /**Model View Delete Objects Update Interface*/
    getModelViewDeleteObjectObservable(): Subject<any> { return this.modelViewDeleteObjectsSubject; }
    onModelViewDeleteObject(data) { this.modelViewDeleteObjectsSubject.next(data); }

    /**Model View Current Page State*/
    getModelViewCurrentPageStateObservable(): Subject<any> { return this.modelViewCurrentPageStateSubject; }
    onModelViewCurrentPageStateChange(data) { this.modelViewCurrentPageStateSubject.next(data); }

    /**Model View Current Page State*/
    getModelObjectTypeCreateStateObservable(): Subject<any> { return this.modelObjectTypeCreateStateSubject; }
    onModelObjectTypeCreateState(data) { this.modelObjectTypeCreateStateSubject.next(data); }

    /**Model View Current Page State*/
    getModelViewChainItemObservable(): Subject<any> { return this.modelViewChainItemSubject; }
    onModelViewChainItem(data) { this.modelViewChainItemSubject.next(data); }

    /**On Create Relationship Modal*/
    getOpenRelationshipModalObservable(): Subject<any> { return this.openRelationshipModalSubject; }
    onOpenRelationshipModal(data) { this.openRelationshipModalSubject.next(data); }

    /**On Create Relationship Modal*/
    getModelViewChangeLogSubjectObservable(): Subject<any> { return this.modelViewChangeLogSubject; }
    onModelViewChangeLogSubjectModal(data) { this.modelViewChangeLogSubject.next(data); }

    /**On Folder & Object Rename*/
    getModelFolderObjectRenameSubjectObservable(): Subject<any> { return this.modelObjectRenameSubject; }
    onModelFolderObjectRename(data) { this.modelObjectRenameSubject.next(data); }

    /**Model View Relationships Reload*/
    getModelViewRelationshipsReloadObservable(): Subject<any> { return this.modelViewRelationshipsSubject; }
    onModelViewRelationshipsReload(data) { this.modelViewRelationshipsSubject.next(data); }


}
