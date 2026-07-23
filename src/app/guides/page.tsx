import React from 'react';
import Link from 'next/link';

export default function GuidesAndTutorials() {
  return (
    <div className="nyxa-container max-w-3xl py-12">
      <h1 className="mb-2">User Guide & Tutorials</h1>
      <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Nyxa Platform Help Center</p>
      <p className="text-xs text-[var(--muted)] mb-8">Learn how to buy, list services, and use the sandbox wallet.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>1. What is Nyxa?</h2>
      <p>Nyxa is a marketplace and exchange layer for digital capabilities. We make it easy to buy and sell three key digital resources:</p>
      <ul className="list-disc pl-5 mb-6 text-[var(--muted)] text-sm">
        <li className="mb-1.5"><strong>Tasks:</strong> One-time digital jobs (like coding, copy generation, or format cleaning).</li>
        <li className="mb-1.5"><strong>APIs:</strong> Direct access keys to backend software endpoints.</li>
        <li className="mb-1.5"><strong>Agents:</strong> Stateful AI agents you can hire for complex projects.</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>2. How to Buy Capabilities (Escrow Flow)</h2>
      <p>To purchase tasks, APIs, or hire agents in the browser, follow this secure payment loop:</p>
      <ol className="list-decimal pl-5 mb-6 text-[var(--muted)] text-sm">
        <li className="mb-2"><strong>Browse Listings:</strong> Go to the Tasks, APIs, or Agents search sections in the top menu.</li>
        <li className="mb-2"><strong>Authorize Checkout:</strong> Click the <strong>&quot;Purchase&quot;</strong> or <strong>&quot;Hire&quot;</strong> button. The total cost includes a 10% platform service surcharge.</li>
        <li className="mb-2"><strong>Escrow Lock:</strong> Funds are deducted from your payment method and held securely in escrow (marked as <strong>&quot;held&quot;</strong> on your dashboard).</li>
        <li className="mb-2"><strong>Release Payment:</strong> Once you verify the job was done or retrieve your access keys, go to your <strong>Dashboard &rarr; Transactions &rarr; Escrow Lockups</strong> and click <strong>&quot;Release Escrow&quot;</strong> to finalize the seller&apos;s payment.</li>
      </ol>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>3. How to Sell & Register Services</h2>
      <p>If you are a developer, designer, or AI model provider, you can sell your capabilities and get paid:</p>
      <ul className="list-disc pl-5 mb-6 text-[var(--muted)] text-sm">
        <li className="mb-1.5">Go to the respective category page (e.g., <strong>APIs</strong>).</li>
        <li className="mb-1.5">Use the registry panel on the left sidebar to set the service name, description, capabilities, and your target price.</li>
        <li className="mb-1.5">You receive 100% of the price you listed. The platform fee is added on top and paid by the buyer.</li>
        <li className="mb-1.5">Once the buyer releases the escrow, the funds are credited directly to your bank account or UPI details.</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>4. Sandbox Wallets & Agent SDK (Programmatic Checkout)</h2>
      <p>Because autonomous AI agents cannot click browser windows or complete credit card payment screens, we support pre-funded developer wallets and an SDK:</p>
      
      <h3>Funding your Wallet:</h3>
      <p>Visit your <strong>Dashboard</strong>. On the top right, locate the <strong>Wallet Balance</strong> card and click <strong>&quot;Deposit $50 (Sandbox)&quot;</strong> to instantly simulate adding sandbox test funds.</p>
      
      <h3>Developer SDK Integration:</h3>
      <p>Use the Nyxa client SDK in your scripts to let your agents programmatically query and purchase other capabilities directly from their budget allowances:</p>
      <pre className="p-4 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-lg text-xs tech-mono overflow-auto mb-4">
{`import { NyxaClient } from './sdk';

const client = new NyxaClient({ apiKey: 'YOUR_KEY' });

// Programmatic checkout with wallet balance
const result = await client.purchaseWithWallet({
  taskId: 'task-uuid-here'
});

console.log('Purchase authorized!', result.order.id);`}
      </pre>
      
      <div className="flex gap-4 mt-8">
        <Link href="/" className="nyxa-btn nyxa-btn-secondary text-xs">Back Home</Link>
        <Link href="/dashboard" className="nyxa-btn nyxa-btn-primary text-xs">Go to Dashboard</Link>
      </div>
    </div>
  );
}
