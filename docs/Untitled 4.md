now we have a problem with relative and absoulte path on the register video 

and need first check the file exists or not 

- Folder Video Register
- and Folder Unregister

adding the -y option to pass the confirmation


i thinking about a function  that i FetchChanges
it hceck the vidoe file moved or not 
if the video deleted or and nnot exits on the disk 
and give me all sencerioas for ovacli 

Track Current Video Paths
Detect Moves
Detect Deletions
Detect New Videos
- **Video Moved**: The video file exists, but its path has changed (i.e., the file has been moved).
- **Video Deleted**: The video file is no longer present on the disk (i.e., the file has been deleted).
- **Video Exists**: The video file exists, and no changes are detected.
- **Video New**: A new video file that wasn't previously indexed is added to the disk.