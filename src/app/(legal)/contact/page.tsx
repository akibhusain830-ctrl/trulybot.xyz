import React from 'react';
import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';
import { localBusinessSchema } from '@/lib/schema';

// Contact page metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.contact,
  keywords: [...seoConfigs.contact.keywords],
  canonical: '/contact'
});

// --- SVG Icons for a professional look ---
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459L.057 24zM12 21.8c5.42 0 9.8-4.38 9.8-9.8S17.42 2.2 12 2.2 2.2 6.58 2.2 12c0 1.79.46 3.52 1.32 5.01l-1.01 3.66 3.78-1.02a9.75 9.75 0 0 0 5.7 1.51z"/>
    </svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" />
  </svg>
);

export default function ContactPage() {
  // --- Contact Card Component for a consistent, sleek look ---
  const ContactCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <article className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-blue-400">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <div className="mt-2 text-slate-400 space-y-2">{children}</div>
        </div>
      </div>
    </article>
  );

  return (
    <>
      {/* Local Business Schema for Enhanced SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
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
              <linearGradient id="contactHeaderLightning" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <polygon 
              fill="url(#contactHeaderLightning)"
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
          Get Lightning-Fast Support
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
          Contact TrulyBot for thunderbolt-speed support and demos. We're here to help and answer any question you might have about our AI chatbot platform.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-1 gap-8">
        {/* --- Card for Email & Phone --- */}
        <ContactCard icon={<MailIcon />} title="⚡ Support & Inquiries - Lightning-Fast Response">
          <p>
            For any questions regarding your AI chatbot, billing, technical support, or enterprise plans, our team provides thunderbolt-speed assistance.
          </p>
          <div className="text-base">
            <a href="mailto:infotrulybot@gmail.com" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              infotrulybot@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <a href="https://wa.me/919101361482" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
              <WhatsAppIcon />
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                +91 9101361482 (WhatsApp)
              </span>
            </a>
          </div>
        </ContactCard>

        {/* --- Card for Physical Address --- */}
        <ContactCard icon={<BuildingIcon />} title="🏢 Our Office - TrulyBot Headquarters">
          <address className="not-italic">
            TrulyBot Pvt. Ltd.<br />
            MG Path, Christian Basti<br />
            Guwahati, Assam 781005<br />
            India
          </address>
          <p className="mt-2 text-sm">Headquarters for lightning-fast AI chatbot development and customer support innovation.</p>
        </ContactCard>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold tracking-tight text-center text-white mb-8">⚡ Quick Contact Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Sales & Demos</h3>
            <p className="text-slate-400">Get a personalized demo of our lightning-fast AI chatbot</p>
          </div>
          <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">⚡ Technical Support</h3>
            <p className="text-slate-400">Thunderbolt-speed assistance with setup and integration</p>
          </div>
          <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">💼 Enterprise Plans</h3>
            <p className="text-slate-400">Custom AI chatbot solutions for large-scale businesses</p>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
