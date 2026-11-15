# Estrella

## Local setup

1. Copy `.env.example` to `.env`, then set `MONGO_URL` and a unique
   `ADMIN_PASSWORD` with at least 12 characters and no more than 72 UTF-8
   bytes. Admin profile values may also be customized using the `ADMIN_*`
   variables. Keep the populated `.env` local and uncommitted.
2. Run `pnpm install`, then `pnpm run dev:all`.
3. Open the Vite URL and sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

The server refuses to start without `ADMIN_PASSWORD`; it seeds the initial
administrator only when that username is not already present. Passwords are
hashed with bcrypt and are never returned by GraphQL.

## Authentication and authorization

Sessions use random, revocable server-side tokens. Only a SHA-256 token hash is
stored in MongoDB; the browser receives an `HttpOnly`, `Secure`,
`SameSite=Strict` cookie with an eight-hour lifetime. The React app does not
persist authentication tokens in browser storage.

All GraphQL requests require a valid session. `ADMIN` can manage employees at `/admin` and
all records; `RECEPTION` can manage patients and schedule/cancel appointments;
`DOCTOR` can see only their assigned patients and appointments and can update
or cancel their own consultations. Every role can view and update its own
employee profile at `/profile`; employee registration derives age and gender
from the validated registration number on the server. These checks are
enforced by the API in addition to the route and navigation guards in React.

Vite loads `.env.development` for the frontend. The backend uses the root
`.env` file (via `dotenv/config`), so setting credentials only in
`.env.development` will not seed the admin. Vite's local file points GraphQL and auth requests to
`http://localhost:4000`; both Apollo and `fetch` include credentials. The
backend defaults to allowing `http://localhost:5173`. If the local backend
uses another port, update `VITE_GRAPHQL_URI` and `FRONTEND_ORIGIN`.

For production, the frontend uses the same-site `/graphql` and `/auth` Vercel
rewrites, which are required for strict SameSite cookies. Set
`FRONTEND_ORIGIN` to the exact frontend origin and update API destinations in
`vercel.json` when deploying the backend elsewhere. Do not point the browser
directly at a different-site API while using `SameSite=Strict`.

Existing appointments created before this change may not have `doctorId`.
They remain readable to admin/reception users but are not included in doctor
views until assigned to an employee.
