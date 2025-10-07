import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { createCourse, updateCourse } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CourseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    onSave: () => void;
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({ isOpen, onClose, course, onSave }) => {
    const [formData, setFormData] = useState({
      name: course?.name || '',
      description: course?.description || '',
      instructor: course?.instructor || '',
      xp_reward: course?.xp_reward || 50,
      image_url: course?.image_url || '',
      badge_id_reward: course?.badge_id_reward || null,
    });

    useEffect(() => {
        if(course) {
            setFormData({
                name: course.name,
                description: course.description,
                instructor: course.instructor || '',
                xp_reward: course.xp_reward,
                image_url: course.image_url || '',
                badge_id_reward: course.badge_id_reward || null,
            });
        } else {
            // Reset for new course
            setFormData({
                name: '', description: '', instructor: '', xp_reward: 50, image_url: '', badge_id_reward: null
            });
        }
    }, [course, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = {
        ...formData,
        xp_reward: Number(formData.xp_reward),
        badge_id_reward: formData.badge_id_reward ? Number(formData.badge_id_reward) : null,
      };
      
      const success = course
        ? await updateCourse(course.id, payload)
        : await createCourse(payload);

      if (success) {
        onSave();
      } else {
        alert('Failed to save course.');
      }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={course ? 'Edit Course' : 'Create Course'}>
        <form onSubmit={handleSubmit}>
         <div className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Course Name" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink" rows={3} required />
            <input name="instructor" value={formData.instructor || ''} onChange={handleChange} placeholder="Instructor (optional)" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" />
            <input name="xp_reward" value={formData.xp_reward} onChange={handleChange} type="number" placeholder="XP Reward" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
            <input name="badge_id_reward" value={formData.badge_id_reward || ''} onChange={handleChange} type="number" placeholder="Badge ID Reward (optional)" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" />
            <input name="image_url" value={formData.image_url || ''} onChange={handleChange} placeholder="Image URL (optional)" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" />
        </div>
        <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Course</Button>
        </div>
      </form>
    </Modal>
    );
};

export default CourseFormModal;
