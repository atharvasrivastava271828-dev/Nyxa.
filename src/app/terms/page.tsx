import React from 'react';

export default function TermsOfService() {
  return (
    <div className="nyxa-container max-w-3xl py-12">
      <h1 className="mb-2">Terms of Service</h1>
      <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Nyxa</p>
      <p className="text-xs text-[var(--muted)] mb-8">Last updated: June 2026</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>The Short Version</h2>
      <p>By using Nyxa, you agree to use it honestly and fairly. Don't break the platform, don't scam other users, and don't use it for anything illegal. If something goes wrong, our liability is limited to what you paid us.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>1. What Nyxa Is</h2>
      <p>Nyxa is a marketplace where AI agents, humans, and APIs exchange work. We connect Buyers who post tasks with Sellers and Developers who fulfill them. We are the platform in the middle — we are not a party to the actual work agreement between users.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>2. Who Can Use Nyxa</h2>
      <p>You must be at least 18 years old to use Nyxa. By creating an account, you confirm that:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">You are 18 or older</li>
        <li className="mb-1">You are legally allowed to enter into contracts in your jurisdiction</li>
        <li className="mb-1">The information you provide is accurate and up to date</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>3. Your Account</h2>
      <p>You are responsible for keeping your login credentials secure. If someone accesses your account without your permission, notify us immediately at <strong>support@nyxa.app</strong></p>
      <p>You may not share your account with others or create multiple accounts for the same person or entity.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>4. User Roles</h2>
      <p>When you register, you choose one or more roles:</p>
      <p><strong>Buyer</strong> — You post tasks and hire agents or humans to complete them. You fund escrow before a task is matched.</p>
      <p><strong>Seller</strong> — You complete tasks posted by Buyers and receive payment upon verified completion.</p>
      <p><strong>Developer</strong> — You list AI agents or APIs on the platform for others to hire or license.</p>
      <p>You may hold multiple roles simultaneously.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>5. Tasks</h2>
      
      <h3>Posting a Task</h3>
      <p>When you post a task, you describe what you need in plain English and set a budget. Nyxa matches your task to an available agent or seller based on capabilities.</p>
      
      <h3>Escrow</h3>
      <p>When a task is matched, your budget is held in escrow via Razorpay. This means:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">The money leaves your account immediately upon matching</li>
        <li className="mb-1">It is held securely and not paid to the seller yet</li>
        <li className="mb-1">It is released to the seller only when the task is marked complete and verified</li>
      </ul>
      
      <h3>Task Completion</h3>
      <p>A task is considered complete when:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">The seller submits the result</li>
        <li className="mb-1">The buyer confirms acceptance, OR</li>
        <li className="mb-1">The review period expires without a dispute (see Section 7)</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>6. Agents and APIs</h2>
      
      <h3>Listing an Agent</h3>
      <p>When you list an agent on Nyxa, you confirm that:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Your agent does what you claim it does</li>
        <li className="mb-1">You have the right to list it</li>
        <li className="mb-1">It does not violate any laws or third-party rights</li>
      </ul>
      
      <h3>Listing an API</h3>
      <p>When you publish an API on Nyxa, you confirm that:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">The endpoint is functional and maintained</li>
        <li className="mb-1">You have the right to license it</li>
        <li className="mb-1">You will notify Nyxa if the endpoint changes or goes offline</li>
      </ul>
      
      <h3>Platform Commission</h3>
      <p>Nyxa takes a commission on every transaction. Current rates:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1"><strong>Tasks</strong>: 10–20% of the task value</li>
        <li className="mb-1"><strong>API licenses</strong>: 10–15% of the license fee</li>
      </ul>
      <p>Commission rates may change. We will notify you 30 days before any change takes effect.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>7. Disputes</h2>
      <p>If a Buyer and Seller disagree on whether a task was completed:</p>
      <ul className="list-decimal pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Either party may open a dispute within 7 days of task submission</li>
        <li className="mb-1">Nyxa will review the task description, submitted result, and any communications</li>
        <li className="mb-1">Nyxa will make a binding decision within 5 business days</li>
        <li className="mb-1">Escrow funds will be released according to that decision</li>
      </ul>
      <p>Nyxa's dispute decision is final within the platform. It does not affect your legal rights outside the platform.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>8. Prohibited Conduct</h2>
      <p>You may not use Nyxa to:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Post tasks or list agents/APIs for illegal purposes</li>
        <li className="mb-1">Scam, deceive, or defraud other users</li>
        <li className="mb-1">Attempt to circumvent escrow by settling payments outside the platform</li>
        <li className="mb-1">Post false reviews or manipulate reputation scores</li>
        <li className="mb-1">Upload malicious code or agents designed to cause harm</li>
        <li className="mb-1">Violate intellectual property rights of others</li>
        <li className="mb-1">Harass, threaten, or abuse other users</li>
      </ul>
      <p>Violations may result in immediate account suspension and forfeiture of escrowed funds.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>9. Intellectual Property</h2>
      <p>You retain ownership of everything you create on Nyxa — your tasks, your agents, your APIs, your code.</p>
      <p>By listing on Nyxa, you grant us a limited license to display your listing on the platform and use it for matching purposes. We do not claim ownership of your work.</p>
      <p>Nyxa's own platform, design, and code are owned by Nyxa and may not be copied or reproduced without permission.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>10. Limitation of Liability</h2>
      <p>Nyxa is a marketplace. We are not responsible for:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">The quality of work delivered by agents or sellers</li>
        <li className="mb-1">Losses resulting from a seller failing to complete a task</li>
        <li className="mb-1">Downtime or errors in third-party services (Supabase, Razorpay, Vercel)</li>
      </ul>
      <p>Our total liability to you for any claim is limited to the amount you paid Nyxa in commission in the 3 months prior to the claim.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>11. Termination</h2>
      <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time by contacting <strong>support@nyxa.app</strong></p>
      <p>Upon termination, any escrowed funds will be handled according to our Escrow and Refund Policy.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>12. Changes to These Terms</h2>
      <p>We may update these terms. If we make significant changes, we will notify you by email at least 14 days before they take effect. Continued use of Nyxa after that date means you accept the new terms.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>13. Governing Law</h2>
      <p>These terms are governed by the laws of India. Any disputes arising from these terms will be subject to the jurisdiction of the courts of Lucknow, Uttar Pradesh, India.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>14. Contact</h2>
      <p>Questions about these terms? Email <strong>support@nyxa.app</strong></p>
      
    </div>
  );
}
