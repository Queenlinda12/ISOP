/*
  ISOP+ Main JavaScript
  - Improve navigation behavior
  - Scaffold for future interactivity (forms, dashboards, tracking)
*/

;(function () {
  'use strict'

  const navToggle = document.querySelector('.nav-toggle')
  const primaryNav = document.getElementById('primary-nav')

  if (!navToggle || !primaryNav) return

  const closeNav = () => {
    navToggle.setAttribute('aria-expanded', 'false')
    primaryNav.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('nav-open')
  }

  const openNav = () => {
    navToggle.setAttribute('aria-expanded', 'true')
    primaryNav.setAttribute('aria-hidden', 'false')
    document.body.classList.add('nav-open')
  }

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true'

    if (expanded) {
      closeNav()
    } else {
      openNav()
    }
  })

  // Close navigation when clicking outside on small screens
  document.addEventListener('click', (event) => {
    if (!primaryNav.contains(event.target) && !navToggle.contains(event.target)) {
      closeNav()
    }
  })

  // Close navigation when pressing Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav()
    }
  })
})()

/* ---------------------------------------------------------------------------
   Basic auth + dashboard rendering (client-side simulation)
   - Stores a lightweight user role in localStorage
   - Updates the dashboard based on role
   - Adds sentinel links (login/register/logout) in header
*/

const AUTH_KEY = 'isop_auth'
const APPLICATIONS_KEY = 'isop_applications'

const opportunitiesData = [
  { id: 'opp-001', title: 'UX Design Internship', type: 'internship', location: 'Remote', tags: ['UX', 'Accessibility', 'Figma'], slots: 12, description: 'Collaborate on inclusive digital products', deadline: '2026-04-15' },
  { id: 'opp-002', title: 'Junior Frontend Developer', type: 'job', location: 'Worldwide', tags: ['JavaScript', 'React', 'Inclusive Design'], slots: 8, description: 'Build accessible web apps', deadline: '2026-04-30' },
  { id: 'opp-003', title: 'Women in Tech Grant', type: 'grant', location: 'Rwanda', tags: ['Women', 'Tech', 'Leadership'], slots: 20, description: 'Funding for tech education', deadline: '2026-05-01' },
  { id: 'opp-004', title: 'Accessibility Research', type: 'contract', location: 'Hybrid', tags: ['Research', 'A11y', 'UX'], slots: 5, description: 'Study assistive tech', deadline: '2026-04-20' },
  { id: 'opp-005', title: 'Backend Developer Internship', type: 'internship', location: 'Kigali', tags: ['Node.js', 'Python', 'API'], slots: 10, description: 'Build scalable services', deadline: '2026-04-25' },
  { id: 'opp-006', title: 'Community Impact Fellowship', type: 'fellowship', location: 'Remote', tags: ['Community', 'Leadership', 'Disability'], slots: 6, description: 'Lead inclusive projects', deadline: '2026-05-10' },
  { id: 'opp-007', title: 'Data Analyst Role', type: 'job', location: 'Worldwide', tags: ['Data', 'Excel', 'Tableau'], slots: 15, description: 'Analyze impact metrics', deadline: '2026-04-18' },
  { id: 'opp-008', title: 'Scholarship for Disabled Youth', type: 'scholarship', location: 'Rwanda', tags: ['Scholarship', 'Disability', 'Education'], slots: 25, description: 'Full tuition support', deadline: '2026-05-05' }
]

const trainingsData = [
  { id: 'trn-1', title: 'Inclusive UX Design', completed: 70 },
  { id: 'trn-2', title: 'Assistive Tech Fundamentals', completed: 40 },
  { id: 'trn-3', title: 'Career Readiness Workshop', completed: 90 },
]

// Synchronous localStorage helpers (IndexedDB getCollection is async and cannot be used synchronously)
function getLocalData(name) {
  try { return JSON.parse(localStorage.getItem('isop_col_' + name) || '[]') } catch (e) { return [] }
}
function setLocalData(name, items) {
  try { localStorage.setItem('isop_col_' + name, JSON.stringify(items)) } catch (e) {}
}

// const mentorshipData = [  // Kept for fallback
//   { mentee: 'Claire K.', progress: 65, lastSession: '2026-03-28', nextSession: '2026-04-02' },
//   { mentee: 'James O.', progress: 30, lastSession: '2026-03-20', nextSession: '2026-04-05' },
//   { mentee: 'Rosa N.', progress: 45, lastSession: '2026-03-22', nextSession: '2026-04-01' },
// ]


function getAuth() {
  try { return JSON.parse(localStorage.getItem('isop_auth')) } catch (e) { return null }
}

function setAuth(auth) {
  if (window.localDB) window.localDB.setCurrentUser(auth)
}

function isSignedIn() {
  const auth = getAuth()
  return !!(auth && auth.role && auth.email)
}

function redirectSignedInUser() {
  if (!isSignedIn()) return
  const auth = getAuth()
  const current = window.location.pathname.toLowerCase()
  const onAuthPage = current.endsWith('/login.html') || current.endsWith('/register.html')
  if (!onAuthPage) return
  const route = auth.role === 'student' ? 'student-dashboard.html' : auth.role === 'mentor' ? 'mentor-tools.html' : 'admin.html'
  const prefix = current.includes('/pages/') ? '' : 'pages/'
  window.location.href = prefix + route
}

function restrictDashboardAccess() {
  const current = window.location.pathname.toLowerCase()
  const protectedPages = ['student-dashboard.html', 'mentor-dashboard.html', 'mentor-tools.html', 'dashboard.html', 'admin.html']
  if (protectedPages.some((p) => current.endsWith(p)) && !isSignedIn()) {
    const loginPath = current.includes('/pages/') ? '../login.html' : 'pages/login.html'
    window.location.href = loginPath
  }
}

function clearAuth() {
  if (window.localDB) window.localDB.clearCurrentUser()
}

function getApplications() {
  return getLocalData('applications')
}

function setApplications(apps) {
  setLocalData('applications', apps)
  if (window.localDB) window.localDB.setCollection('applications', apps)
}

function getOpportunities() {
  const local = getLocalData('opportunities')
  if (local && local.length) return local
  return opportunitiesData
}

function addApplication(application) {
  const apps = getApplications()
  const existing = apps.find((item) => item.email === application.email && item.opportunityId === application.opportunityId)
  if (existing) return false
  apps.unshift(application)
  setApplications(apps)
  return true
}

function getCurrentUser() {
  return getAuth()
}

function getStudentApplications() {
  const auth = getCurrentUser()
  if (!auth) return []
  return getApplications().filter((app) => app.email === auth.email || app.userId === auth.id)
}

function getStudentSavedEntries() {
  const auth = getCurrentUser()
  if (!auth) return []
  const saved = getLocalData('savedOpportunities')
  return saved.filter((s) => s.userId === auth.id)
}

function getStudentSavedOpportunities() {
  const saved = getStudentSavedEntries()
  const all = getOpportunities()
  return saved
    .map((s) => all.find((opp) => opp.id === s.opportunityId))
    .filter(Boolean)
}

function getStudentMentor() {
  const auth = getCurrentUser()
  if (!auth) return null
  const assignments = getLocalData('menteeAssignments')
  const mentors = getLocalData('mentors')
  const assignment = assignments.find((a) => a.menteeId === auth.id)
  if (!assignment) return null
  return mentors.find((m) => m.id === assignment.mentorId) || null
}

function getStudentMeetings() {
  const auth = getCurrentUser()
  if (!auth) return []
  const meetings = getLocalData('meetings')
  return meetings.filter((m) => m.menteeId === auth.id || m.userId === auth.id).sort((a, b) => new Date(a.time) - new Date(b.time))
}

function getStudentNotifications() {
  const auth = getCurrentUser()
  if (!auth) return []
  const notifications = getLocalData('notifications')
  return notifications.filter((n) => n.userId === auth.id).sort((a, b) => new Date(b.createdAt || b.time || Date.now()) - new Date(a.createdAt || a.time || Date.now())).slice(0, 8)
}

function getStudentTrainingProgress() {
  const auth = getCurrentUser()
  if (!auth) return trainingsData || []
  const training = getLocalData('trainingModules')
  const base = training.length ? training : (trainingsData || [])
  return base.map((mod) => ({
    ...mod,
    progress: (mod.progressByEmail && mod.progressByEmail[auth.email]) ? mod.progressByEmail[auth.email] : (mod.completed || 0),
    completed: ((mod.progressByEmail && mod.progressByEmail[auth.email]) || mod.completed || 0) >= 100
  }))
}

function getRecommendedOpportunities() {
  const studentApps = getStudentApplications().map((a) => a.opportunityId)
  const saved = getStudentSavedEntries().map((s) => s.opportunityId)
  return getOpportunities()
    .filter((opp) => !studentApps.includes(opp.id) && !saved.includes(opp.id))
    .slice(0, 8)
}

function saveOpportunity(opportunityId) {
  const auth = getCurrentUser()
  if (!auth) return false
  const saved = getLocalData('savedOpportunities')
  if (saved.some((item) => item.userId === auth.id && item.opportunityId === opportunityId)) return false
  saved.unshift({ id: `saved_${Date.now()}`, userId: auth.id, opportunityId, createdAt: new Date().toISOString() })
  setLocalData('savedOpportunities', saved)
  if (window.localDB) window.localDB.setCollection('savedOpportunities', saved)
  return true
}

function removeSavedOpportunity(opportunityId) {
  const auth = getCurrentUser()
  if (!auth) return false
  const saved = getLocalData('savedOpportunities')
  const filtered = saved.filter((item) => !(item.userId === auth.id && item.opportunityId === opportunityId))
  setLocalData('savedOpportunities', filtered)
  if (window.localDB) window.localDB.setCollection('savedOpportunities', filtered)
  return true
}

function requestMeeting(mentorId, datetime, notes) {
  const auth = getCurrentUser()
  if (!auth) return null
  if (!datetime) return null
  const meetings = getLocalData('meetings')
  const newMeeting = {
    id: `meeting_${Date.now()}`,
    mentorId: mentorId || null,
    menteeId: auth.id,
    userId: auth.id,
    time: new Date(datetime).toISOString(),
    status: 'Requested',
    notes: notes || '',
    createdAt: new Date().toISOString()
  }
  meetings.unshift(newMeeting)
  setLocalData('meetings', meetings)
  if (window.localDB) window.localDB.setCollection('meetings', meetings)
  return newMeeting
}

function continueTraining(moduleId) {
  const auth = getCurrentUser()
  if (!auth) return false
  let trainings = getLocalData('trainingModules')
  if (!trainings.length) trainings = (typeof trainingsData !== 'undefined') ? JSON.parse(JSON.stringify(trainingsData)) : []
  const mod = trainings.find((m) => m.id === moduleId)
  if (!mod) return false
  if (!mod.progressByEmail) mod.progressByEmail = {}
  const current = mod.progressByEmail[auth.email] || 0
  mod.progressByEmail[auth.email] = Math.min(100, current + 20)
  setLocalData('trainingModules', trainings)
  if (window.localDB) window.localDB.setCollection('trainingModules', trainings)
  return true
}

function applyForOpportunity(opportunity) {
  const auth = getCurrentUser()
  if (!auth) return false
  const applied = addApplication({
    id: `app_${Date.now()}`,
    userId: auth.id,
    email: auth.email,
    opportunityId: opportunity.id,
    title: opportunity.title,
    status: 'Submitted',
    submittedAt: Date.now()
  })
  if (applied) {
    const notifications = getLocalData('notifications')
    notifications.unshift({ id: `notf_${Date.now()}`, userId: auth.id, text: `Application submitted for ${opportunity.title}`, createdAt: new Date().toISOString(), read: false })
    setLocalData('notifications', notifications)
    if (window.localDB) window.localDB.setCollection('notifications', notifications)
  }
  return applied
}

function bindOpportunityActionButtons(auth, container) {
  document.querySelectorAll('.btn-apply-opportunity').forEach((btn) => {
    btn.onclick = (event) => {
      const oppId = event.currentTarget.dataset.oppId
      const opp = getOpportunities().find((o) => o.id === oppId)
      if (!opp) return renderAlert('error', 'Opportunity not found', 'main')
      const success = applyForOpportunity(opp)
      if (success) {
        renderAlert('success', `Applied for ${opp.title}`, 'main')
        renderStudentDashboard(auth, container)
      } else {
        renderAlert('error', 'Already applied or error', 'main')
      }
    }
  })

  document.querySelectorAll('.btn-save-opportunity').forEach((btn) => {
    btn.onclick = (event) => {
      const oppId = event.currentTarget.dataset.oppId
      const ok = saveOpportunity(oppId)
      if (ok) {
        renderAlert('success', 'Opportunity saved', 'main')
      } else {
        renderAlert('warning', 'Already saved or error', 'main')
      }
      renderStudentDashboard(auth, container)
    }
  })

  document.querySelectorAll('.btn-remove-saved').forEach((btn) => {
    btn.onclick = (event) => {
      const oppId = event.currentTarget.dataset.oppId
      removeSavedOpportunity(oppId)
      renderAlert('success', 'Saved opportunity removed', 'main')
      renderStudentDashboard(auth, container)
    }
  })

  document.querySelectorAll('.btn-view-opportunity').forEach((btn) => {
    btn.onclick = (event) => {
      const oppId = event.currentTarget.dataset.oppId
      const opp = getOpportunities().find((o) => o.id === oppId)
      if (!opp) return renderAlert('error', 'Opportunity not found', 'main')
      window.location.href = 'pages/opportunity-details.html?oppId=' + encodeURIComponent(opp.id)
    }
  })
}

function renderStudentStats(auth) {
  const availableOps = getOpportunities().length
  const applied = getStudentApplications().length
  const saved = getStudentSavedOpportunities().length
  const completed = getStudentTrainingProgress().filter((t) => t.completed).length

  return `
    <div class="feature-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
      <article class="feature-card">
        <h3>Available Opportunities</h3>
        <p class="feature-title">${availableOps}</p>
      </article>
      <article class="feature-card">
        <h3>Applications Submitted</h3>
        <p class="feature-title">${applied}</p>
      </article>
      <article class="feature-card">
        <h3>Saved Opportunities</h3>
        <p class="feature-title">${saved}</p>
      </article>
      <article class="feature-card">
        <h3>Training Modules Completed</h3>
        <p class="feature-title">${completed}</p>
      </article>
    </div>
  `
}

function renderRecommendedOpportunities(auth) {
  const rec = getRecommendedOpportunities()
  if (!rec.length) return '<p>No new recommended opportunities right now.</p>'
  const cards = rec.map((opp) => `
    <article class="feature-card">
      <h4>${opp.title}</h4>
      <p>${opp.location} • ${opp.type}</p>
      <p>${opp.description || ''}</p>
      <p>Deadline: ${opp.deadline || 'TBD'}</p>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;">
        <button class="btn btn--secondary btn-view-opportunity" data-opp-id="${opp.id}">Details</button>
        <button class="btn btn--primary btn-apply-opportunity" data-opp-id="${opp.id}">Apply</button>
        <button class="btn btn--outline btn-save-opportunity" data-opp-id="${opp.id}">Save</button>
      </div>
    </article>
  `).join('')
  return `<div class="feature-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">${cards}</div>`
}

function renderStudentApplications(auth) {
  const apps = getStudentApplications()
  if (!apps.length) return '<p>No applications yet.</p>'
  const rows = apps.map((app) => `
    <tr>
      <td>${app.title}</td>
      <td>${new Date(app.submittedAt).toLocaleDateString()}</td>
      <td>${makeBadge(app.status)}</td>
      <td>${app.opportunityId || ''}</td>
    </tr>
  `).join('')
  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr><th>Opportunity</th><th>Date Applied</th><th>Status</th><th>ID</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function renderSavedOpportunities(auth) {
  const savedOps = getStudentSavedOpportunities()
  if (!savedOps.length) return '<p>No saved opportunities yet.</p>'
  const cards = savedOps.map((opp) => `
    <article class="feature-card" style="margin-bottom: 0.75rem;">
      <h4>${opp.title}</h4>
      <p>${opp.location} • ${opp.type}</p>
      <p>Deadline: ${opp.deadline}</p>
      <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
        <button class="btn btn--primary btn-apply-opportunity" data-opp-id="${opp.id}">Apply</button>
        <button class="btn btn--outline btn-remove-saved" data-opp-id="${opp.id}">Remove</button>
      </div>
    </article>
  `).join('')
  return cards
}

function renderTrainingProgress(auth) {
  const training = getStudentTrainingProgress()
  if (!training.length) return '<p>No training modules found.</p>'
  const list = training.map((mod) => {
    const progress = mod.progress || 0
    const completed = mod.completed
    return `
      <article class="feature-card" style="margin-bottom:0.75rem;">
        <h4>${mod.title}</h4>
        <div class="progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress__fill" style="width:${progress}%;"></div>
        </div>
        <p>${progress}% ${completed ? '(Completed)' : '(In progress)'}</p>
        <button class="btn btn--secondary btn-continue-training" data-module-id="${mod.id}">${completed ? 'Review' : 'Continue'}</button>
      </article>
    `
  }).join('')
  return `<div>${list}</div>`
}

function renderMentorCard(auth) {
  const mentor = getStudentMentor()
  if (!mentor) return '<p>No mentor assigned yet.</p>'
  const user = getLocalData('users').find((u) => u.id === mentor.userId) || null
  const meetings = getStudentMeetings()
  const nextMeeting = meetings.find((m) => new Date(m.time) > new Date())
  return `
    <article class="feature-card">
      <h4>${user ? user.name : 'Mentor'}</h4>
      <p>${mentor.expertise}</p>
      <p>Assigned mentees: ${mentor.mentees?.length || 0}</p>
      <p>Next Session: ${nextMeeting ? new Date(nextMeeting.time).toLocaleString() : 'Not scheduled'}</p>
      <a class="btn btn--secondary" href="mentorship.html">Message Mentor</a>
    </article>
  `
}

function renderMeetings(auth) {
  const meetings = getStudentMeetings()
  if (!meetings.length) return '<p>No meetings scheduled.</p>'
  const rows = meetings.map((m) => {
    const mentor = getLocalData('mentors').find((mr) => mr.id === m.mentorId) || null
    const mentorName = mentor ? (getLocalData('users').find((u) => u.id === mentor.userId)?.name || '') : ''
    return `
      <tr>
        <td>${mentorName || m.mentorId}</td>
        <td>${new Date(m.time).toLocaleString()}</td>
        <td>${m.status}</td>
        <td>${m.notes || '—'}</td>
      </tr>
    `
  }).join('')
  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead><tr><th>Mentor</th><th>Date/Time</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function renderNotifications(auth) {
  const notes = getStudentNotifications()
  if (!notes.length) return '<p>No notifications.</p>'
  const items = notes.map((n) => `
    <article class="feature-card" style="margin-bottom: 0.5rem;">
      <p>${n.text}</p>
      <small>${new Date(n.createdAt || n.time).toLocaleString()}</small>
    </article>
  `).join('')
  return items
}

function renderStudentDashboard(auth, container) {
  console.log('renderStudentDashboard', auth, container)
  if (!auth) return

  const mentor = getStudentMentor()
  const nextMeeting = getStudentMeetings().find((m) => new Date(m.time) > new Date())

  container.innerHTML = `
    <div style="margin-bottom: 1.2rem;">
      <h1>Welcome back, ${auth.name || auth.email}</h1>
      <p>You are signed in as <strong>${auth.role}</strong>. Here is your personalized student space.</p>
    </div>

    <section aria-label="Student stats">
      ${renderStudentStats(auth)}
    </section>

    <section style="margin-bottom:1.2rem;">
      <div style="display:flex;gap:0.5rem; flex-wrap:wrap; align-items:center; margin-bottom:0.5rem;">
        <input id="opp-search" type="search" placeholder="Search opportunities..." style="flex:1; padding: 0.6rem; border-radius: 8px; border: 1px solid #cbd5e1;" />
        <button id="opp-clear-search" class="btn btn--outline">Clear</button>
      </div>
      <h2>Recommended Opportunities</h2>
      <div id="recommendedOps">${renderRecommendedOpportunities(auth)}</div>
    </section>

    <section style="margin-bottom:1.2rem;">
      <h2>My Applications</h2>
      <div id="myApplications">${renderStudentApplications(auth)}</div>
    </section>

    <section style="margin-bottom:1.2rem;">
      <h2>Saved Opportunities</h2>
      <div id="savedOpportunities">${renderSavedOpportunities(auth)}</div>
    </section>

    <section style="margin-bottom:1.2rem;">
      <h2>Training Progress</h2>
      <div id="trainingProgress">${renderTrainingProgress(auth)}</div>
    </section>

    <section style="margin-bottom:1.2rem;">
      <h2>My Mentor</h2>
      <div id="mentorSection">${renderMentorCard(auth)}</div>
    </section>

    <section style="margin-bottom:1.2rem;">
      <h2>Meetings & Sessions</h2>
      <div id="meetingsSection">${renderMeetings(auth)}</div>
      <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <input id="meetingDatetime" type="datetime-local" style="padding:0.6rem; border-radius:8px; border:1px solid #cbd5e1;" />
        <input id="meetingNotes" placeholder="Meeting purpose" style="flex:1; padding:0.6rem; border-radius:8px; border:1px solid #cbd5e1;" />
        <button id="requestMeetingBtn" class="btn btn--primary">Request Meeting</button>
      </div>
      <p style="margin-top:0.5rem;"><strong>Next session:</strong> ${nextMeeting ? new Date(nextMeeting.time).toLocaleString() : 'No upcoming sessions'}</p>
    </section>

    <section style="margin-bottom:1.2rem;">
      <h2>Notifications</h2>
      <div id="notificationsSection">${renderNotifications(auth)}</div>
    </section>

    <section style="margin-bottom:1.2rem;">
      <h2>Quick Actions</h2>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <a class="btn btn--secondary" href="opportunities.html">Browse Opportunities</a>
        <a class="btn btn--secondary" href="training.html">Continue Training</a>
        <a class="btn btn--secondary" href="mentorship.html">View Mentor</a>
        <button id="requestMeetingQuick" class="btn btn--secondary">Request Meeting</button>
        <a class="btn btn--secondary" href="register.html">Update Profile</a>
      </div>
    </section>
  `

  // Event handlers
  document.querySelectorAll('.btn-apply-opportunity').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const oppId = event.currentTarget.dataset.oppId
      const opp = getOpportunities().find((o) => o.id === oppId)
      if (!opp) return renderAlert('error', 'Opportunity not found', 'main')
      const success = applyForOpportunity(opp)
      if (success) {
        renderAlert('success', `Applied for ${opp.title}`, 'main')
        renderStudentDashboard(auth, container)
      } else {
        renderAlert('error', 'Already applied or error', 'main')
      }
    })
  })

  document.querySelectorAll('.btn-save-opportunity').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const oppId = event.currentTarget.dataset.oppId
      const ok = saveOpportunity(oppId)
      if (ok) {
        renderAlert('success', 'Opportunity saved', 'main')
      } else {
        renderAlert('warning', 'Already saved or error', 'main')
      }
      renderStudentDashboard(auth, container)
    })
  })

  document.querySelectorAll('.btn-remove-saved').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const oppId = event.currentTarget.dataset.oppId
      removeSavedOpportunity(oppId)
      renderAlert('success', 'Saved opportunity removed', 'main')
      renderStudentDashboard(auth, container)
    })
  })

  document.querySelectorAll('.btn-view-opportunity').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const oppId = event.currentTarget.dataset.oppId
      const opp = getOpportunities().find((o) => o.id === oppId)
      if (!opp) return renderAlert('error', 'Opportunity not found', 'main')
      window.location.href = 'pages/opportunity-details.html?oppId=' + encodeURIComponent(opp.id)
    })
  })

  document.querySelectorAll('.btn-continue-training').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const moduleId = event.currentTarget.dataset.moduleId
      continueTraining(moduleId)
      renderAlert('success', 'Training progress updated', 'main')
      renderStudentDashboard(auth, container)
    })
  })

  document.getElementById('requestMeetingBtn')?.addEventListener('click', () => {
    const mentor = getStudentMentor()
    const datetime = document.getElementById('meetingDatetime').value
    const notes = document.getElementById('meetingNotes').value
    if (!mentor) return renderAlert('error', 'No mentor assigned', 'main')
    if (!datetime) return renderAlert('error', 'Select date/time for meeting', 'main')
    requestMeeting(mentor.id, datetime, notes)
    renderAlert('success', 'Meeting requested', 'main')
    renderStudentDashboard(auth, container)
  })

  document.getElementById('requestMeetingQuick')?.addEventListener('click', () => {
    document.getElementById('meetingDatetime').focus()
  })

  function renderRecommendedList(opportunities) {
    const recommended = opportunities.length
      ? `<div class="feature-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">${opportunities.map((opp) => `
            <article class="feature-card">
              <h4>${opp.title}</h4>
              <p>${opp.location} • ${opp.type}</p>
              <p>${opp.description || ''}</p>
              <p>Deadline: ${opp.deadline || 'TBD'}</p>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;">
                <button class="btn btn--secondary btn-view-opportunity" data-opp-id="${opp.id}">Details</button>
                <button class="btn btn--primary btn-apply-opportunity" data-opp-id="${opp.id}">Apply</button>
                <button class="btn btn--outline btn-save-opportunity" data-opp-id="${opp.id}">Save</button>
              </div>
            </article>
          `).join('')}</div>`
      : '<p>No results.</p>'
    document.getElementById('recommendedOps').innerHTML = recommended
  }

  const initialRecommended = getRecommendedOpportunities()
  renderRecommendedList(initialRecommended)

  document.getElementById('opp-search')?.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase()
    const filtered = getRecommendedOpportunities().filter((opp) =>
      opp.title.toLowerCase().includes(query) ||
      (opp.description || '').toLowerCase().includes(query) ||
      (opp.location || '').toLowerCase().includes(query) ||
      (opp.type || '').toLowerCase().includes(query)
    )
    renderRecommendedList(filtered)
    // FIXED: Delegation handles buttons - no bind needed
  })

  document.getElementById('opp-clear-search')?.addEventListener('click', () => {
    const input = document.getElementById('opp-search')
    if (input) input.value = ''
    renderRecommendedList(initialRecommended)
    // FIXED: Delegation handles buttons - no bind needed
  })
}

function makeBadge(status) {
  const classMap = {
    Submitted: 'badge--warning',
    'Under Review': 'badge--warning',
    Accepted: 'badge--success',
    Rejected: 'badge--danger',
  }
  return `<span class="badge ${classMap[status] || ''}" aria-label="${status} status">${status}</span>`
}

function renderAlert(type, message, target) {
  const container = document.querySelector(target)
  if (!container) return
  const alert = document.createElement('div')
  alert.className = `alert alert-${type}`
  alert.innerHTML = `<span class="alert-message">${message}</span><button type="button" aria-label="Dismiss notification">×</button>`
  alert.querySelector('button').addEventListener('click', () => alert.remove())
  container.prepend(alert)
  setTimeout(() => { if (alert.isConnected) alert.remove() }, 4000)
}

function renderHeaderLinks() {
  const container = document.getElementById('header-actions')
  if (!container) return

  const pathPrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/'
  const auth = getAuth()

  container.innerHTML = ''

  if (auth && auth.role) {
    const dashboardLink = document.createElement('a')
    dashboardLink.className = 'btn btn--secondary'
    dashboardLink.href = `${pathPrefix}dashboard.html`
    dashboardLink.textContent = 'Dashboard'

    const logoutLink = document.createElement('button')
    logoutLink.type = 'button'
    logoutLink.className = 'btn btn--outline'
    logoutLink.textContent = 'Logout'
    logoutLink.addEventListener('click', () => {
      clearAuth()
      const homePath = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html'
      window.location.href = homePath
    })

    container.appendChild(dashboardLink)
    container.appendChild(logoutLink)
    return
  }

  const loginLink = document.createElement('a')
  loginLink.className = 'btn btn--secondary'
  loginLink.href = `${pathPrefix}login.html`
  loginLink.textContent = 'Login'

  const registerLink = document.createElement('a')
  registerLink.className = 'btn btn--primary'
  registerLink.href = `${pathPrefix}register.html`
  registerLink.textContent = 'Register'

  container.appendChild(loginLink)
  container.appendChild(registerLink)
}

function initAuthForm(formSelector, redirect = 'dashboard.html') {
  const form = document.querySelector(formSelector)
  if (!form) return

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(form)
    const role = formData.get('role') || 'student'
    const name = formData.get('fullName') || formData.get('email') || 'Learner'
    const email = formData.get('email') || ''

    if (!email) {
      renderAlert('error', 'Please enter your email address.', '.container')
      return
    }

    // Simulate real Supabase auth success
    setAuth({ role, name, email, id: email.replace(/[@.]/g, '_'), loggedAt: Date.now() })
    renderAlert('success', `Welcome, ${name}! Logged in as ${role}. Redirecting...`, '.container')
    setTimeout(() => {
      window.location.href = redirect
    }, 1200)
  })
}

function getMyReviews(mentorId) {
  const reviews = getLocalData('reviews')
  return reviews.filter((review) => review.mentorId === mentorId)
}

function getMyMentees(mentorId) {
  const assignments = getLocalData('menteeAssignments')
  const users = getLocalData('users')
  const meetings = getLocalData('meetings')

  return assignments
    .filter((assignment) => assignment.mentorId === mentorId)
    .map((assignment) => {
      const mentee = users.find((user) => user.id === assignment.menteeId)
      const upcoming = meetings
        .filter((m) => m.mentorId === mentorId && m.menteeId === assignment.menteeId)
        .sort((a, b) => new Date(a.time) - new Date(b.time))[0]

      return {
        mentee,
        assignment,
        nextMeeting: upcoming,
        progress: mentee ? Math.min(100, Math.max(20, Math.floor((Math.random() * 60) + 20))) : 0,
      }
    })
}

function getMyResources(mentorId) {
  const resources = getLocalData('resources')
  return resources.filter((resource) => resource.mentorId === mentorId)
}

function scheduleMeeting(mentorId, menteeId, datetime, notes) {
  const meetings = getLocalData('meetings')
  const newMeeting = {
    id: `meeting_${Date.now()}`,
    mentorId,
    menteeId,
    time: new Date(datetime).toISOString(),
    status: 'Scheduled',
    notes: notes || '',
    createdAt: new Date().toISOString()
  }
  meetings.push(newMeeting)
  setLocalData('meetings', meetings)
  if (window.localDB) window.localDB.setCollection('meetings', meetings)
  return newMeeting
}

function uploadResource(mentorId, title, description, file) {
  const resources = getLocalData('resources')
  const newResource = {
    id: `resource_${Date.now()}`,
    mentorId,
    title,
    description: description || '',
    fileName: file ? file.name : '',
    createdAt: new Date().toISOString(),
  }
  resources.push(newResource)
  setLocalData('resources', resources)
  if (window.localDB) window.localDB.setCollection('resources', resources)
  return newResource
}

// Define globals for dashboard functions
window.getMyReviews = getMyReviews
window.getMyMentees = getMyMentees
window.getMyResources = getMyResources
window.scheduleMeeting = scheduleMeeting
window.uploadResource = uploadResource

function renderMentorDashboard(auth, container) {
  if (!auth) return

  const mentor = getLocalData('mentors').find((m) => m.userId === auth.id) || null
  if (!mentor) {
    container.innerHTML = '<div class="feature-card" style="text-align:center;">No mentor profile found. Please notify an admin.</div>'
    return
  }

  const mentees = getMyMentees(mentor.id)
  const reviewList = getMyReviews(mentor.id)
  const resourceList = getMyResources(mentor.id)
  const meetingList = getLocalData('meetings').filter((m) => m.mentorId === mentor.id).sort((a, b) => new Date(a.time) - new Date(b.time))
  const upcomingMeeting = meetingList.find((m) => new Date(m.time) > new Date())
  const me = getLocalData('users').find((u) => u.id === auth.id) || null

  container.innerHTML = `
    <div style="margin-bottom:1rem;">
      <h1>Mentor Workspace</h1>
      <p>Welcome back, <strong>${me ? me.name : auth.name}</strong> (<em>${auth.role}</em>)</p>
    </div>

    <div class="feature-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem; margin-bottom: 1rem;">
      <article class="feature-card"><h4>Assigned mentees</h4><p class="feature-title">${mentees.length}</p></article>
      <article class="feature-card"><h4>Meetings</h4><p class="feature-title">${meetingList.length}</p></article>
      <article class="feature-card"><h4>Reviews</h4><p class="feature-title">${reviewList.length}</p></article>
      <article class="feature-card"><h4>Resources</h4><p class="feature-title">${resourceList.length}</p></article>
    </div>

    <section class="feature-card" style="margin-bottom:1rem;">
      <h2>Quick actions</h2>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;">
        <button id="mentor-action-schedule" class="btn btn--primary">Schedule session</button>
        <button id="mentor-action-upload" class="btn btn--secondary">Add resource</button>
        <button id="mentor-action-refresh" class="btn btn--outline">Refresh data</button>
      </div>
    </section>

    <section class="feature-card" style="margin-bottom:1rem;"><h2>Upcoming session</h2>${upcomingMeeting ? `<p><strong>${new Date(upcomingMeeting.time).toLocaleString()}</strong> with <strong>${(getLocalData('users').find((u) => u.id === upcomingMeeting.menteeId)||{}).name || upcomingMeeting.menteeId}</strong> • ${upcomingMeeting.status}</p>` : '<p>No upcoming sessions scheduled.</p>'}</section>

    <section class="feature-card" style="margin-bottom:1rem;"><h2>Assigned mentees</h2>${mentees.length ? `<ul>${mentees.map((item) => `<li><strong>${item.mentee?.name || item.mentee}</strong> (${item.mentee?.email || '—'}) - ${item.progress || 0}% progress</li>`).join('')}</ul>` : '<p>No mentees assigned yet.</p>'}</section>

    <section class="feature-card" style="margin-bottom:1rem;"><h2>Meeting records</h2>${meetingList.length ? `<table style="width:100%;border-collapse:collapse;"><thead><tr><th>Mentee</th><th>Date</th><th>Status</th><th>Notes</th></tr></thead><tbody>${meetingList.map((m)=>`<tr><td>${(getLocalData('users').find((u)=>u.id===m.menteeId)||{}).name||m.menteeId}</td><td>${new Date(m.time).toLocaleString()}</td><td>${m.status}</td><td>${m.notes||'—'}</td></tr>`).join('')}</tbody></table>` : '<p>No meeting history.</p>'}</section>

    <section class="feature-card" style="margin-bottom:1rem;"><h2>Reviews</h2>${reviewList.length ? reviewList.map((r)=>`<article style="margin-bottom:.5rem;"><strong>${(getLocalData('users').find((u)=>u.id===r.fromUserId)||{}).name||r.fromUserId}</strong> • ⭐ ${r.rating}<br>${r.comment || 'No comment'}</article>`).join('') : '<p>No reviews yet</p>'}</section>

    <section class="feature-card" style="margin-bottom:1rem;"><h2>Resources</h2>${resourceList.length ? resourceList.map((res)=>`<article style="margin-bottom:.5rem;"><strong>${res.title}</strong><p>${res.description || ''}</p><small>${res.fileName || 'No file'}</small></article>`).join('') : '<p>No resources uploaded yet.</p>'}</section>

    <section class="feature-card" style="margin-bottom:1rem;">
      <h2>Quick meeting request</h2>
      <div style="display:grid;gap:.5rem;"><input id="mentor-meeting-mentee" placeholder="Mentee email/id" style="padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;"/><input id="mentor-meeting-date" type="datetime-local" style="padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;"/><textarea id="mentor-meeting-notes" placeholder="Purpose" style="padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;"></textarea><button id="mentor-request-meeting" class="btn btn--primary">Request meeting</button></div>
    </section>
  `

  document.getElementById('mentor-action-refresh')?.addEventListener('click', () => renderMentorDashboard(auth, container))
  document.getElementById('mentor-action-schedule')?.addEventListener('click', () => document.getElementById('mentor-meeting-date')?.focus())

  document.getElementById('mentor-request-meeting')?.addEventListener('click', () => {
    const menteeKey = document.getElementById('mentor-meeting-mentee').value.trim()
    const date = document.getElementById('mentor-meeting-date').value
    const notes = document.getElementById('mentor-meeting-notes').value
    if (!menteeKey || !date) return renderAlert('error', 'Mentee and date required', 'main')
    const mentee = getLocalData('users').find((u) => u.email.toLowerCase() === menteeKey.toLowerCase() || u.id === menteeKey)
    if (!mentee) return renderAlert('error', 'Mentee not found', 'main')
    requestMeeting(mentor.id, date, notes)
    renderAlert('success', 'Meeting request created', 'main')
    renderMentorDashboard(auth, container)
  })

  document.getElementById('mentor-action-upload')?.addEventListener('click', () => {
    window.location.href = 'pages/mentor-tools.html'
  })
}

function showReviews(reviews) {
  const list = document.getElementById('reviewsList')
  if (!list) return
  list.innerHTML = reviews.length ? reviews.map((r) => `
    <div style="padding: 0.75rem; background: rgba(74,222,128,0.2); border-radius: 8px; margin-bottom: 0.5rem;">
      <strong>${getLocalData('users').find((u) => u.id === r.fromUserId)?.name || r.fromUserId}</strong>
      <span style="color: #4ade80;">${r.rating}/5</span>
      <p style="margin: 0.25rem 0; font-size: 0.9rem;">${r.comment || 'No comment'}</p>
    </div>
  `).join('') : '<p>No reviews yet!</p>'
  list.style.display = 'block'
}

function showMentees(mentees) {
  const list = document.getElementById('menteesList')
  if (!list) return
  list.innerHTML = mentees.length ? mentees.map((m) => `
    <div style="padding: 0.75rem; background: rgba(45,140,255,0.2); border-radius: 8px; margin-bottom: 0.5rem;">
      <strong>${m.mentee?.name || 'Unknown'}</strong>
      <p style="margin: 0.25rem 0; font-size: 0.9rem;">Next meeting: ${m.nextMeeting ? new Date(m.nextMeeting.time).toLocaleString() : 'Not scheduled'}</p>
      <small>Progress: ${m.progress}%</small>
    </div>
  `).join('') : '<p>No mentees!</p>'
  list.style.display = 'block'
}


async function scheduleFromDashboard(mockId) {
  const menteeId = document.getElementById('dbMenteeId').value;
  const datetime = document.getElementById('dbMeetingDate').value;
  const notes = document.getElementById('dbMeetingNotes').value;
  if (!menteeId || !datetime) return renderAlert('error', 'Mentee & date required', 'main');
  try {
    await scheduleMeeting(mockId, menteeId, new Date(datetime), notes);
    renderAlert('success', 'Meeting scheduled!', 'main');
    // FIXED: loadMentorData removed
  } catch (e) {
    renderAlert('error', 'Failed: ' + e.message, 'main');
  }
}

async function uploadFromDashboard(mockId) {
  const title = document.getElementById('dbResTitle').value;
  const file = document.getElementById('dbResFile').files[0];
  if (!title || !file) return renderAlert('error', 'Title & file required', 'main');
  try {
    await uploadResource(mockId, title, 'Dashboard upload', file);
    renderAlert('success', 'Resource uploaded!', 'main');
    document.getElementById('dbResTitle').value = '';
    document.getElementById('dbResFile').value = '';
  } catch (e) {
    renderAlert('error', 'Upload failed: ' + e.message, 'main');
  }
}


function renderAdminDashboard(auth, container) {
  const users = 198
  const mentors = 15
  const opportunities = opportunitiesData.length
  const applications = getApplications()
  const stats = {
    'Total users': users,
    'Total mentors': mentors,
    'Total opportunities': opportunities,
    'Total applications': applications.length,
  }

  const statusCardsHtml = Object.entries(stats)
    .map(([label, value]) => `<article class="feature-card status-card"><p class="feature-title">${value}</p><p class="feature-desc">${label}</p></article>`)
    .join('')

  const recentAppsHtml = applications.length === 0
    ? '<p>No applications yet.</p>'
    : applications
      .slice(0, 5)
      .map((app) => `<article class="feature-card"><h4 class="feature-title">${app.email}</h4><p class="feature-desc">${app.title}</p><p>Status: ${makeBadge(app.status)}</p><button class="btn btn--secondary">Action</button></article>`)
      .join('')

  const reportsHtml = `<p>Accepted applications: ${applications.filter(a => a.status === 'Accepted').length}</p><p>User engagement: High</p><p>Training completion: 85%</p>`

  container.innerHTML = `
    <div class="feature-grid">
      <article class="feature-card" aria-labelledby="stats-admin-title">
        <div class="feature-icon" aria-hidden="true">📈</div>
        <h2 id="stats-admin-title" class="feature-title">Platform Stats</h2>
        <p class="feature-desc">
          Users: 198 | Mentors: 15 | 
          Opportunities: ${opportunitiesData.length} | 
          Applications: ${applications.length}
        </p>
      </article>

      <article class="feature-card" aria-labelledby="recent-title">
        <div class="feature-icon" aria-hidden="true">📋</div>
        <h2 id="recent-title" class="feature-title">Recent Apps</h2>
        <p class="feature-desc">${applications.length} new</p>
        <a class="btn btn--secondary" href="admin.html">Review</a>
      </article>

      <article class="feature-card" aria-labelledby="users-title">
        <div class="feature-icon" aria-hidden="true">👥</div>
        <h2 id="users-title" class="feature-title">Users</h2>
        <p class="feature-desc">New: 5 | Pending mentors: 2</p>
        <a class="btn btn--secondary" href="admin.html">Manage</a>
      </article>

      <article class="feature-card" aria-labelledby="ops-title">
        <div class="feature-icon" aria-hidden="true">➕</div>
        <h2 id="ops-title" class="feature-title">Opportunities</h2>
        <p class="feature-desc">Add & manage listings</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a class="btn btn--secondary" href="admin.html" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Add</a>
          <button class="btn btn--secondary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Edit</button>
        </div>
      </article>
    </div>
  `
}


function renderDashboard() {
  const auth = getAuth()
  const container = document.getElementById('dashboardContent')
  const leadText = document.querySelector('.section-lead')
  const cta = document.getElementById('dashboardCta')
  const ctaStatus = document.getElementById('dashboardStatus')
  const ctaAction = document.getElementById('dashboardCtaAction')

  if (!container) return

  if (!auth || !auth.role) {
    container.innerHTML = ''
    if (leadText) {
      leadText.textContent = 'You must be logged in to view your dashboard. Sign in or create an account to continue.'
    }
    if (cta) {
      cta.style.display = 'block'
      if (ctaStatus) ctaStatus.textContent = 'Please log in to unlock role-specific dashboards.'
      if (ctaAction) ctaAction.href = 'login.html'
    }
    return
  }

  if (cta) {
    cta.style.display = 'none'
  }

  if (leadText) {
    leadText.textContent = `Welcome back${auth.name ? `, ${auth.name}` : ''}! Here’s your ${auth.role} dashboard.`
  }

  if (auth.role === 'mentor') {
    renderMentorDashboard(auth, container)
  } else if (auth.role === 'admin') {
    renderAdminDashboard(auth, container)
  } else {
    window.location.href = 'student-dashboard.html';
  }
}

function initOpportunitiesPage() {
  const content = document.querySelector('#opportunityList')
  if (!content) return

  const searchInput = document.getElementById('opportunitySearch')
  const cta = document.getElementById('oppCta')
  const auth = getAuth()

  const renderList = (query = '') => {
    const filter = query.trim().toLowerCase()
    const filtered = opportunitiesData.filter((opp) => {
      const text = `${opp.title} ${opp.type} ${opp.location} ${opp.tags.join(' ')}`.toLowerCase()
      return text.includes(filter)
    })

    if (filtered.length === 0) {
      content.innerHTML = '<p>No opportunities match your search. Try another keyword.</p>'
      return
    }

    const typeColors = { internship: '#3b82f6', job: '#10b981', grant: '#f59e0b', scholarship: '#a78bfa', fellowship: '#ec4899', contract: '#14b8a6' }

    content.innerHTML = filtered.map((opp) => {
      const color = typeColors[opp.type] || '#2d8cff'
      const tags = (opp.tags || []).map(t => `<span class="opp-tag">${t}</span>`).join('')
      const applyBtn = auth
        ? `<button class="btn btn--primary btn-opp-apply" data-opp-id="${opp.id}" type="button">Apply Now →</button>`
        : `<button class="btn btn--primary btn-opp-apply" data-opp-id="${opp.id}" type="button">🔒 Sign In to Apply</button>`
      return `
        <article class="opp-card" aria-label="Opportunity: ${opp.title}">
          <div class="opp-card__top">
            <span class="opp-type-pill" style="background:${color}22;color:${color};border-color:${color}44">${opp.type}</span>
            <span class="opp-deadline">${opp.deadline ? 'Due ' + opp.deadline : 'Open'}</span>
          </div>
          <h3 class="opp-card__title">${opp.title}</h3>
          <p class="opp-card__meta">📍 ${opp.location} &nbsp;·&nbsp; ${opp.slots} slots available</p>
          <p class="opp-card__desc">${opp.description || ''}</p>
          <div class="opp-tags">${tags}</div>
          <div class="opp-card__actions">
            <a class="btn btn--secondary" href="opportunity-details.html?oppId=${opp.id}">View Details</a>
            ${applyBtn}
          </div>
        </article>`
    }).join('')

    content.querySelectorAll('.btn-opp-apply').forEach((btn) => {
      btn.addEventListener('click', () => {
        const oppId = btn.dataset.oppId
        const currentAuth = getAuth()
        if (!currentAuth) {
          sessionStorage.setItem('isop_after_login_redirect', `apply.html?oppId=${oppId}`)
          window.location.href = 'login.html'
        } else {
          window.location.href = `apply.html?oppId=${oppId}`
        }
      })
    })
  }

  if (!auth || !auth.email) {
    if (cta) cta.style.display = 'block'
  } else if (cta) {
    cta.style.display = 'none'
  }

  renderList('')

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      renderList(event.target.value)
    })
  }
}


function initPage() {
  redirectSignedInUser()
  restrictDashboardAccess()
  renderHeaderLinks()
  initAuthForm('.auth-form')
  renderDashboard()
  initOpportunitiesPage()
}

document.addEventListener('DOMContentLoaded', initPage)

// Expose data functions globally for dashboard pages
window.getAuth = getAuth
window.setAuth = setAuth
window.clearAuth = clearAuth
window.isSignedIn = isSignedIn
window.getOpportunities = getOpportunities
window.getApplications = getApplications
window.setApplications = setApplications
window.addApplication = addApplication
window.getStudentApplications = getStudentApplications
window.getStudentSavedOpportunities = getStudentSavedOpportunities
window.getStudentSavedEntries = getStudentSavedEntries
window.getStudentMentor = getStudentMentor
window.getStudentMeetings = getStudentMeetings
window.getStudentNotifications = getStudentNotifications
window.getStudentTrainingProgress = getStudentTrainingProgress
window.getRecommendedOpportunities = getRecommendedOpportunities
window.saveOpportunity = saveOpportunity
window.removeSavedOpportunity = removeSavedOpportunity
window.requestMeeting = requestMeeting
window.continueTraining = continueTraining
window.applyForOpportunity = applyForOpportunity

