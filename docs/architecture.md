
# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web application that allows users to create, view, update, and delete notes. The system should be simple to use and able to handle growth as more people use it.

## 2. Functional Requirements

- Users can create an account and log in.
- Users can create, view, update, and delete their notes.
- Users can organise notes using tags.
- Users can only access their own notes.
- Users receive useful messages when an operation succeeds or fails.

## 3. Non-Functional Requirements

- **Performance:** Most requests should respond within 500 milliseconds under normal conditions.
- **Availability:** The application should remain available if one application server fails.
- **Security:** Passwords should be hashed, and users should only access authorised data.
- **Scalability:** The system should support more users by adding application servers.
- **Reliability:** Backups and monitoring should help prevent and detect problems.
- **Maintainability:** The application should have clear documentation and manageable components.

## 4. Load Estimates for 1 Million Users

These estimates assume 1 million registered users, with 10% active each day.

### Assumptions

- Registered users: 1,000,000
- Daily active users: 100,000
- Each active user reads 20 notes per day.
- Each active user creates 2 notes per day.
- Average stored note size: 2 KB, including basic metadata.
- A day has 86,400 seconds.

### Reads per Second

100,000 users × 20 reads = 2,000,000 reads per day.

2,000,000 ÷ 86,400 ≈ 23 reads per second on average.

Assuming peak traffic is 5 times the average, the system may need to handle about 116 reads per second at peak.

### Writes per Second

100,000 users × 2 new notes = 200,000 writes per day.

200,000 ÷ 86,400 ≈ 2.3 writes per second on average.

At 5 times average traffic, this becomes about 12 writes per second at peak.

### Storage per Year

200,000 notes per day × 2 KB = 400,000 KB per day, or about 400 MB per day using decimal units.

400 MB × 365 = about 146 GB per year of new note data.

This estimate excludes backups, indexes, replicas, and additional database overhead. The system may require more storage in practice.

## 5. Architecture Diagram

```text
                    Users / Web Browser
                            |
                           DNS
                            |
                           CDN
                            |
                      Load Balancer
                       /          \
                App Server 1    App Server 2
                    |                |
                    +-------+--------+
                            |
                       Cache Layer
                            |
                    Primary Database
                            |
                      Read Replica

                 App Servers
                      |
                  Message Queue
                      |
                    Worker
```

## 6. What Each Component Does

- **Client:** The browser provides the interface for users to manage their notes.
- **DNS:** Converts the application domain name into the correct network address.
- **CDN:** Delivers static files, such as CSS and JavaScript, closer to users.
- **Load balancer:** Distributes incoming requests between application servers.
- **Application servers:** Process API requests and apply the application's rules. Two servers allow the application to continue if one fails.
- **Cache:** Stores frequently accessed data to reduce database queries and improve response times.
- **Primary database:** Stores the main application data and handles writes.
- **Read replica:** Provides another copy of the data for read traffic and can help with recovery.
- **Message queue:** Holds background jobs so they can be processed asynchronously.
- **Worker:** Processes background tasks, such as sending notifications or performing maintenance work.

## 7. GET /notes Request Flow

1. The user opens the notes page in the browser.
2. DNS resolves the application domain name.
3. The CDN serves cached static files where possible.
4. The request reaches the load balancer.
5. The load balancer sends the API request to an available application server.
6. The application server checks the user's authentication and permissions.
7. The server checks the cache for the requested notes.
8. If the notes are not cached, the server reads them from the database or an appropriate read replica.
9. The server returns the notes as JSON.
10. The browser displays the notes to the user.

## 8. POST /notes Request Flow

1. The user fills in the note form and submits it.
2. The browser sends a POST request containing the note data.
3. The load balancer forwards the request to an application server.
4. The server authenticates the user and validates the note title and body.
5. The server saves the new note to the primary database.
6. The database confirms that the note was saved.
7. The application server returns a `201 Created` response with the new note.
8. The browser displays the new note to the user.

If a background task is needed, the server can place it in the message queue for a worker to process later.

## 9. Trade-Offs

### Cache vs Fresh Data

Caching makes reads faster and reduces database load. However, cached notes may become outdated after a user updates or deletes them. The application should invalidate or update the relevant cache entries after changes.

### Read Replicas vs Consistency

Read replicas help handle more read requests, but replication can take time. A recently created note might not appear immediately if it is read from a replica. Reading recent changes from the primary database can help when immediate consistency is needed.

### More Servers vs Cost

Adding application servers improves capacity and availability, but it also increases infrastructure costs. The number of servers should grow based on actual traffic and monitoring.

### SQL Database vs Simplicity

A relational database supports relationships between users, notes, and tags. However, joins and database management can become more complex as the application grows.

## 10. Avoiding Single Points of Failure

- Run at least two application servers behind a load balancer.
- Use health checks so unhealthy servers stop receiving traffic.
- Deploy the load balancer and other critical infrastructure with appropriate redundancy.
- Back up the database regularly and test restoration.
- Configure database replication and a recovery plan for primary database failure.
- Monitor errors, response times, and resource usage so problems can be detected early.
- Use durable queues and retry failed background jobs when appropriate.
