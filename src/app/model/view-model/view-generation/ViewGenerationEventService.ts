import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ViewGenerationEventService {
    private boxViewBoxZoomSubject = new Subject<any>();
    private exportDiagramsSubject = new Subject<any>();
    private viewExportPositionsReceived = new Subject<any>();
    private viewGenerationLayoutType = new Subject<any>();

    /**Zoom Handles*/
    getViewGenerationBoxZoomChangeObservable(): Subject<any> { return this.boxViewBoxZoomSubject; }
    onViewGenerationBoxZoomChange(data) { this.boxViewBoxZoomSubject.next(data);}

    /**Export to Diagrams.net Handles*/
    getViewGenerationExportDiagramsObservable(): Subject<any> { return this.exportDiagramsSubject; }
    onViewGenerationExportDiagrams(data) { this.exportDiagramsSubject.next(data);}

    /**When objects positions received*/
    getViewExportPositionsReceivedObservable(): Subject<any> { return this.viewExportPositionsReceived; }
    onViewExportPositionsReceived(data) { this.viewExportPositionsReceived.next(data);}

    /**When layout of box changes left/right/bottom/top*/
    viewGenerationLayoutChangeObservable(): Subject<any> { return this.viewGenerationLayoutType; }
    onViewGenerationLayoutChange(data) { this.viewGenerationLayoutType.next(data);}
}
