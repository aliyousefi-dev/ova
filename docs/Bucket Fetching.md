This is a Feature to get the videos.

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