
"use client";

import React, { useState, useEffect } from 'react';
import { User, Course, Enrollment, LessonProgress, LessonStatus, Badge, Lesson } from '../lib/types.ts';
import { db, supabase } from '../lib/supabaseClient.ts';

export const Dashboard: React.FC<{ 
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
      // Fetch base data
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

      // Fetch all lessons to accurately calculate progress per course
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
          
          // Only check if course actually has lessons defined
          if (courseLessons.length > 0) {
            const completedInCourse = progress.filter(p => 
              p.status === LessonStatus.COMPLETED && 
              courseLessons.some(cl => cl.id === p.lessonId)
            );
            
            // If the count matches, try to award the badge retroactively
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
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold text-[#eee8d5]">Hello, {user.name}</h1>
          <p className="text-[#586e75] mt-1 font-medium italic">welcome back.</p>
        </div>
        <button 
          onClick={() => { fetchData(); syncBadges(); }}
          className="flex items-center gap-2 text-[10px] font-bold text-[#586e75] hover:text-[#268bd2] uppercase tracking-widest transition-colors group"
        >
          <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin text-[#268bd2]' : 'group-hover:rotate-180 transition-transform duration-500'}`}></i>
          {isSyncing ? 'Syncing Achievement Data...' : 'Refresh Progress'}
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Lessons Completed', value: completedLessons.length },
          { label: 'Courses Enrolled', value: enrolledCourses.length},
          { label: 'Average Score', value: `${averageScore}%` }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#073642] border border-[#586e75]/20 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-[#586e75] uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-[#eee8d5]">{stat.value}</p>
            </div>
            <i className={`fa-solid ${stat.icon} text-[#586e75] text-xl opacity-50`}></i>
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
                className={`bg-[#073642] p-8 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden flex flex-col ${
                  isFinished ? 'border-[#859900]/40 shadow-lg shadow-[#859900]/5' : 'border-[#586e75]/20 hover:border-[#268bd2]/50'
                }`}
              >
                {badge && (
                  <div className="absolute top-4 right-4 text-3xl animate-in zoom-in duration-500 drop-shadow-lg">
                    {badge.icon}
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-[#eee8d5] mb-2 pr-10 group-hover:text-[#268bd2] transition-colors">
                  {course.title}
                </h3>
                <p className="text-[#839496] text-sm mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between items-end mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isFinished ? 'text-[#859900]' : 'text-[#586e75]'}`}>
                      {isFinished ? 'Completed course' : 'Active Progress'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#586e75]">
                      {stats.completedCount} / {stats.total} Lesson ({stats.percent}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#002b36] h-1.5 rounded-full overflow-hidden border border-[#586e75]/10">
                    <div 
                      className={`h-full transition-all duration-1000 ${isFinished ? 'bg-[#859900]' : 'bg-[#268bd2]'}`}
                      style={{ width: `${stats.percent}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-[#586e75] opacity-0 group-hover:opacity-100 transition-opacity">CONTINUE Learning</span>
                       <i className="fa-solid fa-arrow-right text-[#268bd2] group-hover:translate-x-1 transition-transform"></i>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
          {enrolledCourses.length === 0 && (
             <div className="col-span-full py-16 text-center bg-[#073642]/30 border-2 border-dashed border-[#586e75]/20 rounded-3xl">
               <i className="fa-solid fa-compass text-3xl text-[#586e75] mb-4"></i>
               <p className="text-[#586e75] font-medium">No active paths found. Head to the catalog to begin.</p>
               <button onClick={() => onSelectCourse('all')} className="mt-6 text-[#268bd2] text-sm font-bold uppercase tracking-widest hover:underline">Explore Catalog</button>
             </div>
          )}
        </div>
      </section>

      {badges.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xs font-bold text-[#586e75] uppercase tracking-widest">Certificates(Badges)</h2>
            <div className="h-px flex-grow bg-[#586e75]/20"></div>
          </div>
          <div className="flex flex-wrap gap-4">
            {badges.map(badge => (
              <div key={badge.id} className="bg-[#073642] border border-[#b58900]/40 p-5 rounded-2xl flex items-center gap-5 hover:scale-105 hover:border-[#b58900]/70 transition-all cursor-default shadow-md">
                <div className="w-14 h-14 bg-[#b58900]/10 rounded-full flex items-center justify-center text-4xl shadow-inner ring-4 ring-[#b58900]/5">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[#eee8d5] text-sm leading-tight mb-1">{badge.title}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-[#b58900] font-bold uppercase tracking-widest">Verified Alumnus</p>
                    <i className="fa-solid fa-certificate text-[#b58900] text-[8px]"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
