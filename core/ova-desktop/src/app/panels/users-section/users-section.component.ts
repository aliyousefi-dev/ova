import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-users-section',
  templateUrl: './users-section.component.html',
})
export class UsersSectionComponent implements OnInit {
  users: any[] = [];

  ngOnInit(): void {
    this.users = [
      {
        name: 'Dio Lupa 1',
        title: 'Remaining Reason',
        image: 'https://img.daisyui.com/images/profile/demo/1@94.webp',
      },
      {
        name: 'Dio Lupa 2',
        title: 'Remaining Reason',
        image: 'https://img.daisyui.com/images/profile/demo/2@94.webp',
      },
      {
        name: 'Dio Lupa 3',
        title: 'Remaining Reason',
        image: 'https://img.daisyui.com/images/profile/demo/3@94.webp',
      },
    ];
  }
}
