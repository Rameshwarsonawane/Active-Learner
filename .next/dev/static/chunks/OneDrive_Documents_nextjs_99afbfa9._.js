(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/OneDrive/Documents/nextjs/lib/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LessonStatus",
    ()=>LessonStatus
]);
var LessonStatus = /*#__PURE__*/ function(LessonStatus) {
    LessonStatus["NOT_STARTED"] = "Not Started";
    LessonStatus["IN_PROGRESS"] = "In Progress";
    LessonStatus["COMPLETED"] = "Completed";
    return LessonStatus;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Documents/nextjs/lib/supabaseClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/nextjs/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/nextjs/lib/types.ts [app-client] (ecmascript)");
'use client';
;
;
const SUPABASE_URL = 'https://cgacefngnxvglazqxkep.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HxvXo1grnLRK2iMdmT7SBQ_h6S69QZA';
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_KEY);
const db = {
    getCourses: async ()=>{
        const { data, error } = await supabase.from('courses').select('*').order('created_at', {
            ascending: true
        });
        if (error) throw error;
        return (data || []).map((c)=>({
                id: c.id,
                title: c.title,
                description: c.description,
                image: c.image,
                lessonCount: c.lesson_count
            }));
    },
    getCourseDetails: async (id)=>{
        const { data: course, error: cErr } = await supabase.from('courses').select('*').eq('id', id).single();
        const { data: lessons, error: lErr } = await supabase.from('lessons').select('*').eq('course_id', id).order('lesson_order', {
            ascending: true
        });
        if (cErr || lErr) throw cErr || lErr;
        const mappedLessons = (lessons || []).map((l)=>({
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
    getLesson: async (id)=>{
        const { data: lessonData, error: lErr } = await supabase.from('lessons').select('*').eq('id', id).single();
        if (lErr || !lessonData) return null;
        const { data: quizData, error: qErr } = await supabase.from('quizzes').select('*').eq('lesson_id', id).maybeSingle();
        let mappedQuiz = undefined;
        if (quizData) {
            const { data: questionsData, error: qnErr } = await supabase.from('questions').select('*').eq('quiz_id', quizData.id);
            if (!qnErr && questionsData && questionsData.length > 0) {
                mappedQuiz = {
                    id: quizData.id,
                    lessonId: quizData.lesson_id,
                    title: quizData.title || 'Lesson Quiz',
                    questions: questionsData.map((q)=>({
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
    getEnrollments: async (userId)=>{
        const { data, error } = await supabase.from('enrollments').select('*').eq('user_id', userId);
        if (error) throw error;
        return (data || []).map((e)=>({
                id: e.id,
                userId: e.user_id,
                courseId: e.course_id,
                enrolledAt: e.enrolled_at
            }));
    },
    enroll: async (userId, courseId)=>{
        await supabase.from('enrollments').upsert([
            {
                user_id: userId,
                course_id: courseId
            }
        ], {
            onConflict: 'user_id,course_id'
        });
    },
    getProgress: async (userId)=>{
        const { data, error } = await supabase.from('lesson_progress').select('*').eq('user_id', userId);
        if (error) throw error;
        return (data || []).map((p)=>({
                id: p.id,
                userId: p.user_id,
                lessonId: p.lesson_id,
                status: p.status,
                bestScore: p.best_score,
                updatedAt: p.updated_at
            }));
    },
    getBadges: async (userId)=>{
        const { data, error } = await supabase.from('badges').select('*').eq('user_id', userId);
        if (error) return [];
        return (data || []).map((b)=>({
                id: b.id,
                userId: b.user_id,
                courseId: b.course_id,
                title: b.title,
                icon: b.icon,
                awardedAt: b.awarded_at
            }));
    },
    awardBadgeIfComplete: async (userId, courseId)=>{
        try {
            // 1. Verify all lessons are actually completed
            const { data: allLessons, error: lErr } = await supabase.from('lessons').select('id').eq('course_id', courseId);
            if (lErr || !allLessons || allLessons.length === 0) return null;
            const { data: completedProgress, error: pErr } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId).eq('status', __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonStatus"].COMPLETED).in('lesson_id', allLessons.map((l)=>l.id));
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
            const { data: existingBadge } = await supabase.from('badges').select('*').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
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
            const { data: newBadge, error: bErr } = await supabase.from('badges').insert([
                badgeData
            ]).select().single();
            if (bErr) throw bErr;
            return {
                id: newBadge.id,
                userId: newBadge.user_id,
                courseId: newBadge.course_id,
                title: newBadge.title,
                icon: newBadge.icon,
                awardedAt: newBadge.awarded_at
            };
        } catch (err) {
            console.error("Badge award check failed:", err?.message || err);
            return null;
        }
    },
    updateProgress: async (userId, lessonId, status, score = 0)=>{
        try {
            const { data: existing } = await supabase.from('lesson_progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
            if (existing) {
                await supabase.from('lesson_progress').update({
                    status,
                    best_score: Math.max(existing.best_score || 0, score),
                    updated_at: new Date().toISOString()
                }).eq('id', existing.id);
            } else {
                await supabase.from('lesson_progress').insert([
                    {
                        user_id: userId,
                        lesson_id: lessonId,
                        status,
                        best_score: score,
                        updated_at: new Date().toISOString()
                    }
                ]);
            }
            if (status === __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonStatus"].COMPLETED) {
                const { data: lesson } = await supabase.from('lessons').select('course_id').eq('id', lessonId).single();
                if (lesson) {
                    return await db.awardBadgeIfComplete(userId, lesson.course_id);
                }
            }
        } catch (err) {
            console.error("Update progress failed:", err?.message || err);
        }
        return null;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Documents/nextjs/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/nextjs/lib/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/nextjs/lib/supabaseClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
function Page() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Page.useEffect": ()=>{
            setUser({
                id: 'u1',
                name: 'Learner',
                email: 'test@example.com'
            });
        }
    }["Page.useEffect"], []);
    const handleSelectCourse = (id)=>{
        console.log("Selected Course:", id);
    };
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-screen bg-[#002b36]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin text-[#268bd2] text-3xl",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                    className: "fa-solid fa-circle-notch"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                    lineNumber: 22,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                lineNumber: 21,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Dashboard, {
        user: user,
        onSelectCourse: handleSelectCourse
    }, void 0, false, {
        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, this);
}
_s(Page, "5s2qRsV95gTJBmaaTh11GoxYeGE=");
_c = Page;
const Dashboard = ({ user, onSelectCourse })=>{
    _s1();
    const [courses, setCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [enrollments, setEnrollments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [badges, setBadges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [allLessons, setAllLessons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isSyncing, setIsSyncing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchData = async ()=>{
        try {
            setLoading(true);
            const [c, e, p, b] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].getCourses(),
                __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].getEnrollments(user.id),
                __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].getProgress(user.id),
                __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].getBadges(user.id)
            ]);
            setCourses(c);
            setEnrollments(e);
            setProgress(p);
            setBadges(b);
            const { data: lessonData } = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('*');
            if (lessonData) {
                setAllLessons(lessonData.map((l)=>({
                        id: l.id,
                        courseId: l.course_id,
                        title: l.title,
                        content: l.content,
                        order: l.lesson_order
                    })));
            }
        } catch (err) {
            console.error("Error loading dashboard:", err);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            fetchData();
        }
    }["Dashboard.useEffect"], [
        user.id
    ]);
    const syncBadges = async ()=>{
        if (enrollments.length === 0 || allLessons.length === 0) return;
        setIsSyncing(true);
        let changed = false;
        try {
            for (const enrollment of enrollments){
                const hasBadge = badges.some((b)=>b.courseId === enrollment.courseId);
                if (!hasBadge) {
                    const courseLessons = allLessons.filter((l)=>l.courseId === enrollment.courseId);
                    if (courseLessons.length > 0) {
                        const completedInCourse = progress.filter((p)=>p.status === __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonStatus"].COMPLETED && courseLessons.some((cl)=>cl.id === p.lessonId));
                        if (completedInCourse.length === courseLessons.length) {
                            const awarded = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].awardBadgeIfComplete(user.id, enrollment.courseId);
                            if (awarded) changed = true;
                        }
                    }
                }
            }
            if (changed) {
                const freshBadges = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].getBadges(user.id);
                setBadges(freshBadges);
            }
        } catch (err) {
            console.error("Badge sync failed:", err);
        } finally{
            setIsSyncing(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            if (!loading && enrollments.length > 0 && allLessons.length > 0) {
                syncBadges();
            }
        }
    }["Dashboard.useEffect"], [
        loading,
        enrollments.length,
        allLessons.length
    ]);
    const getCourseStats = (courseId)=>{
        const courseLessons = allLessons.filter((l)=>l.courseId === courseId);
        const total = courseLessons.length;
        if (total === 0) return {
            completedCount: 0,
            total: 0,
            percent: 0
        };
        const completedCount = progress.filter((p)=>p.status === __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonStatus"].COMPLETED && courseLessons.some((cl)=>cl.id === p.lessonId)).length;
        return {
            completedCount,
            total,
            percent: Math.min(100, Math.round(completedCount / total * 100))
        };
    };
    const enrolledCourses = enrollments.map((e)=>courses.find((c)=>c.id === e.courseId)).filter(Boolean);
    const completedLessons = progress.filter((p)=>p.status === __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonStatus"].COMPLETED);
    const averageScore = completedLessons.length > 0 ? Math.round(completedLessons.reduce((acc, curr)=>acc + curr.bestScore, 0) / completedLessons.length) : 0;
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center h-[50vh]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                    className: "fa-solid fa-circle-notch animate-spin text-[#268bd2] text-3xl"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                    lineNumber: 141,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] font-bold text-[#586e75] uppercase tracking-widest",
                    children: "Retrieving Progress..."
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
            lineNumber: 140,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-20 bg-[#002b36] min-h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex flex-col md:flex-row md:items-end justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-[#eee8d5]",
                                children: [
                                    "Hello, ",
                                    user.name
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#586e75] mt-1 font-medium italic",
                                children: "welcome back."
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            fetchData();
                            syncBadges();
                        },
                        className: "flex items-center gap-2 text-[10px] font-bold text-[#586e75] hover:text-[#268bd2] uppercase tracking-widest transition-colors group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: `fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin' : ''}`
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            isSyncing ? 'Syncing Achievement Data...' : 'Refresh Progress'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                lineNumber: 149,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-3 gap-6",
                children: [
                    {
                        label: 'Lessons Completed',
                        value: completedLessons.length
                    },
                    {
                        label: 'Courses Enrolled',
                        value: enrolledCourses.length
                    },
                    {
                        label: 'Average Score',
                        value: `${averageScore}%`
                    }
                ].map((stat, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 bg-[#073642] border border-[#586e75]/20 rounded-2xl flex items-center justify-between",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] font-bold text-[#586e75] uppercase tracking-widest mb-1",
                                    children: stat.label
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                    lineNumber: 171,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-3xl font-bold text-[#eee8d5]",
                                    children: stat.value
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                    lineNumber: 172,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                            lineNumber: 170,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, i, false, {
                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                        lineNumber: 169,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-[#eee8d5] mb-8",
                        children: "My Active Courses"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-8",
                        children: enrolledCourses.map((course)=>{
                            const stats = getCourseStats(course.id);
                            const badge = badges.find((b)=>b.courseId === course.id);
                            const isFinished = stats.percent === 100;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>onSelectCourse(course.id),
                                className: `bg-[#073642] p-8 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col ${isFinished ? 'border-[#859900]/40' : 'border-[#586e75]/20 hover:border-[#268bd2]/50'}`,
                                children: [
                                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-4 right-4 text-3xl",
                                        children: badge.icon
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 27
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-bold text-[#eee8d5] mb-2",
                                        children: course.title
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                        lineNumber: 195,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[#839496] text-sm mb-6 line-clamp-2",
                                        children: course.description
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                        lineNumber: 196,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full bg-[#002b36] h-1.5 rounded-full overflow-hidden",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `h-full transition-all duration-1000 ${isFinished ? 'bg-[#859900]' : 'bg-[#268bd2]'}`,
                                            style: {
                                                width: `${stats.percent}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                            lineNumber: 198,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, course.id, true, {
                                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                                lineNumber: 187,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0));
                        })
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Documents/nextjs/app/page.tsx",
        lineNumber: 148,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(Dashboard, "8f+dhNjd7XzCWRgNwVYlbYC0Sc0=");
_c1 = Dashboard;
var _c, _c1;
__turbopack_context__.k.register(_c, "Page");
__turbopack_context__.k.register(_c1, "Dashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=OneDrive_Documents_nextjs_99afbfa9._.js.map