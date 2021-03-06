import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppService } from './app.service';

import { EditorComponent } from './editor/editor.component';
import { EditorPageLayoutService } from './editor/editor-layout.service';
import { VertexComponent } from './editor/vertex.component';
import { HoverIconsComponent } from './editor/hover-icons.component';
import { OutlineComponent } from './editor/outline.component';

import { ComponentItemComponent } from './components/component-item.component';
import { ComponentListComponent } from './components/component-list.component';

import { MenuComponent } from './menu/menu.component';
import { ToolbarComponent } from './menu/toolbar.component';
import { ToolbarGroupComponent } from './menu/toolbar-group.component';

import {
  DxMenuModule,
  DxPopupModule,
  DxScrollViewModule,
} from 'devextreme-angular';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    DxMenuModule,
    DxPopupModule,
    DxScrollViewModule,
  ],
  declarations: [
    AppComponent,
    EditorComponent,
    VertexComponent,
    HoverIconsComponent,
    OutlineComponent,
    ComponentItemComponent,
    ComponentListComponent,
    MenuComponent,
    ToolbarComponent,
    ToolbarGroupComponent,
  ],
  entryComponents: [ VertexComponent ],
  providers: [
    AppService,
    EditorPageLayoutService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }