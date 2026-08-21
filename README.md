# Active Learner

Active Learner is an online course platform where users can browse available courses, enroll in the ones they're interested in, and track their learning progress from start to finish. Once a course is completed, the platform automatically generates a certificate for the learner — making the whole learning journey simple and rewarding.

🔗 **GitHub Repo:** [Active Learner](https://github.com/Rameshwarsonawane/Active-Learner)
🌐 **Live Demo:** [activelearner.vercel.app](https://activelearner.vercel.app/)
🔑 **Demo Login:** `sonwanerameshwar@gmail.com` / `1234567890`

---

## 📌 About the Project

Active Learner was built to explore what a real-world e-learning platform looks like under the hood — from course browsing and enrollment to progress tracking and certificate generation. It focuses on giving learners a smooth, motivating experience while keeping the codebase clean and scalable using modern web technologies.

---

## ✨ Features

- **Course Browsing** – Users can explore a catalog of available courses.
- **Course Enrollment** – Simple, one-click enrollment into any course.
- **Progress Tracking** – Learners can see how far along they are in a course.
- **Auto-Generated Certificates** – Once a course is completed, a certificate is automatically generated for the learner.
- **Secure Authentication** – Login system powered by Supabase to manage user sessions safely.
- **Responsive Design** – Fully responsive UI built with Tailwind CSS for a smooth experience on any device.

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js
- TypeScript
- Tailwind CSS

**Backend & Database:**
- Supabase (Auth + Database)

**Deployment:**
- Vercel

---

## ⚙️ How It Works

1. Users sign up or log in through Supabase authentication.
2. They browse the list of available courses on the dashboard.
3. Users enroll in any course they're interested in.
4. As they progress, their completion status is tracked and updated.
5. Once a course is fully completed, a certificate is automatically generated for the learner.

---

## 🚀 Getting Started

To run this project locally:

1. Clone the repository
   ```bash
   git clone https://github.com/Rameshwarsonawane/Active-Learner.git
   ```
2. Install dependencies
   ```bash
   cd Active-Learner
   npm install
   ```
3. Set up your Supabase project and add your credentials to a `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

---

## 📽️ Demo

Try it live here: [Active Learner](https://activelearner.vercel.app/)
Use the demo credentials above to log in and explore the platform.

---

## 👤 Author

**Rameshwar Sonawane**
📧 sonawanerameshwar1104@gmail.com

---

## 📄 License

This project is open for learning and reference purposes. Feel free to explore the code and reach out if you have any questions.
