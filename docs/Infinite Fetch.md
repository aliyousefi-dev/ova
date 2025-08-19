how enable this on the Gallery Component ?

Using the Bucket Fetch API.

API that send the bunch of videos
- Recent
- Library
- Saved
- History
- Playlist Contents

The Gallery Component
- Support Infinite Search
- Support Pagination

How must the API ? 

i Thinking about Bucket Solution.
Each Bucket holds 20 Videos.

```
/api/v1/recent?bucket=1
{
  "status": "success",
  "message": "Videos fetched successfully",
  "data": {
    "videoIds": [
      "14cea04576e3aed3f7a8046250f95d5770750c32ffe89abc98fda23ea1d5999e",
      "da63107a1cf4b294b4de5ca7cb3a18353ee7a2e1929ceac03851b6cd9f8d1636",
      "3502e63f16973080f6d2d94e2a64363b9212676cc9376b5e180c76b7834beb74",
      "e73c516f70669ae17dc1dc6a06c46b6251499eca50c5eb04ca73cb2a67ce1cb5"
    ],
    "bucket": {
      "current_bucket": 1,
      "bucket_size": 20,
      "total_buckets": 25,
      "total_videos": 500
    }
  },
}
```

```
<app-video-gallery *ngIf="!loading" [videos]="videos"></app-video-gallery>

<app-video-gallery viewmode="mini" *ngIf="!loading"></app-video-gallery>
```

i thinking about infinit scroll 
infinite scroll need to trigger an event that reached to end and need add more videos.


Initial Load

Load Bucket

Add Bucket


```
  <div class="flex w-full justify-between items-center py-2 px-10 gap-5 bg-base-200"

    *ngIf="totalPages > 1 && !loading && viewMode !== 'mini'">

    <p *ngIf="!loading && videos.length > 0" class="font-medium">

      Showing {{ (currentPage - 1) * 20 + 1 }} - {{ (currentPage - 1) * 20 + videos.length }} of {{ totalVideos }}

      videos

    </p>

    <div class="join">

      <ng-container *ngFor="let page of paginationPages">

        <input *ngIf="page !== '...'" class="join-item btn btn-square btn-sm" type="radio" name="paginationTop"

          [attr.aria-label]="page" [checked]="currentPage === page" (change)="goToPage(page)" />

        <span *ngIf="page === '...'" class="join-item btn btn-square btn-sm btn-disabled">...</span>

      </ng-container>

    </div>

  </div>
```

Pagination Component 