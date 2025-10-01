'use client';

import { PRICING_TIERS } from '@/lib/constants/pricing';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Pricing – TrulyBot',
  description: 'Simple, transparent AI chatbot pricing for e-commerce businesses. Choose a plan that scales with you.',
  alternates: { canonical: 'https://trulybot.xyz/pricing' },
  openGraph: {
    title: 'TrulyBot Pricing',
    description: 'AI chatbot pricing that scales with your e-commerce growth.',
    url: 'https://trulybot.xyz/pricing'
  },
  twitter: {
    title: 'TrulyBot Pricing',
    description: 'Transparent AI chatbot pricing for e-commerce.'
  }
};

function buildPricingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'TrulyBot Pricing Plans',
    itemListElement: PRICING_TIERS.map((tier, index) => ({
      '@type': 'Offer',
      position: index + 1,
      itemOffered: {
        '@type': 'SoftwareApplication',
        name: `TrulyBot ${tier.name} Plan`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        description: tier.description,
      },
      priceSpecification: [
        {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'USD',
          price: tier.monthlyUsd,
          billingPeriod: 'P1M'
        },
        {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'USD',
          price: Number((tier.yearlyUsd / 12).toFixed(2)),
          billingPeriod: 'P1Y'
        }
      ],
      url: 'https://trulybot.xyz/pricing'
    }))
  };
}

export default function PricingClientPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('USD');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/geolocation');
        if (!res.ok) throw new Error('Geo failed');
        const data = await res.json();
        setCurrency(data.country === 'IN' ? 'INR' : 'USD');
      } catch (e: any) {
        setGeoError(e.message || 'Geo unavailable');
      } finally {
        setGeoLoading(false);
      }
    })();
  }, []);

  function planPrice(tier: typeof PRICING_TIERS[number]) {
    if (billingPeriod === 'monthly') return currency === 'INR' ? tier.monthlyInr : tier.monthlyUsd;
    const yearly = currency === 'INR' ? tier.yearlyInr : tier.yearlyUsd;
    return currency === 'INR' ? Math.round(yearly) : Number(yearly.toFixed(2));
  }

  const symbol = currency === 'INR' ? '₹' : '$';
  const periodLabel = billingPeriod === 'monthly' ? '/month' : '/year';

  return (
    <div className="isolate overflow-hidden">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPricingJsonLd()) }}
      />
  <div className="mx-auto max-w-7xl px-6 pb-[60px] pt-24 text-center sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-base font-semibold leading-7 text-blue-400">Pricing</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl" aria-describedby="pricing-intro">
            The right price for you,<br className="hidden sm:inline lg:hidden" /> whoever you are
          </p>
        </div>
        <div className="relative mt-6">
          <p id="pricing-intro" className="mx-auto max-w-2xl text-lg leading-8 text-white/60">
            Choose a plan that fits your needs. All plans include our core features, with options to scale as you grow.
          </p>

          {/* Billing Period Toggle */}
          <div className="mt-6 flex justify-center">
            <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >Monthly</button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >Yearly <span className="hidden sm:inline">(Save 20%)</span></button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {geoLoading ? 'Detecting region…' : geoError ? 'Location fallback applied (USD).' : `Showing prices in ${currency}.`}
          </div>
        </div>
      </div>
  <div className="flow-root pb-16 sm:pb-24">
        {/* Adjusted spacing: removed large negative margin that caused overlap with toggle */}
  <div className="mt-0">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
              {PRICING_TIERS.map((tier) => {
                const price = planPrice(tier);
                const isPremium = tier.id === 'pro' || tier.id === 'ultra';
                const equivalentMonthlyInr = (billingPeriod === 'yearly' && currency === 'INR') ? Math.round(price / 12) : null;
                return (
                  <div
                    key={tier.id}
                    className={[
                      'flex flex-col justify-between rounded-3xl p-8 sm:p-10 shadow-lg transition-all duration-300',
                      'border',
                      isPremium ? 'bg-gradient-to-br from-[#0B0F1A] via-[#0B0B10] to-[#06070A] border-blue-500/40 hover:shadow-blue-500/20' : 'bg-[#0B0B10] border-white/5 hover:border-white/10',
                      'hover:-translate-y-1'
                    ].join(' ')}
                  >
                    <div>
                      <h3 id={tier.id} className="text-base font-semibold leading-7 text-blue-400 flex items-center gap-2">
                        {tier.name}
                        {billingPeriod === 'yearly' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/20 text-green-300 border border-green-500/30">20% off</span>
                        )}
                      </h3>
                      <div className="mt-4 flex items-baseline gap-x-2">
                        <span className="text-5xl font-bold tracking-tight text-white">{symbol}{price}</span>
                        <span className="text-base font-semibold leading-7 text-gray-400">{periodLabel}</span>
                      </div>
                      {equivalentMonthlyInr && (
                        <div className="mt-2 text-xs text-gray-500">≈ ₹{equivalentMonthlyInr}/mo effective</div>
                      )}
                      <p className="mt-6 text-base leading-7 text-gray-300">{tier.description}</p>
                      <ul role="list" className="mt-10 space-y-4 text-sm leading-6 text-gray-300 min-h-[200px]">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <CheckIcon className="h-6 w-5 flex-none text-blue-400" aria-hidden="true" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <Link
                        href="/sign-up"
                        aria-describedby={tier.id}
                        className={`mt-4 block rounded-md px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white transition-colors ${
                          isPremium ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:brightness-110 shadow-md' : 'bg-gray-700/60 hover:bg-gray-600/60 border border-white/5 hover:border-white/10'
                        }`}
                      >
                        Get started
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}