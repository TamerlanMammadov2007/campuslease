# CampusLease Backend

Fastify + SQLite API for listings and applications.

## Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3001`.

## Endpoints

- `GET /api/health`
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`
- `POST /api/applications`
- `GET /api/applications?listingId=1`
- `GET /api/auth/me`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/admin/me`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/listings`
- `GET /api/admin/applications`
- `GET /api/admin/threads`
- `GET /api/admin/login-events`
- `PUT /api/admin/users/:id`
- `PUT /api/admin/listings/:id`
- `DELETE /api/admin/listings/:id`
- `GET /api/threads`
- `GET /api/threads/:id`
- `POST /api/threads`
- `POST /api/threads/:id/messages`
- `POST /api/threads/:id/read`
