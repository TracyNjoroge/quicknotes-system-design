
# QuickNotes Data Model

## Overview

QuickNotes uses a relational database to store users, notes, tags, and the relationships between notes and tags.

## Entities and Columns

### 1. Users

| Column | Type | Key |
|---|---|---|
| id | INTEGER | Primary Key |
| name | VARCHAR(100) | |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | |
| created_at | TIMESTAMP | |

### 2. Notes

| Column | Type | Key |
|---|---|---|
| id | INTEGER | Primary Key |
| user_id | INTEGER | Foreign Key → users.id |
| title | VARCHAR(100) | |
| body | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 3. Tags

| Column | Type | Key |
|---|---|---|
| id | INTEGER | Primary Key |
| user_id | INTEGER | Foreign Key → users.id |
| name | VARCHAR(50) | |

### 4. Note_Tags

| Column | Type | Key |
|---|---|---|
| note_id | INTEGER | Primary Key, Foreign Key → notes.id |
| tag_id | INTEGER | Primary Key, Foreign Key → tags.id |

The `note_tags` table uses a composite primary key made from `note_id` and `tag_id`. This prevents the same tag from being attached to the same note more than once.

## Relationships

- **Users and Notes:** One user can have many notes. Each note belongs to one user. This is a one-to-many relationship.
- **Users and Tags:** One user can create many tags. Each tag belongs to one user. This is also a one-to-many relationship.
- **Notes and Tags:** One note can have many tags, and one tag can be used on many notes. This is a many-to-many relationship managed through the `note_tags` table.

## SQL Table Creation

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(50) NOT NULL
);

CREATE TABLE note_tags (
    note_id INTEGER REFERENCES notes(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (note_id, tag_id)
);
```

## Example SQL Queries

### 1. Get all notes belonging to a user

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;
```

### 2. Create a new note

```sql
INSERT INTO notes (user_id, title, body)
VALUES (1, 'Study Notes', 'Review cloud computing concepts.');
```

### 3. Get notes with their tags

```sql
SELECT notes.title, tags.name AS tag_name
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.user_id = 1;
```

## Index

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
```

This index helps the database find a user's notes faster, especially when the application contains many users and notes.

## SQL vs NoSQL

I would choose a SQL database for QuickNotes because the data has clear relationships between users, notes, and tags. SQL supports foreign keys and joins, which help maintain data consistency.

A NoSQL database could also work, especially if the data structure changes frequently, but a relational database is a straightforward choice for this project.
