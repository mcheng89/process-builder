import { Component, ViewChild } from '@angular/core';

import { EditorComponent } from './editor/editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(EditorComponent) editor: EditorComponent;
  private graph: any;
  private outlineVisible: boolean = true;
}

