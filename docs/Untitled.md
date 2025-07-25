we developing the ova that have cli and the desktop and mobile apps
and the cli have bundle the frontend and serve that but we have the mobile and desktop app that need to connect to the cli api served 

Think we have the vidstack and we can not use the custom headers with that not because it not support that because if we use that we voluntary ourselves to the XSS attacks.

So because of that we need to use the Cookies. For Auth.

this is the Best Way but we have problem with Cookies and Cross Origin.
Since we Want use that API for other Apps like the Android and Desktop. 
and they are Web Apps that Connect to the API. and Served on the Local host and want to Send Login with that API it not working. We need way to fix this .

First i thinking about the Android maybe we can use the Capacitor Http Client Instead of the Angular Http Client.

the SSL folder is inside the .ova-repo 
