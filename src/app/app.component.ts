import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import {
  mxGraph,
} from 'mxgraph/javascript/mxClient';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('editor') editorEl: ElementRef;

  ngOnInit() {
    let graph = new mxGraph();
    mxGraph.prototype.init.apply(graph, [this.editorEl.nativeElement]);
  }
}
