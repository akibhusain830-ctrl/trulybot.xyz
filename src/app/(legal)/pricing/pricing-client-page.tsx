'use client';

import { PRICING_TIERS } from '@/lib/constants/pricing';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function PricingClientPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  return (
    <div className="isolate overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pb-96 pt-24 text-center sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            The right price for you, <br className="hidden sm:inline lg:hidden" />
            whoever you are
          </p>
        </div>
        <div className="relative mt-6">
          <p className="mx-auto max-w-2xl text-lg leading-8 text-white/60">
            Choose a plan that fits your needs. All plans include our core features, with options to scale as you grow.
          </p>
          
          {/* Currency Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currency === 'INR' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                INR (₹)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currency === 'USD' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flow-root bg-white/5 pb-24 sm:pb-32">
        <div className="-mt-80">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
              {PRICING_TIERS.map((tier) => {
                const price = currency === 'INR' ? tier.monthlyInr : tier.monthlyUsd;
                const symbol = currency === 'INR' ? '₹' : ';
                
                return (
                  <div
                    key={tier.id}
                    className="flex flex-col justify-between rounded-3xl bg-slate-900/80 p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10"
                  >
                    <div>
                      <h3 id={tier.id} className="text-base font-semibold leading-7 text-blue-400">
                        {tier.name}
                      </h3>
                      <div className="mt-4 flex items-baseline gap-x-2">
                        <span className="text-5xl font-bold tracking-tight text-white">
                          {symbol}{price}
                        </span>
                        <span className="text-base font-semibold leading-7 text-gray-400">/month</span>
                      </div>
                      <p className="mt-6 text-base leading-7 text-gray-300">{tier.description}</p>
                      <ul role="list" className="mt-10 space-y-4 text-sm leading-6 text-gray-300">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <CheckIcon className="h-6 w-5 flex-none text-blue-400" aria-hidden="true" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href="/sign-up"
                      aria-describedby={tier.id}
                      className="mt-8 block rounded-md bg-blue-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Get started
                    </Link>
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