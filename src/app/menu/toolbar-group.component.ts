import { Component, Input } from '@angular/core';

@Component({
  selector: 'toolbar-group',
  templateUrl: './toolbar-group.component.html',
  styleUrls: ['./toolbar-group.component.scss']
})
export class ToolbarGroupComponent {
  private _dataSource: any;

  @Input('dataSource') set dataSource(value: any) {
    this._dataSource = value;
    this._dataSource.forEach(v => {
      v.root = true;
    });
  }
}
