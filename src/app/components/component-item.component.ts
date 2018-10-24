import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import {
  mxCell,
  mxEvent,
  mxGeometry,
  mxUtils,
} from 'mxgraph/javascript/mxClient';

@Component({
  selector: 'component-item',
  templateUrl: './component-item.component.html',
  styleUrls: ['./component-item.component.scss']
})
export class ComponentItemComponent implements AfterViewInit {
  @ViewChild('component') componentEl: ElementRef;

  @Input('item') item;
  @Input('graph') graph;

  width: number = 220;
  height: number = 85;

  ngAfterViewInit() {
    var dragSource = mxUtils.makeDraggable(this.componentEl.nativeElement, this.graph,
      this.onDragSuccess,
      this.createDragPreview(this.width, this.height),
      0, 0,
      this.graph.autoscroll,
      true, true
    );
  }
  createDragPreview(width, height) {
    var elt = document.createElement('div');
    elt.style.border = '1px dashed black';
    elt.style.width = width + 'px';
    elt.style.height = height + 'px';

    return elt;
  }

  onDragSuccess = (graph, evt, target, x, y) => {
    let elt = mxEvent.getSource(evt);
    console.log(elt);

    var value = this.item.label;
    var cells = [new mxCell(value, new mxGeometry(0, 0, this.width, this.height))];
    cells[0].vertex = true;

    graph.model.beginUpdate();
    try {
      x = Math.round(x);
      y = Math.round(y);

      var select = graph.importCells(cells, x, y, target);
    } finally {
      graph.model.endUpdate();
    }
    mxEvent.consume(evt);
  }

}
