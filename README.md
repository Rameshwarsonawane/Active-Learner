🎓 Active Learner App
"Empowering your learning journey with data-driven progress."

Active Learner is a modern e-learning dashboard built using Next.js and Supabase. It provides students with a seamless way to track course completions, monitor scores, and earn verified achievement badges.

🚀 Features
Smart Dashboard: View lessons completed, active enrollments, and average scores at a glance.

Progress Tracking: Visualize course completion percentages with interactive progress bars.

Achievement System: Earn and display "Verified Alumnus" badges upon course completion.

Real-time Sync: Powered by Supabase for instantaneous progress updates and data security.

Solarized UI: A sleek, developer-friendly dark theme designed for focus and clarity.

🛠️ Tech Stack
Framework: Next.js 15 (App Router)

Database & Backend: Supabase

Language: TypeScript

Styling: Tailwind CSS

Icons: Font Awesome

🏁 Getting Started
1. Clone the repository
Bash

git clone https://github.com/Rameshwarsonawane/Active-earner.git
cd active-learner
2. Install dependencies
Bash

npm install
3. Setup Environment Variables
Create a .env.local file in the root directory and add your Supabase credentials:

Plaintext

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Run the development server
Bash

npm run dev
Open http://localhost:3000 in your browser to see the result.

📂 Project Structure
Plaintext

├── app/              # Next.js App Router (Layouts & Pages)
├── components/       # Reusable UI Components (Auth, Dashboard)
├── lib/              # Supabase client and DB utility functions
├── public/           # Static assets (images, icons)
└── types/            # TypeScript interfaces and definitions

🤝 Contributing
Contributions are welcome! If you have ideas for new features or improvements, feel free to open an issue or submit a Pull Request.

📄 License
This project is licensed under the MIT License.


Made with ❤️ by Rameshwar Sonawane

