import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output } from '@angular/core';
import { distinctUntilChanged, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[resizable]',
})
export class TableColumnResizeDirective {
    constructor(
        @Inject(DOCUMENT) private readonly documentRef: Document,
        @Inject(ElementRef)
        private readonly elementRef: ElementRef<HTMLElement>
    ) {

    }
  @Output() readonly resizable = fromEvent<MouseEvent>(
      this.elementRef.nativeElement,
      'mousedown'
  ).pipe(
      tap((e) => e.preventDefault()),
      switchMap(() => {
        const closest_th = this.elementRef.nativeElement.closest('th');
        const { width, right } = closest_th!.getBoundingClientRect();

        closest_th.classList.add('active-resize-th');

        return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
            map(({ clientX }) => width + clientX - right),
            distinctUntilChanged(),
            takeUntil(fromEvent(this.documentRef, 'mouseup')),
            finalize(() => {
                fromEvent(this.documentRef, 'mouseup')
                closest_th.classList.remove('active-resize-th')
                this.elementRef.nativeElement.dispatchEvent(new Event('col_resize_process'));
            })
        );
      })
  );
}
