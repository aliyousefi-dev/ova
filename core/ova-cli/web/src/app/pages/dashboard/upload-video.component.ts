import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadApiService } from '../../services/api/upload-api.service';
import { FolderTreeComponent } from '../../components/folder-tree/folder-tree.component';

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [CommonModule, FolderTreeComponent],
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

  constructor(private uploadApi: UploadApiService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.title = this.selectedFile.name.replace(/\.[^/.]+$/, '');
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
      if (file.type.startsWith('video/')) {
        this.selectedFile = file;
        this.title = file.name.replace(/\.[^/.]+$/, '');
      } else {
        alert('Only video files are allowed.');
      }
    }
  }

  onSubmit(): void {
    if (!this.selectedFile || !this.selectedFolder) return;

    this.uploading = true;
    this.uploadApi
      .uploadVideo(this.selectedFolder, this.selectedFile)
      .subscribe({
        next: () => alert('Video uploaded successfully!'),
        error: (err) => {
          console.error('Upload failed', err);
          alert('Failed to upload video.');
        },
        complete: () => (this.uploading = false),
      });
  }

  onFolderSelected(folder: string) {
    this.folderSelected.emit(folder);
  }
}
