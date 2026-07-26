import Link from 'next/link';

export default function ApisLockedPage() {
  return (
    <div className="nyxa-container max-w-2xl py-24 text-center">
      <div className="mb-6 flex justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-[var(--muted)]">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-4 text-[var(--foreground)]">API Marketplace Locked</h1>
      <p className="text-base text-[var(--muted)] mb-8">
        We are extremely focused on streamlining our core Task experience. 
        The Enterprise API integrations are locked until Q4.
      </p>
      <Link href="/tasks" className="nyxa-btn nyxa-btn-primary px-8 py-3">
        Return to Tasks
      </Link>
    </div>
  );
}
