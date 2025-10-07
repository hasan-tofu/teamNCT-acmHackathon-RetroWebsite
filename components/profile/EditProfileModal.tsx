
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AVATARS } from '../../constants/avatars';
import { updateProfile } from '../../services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsername(user.username);
      setBio(user.bio || '');
      setSelectedAvatar(user.avatarUrl);
      setError('');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updatedProfile = await updateProfile(user.id, {
        username,
        bio,
        avatar_url: selectedAvatar,
      });

      if (updatedProfile) {
        onSave();
        onClose();
      } else {
        throw new Error("Failed to save profile. Please try again.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
      <form onSubmit={handleSubmit}>
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
        <div className="mb-6">
          <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink"
            rows={3}
            maxLength={150}
          />
        </div>
        <div className="mb-6">
            <label className="block text-retro-yellow font-vt323 text-2xl mb-2">
                Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-4 bg-retro-purple p-2 border-2 border-black">
                {AVATARS.map(avatarUrl => (
                    <img
                        key={avatarUrl}
                        src={avatarUrl}
                        alt="avatar option"
                        onClick={() => setSelectedAvatar(avatarUrl)}
                        className={`w-16 h-16 cursor-pointer bg-retro-dark border-4 ${
                            selectedAvatar === avatarUrl ? 'border-retro-cyan' : 'border-transparent'
                        }`}
                    />
                ))}
            </div>
        </div>

        {error && <p className="text-retro-pink text-center font-vt323 text-xl mb-4">{error}</p>}
        
        <div className="flex justify-end gap-4">
            <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'SAVING...' : 'SAVE'}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
