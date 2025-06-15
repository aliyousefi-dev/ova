save and load the video data like this
```json
{
  "videoId": "string",                   // Unique identifier (UUID recommended)
  "title": "string",                     // Video title
  "filePath": "string",                  // Absolute or relative path to video file
  "rating": 1,                        // Average rating (float 0.0 - 5.0)
  "durationSeconds": 120,                // Duration in seconds (integer)
  "thumbnailPath": "string|null",       // Path or URL to thumbnail image, nullable
  "tags": ["string"],                    // List of tags
  "uploadedAt": "2025-05-28T14:30:00Z",// Upload timestamp in ISO 8601 UTC format
  "views": 1234,                        // Total views count (integer)
}
```