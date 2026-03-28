// Supabase integration - loaded after CDN script
// CDN: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const supabaseUrl = 'https://hwepgzdwoiojdwnebvhi.supabase.co'
const supabaseAnonKey = 'sb_publishable_gzUYn3b9SD4RoT1LwFWKKw_qHF1wwCt'

let supabaseClient = null
try {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (e) {
  console.warn('Supabase CDN not loaded, running in offline mode.')
}

window.supabaseClient = supabaseClient

// Auth functions
async function signUp(email, password) {
  if (!supabaseClient) throw new Error('Supabase not available')
  const { data, error } = await supabaseClient.auth.signUp({ email, password })
  if (error) throw error
  return data
}

async function signIn(email, password) {
  if (!supabaseClient) throw new Error('Supabase not available')
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

async function signOut() {
  if (!supabaseClient) return
  const { error } = await supabaseClient.auth.signOut()
  if (error) throw error
}

async function getSession() {
  if (!supabaseClient) return null
  const { data: { session } } = await supabaseClient.auth.getSession()
  return session
}

// === STUDENT APPLICATIONS WITH CV ===
async function applyWithCV(userId, opportunityId, cvFile, experience, accessibility) {
  if (!supabaseClient) throw new Error('Supabase not available')

  const fileExt = cvFile.name.split('.').pop()
  const fileName = `${Date.now()}-${userId}.${fileExt}`
  const filePath = `applications/${userId}/${fileName}`

  let cvUrl = ''
  try {
    const { error: uploadError } = await supabaseClient.storage
      .from('applications')
      .upload(filePath, cvFile)
    if (!uploadError) {
      cvUrl = supabaseClient.storage.from('applications').getPublicUrl(filePath).data.publicUrl
    }
  } catch (e) {
    console.warn('CV upload failed, proceeding without CV:', e)
  }

  const { data, error } = await supabaseClient
    .from('applications')
    .insert([{
      user_id: userId,
      opportunity_id: opportunityId,
      cv_url: cvUrl,
      experience: experience || '',
      accessibility: accessibility || '',
      status: 'Submitted'
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function getUserApplications(userId) {
  if (!supabaseClient) return []
  const { data, error } = await supabaseClient
    .from('applications')
    .select('*, opportunity:opportunity_id(title, type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.warn(error); return [] }
  return data || []
}

async function getRecommendedOpportunities() {
  if (!supabaseClient) return []
  const { data, error } = await supabaseClient
    .from('opportunities')
    .select('*')
    .limit(8)
    .order('deadline')
  if (error) { console.warn(error); return [] }
  return data || []
}

async function getUserStats(userId) {
  if (!supabaseClient) return null
  const { data, error } = await supabaseClient.rpc('get_user_stats', { user_id: userId })
  if (error) { console.warn(error); return null }
  return data
}

// === MENTOR FEATURES ===
async function getMyReviews(userId) {
  if (!supabaseClient) return []
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('to_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.warn(error); return [] }
  return data || []
}

async function getMyMentees(userId) {
  if (!supabaseClient) return []
  const { data, error } = await supabaseClient
    .from('meetings')
    .select('*, mentee:mentee_id(*)')
    .eq('mentor_id', userId)
    .order('datetime', { ascending: true })
  if (error) { console.warn(error); return [] }
  return data || []
}

async function scheduleMeeting(mentorId, menteeId, datetime, notes) {
  if (!supabaseClient) throw new Error('Supabase not available')
  const { data, error } = await supabaseClient
    .from('meetings')
    .insert([{ mentor_id: mentorId, mentee_id: menteeId, datetime, notes: notes || '', status: 'scheduled' }])
    .select()
    .single()
  if (error) throw error
  return data
}

async function uploadResource(mentorId, title, description, file) {
  if (!supabaseClient) throw new Error('Supabase not available')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${mentorId}.${fileExt}`
  const filePath = `resources/${mentorId}/${fileName}`

  const { error: uploadError } = await supabaseClient.storage
    .from('resources')
    .upload(filePath, file)
  if (uploadError) throw uploadError

  const publicUrl = supabaseClient.storage.from('resources').getPublicUrl(filePath).data.publicUrl
  const { data, error } = await supabaseClient
    .from('resources')
    .insert([{ mentor_id: mentorId, title, description: description || '', file_url: publicUrl }])
    .select()
    .single()
  if (error) throw error
  return data
}

async function updateUserRole(userId, role) {
  if (!supabaseClient) return null
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
  if (error) { console.warn(error); return null }
  return data
}

// Expose all functions globally
window.signUp = signUp
window.signIn = signIn
window.signOut = signOut
window.getSession = getSession
window.applyWithCV = applyWithCV
window.getUserApplications = getUserApplications
window.getRecommendedOpportunities = getRecommendedOpportunities
window.getUserStats = getUserStats
window.getMyReviews = getMyReviews
window.getMyMentees = getMyMentees
window.scheduleMeeting = scheduleMeeting
window.uploadResource = uploadResource
window.updateUserRole = updateUserRole
