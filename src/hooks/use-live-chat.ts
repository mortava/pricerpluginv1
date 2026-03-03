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

  const resolvedUserId = useMemo(() => userId || 'anonymous-' + generateId(), [userId])
  const resolvedUserName = userName || 'Guest'

  // Track which DB message IDs we've already seen (for sound dedup)
  const seenDbIdsRef = useRef<Set<string>>(new Set())

  // === Canonical merge: DB is source of truth, keep unsent optimistic msgs ===
  const mergeFromDb = useCallback((dbData: LiveChatMessage[], playSound: boolean) => {
    setMessages((prev) => {
      const dbIds = new Set(dbData.map((m) => m.id))
      // Keep optimistic user messages not yet confirmed by DB
      const keptOptimistic = prev.filter((m) => !dbIds.has(m.id) && m.sender_role === 'user')

      // Detect genuinely new agent messages for notification sound
      if (playSound) {
        const newAgentMsgs = dbData.filter((m) => m.sender_role === 'agent' && !seenDbIdsRef.current.has(m.id))
        if (newAgentMsgs.length > 0 && (prev.length > 0 || seenDbIdsRef.current.size > 0)) {
          playUserNotificationSound()
          if (document.hidden && Notification.permission === 'granted') {
            new Notification('OpenPrice', { body: newAgentMsgs[newAgentMsgs.length - 1].content, icon: '/vite.svg' })
          }
        }
      }

      // Update seen IDs
      dbData.forEach((m) => seenDbIdsRef.current.add(m.id))

      const merged = [...dbData, ...keptOptimistic]
      // Only update state if actually different
      if (merged.length === prev.length && merged.every((m, i) => m.id === prev[i]?.id)) return prev
      return merged
    })
  }, [])

  // === POLLING — single source of truth, fetch every 3s ===
  useEffect(() => {
    if (!conversation) return
    console.log('[Chat] Starting poll for', conversation.id)
    seenDbIdsRef.current = new Set()

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
      if (data) {
        mergeFromDb(data as LiveChatMessage[], true)
      }
    }

    // Initial fetch
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [conversation?.id, mergeFromDb])

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
