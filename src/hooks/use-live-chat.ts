import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/utils'

export interface LiveChatMessage {
  id: string
  conversation_id: string
  sender_role: 'user' | 'agent'
  sender_name: string
  content: string
  created_at: string
}

export interface LiveChatConversation {
  id: string
  user_id: string
  user_name: string
  status: 'open' | 'closed'
  department: 'support' | 'sales'
  created_at: string
}

interface UseLiveChatOptions {
  userId?: string
  userName?: string
}

// Notification sound for USER side — bright ascending chime when agent replies
export function playUserNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523, ctx.currentTime)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.15)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.15)
    osc2.start(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.35)
    gain.gain.setValueAtTime(0.35, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
  } catch {}
}

// Notification sound for ADMIN side — deeper triple-knock when user messages
export function playAdminNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [392, 392, 494]
    const times = [0, 0.12, 0.24]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + times[i])
      gain.gain.setValueAtTime(0.3, ctx.currentTime + times[i])
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + times[i] + 0.1)
      osc.start(ctx.currentTime + times[i])
      osc.stop(ctx.currentTime + times[i] + 0.12)
    })
  } catch {}
}

export function useLiveChat({ userId, userName }: UseLiveChatOptions = {}) {
  const [conversation, setConversation] = useState<LiveChatConversation | null>(null)
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)
  const prevMsgCountRef = useRef(0)

  const resolvedUserId = useMemo(() => userId || 'anonymous-' + generateId(), [userId])
  const resolvedUserName = userName || 'Guest'

  // Merge messages helper — dedup by id, keep existing optimistic ones
  const mergeMessages = useCallback((prev: LiveChatMessage[], incoming: LiveChatMessage[]) => {
    const existingIds = new Set(prev.map((m) => m.id))
    const newMsgs = incoming.filter((m) => !existingIds.has(m.id))
    if (newMsgs.length === 0) return prev
    return [...prev, ...newMsgs]
  }, [])

  // === REALTIME subscription ===
  useEffect(() => {
    if (!conversation) return
    console.log('[Chat] Subscribing to realtime for', conversation.id)

    const channel = supabase
      .channel(`user-chat:${conversation.id}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log('[Chat RT]', payload.new)
          const newMsg = payload.new as LiveChatMessage
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            // For user's own messages, skip if we have optimistic match
            if (newMsg.sender_role === 'user' && prev.some((m) =>
              m.sender_role === 'user' && m.content === newMsg.content
            )) return prev
            return [...prev, newMsg]
          })
          if (newMsg.sender_role === 'agent') {
            playUserNotificationSound()
            if (document.hidden && Notification.permission === 'granted') {
              new Notification('OpenPrice', { body: newMsg.content, icon: '/vite.svg' })
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Chat] Realtime status:', status)
      })

    channelRef.current = channel
    return () => {
      console.log('[Chat] Unsubscribing realtime')
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [conversation?.id])

  // === POLLING fallback — fetch new messages every 3s ===
  useEffect(() => {
    if (!conversation) return
    console.log('[Chat] Starting poll for', conversation.id)

    const poll = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[Chat] Poll error:', error)
        return
      }
      if (data && data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          // Find genuinely new DB messages
          const newFromDb = (data as LiveChatMessage[]).filter((m) => !existingIds.has(m.id))
          if (newFromDb.length === 0) return prev

          // Check if any are agent messages we don't have yet (play sound)
          const newAgentMsgs = newFromDb.filter((m) => m.sender_role === 'agent')
          if (newAgentMsgs.length > 0 && prev.length > 0) {
            playUserNotificationSound()
          }

          // Replace optimistic user messages with real DB versions
          const optimisticUserMsgs = prev.filter((m) =>
            m.sender_role === 'user' && !data.some((d: any) => d.id === m.id)
          )
          // Keep optimistic messages that aren't in DB yet (still inserting)
          // Add all DB messages
          const dbIds = new Set((data as LiveChatMessage[]).map((m) => m.id))
          const keptOptimistic = prev.filter((m) => !dbIds.has(m.id) && m.sender_role === 'user')
          return [...(data as LiveChatMessage[]), ...keptOptimistic]
        })
      }
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [conversation?.id])

  // Load existing open conversation on mount
  useEffect(() => {
    async function loadExisting() {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', resolvedUserId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.log('[Chat] No existing conversation:', error.code)
        return
      }
      if (data) {
        console.log('[Chat] Loaded existing conversation:', data.id)
        setConversation(data as LiveChatConversation)
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', data.id)
          .order('created_at', { ascending: true })
        if (msgs) setMessages(msgs as LiveChatMessage[])
      }
    }
    loadExisting()
  }, [resolvedUserId])

  const startConversation = useCallback(
    async (department: 'support' | 'sales' = 'support') => {
      setLoading(true)
      console.log('[Chat] Starting conversation, department:', department)
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: resolvedUserId,
          user_name: resolvedUserName,
          department,
        })
        .select()
        .single()

      setLoading(false)
      if (error) {
        console.error('[Chat] Start conversation error:', error)
        throw error
      }

      console.log('[Chat] Conversation created:', data.id)
      const convo = data as LiveChatConversation
      setConversation(convo)
      setMessages([])
      return convo
    },
    [resolvedUserId, resolvedUserName]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !conversation) return

      const localMsg: LiveChatMessage = {
        id: generateId(),
        conversation_id: conversation.id,
        sender_role: 'user',
        sender_name: resolvedUserName,
        content: content.trim(),
        created_at: new Date().toISOString(),
      }

      // Optimistic update
      setMessages((prev) => [...prev, localMsg])

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: conversation.id,
        sender_role: 'user',
        sender_name: resolvedUserName,
        content: content.trim(),
      })

      if (error) {
        console.error('[Chat] Send message error:', error)
        setMessages((prev) => prev.filter((m) => m.id !== localMsg.id))
        return
      }

      console.log('[Chat] Message sent OK')
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id)
    },
    [conversation, resolvedUserName]
  )

  const endConversation = useCallback(async () => {
    if (conversation) {
      await supabase
        .from('chat_conversations')
        .update({ status: 'closed' })
        .eq('id', conversation.id)
    }
    setConversation(null)
    setMessages([])
  }, [conversation])

  return {
    conversation,
    messages,
    loading,
    startConversation,
    sendMessage,
    endConversation,
    isConnected: true,
  }
}
