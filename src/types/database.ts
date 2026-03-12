export type ActivityCategory =
  | 'stretching'
  | 'breathing'
  | 'mindfulness'
  | 'movement'
  | 'eye_rest';

export type SessionType = 'work' | 'short_break' | 'long_break';

export interface ActivityStep {
  instruction: string;
  duration_seconds: number;
}

export interface Profile {
  id: string;
  display_name: string;
  has_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  work_duration_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  sessions_before_long_break: number;
  auto_start_breaks: boolean;
  auto_start_work: boolean;
  sound_enabled: boolean;
  notification_enabled: boolean;
}

export interface BreakActivity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  duration_seconds: number;
  instructions: ActivityStep[];
  icon_name: string;
  is_default: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  type: SessionType;
  planned_duration_seconds: number;
  actual_duration_seconds: number;
  completed: boolean;
  activity_id: string | null;
  session_group_id: string | null;
}

export interface SessionWithActivity extends Session {
  break_activities: BreakActivity | null;
}

export interface RoundPair {
  workSession: SessionWithActivity | null;
  breakSession: SessionWithActivity | null;
}

export interface StudyRound {
  id: string;
  rounds: RoundPair[];
  startedAt: string;
  endedAt: string | null;
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  totalDurationSeconds: number;
}

export interface UserActivityPreference {
  id: string;
  user_id: string;
  activity_id: string;
  is_favorited: boolean;
  is_hidden: boolean;
}
