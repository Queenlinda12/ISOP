# ISOP+ — Inclusive Skills & Opportunities Platform

ISOP+ is a static web application that connects disabled youth and women with opportunities, skills training, mentorship, and application tracking. No build tools or server required — open in a browser and go.

---

## Project Structure

```
ISOP+/
├── index.html                    # Home / landing page
├── pages/
│   ├── about.html                # About & mission
│   ├── admin.html                # Admin dashboard (admin role only)
│   ├── apply.html                # Opportunity application form
│   ├── contact.html              # Contact page
│   ├── dashboard.html            # General dashboard
│   ├── login.html                # Login & quick-access demo buttons
│   ├── mentor-dashboard.html     # Mentor overview
│   ├── mentor-tools.html         # Mentor tools (mentor role only)
│   ├── mentorship.html           # Mentorship programme info
│   ├── opportunities.html        # Opportunity listings
│   ├── opportunity-details.html  # Single opportunity detail view
│   ├── register.html             # New user registration
│   ├── student-dashboard.html    # Student dashboard (student role only)
│   └── training.html             # Skills & training resources
├── assets/
│   ├── css/
│   │   └── style.css             # Global stylesheet
│   └── js/
│       ├── auth.js               # Auth system — login, role routing, demo users
│       ├── supabase.js           # Supabase client + API helpers
│       ├── main.js               # Core app logic, UI interactions
│       ├── student-dashboard.js  # Student dashboard data & actions
│       ├── admin-dashboard.js    # Admin dashboard data & actions
│       ├── localdb.js            # IndexedDB wrapper for offline/local storage
│       ├── backend.js            # Generic backend helpers
│       └── button-fixer.js       # UI fix for button states
└── README.md
```

---

## Running the Website

This is a plain HTML/CSS/JS project — **no npm, no build step, no server required**.

### Option 1 — VS Code Live Server (recommended)

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code.
2. Open the `ISOP+` folder in VS Code.
3. Right-click `index.html` → **Open with Live Server**.
4. The site opens at `http://127.0.0.1:5500`.

### Option 2 — Python HTTP Server

```bash
# Python 3
python -m http.server 5500
# then open http://localhost:5500
```

### Option 3 — Double-click

Open `index.html` directly in any browser. Some features (Supabase, file uploads) work best when served over HTTP, but browsing and the demo login work fine via `file://`.

---

## Demo Accounts (no sign-up needed)

Use the quick-login buttons on the Login page, or enter these credentials manually:

| Role    | Email                 | Password    | Redirects to            |
|---------|-----------------------|-------------|-------------------------|
| Student | student@isop.com      | student123  | student-dashboard.html  |
| Mentor  | mentor@isop.com       | mentor123   | mentor-tools.html       |
| Admin   | admin@isop.com        | admin123    | admin.html              |

Demo sessions are stored in `localStorage` — clearing browser data logs you out.

---

## Backend — Supabase

The live Supabase project is configured in `assets/js/supabase.js`. It handles:

- User authentication (sign-up / sign-in / sign-out / session)
- Applications table (submissions + CV file uploads to `applications/` storage bucket)
- Opportunities table
- Meetings table (mentor–mentee scheduling)
- Resources table (mentor file uploads to `resources/` storage bucket)
- Reviews table
- Profiles table (role management)

If Supabase is unreachable the site falls back to **offline mode** using the local IndexedDB (`localdb.js`), so the demo still works without an internet connection.

---

## Role-Based Access

| Role    | Access                                          |
|---------|-------------------------------------------------|
| Student | Student dashboard, opportunities, apply, training, mentorship |
| Mentor  | Mentor tools, schedule meetings, upload resources |
| Admin   | Admin dashboard, manage users & opportunities   |

`auth.js` handles routing — users are redirected to the correct dashboard on login and blocked from pages outside their role.

---

## Key JavaScript Files

| File | Purpose |
|------|---------|
| `auth.js` | Login, registration, role-based redirect, demo-user seed |
| `supabase.js` | Supabase client init + all DB/storage API calls |
| `main.js` | Page interactions, nav, modals, opportunity cards |
| `student-dashboard.js` | Student stats, application history, recommended opportunities |
| `admin-dashboard.js` | Admin stats, user management, opportunity CRUD |
| `localdb.js` | IndexedDB wrapper — used as offline fallback |
| `backend.js` | Shared helper functions for data fetching |
| `button-fixer.js` | Prevents double-submit on buttons |

---

## Accessibility

- Skip-to-content link on every page
- ARIA roles and labels on navigation and interactive elements
- Keyboard-navigable nav with hamburger toggle
- Responsive layout — works on mobile, tablet, and desktop

---

## Notes

- All session data is stored in `localStorage` under the key `isop_auth`.
- Registered users (non-demo) are stored in `localStorage` under `users` via `localdb.js`.
- The Supabase anon key in `supabase.js` is a **publishable** key — safe to commit.
