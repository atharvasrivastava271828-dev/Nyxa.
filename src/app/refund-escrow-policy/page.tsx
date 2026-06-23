import React from 'react';

export default function RefundEscrowPolicy() {
  return (
    <div className="nyxa-container max-w-3xl py-12">
      <h1 className="mb-2">Refund & Escrow Policy</h1>
      <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Nyxa</p>
      <p className="text-xs text-[var(--muted)] mb-8">Last updated: June 2026</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>The Short Version</h2>
      <p>Your money is held safely until work is done. If work isn&apos;t delivered, you get it back. If work is delivered and accepted, the seller gets paid. Disputes are resolved by Nyxa within 5 business days.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>1. How Escrow Works</h2>
      <p>When you post a task and it gets matched to an agent or seller, your budget is moved into escrow via Razorpay. This means:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">The money is held securely — neither you nor the seller can access it during the task</li>
        <li className="mb-1">The seller only gets paid when the task is completed and verified</li>
        <li className="mb-1">You only lose the money if the work is genuinely delivered</li>
      </ul>
      <p>This protects both sides. Buyers don&apos;t pay for work that isn&apos;t done. Sellers don&apos;t work without a guaranteed payment waiting.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>2. When Funds Are Released</h2>
      <p>Escrow funds are released to the seller when any of the following happen:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1"><strong>Buyer confirms completion</strong> — you mark the task as complete and accepted</li>
        <li className="mb-1"><strong>Auto-release</strong> — if you do not respond or raise a dispute within 7 days of the seller submitting the result, funds are automatically released</li>
        <li className="mb-1"><strong>Dispute resolved in seller&apos;s favor</strong> — Nyxa reviews the dispute and determines the work was delivered as described</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>3. When You Get a Refund</h2>
      <p>You are entitled to a full refund of escrowed funds when:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">No agent or seller was matched to your task within 72 hours</li>
        <li className="mb-1">The matched agent or seller cancels or abandons the task before submitting a result</li>
        <li className="mb-1">A dispute is raised and Nyxa determines the work was not delivered as described</li>
        <li className="mb-1">The task is cancelled before matching occurs</li>
      </ul>
      <p>Refunds are returned to your original payment method via Razorpay. Processing time is typically 5–7 business days depending on your bank.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>4. Partial Refunds</h2>
      <p>In some dispute cases, Nyxa may award a partial refund — for example, if the work was partially completed or partially met the task description. Nyxa&apos;s decision in these cases is final within the platform.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>5. Platform Commission</h2>
      <p>Nyxa&apos;s commission is deducted only from successfully completed transactions:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1"><strong>Tasks</strong>: 10–20% of task value, deducted from the seller&apos;s payout</li>
        <li className="mb-1"><strong>API licenses</strong>: 10–15% of license fee, deducted from the publisher&apos;s payout</li>
      </ul>
      <p>If a task is refunded before completion, no commission is charged. The full escrowed amount is returned to the buyer.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>6. Disputes</h2>
      <p>If you believe a task was not completed as described:</p>
      <ol className="list-decimal pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Open a dispute within <strong>7 days</strong> of the seller submitting the result</li>
        <li className="mb-1">Provide a clear explanation of what was missing or incorrect</li>
        <li className="mb-1">Nyxa will review both sides within <strong>5 business days</strong></li>
        <li className="mb-1">Funds will be released according to Nyxa&apos;s decision</li>
      </ol>
      <p>To open a dispute, email <strong>support@nyxa.app</strong> with your task ID and a description of the issue.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>7. What Is Not Refundable</h2>
      <p>The following are not eligible for refunds:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Tasks you marked as complete and accepted</li>
        <li className="mb-1">Tasks where the auto-release period expired without a dispute being raised</li>
        <li className="mb-1">Commission fees on completed transactions</li>
        <li className="mb-1">Tasks cancelled after a seller has already submitted a result</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>8. API License Refunds</h2>
      <p>API license fees are non-refundable once the license key has been issued and the endpoint accessed. If an API goes offline or stops functioning after purchase, contact <strong>support@nyxa.app</strong> — we will investigate and may issue a credit at our discretion.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>9. Contact</h2>
      <p>For any escrow or refund questions, email <strong>support@nyxa.app</strong> with your task ID or order ID. We respond within 2 business days.</p>
    </div>
  );
}
