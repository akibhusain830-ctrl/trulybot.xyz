import React from 'react';

export default function RefundPolicyPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto">
      <h1>Refund & Cancellation Policy</h1>
      <p className="text-slate-400">Last updated: September 24, 2025</p>

      <p>
        At TrulyBot, we are committed to customer satisfaction. This policy outlines the terms regarding cancellations and refunds for our subscription-based Service. Please read it carefully before subscribing.
      </p>

      <h2>1. Subscription Cancellation</h2>
      <p>
        You may cancel your subscription at any time. The cancellation will take effect at the end of your current paid billing cycle. You can cancel your subscription directly from your account dashboard.
      </p>
      <p>
        Upon cancellation, you will continue to have access to the Service through the end of your billing period. After the billing period ends, your account will be downgraded, and you may lose access to certain features and data associated with your subscription.
      </p>

      <h2>2. Refund Policy</h2>
      <p>
        Due to the nature of our digital service, we have a strict no-refund policy. When you purchase a subscription, you are paying for access to the Service for the duration of the billing period (monthly).
      </p>
      <p>
        We do not offer refunds or credits for:
      </p>
      <ul>
        <li>Partially used subscription periods.</li>
        <li>Unused months on a subscription.</li>
        <li>Account downgrades.</li>
        <li>Cancellation requests made after a subscription payment has been processed.</li>
      </ul>
      <p>
        We encourage you to use our service and evaluate its features before committing to a paid plan. The features available in each plan are clearly outlined on our <a href="/pricing" className="text-blue-400 hover:underline">Pricing Page</a>.
      </p>
      
      <h2>3. Exceptional Circumstances</h2>
      <p>
        In rare cases of technical errors resulting in overcharges or billing mistakes, we will review the issue on a case-by-case basis. If a billing error is confirmed on our end, a refund for the erroneously charged amount will be processed.
      </p>

      <h2>4. Changes to This Policy</h2>
      <p>
        We reserve the right to modify this Refund & Cancellation Policy at any time. Any changes will be posted on this page, and we encourage you to review it periodically. Your continued use of the Service after any changes constitutes your acceptance of the new policy.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        If you have any questions about this policy or need assistance with cancelling your account, please <a href="/contact" className="text-blue-400 hover:underline">contact us</a>.
      </p>
    </article>
  );
}

