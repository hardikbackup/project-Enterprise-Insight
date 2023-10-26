import { Injectable, NgZone } from '@angular/core'
import { GraphComponent, GraphViewerInputMode } from 'yfiles';

@Injectable({
  providedIn: 'root'
})
export class GraphComponentService {
  private graphComponent!: GraphComponent

  constructor(private zone: NgZone) {

  }

  getGraphComponent() {
    if (!this.graphComponent) {
      this.zone.runOutsideAngular(() => {
        this.graphComponent = new GraphComponent()
        this.graphComponent.inputMode = new GraphViewerInputMode()
      })
    }
    return this.graphComponent
  }
}
