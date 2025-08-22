import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadApiService } from '../../services/ova-backend/upload-api.service';
import { TreeViewComponent } from '../../components/containers/space-tree-view/space-tree-view.component';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [CommonModule, TreeViewComponent],
  templateUrl: './upload-video.component.html',
})
export class UploadVideoComponent {
  @Input() folderList: string[] = [];
  @Input() selectedFolder: string = '';
  @Output() folderSelected = new EventEmitter<string>();

  selectedFile: File | null = null;
  uploading = false;
  dragging = false;
  title = '';
  progress = 0;

  constructor(private uploadApi: UploadApiService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.title = this.selectedFile.name.replace(/\.[^/.]+$/, '');
      console.log('File selected:', this.selectedFile.name);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('video/mp4')) {
        this.selectedFile = file;
        this.title = file.name.replace(/\.[^/.]+$/, '');
        console.log('File dropped:', file.name);
      } else {
        alert('Only video files are allowed.');
      }
    }
  }

  onSubmit(): void {
    if (
      !this.selectedFile ||
      this.selectedFolder === undefined ||
      this.selectedFolder === null
    ) {
      console.warn('Missing file or folder for upload');
      return;
    }

    this.uploading = true;
    this.progress = 0;

    this.uploadApi
      .uploadVideo(this.selectedFolder, this.selectedFile)
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.progress = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {
            alert('Video uploaded successfully!');
          }
        },
        error: (err) => {
          console.error('Upload failed', err);
          alert('Failed to upload video.');
          this.uploading = false;
        },
        complete: () => {
          this.uploading = false;
          this.selectedFile = null;
          this.progress = 0;
        },
      });
  }

  onFolderSelected(folder: string): void {
    this.selectedFolder = folder;
    this.folderSelected.emit(folder);
  }
}
