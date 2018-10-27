import { Component, Input, ViewChild } from '@angular/core';

import { DxPopupComponent } from 'devextreme-angular';

@Component({
  selector: 'vertex-template',
  templateUrl: './vertex.component.html',
  styleUrls: ['./vertex.component.scss']
})
export class VertexComponent {
  @Input('component') component;

  static minWidth = 230;
  static minHeight = 80;

  // mxgraph cell instance
  cell: any;

  editComponentVisible: boolean = false;

  show() {
    this.editComponentVisible = true;
    setTimeout(() => {
      this.focusVertex();
    }, 1);
  }
  save() {
    this.editComponentVisible = false;
  }

  @ViewChild(DxPopupComponent) popup: DxPopupComponent

  fullscreen = false;
  maximize() {
    this.fullscreen = !this.fullscreen;
    this.focusVertex();
  }
  focusVertex() {
    const popupContainer = this.popup.instance.content().parentElement;
    const popupWrapper = popupContainer.parentElement;

    const popups = Array.from(document.getElementsByClassName("dx-popup-wrapper"));
    const maxZIndex = Math.max(...popups.map(e => (<any>(<HTMLElement>e).style.zIndex)));

    if (popupContainer.style.zIndex != maxZIndex + "") {
      popupContainer.style.zIndex = <any>maxZIndex + 1;
      popupWrapper.style.zIndex = <any>maxZIndex + 1;
    }
  }

}
