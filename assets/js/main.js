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
  { id: 'opp-001', title: 'Design Internship', type: 'internship', location: 'Remote', tags: ['UX', 'Accessibility'], slots: 16 },
  { id: 'opp-002', title: 'Remote Junior Developer', type: 'job', location: 'Worldwide', tags: ['JavaScript', 'Inclusive Design'], slots: 24 },
  { id: 'opp-003', title: 'Community Leadership Grant', type: 'grant', location: 'Rwanda', tags: ['Community', 'Impact'], slots: 8 },
  { id: 'opp-004', title: 'Accessibility Research Partner', type: 'contract', location: 'Hybrid', tags: ['Research', 'A11y'], slots: 5 },
]

const trainingsData = [
  { id: 'trn-1', title: 'Inclusive UX Design', completed: 70 },
  { id: 'trn-2', title: 'Assistive Tech Fundamentals', completed: 40 },
  { id: 'trn-3', title: 'Career Readiness Workshop', completed: 90 },
]

const mentorshipData = [
  { mentee: 'Claire K.', progress: 65, lastSession: '2026-03-28', nextSession: '2026-04-02' },
  { mentee: 'James O.', progress: 30, lastSession: '2026-03-20', nextSession: '2026-04-05' },
  { mentee: 'Rosa N.', progress: 45, lastSession: '2026-03-22', nextSession: '2026-04-01' },
]

function getStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback
  } catch {
    return fallback
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getAuth() {
  return getStorage(AUTH_KEY, null)
}

function setAuth(auth) {
  saveStorage(AUTH_KEY, auth)
}

function isSignedIn() {
  const auth = getAuth()
  return auth && auth.role && auth.email
}

function redirectSignedInUser() {
  if (!isSignedIn()) return
  const current = window.location.pathname.toLowerCase()
  const onAuthPage = current.endsWith('/login.html') || current.endsWith('/register.html')
  if (onAuthPage) {
    window.location.href = current.includes('/pages/') ? '../pages/dashboard.html' : 'pages/dashboard.html'
  }
}

function restrictDashboardAccess() {
  const current = window.location.pathname.toLowerCase()
  const protects = ['/pages/dashboard.html', '/pages/admin.html']
  if (protects.some((p) => current.endsWith(p)) && !isSignedIn()) {
    window.location.href = current.includes('/pages/') ? '../pages/login.html' : 'login.html'
  }
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
}

function getApplications() {
  return getStorage(APPLICATIONS_KEY, [])
}

function setApplications(apps) {
  saveStorage(APPLICATIONS_KEY, apps)
}

function addApplication(application) {
  const apps = getApplications()
  const existing = apps.find((item) => item.email === application.email && item.opportunityId === application.opportunityId)
  if (existing) return false
  apps.unshift(application)
  setApplications(apps)
  return true
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

    setAuth({ role, name, email, loggedAt: Date.now() })
    renderAlert('success', `Logged in successfully as ${role}.`, '.container')
    setTimeout(() => {
      window.location.href = redirect
    }, 600)
  })
}

function renderStudentDashboard(auth, container) {
  const applications = getApplications().filter((item) => item.email === auth.email)
  const recommended = opportunitiesData
    .filter((opp) => !applications.some((app) => app.opportunityId === opp.id))
    .slice(0, 3)
  const stats = {
    'Available opportunities': opportunitiesData.length,
    'Applications sent': applications.length,
    'Trainings completed': trainingsData.filter(t => t.completed === 100).length,
    'Mentor assigned': mentorshipData.length > 0 ? 1 : 0,
  }

  const statusCardsHtml = Object.entries(stats)
    .map(([label, value]) => `<article class="feature-card status-card"><p class="feature-title">${value}</p><p class="feature-desc">${label}</p></article>`)
    .join('')

  const recommendedHtml = recommended.length === 0 ? '<p>No recommendations yet.</p>' : recommended
    .map((item) => `<article class="feature-card"><h4 class="feature-title">${item.title}</h4><p class="feature-desc">${item.type} • ${item.location}</p><p><strong>Deadline:</strong> ${item.deadline || 'TBD'}</p><button class="btn btn--secondary" data-opportunity-id="${item.id}" type="button">Apply now</button></article>`)
    .join('')

  const appsHtml = applications.length === 0
    ? '<p>No applications yet.</p>'
    : applications
      .slice(0, 5)
      .map((app) => `<article class="feature-card application-card"><h4 class="feature-title">${app.title}</h4><p class="feature-desc">Applied: ${new Date(app.submittedAt).toLocaleDateString()}</p><p>${makeBadge(app.status)}</p></article>`)
      .join('')

  const trainingHtml = trainingsData
    .map((item) => `<div class="training-row"><strong>${item.title}</strong><div class="progress" role="progressbar" aria-valuenow="${item.completed}" aria-valuemin="0" aria-valuemax="100"><div class="progress__fill" style="width:${item.completed}%"></div></div><small>${item.completed}% completed</small><button class="btn btn--secondary">Continue</button></div>`)
    .join('')

  container.innerHTML = `
    <div class="feature-grid">
      <article class="feature-card" aria-labelledby="stats-title">
        <div class="feature-icon" aria-hidden="true">📊</div>
        <h2 id="stats-title" class="feature-title">Dashboard Stats</h2>
        <p class="feature-desc">
          Opportunities: ${opportunitiesData.length} | 
          Applications: ${applications.length} | 
          Trainings done: ${trainingsData.filter(t => t.completed === 100).length} | 
          Mentor: ${mentorshipData.length > 0 ? 1 : 0}
        </p>
      </article>

      <article class="feature-card" aria-labelledby="recommended-title">
        <div class="feature-icon" aria-hidden="true">⭐</div>
        <h2 id="recommended-title" class="feature-title">Recommended</h2>
        <p class="feature-desc">${recommended[0]?.title || 'No new opportunities'}</p>
        ${recommended.length ? '<a class="btn btn--secondary" href="opportunities.html">View all</a>' : ''}
      </article>

      <article class="feature-card" aria-labelledby="apps-title">
        <div class="feature-icon" aria-hidden="true">📋</div>
        <h2 id="apps-title" class="feature-title">Applications</h2>
        <p class="feature-desc">${applications.length} submitted</p>
        ${applications.length ? makeBadge(applications[0].status) : ''}
        <a class="btn btn--secondary" href="dashboard.html">Manage</a>
      </article>

      <article class="feature-card" aria-labelledby="actions-title">
        <div class="feature-icon" aria-hidden="true">⚡</div>
        <h2 id="actions-title" class="feature-title">Quick Actions</h2>
        <p class="feature-desc">Continue learning and connect</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a class="btn btn--secondary" href="opportunities.html" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Browse</a>
          <a class="btn btn--secondary" href="training.html" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Training</a>
          <a class="btn btn--secondary" href="mentorship.html" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Mentor</a>
        </div>
      </article>
    </div>
  `

  const recommendedList = document.querySelector('.horizontal-row')
  if (recommendedList) {
    recommendedList.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-opportunity-id')
        const opp = opportunitiesData.find((o) => o.id === id)
        if (!opp) return

        const added = addApplication({
          opportunityId: opp.id,
          title: opp.title,
          email: auth.email,
          status: 'Submitted',
          submittedAt: Date.now(),
        })

        if (added) {
          renderAlert('success', `Application submitted for ${opp.title}!`, 'main .container')
          renderDashboard()
        } else {
          renderAlert('error', `You already applied for ${opp.title}.`, 'main .container')
        }
      })
    })
  }
}

function renderMentorDashboard(auth, container) {
  const menteeRows = mentorshipData
    .map((item) => `<tr><td>${item.mentee}</td><td><div class="progress" role="progressbar" aria-valuenow="${item.progress}" aria-valuemin="0" aria-valuemax="100"><div class="progress__fill" style="width:${item.progress}%"></div></div> ${item.progress}%</td><td>${item.nextSession}</td></tr>`)
    .join('')

  const upcomingSessions = mentorshipData.slice(0, 4).map((item) => `<li>${item.mentee}: ${item.nextSession}</li>`).join('')

  const reviewCount = 2
  const stats = {
    'Assigned mentees': mentorshipData.length,
    'Sessions this week': mentorshipData.slice(0, 3).length,
    'Feedback pending': reviewCount,
    'Average progress': Math.round(mentorshipData.reduce((acc, i) => acc + i.progress, 0) / mentorshipData.length) + '%',
  }

  const statusCardsHtml = Object.entries(stats)
    .map(([label, value]) => `<article class="feature-card status-card"><p class="feature-title">${value}</p><p class="feature-desc">${label}</p></article>`)
    .join('')

  const menteesHtml = mentorshipData
    .map((item) => `<article class="feature-card"><h4 class="feature-title">${item.mentee}</h4><p class="feature-desc">Current training: ${item.progress}%</p><button class="btn btn--secondary">Open profile</button></article>`)
    .join('')

  const sessionsHtml = mentorshipData.slice(0, 3)
    .map((item) => `<article class="feature-card"><h4 class="feature-title">${item.mentee}</h4><p class="feature-desc">Date: ${item.nextSession}</p><p>Time: TBD</p></article>`)
    .join('')

  const feedbackHtml = `<p>${reviewCount} items pending review.</p>`

  container.innerHTML = `
    <div class="feature-grid">
      <article class="feature-card" aria-labelledby="mentees-title">
        <div class="feature-icon" aria-hidden="true">👥</div>
        <h2 id="mentees-title" class="feature-title">Mentees</h2>
        <p class="feature-desc">${mentorshipData.length} assigned</p>
        <p><strong>Avg progress:</strong> ${Math.round(mentorshipData.reduce((acc, i) => acc + i.progress, 0) / mentorshipData.length)}%</p>
      </article>

      <article class="feature-card" aria-labelledby="sessions-title">
        <div class="feature-icon" aria-hidden="true">📅</div>
        <h2 id="sessions-title" class="feature-title">Next Sessions</h2>
        <p class="feature-desc">${mentorshipData[0]?.mentee || 'None'}: ${mentorshipData[0]?.nextSession || 'TBD'}</p>
        <a class="btn btn--secondary" href="mentorship.html">Schedule</a>
      </article>

      <article class="feature-card" aria-labelledby="feedback-title">
        <div class="feature-icon" aria-hidden="true">💬</div>
        <h2 id="feedback-title" class="feature-title">Feedback</h2>
        <p class="feature-desc">2 pending reviews</p>
        <a class="btn btn--secondary" href="mentorship.html">Review</a>
      </article>

      <article class="feature-card" aria-labelledby="resources-title">
        <div class="feature-icon" aria-hidden="true">📚</div>
        <h2 id="resources-title" class="feature-title">Resources</h2>
        <p class="feature-desc">Share materials easily</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn--secondary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Upload</button>
          <a class="btn btn--secondary" href="mentorship.html" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Share</a>
        </div>
      </article>
    </div>
  `
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
    renderStudentDashboard(auth, container)
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

    content.innerHTML = filtered
      .map((opp) => `
        <article class="feature-card" aria-label="Opportunity ${opp.title}">
          <h3 class="feature-title">${opp.title}</h3>
          <p class="feature-desc">${opp.type} • ${opp.location} • slots ${opp.slots}</p>
          <p><strong>Tags</strong>: ${opp.tags.join(', ')}</p>
          <button class="btn btn--primary" data-opportunity-id="${opp.id}" type="button">Apply now</button>
        </article>
      `)
      .join('')

    content.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const auth = getAuth()
        if (!auth || !auth.email) {
          window.location.href = 'login.html'
          return
        }

        const id = button.getAttribute('data-opportunity-id')
        const opp = opportunitiesData.find((item) => item.id === id)
        if (!opp) return

        const applied = addApplication({
          opportunityId: opp.id,
          title: opp.title,
          email: auth.email,
          status: 'Submitted',
          submittedAt: Date.now(),
        })

        if (applied) {
          renderAlert('success', `Your application for ${opp.title} has been submitted.`, '.container')
          if (document.location.pathname.includes('/pages/dashboard.html')) renderDashboard()
        } else {
          renderAlert('error', `You have already applied for ${opp.title}.`, '.container')
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

