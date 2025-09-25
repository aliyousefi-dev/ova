import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-database',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './datastorage.page.html',
})
export class DocDataStoragePage {
  UserType = ` "newuser": {
    "username": "newuser",
    "passwordHash": "$2a$10$S7eIMN50U1mzPNmWhGS7/OZjQigv53uvZzYCmAQXVoSCGreAXM3ri",
    "roles": [
      "user",
      "user"
    ],
    "createdAt": "2025-09-22T14:36:09.9124955Z",
    "lastLoginAt": "0001-01-01T00:00:00Z",
    "favorites": [
		"7740961a7f26dff5ea22ff056799d027224e6496321b5d1f205436974cc350c3",
		"a4636c2fde05f80bfe4c4e6929ddbb8ce3a1732e70ca5146599e8835a639631c",
		"b7216a9a0e709aea84a8fa2e06af5576af0f2fc408317b03d16783946613c3ff",
		  ],
    "playlists": [
      {
        "title": "horror movies",
        "description": "",
        "videoIds": [
          "194e237709135beee2576f7677395174b75b15ab9e2edb29f99cc01d8a9e290b",
          "9dc5c55785b0c1d1ad48bd0a5ca57058743d37fccf059f3560327f4713908e9e",
          "06a1eb83c7123d0a610cdddc59737feb52657210e9a05c86362906e9a09a1bd9",
          "8c8831129633ed402b2d5c89ffe30d82c8f34adfe3639cbfe906c561c03c2721",
          "7d7ad4feaca8396a9d8af0092175e45899830e7a98b2f12e8b77c58963ed5167",
          "7b2d1993744bfe16773e472404315adda71479ef4843173b89131f521c8623f7"
        ],
        "slug": "sdf",
        "order": 1
      },
	],
    "watched": [
		"e6d439b63f6363f3f93ca9b45dac6b6268a1a49d88f560aebe541eee96404994",
		"687876308038f1430ded74940530cb1c7ed35e88a23a7e92f64314e4a62092e7",
		"9dc5c55785b0c1d1ad48bd0a5ca57058743d37fccf059f3560327f4713908e9e",
	]
  },`;

  VideoType = `  "06b034f52d65d715bb107b6a34ebf69bee77a473b86c4b02e197e542f369940a": {
    "videoId": "06b034f52d65d715bb107b6a34ebf69bee77a473b86c4b02e197e542f369940a",
    "fileName": "VideoFileName_1080p",
    "description": "",
    "ownedSpace": "New folder (2)",
    "ownedGroup": "root",
    "tags": [
      "horror"
    ],
    "codecs": {
      "format": ".mp4",
      "durationSec": 1569,
      "frameRate": 23,
      "isFragment": false,
      "resolution": {
        "width": 1920,
        "height": 1080
      },
      "videoCodec": "avc1.640028",
      "audioCodec": "mp4a.40.2"
    },
    "isCooked": true,
    "totalDownloads": 0,
    "uploadedAt": "2025-08-30T01:18:32.3266586Z"
  },`;

  SessionType = `{
  "046aa35c-4452-4d9c-a238-c1019f4aae7a": "user1",
  "056275a4-3c53-408d-8e6a-9b7923b2e987": "user2",
  "15afc44e-b043-4f59-8998-12b2d9d1c840": "user3",
  "18d9cec5-bd44-46ec-abae-7065e32f0ec9": "user4",
}`;
}
