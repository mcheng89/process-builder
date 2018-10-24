import { Component, Input } from '@angular/core';

@Component({
  selector: 'vertex-template',
  templateUrl: './vertex.component.html',
  styleUrls: ['./vertex.component.scss']
})
export class VertexComponent {
  @Input('component') component;

  editComponentVisible: boolean = false;

  delete() {
    alert('delete');
  }

  save() {
    this.editComponentVisible = false;
  }

}
