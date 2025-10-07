import React, { useEffect, useState } from 'react';
import { Course } from '../../types';
import { getCourses, deleteCourse } from '../../services/api';
import Button from '../ui/Button';
import CourseEnrollmentModal from './CourseEnrollmentModal';
import CourseFormModal from './CourseFormModal';

const CourseManagementView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState<Course | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    const data = await getCourses();
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenFormModal = (course: Course | null = null) => {
    setEditingCourse(course);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCourse(null);
  };

  const handleOpenEnrollmentModal = (course: Course) => {
    setSelectedCourseForEnrollment(course);
    setIsEnrollmentModalOpen(true);
  }

  const handleDelete = async (courseId: number) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const success = await deleteCourse(courseId);
      if (success) {
        alert('Course deleted.');
        fetchCourses();
      } else {
        alert('Failed to delete course.');
      }
    }
  };

  if (loading) {
    return <div className="text-center font-press-start text-retro-yellow">LOADING COURSES...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-press-start text-retro-yellow">COURSE MANAGEMENT</h2>
        <Button onClick={() => handleOpenFormModal()}>+ Create Course</Button>
      </div>
      <div className="overflow-x-auto bg-retro-dark p-2 border-2 border-retro-purple">
        <table className="w-full font-vt323 text-lg">
          <thead>
            <tr className="border-b-2 border-retro-purple text-left text-retro-yellow">
              <th className="p-3">Name</th>
              <th className="p-3">Instructor</th>
              <th className="p-3 text-right">XP</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-dashed border-retro-purple/50">
                <td className="p-3">{course.name}</td>
                <td className="p-3">{course.instructor || 'N/A'}</td>
                <td className="p-3 text-right text-retro-cyan">{course.xp_reward}</td>
                <td className="p-3 text-center">
                   <div className="flex gap-2 justify-center">
                      <Button onClick={() => handleOpenEnrollmentModal(course)} variant="primary" className="text-xs px-2 py-1">Enrollment</Button>
                      <Button onClick={() => handleOpenFormModal(course)} variant="secondary" className="text-xs px-2 py-1">Edit</Button>
                      <Button onClick={() => handleDelete(course.id)} variant="danger" className="text-xs px-2 py-1">Delete</Button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isFormModalOpen && (
        <CourseFormModal 
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            course={editingCourse} 
            onSave={() => {
                handleCloseFormModal();
                fetchCourses();
            }} 
        />
      )}

      {selectedCourseForEnrollment && (
        <CourseEnrollmentModal
            isOpen={isEnrollmentModalOpen}
            onClose={() => setIsEnrollmentModalOpen(false)}
            course={selectedCourseForEnrollment}
        />
      )}
    </div>
  );
};

export default CourseManagementView;