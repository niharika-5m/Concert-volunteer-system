# Stagehand: concert crew deployment

Next.js 14 (App Router) + Tailwind. The API is built in as Next.js Route Handlers (`src/app/api`), so there is **no separate backend to run**. MySQL is the main database; MongoDB is optional and powers the Activity feed.

## Setup (about 5 minutes)

Requires **Node 20.6+** and your MySQL database already created from your DDL + DML.

1. **Install**
   ```bash
   npm install
   ```
2. **Run the migration once** (adds `users.Password_Hash`, fixes the staffing view, makes sure the trigger exists):
   ```bash
   mysql -u root -p < sql/01_app_migration.sql
   ```
   (MySQL Workbench: open the file and run it.)
3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `DB_USER`, `DB_PASSWORD`, and an `AUTH_SECRET` (`openssl rand -base64 32`).
4. **Give your existing users a (hashed) password**
   ```bash
   npm run set-passwords
   ```
   Sets the default `Concert@123` for users without one (stored as a bcrypt hash only). Use `npm run set-passwords -- YourPass#1 --all` to choose your own for everyone.
5. **Run**
   ```bash
   npm run dev      # http://localhost:3000
   ```

Sign in as `organizer1` (Organizer) or `rahul` / `priya` / `arjun` (Staff).

## MongoDB (optional)

Set `MONGODB_URI`, `MONGODB_DB`, `MONGODB_COLLECTION` to **your** database/collection. Every important action (event/shift/staff created, assignment changes, check-in/out, availability) inserts a document like:

```json
{ "actor": {"username": "organizer1", "role": "Organizer"}, "action": "assignment.created",
  "entity": "assignment", "entityId": 7, "details": {"staffId": 2, "shiftId": 1}, "at": "<Date>" }
```
The Activity screen shows the latest 50. Leave `MONGODB_URI` empty and the app works fine without it (Mongo failures never block MySQL writes).

## Who can do what

| Capability | Organizer | Staff |
|---|---|---|
| Overview | Org-wide stats, short-staffed shifts, workload | Own upcoming / to-confirm / completed |
| Events | View + create | View |
| Shifts and staffing | Create shifts + skill requirements, assign crew (ranked suggestions) | n/a |
| Crew | View, search, add (login + profile + skills in one transaction) | n/a |
| Assignments | See all; confirm, cancel, complete, check in/out | See only own; confirm or decline; check in/out |
| Availability | n/a | Set own dates |
| Activity | MySQL history + Mongo feed | n/a |

Roles are enforced **in the API** (`handler(..., { roles })` in `src/lib/http.js`); hiding menu items in the UI is only a convenience.

## Beyond CRUD (maps to "advanced features")

- **Views**: `shift_staffing_status` and `staff_workload` drive the dashboard and crew data.
- **Trigger**: `after_assignment_insert` writes the "Assignment Created" history row.
- **Transactions**: assigning crew (row lock + availability check + clash check), creating shifts with requirements, creating staff accounts, check-out (attendance + status + history).
- **Integrity**: zone must belong to the event's venue; no shifts on cancelled/completed events; no double-booking overlapping shifts; DB `CHECK` / `UNIQUE` / FK violations become readable messages.
- **Search/filter**: crew search, assignment status filter, shifts-by-event filter.

## Notes

- **View bug in the DDL**: `shift_staffing_status` in `30_DDL.sql` joins `assignment` and `shift_requirement` together, which multiplies the counts (a shift with 2 requirement rows and 2 assignments reports 4 assigned). The migration replaces it with the subquery version from your DML file.
- `ENFORCE_CHECKIN_WINDOW=true` limits check-in to 60 minutes before the shift until it ends (off by default so you can demo with the 2027 sample data).
- For your report: HTTPS (the cookie is `Secure` in production), login rate limiting and a stronger password policy are the natural next hardening steps.
- If your API lives elsewhere, set `NEXT_PUBLIC_API_BASE_URL`; all calls are in `src/lib/api.js`.

## Project map

```
sql/01_app_migration.sql          one-time DB changes
scripts/set-passwords.mjs         hashes passwords for existing users
src/lib/api.js                    client fetch functions (GET / POST / PATCH)
src/lib/{db,auth,http,mongo}.js   server helpers
src/app/api/**                    REST endpoints
src/app/{login,dashboard}         pages
src/components/views/*            one file per screen
```
