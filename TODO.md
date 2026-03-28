# ISOP+ Bug Fix Implementation TODO

Status: [0/12] Completed

## Approved Bug Fix Plan Breakdown

### 1. Core Fixes [ ]
- [x] 1.1 Fix supabase.js: Define missing mentor functions (getMyReviews, getMyMentees, scheduleMeeting, uploadResource) with proper Supabase queries
- [x] 1.2 Fix backend.js: Remove circular calls, proxy to supabase.js exports

Status: [5/12] Completed
- [ ] 1.3 Fix main.js: Add bindOpportunityActionButtons utility + event delegation to de-dupe listeners

### 2. LocalDB Implementation [ ]
- [ ] 2.1 Implement assets/js/localdb.js: IndexedDB wrapper for window.localDB (get/setCollection, getCurrentUser, clearCurrentUser)
- [ ] 2.2 Seed initial data: users, opportunities, mentors, notifications

### 3. main.js Robustness [ ]
- [ ] 3.1 Add null checks & window.localDB fallbacks throughout render funcs
- [ ] 3.2 Extract small render utilities from massive renderStudentDashboard
- [ ] 3.3 Add try/catch error handling in dashboard renders
- [ ] 3.4 Replace alert() with renderAlert() for better UX

### 4. Security/Polish [ ]
- [ ] 4.1 Mask/hide Supabase keys (use env or comment out)
- [ ] 4.2 Update original TODO.md progress markers

### 5. Testing [ ]
- [ ] 5.1 Test student login → dashboard → apply/save opp
- [ ] 5.2 Test mentor login → schedule meeting, upload resource (no crashes)
- [ ] 5.3 Verify localDB persistence across refreshes
- [ ] 5.4 Check console: no ReferenceErrors/undefined calls

### 6. Completion [ ]
- [ ] 6.1 Update this TODO.md with ✓ marks
- [ ] 6.2 Run attempt_completion

Next step: Fix supabase.js missing functions → backend.js → main.js → localdb.js → test.

Updated after each step completed.
