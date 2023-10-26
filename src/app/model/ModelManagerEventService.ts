import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModelManagerEventService {
    private modelCheckedSubject = new Subject<any>();
    private modelReloadChildSubject = new Subject<any>();
    private modelNewFolderSubject = new Subject<any>();
    private modelNewObjectSubject = new Subject<any>();
    private modelNewModelSubject = new Subject<any>();
    private modelModelFolderDeletedSubject = new Subject<any>();
    private modelItemDeleteSubject = new Subject<any>();
    private modelFolderViewSelectedFolderSubject = new Subject<any>();
    private modelFolderDragDroppedSubject = new Subject<any>();
    private modelFolderChildDragDropSubject = new Subject<any>();
    private modelFolderExpandOptionsSubject = new Subject<any>();
    private modelFolderCopyOptionsSubject = new Subject<any>();
    // private modelFolderRenameSubject = new Subject<any>();
    private modelFolderDragRootSubject = new Subject<any>();
    private modelAllReSelectItemsSubject=new Subject<any>();

    /**Checked Items*/
    getModelTreeCheckedObservable(): Subject<any> { return this.modelCheckedSubject; }
    onModelTreeCheckedItem(page) { this.modelCheckedSubject.next(page);}

    /**On child reload page when new folder/model/object added*/
    getModelManagerReloadChildObservable(): Subject<any> { return this.modelReloadChildSubject; }
    onModelManagerReloadChild(data) { this.modelReloadChildSubject.next(data);}

    /**On child open folder modal*/
    getModelNewFolderObservable(): Subject<any> { return this.modelNewFolderSubject; }
    onModelNewFolder(data) { this.modelNewFolderSubject.next(data); }

    /**On child delete model or folder*/
    getModelItemDeletedObservable(): Subject<any> { return this.modelItemDeleteSubject; }
    onChildItemDelete(data) { this.modelItemDeleteSubject.next(data); }
    //
    // /**On model open object modal*/
    getModelNewObjectObservable(): Subject<any> { return this.modelNewObjectSubject; }
    onModelNewObject(data) { this.modelNewObjectSubject.next(data); }

    /**On model/folder open model modal*/
    getModelFolderNewModelObservable(): Subject<any> { return this.modelNewModelSubject; }
    onModelNewModel(data) { this.modelNewModelSubject.next(data); }

    /**On model/folder deleted items, update generated pages*/
    getModelFolderDeletedObservable(): Subject<any> { return this.modelModelFolderDeletedSubject; }
    onModelFolderDeleted(data) { this.modelModelFolderDeletedSubject.next(data); }

    /**On folder view folder select*/
    getModelFolderViewSelectedFolderObservable(): Subject<any> { return this.modelFolderViewSelectedFolderSubject; }
    onModelFolderViewSelectedFolder(data) { this.modelFolderViewSelectedFolderSubject.next(data); }

    /**On drag drop event*/
    getModelFolderDragDroppedObservable(): Subject<any> { return this.modelFolderDragDroppedSubject; }
    onModelFolderDragDropped(data) { this.modelFolderDragDroppedSubject.next(data); }
    //
    getModelFolderChildDragDropObservable(): Subject<any> { return this.modelFolderChildDragDropSubject; }
    onModelFolderChildDragDrop(data) { this.modelFolderChildDragDropSubject.next(data); }

    getModelFolderExpandOptionsObservable(): Subject<any> { return this.modelFolderExpandOptionsSubject; }
    onModelFolderExpandOptionsObservable(data) { this.modelFolderExpandOptionsSubject.next(data); }

    getModelFolderCopyOptionsObservable(): Subject<any> { return this.modelFolderCopyOptionsSubject; }
    onModelFolderCopyOptions(data) { this.modelFolderCopyOptionsSubject.next(data); }

    getModelFolderDragRootObservable(): Subject<any> { return this.modelFolderDragRootSubject; }
    onModelFolderDragRoot(data) { this.modelFolderDragRootSubject.next(data); }

    // all selected items
    getAllReSelectedItemsObservable(): Subject<any> { return this.modelAllReSelectItemsSubject; }
    reSelectedItems(data) { this.modelAllReSelectItemsSubject.next(data);}
}
