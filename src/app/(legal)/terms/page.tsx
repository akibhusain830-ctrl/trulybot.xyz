import React from 'react';
import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';

// Terms page metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.terms,
  keywords: [...seoConfigs.terms.keywords],
  canonical: '/terms'
});

export default function TermsOfServicePage() {
  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto">
      <h1>Terms of Service for trulybot.xyz</h1>
      <p className="text-slate-400">Last updated: September 24, 2025</p>

      <p>
        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the trulybot.xyz website (the "Service") operated by TrulyBot ("us", "we", or "our"). Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.
      </p>

      <h2>1. Accounts</h2>
      <p>
        When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
      </p>

      <h2>2. Subscriptions</h2>
      <p>
        Our Service is billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set on a monthly basis.
      </p>
      <p>
        At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or TrulyBot cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting our customer support team.
      </p>

      <h2>3. User Content and Responsibility</h2>
      <p>
        Our Service allows you to provide text, documents, and other materials ("Subscriber Content") to create a knowledge base for your chatbot. You are solely responsible for the Subscriber Content, including its legality, reliability, and appropriateness. You retain all of your rights to any Subscriber Content you submit. We will not access, view, or use your Subscriber Content except as necessary to provide the Service.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are and will remain the exclusive property of TrulyBot and its licensors. The Service is protected by copyright, trademark, and other laws of India. Our trademarks may not be used in connection with any product or service without the prior written consent of TrulyBot.
      </p>
      
      <h2>5. Limitation Of Liability</h2>
      <p>
        In no event shall TrulyBot, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
      </p>

      <h2>6. Termination</h2>
      <p>
        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
      </p>

      <h2>7. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws of Karnataka, India, without regard to its conflict of law provisions.
      </p>

       <h2>8. Changes</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please <a href="/contact" className="text-blue-400 hover:underline">contact us</a>.
      </p>
    </article>
  );
}

