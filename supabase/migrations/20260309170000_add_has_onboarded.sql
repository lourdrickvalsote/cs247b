ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_onboarded boolean NOT NULL DEFAULT false;
UPDATE profiles SET has_onboarded = true WHERE created_at < now();
