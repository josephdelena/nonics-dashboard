CREATE TABLE IF NOT EXISTS nonics_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE nonics_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only" ON nonics_config USING (false);
