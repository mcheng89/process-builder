import { Component, Input, ElementRef } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

import {
  mxEvent,
  mxImage,
  mxUtils,
} from 'mxgraph/javascript/mxClient';

import { Base64 } from 'js-base64';

@Component({
  selector: 'hover-icons',
  templateUrl: './hover-icons.component.html',
  styleUrls: ['./hover-icons.component.scss']
})
export class HoverIconsComponent {
  constructor(private elRef: ElementRef, private sanitizer: DomSanitizer) {}

  private _graph;
  @Input('graph') set graph(value) {
    this._graph = value;
    if (this._graph) {
      this.registerListeners();
    }
  }

  selectedCell = null;
  dragArrow = false;
  private x;
  private y = 0;
  private w;
  private h;
  private scale;

  registerListeners() {
    // Captures mouse events as events on graph
    // const arrows = this.elRef.nativeElement.childNodes;
    // Implements a listener for hover and click handling
	  mxEvent.addGestureListeners(window, (event) => {
      const target = event.target;
      if (target.className == "arrow") {
        console.log(target);
        this.dragArrow = true;

        const mouseDownPoint = mxUtils.convertPoint(this._graph.container,
          mxEvent.getClientX(event), mxEvent.getClientY(event));
        console.log(this.selectedCell, mouseDownPoint);
        const currentState = this._graph.view.getState(this.selectedCell);
        this._graph.connectionHandler.start(currentState, currentState.x + currentState.width/2, currentState.y + currentState.height/2);
        this._graph.isMouseDown = true;
      }
    }, () => {
      if (this.dragArrow) {
        console.log("dragging");
      }
    }, () => {
      if (this.dragArrow) {
        console.log("drag end");
        this.dragArrow = false;
      }
    });

    this._graph.model.addListener(mxEvent.CHANGE, this.refreshIcons);
    this._graph.view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.refreshIcons);
	  this._graph.view.addListener(mxEvent.TRANSLATE, this.refreshIcons);
    // scale change
    this._graph.view.addListener(mxEvent.SCALE, this.refreshIcons);
    // selection changed
    this._graph.selectionModel.addListener(mxEvent.CHANGE, this.refreshIcons);
  }

  refreshIcons = () => {
    const cells = this._graph.getSelectionCells();
    console.log(cells);
    if (cells.length == 1 && this._graph.model.isVertex(cells[0])) {
      const translateX = this._graph.view.translate.x;
      const translateY = this._graph.view.translate.y;

      const cell = cells[0].geometry;
      this.x = cell.x + translateX;
      this.y = cell.y + translateY;
      this.w = cell.width;
      this.h = cell.height;
      this.scale = this._graph.view.scale;

      this.selectedCell = cells[0];
    } else {
      this.selectedCell = null;
    }
  };

  arrowFill = '#29b6f2';
  arrowPadding = 3;
  triangleUp = this.createSvgImage(18, 28, '<path d="m 6 26 L 12 26 L 12 12 L 18 12 L 9 1 L 1 12 L 6 12 z" ' +
    'stroke="#fff" fill="' + this.arrowFill + '"/>');
  triangleDown = this.createSvgImage(18, 26, '<path d="m 6 1 L 6 14 L 1 14 L 9 26 L 18 14 L 12 14 L 12 1 z" ' +
    'stroke="#fff" fill="' + this.arrowFill + '"/>');
  triangleRight = this.createSvgImage(26, 18, '<path d="m 1 6 L 14 6 L 14 1 L 26 9 L 14 18 L 14 12 L 1 12 z" ' +
    'stroke="#fff" fill="' + this.arrowFill + '"/>');
  triangleLeft = this.createSvgImage(28, 18, '<path d="m 1 9 L 12 1 L 12 6 L 26 6 L 26 12 L 12 12 L 12 18 z" ' +
    'stroke="#fff" fill="' + this.arrowFill + '"/>');
  
  /**
   * Helper function (requires atob).
   */
  createSvgImage(w, h, data) {
    var tmp = unescape(encodeURIComponent(
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + w + 'px" height="' + h + 'px" ' +
      'version="1.1">' + data + '</svg>'));
    return new mxImage('data:image/svg+xml;base64,' + ((window.btoa) ? btoa(tmp) : Base64.encode(tmp, true)), w, h);
  }
  imageSrc(img) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(img.src);
  }
}
