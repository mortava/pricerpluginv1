-- ============================================================
-- OpenPrice Live Chat — Supabase Table Setup
-- Run this in Supabase Dashboard → SQL Editor
-- Then enable Realtime on both tables:
--   Dashboard → Database → Replication → Enable for chat_conversations & chat_messages
-- ============================================================

-- Chat conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Guest',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  department TEXT NOT NULL DEFAULT 'support' CHECK (department IN ('support', 'sales')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'agent')),
  sender_name TEXT NOT NULL DEFAULT 'Guest',
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conv_status ON public.chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON public.chat_messages(conversation_id);

-- Row Level Security (allow all for anon key — simple public chat)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on chat_conversations"
  ON public.chat_conversations FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on chat_messages"
  ON public.chat_messages FOR ALL
  USING (true) WITH CHECK (true);

-- CRITICAL: Enable REPLICA IDENTITY FULL for realtime filters on non-PK columns
-- Without this, realtime subscriptions with filter (e.g. conversation_id=eq.XXX) silently fail
ALTER TABLE public.chat_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Enable realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads to chat-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Allow public reads from chat-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');
