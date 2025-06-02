import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './top-nav-bar.component.html',
})
export class TopNavBarComponent {
  @Input() title = '';

  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }
}
