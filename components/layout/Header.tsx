import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { logout, user } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-lg font-vt323 transition-colors duration-200 hover:bg-retro-pink hover:text-retro-dark ${
      isActive ? 'bg-retro-pink text-retro-dark' : 'text-retro-white'
    }`;
  
  const adminNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-lg font-vt323 transition-colors duration-200 hover:bg-retro-cyan hover:text-retro-dark ${
      isActive ? 'bg-retro-cyan text-retro-dark' : 'text-retro-white'
    }`;

  return (
    <header className="bg-retro-blue pixel-border border-retro-pink border-4 mb-8">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-press-start text-retro-cyan animate-sparkle">
          <NavLink to="/dashboard">ACM-UDST</NavLink>
        </h1>
        <nav className="hidden md:flex items-center space-x-2 bg-retro-purple p-1 pixel-border border-black">
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/events" className={navLinkClass}>Events</NavLink>
          <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
          <NavLink to="/community" className={navLinkClass}>Community</NavLink>
          <NavLink to="/rewards" className={navLinkClass}>Rewards</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={adminNavLinkClass}>Admin</NavLink>
          )}
        </nav>
        <div className="flex items-center">
          {user && (
            <NavLink to={`/profile/${user.id}`} className="flex items-center mr-4 transition-transform hover:scale-105">
              <img src={user.avatarUrl} alt="user avatar" className="w-10 h-10 border-2 border-retro-cyan bg-retro-dark" />
              <div className="ml-3 hidden sm:flex flex-col items-start">
                  <span className="text-retro-white -mb-1">{user.username}</span>
                  {user.role === 'admin' && <span className="text-xs font-press-start text-retro-cyan">[ADMIN]</span>}
              </div>
              <span className="text-retro-yellow ml-3 hidden sm:inline">LVL {Math.floor(user.xp / 1000) + 1}</span>
            </NavLink>
          )}
           <Button onClick={logout} variant="danger">Logout</Button>
        </div>
      </div>
       <nav className="md:hidden flex flex-wrap justify-around items-center bg-retro-purple p-1 mt-2 border-t-4 border-retro-pink">
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/events" className={navLinkClass}>Events</NavLink>
          <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
          <NavLink to="/community" className={navLinkClass}>Community</NavLink>
          <NavLink to="/rewards" className={navLinkClass}>Rewards</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={adminNavLinkClass}>Admin</NavLink>
          )}
        </nav>
    </header>
  );
};

export default Header;