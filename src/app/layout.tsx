import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYXA - The Exchange Layer for the AI Economy',
  description: 'Marketplace platform for Tasks, Agents, and APIs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ borderBottom: '1px solid #ccc', padding: '1rem', display: 'flex', gap: '1rem' }}>
          <a href="/"><strong>NYXA</strong></a>
          <a href="/tasks">Tasks</a>
          <a href="/agents">Agents</a>
          <a href="/apis">APIs</a>
          <a href="/dashboard">Dashboard</a>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </div>
        </header>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
