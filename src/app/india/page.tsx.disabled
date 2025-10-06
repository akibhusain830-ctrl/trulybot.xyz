'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Star, Users, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { generateEnhancedMetadata, generateStructuredData, generateLocalBusinessStructuredData } from '@/lib/metadata-enhanced';
import Head from 'next/head';

export default function IndiaLandingPage() {
  const [currency, setCurrency] = useState('INR');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect if user is in India
    const detectCurrency = async () => {
      try {
        const response = await fetch('/api/geolocation');
        const data = await response.json();
        setCurrency(data.currency || 'INR');
      } catch (error) {
        console.log('Using default currency');
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const indianPricing = [
    {
      name: 'Basic',
      price: '₹99',
      originalPrice: '$5',
      description: 'Perfect for small businesses and startups',
      features: [
        'Up to 1,000 conversations/month',
        'Basic AI responses',
        'Email support',
        'Website integration',
        'Mobile responsive widget'
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '₹399',
      originalPrice: '$10', 
      description: 'Best for growing businesses',
      features: [
        'Up to 10,000 conversations/month',
        'Advanced AI with GPT-4',
        'Priority support',
        'Custom branding',
        'Analytics dashboard',
        'Multi-language support',
        'Lead generation forms'
      ],
      popular: true,
    },
    {
      name: 'Ultra',
      price: '₹599',
      originalPrice: '$15',
      description: 'For enterprise and high-volume businesses',
      features: [
        'Unlimited conversations',
        'Premium AI responses',
        '24/7 phone support',
        'Advanced analytics',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'White-label solution'
      ],
      popular: false,
    },
  ];

  const indianTestimonials = [
    {
      name: 'Raj Patel',
      company: 'Mumbai Electronics',
      rating: 5,
      text: 'TrulyBot ने हमारे customer support को revolutionize कर दिया है। अब हमारे customers को instant replies मिलते हैं।',
      location: 'Mumbai, Maharashtra'
    },
    {
      name: 'Priya Sharma',
      company: 'Delhi Fashion Hub',
      rating: 5,
      text: 'सिर्फ ₹399 में इतना powerful chatbot! Our sales increased by 40% after implementing TrulyBot.',
      location: 'New Delhi'
    },
    {
      name: 'Kiran Kumar',
      company: 'Bangalore Tech Solutions',
      rating: 5,
      text: 'Easy integration, excellent support team, और bilingual responses. Perfect for Indian market!',
      location: 'Bangalore, Karnataka'
    }
  ];

  const indianFeatures = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: 'Instant Hindi & English Support',
      description: 'हिंदी और English दोनों languages में instant customer support प्रदान करें।'
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'UPI & Indian Payment Integration',
      description: 'UPI, Net Banking, और all major Indian payment methods के साथ seamless integration।'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: 'Data Privacy (India Compliant)',
      description: 'Indian data protection laws के अनुसार complete data security और privacy।'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: 'Made for Indian Businesses',
      description: 'Indian market की specific needs को समझकर designed किया गया है।'
    }
  ];

  const structuredData = [
    generateStructuredData('SoftwareApplication', {
      name: 'TrulyBot AI Chatbot - India',
      offers: {
        '@type': 'Offer',
        price: '99',
        priceCurrency: 'INR',
      }
    }),
    generateLocalBusinessStructuredData('india'),
    generateStructuredData('Organization', {
      name: 'TrulyBot India',
      areaServed: {
        '@type': 'Country',
        name: 'India'
      }
    })
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        {structuredData.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <span className="bg-orange-100 text-orange-800 border border-orange-200 px-4 py-2 rounded-full text-sm font-medium">
                🇮🇳 Made for India | भारत के लिए बनाया गया
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              India's #1 AI Chatbot Platform
              <br />
              <span className="text-orange-600">₹99 से शुरू करें</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Indian businesses के लिए specially designed AI chatbot। Hindi और English में instant customer support, 
              UPI integration, और सिर्फ 2 minutes में setup!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/pricing-india">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg rounded-lg transition-colors duration-300">
                  Start Free Trial | मुफ्त ट्रायल शुरू करें
                </button>
              </Link>
              <Link href="#features">
                <button className="border border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg rounded-lg transition-colors duration-300">
                  View Demo | डेमो देखें
                </button>
              </Link>
            </div>

            <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>5-Minute Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Hindi Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>UPI Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>₹99/month</span>
              </div>
            </div>
          </div>
        </section>

        {/* India-Specific Features */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Indian Businesses के लिए Special Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              हमने Indian market की unique requirements को समझकर ये features specially design किए हैं।
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {indianFeatures.map((feature, index) => (
              <div key={index} className="text-center hover:shadow-lg transition-shadow bg-white rounded-lg border p-6">
                <div>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <div>
                  <p className="text-base text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Indian Pricing */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50 rounded-2xl my-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Indian Pricing | भारतीय मूल्य निर्धारण
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              International rates से 80% कम! Indian businesses के लिए affordable pricing।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {indianPricing.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-orange-500 border-2 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      Most Popular | सबसे लोकप्रिय
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-orange-600">{plan.price}</div>
                    <div className="text-sm text-gray-500 line-through">{plan.originalPrice} USD</div>
                    <div className="text-sm text-green-600 font-semibold">Save 80% with Indian pricing!</div>
                  </div>
                  <CardDescription className="mt-4">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/pricing-india" className="block">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                    >
                      Choose Plan | प्लान चुनें
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Indian Testimonials */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Indian Customers की Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              देश भर के businesses TrulyBot के साथ अपनी sales और customer satisfaction बढ़ा रहे हैं।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {indianTestimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-orange-600">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.company}</CardDescription>
                      <div className="text-sm text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Business?
              <br />
              <span className="text-orange-200">अपने व्यापार को आगे बढ़ाने के लिए तैयार हैं?</span>
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join 1000+ Indian businesses already using TrulyBot to boost their sales and customer satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing-india">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  Start Your Free Trial | फ्री ट्रायल शुरू करें
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg">
                  Talk to Expert | एक्सपर्ट से बात करें
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-6 opacity-75">
              No credit card required | कोई क्रेडिट कार्ड की आवश्यकता नहीं
            </p>
          </div>
        </section>
      </div>
    </>
  );
}