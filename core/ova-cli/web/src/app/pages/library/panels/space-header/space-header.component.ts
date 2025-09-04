import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-space-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './space-header.component.html',
})
export class SpaceHeaderComponent {
  @Input() SpaceSelected!: string;
  @Input() copied!: boolean;
  @Input() copyButtonLabel!: string;
  @Input() copySpaceId!: () => void;
}
