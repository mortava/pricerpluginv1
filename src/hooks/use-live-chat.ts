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
    // Two-tone ascending chime (C5 → E5)
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523, ctx.currentTime) // C5
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.15)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.15) // E5
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
    // Three short knocks (G4 → G4 → B4)
    const notes = [392, 392, 494] // G4, G4, B4
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

  // CRITICAL: stable user ID across renders — useMemo so it doesn't regenerate
  const resolvedUserId = useMemo(() => userId || 'anonymous-' + generateId(), [userId])
  const resolvedUserName = userName || 'Guest'

  // Subscribe to real-time messages for the active conversation
  useEffect(() => {
    if (!supabase || !conversation) return

    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as LiveChatMessage
          setMessages((prev) => {
            // Deduplicate — skip if we already have this message (by DB id)
            // or if it's a user message we already optimistically added (match by content+role)
            if (prev.some((m) => m.id === newMsg.id)) return prev
            if (newMsg.sender_role === 'user' && prev.some((m) =>
              m.sender_role === 'user' && m.content === newMsg.content && m.id !== newMsg.id
            )) return prev
            return [...prev, newMsg]
          })

          // Sound + desktop notification for agent messages only
          if (newMsg.sender_role === 'agent') {
            playUserNotificationSound()
            if (document.hidden && Notification.permission === 'granted') {
              new Notification('OpenPrice', {
                body: newMsg.content,
                icon: '/vite.svg',
              })
            }
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase!.removeChannel(channel)
      channelRef.current = null
    }
  }, [conversation?.id])

  // Load existing open conversation on mount
  useEffect(() => {
    if (!supabase) return

    async function loadExisting() {
      const { data } = await supabase!
        .from('chat_conversations')
        .select('*')
        .eq('user_id', resolvedUserId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setConversation(data as LiveChatConversation)
        const { data: msgs } = await supabase!
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
      if (!supabase) {
        const localConvo: LiveChatConversation = {
          id: generateId(),
          user_id: resolvedUserId,
          user_name: resolvedUserName,
          status: 'open',
          department,
          created_at: new Date().toISOString(),
        }
        setConversation(localConvo)
        setMessages([])
        return localConvo
      }

      setLoading(true)
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
      if (error) throw error

      const convo = data as LiveChatConversation
      setConversation(convo)
      setMessages([])
      return convo
    },
    [resolvedUserId, resolvedUserName]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const localMsg: LiveChatMessage = {
        id: generateId(),
        conversation_id: conversation?.id || '',
        sender_role: 'user',
        sender_name: resolvedUserName,
        content: content.trim(),
        created_at: new Date().toISOString(),
      }

      if (!supabase || !conversation) {
        setMessages((prev) => [...prev, localMsg])
        return
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
        setMessages((prev) => prev.filter((m) => m.id !== localMsg.id))
        throw error
      }

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id)
    },
    [conversation, resolvedUserName]
  )

  const endConversation = useCallback(async () => {
    if (supabase && conversation) {
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
    isConnected: !!supabase,
  }
}
