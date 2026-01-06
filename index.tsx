
// "use client";

// import React, { useState, useEffect } from 'react';
// import ReactDOM from 'react-dom/client';
// import { User, ViewPath } from './lib/types.ts';
// import { Navbar } from './components/Navbar.tsx';
// import { LoginForm } from './components/Auth/LoginForm.tsx';
// import { Dashboard } from './app/page.tsx';
// import { CoursesList } from './app/courses/page.tsx';
// import { CourseDetail } from './app/courses/[courseId]/page.tsx';
// import { LessonPlayer } from './app/courses/[courseId]/lessons/[lessonId]/page.tsx';
// import { supabase } from './lib/supabaseClient.ts';

// const Root: React.FC = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [view, setView] = useState<ViewPath>('dashboard');
//   const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
//   const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
//   const [isInitializing, setIsInitializing] = useState(true);

//   useEffect(() => {
//     // 1. Initial check for an existing session
//     const checkSession = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session?.user) {
//         setUser({
//           id: session.user.id,
//           email: session.user.email || '',
//           name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Learner'
//         });
//         setView('dashboard');
//       } else {
//         setView('login');
//       }
//       setIsInitializing(false);
//     };

//     checkSession();

//     // 2. Listen for auth changes (login, logout, session refresh)
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'SIGNED_IN' && session?.user) {
//         setUser({
//           id: session.user.id,
//           email: session.user.email || '',
//           name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Learner'
//         });
//         if (view === 'login' || view === 'register') setView('dashboard');
//       } else if (event === 'SIGNED_OUT') {
//         setUser(null);
//         setView('login');
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//   };

//   const navigateToCourse = (id: string) => {
//     setSelectedCourseId(id);
//     setView('course-detail');
//   };

//   const navigateToUnit = (id: string) => {
//     setSelectedLessonId(id);
//     setView('lesson-player');
//   };

//   if (isInitializing) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-[#002b36]">
//         <div className="flex flex-col items-center gap-4">
//           <i className="fa-solid fa-circle-notch animate-spin text-[#268bd2] text-2xl"></i>
//           <span className="font-bold text-[#586e75] uppercase tracking-widest text-xs">Connecting to Cloud...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#002b36] text-[#839496] selection:bg-[#073642] selection:text-[#eee8d5]">
//       {view !== 'lesson-player' && user && (
//         <Navbar 
//           user={user} 
//           onLogout={handleLogout} 
//           onNavigate={setView} 
//         />
//       )}
      
//       <main className="animate-in fade-in duration-500">
//         {!user ? (
//            <LoginForm />
//         ) : (
//           <>
//             {view === 'dashboard' && (
//               <Dashboard 
//                 user={user} 
//                 onSelectCourse={navigateToCourse} 
//               />
//             )}

//             {view === 'courses-list' && (
//               <CoursesList 
//                 user={user} 
//                 onSelectCourse={navigateToCourse} 
//               />
//             )}
            
//             {view === 'course-detail' && selectedCourseId && (
//               <CourseDetail 
//                 userId={user.id} 
//                 courseId={selectedCourseId} 
//                 onBack={() => setView('courses-list')} 
//                 onSelectLesson={navigateToUnit} 
//               />
//             )}

//             {view === 'lesson-player' && selectedLessonId && (
//               <LessonPlayer 
//                 lessonId={selectedLessonId} 
//                 userId={user.id} 
//                 onBack={() => setView('course-detail')} 
//               />
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// const rootElement = document.getElementById('root');
// if (rootElement) {
//   const root = ReactDOM.createRoot(rootElement);
//   root.render(<Root />);
// }
