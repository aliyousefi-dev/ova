adding and removing the collections 
and also getting the information about the collection

using the [[Collection Data]]

## Endpoints

```
GET     /api/v1/collections
POST    /api/v1/collections
DELETE  /api/v1/collections/{collectionId}
GET     /api/v1/collections/{collectionId}
```

---

## `GET /api/v1/collections`
*@loginRequired*

Fetch all user collections.

### Request Body
_None_

### Response Body
```json
[
  {
    "id": "abc123",
    "name": "Favorites",
    "videoIds": ["vid1", "vid2"]
  },
  {
    "id": "def456",
    "name": "Watch Later",
    "videoIds": []
  }
]
```

---

## `POST /api/v1/collections`
*@loginRequired*

Create a new collection.

### Request Body
```json
{
  "name": "My Playlist",
  "videoIds": ["vid123", "vid456"]
}
```

### Response Body
```json
{
  "id": "abc123",
  "name": "My Playlist",
  "videoIds": ["vid123", "vid456"]
}
```

---

## `DELETE /api/v1/collections/{collectionId}`
*@loginRequired*

Delete a specific collection.

### Request Body
_None_

### Path Parameters
- `collectionId` — ID of the collection to delete

### Response Body
_Empty (204 No Content)_

---

## `GET /api/v1/collections/{collectionId}`
*@loginRequired*

Get details of a specific collection.

### Request Body
_None_

### Path Parameters
- `collectionId` — ID of the collection to retrieve

### Response Body
```json
{
  "id": "abc123",
  "name": "My Playlist",
  "videoIds": ["vid123", "vid456"]
}
```
