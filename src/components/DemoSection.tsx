'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface DemoSectionProps {
  user: any;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
  action?: string;
}

export default function DemoSection({ user }: DemoSectionProps) {
  const supportChatData: ChatMessage[] = [
    {
      sender: 'bot' as const,
      text: "Hi there! I'm your AI support agent. How can I help you today?",
      time: "2:30 PM"
    },
    {
      sender: 'user' as const,
      text: "Where is my order? I haven't received any updates.",
      time: "2:31 PM"
    },
    {
      sender: 'bot' as const,
      text: "Your order #2347 is out for delivery and will arrive today by 6:00 PM. You can track it in real-time using the link below.",
      time: "2:31 PM",
      action: "Track Order"
    }
  ];

  // Lead demo replaced with concise restock + dual contact capture conversation (masked PII)
  const leadChatData: ChatMessage[] = [
    { sender: 'user' as const, text: 'When will the graphite jacket be back in stock?', time: '3:10 PM' },
    { sender: 'bot' as const, text: 'The graphite jacket is expected to restock in about 5–6 days. I can notify you the moment it\'s live—please share your contact number or email.', time: '3:10 PM' },
    { sender: 'user' as const, text: '+91 98765 112xx and notify me at amxx@gearforge.in', time: '3:11 PM' },
    { sender: 'bot' as const, text: 'Noted. I\'ll send a restock alert to your number and email as soon as it arrives. Anything else you\'d like to check?', time: '3:11 PM' }
  ];

  const useCases = [
    { icon: '🤖', title: 'AI Support Agent', description: '24/7 customer support', key: 'support' },
    { icon: '🎯', title: 'AI Lead Qualification', description: 'Automated lead capture', key: 'lead' },
  ];

  // simple local state for toggling between demos (client component already)
  const [activeCase, setActiveCase] = useState<'support' | 'lead'>('support');

  return (
    <section id="demo-section" className="relative py-24 bg-black">
      {/* Very Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/2 to-emerald-500/3" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
          
          {/* Use Cases Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-2/5"
          >
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50">
              <h3 className="text-3xl font-bold text-white mb-8">Use Cases</h3>
              <div className="space-y-4">
                {useCases.map((useCase, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveCase(useCase.key as any)}
                    className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                      activeCase === useCase.key
                        ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'bg-gray-900/30 border border-gray-800/50 hover:border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl ${activeCase === useCase.key ? 'scale-110' : ''} transition-transform`}>
                        {useCase.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${activeCase === useCase.key ? 'text-white' : 'text-gray-300'}`}>
                          {useCase.title}
                        </h4>
                        <p className={`text-sm ${activeCase === useCase.key ? 'text-blue-200' : 'text-gray-400'}`}>
                          {useCase.description}
                        </p>
                      </div>
                      {activeCase === useCase.key && (
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-3/5 max-w-2xl"
          >
            <div className="relative">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-3xl p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold">{activeCase === 'support' ? 'AI Support Agent' : 'AI Lead Qualification'}</h3>
                  <span className="ml-auto text-sm opacity-90">{activeCase === 'support' ? 'Online • 24/7' : 'Capturing Leads'}</span>
                </div>
              </div>

              {/* Chat Body */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-b-3xl p-6 border-x border-b border-gray-800/50">
                <div className="space-y-4 mb-6">
                  {(activeCase === 'support' ? supportChatData : leadChatData).map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl p-4 ${
                          message.sender === 'user' 
                            ? 'bg-blue-500/20 border border-blue-500/30' 
                            : 'bg-gray-800/50 border border-gray-700/50'
                        }`}>
                          <p className={`${message.sender === 'user' ? 'text-blue-100' : 'text-gray-100'}`}>
                            {message.text}
                          </p>
                          {message.action && (
                            <button className="mt-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-200 px-3 py-1 rounded-full text-sm transition-colors">
                              {message.action} →
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {message.time}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    disabled
                    className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-full px-5 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors"
                  />
                  <button 
                    disabled
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                {/* CTA Button */}
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-8"
                  >
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      Start Free Trial
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
