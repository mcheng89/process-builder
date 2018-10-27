import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ComponentFactoryResolver, Injector, ApplicationRef, Input } from '@angular/core';

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

  private _model: any;
  private modelRefreshing: boolean = false;
  @Output('modelChange') modelEmit = new EventEmitter();

  ngAfterViewInit() {
    var self = this;

    let graph = new mxGraph();
    this.graph = graph;
    mxGraph.prototype.init.apply(graph, [this.editorEl.nativeElement]);

    // add selection...
    var rubberband = new mxRubberband(graph);

    // add connection support
    graph.setAllowDanglingEdges(false);

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
        // attach component to the appRef so that it's inside the ng component tree
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
    graph.addListener(mxEvent.CELLS_REMOVED, (graph, event) => {
      console.log(event);
      event.properties.cells
        .filter(cell => cell.vertex)
        .forEach(cell => {
          this.applicationRef.detachView(cell.componentRef.hostView);
          cell.componentRef.destroy();
        });
    });
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

    this.editorPageLayoutSvc.setupLayout(graph);

    // force size refresh, then adjust initial scrollbar location
    this.resetView();

    // load initial model
    graph.model.addListener(mxEvent.CHANGE, () => {
      if (this.modelRefreshing) {
        console.log("mxevent change for model refresh...");
      } else {
        const cells = graph.getChildCells(graph.getDefaultParent(), true, true);
        const model = {
          tasks: [],
          relationships: [],
        };
        cells.filter(cell => cell.vertex).forEach(cell => {
          cell.value.x = cell.geometry.x;
          cell.value.y = cell.geometry.y;
          cell.value.w = cell.geometry.width;
          cell.value.h = cell.geometry.height;
          model.tasks.push(cell.value);
        });
        cells.filter(cell => cell.edge).forEach(cell => {
          model.relationships.push({
            from: cell.source.value.name,
            to: cell.target.value.name,
          });
        });
        console.log(model);
        this._model = model;
        this.modelEmit.emit(model);
      }
    });
    if (this._model) {
      this.refreshModel();
    }

    setTimeout(() => this.graphEmit.emit(graph), 1);
  }

  @Input('model') set model(value) {
    if (!this.graph) {
      this._model = value;
    } else if (this._model != value) {
      this._model = value;
      this.refreshModel();
    }
  }
  refreshModel() {
    console.log("refreshing graph model...");
    var graph = this.graph;

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    var parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    this.modelRefreshing = true;
    graph.getModel().beginUpdate();
    try {
      graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));

      var tasks = [];
      this._model.tasks.forEach(task => {
        var v1 = graph.insertVertex(parent, null, task, task.x, task.y, task.w, task.h);
        tasks[task.name] = v1;
      });
      this._model.relationships.forEach(relationship => {
        var v1 = tasks[relationship.from];
        var v2 = tasks[relationship.to];
        var e1 = graph.insertEdge(parent, null, '', v1, v2);
      });
    }
    finally {
      // Updates the display
      graph.getModel().endUpdate();
      this.modelRefreshing = false;
    }
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

