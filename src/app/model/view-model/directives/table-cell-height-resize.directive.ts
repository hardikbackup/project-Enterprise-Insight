import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output } from '@angular/core';
import { distinctUntilChanged, finalize, map, switchMap, take, takeLast, takeUntil, tap, timeout } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { ModelEventService } from '../ModelEventService';

@Directive({
  selector: '[resizable_cell_height]',
})
export class TableCellHeightResizeDirective {
  @Output()

  readonly resizable_cell_height = fromEvent<MouseEvent>(
      this.elementRef.nativeElement,
      'mousedown'
  ).pipe(
      tap((e) => e.preventDefault()),
      switchMap(() => {
        let latest_height;
        let latest_width;
        return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
            map(({ clientX, clientY }) => {
              latest_height = clientY;
              latest_width = clientX;
              return {
                'height' : clientY,
                'width' : clientX,
                'process' : false
              }
            }),
            distinctUntilChanged(),
            takeUntil(fromEvent(this.documentRef, 'mouseup')),
            finalize(() => {
              this.modelEventService.onModelViewInlineEditorPrefillCompleted({
                'height' : latest_height,
                'width' : latest_width,
                'process' : true
              });

              this.documentRef
                  .querySelectorAll('.attr-cell-prefill')
                  .forEach(element => element.classList.remove('inline-cell-lr','inline-cell-lrb'));
              fromEvent(this.documentRef, 'mouseup')
            })
        );
      })
  );

  constructor(
      @Inject(DOCUMENT) private readonly documentRef: Document,
      @Inject(ElementRef)
      private readonly elementRef: ElementRef<HTMLElement>,
      private modelEventService: ModelEventService
  ) {}
}
