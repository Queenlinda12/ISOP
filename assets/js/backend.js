// Backend integration - uses supabaseClient from supabase.js
// Requires supabase.js to be loaded first

async function login(email, password) {
  try {
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password })
      return { data, error }
    }
  } catch (e) {
    console.warn('Supabase login failed:', e)
  }
  return { data: null, error: new Error('Supabase not available') }
}

async function register(email, password) {
  try {
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.auth.signUp({ email, password })
      return { data, error }
    }
  } catch (e) {
    console.warn('Supabase register failed:', e)
  }
  return { data: null, error: new Error('Supabase not available') }
}

async function logout() {
  try {
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.auth.signOut()
      return error
    }
  } catch (e) {
    console.warn('Supabase logout failed:', e)
  }
  return null
}

async function getUser() {
  try {
    if (window.supabaseClient) {
      const { data: { user } } = await window.supabaseClient.auth.getUser()
      return user
    }
  } catch (e) {
    console.warn('getUser failed:', e)
  }
  return null
}

async function getDashboardData(user) {
  if (!window.supabaseClient) return { applications: [], opportunities: [], stats: { totalApps: 0, totalOpps: 0 } }

  try {
    const { data: applications } = await window.supabaseClient
      .from('applications')
      .select('*, opportunity:opportunity_id(title, type)')
      .eq('user_id', user.id)

    const { data: opportunities } = await window.supabaseClient
      .from('opportunities')
      .select('*')
      .limit(6)

    return {
      applications: applications || [],
      opportunities: opportunities || [],
      stats: {
        totalApps: applications?.length || 0,
        totalOpps: opportunities?.length || 0
      }
    }
  } catch (e) {
    console.warn('getDashboardData failed:', e)
    return { applications: [], opportunities: [], stats: { totalApps: 0, totalOpps: 0 } }
  }
}

// Submit application — tries Supabase first, falls back to localStorage
async function submitApplication(userId, oppId, cvFile, experience, accessibility) {
  // Try Supabase upload
  if (window.supabaseClient && cvFile) {
    try {
      return await applyWithCV(userId, oppId, cvFile, experience, accessibility)
    } catch (e) {
      console.warn('Supabase application failed, saving locally:', e)
    }
  }

  // Local fallback
  const app = {
    id: `app_${Date.now()}`,
    userId,
    opportunityId: oppId,
    experience: experience || '',
    accessibility: accessibility || '',
    status: 'Submitted',
    submittedAt: new Date().toISOString()
  }

  const apps = JSON.parse(localStorage.getItem('isop_col_applications') || '[]')
  apps.unshift(app)
  localStorage.setItem('isop_col_applications', JSON.stringify(apps))
  return app
}

window.login = login
window.register = register
window.logout = logout
window.getUser = getUser
window.getDashboardData = getDashboardData
window.submitApplication = submitApplication
