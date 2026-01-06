"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/supabaseClient.ts';
import { Course, Lesson, LessonProgress, LessonStatus, Badge } from '../../../lib/types.ts';

export const CourseDetail: React.FC<{ 
  courseId: string, 
  userId: string, 
  onBack: () => void, 
  onSelectLesson: (id: string) => void 
}> = ({ courseId, userId, onBack, onSelectLesson }) => {
  const [data, setData] = useState<{ course?: Course, lessons: Lesson[] } | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseDetails, userProgress, userBadges] = await Promise.all([
          db.getCourseDetails(courseId),
          db.getProgress(userId),
          db.getBadges(userId)
        ]);
        setData(courseDetails);
        setProgress(userProgress);
        setBadges(userBadges);
      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, userId]);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <i className="fa-solid fa-circle-notch animate-spin text-[#268bd2] text-4xl"></i>
    </div>
  );

  if (!data) return <div className="p-12 text-center text-[#eee8d5]">Course not found.</div>;

  const activeBadge = badges.find(b => b.courseId === courseId);
  const completedCount = data.lessons.filter(l => 
    progress.some(p => p.lessonId === l.id && p.status === LessonStatus.COMPLETED)
  ).length;
  const totalLessons = data.lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isMastered = progressPercent === 100;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <nav className="mb-10">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[#586e75] font-bold text-xs uppercase tracking-widest hover:text-[#eee8d5] transition-colors"
        >
          <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> 
          Back to Courses
        </button>
      </nav>

      <header className="mb-16 flex flex-col md:flex-row gap-12 items-start justify-between">
        <div className="flex-grow max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[#eee8d5] mb-4 tracking-tight">
            {data.course?.title}
          </h1>
          <p className="text-lg text-[#839496] leading-relaxed mb-8">
            {data.course?.description}
          </p>
          
          <div className="w-full bg-[#073642] h-2 rounded-full overflow-hidden border border-[#586e75]/10">
            <div 
              className={`h-full transition-all duration-1000 ${isMastered ? 'bg-[#859900]' : 'bg-[#268bd2]'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold text-[#586e75] uppercase tracking-widest">
            <span>{completedCount} of {totalLessons} Units</span>
            <span>{progressPercent}% Completed</span>
          </div>
        </div>

        {activeBadge && (
          <div className="bg-[#073642] border border-[#b58900]/30 p-8 rounded-xl flex flex-col items-center shadow-lg animate-in zoom-in duration-300">
            <div className="text-5xl mb-3">{activeBadge.icon}</div>
            <h3 className="font-bold text-[#eee8d5] text-center">{activeBadge.title}</h3>
            <span className="text-[10px] text-[#b58900] font-bold uppercase mt-2 tracking-widest">Mastery Achieved</span>
          </div>
        )}
      </header>

      <section className="space-y-4">
        <h3 className="text-[#586e75] font-bold text-xs uppercase tracking-widest mb-6">Course Curriculum</h3>
        <div className="grid gap-3">
          {data.lessons.map((lesson, index) => {
            const lessonStatus = progress.find(p => p.lessonId === lesson.id);
            const status = lessonStatus?.status || LessonStatus.NOT_STARTED;
            const isFinished = status === LessonStatus.COMPLETED;
            
            return (
              <div 
                key={lesson.id} 
                onClick={() => onSelectLesson(lesson.id)}
                className="group bg-[#073642] p-6 rounded-xl border border-[#586e75]/10 flex items-center justify-between cursor-pointer hover:border-[#268bd2]/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-base transition-colors ${
                    isFinished ? 'bg-[#859900]/10 text-[#859900]' : 'bg-[#002b36] text-[#586e75] group-hover:text-[#eee8d5]'
                  }`}>
                    {isFinished ? <i className="fa-solid fa-check"></i> : (index + 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#eee8d5] text-lg group-hover:text-[#268bd2] transition-colors">{lesson.title}</h4>
                    <span className={`text-[10px] font-bold uppercase ${isFinished ? 'text-[#859900]' : 'text-[#586e75]'}`}>
                      {status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   {lessonStatus?.bestScore ? (
                     <span className="text-xs font-bold text-[#586e75]">{lessonStatus.bestScore}%</span>
                   ) : null}
                   <i className="fa-solid fa-play text-xs text-[#586e75] group-hover:text-[#268bd2] transition-colors"></i>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};