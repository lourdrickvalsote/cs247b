/*
  # Create Core Tables for Brevi

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `work_duration_minutes` (integer, default 25)
      - `short_break_minutes` (integer, default 5)
      - `long_break_minutes` (integer, default 15)
      - `sessions_before_long_break` (integer, default 4)
      - `auto_start_breaks` (boolean, default false)
      - `auto_start_work` (boolean, default false)
      - `sound_enabled` (boolean, default true)
      - `notification_enabled` (boolean, default true)
    - `break_activities`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text: stretching, breathing, mindfulness, movement, eye_rest)
      - `duration_seconds` (integer)
      - `instructions` (jsonb, array of step objects)
      - `icon_name` (text, maps to Lucide icon)
      - `is_default` (boolean, default true)
    - `sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
      - `type` (text: work, short_break, long_break)
      - `planned_duration_seconds` (integer)
      - `actual_duration_seconds` (integer, default 0)
      - `completed` (boolean, default false)
      - `activity_id` (uuid, nullable, references break_activities)
    - `user_activity_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `activity_id` (uuid, references break_activities)
      - `is_favorited` (boolean, default false)
      - `is_hidden` (boolean, default false)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their own data
    - Break activities readable by all authenticated users
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  work_duration_minutes integer NOT NULL DEFAULT 25,
  short_break_minutes integer NOT NULL DEFAULT 5,
  long_break_minutes integer NOT NULL DEFAULT 15,
  sessions_before_long_break integer NOT NULL DEFAULT 4,
  auto_start_breaks boolean NOT NULL DEFAULT false,
  auto_start_work boolean NOT NULL DEFAULT false,
  sound_enabled boolean NOT NULL DEFAULT true,
  notification_enabled boolean NOT NULL DEFAULT true
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Break activities table
CREATE TABLE IF NOT EXISTS break_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('stretching', 'breathing', 'mindfulness', 'movement', 'eye_rest')),
  duration_seconds integer NOT NULL DEFAULT 300,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  icon_name text NOT NULL DEFAULT 'activity',
  is_default boolean NOT NULL DEFAULT true
);

ALTER TABLE break_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read default activities"
  ON break_activities FOR SELECT
  TO authenticated
  USING (is_default = true);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  type text NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
  planned_duration_seconds integer NOT NULL,
  actual_duration_seconds integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  activity_id uuid REFERENCES break_activities(id) ON DELETE SET NULL
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User activity preferences table
CREATE TABLE IF NOT EXISTS user_activity_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES break_activities(id) ON DELETE CASCADE,
  is_favorited boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, activity_id)
);

ALTER TABLE user_activity_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_activity_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_activity_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_activity_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_activity_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_prefs_user ON user_activity_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_break_activities_category ON break_activities(category);
