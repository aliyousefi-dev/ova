import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'app-doc-bucket-fetch-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './doc-bucket-fetch.page.html',
})
export class DocBucketFetchPage {
  BucketDataStructure = `{
  "data": {
    "bucketContentSize": 15,
    "currentBucket": 1,
    "totalBuckets": 41,
    "totalVideos": 610,
    "videoIds": [
      "e9a82f95729c2c4d244dafb67c7964d390878ce4ff7388092741e9774b2bac5a"
    ]
  },
  "message": "Latest videos retrieved successfully",
  "status": "success"
}`;
}
