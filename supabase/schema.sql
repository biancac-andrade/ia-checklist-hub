CREATE TABLE IF NOT EXISTS public.topic_progress (
  topic_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'deep_study', 'accelerated', 'review_later')
  ),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_topic_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_topic_progress_updated_at ON public.topic_progress;

CREATE TRIGGER trg_topic_progress_updated_at
BEFORE UPDATE ON public.topic_progress
FOR EACH ROW
EXECUTE FUNCTION public.set_topic_progress_updated_at();

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to topic_progress" ON public.topic_progress;

CREATE POLICY "Allow full access to topic_progress"
ON public.topic_progress
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);
