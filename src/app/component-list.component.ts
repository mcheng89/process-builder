import { Component } from '@angular/core';

@Component({
  selector: 'component-list',
  templateUrl: './component-list.component.html',
  styleUrls: ['./component-list.component.scss']
})
export class ComponentListComponent {
  components: any = [{
    label: "General"
  }, {
    label: "Misc"
  }, {
    label: "Advanced"
  }, {
    label: "Basic"
  }, {
    label: "Arrows"
  }, {
    label: "UML"
  }, {
    label: "BPMN General"
  }, {
    label: "Flowchart"
  }];
}
