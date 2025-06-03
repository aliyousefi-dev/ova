import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [RouterModule, TopNavBarComponent],
})
export class HomeComponent {}
