import { useState } from 'react'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface LoginPageProps {
  onBack: () => void
  onSignUp: () => void
}

export function LoginPage({ onBack, onSignUp }: LoginPageProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    const { error: authError } = await signIn(email, password)
    if (authError) {
      setError(authError)
      setLoading(false)
    } else {
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-['Montserrat'] text-3xl font-extrabold tracking-tight">
              <span className="text-slate-900">DEFY </span>
              <span className="text-blue-500">CLOUD</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mt-1">Portal Access</p>
            <p className="text-sm text-slate-500 mt-3 italic">Dare to Defy. Brokers Close Harder.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                />
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between text-[13px]">
              <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">Forgot password?</button>
              <button type="button" onClick={onSignUp} className="text-slate-400 hover:text-slate-600 transition-colors">Don't have an account? <span className="font-medium text-slate-600">Sign up</span></button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Back to Guest */}
          <button type="button" onClick={onBack} className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors text-center">
            Continue as Guest
          </button>

          {/* OpenBroker Labs - inside card */}
          <div className="text-center mt-6 pt-5 border-t border-slate-100">
            <p className="font-['Montserrat'] text-[15px] font-extrabold text-slate-800 tracking-tight">
              <span className="text-slate-400 font-normal text-[11px] align-super mr-0.5">°</span>OpenBroker <span className="font-normal text-slate-400">Labs</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
