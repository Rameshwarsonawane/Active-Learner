
"use client";

import React, { useState, useEffect } from 'react';
import { User, Course, Enrollment, LessonProgress, LessonStatus, Lesson } from '../../lib/types';
import { db, supabase } from '../../lib/supabaseClient';

export const CoursesList: React.FC<{ 
  user: User, 
  onSelectCourse: (id: string) => void 
}> = ({ user, onSelectCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [c, e, p] = await Promise.all([
          db.getCourses(),
          db.getEnrollments(user.id),
          db.getProgress(user.id)
        ]);
        
        // Fetch lessons to accurately count completion
        const { data: lessonData } = await supabase.from('lessons').select('id, course_id');
        
        setCourses(c);
        setEnrollments(e);
        setProgress(p);
        if (lessonData) {
          setAllLessons(lessonData.map(l => ({ 
            id: l.id, 
            courseId: l.course_id, 
            title: '', 
            content: '', 
            order: 0 
          })));
        }
      } catch (err) {
        console.error("Error fetching course catalog data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleEnroll = async (id: string) => {
    try {
      await db.enroll(user.id, id);
      const updated = await db.getEnrollments(user.id);
      setEnrollments(updated);
    } catch (err) {
      alert("Failed to enroll. Try again.");
    }
  };

  const getCourseProgress = (courseId: string) => {
    const courseLessons = allLessons.filter(l => l.courseId === courseId);
    const total = courseLessons.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    const completed = progress.filter(p => 
      p.status === LessonStatus.COMPLETED && 
      courseLessons.some(cl => cl.id === p.lessonId)
    ).length;

    return {
      completed,
      total,
      percent: Math.min(100, Math.round((completed / total) * 100))
    };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <i className="fa-solid fa-circle-notch animate-spin text-[#268bd2] text-3xl"></i>
        <span className="text-[10px] font-bold text-[#586e75] uppercase tracking-widest">Scanning Catalog...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 pb-24">
      <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-bold text-[#eee8d5]">Courses</h1>
        <p className="text-[#586e75] mt-2 font-medium italic">Welcome Back.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => {
          const isEnrolled = enrollments.some(e => e.courseId === course.id);
          const stats = isEnrolled ? getCourseProgress(course.id) : null;
          const isMastered = stats?.percent === 100;
          
          return (
            <div 
              key={course.id} 
              className={`bg-[#073642] border rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 relative shadow-sm h-full ${
                isMastered 
                  ? 'border-[#859900]/30 shadow-lg shadow-[#859900]/5' 
                  : 'border-[#586e75]/20 hover:border-[#268bd2]/40 hover:shadow-xl'
              }`}
            >
              <div className="h-32 bg-[#002b36] relative overflow-hidden">
                <img 
                  src={course.image} 
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                    isMastered ? 'opacity-60 saturate-100' : 'opacity-40 saturate-0 group-hover:opacity-50'
                  }`} 
                  alt={course.title} 
                />
                {isMastered && (
                  <div className="absolute top-4 right-4 bg-[#859900] text-[#eee8d5] p-2 rounded-full shadow-lg flex items-center justify-center w-8 h-8 animate-in zoom-in duration-500">
                    <i className="fa-solid fa-check text-xs"></i>
                  </div>
                )}
                {isEnrolled && !isMastered && stats && stats.percent > 0 && (
                  <div className="absolute top-4 right-4 bg-[#268bd2]/80 backdrop-blur-sm text-[#eee8d5] text-[10px] font-black px-2 py-1 rounded tracking-tighter shadow-lg">
                    {stats.percent}%
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                  <h3 className={`font-bold text-lg leading-tight mb-2 transition-colors ${
                    isMastered ? 'text-[#859900]' : 'text-[#eee8d5] group-hover:text-[#268bd2]'
                  }`}>
                    {course.title}
                  </h3>
                  <p className="text-[12px] text-[#839496] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-[#586e75]/10">
                  {isEnrolled && stats ? (
                    <div className="mb-6 space-y-3">
                      <div className="flex justify-between items-end mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          isMastered ? 'text-[#859900]' : 'text-[#586e75]'
                        }`}>
                          {isMastered ? 'Completed' : 'Progress'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#586e75]">
                          {stats.completed} / {stats.total} Lessons
                        </span>
                      </div>
                      <div className="w-full bg-[#002b36] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            isMastered ? 'bg-[#859900]' : 'bg-[#268bd2]'
                          }`}
                          style={{ width: `${stats.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <button 
                        onClick={() => onSelectCourse(course.id)}
                        className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn shadow-md ${
                          isMastered 
                            ? 'bg-[#859900]/10 border border-[#859900]/30 text-[#859900] hover:bg-[#859900] hover:text-[#eee8d5]' 
                            : 'bg-[#002b36] border border-[#586e75]/30 text-[#839496] hover:border-[#268bd2]/50 hover:text-[#eee8d5]'
                        }`}
                      >
                        {isMastered ? 'Review completed course' : 'Continue Learning'}
                        <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        className="w-full bg-[#268bd2] text-[#eee8d5] py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#268bd2]/10 transition-all flex items-center justify-center gap-2"
                      >
                        Enroll Now
                        <i className="fa-solid fa-bolt-lightning text-[10px]"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
