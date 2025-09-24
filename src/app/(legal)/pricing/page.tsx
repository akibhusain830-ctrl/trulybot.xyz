import React from 'react';

// --- SVG Icon for feature checkmarks ---
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function PricingPage() {
  // --- Data for the pricing plans ---
  // This could be fetched from a database or a constants file in a real application
  const plans = [
    {
      name: 'Basic',
      price: '₹99',
      frequency: '/ month',
      description: 'Perfect for individuals and small projects getting started with AI support.',
      features: [
        'Core chat widget',
        '1,000 messages per month',
        'Basic knowledge ingestion (FAQs, URLs)',
        'Email capture',
      ],
      isHighlighted: false,
    },
    {
      name: 'Pro',
      price: '₹299',
      frequency: '/ month',
      description: 'The ideal choice for growing businesses that need more power and customization.',
      features: [
        'Everything in Basic, plus:',
        'Unlimited messages (fair use)',
        'Priority knowledge refresh',
        'Chatbot customization controls',
        'Early access to new features',
      ],
      isHighlighted: true,
    },
    {
      name: 'Ultra',
      price: '₹499',
      frequency: '/ month',
      description: 'For power users and teams that require advanced features and branding options.',
      features: [
        'Everything in Pro, plus:',
        'Advanced branding options',
        'Deeper customization hooks',
        'Priority support response',
        'Invitations to beta programs',
      ],
      isHighlighted: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">Simple, Transparent Pricing</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
          Choose the plan that's right for you. All plans are designed to scale with your business.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative border rounded-lg p-8 flex flex-col transition-all duration-300 ${
              plan.isHighlighted 
                ? 'border-blue-500 bg-slate-900/50 shadow-2xl shadow-blue-900/20' 
                : 'border-slate-800 bg-slate-900/50'
            }`}
          >
            {plan.isHighlighted && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                MOST POPULAR
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
            <p className="mt-2 text-slate-400 text-sm flex-grow">{plan.description}</p>
            
            <div className="mt-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-slate-400">{plan.frequency}</span>
            </div>

            <ul className="mt-6 space-y-4 text-slate-300">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start gap-3">
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                plan.isHighlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}>
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center text-slate-500 text-sm">
        <p>
          Need a custom solution or have a high-volume use case? 
          <a href="/contact" className="font-medium text-blue-400 hover:underline"> Contact us </a> 
          for enterprise pricing.
        </p>
      </div>
    </div>
  );
}

