import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, MessageCircle, ArrowLeft, RefreshCw } from 'lucide-react'
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
  created_at: string
}

export function AdminChatPanel({ onClose }: { onClose: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    console.log('[Admin] Subscribing to conversation changes')
    const channel = supabase
      .channel(`admin-convos:${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_conversations' },
        (payload) => {
          console.log('[Admin RT] New conversation:', payload.new)
          const newConvo = payload.new as Conversation
          setConversations((prev) => {
            if (prev.some((c) => c.id === newConvo.id)) return prev
            return [newConvo, ...prev]
          })
          playAdminNotificationSound()
          if (document.hidden && Notification.permission === 'granted') {
            new Notification('New Chat', { body: `${newConvo.user_name} started a ${newConvo.department} conversation` })
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
      .subscribe((status) => {
        console.log('[Admin] Conversations realtime status:', status)
      })
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
          // Return full fresh list from DB
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
      console.log('[Admin] Loading messages for', selected!.id)
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

  // === REALTIME: messages for selected conversation ===
  useEffect(() => {
    if (!selected) return
    console.log('[Admin] Subscribing to messages for', selected.id)
    const channel = supabase
      .channel(`admin-msgs:${selected.id}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selected.id}`,
        },
        (payload) => {
          console.log('[Admin RT] New message:', payload.new)
          const newMsg = payload.new as ChatMessage
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            // Skip agent messages that match optimistic (same content)
            if (newMsg.sender_role === 'agent' && prev.some((m) =>
              m.sender_role === 'agent' && m.content === newMsg.content
            )) return prev
            return [...prev, newMsg]
          })
          if (newMsg.sender_role === 'user') {
            playAdminNotificationSound()
            if (document.hidden && Notification.permission === 'granted') {
              new Notification('New Message', { body: newMsg.content })
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Admin] Messages realtime status:', status)
      })
    return () => { supabase.removeChannel(channel) }
  }, [selected?.id])

  // === POLL messages every 3s for selected conversation ===
  useEffect(() => {
    if (!selected) return
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
          // Keep optimistic agent messages not yet in DB
          const keptOptimistic = prev.filter((m) => !dbIds.has(m.id) && m.sender_role === 'agent')
          // Check for new user messages (play sound)
          const prevUserIds = new Set(prev.filter((m) => m.sender_role === 'user').map((m) => m.id))
          const newUserMsgs = dbMsgs.filter((m) => m.sender_role === 'user' && !prevUserIds.has(m.id))
          if (newUserMsgs.length > 0 && prev.length > 0) {
            playAdminNotificationSound()
          }
          return [...dbMsgs, ...keptOptimistic]
        })
      }
    }
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [selected?.id])

  // Send message as agent (with optimistic update)
  async function handleSend() {
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

    console.log('[Admin] Sending message to', selected.id)
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
    } else {
      console.log('[Admin] Message sent OK')
    }
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
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(39,39,42,0.15)]">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-black" />
          <h2 className="text-[15px] font-semibold text-black tracking-[-0.02em]">Admin Chat Panel</h2>
          <span className="text-[11px] text-[#A1A1AA] font-medium">
            {conversations.length} open {conversations.length === 1 ? 'conversation' : 'conversations'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadConversations}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#FAFAFA] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-[#71717A]" />
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#FAFAFA] transition-colors"
            title="Close Admin Panel"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className="w-[320px] border-r border-[rgba(39,39,42,0.15)] flex flex-col overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[13px] text-[#A1A1AA]">Loading...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAFAFA]">
                <MessageCircle className="h-6 w-6 text-[#A1A1AA]" />
              </div>
              <p className="text-[13px] text-[#A1A1AA]">No open conversations</p>
              <p className="text-[11px] text-[#D1D5DB] mt-1">New chats will appear here in real-time</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelected(convo)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-[rgba(39,39,42,0.08)]',
                  selected?.id === convo.id ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]/60'
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-[12px] font-semibold shrink-0 mt-0.5">
                  {convo.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-black truncate">{convo.user_name}</span>
                    <span className="text-[10px] text-[#A1A1AA] shrink-0 ml-2">{formatDate(convo.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-[#71717A] capitalize">{convo.department}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCloseConversation(convo.id) }}
                      className="text-[10px] text-[#A1A1AA] hover:text-red-500 transition-colors"
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
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FAFAFA]">
                <MessageCircle className="h-7 w-7 text-[#A1A1AA]" />
              </div>
              <p className="text-[14px] text-[#71717A] font-medium">Select a conversation</p>
              <p className="text-[12px] text-[#A1A1AA] mt-1">Choose from the list to start responding</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(39,39,42,0.15)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setSelected(null); setMessages([]) }}
                    className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#FAFAFA] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-black" />
                  </button>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-[12px] font-semibold">
                    {selected.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold text-black">{selected.user_name}</span>
                    <p className="text-[11px] text-[#71717A] capitalize flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                      {selected.department} · {formatTime(selected.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCloseConversation(selected.id)}
                  className="text-[12px] text-[#A1A1AA] hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  End Chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-[13px] text-[#A1A1AA]">No messages yet. The user will send the first message.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'mb-3 flex flex-col',
                      msg.sender_role === 'agent' ? 'items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[65%] rounded-xl px-4 py-2.5 text-[14px]',
                        msg.sender_role === 'agent'
                          ? 'bg-black text-white'
                          : 'bg-[#FAFAFA] text-black'
                      )}
                      style={
                        msg.sender_role === 'user'
                          ? { border: '1px solid rgba(39, 39, 42, 0.15)' }
                          : undefined
                      }
                    >
                      {msg.sender_role === 'user' && (
                        <p className="mb-1 text-[11px] font-medium text-[#71717A]">{msg.sender_name}</p>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="mt-1 text-[11px] text-[#A1A1AA]">{formatTime(msg.created_at)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="px-4 pb-4 pt-2 border-t border-[rgba(39,39,42,0.1)]">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Reply as Admin..."
                    className="flex-1 rounded-lg bg-white px-3 py-2.5 text-[14px] text-black placeholder:text-[#A1A1AA] outline-none transition-all duration-150 focus:border-black"
                    style={{ border: '1px solid rgba(39, 39, 42, 0.3)' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white transition-all duration-150 hover:opacity-85 disabled:opacity-50"
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
    </div>
  )
}
