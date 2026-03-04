import { useState, useRef, useEffect } from 'react'
import { Send, User, ArrowLeft, ImageIcon, X } from 'lucide-react'
import { useLiveChat } from '@/hooks/use-live-chat'
import { cn } from '@/lib/utils'

export default function UserChatPage() {
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const notificationRequested = useRef(false)

  const {
    conversation,
    messages,
    loading,
    startConversation,
    sendMessage,
    sendImage,
    endConversation,
  } = useLiveChat({})

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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl overflow-hidden flex flex-col"
        style={{ height: 'min(640px, calc(100vh - 2rem))', border: '1px solid rgba(39,39,42,0.15)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(39,39,42,0.15)' }}>
          <div className="flex items-center gap-3">
            {conversation && (
              <button onClick={handleEnd} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F4F4F5] transition-colors" title="End conversation">
                <ArrowLeft className="h-4 w-4 text-black" />
              </button>
            )}
            <div>
              <h3 className="text-[15px] font-semibold tracking-[-0.02em]">
                {conversation
                  ? 'Support'
                  : <><span className="text-[#000000]">Open</span><span className="text-[#34D399]">Price</span></>}
              </h3>
              <p className="text-[12px] text-[#71717A]">
                {conversation ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                    Connected
                  </span>
                ) : 'Live Chat'}
              </p>
            </div>
          </div>
          <a href="/" className="text-[11px] text-[#A1A1AA] hover:text-[#71717A] transition-colors">Back to app</a>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!conversation ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5]">
                <User className="h-7 w-7 text-[#34D399]" />
              </div>
              <h4 className="mb-1 text-[15px] font-semibold text-black tracking-[-0.02em]">Chat with a Human</h4>
              <p className="mb-6 text-center text-[13px] text-[#A1A1AA]">Get help from our support team in real-time.</p>
              <button onClick={handleStartChat} disabled={loading}
                className="flex w-full items-center gap-4 rounded-xl bg-white px-5 py-4 text-left transition-all duration-200 hover:bg-[#FAFAFA]"
                style={{ border: '1px solid rgba(39,39,42,0.15)' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECFDF5]">
                  <User className="h-5 w-5 text-[#34D399]" />
                </div>
                <div>
                  <span className="text-[14px] font-medium text-black">Support</span>
                  <p className="text-[13px] text-[#A1A1AA]">Questions, pricing & technical help</p>
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-[13px] text-[#A1A1AA]">
                      A support agent will be with you shortly.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('mb-3 flex flex-col', msg.sender_role === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn('max-w-[80%] rounded-xl px-4 py-2.5 text-[14px]', msg.sender_role === 'user' ? 'bg-black text-white' : 'bg-[#FAFAFA] text-black')}
                      style={msg.sender_role === 'agent' ? { border: '1px solid rgba(39,39,42,0.15)' } : undefined}
                    >
                      {msg.sender_role === 'agent' && (
                        <p className="mb-1 text-[11px] font-medium text-[#71717A]">{msg.sender_name}</p>
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
                    <span className="mt-1 text-[11px] text-[#A1A1AA]">{formatTime(msg.created_at)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(39,39,42,0.1)' }}>
                {/* Image preview */}
                {imagePreview && (
                  <div className="mb-2 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-[rgba(39,39,42,0.15)]" />
                    <button onClick={clearImage}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleFileSelect} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[#FAFAFA] transition-colors shrink-0"
                    style={{ border: '1px solid rgba(39,39,42,0.15)' }}
                    title="Attach image"
                  >
                    <ImageIcon className="h-4 w-4 text-[#71717A]" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder={selectedImage ? 'Add a caption...' : 'Type a message...'}
                    className="flex-1 rounded-lg bg-white px-3 py-2.5 text-[14px] text-black placeholder:text-[#A1A1AA] outline-none transition-all duration-150 focus:border-black"
                    style={{ border: '1px solid rgba(39,39,42,0.3)' }}
                  />
                  <button onClick={handleSend} disabled={!input.trim() && !selectedImage}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white transition-all duration-150 hover:opacity-85 disabled:opacity-50"
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
