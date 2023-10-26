import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output } from '@angular/core';
import { distinctUntilChanged, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[left_sidebar_resizable]',
})
export class LeftSidebarResizeDirective {
  constructor(
      @Inject(DOCUMENT) private readonly documentRef: Document,
      @Inject(ElementRef)
      private readonly elementRef: ElementRef<HTMLElement>
  ) {

  }
  @Output()
  readonly left_sidebar_resizable = fromEvent<MouseEvent>(
      this.elementRef.nativeElement,
      'mousedown'
  ).pipe(
      tap((e) => e.preventDefault()),
      switchMap(() => {
        const closest_container = this.elementRef.nativeElement.closest('div');
        const { width, right } = closest_container!.getBoundingClientRect();
          closest_container.classList.add('active-resize-left-sidebar');
        return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
            map(({ clientX }) => width + clientX - right),
            distinctUntilChanged(),
            takeUntil(fromEvent(this.documentRef, 'mouseup')),
            finalize(() => {
              fromEvent(this.documentRef, 'mouseup')
                closest_container.classList.remove('active-resize-left-sidebar')
                closest_container.dispatchEvent(new Event('update_sidebar_width'));
            })
        );
      })
  );
}
