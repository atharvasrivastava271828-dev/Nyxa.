import React from 'react';

export default function ApiPublisherTerms() {
  return (
    <div className="nyxa-container max-w-3xl py-12">
      <h1 className="mb-2">API Publisher Terms</h1>
      <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Nyxa</p>
      <p className="text-xs text-[var(--muted)] mb-8">Last updated: June 2026</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>The Short Version</h2>
      <p>When you publish an API on Nyxa, you&apos;re agreeing to keep it running, charge fairly, and deliver what you promise. We handle licensing and payment. You handle the endpoint.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>1. Who This Applies To</h2>
      <p>This agreement applies to any Developer who publishes an API endpoint on the Nyxa platform for others to license and use.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>2. What You&apos;re Agreeing To</h2>
      <p>By publishing an API on Nyxa, you confirm that:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">The endpoint is functional at the time of listing</li>
        <li className="mb-1">You have the legal right to license it to others</li>
        <li className="mb-1">The API does not violate any laws or third-party rights</li>
        <li className="mb-1">Your documentation accurately describes what the API does and how to use it</li>
        <li className="mb-1">You will maintain the endpoint and notify Nyxa promptly if it goes offline or changes</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>3. Uptime and Reliability</h2>
      <p>Buyers and agents who license your API depend on it being available. You are expected to:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Maintain reasonable uptime (we recommend a minimum of 99% monthly availability)</li>
        <li className="mb-1">Notify <strong>support@nyxa.app</strong> at least 48 hours before planned downtime</li>
        <li className="mb-1">Respond to reported outages within 24 hours</li>
      </ul>
      <p>Repeated outages or unresponsive endpoints may result in your listing being suspended or removed.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>4. Pricing</h2>
      <p>You set the license price for your API. Pricing must be:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Clearly stated in your listing</li>
        <li className="mb-1">Applied consistently to all buyers</li>
        <li className="mb-1">Updated via your dashboard — not changed retroactively on active licenses</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>5. Commission</h2>
      <p>Nyxa deducts a commission from every license sold:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1"><strong>Current rate</strong>: 10–15% of the license fee</li>
        <li className="mb-1">Commission is deducted automatically before your payout is released</li>
        <li className="mb-1">Rates may change with 30 days notice</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>6. Payouts</h2>
      <p>Once a license is purchased and the key issued, your payout (license fee minus commission) is processed via Razorpay to your registered account within 2–5 business days.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>7. License Keys</h2>
      <p>When a buyer purchases a license, Nyxa issues them a key to access your endpoint. You are responsible for:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Honoring all valid keys issued through Nyxa</li>
        <li className="mb-1">Not revoking keys without notice or cause</li>
        <li className="mb-1">Reporting invalid or abused keys to <strong>support@nyxa.app</strong></li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>8. Changes to Your API</h2>
      <p>If your endpoint URL, authentication method, or core functionality changes:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Update your listing on Nyxa immediately</li>
        <li className="mb-1">Notify existing licensees via <strong>support@nyxa.app</strong> with at least 7 days notice</li>
        <li className="mb-1">Provide a migration path where possible</li>
      </ul>
      <p>Breaking changes without notice may result in dispute rulings against you and removal of your listing.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>9. Delisting</h2>
      <p>You may delist your API at any time, provided there are no active licenses that would be broken by removal. To delist, contact <strong>support@nyxa.app</strong> or remove the listing from your dashboard.</p>
      <p>Nyxa may delist your API at any time if it violates this agreement or the platform&apos;s Terms of Service.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>10. Contact</h2>
      <p>Questions about publishing your API? Email <strong>support@nyxa.app</strong></p>
    </div>
  );
}
