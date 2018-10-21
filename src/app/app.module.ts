import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppService } from './app.service';

import { EditorComponent } from './editor/editor.component';
import { ComponentListComponent } from './component-list.component';

import { MenuComponent } from './menu/menu.component';
import { ToolbarComponent } from './menu/toolbar.component';
import { ToolbarGroupComponent } from './menu/toolbar-group.component';

import { DxMenuModule } from 'devextreme-angular';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    DxMenuModule,
  ],
  declarations: [
    AppComponent,
    EditorComponent,
    ComponentListComponent,
    MenuComponent,
    ToolbarComponent,
    ToolbarGroupComponent,
  ],
  providers: [ AppService ],
  bootstrap: [AppComponent]
})
export class AppModule { }