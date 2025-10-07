import React, { useState } from 'react';
import AnalyticsView from '../components/admin/AnalyticsView';
import UserManagementView from '../components/admin/UserManagementView';
import EventManagementView from '../components/admin/EventManagementView';
import CourseManagementView from '../components/admin/CourseManagementView';
import RewardsManagementView from '../components/admin/RewardsManagementView';
import CommunityManagementView from '../components/admin/CommunityManagementView';

type AdminTab = 'analytics' | 'users' | 'events' | 'courses' | 'rewards' | 'community';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsView />;
      case 'users':
        return <UserManagementView />;
      case 'events':
        return <EventManagementView />;
      case 'courses':
        return <CourseManagementView />;
      case 'rewards':
        return <RewardsManagementView />;
      case 'community':
        return <CommunityManagementView />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: AdminTab; label: string }> = ({ tabName, label }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`font-press-start text-sm px-4 py-3 border-b-4 transition-all duration-200 
          ${isActive 
            ? 'border-retro-cyan text-retro-cyan shadow-[0_0_10px_#53dd6c]' 
            : 'border-transparent text-retro-white hover:bg-retro-purple'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      <h1 className="text-4xl font-press-start text-center text-retro-cyan mb-8" style={{ textShadow: '0 0 10px #53dd6c' }}>
        ADMIN CONSOLE
      </h1>
      <div className="bg-retro-blue pixel-border border-retro-purple border-4">
        <div className="flex flex-wrap justify-start items-center border-b-4 border-retro-purple bg-retro-dark">
          <TabButton tabName="analytics" label="Analytics" />
          <TabButton tabName="users" label="Users" />
          <TabButton tabName="events" label="Events" />
          <TabButton tabName="courses" label="Courses" />
          <TabButton tabName="rewards" label="Rewards" />
          <TabButton tabName="community" label="Community" />
        </div>
        <div className="p-4 md:p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;