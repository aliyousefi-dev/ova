import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewComponent } from '../../../../components/containers/space-tree-view/space-tree-view.component';

@Component({
  selector: 'app-folder-tree',
  standalone: true,
  imports: [CommonModule, TreeViewComponent],
  templateUrl: './folder-tree.component.html',
})
export class FolderTreeComponent {
  @Input() currentFolder!: string;
  @Output() folderSelected = new EventEmitter<string>(); // This component simply passes events up to its parent
}
