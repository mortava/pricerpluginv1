import { useState, useRef, useEffect } from 'react'
import { Send, User, ArrowLeft, ImageIcon, X } from 'lucide-react'
import { useLiveChat } from '@/hooks/use-live-chat'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function UserChatPage() {
  const { user, profile, isPartner } = useAuth()
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const notificationRequested = useRef(false)

  // Pass real user info when logged in, otherwise Guest
  const chatUserId = isPartner && user ? user.id : undefined
  const chatUserName = isPartner && profile ? `${profile.first_name} ${profile.last_name}` : 'Guest'

  const {
    conversation,
    messages,
    loading,
    startConversation,
    sendMessage,
    sendImage,
    endConversation,
  } = useLiveChat({ userId: chatUserId, userName: chatUserName })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (conversation) setTimeout(() => inputRef.current?.focus(), 100)
  }, [conversation])

  useEffect(() => {
    if (!notificationRequested.current && 'Notification' in window) {
      notificationRequested.current = true
      if (Notification.permission === 'default') Notification.requestPermission()
    }
  }, [])

  async function handleStartChat() {
    await startConversation('support')
  }

  async function handleSend() {
    if (selectedImage) {
      const caption = input.trim() || undefined
      const file = selectedImage
      setInput('')
      clearImage()
      await sendImage(file, caption)
    } else {
      if (!input.trim()) return
      const msg = input
      setInput('')
      await sendMessage(msg)
    }
  }

  async function handleEnd() {
    await endConversation()
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setSelectedImage(null)
    setImagePreview(null)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl overflow-hidden flex flex-col"
        style={{ height: 'min(640px, calc(100vh - 2rem))', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {conversation && (
              <button onClick={handleEnd} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors" title="End conversation">
                <ArrowLeft className="h-5 w-5 text-slate-800" />
              </button>
            )}
            <div>
              <h3 className="text-base font-semibold tracking-[-0.02em]">
                {conversation
                  ? 'Support'
                  : <><span className="text-slate-900">Open</span><span className="text-teal-600">Price</span></>}
              </h3>
              <p className="text-sm text-slate-500">
                {conversation ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-teal-600" />
                    Connected
                  </span>
                ) : 'Live Chat'}
              </p>
            </div>
          </div>
          <a href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Back to app</a>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!conversation ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
                <User className="h-7 w-7 text-teal-600" />
              </div>
              <h4 className="mb-1 text-base font-semibold text-slate-900 tracking-[-0.02em]">Chat with a Human</h4>
              <p className="mb-6 text-center text-sm text-slate-400">Get help from our support team in real-time.</p>
              <button onClick={handleStartChat} disabled={loading}
                className="flex w-full items-center gap-4 rounded-xl bg-white px-5 py-4 text-left transition-all duration-200 hover:bg-slate-50 border border-slate-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-900">Support</span>
                  <p className="text-sm text-slate-400">Questions, pricing & technical help</p>
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-slate-400">
                      A support agent will be with you shortly.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('mb-3 flex flex-col', msg.sender_role === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn('max-w-[80%] rounded-xl px-4 py-2.5 text-sm', msg.sender_role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900 border border-slate-200')}
                    >
                      {msg.sender_role === 'agent' && (
                        <p className="mb-1 text-xs font-medium text-slate-500">{msg.sender_name}</p>
                      )}
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="Shared image"
                          className="max-w-[240px] w-full rounded-lg mb-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightboxUrl(msg.image_url!)}
                        />
                      )}
                      {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                    </div>
                    <span className="mt-1 text-xs text-slate-400">{formatTime(msg.created_at)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                {/* Image preview */}
                {imagePreview && (
                  <div className="mb-2 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-slate-200" />
                    <button onClick={clearImage}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleFileSelect} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-50 transition-colors shrink-0 border border-slate-200"
                    title="Attach image"
                  >
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder={selectedImage ? 'Add a caption...' : 'Type a message...'}
                    className="flex-1 rounded-lg bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border border-slate-300"
                  />
                  <button onClick={handleSend} disabled={!input.trim() && !selectedImage}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white transition-all duration-150 hover:bg-black disabled:opacity-50"
                    title="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Full size" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  )
}
