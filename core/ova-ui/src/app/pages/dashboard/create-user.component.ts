import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent {
  newUser = {
    username: '',
    password: '',
    role: '',
  };

  roles = ['User', 'Admin', 'Moderator'];

  createUser() {
    console.log('Creating user:', this.newUser);
    alert(`User "${this.newUser.username}" created!`);
    this.newUser = { username: '', password: '', role: '' };
  }
}
