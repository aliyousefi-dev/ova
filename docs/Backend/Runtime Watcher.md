his class listen for the changes in the directory.
and if adding new video or delete video or moved video 
it generate metadata for that video.

when a file adding... 
when a file removing..
when a file renamed...

### Init
create .metadata folder -> add collection-data.json, user-data.json , videos-data.json and config.json -> create thumbnail folder

### Watch
watch -> check .ova-repo folder valid and exists -> check ova repository version match the ova-server using  -> if yes -> scan -> generate all metadata -> create hash collection -> run server -> listen for folder events -> if has event -> scan again -> create hash collection -> compare old and new hash-collections -> apply changes

### Serve
serve -> check .metadata folder valid and exists -> check ova-repo version match ova server version-> if yes -> run server


i thinking about the RootPath. 
i think it good to export this to the repo configs.