import React from 'react';
import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';

// Privacy page metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.privacy,
  keywords: [...seoConfigs.privacy.keywords],
  canonical: '/privacy'
});

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto">
      <h1>Privacy Policy for trulybot.xyz</h1>
      <p className="text-slate-400">Last updated: September 24, 2025</p>

      <p>
        TrulyBot ("us", "we", or "our") operates the trulybot.xyz website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect several different types of information for various purposes to provide and improve our Service to you.
      </p>
      <h3>a. Personal Data</h3>
      <p>
        While using our Service, especially during account registration and subscription, we may ask you to provide us with certain personally identifiable information ("Personal Data"). This may include:
      </p>
      <ul>
        <li>Email address</li>
        <li>First name and last name</li>
        <li>Payment information (processed securely by our payment gateway, Razorpay)</li>
      </ul>
      <h3>b. Subscriber Content</h3>
      <p>
        When you use our Service to create a chatbot, you provide us with text, documents, and other materials ("Subscriber Content") for your chatbot's knowledge base. This Content is owned by you. We will only use this Subscriber Content to provide the Service to you—specifically, to enable your chatbot to answer questions. We will never use your Subscriber Content for any other purpose, such as training other AI models, without your explicit consent.
      </p>
      <h3>c. Usage Data</h3>
      <p>
        We may also collect information on how the Service is accessed and used ("Usage Data"). This data helps us understand how our users interact with our platform, allowing us to improve functionality and user experience.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>TrulyBot uses the collected data for the following purposes:</p>
      <ul>
        <li>To provide, operate, and maintain our Service.</li>
        <li>To manage your account, subscriptions, and process payments.</li>
        <li>To provide you with customer support.</li>
        <li>To monitor the usage of our Service to prevent fraud and ensure security.</li>
        <li>To detect, prevent, and address technical issues.</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>
        The security of your data is our top priority. We use industry-standard security measures to protect your Personal Data and Subscriber Content. However, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
      </p>
      
      <h2>4. Your Data Protection Rights</h2>
      <p>
        You have the right to access, update, or delete the information we have on you. You can manage your account information directly within your dashboard settings. If you wish to permanently delete your account and all associated data, please contact our support team.
      </p>

      <h2>5. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2>6. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us via the details on our <a href="/contact" className="text-blue-400 hover:underline">Contact Page</a>.
      </p>
    </article>
  );
}