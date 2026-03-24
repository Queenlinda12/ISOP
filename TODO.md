# ISOP+ Mentor Features Implementation TODO

Status: [0/14] Completed

## Approved Plan Breakdown

### 1. Setup & DB Schema [ ]
- [x] Guide/setup Supabase tables: meetings, reviews, resources (w/RLS) → SQL provided above
- [ ] Update Supabase keys in supabase.js/backend.js if needed

### 2. Backend Enhancements [ ]
- [x] Add mentor funcs to supabase.js: getMyReviews(), getMyMentees(), scheduleMeeting(), uploadResource()
- [x] Integrate in backend.js

### 3. Frontend Core [ ]
- [x] Enhance main.js renderMentorDashboard(): functional lists/tables/buttons with async data/UI controls
- [x] Add scheduling, review list, upload handler (w/ fallbacks)

### 4. New/Extend UI Pages [ ]
- [x] Create pages/mentor-tools.html (tabs: Schedule, Reviews, Resources, Mentees w/ Flatpickr)
- [ ] Update pages/mentorship.html (mentor entry point)
- [x] Update pages/dashboard.html (scripts + mentor link)

### 5. CSS & Polish [ ]
- [ ] assets/css/style.css: calendar/upload styles

### 6. Testing & Integration [ ]
- [ ] Real auth role sync (localStorage -> Supabase profile.role)
- [ ] Test: Login mentor → schedule/view/upload
- [ ] Error handling, loading states

### 7. Admin/Student Ties [ ]
- [ ] Admin: manage meetings/reviews
- [ ] Student: request/book meetings

Next: DB schema → backend → frontend.

Updated after each step.

