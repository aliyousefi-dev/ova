import { Component } from '@angular/core';

@Component({
  selector: 'app-videos-section',
  templateUrl: './videos-section.component.html',
})
export class VideosSectionComponent {
  serveRepo() {
    console.log('Serve video');
  }

  runNewRepo() {
    console.log('New video');
  }

  chooseFolder() {
    console.log('Choose file');
  }
}
