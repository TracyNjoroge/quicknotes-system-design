
# QuickNotes API Design

## Overview

The QuickNotes API allows users to create, view, update, and delete their notes. It also allows users to organise notes using tags. The API uses REST principles and JSON for sending and receiving data.

Base URL: `/api/v1`

## Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| GET | `/notes` | Get a list of the user's notes | 200 OK |
| GET | `/notes/{id}` | Get one note by its ID | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{id}` | Update an existing note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | Get the user's tags | 200 OK |
| POST | `/notes/{id}/tags` | Add tags to a note | 200 OK |

## Example: Creating a Note

Request:

`POST /api/v1/notes`

```json
{
  "title": "My study notes",
  "body": "Review the basics of cloud computing."
}
```

Response: `201 Created`

```json
{
  "id": 101,
  "title": "My study notes",
  "body": "Review the basics of cloud computing.",
  "userId": 1,
  "createdAt": "2026-10-25T10:00:00Z",
  "updatedAt": "2026-10-25T10:00:00Z"
}
```

## Example: Listing Notes

Request:

`GET /api/v1/notes`

Response: `200 OK`

```json
{
  "data": [
    {
      "id": 101,
      "title": "My study notes",
      "body": "Review the basics of cloud computing.",
      "userId": 1
    },
    {
      "id": 102,
      "title": "Shopping list",
      "body": "Buy bread and milk.",
      "userId": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

## Error Responses

The API uses standard HTTP status codes to explain what went wrong.

| Status | Meaning | Example |
|---|---|---|
| 400 | Bad Request | The note title is missing |
| 401 | Unauthorized | The user is not logged in |
| 403 | Forbidden | The user tries to access another user's note |
| 404 | Not Found | The requested note does not exist |
| 500 | Internal Server Error | An unexpected server problem occurs |

Example error response:

```json
{
  "error": {
    "code": 400,
    "message": "The title field is required."
  }
}
```

## Design Decisions

- REST endpoints use HTTP methods to describe the action being performed.
- JSON makes request and response data easy to exchange between the client and server.
- The API uses pagination to avoid returning too many notes in one response.
- Authentication ensures users can access their own notes.
- Consistent error responses help the client display useful messages.
