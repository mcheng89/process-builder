import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ComponentFactoryResolver, Injector, ApplicationRef } from '@angular/core';

import {
  mxConstants,
  mxEvent,
  mxGraph,
  mxGraphView,
  mxRectangle,
  mxRubberband,
  mxUtils,
  mxVertexHandler,
} from 'mxgraph/javascript/mxClient';

import { EditorPageLayoutService } from './editor-layout.service';
import { VertexComponent } from './vertex.component';

mxConstants.VERTEX_SELECTION_COLOR = '#00a8ff';
mxConstants.HANDLE_FILLCOLOR = '#29b6f2';
mxConstants.HANDLE_STROKECOLOR = '#0088cf';

mxGraph.prototype.pageScale = 1;
mxGraph.prototype.pageFormat = new mxRectangle(0, 0, 1000, 1000);

mxGraphView.prototype.gridSteps = 4;
mxGraphView.prototype.minGridSize = 4;
mxGraphView.prototype.graphBackground = '#f5f5f5';
mxGraphView.prototype.gridColor = '#dae4f9';

@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private applicationRef: ApplicationRef,
    private editorPageLayoutSvc: EditorPageLayoutService,
  ) { }

  @ViewChild('editor') editorEl: ElementRef;

  private graph: any;
  @Output('graph') graphEmit = new EventEmitter();

  ngAfterViewInit() {
    var self = this;

    let graph = new mxGraph();
    this.graph = graph;
    mxGraph.prototype.init.apply(graph, [this.editorEl.nativeElement]);

    // add selection...
    var rubberband = new mxRubberband(graph);

    // custom vertex rendering...
    let style = graph.getStylesheet().getDefaultVertexStyle();
    delete style[mxConstants.STYLE_STROKECOLOR];
    delete style[mxConstants.STYLE_FILLCOLOR];
    var graphGetLabel = graph.getLabel;
    mxGraph.prototype.getLabel = function (cell: any) {
      if (this.model.isVertex(cell)) {
        var container = document.createElement('div');
        const vertexComponent = self.componentFactoryResolver.resolveComponentFactory(VertexComponent);
        const componentRef = vertexComponent.create(self.injector, [], container);
        self.applicationRef.attachView(componentRef.hostView);
        componentRef.instance.component = cell.value;
        componentRef.instance.cell = cell;
        cell.componentRef = componentRef;

        container.style.height = (cell.geometry.height) + "px";
        container.style.width = (cell.geometry.width) + "px";
        container.className = "editor-vertex";
        return container;
      }
      return graphGetLabel.apply(this, arguments);
    }
    // min width/height settings
    var vertexHandlerUnion = mxVertexHandler.prototype.union;
    mxVertexHandler.prototype.union = function (bounds: any, dx: any, dy: any, index: any, gridEnabled: any, scale: any, tr: any) {
      var result = vertexHandlerUnion.apply(this, arguments);

      result.width = Math.max(result.width, VertexComponent.minWidth);
      result.height = Math.max(result.height, VertexComponent.minHeight);

      return result;
    }
    // disable editing of cells
    graph.isCellEditable = function (cell: any) {
      return false;
    };

    mxEvent.addListener(document, 'keydown', (e) => {
      if(e.keyCode == 46) {
        console.log('delete cells');
        // Cancels interactive operations
        graph.escape();
        var cells = graph.getDeletableCells(graph.getSelectionCells());
        if (cells != null && cells.length > 0) {
          graph.removeCells(cells, true);
        }
      }
    });

    // Changes the default style for edges
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_OVAL;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_STROKECOLOR] = '#686868';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;

    this.editorPageLayoutSvc.setupPageBackground(graph);
    this.listenGraphSizeChange();

    // force size refresh, then adjust initial scrollbar location
    graph.sizeDidChange();
    this.resetView();

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    var parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      var v1 = graph.insertVertex(parent, null, 'Load Oracle Table', 150, 80, VertexComponent.minWidth, VertexComponent.minHeight);
      var v2 = graph.insertVertex(parent, null, 'Pivot Records', 210, 260, VertexComponent.minWidth, VertexComponent.minHeight);
      var e1 = graph.insertEdge(parent, null, '', v1, v2);
    }
    finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    setTimeout(() => this.graphEmit.emit(graph), 1);
  }

  // adjust for padding & page sizes
  listenGraphSizeChange() {
    var graph = this.graph;

    mxEvent.addListener(window, 'resize', () => {
      graph.sizeDidChange();
    });

    var graphSizeDidChange = graph.sizeDidChange;
    graph.sizeDidChange = function () {
      if (this.container != null && mxUtils.hasScrollbars(this.container)) {
        var pages = this.getPageLayout();
        var pad = this.getPagePadding();
        var size = this.getPageSize();

        // Updates the minimum graph size
        var minw = Math.ceil(2 * pad.x + pages.width * size.width);
        var minh = Math.ceil(2 * pad.y + pages.height * size.height);

        var min = graph.minimumGraphSize;

        // LATER: Fix flicker of scrollbar size in IE quirks mode
        // after delayed call in window.resize event handler
        if (min == null || min.width != minw || min.height != minh) {
          graph.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
        }

        // Updates auto-translate to include padding and graph size
        var dx = pad.x - pages.x * size.width;
        var dy = pad.y - pages.y * size.height;

        if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
          this.autoTranslate = true;
          this.view.x0 = pages.x;
          this.view.y0 = pages.y;

          // NOTE: THIS INVOKES THIS METHOD AGAIN. UNFORTUNATELY THERE IS NO WAY AROUND THIS SINCE THE
          // BOUNDS ARE KNOWN AFTER THE VALIDATION AND SETTING THE TRANSLATE TRIGGERS A REVALIDATION.
          // SHOULD MOVE TRANSLATE/SCALE TO VIEW.
          var tx = graph.view.translate.x;
          var ty = graph.view.translate.y;
          graph.view.setTranslate(dx, dy);

          // LATER: Fix rounding errors for small zoom
          graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
          graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);

          this.autoTranslate = false;

          return;
        }

        graphSizeDidChange.apply(this, arguments);
      }
    };
  }

  resetScrollView() {
    var graph = this.graph;

    var pad = graph.getPagePadding();
    graph.container.scrollTop = Math.floor(pad.y) - 1;
    graph.container.scrollLeft = Math.floor(Math.min(pad.x,
      (graph.container.scrollWidth - graph.container.clientWidth) / 2)) - 1;

    // Scrolls graph to visible area
    var bounds = graph.getGraphBounds();

    if (bounds.width > 0 && bounds.height > 0) {
      if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth * 0.9) {
        graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x - 10);
      }

      if (bounds.y > graph.container.scrollTop + graph.container.clientHeight * 0.9) {
        graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y - 10);
      }
    }
  }

  resetView() {
    var graph = this.graph;
    graph.zoomTo(1);
    this.resetScrollView();
  }
}

