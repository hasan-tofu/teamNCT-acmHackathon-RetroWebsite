import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { createUser } from '../../services/api';

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const UserAddModal: React.FC<UserAddModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'admin',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleRoleChange = (role: 'student' | 'admin') => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setLoading(true);
    setError('');
    try {
      const newUser = await createUser(formData);
      if (newUser) {
        alert('User created successfully!');
        onUserAdded();
      } else {
        throw new Error('Failed to create user.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="username">Username</label>
          <input name="username" value={formData.username} onChange={handleChange} className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
        </div>
        <div>
          <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="email">Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
        </div>
        <div>
          <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="password">Password</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
        </div>
        <div>
            <label className="block text-retro-yellow font-vt323 text-2xl mb-2">Role</label>
            <div className="flex bg-retro-purple border-2 border-black p-1">
                <button type="button" onClick={() => handleRoleChange('student')} className={`w-1/2 py-2 font-press-start text-sm transition-colors ${formData.role === 'student' ? 'bg-retro-cyan text-black' : 'text-retro-white'}`}>Student</button>
                <button type="button" onClick={() => handleRoleChange('admin')} className={`w-1/2 py-2 font-press-start text-sm transition-colors ${formData.role === 'admin' ? 'bg-retro-pink text-black' : 'text-retro-white'}`}>Admin</button>
            </div>
        </div>

        {error && <p className="text-retro-pink text-center font-vt323 text-xl">{error}</p>}
        
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'CREATING...' : 'Create User'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserAddModal;