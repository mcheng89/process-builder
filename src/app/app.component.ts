import { Component, ViewChild, OnInit } from '@angular/core';

import { EditorComponent } from './editor/editor.component';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private appService: AppService) {}

  @ViewChild(EditorComponent) editor: EditorComponent;
  private graph: any;
  private model: any;
  private outlineVisible: boolean = true;

  ngOnInit() {
    this.model = this.appService.getModel();
  }

  onModelChange(event) {
    this.model = event;
    console.log(JSON.stringify(this.model));
  }
}

