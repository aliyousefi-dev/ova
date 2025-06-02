save and load the users data with this
```json 
{
  "id": "string",                // Unique user ID (UUID recommended)
  "username": "string",          // Unique username           // User email address
  "passwordHash": "string",      // Hashed password (never store plain text)
  "roles": ["string"],           // User roles, e.g. ["admin", "user"]
  "createdAt": "2025-05-28T14:30:00Z",  // Account creation timestamp (ISO 8601)
  "lastLoginAt": "2025-05-29T10:15:00Z",// Last login timestamp (nullable)
  "favorites": ["string"]        // Array of favorite video IDs
}
```