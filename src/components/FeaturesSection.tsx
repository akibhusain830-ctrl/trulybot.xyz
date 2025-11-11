'use client';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      number: '1',
      title: 'Upload Your Knowledge',
      subtitle: 'Train your AI in seconds',
      description: 'Drag and drop your FAQs, product guides, or help docs. Your AI learns instantly and starts answering customer questions like your best support agent.',
      gradient: 'from-blue-500/20 via-blue-600/10 to-transparent',
      glowColor: 'rgba(59, 130, 246, 0.5)',
      iconBg: 'from-blue-500 to-blue-600'
    },
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      number: '2',
      title: 'Deploy Instantly',
      subtitle: 'Live in under 5 minutes',
      description: 'Install our WordPress plugin or add the chat widget to any website. Your AI chatbot goes live instantly, ready to help visitors 24/7 with a beautiful branded interface.',
      gradient: 'from-purple-500/20 via-purple-600/10 to-transparent',
      glowColor: 'rgba(168, 85, 247, 0.5)',
      iconBg: 'from-purple-500 to-purple-600'
    },
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      number: '3',
      title: 'Watch It Work',
      subtitle: 'Real-time analytics & leads',
      description: 'Monitor performance and capture leads automatically through your dashboard. Your support load drops dramatically while lead quality improves.',
      gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
      glowColor: 'rgba(16, 185, 129, 0.5)',
      iconBg: 'from-emerald-500 to-emerald-600'
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Founder",
      company: "Fashion E-commerce",
      image: "PS",
      quote: "Cut our support tickets by 65% in the first month. The bot handles size queries, shipping questions, everything. Game changer for our small team.",
      rating: 5,
      gradient: "from-blue-500/10 to-purple-500/10"
    },
    {
      name: "Rahul Mehta",
      role: "Operations Head",
      company: "B2B SaaS",
      image: "RM",
      quote: "Setup took literally 10 minutes. Now we're capturing 40+ qualified leads every week. The ROI paid for itself in week two.",
      rating: 5,
      gradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      name: "Ananya Desai",
      role: "E-commerce Manager",
      company: "Online Retail",
      image: "AD",
      quote: "Customers love getting instant answers at 2 AM. Our satisfaction scores went from 3.8 to 4.6 stars. Worth every rupee.",
      rating: 5,
      gradient: "from-pink-500/10 to-rose-500/10"
    },
    {
      name: "Vikram Patel",
      role: "CEO",
      company: "Tech Startup",
      image: "VP",
      quote: "Handles 200+ conversations daily without breaking a sweat. Freed up our team to focus on complex issues. Best investment we made this year.",
      rating: 5,
      gradient: "from-emerald-500/10 to-cyan-500/10"
    }
  ];

  const StarIcon = () => (
    <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
  );

  return (
    <section id="features" className="relative mt-36 py-24 bg-black overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/3 to-emerald-500/5" />
      
      {/* Animated Floating Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Simple. Powerful. Instant.
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight"
          >
            How TrulyBot Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Three simple steps to transform your customer support and start capturing leads
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              {/* Connecting Line (desktop only) */}
              {index < features.length - 1 && (
                <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 via-purple-500/30 to-transparent -ml-4 z-0" />
              )}
              
              <div className={`relative bg-gradient-to-br ${feature.gradient} backdrop-blur-xl rounded-3xl p-8 border border-white/10 transition-all duration-500 group-hover:scale-105 group-hover:border-white/20 h-full flex flex-col shadow-2xl`}>
                
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/50 border-4 border-black">
                  {feature.number}
                </div>

                {/* Premium Floating Icon */}
                <motion.div
                  className={`relative mb-8 w-20 h-20 mx-auto`}
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-${feature.glowColor} to-${feature.glowColor} rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                  
                  {/* Icon container */}
                  <div className={`relative w-full h-full rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
                  {feature.title}
                </h3>

                {/* Subtitle */}
                <p className="text-cyan-300 text-sm font-medium mb-4 text-center">
                  {feature.subtitle}
                </p>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed text-center flex-grow text-base">
                  {feature.description}
                </p>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 transform -skew-x-12" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-4">
              Trusted by Growing Businesses
            </span>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Real Results from Real Customers
            </h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See what business owners say about TrulyBot
            </p>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className={`relative bg-gradient-to-br ${testimonial.gradient} backdrop-blur-xl rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20 h-full flex flex-col shadow-xl`}>
                  
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-200 text-sm leading-relaxed mb-6 flex-grow italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {testimonial.image}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}