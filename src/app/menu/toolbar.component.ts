import { Component, Input } from '@angular/core';

import { EditorComponent } from '../editor/editor.component';

import {
  mxEvent,
} from 'mxgraph/javascript/mxClient';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  private _graph: any;
  private zoomPercent: string = '100%';

  @Input('editor') editor: EditorComponent;
  @Input('graph') set graph(value) {
    this._graph = value;
    if (this._graph) {
      this._graph.view.addListener(mxEvent.EVENT_SCALE, this.onZoomChange);
    }
  }

  onZoomChange = () => {
    this.zoomPercent = Math.round(this._graph.view.scale * 100) + '%';
  }
  zoomIn = () => {
    this._graph.zoomIn();
  }
  zoomOut = () => {
    this._graph.zoomOut();
  }
  zoomTo = (item) => {
    this._graph.zoomTo(item.scale);
  }
  resetView = () => {
    this._graph.zoomTo(1);
		this.editor.resetScrollbars();
  }
}
