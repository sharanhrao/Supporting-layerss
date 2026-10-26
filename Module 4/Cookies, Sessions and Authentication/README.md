# Cookies, Sessions and Authentication

## Local Setup

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Set `COOKIE_SECRET` in `.env` to a unique random secret of at least 32 characters. Keep `COOKIE_SECURE=false` for local HTTP. Production always enables Secure cookies and must be served over HTTPS. `SESSION_TTL_MS` controls both the browser cookie lifetime and server session expiry.

Seeded demo account: `sam@example.com` / `SessionDemo!48`.

## Endpoints

- `POST /auth/login` accepts `{ "email": "sam@example.com", "password": "SessionDemo!48" }`. It normalizes the email, verifies the password with bcrypt, creates a random server-side session, and returns safe user fields.
- `GET /auth/me` returns the authenticated user's `id`, `name`, and `email` only when the signed cookie resolves to a live session and existing user.
- `POST /auth/logout` revokes the server-side session, clears the cookie, and returns `204`. Repeated logout requests are safe.

## Verify

Keep the login cookie in a cookie jar, then send it to the protected endpoint:

```bash
curl -i -c cookies.txt \
	-H 'Content-Type: application/json' \
	-d '{"email":"sam@example.com","password":"SessionDemo!48"}' \
	http://localhost:3000/auth/login

curl -i -b cookies.txt http://localhost:3000/auth/me
curl -i http://localhost:3000/auth/me
curl -i -b cookies.txt -X POST http://localhost:3000/auth/logout
curl -i -b cookies.txt http://localhost:3000/auth/me
```

Login should set `sid` with `HttpOnly` and `SameSite=Lax`; local HTTP omits `Secure`. The final request should return the same generic `401 AUTH_REQUIRED` response as a missing or altered cookie. Logout expires the cookie and removes its server record, so replaying a copied pre-logout cookie also returns `401`. With `NODE_ENV=production`, `Secure` is enabled; use HTTPS when testing because browsers and HTTP clients should not send Secure cookies over plain HTTP.

## Session Storage

The included in-memory Map is for learning and single-process local execution only. A restart loses all sessions, and multiple application processes do not share them. Production deployments need a shared expiring store such as Redis, while keeping the same create, resolve, expiry, and destroy contract.

The cookie contains only a signed opaque session ID. User identity stays on the server, and Prisma access is isolated in `src/repositories/userRepository.js`. Never commit `.env` or a real signing secret; `.env.example` contains placeholders only.
