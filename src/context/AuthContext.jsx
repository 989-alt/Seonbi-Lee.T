import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        }).catch((err) => {
            console.error("Auth session error:", err)
        }).finally(() => {
            setLoading(false)
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password })
    }

    const logout = async () => {
        return supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.email === 'sunhak98@naver.com', loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
