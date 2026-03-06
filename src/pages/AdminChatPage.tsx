import { useState, useEffect } from 'react'
import { AdminChatPanel } from '@/components/admin-chat'

export default function AdminChatPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [passcode, setPasscode] = useState('')

  // Hide from search engines
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-[280px] text-center">
          <div className="mb-5">
            <span className="text-[13px] font-bold tracking-wide text-slate-300">vBASE</span>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                placeholder="····"
                value={passcode}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 4)
                  setPasscode(val)
                  if (val === 'D326') setUnlocked(true)
                }}
                className="w-20 h-11 mx-auto block text-center text-base font-mono bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-slate-300 transition-all duration-150"
                autoFocus
              />
            </div>
            <a href="/" className="inline-block text-sm text-slate-400 hover:text-slate-600 transition-colors">
              Back to OpenPrice
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <AdminChatPanel onClose={() => { window.location.href = '/' }} />
}
