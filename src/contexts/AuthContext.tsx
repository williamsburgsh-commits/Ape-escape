'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/game'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error)
      if (isMounted) {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    // Timeout to prevent endless loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [loading])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId)
      
      // Check current auth state
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      console.log('Current authenticated user:', currentUser?.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile for user:', userId)
          
          // Wait a moment to ensure user is fully authenticated
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Double-check auth state before creating profile
          const { data: { user: authUser } } = await supabase.auth.getUser()
          console.log('Auth user before profile creation:', authUser?.id)
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              current_stage: 1,
              total_taps: 0,
              rug_meter: 0,
              rug_count: 0,
              high_score: 0,
              suspicious_activity_count: 0,
              ape_balance: 0,
              consecutive_slips: 0,
              last_login_date: new Date().toISOString().split('T')[0],
              daily_ape_earned: 0,
              daily_taps: 0,
              tragic_hero_badges: 0,
              insurance_active: false,
              insurance_taps_left: 0,
              referral_code: null, // Let the trigger generate this
              referred_by: null,
              total_referrals: 0
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            console.error('Error details:', JSON.stringify(createError, null, 2))
            throw createError
          }
          console.log('Profile created successfully:', newProfile)
          setProfile(newProfile)
        } else {
          console.error('Error fetching profile:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          throw error
        }
      } else {
        console.log('Profile found:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      // Set loading to false even on error to prevent endless loading
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: new Error('No profile found') }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, ...updates })
    }

    return { error }
  }

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error refreshing profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
