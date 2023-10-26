import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output } from '@angular/core';
import { distinctUntilChanged, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[resizable_row_height]',
})
export class TableRowHeightResizeDirective {
  @Output() readonly resizable_row_height = fromEvent<MouseEvent>(
      this.elementRef.nativeElement,
      'mousedown'
  ).pipe(
      tap((e) => e.preventDefault()),
      switchMap(() => {
        const closest_td = this.elementRef.nativeElement.closest('td');
        const { height, bottom } = closest_td!.getBoundingClientRect();

        return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
            // map(({ clientY }) => height + clientY - bottom),
            map(({ clientY }) => {
              return {
                'height' : height + clientY - bottom,
              }
            }),
            distinctUntilChanged(),
            takeUntil(fromEvent(this.documentRef, 'mouseup')),
            finalize(() => {
              fromEvent(this.documentRef, 'mouseup')
                console.log('emitting event');
                this.elementRef.nativeElement.dispatchEvent(new Event('resizable_row_process'));
                // closest_th.classList.remove('active-resize-th')
            })
        );
      })
  );

  constructor(
      @Inject(DOCUMENT) private readonly documentRef: Document,
      @Inject(ElementRef)
      private readonly elementRef: ElementRef<HTMLElement>
  ) {}
}
