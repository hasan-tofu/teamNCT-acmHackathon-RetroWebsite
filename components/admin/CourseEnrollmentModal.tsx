import React, { useEffect, useState } from 'react';
import { Course, Profile } from '../../types';
import Modal from '../ui/Modal';
import { getAllUsers, getCourseEnrollments, updateCourseEnrollment } from '../../services/api';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({ isOpen, onClose, course }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [enrolledUserIds, setEnrolledUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [allUsers, enrolledIds] = await Promise.all([
      getAllUsers(),
      getCourseEnrollments(course.id),
    ]);
    setUsers(allUsers);
    setEnrolledUserIds(new Set(enrolledIds));
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, course.id]);
  
  const handleEnrollmentChange = async (userId: string, isEnrolled: boolean) => {
    // Optimistic update
    const newSet = new Set(enrolledUserIds);
    if(isEnrolled) {
        newSet.add(userId);
    } else {
        newSet.delete(userId);
    }
    setEnrolledUserIds(newSet);

    // API call
    const success = await updateCourseEnrollment(course.id, userId, isEnrolled);
    if (!success) {
        alert("Failed to update enrollment. Please try again.");
        // Revert UI on failure
        fetchData();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enrollment: ${course.name}`}>
      {loading ? (
        <p className="text-center font-press-start text-retro-yellow">Loading users...</p>
      ) : (
        <div className="max-h-96 overflow-y-auto bg-retro-dark p-2 border-2 border-retro-purple">
          <table className="w-full font-vt323 text-lg">
            <thead>
              <tr className="border-b-2 border-retro-purple text-left text-retro-yellow">
                <th className="p-2">User</th>
                <th className="p-2 text-center">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-dashed border-retro-purple/50">
                  <td className="p-2 flex items-center gap-2">
                    <img src={user.avatar_url} alt={user.username} className="w-8 h-8"/>
                    {user.username}
                  </td>
                  <td className="p-2 text-center">
                    <input 
                        type="checkbox" 
                        className="w-6 h-6"
                        checked={enrolledUserIds.has(user.id)}
                        onChange={(e) => handleEnrollmentChange(user.id, e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default CourseEnrollmentModal;