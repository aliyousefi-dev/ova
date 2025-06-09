import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

@Component({
  selector: 'app-folder-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder-tree.component.html',
})
export class FolderTreeComponent implements OnChanges {
  @Input() folders: string[] = [];
  @Input() currentFolder: string = '';
  @Output() folderSelected = new EventEmitter<string>();

  folderTree: FolderNode | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['folders']) {
      this.folderTree = this.buildTree(this.folders);
      this.sortTree(this.folderTree);
    }
  }

  buildTree(folders: string[]): FolderNode {
    const root: FolderNode = { name: 'Root', path: '', children: [] };
    const map = new Map<string, FolderNode>();
    map.set('', root);

    for (const folderPath of folders) {
      const parts = folderPath.split('/').filter(Boolean);
      let current = root;
      let currentPath = '';

      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!map.has(currentPath)) {
          const newNode: FolderNode = {
            name: part,
            path: currentPath,
            children: [],
          };
          map.set(currentPath, newNode);
          current.children.push(newNode);
        }
        current = map.get(currentPath)!;
      }
    }

    return root;
  }

  sortTree(node: FolderNode) {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.children.forEach(this.sortTree.bind(this));
  }

  onSelect(path: string) {
    this.folderSelected.emit(path);
  }

  isActive(path: string): boolean {
    return path === this.currentFolder;
  }
}
