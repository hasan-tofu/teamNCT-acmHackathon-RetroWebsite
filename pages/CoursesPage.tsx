
import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { getCourses, completeCourse, getUserCompletedCourseIds } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [completedCourse, setCompletedCourse] = useState<Course | null>(null);
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<number>>(new Set());
  const { user, refreshUserProfile } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
       if (user) {
        const completedIds = await getUserCompletedCourseIds(user.id);
        setCompletedCourseIds(completedIds);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [user]);
  
  const handleComplete = async (course: Course) => {
    if (!user) return;
    const success = await completeCourse(user.id, course);
    if (success) {
      setCompletedCourse(course);
      setModalOpen(true);
      setCompletedCourseIds(prev => new Set(prev).add(course.id));
      refreshUserProfile(); // Refresh user data to show new XP and badge
    } else {
        alert("Failed to record quest completion. You may have already completed it.");
    }
  };

  if (loading) {
    return <div className="text-center font-press-start text-2xl text-retro-yellow">LOADING QUEST LOG...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-press-start text-center text-retro-cyan mb-8">Course Quests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map(course => {
          const isCompleted = completedCourseIds.has(course.id);
          return (
          <Card key={course.id} interactive={!isCompleted}>
             <div className="flex flex-col h-full">
                <h2 className="font-press-start text-xl text-retro-yellow mb-2">{course.name}</h2>
                <p className="font-vt323 text-lg text-gray-300 mb-4 flex-grow">{course.description}</p>
                
                <div className="border-t-2 border-dashed border-retro-purple my-3"></div>

                <h3 className="font-press-start text-lg text-retro-yellow mb-2">LOOT:</h3>
                <p className="font-vt323 text-lg text-retro-pink mb-2">
                    <span className="font-bold">+ {course.xp_reward} XP</span>
                </p>
                {course.badgeReward && (
                    <p className="font-vt323 text-lg text-retro-cyan mb-4 flex items-center">
                        <span className="text-2xl mr-2">{course.badgeReward.icon}</span> 
                        <span className="font-bold">{course.badgeReward.name} Badge</span>
                    </p>
                )}
                <div className="w-full bg-retro-purple border-2 border-black shadow-pixel-inset p-1 my-4">
                  <div 
                    className="bg-retro-cyan h-3 transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                    aria-label={isCompleted ? 'Progress: 100%' : 'Progress: 0%'}
                  />
                </div>
                <Button 
                  onClick={() => handleComplete(course)} 
                  variant="secondary" 
                  className="w-full"
                  disabled={isCompleted}
                  aria-disabled={isCompleted}
                >
                  {isCompleted ? 'Quest Complete' : 'Complete Quest'}
                </Button>
            </div>
          </Card>
        )})}
      </div>
       <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="QUEST COMPLETE!">
        {completedCourse && (
          <div className="text-center">
            <p className="font-vt323 text-2xl text-retro-white mb-4">
              You have completed the <span className="text-retro-yellow font-bold">{completedCourse.name}</span> quest!
            </p>
            <p className="font-press-start text-3xl text-retro-cyan animate-sparkle mb-4">
              +{completedCourse.xp_reward} XP
            </p>
            {completedCourse.badgeReward && (
                <div>
                    <p className="font-vt323 text-2xl text-retro-white mb-2">Badge Unlocked!</p>
                    <div className="inline-block bg-retro-purple p-4 text-5xl border-2 border-black shadow-pixel">
                        {completedCourse.badgeReward.icon}
                    </div>
                     <p className="font-press-start text-xl text-retro-yellow mt-2">{completedCourse.badgeReward.name}</p>
                </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoursesPage;