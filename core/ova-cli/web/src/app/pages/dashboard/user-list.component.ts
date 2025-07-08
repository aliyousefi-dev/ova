import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-manager',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  users = [
    { id: 1, username: 'alice', role: 'Admin' },
    { id: 2, username: 'bob', role: 'User' },
    { id: 3, username: 'charlie', role: 'User' },
    { id: 4, username: 'diana', role: 'Moderator' },
  ];

  selectedUser: { id: number; username: string; role: string } | null = null;

  selectUser(user: { id: number; username: string; role: string }) {
    this.selectedUser = user;
  }
}
