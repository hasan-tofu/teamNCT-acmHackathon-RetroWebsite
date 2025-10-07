import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// A simple, hardcoded secret code for creating an admin account in the demo.
// In a real application, this should be a securely managed environment variable.
const ADMIN_SECRET_CODE = 'RETRO';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    if (role === 'admin' && adminCode !== ADMIN_SECRET_CODE) {
        setError("Invalid Admin Code.");
        return;
    }
    setError('');
    setLoading(true);
    try {
      const { error } = await signup(email, password, username, role);
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const RoleSelector: React.FC = () => (
    <div className="flex justify-center bg-retro-purple border-2 border-black p-1 my-4">
      <button
        type="button"
        onClick={() => setRole('student')}
        className={`w-1/2 py-2 font-press-start text-sm transition-colors ${role === 'student' ? 'bg-retro-cyan text-black' : 'text-retro-white'}`}
      >
        Student
      </button>
      <button
        type="button"
        onClick={() => setRole('admin')}
        className={`w-1/2 py-2 font-press-start text-sm transition-colors ${role === 'admin' ? 'bg-retro-pink text-black' : 'text-retro-white'}`}
      >
        Admin
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-retro-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-press-start text-center text-retro-cyan mb-2">CREATE ACCOUNT</h1>
        <form onSubmit={handleSubmit}>
          <RoleSelector />
          {role === 'admin' && (
             <div className="mb-4 animate-pop-in">
                <label className="block text-retro-pink font-vt323 text-2xl mb-2" htmlFor="adminCode">
                Admin Secret Code
                </label>
                <input
                id="adminCode"
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink"
                required
                />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink"
              required
            />
          </div>
          {error && <p className="text-retro-pink text-center font-vt323 text-xl mb-4">{error}</p>}
          <Button type="submit" className="w-full text-lg py-3" disabled={loading}>
            {loading ? 'CREATING...' : 'START GAME'}
          </Button>
        </form>
        <p className="text-center font-vt323 text-lg text-retro-white mt-4">
            Already have an account? <Link to="/login" className="text-retro-cyan underline hover:text-retro-yellow">Log In</Link>
        </p>
      </Card>
    </div>
  );
};

export default SignupPage;