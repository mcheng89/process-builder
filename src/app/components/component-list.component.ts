import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-list',
  templateUrl: './component-list.component.html',
  styleUrls: ['./component-list.component.scss']
})
export class ComponentListComponent {
  @Input('graph') graph;

  components: any = [{
    label: "Input",
    items: [{
      label: "CSV file input"
    }, {
      label: "Microsoft Excel input"
    }, {
      label: "Table input"
    }, {
      label: "Text file input"
    }, {
      label: "Yaml input"
    }]
  }, {
    label: "Output",
    items: [{
      label: "Delete"
    }, {
      label: "Insert / Update"
    }, {
      label: "Microsoft Excel output"
    }, {
      label: "Table output"
    }]
  }, {
    label: "Transform",
    items: [{
      label: "Add constants"
    }, {
      label: "Add sequence"
    }, {
      label: "Calculator"
    }, {
      label: "Replace in string"
    }, {
      label: "Row normaliser"
    }, {
      label: "Row denormaliser"
    }, {
      label: "Row flattener"
    }]
  }, {
    label: "Utility",
    items: []
  }, {
    label: "Flow",
    items: []
  }, {
    label: "Scripting",
    items: []
  }, {
    label: "Lookup",
    items: []
  }, {
    label: "Joins",
    items: []
  }];
}
