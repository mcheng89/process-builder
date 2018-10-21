import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import {
  mxClient,
  mxConstants,
  mxEvent,
  mxGraph,
  mxGraphView,
  mxRectangle,
  mxRectangleShape,
  mxRubberband,
  mxPoint,
  mxUtils,
} from 'mxgraph/javascript/mxClient';

import { Base64 } from 'js-base64';

mxGraph.prototype.pageFormat = new mxRectangle(0, 0, 1000, 1000);

mxGraphView.prototype.gridSteps = 4;
mxGraphView.prototype.minGridSize = 4;
mxGraphView.prototype.graphBackground = '#ffffff';
mxGraphView.prototype.gridColor = '#e0e0e0';

// https://github.com/jgraph/mxgraph/blob/master/javascript/examples/grapheditor/www/js/Editor.js#L1747
// Uses HTML for background pages (to support grid background image)
mxGraphView.prototype.validateBackgroundPage = function () {
  var graph = this.graph;
  if (graph.container != null && !graph.transparentBackground) {
    var bounds = this.getBackgroundPageBounds();
    if (this.backgroundPageShape == null) {
      // Finds first element in graph container
      var firstChild = graph.container.firstChild;

      while (firstChild != null && firstChild.nodeType != mxConstants.NODETYPE_ELEMENT) {
        firstChild = firstChild.nextSibling;
      }

      if (firstChild != null) {
        this.backgroundPageShape = this.createBackgroundPageShape(bounds);
        this.backgroundPageShape.scale = 1;
        this.backgroundPageShape.init(graph.container);

        // Required for the browser to render the background page in correct order
        firstChild.style.position = 'absolute';
        graph.container.insertBefore(this.backgroundPageShape.node, firstChild);
        this.backgroundPageShape.redraw();

        this.backgroundPageShape.node.className = 'geBackgroundPage';
      }
    } else {
      this.backgroundPageShape.scale = 1;
      this.backgroundPageShape.bounds = bounds;
      this.backgroundPageShape.redraw();
    }

    this.validateBackgroundStyles();
  }
}
// Creates background page shape
mxGraphView.prototype.createBackgroundPageShape = function (bounds) {
  return new mxRectangleShape(bounds, '#ffffff', '#ffffff');
};
// Updates the CSS of the background to draw the grid
mxGraphView.prototype.validateBackgroundStyles = function () {
  var graph = this.graph;
  var color = this.graphBackground;
  var gridColor = this.gridColor;
  var image = 'none';
  var position = '';

  if (graph.isGridEnabled()) {
    var phase = 10;

    // Generates the SVG required for drawing the dynamic grid
    image = unescape(encodeURIComponent(this.createSvgGrid(gridColor)));
    image = (window.btoa) ? btoa(image) : Base64.encode(image, true);
    image = 'url(' + 'data:image/svg+xml;base64,' + image + ')'
    phase = graph.gridSize * this.scale * this.gridSteps;

    var x0 = 0;
    var y0 = 0;

    if (graph.view.backgroundPageShape != null) {
      var bds = this.getBackgroundPageBounds();

      x0 = 1 + bds.x;
      y0 = 1 + bds.y;
    }

    // Computes the offset to maintain origin for grid
    position = -Math.round(phase - mxUtils.mod(this.translate.x * this.scale - x0, phase)) + 'px ' +
      -Math.round(phase - mxUtils.mod(this.translate.y * this.scale - y0, phase)) + 'px';
  }

  var canvas = graph.view.canvas;

  if (canvas.ownerSVGElement != null) {
    canvas = canvas.ownerSVGElement;
  }

  if (graph.view.backgroundPageShape != null) {
    graph.view.backgroundPageShape.node.style.backgroundPosition = position;
    graph.view.backgroundPageShape.node.style.backgroundImage = image;
    graph.view.backgroundPageShape.node.style.backgroundColor = color;
    graph.container.className = 'editor geDiagramContainer geDiagramBackdrop';
    canvas.style.backgroundImage = 'none';
    canvas.style.backgroundColor = '';
  }
  else {
    graph.container.className = 'editor geDiagramContainer';
    canvas.style.backgroundPosition = position;
    canvas.style.backgroundColor = color;
    canvas.style.backgroundImage = image;
  }
}

// Returns the SVG required for painting the background grid.
mxGraphView.prototype.createSvgGrid = function (color) {
  var tmp = this.graph.gridSize * this.scale;

  while (tmp < this.minGridSize) {
    tmp *= 2;
  }

  var tmp2 = this.gridSteps * tmp;

  // Small grid lines
  var d = [];

  for (var i = 1; i < this.gridSteps; i++) {
    var tmp3 = i * tmp;
    d.push('M 0 ' + tmp3 + ' L ' + tmp2 + ' ' + tmp3 + ' M ' + tmp3 + ' 0 L ' + tmp3 + ' ' + tmp2);
  }

  // KNOWN: Rounding errors for certain scales (eg. 144%, 121% in Chrome, FF and Safari). Workaround
  // in Chrome is to use 100% for the svg size, but this results in blurred grid for large diagrams.
  var size = tmp2;
  var svg = '<svg width="' + size + '" height="' + size + '" xmlns="' + mxConstants.NS_SVG + '">' +
    '<defs><pattern id="grid" width="' + tmp2 + '" height="' + tmp2 + '" patternUnits="userSpaceOnUse">' +
    '<path d="' + d.join(' ') + '" fill="none" stroke="' + color + '" opacity="0.2" stroke-width="1"/>' +
    '<path d="M ' + tmp2 + ' 0 L 0 0 0 ' + tmp2 + '" fill="none" stroke="' + color + '" stroke-width="1"/>' +
    '</pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>';

  return svg;
};

/**
* Returns a rectangle describing the position and count of the
* background pages, where x and y are the position of the top,
* left page and width and height are the vertical and horizontal
* page count.
*/
mxGraph.prototype.getPageLayout = function () {
  var size = this.getPageSize();
  var bounds = this.getGraphBounds();

  if (bounds.width == 0 || bounds.height == 0) {
    return new mxRectangle(0, 0, 1, 1);
  }
  else {
    // Computes untransformed graph bounds
    var x = Math.ceil(bounds.x / this.view.scale - this.view.translate.x);
    var y = Math.ceil(bounds.y / this.view.scale - this.view.translate.y);
    var w = Math.floor(bounds.width / this.view.scale);
    var h = Math.floor(bounds.height / this.view.scale);

    var x0 = Math.floor(x / size.width);
    var y0 = Math.floor(y / size.height);
    var w0 = Math.ceil((x + w) / size.width) - x0;
    var h0 = Math.ceil((y + h) / size.height) - y0;

    return new mxRectangle(x0, y0, w0, h0);
  }
};
/**
 * Returns the size of the page format scaled with the page size.
 */
mxGraph.prototype.getPageSize = function () {
  return new mxRectangle(0, 0, this.pageFormat.width, this.pageFormat.height);
};

/**
 * Function: getGraphBounds
 * 
 * Overrides getGraphBounds to use bounding box from SVG.
 */
mxGraphView.prototype.getGraphBounds = function () {
  var b = this.graphBounds;

  if (this.graph.useCssTransforms) {
    var t = this.graph.currentTranslate;
    var s = this.graph.currentScale;

    b = new mxRectangle(
      (b.x + t.x) * s, (b.y + t.y) * s,
      b.width * s, b.height * s);
  }

  return b;
};

@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit {
  @ViewChild('editor') editorEl: ElementRef;

  private graph: any;
  @Output('graph') graphEmit = new EventEmitter();

  ngAfterViewInit() {
    let graph = new mxGraph();
    this.graph = graph;
    mxGraph.prototype.init.apply(graph, [this.editorEl.nativeElement]);

    // add selection...
    var rubberband = new mxRubberband(graph);

    mxEvent.addListener(window, 'resize', () => {
      graph.sizeDidChange();
    });

    /**
     * Returns the padding for pages in page view with scrollbars.
     */
    graph.getPagePadding = function () {
      return new mxPoint(Math.max(0, Math.round((graph.container.offsetWidth - 34) / graph.view.scale)),
        Math.max(0, Math.round((graph.container.offsetHeight - 34) / graph.view.scale)));
    };

    // Fits the number of background pages to the graph
    graph.view.getBackgroundPageBounds = function () {
      var layout = this.graph.getPageLayout();
      var page = this.graph.getPageSize();

      return new mxRectangle(this.scale * (this.translate.x + layout.x * page.width),
        this.scale * (this.translate.y + layout.y * page.height),
        this.scale * layout.width * page.width,
        this.scale * layout.height * page.height);
    };

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

    graph.view.validateBackground();
    graph.sizeDidChange();
    this.resetScrollbars();

    setTimeout(() => this.graphEmit.emit(graph), 1);
  }

  resetScrollbars() {
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
}

