import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import CoursesPage from './pages/CoursesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import RewardsPage from './pages/RewardsPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CommunityPage from './pages/CommunityPage';
import StudyGroupPage from './pages/StudyGroupPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-dark flex items-center justify-center">
        <h1 className="text-3xl font-press-start text-retro-cyan animate-pulse">LOADING SYSTEM...</h1>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/landing" />} />
          </>
        ) : (
          <Route 
            path="/*" 
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/study-groups/:groupId" element={<StudyGroupPage />} />
                  <Route path="/profile/:userId" element={<ProfilePage />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <AdminPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            } 
          />
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;
