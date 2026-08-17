
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db, supabase } from '../../../../../lib/supabaseClient.ts';
import { Lesson, LessonStatus, Badge } from '../../../../../lib/types.ts';

const PASS_THRESHOLD = 60;

export const LessonPlayer: React.FC<{ 
  lessonId: string, 
  userId: string, 
  onBack: () => void 
}> = ({ lessonId, userId, onBack }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const l = await db.getLesson(lessonId);
        if (l) {
          setLesson(l);
          const { data: siblings } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', l.courseId)
            .order('lesson_order', { ascending: true });
          
          if (siblings) {
            setCourseLessons(siblings.map(s => ({
              id: s.id,
              courseId: s.course_id,
              title: s.title,
              content: s.content,
              order: s.lesson_order
            })));
          }
        }
      } catch (err) {
        console.error("Critical error fetching lesson:", err);
      }
    };
    fetchLessonData();
  }, [lessonId]);

  const isFinalLesson = useMemo(() => {
    if (!lesson || courseLessons.length === 0) return false;
    const maxOrder = Math.max(...courseLessons.map(l => l.order));
    return lesson.order === maxOrder;
  }, [lesson, courseLessons]);

  const handleSubmit = async () => {
    const questions = lesson?.quiz?.questions;
    if (!questions || questions.length === 0) return;
    
    setSubmitting(true);
    let correct = 0;
    const totalQuestions = questions.length;
    
    questions.forEach(q => { 
      if (answers[q.id] === q.correctOption) correct++; 
    });
    
    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= PASS_THRESHOLD;
    
    try {
      const badge = await db.updateProgress(
        userId, 
        lessonId, 
        passed ? LessonStatus.COMPLETED : LessonStatus.IN_PROGRESS, 
        score
      );
      
      setResult({ score, passed });
      if (passed && badge) {
        setEarnedBadge(badge);
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setEarnedBadge(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const readingTime = useMemo(() => {
    if (!lesson || !lesson.content) return 0;
    const words = lesson.content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [lesson]);

  if (!lesson) return (
    <div className="min-h-screen flex items-center justify-center bg-[#002b36]">
      <div className="flex flex-col items-center gap-4">
        <i className="fa-solid fa-circle-notch animate-spin text-[#268bd2] text-3xl"></i>
        <span className="text-xs font-bold text-[#586e75] uppercase tracking-widest">Initialising Unit...</span>
      </div>
    </div>
  );

  const hasQuestions = lesson.quiz?.questions && lesson.quiz.questions.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
      {/* Badge Earned Celebration Modal */}
      {earnedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#002b36]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#073642] border-2 border-[#b58900] p-12 rounded-[2rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-500 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#b58900_0%,_transparent_70%)]"></div>
            </div>

            <div className="relative mb-8">
              <div className="w-32 h-32 bg-[#b58900]/10 rounded-full flex items-center justify-center text-7xl animate-bounce shadow-[0_0_50px_rgba(181,137,0,0.3)] ring-4 ring-[#b58900]/20">
                {earnedBadge.icon}
              </div>
              <div className="absolute -top-2 -right-2 bg-[#b58900] text-[#eee8d5] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">NEW BADGE</div>
            </div>
            
            <h2 className="text-3xl font-black text-[#eee8d5] mb-2 leading-tight">Achievement Unlocked!</h2>
            <p className="text-[#839496] mb-8 text-sm">You have mastered the path and earned the <span className="text-[#b58900] font-bold">{earnedBadge.title}</span> certificate.</p>
            
            <div className="w-full space-y-3 relative z-10">
              <button 
                onClick={onBack}
                className="w-full bg-[#b58900] text-[#eee8d5] py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-[#b58900]/10"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => setEarnedBadge(null)}
                className="w-full bg-transparent text-[#586e75] py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:text-[#eee8d5] transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between mb-8 pb-4 border-b border-[#586e75]/20">
        <button onClick={onBack} className="text-xs font-bold text-[#586e75] hover:text-[#eee8d5] uppercase tracking-widest flex items-center group">
          <i className="fa-solid fa-chevron-left mr-2 group-hover:-translate-x-1 transition-transform"></i> Exit Unit
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#268bd2] uppercase tracking-widest">
            {quizMode ? 'Knowledge Check' : 'Material Review'}
          </span>
          {isFinalLesson && !quizMode && (
            <span className="text-[8px] text-[#b58900] font-black uppercase tracking-tighter animate-pulse">Certified Opportunity</span>
          )}
        </div>
      </header>

      {!quizMode ? (
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold text-[#eee8d5] mb-4 tracking-tight">{lesson.title}</h1>
          <div className="flex items-center justify-between mb-10">
            <p className="text-xs font-bold text-[#586e75] uppercase flex items-center gap-2">
              <i className="fa-regular fa-clock"></i> {readingTime} Minute Study Session
            </p>
            {isFinalLesson && (
              <div className="bg-[#b58900]/10 border border-[#b58900]/20 px-4 py-2 rounded-lg flex items-center gap-3">
                <i className="fa-solid fa-trophy text-[#b58900] text-xs"></i>
                <span className="text-[10px] font-bold text-[#b58900] uppercase tracking-widest">Course Badge Pending</span>
              </div>
            )}
          </div>
          
          <div className="text-xl text-[#839496] leading-relaxed space-y-8 mb-16">
            {lesson.content ? lesson.content.split('\n').map((p, i) => (
              <p key={i} className="first-letter:text-3xl first-letter:font-bold first-letter:text-[#eee8d5] first-letter:mr-2">{p}</p>
            )) : <p className="italic text-[#586e75]">This unit currently has no study text.</p>}
          </div>

          {lesson.quiz && (
            <button 
              onClick={() => { setQuizMode(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`w-full py-5 rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-xl ${
                isFinalLesson ? 'bg-[#b58900] shadow-[#b58900]/10 text-[#eee8d5]' : 'bg-[#268bd2] shadow-[#268bd2]/10 text-[#eee8d5]'
              }`}
            >
              {isFinalLesson ? 'Complete Final Evaluation to Earn Badge' : 'Start Lesson Quiz'}
            </button>
          )}
        </article>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-300">
          {result && (
            <div className={`p-10 rounded-3xl border-4 text-center shadow-2xl animate-in zoom-in duration-300 ${
              result.passed ? 'border-[#859900] bg-[#859900]/5 text-[#859900]' : 'border-[#dc322f] bg-[#dc322f]/5 text-[#dc322f]'
            }`}>
              <h2 className="text-4xl font-black mb-2 uppercase">{result.passed ? 'Pass' : 'Fail '}</h2>
              <p className="text-lg mb-8 text-[#839496]">Verification score: <span className="text-2xl font-bold text-[#eee8d5]">{result.score}%</span></p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                {result.passed ? (
                  <button onClick={onBack} className="w-full bg-[#859900] text-[#eee8d5] py-4 rounded-xl font-bold hover:brightness-110">Return to Courses</button>
                ) : (
                  <button onClick={handleRetry} className="w-full bg-[#dc322f] text-[#eee8d5] py-4 rounded-xl font-bold hover:brightness-110">Retry Quiz</button>
                )}
                <button onClick={() => setQuizMode(false)} className="text-[10px] font-bold uppercase text-[#586e75] mt-2 tracking-widest hover:text-[#eee8d5]">Back to Study Material</button>
              </div>
            </div>
          )}

          <div className="space-y-12">
            {!hasQuestions ? (
              <div className="text-center py-24 bg-[#073642]/50 rounded-3xl border-2 border-dashed border-[#586e75]/30">
                <i className="fa-solid fa-circle-question text-4xl text-[#586e75] mb-4"></i>
                <p className="text-[#586e75] font-bold uppercase tracking-widest text-xs">No questions found for this quiz.</p>
                <button onClick={() => setQuizMode(false)} className="mt-6 text-[#268bd2] text-sm font-bold underline">Go back to study material</button>
              </div>
            ) : (
              lesson.quiz!.questions.map((q, i) => (
                <div key={q.id || i} className="space-y-6">
                  <div className="flex gap-4">
                     <span className="text-[#586e75] font-mono font-bold text-lg shrink-0">0{i + 1}.</span>
                     <p className="font-bold text-[#eee8d5] text-xl leading-snug">{q.question}</p>
                  </div>
                  <div className="grid gap-3 pl-10">
                    {q.options.map((opt, idx) => {
                      const isSelected = answers[q.id] === idx;
                      const showResult = result !== null;
                      const isCorrect = q.correctOption === idx;
                      
                      let style = "text-left px-6 py-4 rounded-xl border-2 font-semibold transition-all duration-200 w-full flex justify-between items-center ";
                      
                      if (showResult) {
                        if (isCorrect) style += "border-[#859900] bg-[#859900]/20 text-[#859900] ring-2 ring-[#859900]/20";
                        else if (isSelected) style += "border-[#dc322f] bg-[#dc322f]/20 text-[#dc322f]";
                        else style += "border-[#586e75]/10 text-[#586e75] opacity-40";
                      } else if (isSelected) {
                        style += "border-[#268bd2] bg-[#268bd2]/10 text-[#eee8d5] shadow-lg shadow-[#268bd2]/5 scale-[1.01]";
                      } else {
                        style += "border-[#586e75]/20 bg-[#073642]/30 text-[#839496] hover:border-[#586e75]/40 hover:text-[#eee8d5]";
                      }

                      return (
                        <button 
                          key={idx} 
                          disabled={showResult} 
                          onClick={() => setAnswers({ ...answers, [q.id]: idx })} 
                          className={style}
                        >
                          <span>{opt}</span>
                          {showResult && isCorrect && <i className="fa-solid fa-check-circle"></i>}
                          {showResult && isSelected && !isCorrect && <i className="fa-solid fa-times-circle"></i>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {!result && hasQuestions && (
            <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#002b36] via-[#002b36] to-transparent z-50">
              <div className="max-w-3xl mx-auto">
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting || Object.keys(answers).length < (lesson.quiz?.questions?.length || 0)}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl hover:brightness-110 active:scale-95 transition-all ${
                    isFinalLesson ? 'bg-[#b58900] text-[#eee8d5]' : 'bg-[#268bd2] text-[#eee8d5]'
                  }`}
                >
                  {submitting ? 'Finalising evaluation...' : (isFinalLesson ? 'Finish Evaluation & Claim Badge' : 'Submit Evaluation')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
