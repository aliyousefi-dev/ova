
it have this process

Create File Hash from the Video
Check the Video Exists on Repository or not 
if Exits then
Check is Frag or not
if not it Convert that to Frag
After Create a Thumbnail from that
and Next Create a Preview for that
if Everything is Good and Ok
then Save the Data Field to Storage
if Fail -> Delete the Preview and Thumbnail if Created.


what i best to storagemanger ? 

when we upload a new video it goin to the repository uploads folder
then it need process video for the new with ProcessVideoForStorage
the uploads folder is outsize of the .ova-repo 

and it need for Role checking also for user to who user can upload and not 
i thinkg hte admin and upload 
and user can not upload 

the upload fodler must show in herachiy or not ? 
we must show the herachiy or not ? 
i thikn hte best practice is to create playlist ? 


- Admin (Owner of Repository)
- Regular users
- Uploader

having the MyUploads
he can delte the video on repository and hte video have Owner
the default owner is system and if some one adding and uploading video the owner will be their username 

adding the videosize and framerate also


We need Bento4 for Checking is FragmentMp4 or not 
const mimeCodec = 'video/mp4; codecs="avc1.64001F, mp4a.40.2"';
video/mp4; codecs="avc1.64001F, mp4a.40.2"


how manage the local db better ? 
i wnat separete the function and operation 
like 


first of all the json need load and save to the local json 

do i need for each operation load and save json again 
or is better way for this 

db operations
video operations
storage

if we thinking we have multiple backend running and process the vidoe after uploading 
how is best approach to process video and where put htat ifrst in ova-repo and hwo 
the problem is if we have multiple bakcend that using a shared folder for hiigh availability.
the architechture to use the storage , we have the remote and local storage, 
the local storafe just support in the ova 
i don't know 