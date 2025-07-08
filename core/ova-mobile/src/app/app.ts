import { Component } from '@angular/core';
import { CommonModule  } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { 
  RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',   // Template URL for AppComponent
  imports: [CommonModule, FormsModule, RouterOutlet],
  styleUrls: ['./app.css'],     // CSS file for styling AppComponent
})
export class App {
  protected title = 'ova-mobile';

}
