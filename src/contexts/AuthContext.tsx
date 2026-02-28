import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface PartnerProfile {
  id: string
  company_name: string
  company_nmls: string
  company_address: string | null
  first_name: string
  last_name: string
  mlo_nmls: string | null
  cell_phone: string | null
  credit_vendor_name: string | null
  credit_vendor_id: string | null
  credit_vendor_login: string | null
  credit_vendor_password: string | null
}

interface AuthContextType {
  user: User | null
  profile: PartnerProfile | null
  mode: 'guest' | 'partner'
  loading: boolean
  isPartner: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, profileData: Omit<PartnerProfile, 'id'>) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [mode, setMode] = useState<'guest' | 'partner'>('guest')
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('partner_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as PartnerProfile)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setMode('partner')
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setMode('partner')
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setMode('guest')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message || null }
  }

  const signUp = async (email: string, password: string, profileData: Omit<PartnerProfile, 'id'>) => {
    // Pass profile data as user metadata — a database trigger (handle_new_user)
    // creates the partner_profiles row using SECURITY DEFINER to bypass RLS
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData,
        emailRedirectTo: 'https://pricer.defywholesale.com'
      }
    })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Sign up failed' }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setMode('guest')
  }

  return (
    <AuthContext.Provider value={{ user, profile, mode, loading, isPartner: mode === 'partner', signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
