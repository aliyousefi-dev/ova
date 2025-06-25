
adding a logger that save inside the .ova-repo

### Video Playback & Interaction
- **Smart Playlist:** Create playlists based on tags or other criteria.
- **Timeline Marker:** Very important feature to mark key points in videos.
- **Random Play:** Support playing videos randomly.
- **Support VR Videos:** Native support for VR video playback.
- **Trim Download:** Allow users to download trimmed segments of videos.
- **Top Rated:** Show or filter videos by top ratings.

### Upload & Processing
- **Upload Enhancements:**
  - When uploading, **also add tags** to videos.
  - On the upload page, provide an option to **generate VTTs** (thumbnails + chapters).
  - Upload workflow:
    1. Upload video.
    2. Add VTTs or chapters.
    3. Confirm and publish.
  - Option to add **chapters** during upload.

- **Repository Configurations:**
  - Enable or disable the **Trim Download API**.
  - Enable or disable **Batch VTT Processing**.
  - Control the **VTT generation button** visibility on the upload page (can be disabled to prevent CPU-intensive usage).

- **VTT Generation Options:**
  - Option to use **CUDA hardware acceleration** or not.
  - Option for **batch processing** vs single.
  - Option for **parallel processing**.
  - Option for **multi-threading**.


i thinking about an Edit button on the Video for Edit the Tags and other things. Chapters


---

# UI/UX & Client Behavior

- **Scroll Position Persistence:** Implement behavior similar to Telegram where scroll position is remembered and restored when navigating.

---

# Processing Workflow & Service Design

- **Video Processor Service:**  
  A modular service that processes videos automatically through a workflow, e.g.:
[INFO] Searching for videos...  
[INFO] Found 100 videos.

--- Processing video: xxxx ---  
[INFO] Running video processor service...  
[INFO] VTTs generated for video 'xxxx'.  
[INFO] Thumbnail generated for 'xxxx'.  
[INFO] Preview generated for 'xxxx'.  
[INFO] Video processor service finished.  
[INFO] Video data added to database.  
[SUCCESS] Video 'xxxx' successfully added to storage.

--- Processing video: xxxx2 ---  
[INFO] Running video processor service...  
[INFO] VTTs generated for video 'xxxx2'.  
[INFO] Thumbnail generated for 'xxxx2'.  
[ERROR] Failed to generate preview for 'xxxx2'.  
[INFO] Cancelling video processor service...  
[INFO] Deleting generated VTTs...  
[INFO] Deleting generated thumbnails...  
[INFO] Video processor service finished.  
[INFO] Video data added to database.  
[SUCCESS] Video 'xxxx2' successfully added to storage.