import React from 'react';
import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';

// About page metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.about,
  keywords: [...seoConfigs.about.keywords],
  canonical: '/about'
});

// --- SVG Icons for a professional, branded look ---
const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.1S5.21 15.66 4.5 16.5z" />
    <path d="M12.5 13.5C12 13 7 4 7 4s9 5 8.5 5.5c.55.55 2.5-1.5 2.5-1.5s-2 2-1.5 2.5z" />
    <path d="m21.5 21.5-3-3" />
    <path d="M9.5 14.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.1S10.21 13.66 9.5 14.5z" />
  </svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function AboutPage() {
  const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <article className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-blue-400">{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-2 text-slate-400">{children}</p>
        </div>
      </div>
    </article>
  );

  return (
    <main className="max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 512 512" 
            fill="none"
            className="inline-block mr-2 -mt-2"
          >
            <defs>
              <linearGradient id="aboutHeaderLightning" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <polygon 
              fill="url(#aboutHeaderLightning)"
              points="320,8 136,296 248,296 192,504 400,216 288,216"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon 
              fill="#ffffff"
              opacity="0.3"
              points="310,20 146,290 240,290 200,480 380,220 280,220"
            />
          </svg>
          About TrulyBot - Lightning-Fast AI Chatbot Innovation
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-400">
          We are on a mission to revolutionize customer support for businesses worldwide by providing an intelligent, lightning-fast, and easy-to-use AI chatbot solution with thunderbolt speed.
        </p>
      </header>

      <section className="mt-16 text-left">
        <h2 className="text-3xl font-bold tracking-tight text-white">Our Story: Revolutionizing AI Customer Support</h2>
        <p className="mt-4 text-slate-400">
          TrulyBot was founded on a simple but powerful idea: every business, regardless of size, deserves access to world-class AI technology with lightning-fast response times. We saw countless online stores and scaling brands struggling to keep up with repetitive customer inquiries, losing valuable time and potential sales. Traditional support solutions were often too complex, expensive, or not tailored to their unique needs.
        </p>
        <p className="mt-4 text-slate-400">
          We built trulybot.xyz to bridge that gap with thunderbolt-speed AI responses. Our platform is more than just a chatbot; it's a dedicated AI partner trained on your specific business knowledge. By grounding every answer in your own documents—from FAQs to complex policies—we ensure accuracy and build trust with your customers, turning routine support interactions into positive brand experiences.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold tracking-tight text-center text-white">Our Core Philosophy: Speed, Accuracy, Growth</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon={<ZapIcon />} title="⚡ Lightning Speed & Simplicity">
            We believe powerful technology should be accessible with thunderbolt speed. You can set up and embed your custom-trained chatbot in minutes, not weeks, without needing a team of developers.
          </FeatureCard>
          <FeatureCard icon={<ShieldIcon />} title="Accuracy & Trust">
            Hallucinations have no place in customer support. Our system prioritizes answers from your own knowledge base, ensuring every response is accurate and grounded in truth with lightning-fast reliability.
          </FeatureCard>
          <FeatureCard icon={<RocketIcon />} title="Empowering Growth">
            By automating repetitive support tasks with AI speed, we free up your team to focus on what matters most: growing your business, innovating your products, and building real customer relationships.
          </FeatureCard>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold tracking-tight text-center text-white">Why Choose TrulyBot AI Chatbot?</h2>
        <div className="mt-8 space-y-6 text-slate-400">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Industry-Leading Performance</h3>
            <p>Join businesses using TrulyBot to reduce support tickets by 70% and increase leads by 5X with lightning-fast AI responses.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">⚡ Thunderbolt-Speed Deployment</h3>
            <p>Get your AI chatbot up and running in just 5 minutes with our intuitive setup process and instant integration capabilities.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">🎯 Targeted for E-commerce Success</h3>
            <p>Specifically designed for online stores, SaaS platforms, and digital businesses to maximize conversions and customer satisfaction.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

