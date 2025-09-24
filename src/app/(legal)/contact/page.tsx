import React from 'react';

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
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-blue-400">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <div className="mt-2 text-slate-400 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
          We're here to help and answer any question you might have. We look forward to hearing from you.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-1 gap-8">
        {/* --- Card for Email & Phone --- */}
        <ContactCard icon={<MailIcon />} title="Support & Inquiries">
          <p>
            For any questions regarding your account, billing, technical support, or enterprise plans, please reach out to our team.
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
                +91 9101361482
              </span>
            </a>
          </div>
        </ContactCard>

        {/* --- Card for Physical Address --- */}
        <ContactCard icon={<BuildingIcon />} title="Our Office">
          <address className="not-italic">
            TrulyBot Pvt. Ltd.<br />
            MG Path, Christian Basti<br />
            Guwahati, Assam 781005<br />
            India
          </address>
        </ContactCard>
      </div>
    </div>
  );
}