import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  imports: [CommonModule],
})
export class HomePage {
  recommendedVideos = [
    {
      title: 'Amazing Nature Documentary',
      description: 'Explore the wonders of the natural world.',
      route: '/videos/1',
      image: 'https://picsum.photos/id/1011/400/240',
    },
    {
      title: 'City Timelapse',
      description: 'A beautiful urban nightscape timelapse.',
      route: '/videos/2',
      image: 'https://picsum.photos/id/1015/400/240',
    },
    {
      title: 'Cooking Masterclass',
      description: 'Learn to cook delicious meals easily.',
      route: '/videos/3',
      image: 'https://picsum.photos/id/1025/400/240',
    },
    {
      title: 'Tech Reviews',
      description: 'Latest gadgets and reviews you can trust.',
      route: '/videos/4',
      image: 'https://picsum.photos/id/1027/400/240',
    },
  ];

  topRatedVideos = [
    {
      title: 'Top 10 Travel Destinations',
      description: 'Must-see places around the globe.',
      route: '/videos/5',
      image: 'https://picsum.photos/id/1031/400/240',
    },
    {
      title: 'Yoga for Beginners',
      description: 'Start your wellness journey today.',
      route: '/videos/6',
      image: 'https://picsum.photos/id/1041/400/240',
    },
    {
      title: 'Classic Movie Reviews',
      description: 'Revisiting the golden age of cinema.',
      route: '/videos/7',
      image: 'https://picsum.photos/id/1052/400/240',
    },
    {
      title: 'Fitness Workouts',
      description: 'Stay healthy with easy exercises.',
      route: '/videos/8',
      image: 'https://picsum.photos/id/1060/400/240',
    },
  ];

  constructor(private router: Router) {}

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
