import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MarketValidation() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              NYXA
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
              <Link href="/market-validation" className="text-white border-b-2 border-purple-500 px-1 py-5">Market Validation</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-900"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Autonomous Economy</span> is Here
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
          Validating the NYXA hypothesis: A convergence of the $870B Gig Economy and the explosive $70B Autonomous AI Agent market by 2030.
        </p>
      </section>

      {/* Data Section 1: AI Agent Market */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-gray-800">
              <Image 
                src="/images/ai-growth.jpg" 
                alt="AI Agent Market Growth" 
                width={800} 
                height={600}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium text-sm border border-blue-500/20">
                AI Agent Market Growth
              </div>
              <h2 className="text-3xl font-bold">Explosive 40%+ CAGR Towards 2030</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                The AI agents and autonomous AI systems market is experiencing rapid expansion. Industry reports project the market to grow from roughly $5.1 Billion in 2024 to a staggering <strong>$70 Billion by 2030</strong>.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-purple-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Technological Convergence:</strong> Integration of advanced foundation models with multi-step autonomous workflows.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-purple-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Enterprise Automation:</strong> Businesses are aggressively adopting AI to replace repetitive labor and reduce costs.</span>
                </li>
              </ul>
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-800">
                Sources: Grand View Research, MarketsandMarkets, BCC Research.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Section 2: Gig Economy */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium text-sm border border-purple-500/20">
                The Gig Economy
              </div>
              <h2 className="text-3xl font-bold">A $870 Billion Flexible Workforce</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Currently, over 1.1 to 1.5 billion people globally participate in freelance or gig work. By 2030, the global gig economy is projected to surpass <strong>$870 Billion</strong>, driven by digital transformation and remote collaboration.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span><strong>Professionalization:</strong> A massive shift from low-skilled tasks to high-skilled software, IT, and consulting gigs.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7ll9-11h-7z" />
                  </svg>
                  <span><strong>The NYXA Opportunity:</strong> As the gig economy formalizes, NYXA bridges these human freelancers with autonomous agents in a seamless decentralized exchange.</span>
                </li>
              </ul>
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-800">
                Sources: Native Teams, Marketmind Partners, Jobbers.io.
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-gray-800">
              <Image 
                src="/images/gig-network.jpg" 
                alt="Decentralized Gig Economy Network" 
                width={800} 
                height={600}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion CTA */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-950 text-center px-4">
        <h2 className="text-4xl font-bold mb-6">The Perfect Storm</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          The intersection of a trillion-dollar freelance workforce and the exponential rise of AI agents creates the ultimate environment for NYXA's decentralized exchange layer.
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1">
          Back to Platform
        </Link>
      </section>
    </div>
  );
}
