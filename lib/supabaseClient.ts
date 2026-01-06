'use client';
import { createClient } from '@supabase/supabase-js';
import { User, Enrollment, LessonProgress, LessonStatus, Course, Lesson, Quiz, QuizQuestion, Badge } from './types.ts';

const SUPABASE_URL = 'https://cgacefngnxvglazqxkep.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HxvXo1grnLRK2iMdmT7SBQ_h6S69QZA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const db = {
  getCourses: async (): Promise<Course[]> => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image,
      lessonCount: c.lesson_count
    }));
  },

  getCourseDetails: async (id: string) => {
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    const { data: lessons, error: lErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('lesson_order', { ascending: true });

    if (cErr || lErr) throw (cErr || lErr);
    
    const mappedLessons: Lesson[] = (lessons || []).map(l => ({
      id: l.id,
      courseId: l.course_id,
      title: l.title,
      content: l.content,
      order: l.lesson_order
    }));

    return { 
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.image,
        lessonCount: course.lesson_count
      }, 
      lessons: mappedLessons 
    };
  },

  getLesson: async (id: string): Promise<Lesson | null> => {
    const { data: lessonData, error: lErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (lErr || !lessonData) return null;

    const { data: quizData, error: qErr } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', id)
      .maybeSingle();

    let mappedQuiz: Quiz | undefined = undefined;

    if (quizData) {
      const { data: questionsData, error: qnErr } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizData.id);

      if (!qnErr && questionsData && questionsData.length > 0) {
        mappedQuiz = {
          id: quizData.id,
          lessonId: quizData.lesson_id,
          title: quizData.title || 'Lesson Quiz',
          questions: questionsData.map(q => ({
            id: q.id,
            question: q.question || q.question_text || 'Untitled Question',
            options: q.options || [],
            correctOption: q.correct_option !== undefined ? q.correct_option : q.correct_option_index
          }))
        };
      }
    }
    
    return {
      id: lessonData.id,
      courseId: lessonData.course_id,
      title: lessonData.title,
      content: lessonData.content,
      order: lessonData.lesson_order,
      quiz: mappedQuiz
    };
  },

  getEnrollments: async (userId: string): Promise<Enrollment[]> => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(e => ({
      id: e.id,
      userId: e.user_id,
      courseId: e.course_id,
      enrolledAt: e.enrolled_at
    }));
  },

  enroll: async (userId: string, courseId: string) => {
    await supabase.from('enrollments').upsert([{ user_id: userId, course_id: courseId }], { onConflict: 'user_id,course_id' });
  },

  getProgress: async (userId: string): Promise<LessonProgress[]> => {
    const { data, error } = await supabase.from('lesson_progress').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      lessonId: p.lesson_id,
      status: p.status as LessonStatus,
      bestScore: p.best_score,
      updatedAt: p.updated_at
    }));
  },

  getBadges: async (userId: string): Promise<Badge[]> => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId);
    
    if (error) return [];
    
    return (data || []).map(b => ({
      id: b.id,
      userId: b.user_id,
      courseId: b.course_id,
      title: b.title,
      icon: b.icon,
      awardedAt: b.awarded_at
    }));
  },

  awardBadgeIfComplete: async (userId: string, courseId: string): Promise<Badge | null> => {
    try {
      // 1. Verify all lessons are actually completed
      const { data: allLessons, error: lErr } = await supabase.from('lessons').select('id').eq('course_id', courseId);
      if (lErr || !allLessons || allLessons.length === 0) return null;

      const { data: completedProgress, error: pErr } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('status', LessonStatus.COMPLETED)
        .in('lesson_id', allLessons.map(l => l.id));

      if (pErr || !completedProgress || completedProgress.length !== allLessons.length) {
        return null;
      }

      // 2. Get course info for the badge
      const { data: course, error: cErr } = await supabase.from('courses').select('title').eq('id', courseId).single();
      if (cErr || !course) return null;

      let icon = '🏆';
      const titleLower = course.title.toLowerCase();
      if (titleLower.includes('react')) icon = '⚛️';
      else if (titleLower.includes('supabase')) icon = '⚡';
      else if (titleLower.includes('ai')) icon = '🤖';

      // 3. Check if badge already exists to avoid upsert/constraint errors
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existingBadge) {
        return {
          id: existingBadge.id,
          userId: existingBadge.user_id,
          courseId: existingBadge.course_id,
          title: existingBadge.title,
          icon: existingBadge.icon,
          awardedAt: existingBadge.awarded_at
        };
      }

      // 4. Create new badge
      const badgeData = {
        user_id: userId,
        course_id: courseId,
        title: `${course.title} Master`,
        icon: icon,
        awarded_at: new Date().toISOString()
      };

      const { data: newBadge, error: bErr } = await supabase
        .from('badges')
        .insert([badgeData])
        .select()
        .single();
      
      if (bErr) throw bErr;
      
      return {
        id: newBadge.id,
        userId: newBadge.user_id,
        courseId: newBadge.course_id,
        title: newBadge.title,
        icon: newBadge.icon,
        awardedAt: newBadge.awarded_at
      };
    } catch (err: any) {
      console.error("Badge award check failed:", err?.message || err);
      return null;
    }
  },

  updateProgress: async (userId: string, lessonId: string, status: LessonStatus, score: number = 0): Promise<Badge | null> => {
    try {
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) {
        await supabase.from('lesson_progress').update({
          status,
          best_score: Math.max(existing.best_score || 0, score),
          updated_at: new Date().toISOString()
        }).eq('id', existing.id);
      } else {
        await supabase.from('lesson_progress').insert([{
          user_id: userId,
          lesson_id: lessonId,
          status,
          best_score: score,
          updated_at: new Date().toISOString()
        }]);
      }

      if (status === LessonStatus.COMPLETED) {
        const { data: lesson } = await supabase.from('lessons').select('course_id').eq('id', lessonId).single();
        if (lesson) {
          return await db.awardBadgeIfComplete(userId, lesson.course_id);
        }
      }
    } catch (err: any) {
      console.error("Update progress failed:", err?.message || err);
    }
    return null;
  }
};
