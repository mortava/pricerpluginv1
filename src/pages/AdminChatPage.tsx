import { useState } from 'react'
import { AdminChatPanel } from '@/components/admin-chat'

export default function AdminChatPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [passcode, setPasscode] = useState('')

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-[320px] text-center">
          <div className="mb-6">
            <span className="text-[22px] font-semibold tracking-[-0.02em]">
              <span className="text-slate-900">Open</span>
              <span className="text-teal-600">Price</span>
            </span>
            <p className="text-sm text-slate-400 mt-1">Admin Chat Access</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Enter Passcode</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="----"
                value={passcode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setPasscode(val)
                  if (val === '4040') setUnlocked(true)
                }}
                className="w-24 h-11 mx-auto block text-center text-base font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-slate-300 transition-all duration-150"
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
