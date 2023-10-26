import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    private eventActivePage = new Subject<any>();
    private headerToggleSubject = new Subject<any>();

    getPageObservable(): Subject<any> {
        return this.eventActivePage;
    }

    onPageChange(page) {
        this.eventActivePage.next(page);
    }

    getHeaderChangeObservable(): Subject<any> {
        return this.headerToggleSubject;
    }

    onHeaderChange(data) {
        this.headerToggleSubject.next(data);
    }
}
