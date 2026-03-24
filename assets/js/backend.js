// Supabase Backend Integration
// Update SUPABASE_URL and SUPABASE_ANON_KEY with your values

const SUPABASE_URL = 'https://hwepgzdwoiojdwnebvhi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZXBnemR3b2lvamR3bmVidmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTI2MjgsImV4cCI6MjA0NzM6ODIyOH0.YOUR_TOKEN_HERE' // Replace with your anon key

import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  return error
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getDashboardData(user) {
  // Fetch user data from Supabase
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
  
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, title, type, location')
    .limit(3)
  
  return {
    applications: applications || [],
    opportunities: opportunities || [],
    stats: {
      totalApps: applications?.length || 0,
      totalOpps: opportunities?.length || 0
    }
  }
}

// === MENTOR BACKEND INTEGRATION ===
export async function getMentorReviews(userId) {
  try {
    return await getMyReviews(userId)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getMentorMentees(userId) {
  try {
    return await getMyMentees(userId)
  } catch (error) {
    console.error('Error fetching mentees:', error)
    return []
  }
}

export async function createMeeting(mentorId, menteeId, datetime, notes) {
  try {
    return await scheduleMeeting(mentorId, menteeId, datetime, notes)
  } catch (error) {
    console.error('Error scheduling meeting:', error)
    throw error
  }
}

export async function uploadMentorResource(mentorId, title, desc, file) {
  try {
    return await uploadResource(mentorId, title, desc, file)
  } catch (error) {
    console.error('Error uploading resource:', error)
    throw error
  }
}


