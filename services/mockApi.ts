import { User, Badge, Event, Course, LeaderboardEntry, Profile, Reward, Redemption, AdminAnalyticsData, ProfileWithConnection, Connection, StudyGroup, StudyGroupMember, StudyGroupDetails } from '../types';
import { AVATARS } from '../constants/avatars';

// --- MOCK DATABASE ---

let badges: Badge[] = [
  { id: 1, name: 'Code Cadet', description: 'Completed your first coding challenge.', icon: '💻' },
  { id: 2, name: 'Event Explorer', description: 'Attended your first ACM event.', icon: '🎉' },
  { id: 3, name: 'Web Weaver', description: 'Finished the Frontend Development roadmap.', icon: '🌐' },
  { id: 4, name: 'Python Pioneer', description: 'Mastered the Python course.', icon: '🐍' },
  { id: 5, name: 'Git Guru', description: 'Learned the ways of version control.', icon: '🌿' },
  { id: 6, name: 'AI Apprentice', description: 'Dipped your toes into the world of AI.', icon: '🤖' },
  { id: 7, name: 'Chart Champion', description: 'Visualized data like a pro.', icon: '📊' },
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const mockAdminUser: User = {
  id: 'mock_1',
  username: 'RetroAdmin',
  email: 'admin@test.com',
  avatarUrl: AVATARS[2],
  bio: 'Just an admin in the game of code. Keeping the servers running!',
  xp: 9999,
  role: 'admin',
  badges: [badges[0], badges[1]],
  currentStreak: 10,
  lastLogin: yesterday.toISOString(),
};

const mockStudentUser: User = {
    id: 'mock_student_1',
    username: 'Newbie',
    email: 'student@test.com',
    avatarUrl: AVATARS[3],
    bio: 'Ready to learn!',
    xp: 150,
    role: 'student',
    badges: [],
    currentStreak: 1,
    lastLogin: new Date().toISOString(),
}

// Simple in-memory store for mock users.
let mockUsers: { [email: string]: { password: string, user: User } } = {
  'admin@test.com': { password: 'password', user: mockAdminUser },
  'student@test.com': { password: 'password', user: mockStudentUser }
};

const udstLocations = [
    'Dukhan Auditorium',
    'Al Wakrah Theatre',
    'Al Ruwais Theatre',
    'Building 10, Room 10.1.16',
    'Building 3 Atrium',
    'Building 16',
];

let events: Event[] = [
    {
        id: 1,
        name: 'AI for Good Hackathon',
        description: 'Build AI projects solving social challenges in Qatar. A weekend of innovation, collaboration, and coding.',
        date: '2025-11-22T09:00:00Z',
        xp_reward: 30,
        image_url: 'https://placehold.co/600x400/1a1a2e/53dd6c?text=AI+Hackathon',
        location: udstLocations[0],
        type: 'Hackathon',
    },
    {
        id: 2,
        name: 'Faith & Technology Talk',
        description: 'Explore ethics and responsibility in AI from an Islamic perspective with guest speaker Dr. Al-Khwarizmi.',
        date: '2025-12-05T18:00:00Z',
        xp_reward: 10,
        image_url: 'https://placehold.co/600x400/0f3460/dcdcdc?text=Faith+%26+Tech',
        location: udstLocations[1],
        type: 'Faith & Tech',
    },
    {
        id: 3,
        name: 'Web Dev Bootcamp 2025',
        description: 'A hands-on weekend workshop on front-end frameworks like React and Vue, plus modern UI/UX design.',
        date: '2026-01-17T10:00:00Z',
        xp_reward: 25,
        image_url: 'https://placehold.co/600x400/16213e/f0a500?text=Web+Dev',
        location: udstLocations[3],
        type: 'Workshop',
    },
    {
        id: 4,
        name: 'Ramadan Tech Challenge',
        description: 'Design and pitch solutions that can benefit the community during the holy month of Ramadan.',
        date: '2026-03-07T14:00:00Z',
        xp_reward: 20,
        image_url: 'https://placehold.co/600x400/e94560/dcdcdc?text=Ramadan+Challenge',
        location: udstLocations[4],
        type: 'Hackathon',
    },
    {
        id: 5,
        name: 'ACM x Alumni Networking Night',
        description: 'Connect with UDST graduates who are now working in top tech companies in Qatar and beyond.',
        date: '2026-02-12T19:00:00Z',
        xp_reward: 10,
        image_url: 'https://placehold.co/600x400/1a1a2e/ffffff?text=Networking',
        location: udstLocations[2],
        type: 'Talk',
    },
    {
        id: 6,
        name: 'Career Ready Workshop',
        description: 'Learn how to build a tech portfolio, write a powerful resume, and ace your technical interviews.',
        date: '2025-11-30T16:00:00Z',
        xp_reward: 15,
        image_url: 'https://placehold.co/600x400/f0a500/1a1a2e?text=Career+Prep',
        location: udstLocations[5],
        type: 'Workshop',
    },
    {
        id: 7,
        name: 'Innovation Week',
        description: 'A series of short, hands-on workshops on robotics, IoT, and creative coding. Drop in and build something new!',
        date: '2026-04-10T11:00:00Z',
        xp_reward: 25,
        image_url: 'https://placehold.co/600x400/53dd6c/1a1a2e?text=Innovation',
        location: udstLocations[5],
        type: 'Workshop',
    },
    {
        id: 8,
        name: 'Tech for Humanity Panel',
        description: 'Industry leaders discuss how technology can be harnessed for sustainability, social good, and innovation aligned with faith.',
        date: '2026-05-02T19:00:00Z',
        xp_reward: 10,
        image_url: 'https://placehold.co/600x400/16213e/dcdcdc?text=Humanity+Panel',
        location: udstLocations[0],
        type: 'Talk',
    },
    {
        id: 9,
        name: 'Game Dev Jam 2025',
        description: 'Team up and design pixel-style educational games over a weekend. All skill levels are welcome!',
        date: '2025-12-13T09:00:00Z',
        xp_reward: 30,
        image_url: 'https://placehold.co/600x400/0f3460/f0a500?text=Game+Jam',
        location: udstLocations[3],
        type: 'Hackathon',
    },
];


let courses: Course[] = [
    { id: 1, name: 'Frontend Development', description: 'Learn HTML, CSS, JavaScript, and React.', xp_reward: 1000, badge_id_reward: 3, badgeReward: badges[2], instructor: 'Dr. Ada Lovelace' },
    { id: 2, name: 'Backend with Python', description: 'Master Python, Flask, and databases.', xp_reward: 1200, badge_id_reward: 4, badgeReward: badges[3], instructor: 'Dr. Guido van Rossum' },
    { id: 3, name: 'Cybersecurity Basics', description: 'An introduction to security principles.', xp_reward: 800, badge_id_reward: null, badgeReward: null, instructor: 'Prof. Kevin Mitnick' },
    { id: 4, name: 'Intro to Python Programming', description: 'Learn Python basics and build small scripts.', xp_reward: 50, badge_id_reward: 4, badgeReward: badges[3] },
    { id: 5, name: 'Web Development Foundations', description: 'HTML, CSS, JS crash course for beginners.', xp_reward: 75, badge_id_reward: 3, badgeReward: badges[2] },
    { id: 6, name: 'AI & Machine Learning Basics', description: 'Get started with models and datasets.', xp_reward: 100, badge_id_reward: 6, badgeReward: badges[5] },
    { id: 7, name: 'Data Visualization with Python', description: 'Learn to create charts and dashboards with Matplotlib and Seaborn.', xp_reward: 75, badge_id_reward: 7, badgeReward: badges[6] },
    { id: 8, name: 'GitHub for Beginners', description: 'Learn to collaborate on code and use version control.', xp_reward: 40, badge_id_reward: 5, badgeReward: badges[4] },
];

// FIX: Added parentheses to correctly type `leaderboardData` as an array of intersection-type objects. The original syntax was misinterpreted by TypeScript due to operator precedence, causing cascading type errors.
const leaderboardData: (Omit<LeaderboardEntry, 'rank' | 'id'> & {email: string})[] = [
  { email: 'pixel@test.com', username: 'Pixel_Master', avatar_url: AVATARS[0], xp: 5200, level: 6, role: 'student' },
  { email: 'synth@test.com', username: 'SynthWave_Rider', avatar_url: AVATARS[1], xp: 4800, level: 5, role: 'student' },
  { email: 'admin@test.com', username: 'RetroAdmin', avatar_url: AVATARS[2], xp: 9999, level: 10, role: 'admin' },
  { email: 'student@test.com', username: 'Newbie', avatar_url: AVATARS[3], xp: 150, level: 1, role: 'student' },
  { email: 'data@test.com', username: 'Data_Dynamo', avatar_url: AVATARS[3], xp: 1250, level: 2, role: 'student' },
  { email: 'code@test.com', username: 'Code_Crusader', avatar_url: AVATARS[4], xp: 900, level: 1, role: 'student' },
];

// Populate mockUsers from leaderboard data if they don't exist
leaderboardData.forEach((ld, i) => {
    if(!mockUsers[ld.email]){
        const user: User = {
            id: `mock_${i + 2}`,
            username: ld.username,
            email: ld.email,
            avatarUrl: ld.avatar_url,
            bio: 'A mock user from the leaderboard.',
            xp: ld.xp,
            role: ld.role,
            badges: [],
            currentStreak: Math.floor(Math.random() * 5),
            lastLogin: new Date().toISOString(),
        }
        mockUsers[ld.email] = { password: 'password', user };
    }
});


let rewards: Reward[] = [
    { 
        id: 1, 
        name: 'Tim Hortons Voucher', 
        description: 'Redeem a free coffee coupon at Tim Hortons on campus.', 
        xp_cost: 150, 
        icon: '☕' 
    },
    { 
        id: 2, 
        name: 'Eat Cafeteria Food Voucher', 
        description: 'Enjoy a free meal from the Eat cafeteria.', 
        xp_cost: 300, 
        icon: '🍔' 
    },
    { 
        id: 3, 
        name: 'UDST T-Shirt', 
        description: 'Show your school spirit with exclusive UDST merchandise.', 
        xp_cost: 500, 
        icon: '👕' 
    },
    { 
        id: 4, 
        name: 'Hot N Cool Food Voucher', 
        description: 'Grab a refreshing drink or snack from Hot N Cool.', 
        xp_cost: 200, 
        icon: '🥤' 
    },
    { 
        id: 5, 
        name: 'UHUB Workshop Pass', 
        description: 'Unlock access to a hands-on UHUB workshop session.', 
        xp_cost: 400, 
        icon: '🎟️' 
    },
    { 
        id: 6, 
        name: 'Priority Access to UDST Events', 
        description: 'Skip the queue for upcoming university events.', 
        xp_cost: 750, 
        icon: '✨' 
    },
];

// --- MOCK COMMUNITY DATA ---
let mockConnections: Connection[] = [
    // RetroAdmin is connected to Pixel_Master
    { user_1_id: 'mock_1', user_2_id: 'mock_2', status: 'accepted', action_user_id: 'mock_1' },
    // SynthWave_Rider sent a request to RetroAdmin
    { user_1_id: 'mock_3', user_2_id: 'mock_1', status: 'pending', action_user_id: 'mock_3' },
];

let mockStudyGroups: StudyGroup[] = [
    { id: 1, name: 'INFS-1101 Study Group', description: 'Collaborate on assignments and prepare for exams for Intro to Info Systems.', icon: '📚' },
    { id: 2, name: 'INFS-1201 Study Group', description: 'Mastering the fundamentals of programming and logic together.', icon: '💻' },
    { id: 3, name: 'DACS-2101 Study Group', description: 'Diving deep into data structures and algorithms.', icon: '🧠' },
    { id: 4, name: 'Python Study Group', description: 'For all things Python, from beginner scripts to advanced projects.', icon: '🐍' },
    { id: 5, name: 'AI Study Group', description: 'Exploring machine learning, neural networks, and AI ethics.', icon: '🤖' },
];

let mockStudyGroupMembers: StudyGroupMember[] = [
    { group_id: 1, user_id: 'mock_1', status: 'member' },
    { group_id: 1, user_id: 'mock_2', status: 'member' },
    { group_id: 2, user_id: 'mock_3', status: 'member' },
    { group_id: 4, user_id: 'mock_1', status: 'member' },
    { group_id: 4, user_id: 'mock_4', status: 'member' },
    { group_id: 5, user_id: 'mock_student_1', status: 'member' },
    // Add a pending request for an admin to manage
    { group_id: 1, user_id: 'mock_student_1', status: 'pending_request' },
];


// --- MOCK PROGRESS DATA ---
// Pre-populate with some data so the user looks like they've done something.
const mockUserCompletedCourses: Map<string, Set<number>> = new Map([
    ['mock_1', new Set([1, 2])],
    ['mock_student_1', new Set()]
]);

const mockUserCompletedEvents: Map<string, Set<number>> = new Map([
    ['mock_1', new Set([1, 2, 3])],
    ['mock_student_1', new Set()]
]);
let mockAllRedemptions: Redemption[] = [];


// --- MOCK API FUNCTIONS ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export const signup = async (email: string, pass: string, username: string, role: 'student' | 'admin'): Promise<User> => {
  await delay(500);
  if (mockUsers[email]) {
    throw new Error('An account with this email already exists in demo mode.');
  }
  const newUser: User = {
    id: `mock_${Date.now()}`,
    email,
    username,
    avatarUrl: AVATARS[0],
    bio: '',
    xp: 0,
    role,
    badges: [],
    currentStreak: 1,
    lastLogin: new Date().toISOString(),
  };
  mockUsers[email] = { password: pass, user: newUser };
  localStorage.setItem('acm-user', JSON.stringify(newUser));
  return newUser;
};

export const login = async (email: string, pass: string, role: 'student' | 'admin'): Promise<User> => {
  await delay(500);
  const account = mockUsers[email];

  if (!account || account.password !== pass) {
    throw new Error('Invalid credentials');
  }

  if (account.user.role !== role) {
    throw new Error(`Access Denied: Your account does not have ${role} privileges.`);
  }

  // Simulate streak logic
  const user = account.user;
  const today = new Date();
  const lastLogin = new Date(user.lastLogin);
  
  if (!isSameDay(today, lastLogin)) {
      const yesterdayDt = new Date();
      yesterdayDt.setDate(today.getDate() - 1);
      
      if (isSameDay(yesterdayDt, lastLogin)) {
          user.currentStreak += 1; // Continue streak
      } else {
          user.currentStreak = 1; // Reset streak
      }
      user.lastLogin = today.toISOString();
  }
  
  localStorage.setItem('acm-user', JSON.stringify(user));
  return user;
};

export const logout = (): void => {
  localStorage.removeItem('acm-user');
};

export const getLoggedInUser = async (): Promise<User | null> => {
  await delay(200);
  const userJson = localStorage.getItem('acm-user');
  if (!userJson) {
    // If no one is logged in, return null. The app should show the landing page.
    return null;
  }
  const user = JSON.parse(userJson) as User;
  // Ensure our in-memory store knows about the logged-in user so other
  // parts of the mock API can see them after a page refresh.
  if (!mockUsers[user.email]) {
    mockUsers[user.email] = { password: 'password', user: user };
  }
  return user;
};

export const updateProfile = async (
    userId: string, 
    updates: { username: string; bio: string; avatarUrl: string }
): Promise<Profile> => {
    await delay(300);
    
    const targetUserAccount = Object.values(mockUsers).find(acc => acc.user.id === userId);

    if (targetUserAccount) {
        targetUserAccount.user.username = updates.username;
        targetUserAccount.user.bio = updates.bio;
        targetUserAccount.user.avatarUrl = updates.avatarUrl;

        // if updating the currently logged-in user, update local storage too
        const loggedInUser = await getLoggedInUser();
        if (loggedInUser && loggedInUser.id === userId) {
            localStorage.setItem('acm-user', JSON.stringify(targetUserAccount.user));
        }
        
        return {
            id: targetUserAccount.user.id,
            username: targetUserAccount.user.username,
            avatar_url: targetUserAccount.user.avatarUrl,
            bio: targetUserAccount.user.bio,
            xp: targetUserAccount.user.xp,
            role: targetUserAccount.user.role,
            current_streak: targetUserAccount.user.currentStreak,
            last_login: targetUserAccount.user.lastLogin,
            email: targetUserAccount.user.email,
        };
    }
    throw new Error("User not found for update");
};

export const getEvents = async (): Promise<Event[]> => {
  await delay(300);
  return events;
};

export const getCourses = async (): Promise<Course[]> => {
  await delay(300);
  return courses;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  await delay(400);
  const allUsers = Object.values(mockUsers).map(acc => acc.user);
  const sortedData = allUsers.sort((a, b) => b.xp - a.xp);
  return sortedData.map((user, index) => ({
    id: user.id,
    rank: index + 1,
    username: user.username,
    avatar_url: user.avatarUrl,
    xp: user.xp,
    level: Math.floor(user.xp / 1000) + 1,
    role: user.role,
  }));
};

// --- MOCK PROGRESS API ---
export const getUserCompletedCourseIds = async (userId: string): Promise<Set<number>> => {
    await delay(100);
    return mockUserCompletedCourses.get(userId) || new Set();
};

export const getUserCompletedEventIds = async (userId: string): Promise<Set<number>> => {
    await delay(100);
    return mockUserCompletedEvents.get(userId) || new Set();
};

export const completeEvent = async (userId: string, event: Event): Promise<boolean> => {
    await delay(200);
    const completedSet = mockUserCompletedEvents.get(userId) || new Set();
    if (completedSet.has(event.id)) {
        console.warn("Mock: Event already completed.");
        return false;
    }
    const userAcc = Object.values(mockUsers).find(acc => acc.user.id === userId);
    if (userAcc) {
        userAcc.user.xp += event.xp_reward;
        completedSet.add(event.id);
        mockUserCompletedEvents.set(userId, completedSet);
         const loggedInUser = await getLoggedInUser();
        if (loggedInUser && loggedInUser.id === userId) {
            localStorage.setItem('acm-user', JSON.stringify(userAcc.user));
        }
    }
    return true;
};

export const completeCourse = async (userId: string, course: Course): Promise<boolean> => {
    await delay(200);
    const completedSet = mockUserCompletedCourses.get(userId) || new Set();
    if (completedSet.has(course.id)) {
        console.warn("Mock: Course already completed.");
        return false;
    }
    const userAcc = Object.values(mockUsers).find(acc => acc.user.id === userId);
    if (userAcc) {
        userAcc.user.xp += course.xp_reward;
        if (course.badgeReward && !userAcc.user.badges.some(b => b.id === course.badgeReward!.id)) {
            userAcc.user.badges.push(course.badgeReward);
        }
        completedSet.add(course.id);
        mockUserCompletedCourses.set(userId, completedSet);
        const loggedInUser = await getLoggedInUser();
        if (loggedInUser && loggedInUser.id === userId) {
            localStorage.setItem('acm-user', JSON.stringify(userAcc.user));
        }
    }
    return true;
};

// --- MOCK REWARDS API ---

export const getRewards = async (): Promise<Reward[]> => {
    await delay(300);
    return rewards;
};

export const getUserRedemptions = async (userId: string): Promise<Redemption[]> => {
    await delay(200);
    return mockAllRedemptions.filter(r => r.user?.id === userId);
};

export const redeemReward = async (userId: string, rewardId: number): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const userAcc = Object.values(mockUsers).find(acc => acc.user.id === userId);
    const reward = rewards.find(r => r.id === rewardId);

    if (!userAcc || !reward) {
        return { success: false, message: 'User or reward not found.' };
    }
    const user = userAcc.user;

    if (user.xp < reward.xp_cost) {
        return { success: false, message: 'Insufficient XP.' };
    }

    user.xp -= reward.xp_cost;
    const newRedemption: Redemption = {
        id: Date.now(),
        redeemed_at: new Date().toISOString(),
        status: 'Pending',
        reward: {
            name: reward.name,
            icon: reward.icon,
            xp_cost: reward.xp_cost,
        },
        user: { id: user.id, username: user.username }
    };
    mockAllRedemptions.unshift(newRedemption); // Add to beginning of array
    const loggedInUser = await getLoggedInUser();
    if (loggedInUser && loggedInUser.id === userId) {
        localStorage.setItem('acm-user', JSON.stringify(user));
    }
    
    return { success: true, message: 'Reward redeemed successfully!' };
};

// --- MOCK ADMIN API ---

export const getAllUsers = async (): Promise<Profile[]> => {
    await delay(400);
    return Object.values(mockUsers).map(acc => ({
        id: acc.user.id,
        username: acc.user.username,
        avatar_url: acc.user.avatarUrl,
        bio: acc.user.bio,
        xp: acc.user.xp,
        role: acc.user.role,
        current_streak: acc.user.currentStreak,
        last_login: acc.user.lastLogin,
        email: acc.user.email,
    }));
};

export const createUser = async (userData: any): Promise<Profile> => {
    await delay(500);
    if (mockUsers[userData.email]) {
        throw new Error("User with this email already exists.");
    }
    const newUser: User = {
        id: `mock_${Date.now()}`,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        avatarUrl: AVATARS[0],
        bio: '',
        xp: 0,
        badges: [],
        currentStreak: 0,
        lastLogin: new Date().toISOString(),
    };
    mockUsers[userData.email] = { password: userData.password, user: newUser };
    return {
        id: newUser.id,
        username: newUser.username,
        avatar_url: newUser.avatarUrl,
        bio: newUser.bio,
        xp: newUser.xp,
        role: newUser.role,
        current_streak: newUser.currentStreak,
        last_login: newUser.lastLogin,
        email: newUser.email,
    };
};

export const updateUserRole = async (userId: string, role: 'student' | 'admin'): Promise<boolean> => {
    await delay(300);
    const userAcc = Object.values(mockUsers).find(acc => acc.user.id === userId);
    if(userAcc) {
        userAcc.user.role = role;
        return true;
    }
    return false;
}

export const deleteUser = async (userId: string): Promise<boolean> => {
    await delay(500);
    const userAcc = Object.values(mockUsers).find(acc => acc.user.id === userId);
    if (userAcc) {
        delete mockUsers[userAcc.user.email];
        return true;
    }
    return false;
}

export const getAdminAnalytics = async (): Promise<AdminAnalyticsData> => {
    await delay(500);
    return {
        users: Object.keys(mockUsers).length,
        admins: Object.values(mockUsers).filter(u => u.user.role === 'admin').length,
        events: events.length,
        courses: courses.length,
        redemptions: mockAllRedemptions.length,
    }
}

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
    await delay(300);
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const newEvent = { ...event, id: newId };
    events.push(newEvent);
    return newEvent;
}
export const updateEvent = async (eventId: number, updates: Partial<Event>): Promise<Event> => {
    await delay(300);
    let eventToUpdate = events.find(e => e.id === eventId);
    if(eventToUpdate) {
        eventToUpdate = Object.assign(eventToUpdate, updates);
        return eventToUpdate;
    }
    throw new Error("Event not found");
}
export const deleteEvent = async (eventId: number): Promise<boolean> => {
    await delay(300);
    const index = events.findIndex(e => e.id === eventId);
    if(index > -1) {
        events.splice(index, 1);
        return true;
    }
    return false;
}

export const createCourse = async (course: Omit<Course, 'id' | 'badgeReward'>): Promise<Course> => {
    await delay(300);
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    const newCourse = { ...course, id: newId, badgeReward: null };
    courses.push(newCourse);
    return newCourse;
}
export const updateCourse = async (courseId: number, updates: Partial<Course>): Promise<Course> => {
    await delay(300);
    let courseToUpdate = courses.find(e => e.id === courseId);
    if(courseToUpdate) {
        courseToUpdate = Object.assign(courseToUpdate, updates);
        return courseToUpdate;
    }
    throw new Error("Course not found");
}
export const deleteCourse = async (courseId: number): Promise<boolean> => {
    await delay(300);
    const index = courses.findIndex(e => e.id === courseId);
    if(index > -1) {
        courses.splice(index, 1);
        return true;
    }
    return false;
}

export const createReward = async (reward: Omit<Reward, 'id'>): Promise<Reward> => {
    await delay(300);
    const newId = rewards.length > 0 ? Math.max(...rewards.map(r => r.id)) + 1 : 1;
    const newReward = { ...reward, id: newId };
    rewards.push(newReward);
    return newReward;
}
export const updateReward = async (rewardId: number, updates: Partial<Reward>): Promise<Reward> => {
    await delay(300);
    let rewardToUpdate = rewards.find(r => r.id === rewardId);
    if(rewardToUpdate) {
        rewardToUpdate = Object.assign(rewardToUpdate, updates);
        return rewardToUpdate;
    }
    throw new Error("Reward not found");
}
export const deleteReward = async (rewardId: number): Promise<boolean> => {
    await delay(300);
    const index = rewards.findIndex(r => r.id === rewardId);
    if(index > -1) {
        rewards.splice(index, 1);
        return true;
    }
    return false;
}

export const getAllRedemptions = async (): Promise<Redemption[]> => {
    await delay(300);
    return mockAllRedemptions;
}

export const updateRedemptionStatus = async (redemptionId: number, status: 'Pending' | 'Completed'): Promise<boolean> => {
    await delay(300);
    const redemption = mockAllRedemptions.find(r => r.id === redemptionId);
    if (redemption) {
        redemption.status = status;
        return true;
    }
    return false;
}

export const getCourseEnrollments = async(courseId: number): Promise<string[]> => {
    await delay(200);
    const userIds: string[] = [];
    mockUserCompletedCourses.forEach((courseSet, userId) => {
        if(courseSet.has(courseId)) {
            userIds.push(userId);
        }
    });
    return userIds;
}

export const updateCourseEnrollment = async(courseId: number, userId: string, isEnrolled: boolean): Promise<boolean> => {
    await delay(200);
    const completedSet = mockUserCompletedCourses.get(userId) || new Set();
    if(isEnrolled) {
        completedSet.add(courseId);
    } else {
        completedSet.delete(courseId);
    }
    mockUserCompletedCourses.set(userId, completedSet);
    return true;
}

// --- MOCK COMMUNITY API ---
export const getUsersWithConnectionStatus = async (currentUserId: string): Promise<ProfileWithConnection[]> => {
    await delay(400);
    const allProfiles = await getAllUsers();

    return allProfiles
        .filter(p => p.id !== currentUserId)
        .map(profile => {
            const connection = mockConnections.find(c =>
                (c.user_1_id === currentUserId && c.user_2_id === profile.id) ||
                (c.user_1_id === profile.id && c.user_2_id === currentUserId)
            );

            let status: ProfileWithConnection['connectionStatus'] = 'not_connected';
            let actionUserId: string | undefined = undefined;

            if (connection) {
                if (connection.status === 'accepted') {
                    status = 'connected';
                } else if (connection.status === 'pending') {
                    if (connection.action_user_id === currentUserId) {
                        status = 'pending_sent';
                    } else {
                        status = 'pending_received';
                        actionUserId = connection.action_user_id;
                    }
                }
            }

            return { ...profile, connectionStatus: status, actionUserId };
        });
};

export const sendConnectionRequest = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    await delay(300);
    mockConnections.push({
        user_1_id: currentUserId,
        user_2_id: targetUserId,
        status: 'pending',
        action_user_id: currentUserId,
    });
    return true;
};

export const acceptConnectionRequest = async (currentUserId: string, requestingUserId: string): Promise<boolean> => {
    await delay(300);
    const request = mockConnections.find(c =>
        c.status === 'pending' &&
        ((c.user_1_id === currentUserId && c.user_2_id === requestingUserId) ||
         (c.user_1_id === requestingUserId && c.user_2_id === currentUserId))
    );
    if (request) {
        request.status = 'accepted';
        request.action_user_id = currentUserId;
        return true;
    }
    return false;
};

export const getStudyGroups = async (): Promise<StudyGroup[]> => {
    await delay(300);
    return mockStudyGroups;
};

export const requestToJoinStudyGroup = async (groupId: number, userId: string): Promise<boolean> => {
    await delay(300);
    const existing = mockStudyGroupMembers.find(m => m.group_id === groupId && m.user_id === userId);
    if (existing) {
        console.warn(`User ${userId} is already a member or has a pending request for group ${groupId}.`);
        // Return true to give positive feedback, as the desired state is achieved
        return true;
    }
    mockStudyGroupMembers.push({ group_id: groupId, user_id: userId, status: 'pending_request' });
    return true;
}

export const getStudyGroupDetails = async (groupId: number): Promise<StudyGroupDetails | null> => {
    await delay(400);
    const group = mockStudyGroups.find(g => g.id === groupId);
    if (!group) return null;

    const memberIds = mockStudyGroupMembers
        .filter(m => m.group_id === groupId && m.status === 'member')
        .map(m => m.user_id);
    const allUsers = Object.values(mockUsers).map(acc => acc.user);
    const members = allUsers.filter(u => memberIds.includes(u.id)).map(user => ({
         id: user.id,
        username: user.username,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        xp: user.xp,
        role: user.role,
        current_streak: user.currentStreak,
        last_login: user.lastLogin,
        email: user.email,
    }));

    return { ...group, members };
};

// --- ADMIN COMMUNITY API ---
export const createStudyGroup = async (groupData: Omit<StudyGroup, 'id'>): Promise<StudyGroup> => {
    await delay(300);
    const newId = mockStudyGroups.length > 0 ? Math.max(...mockStudyGroups.map(g => g.id)) + 1 : 1;
    const newGroup = { ...groupData, id: newId };
    mockStudyGroups.push(newGroup);
    return newGroup;
}
export const updateStudyGroup = async (groupId: number, updates: Partial<StudyGroup>): Promise<StudyGroup> => {
    await delay(300);
    let groupToUpdate = mockStudyGroups.find(g => g.id === groupId);
    if(groupToUpdate) {
        groupToUpdate = Object.assign(groupToUpdate, updates);
        return groupToUpdate;
    }
    throw new Error("Study group not found");
}
export const deleteStudyGroup = async (groupId: number): Promise<boolean> => {
    await delay(300);
    const index = mockStudyGroups.findIndex(g => g.id === groupId);
    if(index > -1) {
        mockStudyGroups.splice(index, 1);
        // Also remove all members of that group
        mockStudyGroupMembers = mockStudyGroupMembers.filter(m => m.group_id !== groupId);
        return true;
    }
    return false;
}

export const getStudyGroupMembers = async (groupId: number): Promise<StudyGroupMember[]> => {
    await delay(200);
    return mockStudyGroupMembers.filter(m => m.group_id === groupId);
}

export const addStudyGroupMember = async (groupId: number, userId: string): Promise<boolean> => {
    await delay(200);
    const exists = mockStudyGroupMembers.some(m => m.group_id === groupId && m.user_id === userId);
    if(exists) {
        // If pending, approve it. Otherwise, do nothing.
        const member = mockStudyGroupMembers.find(m => m.group_id === groupId && m.user_id === userId);
        if (member && member.status === 'pending_request') {
            member.status = 'member';
        }
    } else {
        mockStudyGroupMembers.push({ group_id: groupId, user_id: userId, status: 'member' });
    }
    return true;
}

export const removeStudyGroupMember = async (groupId: number, userId: string): Promise<boolean> => {
    await delay(200);
    const initialLength = mockStudyGroupMembers.length;
    mockStudyGroupMembers = mockStudyGroupMembers.filter(m => !(m.group_id === groupId && m.user_id === userId));
    return mockStudyGroupMembers.length < initialLength;
}

export const approveStudyGroupJoinRequest = async (groupId: number, userId: string): Promise<boolean> => {
    await delay(200);
    const request = mockStudyGroupMembers.find(m => m.group_id === groupId && m.user_id === userId && m.status === 'pending_request');
    if (request) {
        request.status = 'member';
        return true;
    }
    return false;
}

export const getAllPendingConnections = async (): Promise<Connection[]> => {
    await delay(300);
    return mockConnections.filter(c => c.status === 'pending');
}

export const adminRejectConnection = async (user1Id: string, user2Id: string): Promise<boolean> => {
    await delay(300);
    const initialLength = mockConnections.length;
    mockConnections = mockConnections.filter(c => 
        !((c.user_1_id === user1Id && c.user_2_id === user2Id) || (c.user_1_id === user2Id && c.user_2_id === user1Id))
    );
    return mockConnections.length < initialLength;
}

export const adminApproveConnection = async (user1Id: string, user2Id: string): Promise<boolean> => {
    await delay(300);
    const conn = mockConnections.find(c => 
        ((c.user_1_id === user1Id && c.user_2_id === user2Id) || (c.user_1_id === user2Id && c.user_2_id === user1Id))
    );
    if (conn) {
        conn.status = 'accepted';
        return true;
    }
    return false;
}