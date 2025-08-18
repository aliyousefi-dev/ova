import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderApiService } from '../../../services/ova-backend/folder-api.service';

export interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tree-view.component.html',
})
export class TreeViewComponent implements OnInit {
  @Input() currentFolder: string = '';
  @Output() folderSelected = new EventEmitter<string>();

  folderTree: FolderNode | null = null;
  loading = false;

  constructor(private folderApi: FolderApiService) {}

  ngOnInit() {
    this.fetchFolders();
  }

  fetchFolders() {
    this.loading = true;
    this.folderApi.getFolderLists().subscribe({
      next: (res) => {
        this.folderTree = this.buildTree(res.data);
        this.sortTree(this.folderTree);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load folders:', err);
        this.loading = false;
      },
    });
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

  // Already exists and is fine:
  onSelect(path: string) {
    this.folderSelected.emit(path);
  }

  isActive(path: string): boolean {
    return path === this.currentFolder;
  }
}
