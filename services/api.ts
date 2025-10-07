import { supabase, isMockMode } from './supabaseClient';
import * as mockApi from './mockApi';
import { Profile, Event, Course, LeaderboardEntry, Badge, Reward, Redemption, AdminAnalyticsData, ProfileWithConnection, StudyGroup, StudyGroupDetails, StudyGroupMember, Connection } from '../types';

// --- PROFILE & USER DATA ---

export const getProfile = async (userId: string): Promise<Profile | null> => {
  if (isMockMode) {
    const allMockUsers = await mockApi.getAllUsers();
    const userProfile = allMockUsers.find(p => p.id === userId);
    return userProfile || null;
  }
  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (
    userId: string,
    updates: { username: string; bio: string; avatar_url: string }
): Promise<Profile | null> => {
    if (isMockMode) {
        return mockApi.updateProfile(userId, { ...updates, avatarUrl: updates.avatar_url });
    }
    const { data, error } = await supabase!
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating profile:", error);
        return null;
    }
    return data;
}

export const updateLoginStreak = async (
    userId: string,
    updates: { current_streak: number; last_login: string }
): Promise<Profile | null> => {
    if (isMockMode) {
        // In mock mode, this logic is handled directly in mockApi.login
        const user = await mockApi.getLoggedInUser();
        if (user) {
            return {
                id: user.id, username: user.username, avatar_url: user.avatarUrl, bio: user.bio,
                xp: user.xp, role: user.role, current_streak: user.currentStreak, last_login: user.lastLogin, email: user.email
            };
        }
        return null;
    }
    const { data, error } = await supabase!
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error("Error updating login streak:", error);
        return null;
    }
    return data;
};


export const getUserBadges = async (userId: string): Promise<Badge[]> => {
    if (isMockMode) {
        const user = await mockApi.getLoggedInUser();
        if(user?.id === userId) return user.badges;
        const allUsers = await mockApi.getAllUsers();
        const targetUser = allUsers.find(u => u.id === userId);
        // This is a simplification for mock mode
        return targetUser ? [] : [];
    }
    const { data, error } = await supabase!
        .from('user_badges')
        .select(`
            badges (
                id,
                name,
                description,
                icon
            )
        `)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user badges:', error);
        return [];
    }
    return data.flatMap(item => item.badges || []) as Badge[];
};


// --- GAME DATA ---

export const getEvents = async (): Promise<Event[]> => {
  if (isMockMode) return mockApi.getEvents();
  const { data, error } = await supabase!.from('events').select('*').order('date', { ascending: true });
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data;
};

export const getCourses = async (): Promise<Course[]> => {
  if (isMockMode) return mockApi.getCourses();
  const { data, error } = await supabase!
    .from('courses')
    .select(`
        *,
        badge:badges (
            id,
            name,
            description,
            icon
        )
    `);

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
  
  return data.map(course => ({
    ...course,
    badgeReward: course.badge
  }));
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (isMockMode) return mockApi.getLeaderboard();
  const { data, error } = await supabase!
    .from('profiles')
    .select('id, username, avatar_url, xp, role')
    .order('xp', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data.map((entry, index) => ({
    id: entry.id,
    rank: index + 1,
    username: entry.username,
    avatar_url: entry.avatar_url,
    xp: entry.xp,
    level: Math.floor(entry.xp / 1000) + 1,
    role: entry.role,
  }));
};


// --- USER PROGRESS ACTIONS ---

export const getUserCompletedCourseIds = async (userId: string): Promise<Set<number>> => {
    if (isMockMode) return mockApi.getUserCompletedCourseIds(userId);
    const { data, error } = await supabase!
        .from('user_courses')
        .select('course_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching user's completed courses:", error);
        return new Set();
    }
    return new Set(data.map(item => item.course_id));
};

export const getUserCompletedEventIds = async (userId: string): Promise<Set<number>> => {
    if (isMockMode) return mockApi.getUserCompletedEventIds(userId);
    const { data, error } = await supabase!
        .from('user_events')
        .select('event_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching user's attended events:", error);
        return new Set();
    }
    return new Set(data.map(item => item.event_id));
};

export const completeEvent = async (userId: string, event: Event): Promise<boolean> => {
    if (isMockMode) return mockApi.completeEvent(userId, event);
    
    const { error: insertError } = await supabase!
        .from('user_events')
        .insert({ user_id: userId, event_id: event.id });
    
    // 409 conflict code means the user has already participated, which is not a hard error for us.
    // We just won't award XP again.
    if (insertError && insertError.code !== '23505') { // 23505 is unique_violation
        console.warn('Could not record event completion:', insertError.message);
        return false;
    }
    // If it's a unique violation, the user already participated. Don't award XP again.
    if (insertError?.code === '23505') {
        console.log("User has already participated in this event.");
        return false;
    }

    const { error: rpcError } = await supabase!.rpc('increment_user_xp', {
        user_id_input: userId,
        xp_to_add: event.xp_reward,
    });

    if (rpcError) {
        console.error('Error incrementing user XP:', rpcError);
        return false;
    }

    return true;
};

export const completeCourse = async (userId: string, course: Course): Promise<boolean> => {
    if (isMockMode) return mockApi.completeCourse(userId, course);
    
     const { error: insertError } = await supabase!
        .from('user_courses')
        .insert({ user_id: userId, course_id: course.id });

     if (insertError && insertError.code !== '23505') {
        console.warn('Could not record course completion:', insertError.message);
        return false;
     }

     if (insertError?.code === '23505') {
        console.log("User has already completed this course.");
        return false;
     }
    
     const { error: rpcError } = await supabase!.rpc('increment_user_xp', {
        user_id_input: userId,
        xp_to_add: course.xp_reward,
    });
    if (rpcError) {
        console.error('Error incrementing user XP:', rpcError);
        return false;
    }

    if (course.badge_id_reward) {
        const { error: badgeError } = await supabase!
            .from('user_badges')
            .insert({ user_id: userId, badge_id: course.badge_id_reward });

        if (badgeError && badgeError.code !== '23505') {
             console.error('Error awarding badge:', badgeError);
        }
    }
    
    return true;
}

// --- REWARDS SYSTEM ---

export const getRewards = async (): Promise<Reward[]> => {
    if (isMockMode) return mockApi.getRewards();
    const { data, error } = await supabase!.from('rewards').select('*').order('xp_cost', { ascending: true });
    if (error) {
        console.error('Error fetching rewards:', error);
        return [];
    }
    return data;
};

export const getUserRedemptions = async (userId: string): Promise<Redemption[]> => {
    if (isMockMode) return mockApi.getUserRedemptions(userId);
    const { data, error } = await supabase!
        .from('user_redemptions')
        .select(`
            id,
            redeemed_at,
            status,
            reward:rewards (
                name,
                icon,
                xp_cost
            )
        `)
        .eq('user_id', userId)
        .order('redeemed_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching user redemptions:', error);
        return [];
    }
    // The type from Supabase might be slightly different, so we cast it to ensure compatibility.
    return data as Redemption[];
};

export const redeemReward = async (userId: string, rewardId: number): Promise<{ success: boolean; message: string }> => {
    if (isMockMode) return mockApi.redeemReward(userId, rewardId);

    const { data, error } = await supabase!.rpc('redeem_reward', {
        user_id_input: userId,
        reward_id_input: rewardId
    });

    if (error) {
        console.error("Error calling redeem_reward RPC:", error);
        return { success: false, message: 'An error occurred during redemption.' };
    }

    return data;
}

// --- ADMIN API ---

export const getAdminAnalytics = async (): Promise<AdminAnalyticsData | null> => {
    if(isMockMode) return mockApi.getAdminAnalytics();
    const { data, error } = await supabase!.rpc('get_admin_analytics');
    if(error) {
        console.error("Error fetching admin analytics:", error);
        return null;
    }
    return data;
}

export const getAllUsers = async (): Promise<Profile[]> => {
    if(isMockMode) return mockApi.getAllUsers();
    const { data, error } = await supabase!
        .from('profiles')
        .select('*');
    if(error) {
        console.error("Error fetching all users:", error);
        return [];
    }
    return data;
}

export const createUser = async (userData: any): Promise<Profile | null> => {
    if (isMockMode) return mockApi.createUser(userData);
    // SECURITY NOTE: Creating users with email/password from an admin context
    // requires a secure server-side environment (like a Supabase Edge Function)
    // using the Supabase Admin client. This is not safe to do from the browser.
    // This function is for mock mode only.
    alert("User creation is only available in demo mode for security reasons. A secure backend function is required for this feature.");
    throw new Error("User creation requires a secure backend function.");
}


export const updateUserRole = async (userId: string, role: 'student' | 'admin'): Promise<boolean> => {
    if(isMockMode) return mockApi.updateUserRole(userId, role);
    const { error } = await supabase!.rpc('update_user_role', { target_user_id: userId, new_role: role });
    if(error) {
        console.error("Error updating user role:", error);
        return false;
    }
    return true;
}

export const deleteUser = async (userId: string): Promise<boolean> => {
    if(isMockMode) return mockApi.deleteUser(userId);
    const { error } = await supabase!.rpc('delete_user_by_admin', { target_user_id: userId });
     if(error) {
        console.error("Error deleting user:", error);
        return false;
    }
    return true;
}

export const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event | null> => {
    if (isMockMode) return mockApi.createEvent(eventData);
    const { data, error } = await supabase!.from('events').insert(eventData).select().single();
    if(error) {
        console.error("Error creating event:", error);
        return null;
    }
    return data;
}

export const updateEvent = async (eventId: number, eventData: Partial<Event>): Promise<Event | null> => {
    if (isMockMode) return mockApi.updateEvent(eventId, eventData);
    const { data, error } = await supabase!.from('events').update(eventData).eq('id', eventId).select().single();
    if(error) {
        console.error("Error updating event:", error);
        return null;
    }
    return data;
}

export const deleteEvent = async (eventId: number): Promise<boolean> => {
    if(isMockMode) return mockApi.deleteEvent(eventId);
    const { error } = await supabase!.from('events').delete().eq('id', eventId);
    if(error) {
        console.error("Error deleting event:", error);
        return false;
    }
    return true;
}

export const createCourse = async (courseData: Omit<Course, 'id' | 'badgeReward'>): Promise<Course | null> => {
    if (isMockMode) return mockApi.createCourse(courseData);
    const { data, error } = await supabase!.from('courses').insert(courseData).select().single();
    if(error) {
        console.error("Error creating course:", error);
        return null;
    }
    return data;
}

export const updateCourse = async (courseId: number, courseData: Partial<Course>): Promise<Course | null> => {
    if (isMockMode) return mockApi.updateCourse(courseId, courseData);
    const { data, error } = await supabase!.from('courses').update(courseData).eq('id', courseId).select().single();
    if(error) {
        console.error("Error updating course:", error);
        return null;
    }
    return data;
}

export const deleteCourse = async (courseId: number): Promise<boolean> => {
    if(isMockMode) return mockApi.deleteCourse(courseId);
    const { error } = await supabase!.from('courses').delete().eq('id', courseId);
    if(error) {
        console.error("Error deleting course:", error);
        return false;
    }
    return true;
}

export const createReward = async (rewardData: Omit<Reward, 'id'>): Promise<Reward | null> => {
    if (isMockMode) return mockApi.createReward(rewardData);
    const { data, error } = await supabase!.from('rewards').insert(rewardData).select().single();
    if(error) {
        console.error("Error creating reward:", error);
        return null;
    }
    return data;
}

export const updateReward = async (rewardId: number, rewardData: Partial<Reward>): Promise<Reward | null> => {
    if (isMockMode) return mockApi.updateReward(rewardId, rewardData);
    const { data, error } = await supabase!.from('rewards').update(rewardData).eq('id', rewardId).select().single();
    if(error) {
        console.error("Error updating reward:", error);
        return null;
    }
    return data;
}

export const deleteReward = async (rewardId: number): Promise<boolean> => {
    if(isMockMode) return mockApi.deleteReward(rewardId);
    const { error } = await supabase!.from('rewards').delete().eq('id', rewardId);
    if(error) {
        console.error("Error deleting reward:", error);
        return false;
    }
    return true;
}

export const getAllRedemptions = async (): Promise<Redemption[]> => {
    if (isMockMode) return mockApi.getAllRedemptions();
    const { data, error } = await supabase!
        .from('user_redemptions')
        .select(`*, user:profiles(id, username), reward:rewards(name, icon, xp_cost)`)
        .order('redeemed_at', { ascending: false });
    if(error) {
        console.error("Error fetching all redemptions:", error);
        return [];
    }
    return data as Redemption[];
}

export const updateRedemptionStatus = async (redemptionId: number, status: 'Pending' | 'Completed'): Promise<boolean> => {
    if (isMockMode) return mockApi.updateRedemptionStatus(redemptionId, status);
    const { error } = await supabase!.rpc('update_redemption_status', {
        redemption_id_input: redemptionId,
        new_status: status
    });
    if(error) {
        console.error("Error updating redemption status:", error);
        return false;
    }
    return true;
}

export const getCourseEnrollments = async (courseId: number): Promise<string[]> => {
    if (isMockMode) return mockApi.getCourseEnrollments(courseId);
    const { data, error } = await supabase!.from('user_courses').select('user_id').eq('course_id', courseId);
    if(error) {
        console.error("Error fetching course enrollments:", error);
        return [];
    }
    return data.map(e => e.user_id);
}

export const updateCourseEnrollment = async (courseId: number, userId: string, enroll: boolean): Promise<boolean> => {
    if (isMockMode) return mockApi.updateCourseEnrollment(courseId, userId, enroll);
    const rpcName = enroll ? 'enroll_user_in_course' : 'unenroll_user_from_course';
    const { error } = await supabase!.rpc(rpcName, {
        course_id_input: courseId,
        user_id_input: userId
    });
    if(error) {
        console.error(`Error calling ${rpcName}:`, error);
        return false;
    }
    return true;
}

// --- COMMUNITY API ---
export const getUsersWithConnectionStatus = async (currentUserId: string): Promise<ProfileWithConnection[]> => {
    if (isMockMode) return mockApi.getUsersWithConnectionStatus(currentUserId);
    
    // This would ideally be a single RPC call in production for performance
    const { data: profiles, error: profileError } = await supabase!.from('profiles').select('*').neq('id', currentUserId);
    if (profileError) return [];
    
    const { data: connections, error: connError } = await supabase!.from('connections').select('*').or(`user_1_id.eq.${currentUserId},user_2_id.eq.${currentUserId}`);
    if (connError) return [];

    return profiles.map(p => {
        const connection = connections.find(c => (c.user_1_id === p.id || c.user_2_id === p.id));
        let connectionStatus: ProfileWithConnection['connectionStatus'] = 'not_connected';
        let actionUserId: string | undefined;

        if (connection) {
            if (connection.status === 'accepted') {
                connectionStatus = 'connected';
            } else {
                connectionStatus = connection.action_user_id === currentUserId ? 'pending_sent' : 'pending_received';
                if(connectionStatus === 'pending_received') {
                    actionUserId = connection.action_user_id;
                }
            }
        }
        return { ...p, connectionStatus, actionUserId };
    });
};

export const sendConnectionRequest = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    if (isMockMode) return mockApi.sendConnectionRequest(currentUserId, targetUserId);
    const { error } = await supabase!.from('connections').insert({
        user_1_id: currentUserId,
        user_2_id: targetUserId,
        status: 'pending',
        action_user_id: currentUserId,
    });
    if (error) console.error("Error sending connection request:", error);
    return !error;
};

export const acceptConnectionRequest = async (currentUserId: string, requestingUserId: string): Promise<boolean> => {
    if (isMockMode) return mockApi.acceptConnectionRequest(currentUserId, requestingUserId);
    const { error } = await supabase!.from('connections')
        .update({ status: 'accepted', action_user_id: currentUserId })
        .eq('user_1_id', requestingUserId)
        .eq('user_2_id', currentUserId);
    if (error) console.error("Error accepting connection request:", error);
    return !error;
};

export const getStudyGroups = async (): Promise<StudyGroup[]> => {
    if (isMockMode) return mockApi.getStudyGroups();
    const { data, error } = await supabase!.from('study_groups').select('*');
    if (error) {
        console.error("Error fetching study groups:", error);
        return [];
    }
    return data;
};

export const getStudyGroupDetails = async (groupId: number): Promise<StudyGroupDetails | null> => {
    if (isMockMode) return mockApi.getStudyGroupDetails(groupId) as Promise<StudyGroupDetails | null>;
    const { data, error } = await supabase!.from('study_groups').select('*, members:study_group_members(profile:profiles(*))').eq('id', groupId).single();
    if (error) {
        console.error("Error fetching study group details:", error);
        return null;
    }
    // Type-safe mapping of members
    const members = data.members
        .map((m: { profile: Profile | null }) => m.profile)
        .filter((p): p is Profile => p !== null);
        
    return { ...data, members };
};

export const requestToJoinStudyGroup = async (groupId: number, userId: string): Promise<boolean> => {
    if (isMockMode) return mockApi.requestToJoinStudyGroup(groupId, userId);
    
    const { error } = await supabase!.from('study_group_members').insert({
        group_id: groupId,
        user_id: userId,
        status: 'pending_request'
    }, { onConflict: 'group_id, user_id' }); // Prevent duplicate requests
    
    if (error) {
        console.error('Error sending join request:', error);
        return false;
    }
    return true;
};

// --- ADMIN COMMUNITY API ---
export const createStudyGroup = async (groupData: Omit<StudyGroup, 'id'>): Promise<StudyGroup | null> => {
    if (isMockMode) return mockApi.createStudyGroup(groupData);
    const { data, error } = await supabase!.from('study_groups').insert(groupData).select().single();
    if(error) return null;
    return data;
}
export const updateStudyGroup = async (groupId: number, updates: Partial<StudyGroup>): Promise<StudyGroup | null> => {
    if (isMockMode) return mockApi.updateStudyGroup(groupId, updates);
    const { data, error } = await supabase!.from('study_groups').update(updates).eq('id', groupId).select().single();
    if(error) return null;
    return data;
}
export const deleteStudyGroup = async (groupId: number): Promise<boolean> => {
    if (isMockMode) return mockApi.deleteStudyGroup(groupId);
    const { error } = await supabase!.from('study_groups').delete().eq('id', groupId);
    return !error;
}
export const getStudyGroupMembers = async (groupId: number): Promise<StudyGroupMember[]> => {
    if(isMockMode) return mockApi.getStudyGroupMembers(groupId);
    const { data, error } = await supabase!.from('study_group_members').select('*').eq('group_id', groupId);
    if(error) return [];
    return data;
}
export const addStudyGroupMember = async (groupId: number, userId: string): Promise<boolean> => {
    if(isMockMode) return mockApi.addStudyGroupMember(groupId, userId);
    const { error } = await supabase!.from('study_group_members').upsert({ group_id: groupId, user_id: userId, status: 'member' }, { onConflict: 'group_id, user_id' });
    return !error;
}
export const removeStudyGroupMember = async (groupId: number, userId: string): Promise<boolean> => {
    if(isMockMode) return mockApi.removeStudyGroupMember(groupId, userId);
    const { error } = await supabase!.from('study_group_members').delete().match({ group_id: groupId, user_id: userId });
    return !error;
}
export const approveStudyGroupJoinRequest = async (groupId: number, userId: string): Promise<boolean> => {
    if(isMockMode) return mockApi.approveStudyGroupJoinRequest(groupId, userId);
    const { error } = await supabase!.from('study_group_members').update({ status: 'member' }).match({ group_id: groupId, user_id: userId, status: 'pending_request' });
    return !error;
}
export const getAllPendingConnections = async (): Promise<Connection[]> => {
    if (isMockMode) return mockApi.getAllPendingConnections();
    const { data, error } = await supabase!.from('connections').select('*').eq('status', 'pending');
    if(error) return [];
    return data;
}
export const adminApproveConnection = async (user1Id: string, user2Id: string): Promise<boolean> => {
    if(isMockMode) return mockApi.adminApproveConnection(user1Id, user2Id);
    const { error } = await supabase!.from('connections').update({ status: 'accepted' }).or(`(user_1_id.eq.${user1Id},user_2_id.eq.${user2Id}),(user_1_id.eq.${user2Id},user_2_id.eq.${user1Id})`);
    return !error;
}
export const adminRejectConnection = async (user1Id: string, user2Id: string): Promise<boolean> => {
    if(isMockMode) return mockApi.adminRejectConnection(user1Id, user2Id);
    const { error } = await supabase!.from('connections').delete().or(`(user_1_id.eq.${user1Id},user_2_id.eq.${user2Id}),(user_1_id.eq.${user2Id},user_2_id.eq.${user1Id})`);
    return !error;
}