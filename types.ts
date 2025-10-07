// This is the primary User object used throughout the application's components.
// It's a composite of data from Supabase Auth and the 'profiles' table.
export interface User {
  id: string; // from auth.users
  email: string; // from auth.users
  username: string; // from profiles
  avatarUrl: string; // from profiles
  bio: string | null; // from profiles
  xp: number; // from profiles
  role: 'student' | 'admin'; // from profiles
  badges: Badge[]; // Joined from user_badges -> badges
  currentStreak: number; // from profiles
  lastLogin: string; // from profiles
}

// Represents the public-facing user data stored in the 'profiles' table.
// The 'email' is joined from 'auth.users' for admin views.
export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string | null;
  xp: number;
  role: 'student' | 'admin';
  current_streak: number;
  last_login: string;
  email?: string; // Optional because it's only fetched for admins
}

export type ConnectionStatus = 'not_connected' | 'pending_sent' | 'pending_received' | 'connected';

export interface ProfileWithConnection extends Profile {
    connectionStatus: ConnectionStatus;
    actionUserId?: string; // The user who sent the request, if status is 'pending_received'
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export type EventType = 'Hackathon' | 'Workshop' | 'Talk' | 'Faith & Tech';

export interface Event {
  id: number;
  name:string;
  description: string;
  date: string;
  location?: string | null;
  xp_reward: number;
  image_url?: string | null;
  type?: EventType;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  instructor?: string | null;
  image_url?: string | null;
  xp_reward: number;
  badge_id_reward: number | null;
  // This field is added client-side after joining with the 'badges' table
  badgeReward?: Badge | null;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar_url: string;
  xp: number;
  level: number;
  role: 'student' | 'admin';
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  xp_cost: number;
  icon: string;
}

export interface Redemption {
    id: number;
    redeemed_at: string;
    status: 'Pending' | 'Completed';
    // This relation is populated by the API call
    reward: {
        name: string;
        icon: string;
        xp_cost: number;
    }
    // For admin view, user info is also included
    user?: {
      id: string;
      username: string;
    }
}

export interface AdminAnalyticsData {
  users: number;
  admins: number;
  events: number;
  courses: number;
  redemptions: number;
}

export interface CourseEnrollment {
  user_id: string;
  course_id: number;
}

export interface StudyGroup {
    id: number;
    name: string;
    description: string;
    icon: string;
}

export interface StudyGroupDetails extends StudyGroup {
    members: Profile[];
}

export interface Connection {
    user_1_id: string;
    user_2_id: string;
    status: 'pending' | 'accepted';
    action_user_id: string;
}

export interface StudyGroupMember {
    group_id: number;
    user_id: string;
    status: 'member' | 'pending_request';
}