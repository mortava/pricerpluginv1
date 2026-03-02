import { useState } from 'react'
import { AdminChatPanel } from '@/components/admin-chat'

export default function AdminChatPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [passcode, setPasscode] = useState('')

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-[320px] text-center">
          <div className="mb-6">
            <span className="text-[22px] font-semibold tracking-[-0.02em]">
              <span className="text-[#000000]">Open</span>
              <span className="text-[#34D399]">Price</span>
            </span>
            <p className="text-[12px] text-[#A1A1AA] mt-1">Admin Chat Access</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#71717A] mb-1.5">Enter Passcode</label>
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
                className="w-24 h-10 mx-auto block text-center text-[16px] font-mono bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded-lg text-[#000000] outline-none focus:border-[#000000] placeholder:text-[#D1D5DB]"
                autoFocus
              />
            </div>
            <a href="/" className="inline-block text-[12px] text-[#A1A1AA] hover:text-[#71717A] transition-colors">
              Back to OpenPrice
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <AdminChatPanel onClose={() => { window.location.href = '/' }} />
}
