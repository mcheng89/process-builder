import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input('outlineVisible') outlineVisible;
  @Output('outlineVisibleChange') outlineVisibleEmit = new EventEmitter();

  itemClick(event) {
    const item = event.itemData;
    if (item.click) {
      item.click(item);
    }
  }

  outlineToggle = () => {
    this.outlineVisible = !this.outlineVisible;
    this.outlineVisibleEmit.emit(this.outlineVisible);
  }
}
