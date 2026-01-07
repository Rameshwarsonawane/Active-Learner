"use client";

import React, { useState, useEffect } from 'react';
import { User, Course, Enrollment, LessonProgress, LessonStatus, Badge, Lesson } from '../lib/types';
import { db, supabase } from '../lib/supabaseClient';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser({ id: 'u1', name: 'Learner', email: 'test@example.com' });
  }, []);

  const handleSelectCourse = (id: string) => {
    console.log("Selected Course:", id);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#002b36]">
        <div className="animate-spin text-[#268bd2] text-3xl">
          <i className="fa-solid fa-circle-notch"></i>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} onSelectCourse={handleSelectCourse} />;
}

const Dashboard: React.FC<{ 
  user: User, 
  onSelectCourse: (id: string) => void 
}> = ({ user, onSelectCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [c, e, p, b] = await Promise.all([
        db.getCourses(),
        db.getEnrollments(user.id),
        db.getProgress(user.id),
        db.getBadges(user.id)
      ]);
      
      setCourses(c);
      setEnrollments(e);
      setProgress(p);
      setBadges(b);

      const { data: lessonData } = await supabase.from('lessons').select('*');
      if (lessonData) {
        setAllLessons(lessonData.map(l => ({
          id: l.id,
          courseId: l.course_id,
          title: l.title,
          content: l.content,
          order: l.lesson_order
        })));
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const syncBadges = async () => {
    if (enrollments.length === 0 || allLessons.length === 0) return;
    setIsSyncing(true);
    let changed = false;
    try {
      for (const enrollment of enrollments) {
        const hasBadge = badges.some(b => b.courseId === enrollment.courseId);
        if (!hasBadge) {
          const courseLessons = allLessons.filter(l => l.courseId === enrollment.courseId);
          if (courseLessons.length > 0) {
            const completedInCourse = progress.filter(p => 
              p.status === LessonStatus.COMPLETED && 
              courseLessons.some(cl => cl.id === p.lessonId)
            );
            if (completedInCourse.length === courseLessons.length) {
              const awarded = await db.awardBadgeIfComplete(user.id, enrollment.courseId);
              if (awarded) changed = true;
            }
          }
        }
      }
      if (changed) {
        const freshBadges = await db.getBadges(user.id);
        setBadges(freshBadges);
      }
    } catch (err) {
      console.error("Badge sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!loading && enrollments.length > 0 && allLessons.length > 0) {
      syncBadges();
    }
  }, [loading, enrollments.length, allLessons.length]);

  const getCourseStats = (courseId: string) => {
    const courseLessons = allLessons.filter(l => l.courseId === courseId);
    const total = courseLessons.length;
    if (total === 0) return { completedCount: 0, total: 0, percent: 0 };
    const completedCount = progress.filter(p => 
      p.status === LessonStatus.COMPLETED && 
      courseLessons.some(cl => cl.id === p.lessonId)
    ).length;
    return {
      completedCount,
      total,
      percent: Math.min(100, Math.round((completedCount / total) * 100))
    };
  };

  const enrolledCourses = enrollments.map(e => courses.find(c => c.id === e.courseId)).filter(Boolean) as Course[];
  const completedLessons = progress.filter(p => p.status === LessonStatus.COMPLETED);
  const averageScore = completedLessons.length > 0 
    ? Math.round(completedLessons.reduce((acc, curr) => acc + curr.bestScore, 0) / completedLessons.length) 
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <i className="fa-solid fa-circle-notch animate-spin text-[#268bd2] text-3xl"></i>
        <span className="text-[10px] font-bold text-[#586e75] uppercase tracking-widest">Retrieving Progress...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-20 bg-[#002b36] min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#eee8d5]">Hello, {user.name}</h1>
          <p className="text-[#586e75] mt-1 font-medium italic">welcome back.</p>
        </div>
        <button 
          onClick={() => { fetchData(); syncBadges(); }}
          className="flex items-center gap-2 text-[10px] font-bold text-[#586e75] hover:text-[#268bd2] uppercase tracking-widest transition-colors group"
        >
          <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin' : ''}`}></i>
          {isSyncing ? 'Syncing Achievement Data...' : 'Refresh Progress'}
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Lessons Completed', value: completedLessons.length },
          { label: 'Courses Enrolled', value: enrolledCourses.length},
          { label: 'Average Score', value: `${averageScore}%` }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#073642] border border-[#586e75]/20 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#586e75] uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-[#eee8d5]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold text-[#eee8d5] mb-8">My Active Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {enrolledCourses.map(course => {
            const stats = getCourseStats(course.id);
            const badge = badges.find(b => b.courseId === course.id);
            const isFinished = stats.percent === 100;

            return (
              <div 
                key={course.id} 
                onClick={() => onSelectCourse(course.id)} 
                className={`bg-[#073642] p-8 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col ${
                  isFinished ? 'border-[#859900]/40' : 'border-[#586e75]/20 hover:border-[#268bd2]/50'
                }`}
              >
                {badge && <div className="absolute top-4 right-4 text-3xl">{badge.icon}</div>}
                <h3 className="text-xl font-bold text-[#eee8d5] mb-2">{course.title}</h3>
                <p className="text-[#839496] text-sm mb-6 line-clamp-2">{course.description}</p>
                <div className="w-full bg-[#002b36] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isFinished ? 'bg-[#859900]' : 'bg-[#268bd2]'}`}
                    style={{ width: `${stats.percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};




