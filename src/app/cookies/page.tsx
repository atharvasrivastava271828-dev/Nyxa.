import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="nyxa-container max-w-3xl py-12">
      <h1 className="mb-2">Cookie Policy</h1>
      <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Nyxa</p>
      <p className="text-xs text-[var(--muted)] mb-8">Last updated: June 2026</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>The Short Version</h2>
      <p>We use cookies and local storage only to keep you logged in and remember your display preferences. No tracking. No advertising. No third-party data sharing.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>1. What Are Cookies</h2>
      <p>Cookies are small files stored in your browser. Local storage works similarly — it stores small pieces of data on your device. Both are used to remember things between visits so you don't have to re-enter information every time.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>2. What We Store and Why</h2>
      <div className="nyxa-table-wrapper rounded-lg mb-4">
        <table className="nyxa-table">
          <thead>
            <tr>
              <th>What</th>
              <th>Where</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tech-mono text-[10px]">nyxa_user_id</td>
              <td>Local storage</td>
              <td>Keeps you logged in</td>
            </tr>
            <tr>
              <td className="tech-mono text-[10px]">nyxa_user_name</td>
              <td>Local storage</td>
              <td>Displays your name on the platform</td>
            </tr>
            <tr>
              <td className="tech-mono text-[10px]">nyxa_user_roles</td>
              <td>Local storage</td>
              <td>Remembers your role (Buyer, Seller, Developer)</td>
            </tr>
            <tr>
              <td className="tech-mono text-[10px]">nyxa_theme</td>
              <td>Local storage</td>
              <td>Remembers your light or dark mode preference</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>That&apos;s it. We store nothing else on your device.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>3. What We Don&apos;t Use</h2>
      <p>We do not use:</p>
      <ul className="list-disc pl-5 mb-4 text-[var(--muted)]">
        <li className="mb-1">Advertising cookies</li>
        <li className="mb-1">Tracking pixels</li>
        <li className="mb-1">Analytics cookies from third parties (Google Analytics, Meta Pixel, etc.)</li>
        <li className="mb-1">Any cookie that follows you outside of Nyxa</li>
      </ul>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>4. Third-Party Services</h2>
      <p>Two third-party services may set their own cookies when you use Nyxa:</p>
      <p><strong>Razorpay</strong> — when you make or receive a payment, Razorpay may store session data to process the transaction securely. This is governed by Razorpay&apos;s own privacy policy.</p>
      <p><strong>Supabase</strong> — our database provider may set technical cookies for session management. This is governed by Supabase&apos;s own privacy policy.</p>
      <p>We do not control these cookies and they are used solely to operate core platform functionality.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>5. How to Clear Cookies and Local Storage</h2>
      <p>You can clear all stored data at any time:</p>
      <p><strong>In Chrome</strong>: Settings → Privacy and Security → Clear browsing data → Cookies and site data</p>
      <p><strong>In Firefox</strong>: Settings → Privacy & Security → Cookies and Site Data → Clear Data</p>
      <p><strong>In Safari</strong>: Settings → Safari → Clear History and Website Data</p>
      <p>Clearing local storage will log you out of Nyxa. Your account and data are not deleted — just your local session.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>6. Changes to This Policy</h2>
      <p>If we start using new types of cookies or local storage, we will update this policy and notify you. The date at the top of this page reflects the most recent update.</p>
      
      <hr className="border-t border-[var(--border)] my-8" />
      
      <h2>7. Contact</h2>
      <p>Questions? Email <strong>privacy@nyxa.app</strong></p>
    </div>
  );
}
