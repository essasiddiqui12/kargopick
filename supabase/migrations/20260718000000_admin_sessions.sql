CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_sessions_service_role_all"
  ON public.admin_sessions
  FOR ALL
  TO service_role
  USING (true);
