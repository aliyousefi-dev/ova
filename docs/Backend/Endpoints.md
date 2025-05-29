here is all API for the backend.
### RESTful API
```
GET     /api/v1/collections
POST    /api/v1/collections
DELETE  /api/v1/collections/{collectionId}
GET     /api/v1/collections/{collectionId}

POST /api/v1/auth/login
POST /api/v1/auth/logout
GET /api/v1/auth/me

GET /api/v1/users/{userId}/favorites
POST /api/v1/users/{userId}/favorites

GET /api/v1/search

GET /api/v1/videos
GET /api/v1/videos/{videoId}
POST /api/v1/videos/{videoId}/rate
GET /api/v1/videos/{videoId}/rating
```

### Resource API
```
/stream/{videoId}
/thumbnail/{videoId}
```
