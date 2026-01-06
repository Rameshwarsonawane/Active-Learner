import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Active Learner',
  description: 'Your learning journey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#002b36] text-[#839496] font-['Inter']">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}