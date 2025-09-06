Ova is a new archiving solutions for videos.
it make the archiving easier and more manageable on a local server. and also give you this ability to scale that.

its multi OS and support both Windows and Linux.

Ova is a Self Video Hosting Web application. that can run locally for editors to better collaborate with each other on a network with others. 
it support team space. archiving.
and confirmation.
designed for news agency. and Pro Teams that need more link together. Video Creators. Directors.

Designed for News Agency and the Pro Teams that works a lot with the videos and need manage them on network access an on a Local Server.


is good to spaces have ids ? 

video data attach to a primary space.

when change the virtual spaces. 
it must update both virtual space and video data.
is this good ? 

we need a way that when i click on a video card it shows the primary spaces.
or maybe when its on a virtual space. when i click on video card and open that shows where is that 
by default on the card just show the primary space on the recent tabs.

The Virtual Spaces can not be publicly on the recent page.

if a user toggle public and private on the space how the recent want to behavior ? 

it reorder the public videos based on the upload time.
the public or private just change the visibility of them on  the recent

now the problem is referencing. 
how a video card shows the referencing ? 

The Space have the DiskPath. ok 
and also the Group Name.
And also we have the Video File Name. 

we need a function the convert this to a file path 

GetVideoPath(SpaceData,VideoData)
SpaceDiskPath + GroupName + Video File Name + File Extension.

But what about the Virtual Spaces ? 
they don't have the SpaceDiskPath.
