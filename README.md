# ACM-UDST Arcade Dashboard

Welcome to the ACM-UDST Arcade Dashboard! This is a retro 90s RPG/arcade themed web application for the ACM UDST Student Chapter. It's designed to be a dynamic, fully functional, and visually unique, gamifying the student chapter experience with a real backend powered by Supabase.

## Features

- **Retro 90s/Arcade Theme**: A unique visual style combining pixel art, 90s web aesthetics, and arcade console UI elements.
- **RPG-style Dashboard**: A personalized dashboard for each member, showing their avatar, XP, level, and collected badges.
- **User Profiles & Avatars**: Customizable user profiles with a short bio and a selection of preset retro pixel-art avatars. View public profiles of other members from the leaderboard.
- **Gamified Events & Courses**: Participate in events and complete learning "quests" to earn XP and unlock rewards. All progress is saved per-user via Supabase, so you can track which events you've attended and which courses you've completed.
- **XP Redemption System**: Redeem your hard-earned XP for real-world rewards like food vouchers, coffee coupons, and exclusive ACM merchandise.
- **Live Leaderboard**: A high-score-style leaderboard ranking members by their XP.
- **Admin Dashboard**: A secure, role-protected dashboard for administrators to manage users, events, courses, and view analytics.
- **Supabase Backend**: Full integration with Supabase for authentication, user profiles, and data storage.

## Local Development Setup

To run the application locally, you first need to set up a Supabase project and connect the app to it.

### 1. Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Navigate to **Project Settings > API**.
3.  Find your **Project URL** and **`anon` public key**. You will need these for the next step.

### 2. Set up Environment Variables

1.  In the root directory of the project, create a new file named `.env.local`.
2.  Add your Supabase credentials to this file like so:

    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    *Replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_KEY` with the actual values from your Supabase project.*

### 3. Set up Database Tables

Go to the **SQL Editor** in your Supabase dashboard and run the SQL queries found in `supabase_schema.sql` to create the necessary tables and policies. This script will set up `profiles`, `badges`, `events`, `courses`, and all the tables needed to track user progress.

**Important**: The `supabase_schema.sql` file contains the initial setup. You will need to run the following SQL commands to add new columns and functions for the rewards and admin systems.

#### Add `bio` column to `profiles`
```sql
ALTER TABLE profiles
ADD COLUMN bio TEXT;
```

#### Create Rewards Tables
```sql
-- Create the rewards table
CREATE TABLE rewards (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  xp_cost INT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the user redemptions table
CREATE TABLE user_redemptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id BIGINT REFERENCES rewards(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'Pending' NOT NULL, -- Statuses: Pending, Completed
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Create Rewards RPC Function
```sql
CREATE OR REPLACE FUNCTION redeem_reward(
    user_id_input UUID,
    reward_id_input BIGINT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    reward_cost INT;
    user_xp INT;
BEGIN
    -- Get the cost of the reward
    SELECT xp_cost INTO reward_cost FROM rewards WHERE id = reward_id_input;

    -- Get the user's current XP
    SELECT xp INTO user_xp FROM profiles WHERE id = user_id_input;

    -- Check if the user has enough XP
    IF user_xp < reward_cost THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient XP');
    END IF;

    -- Deduct XP from the user
    UPDATE profiles
    SET xp = xp - reward_cost
    WHERE id = user_id_input;

    -- Record the redemption
    INSERT INTO user_redemptions (user_id, reward_id)
    VALUES (user_id_input, reward_id_input);

    RETURN json_build_object('success', true, 'message', 'Reward redeemed successfully');
END;
$$;
```

#### Add Columns for Admin Dashboard
```sql
-- Add role to profiles table
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'student' NOT NULL;

-- Add image_url to events and courses
ALTER TABLE events
ADD COLUMN image_url TEXT;

-- Add location to events
ALTER TABLE events
ADD COLUMN location TEXT;

-- Add type to events
ALTER TABLE events
ADD COLUMN type TEXT;

ALTER TABLE courses
ADD COLUMN image_url TEXT;

-- Add instructor to courses
ALTER TABLE courses
ADD COLUMN instructor TEXT;
```

#### Create Community & Study Group Tables
```sql
-- Create study_groups table
CREATE TABLE study_groups (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create study_group_members table
CREATE TABLE study_group_members (
    group_id BIGINT REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'member', -- e.g., 'member', 'pending_request'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);


-- Create connections (friendships) table
CREATE TABLE connections (
    user_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
    action_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- who sent the request or accepted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_1_id, user_2_id)
);

-- Add RLS Policies for Community features
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all study groups" ON study_groups FOR SELECT USING (true);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all study group memberships" ON study_group_members FOR SELECT USING (true);
-- Add more specific policies for joining/leaving as needed

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own connections" ON connections FOR ALL USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);
```

#### Create Admin Helper Function and RPCs
```sql
-- Helper function to check for admin role
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- RPC to get all users with their emails (for admin panel)
CREATE OR REPLACE FUNCTION get_all_users_with_details()
RETURNS TABLE(
    id UUID,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    xp INT,
    role TEXT,
    current_streak INT,
    last_login TIMESTAMPTZ,
    email TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Permission denied: You must be an admin.';
    END IF;

    RETURN QUERY
    SELECT
        p.id, p.username, p.avatar_url, p.bio, p.xp, p.role, p.current_streak, p.last_login, u.email
    FROM
        profiles p
    JOIN
        auth.users u ON p.id = u.id;
END;
$$;


-- RPC to update a user's role
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF is_admin(auth.uid()) THEN
        UPDATE profiles
        SET role = new_role
        WHERE id = target_user_id;
    ELSE
        RAISE EXCEPTION 'Permission denied: You must be an admin to change roles.';
    END IF;
END;
$$;

-- RPC to delete a user
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied: You must be an admin to delete users.';
  END IF;

  -- The request will cascade and delete from 'profiles' due to the trigger
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- RPC to get admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    user_count INT;
    admin_count INT;
    event_count INT;
    course_count INT;
    redemptions_count INT;
BEGIN
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Permission denied: You must be an admin.';
    END IF;

    SELECT COUNT(*) INTO user_count FROM profiles;
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    SELECT COUNT(*) INTO event_count FROM events;
    SELECT COUNT(*) INTO course_count FROM courses;
    SELECT COUNT(*) INTO redemptions_count FROM user_redemptions;

    RETURN json_build_object(
        'users', user_count,
        'admins', admin_count,
        'events', event_count,
        'courses', course_count,
        'redemptions', redemptions_count
    );
END;
$$;

-- RPC to update redemption status
CREATE OR REPLACE FUNCTION update_redemption_status(
    redemption_id_input BIGINT,
    new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Permission denied: You must be an admin.';
    END IF;
    UPDATE user_redemptions SET status = new_status WHERE id = redemption_id_input;
END;
$$;

-- RPCs for course enrollment management
CREATE OR REPLACE FUNCTION enroll_user_in_course(course_id_input INT, user_id_input UUID)
RETURNS VOID
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied. Must be an admin.';
  END IF;
  INSERT INTO user_courses(course_id, user_id) VALUES (course_id_input, user_id_input) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unenroll_user_from_course(course_id_input INT, user_id_input UUID)
RETURNS VOID
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied. Must be an admin.';
  END IF;
  DELETE FROM user_courses WHERE course_id = course_id_input AND user_id = user_id_input;
END;
$$ LANGUAGE plpgsql;


-- You will need to enable RLS on your tables and create policies.
-- Here is an example policy that allows admins to do anything on the 'events' table.
-- Similar policies should be created for 'courses', 'rewards', and 'profiles'.
-- Make sure to also have policies for regular users (e.g., SELECT access).

-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins can manage events"
-- ON events
-- FOR ALL
-- TO authenticated
-- USING (is_admin(auth.uid()))
-- WITH CHECK (is_admin(auth.uid()));

-- CREATE POLICY "Users can view events"
-- ON events
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- Run this for rewards table
-- ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins can manage rewards"
-- ON rewards
-- FOR ALL
-- TO authenticated
-- USING (is_admin(auth.uid()))
-- WITH CHECK (is_admin(auth.uid()));

-- CREATE POLICY "Users can view rewards"
-- ON rewards
-- FOR SELECT
-- TO authenticated
-- USING (true);
```

### 4. Install Dependencies & Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
3.  Open your browser and navigate to the local URL provided (usually `http://localhost:5173`). You can now sign up for a new account and test the application.

---

## Deployment Guide

You can deploy this application for free using services like Vercel or Netlify.

### 1. Push to GitHub

1.  Download or clone the project files.
2.  Create a new repository on your GitHub account.
3.  Upload the project files to your new repository.

### 2. Deploy with Vercel (Recommended)

1.  Sign up or log in to [vercel.com](https://vercel.com).
2.  From your dashboard, click **Add New... > Project**.
3.  Import the GitHub repository you just created.
4.  Vercel will automatically detect that this is a Vite project and configure the build settings.
5.  Before deploying, go to the **Environment Variables** section in the project settings.
6.  Add the same two variables from your `.env.local` file:
    -   `VITE_SUPABASE_URL`
    -   `VITE_SUPABASE_ANON_KEY`
7.  Click **Deploy**. Vercel will build and deploy your site. Once it's finished, you'll have a live URL for your application!

### 3. Deploy with Netlify

1.  Sign up or log in to [netlify.com](https://netlify.com).
2.  From your dashboard, click **Add new site > Import an existing project**.
3.  Connect to your Git provider and select your repository.
4.  Netlify should auto-detect the build settings. Ensure they are:
    -   **Build command**: `npm run build` or `vite build`
    -   **Publish directory**: `dist`
5.  Before deploying, go to **Site settings > Build & deploy > Environment** and add your Supabase environment variables:
    -   `VITE_SUPABASE_URL`
    -   `VITE_SUPABASE_ANON_KEY`
6.  Click **Deploy site**. Netlify will build and deploy your application.