import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import {
  mxOutline
} from 'mxgraph/javascript/mxClient';

import { EditorPageLayoutService } from './editor-layout.service';

@Component({
  selector: 'outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss']
})
export class OutlineComponent {
  constructor(
    private editorPageLayoutSvc: EditorPageLayoutService,
  ) { }

  @ViewChild('outline') outlineEl: ElementRef;

  private _graph;

  @Input('graph') set graph(value) {
    this._graph = value;
    if (this._graph) {
      var outline = new mxOutline(this._graph);
      outline.border = 20;

      outline.init(this.outlineEl.nativeElement);

      this.editorPageLayoutSvc.setupPageBackground(outline.outline);

      // force initial background refresh...
      outline.outline.view.validateBackground();
    }
  }

  @Input('outlineVisible') outlineVisible;
  @Output('outlineVisibleChange') outlineVisibleEmit = new EventEmitter();

}
