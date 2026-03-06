import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, MessageCircle, ArrowLeft, RefreshCw, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, generateId } from '@/lib/utils'
import { playAdminNotificationSound } from '@/hooks/use-live-chat'

interface Conversation {
  id: string
  user_id: string
  user_name: string
  status: 'open' | 'closed'
  department: 'support' | 'sales'
  created_at: string
  updated_at?: string
  unread?: number
}

interface ChatMessage {
  id: string
  conversation_id: string
  sender_role: 'user' | 'agent'
  sender_name: string
  content: string
  image_url?: string | null
  created_at: string
}

export function AdminChatPanel({ onClose }: { onClose: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when conversation selected
  useEffect(() => {
    if (selected) setTimeout(() => inputRef.current?.focus(), 100)
  }, [selected])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Load all open conversations
  const loadConversations = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    if (error) console.error('[Admin] Load convos error:', error)
    if (data) setConversations(data as Conversation[])
    setLoading(false)
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  // === REALTIME: new conversations ===
  useEffect(() => {
    const channel = supabase
      .channel(`admin-convos:${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_conversations' },
        (payload) => {
          const newConvo = payload.new as Conversation
          setConversations((prev) => {
            if (prev.some((c) => c.id === newConvo.id)) return prev
            return [newConvo, ...prev]
          })
          playAdminNotificationSound()
          if (document.hidden && Notification.permission === 'granted') {
            new Notification('New Chat', { body: `${newConvo.user_name} started a conversation` })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_conversations' },
        (payload) => {
          const updated = payload.new as Conversation
          if (updated.status === 'closed') {
            setConversations((prev) => prev.filter((c) => c.id !== updated.id))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // === POLL conversations every 5s ===
  useEffect(() => {
    const poll = async () => {
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (data) {
        setConversations((prev) => {
          const prevIds = new Set(prev.map((c) => c.id))
          const newOnes = (data as Conversation[]).filter((c) => !prevIds.has(c.id))
          if (newOnes.length > 0) playAdminNotificationSound()
          return data as Conversation[]
        })
      }
    }
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [])

  // Load messages for selected conversation
  useEffect(() => {
    if (!selected) return
    async function loadMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selected!.id)
        .order('created_at', { ascending: true })
      if (error) console.error('[Admin] Load messages error:', error)
      if (data) setMessages(data as ChatMessage[])
    }
    loadMessages()
  }, [selected?.id])

  // Track seen DB message IDs for sound dedup
  const seenMsgIdsRef = useRef<Set<string>>(new Set())

  // === POLL messages every 3s for selected conversation ===
  useEffect(() => {
    if (!selected) return
    seenMsgIdsRef.current = new Set()

    const poll = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selected.id)
        .order('created_at', { ascending: true })
      if (data) {
        setMessages((prev) => {
          const dbMsgs = data as ChatMessage[]
          const dbIds = new Set(dbMsgs.map((m) => m.id))
          const keptOptimistic = prev.filter((m) =>
            !dbIds.has(m.id) && m.sender_role === 'agent' &&
            !dbMsgs.some((d) => d.sender_role === 'agent' && d.content === m.content)
          )

          const newUserMsgs = dbMsgs.filter((m) => m.sender_role === 'user' && !seenMsgIdsRef.current.has(m.id))
          if (newUserMsgs.length > 0 && seenMsgIdsRef.current.size > 0) {
            playAdminNotificationSound()
            if (document.hidden && Notification.permission === 'granted') {
              new Notification('New Message', { body: newUserMsgs[newUserMsgs.length - 1].content || 'Sent an image' })
            }
          }

          dbMsgs.forEach((m) => seenMsgIdsRef.current.add(m.id))

          const merged = [...dbMsgs, ...keptOptimistic]
          if (merged.length === prev.length && merged.every((m, i) => m.id === prev[i]?.id)) return prev
          return merged
        })
      }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [selected?.id])

  // Send message as agent
  async function handleSend() {
    if (selectedImage && selected) {
      const caption = input.trim() || undefined
      const file = selectedImage
      setInput('')
      clearImage()
      await handleSendImage(file, caption)
      return
    }
    if (!input.trim() || !selected) return
    const content = input.trim()
    setInput('')

    const optimisticMsg: ChatMessage = {
      id: generateId(),
      conversation_id: selected.id,
      sender_role: 'agent',
      sender_name: 'Admin',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selected.id,
      sender_role: 'agent',
      sender_name: 'Admin',
      content,
    })
    if (error) {
      console.error('[Admin] Send error:', error)
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
      setInput(content)
    }
  }

  // Send image as agent
  async function handleSendImage(file: File, caption?: string) {
    if (!selected) return
    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) return

    const ext = file.name.split('.').pop() || 'png'
    const path = `${selected.id}/${Date.now()}_${generateId()}.${ext}`
    const localUrl = URL.createObjectURL(file)

    const optimisticMsg: ChatMessage = {
      id: generateId(),
      conversation_id: selected.id,
      sender_role: 'agent',
      sender_name: 'Admin',
      content: caption || '',
      image_url: localUrl,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(path, file, { contentType: file.type })

    if (uploadError) {
      console.error('[Admin] Upload error:', uploadError)
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
      return
    }

    const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(path)

    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selected.id,
      sender_role: 'agent',
      sender_name: 'Admin',
      content: caption || '',
      image_url: urlData.publicUrl,
    })
    if (error) {
      console.error('[Admin] Send image error:', error)
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) return
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Close a conversation
  async function handleCloseConversation(convoId: string) {
    await supabase.from('chat_conversations').update({ status: 'closed' }).eq('id', convoId)
    setConversations((prev) => prev.filter((c) => c.id !== convoId))
    if (selected?.id === convoId) {
      setSelected(null)
      setMessages([])
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-semibold text-slate-900 tracking-[-0.02em]">OpenBroker Chat</h2>
          <span className="text-xs text-slate-400 font-medium">
            {conversations.length} open {conversations.length === 1 ? 'conversation' : 'conversations'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadConversations} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 transition-colors" title="Close Admin Panel">
            <X className="w-4 h-4 text-slate-900" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className="w-[320px] border-r border-slate-200 flex flex-col overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                <MessageCircle className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No open conversations</p>
              <p className="text-xs text-slate-300 mt-1">New chats will appear here in real-time</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelected(convo)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-100',
                  selected?.id === convo.id ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold shrink-0 mt-0.5">
                  {convo.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 truncate">{convo.user_name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatDate(convo.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-500 capitalize">{convo.department}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCloseConversation(convo.id) }}
                      className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50">
                <MessageCircle className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Select a conversation</p>
              <p className="text-xs text-slate-400 mt-1">Choose from the list to start responding</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setSelected(null); setMessages([]) }}
                    className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-900" />
                  </button>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                    {selected.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">{selected.user_name}</span>
                    <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-600" />
                      {selected.department} · {formatTime(selected.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCloseConversation(selected.id)}
                  className="text-xs text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  End Chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-slate-400">No messages yet. The user will send the first message.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('mb-3 flex flex-col', msg.sender_role === 'agent' ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[65%] rounded-xl px-4 py-2.5 text-sm',
                        msg.sender_role === 'agent' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900 border border-slate-200'
                      )}
                    >
                      {msg.sender_role === 'user' && (
                        <p className="mb-1 text-xs font-medium text-slate-500">{msg.sender_name}</p>
                      )}
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="Shared image"
                          className="max-w-[280px] w-full rounded-lg mb-1.5 cursor-pointer hover:opacity-90 transition-opacity"
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

              {/* Reply Input */}
              <div className="px-4 pb-4 pt-2 border-t border-slate-100">
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
                    placeholder={selectedImage ? 'Add a caption...' : 'Reply as Admin...'}
                    className="flex-1 rounded-lg bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border border-slate-300"
                    
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() && !selectedImage}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white transition-all duration-150 hover:opacity-85 disabled:opacity-50"
                    title="Send reply"
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
