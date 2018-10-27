import { Injectable } from '@angular/core';

@Injectable()
export class AppService {

  getModel() {
    return {
      tasks: [
        {
          name: "Load Database Table",
          x: 150, y: 80,
          w: 230, h: 80
        },
        {
          name: "Pivot Records",
          x: 210, y: 260,
          w: 230, h: 80
        }
      ],
      relationships: [
        {
          from: "Load Database Table",
          to: "Pivot Records"
        }
      ]
    };
  }
}
