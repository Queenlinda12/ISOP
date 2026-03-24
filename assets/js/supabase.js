import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase URL and anon key from dashboard
const supabaseUrl = 'https://hwepgzdwoiojdwnebvhi.supabase.co'
const supabaseAnonKey = 'your-anon-key-here' // Get from Supabase dashboard > Settings > API

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Dashboard data (replace with your tables)
export async function getUserApplications(userId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRecommendedOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select()
    .limit(3)
  if (error) throw error
  return data
}

export async function getUserStats(userId) {
  // Custom query for stats
  const { data, error } = await supabase
    .rpc('get_user_stats', { user_id: userId })
  if (error) throw error
  return data
}

// === MENTOR FEATURES ===
// Get reviews/feedbacks for this mentor (where to_id = userId)
export async function getMyReviews(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('to_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Get my mentees (meetings where I'm mentor)
export async function getMyMentees(userId) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, mentee:mentee_id(*, profiles(name))')
    .eq('mentor_id', userId)
    .order('datetime', { ascending: true })
  if (error) throw error
  return data || []
}

// Schedule a meeting
export async function scheduleMeeting(mentorId, menteeId, datetime, notes = '') {
  const { data, error } = await supabase
    .from('meetings')
    .insert([{ mentor_id: mentorId, mentee_id: menteeId, datetime, notes, status: 'scheduled' }])
    .select()
    .single()
  if (error) throw error
  return data
}

// Upload resource (file to Storage, record in DB)
export async function uploadResource(mentorId, title, description, file) {
  // Upload file to Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${mentorId}.${fileExt}`
  const filePath = `resources/${mentorId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resources')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // Insert record
  const publicUrl = supabase.storage.from('resources').getPublicUrl(filePath).data.publicUrl
  const { data, error } = await supabase
    .from('resources')
    .insert([{ mentor_id: mentorId, title, description, file_url: publicUrl }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update user profile role (for mentor signup)
export async function updateUserRole(userId, role) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
  if (error) throw error
  return data
}


