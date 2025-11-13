"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const logos = [
  "https://www.vectorlogo.zone/logos/wordpress/wordpress-icon.svg",
  "https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg"
];

const lineWidth = 80; 
const lineHeight = 2; 

const LogoBeam = () => {
  return (
    <div className="flex items-center justify-center min-h-52">
      <div className="relative flex items-center">
        <div className="relative bg-black border-2 border-white/70 rounded-2xl flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 p-3 sm:p-4 overflow-hidden shadow-[0_0_15px_5px_#dbe0e2]">
          <img src={logos[0]} alt="Logo 1" className="filter invert brightness-0" />
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            }}
            style={{ willChange: 'transform' }}
          />
        </div>
        <div className="relative" style={{ width: `${lineWidth}px`, height: `${lineHeight}px`, backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <motion.div
            className="absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-transparent via-black to-transparent opacity-75"
            initial={{ x: '-40px' }}
            animate={{ x: `calc(${lineWidth}px + 40px)` }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              repeatDelay: 2.5,
              ease: 'linear',
            }}
            style={{ willChange: 'transform' }}
          />
        </div>
        <div className="relative bg-black border-2 border-white/70 rounded-2xl flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 p-3 sm:p-4 overflow-hidden shadow-[0_0_15px_5px_#dbe0e2]">
          <img src={logos[1]} alt="Logo 2" className="filter invert brightness-0" />
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            }}
            style={{ willChange: 'transform' }}
          />
        </div>
      </div>
    </div>
  );
};

const data = [50, 40, 300, 320, 500, 350, 200, 230, 500];
const maxData = Math.max(...data);
const chartHeight = 400;
const chartWidth = 800;

const CardWithEffect = ({ children }: { children: React.ReactNode }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className="relative bg-[#000] flex-1 rounded-xl border border-white/30 p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ willChange: 'transform' }}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: '220px',
            height: '220px',
            top: mousePosition.y - 150,
            left: mousePosition.x - 150,
            background: '#5D2CA8',
            filter: 'blur(100px)',
            transform: 'translate(-0%, -0%)',
            zIndex: 10, // Ensure the effect is on top
            willChange: 'transform, top, left',
          }}
        />
      )}
      {children}
    </div>
  );
};

const AWSIcon = () => {
  

  return (
    <div className="flex flex-col justify-center h-full items-center relative">
         <div className="flex flex-row gap-6 sm:gap-8 justify-center h-full items-center relative">
         <div className="relative bg-black border-2 border-white/70 rounded-2xl flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 p-3 sm:p-4 overflow-hidden shadow-[0_0_15px_5px_#dbe0e2]">
          <img src={logos[0]} alt="Logo 2" className="filter invert brightness-0" />
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            }}
            style={{ willChange: 'transform' }}
          />
        </div>
        <div className="relative bg-black border-2 border-white/70 rounded-2xl flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 p-3 sm:p-4 overflow-hidden shadow-[0_0_15px_5px_#dbe0e2]">
          <img src={logos[1]} alt="Logo 2" className="filter invert brightness-0" />
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            }}
            style={{ willChange: 'transform' }}
          />
        </div>
        </div>

      
      <div className="text-left p-6 mt-4">
        <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">Connect Once, Answer Everything</h1>
        <p className="text-gray-400 text-base sm:text-lg">Once connected through the WordPress plugin or Shopify app, Trulybot automatically learns from your entire store — products, inventory, policies — and instantly answers every customer question with perfect accuracy.</p>
      </div>
    </div>
  );
};

const BentoBox1 = () => {
  const chartRef = useRef(null);
  const [isChartVisible, setIsChartVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsChartVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, [chartRef]);

  return (
    <div className="bg-[#000000] flex justify-center items-center min-h-[560px] md:min-h-screen p-5 rounded-lg sm:py-24 ">
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-7xl min-h-[560px] md:min-h-[800px] md:h-[800px]">
        <CardWithEffect>
          <div className="flex flex-col justify-between h-full">
            <div className="mb-4 px-6 mt-6">
              <div className="flex justify-between items-center mb-6 pb-2">
                <h2 className="text-white/70 text-xl">Trulybot Chat</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-sm">Live</span>
                </div>
              </div>
              
              {/* Chat Container */}
              <div ref={chartRef} className="relative w-full mt-6 h-[460px] sm:h-[560px] bg-gradient-to-b from-white/10 via-black/20 to-transparent rounded-2xl border border-white/10 p-5 flex flex-col gap-5 overflow-y-auto shadow-xl">
                {/* Customer Message */}
                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isChartVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gradient-to-br from-cyan-500/30 to-sky-500/20 border border-cyan-400/40 rounded-2xl p-3 max-w-[90%] shadow-[0_0_30px_-12px_rgba(14,165,233,0.6)]">
                    <p className="text-white text-sm">What's the shipping cost to Mumbai?</p>
                  </div>
                </motion.div>

                {/* Bot Message */}
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isChartVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 max-w-[90%] shadow-[0_0_30px_-12px_rgba(255,255,255,0.3)]">
                    <p className="text-white/90 text-sm">Shipping to Mumbai is ₹99 for orders under ₹500, free above that. Delivery in 3-5 business days.</p>
                  </div>
                </motion.div>

                {/* Customer Message */}
                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isChartVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: 1.3 }}
                >
                  <div className="bg-gradient-to-br from-cyan-500/30 to-sky-500/20 border border-cyan-400/40 rounded-2xl p-3 max-w-[90%] shadow-[0_0_30px_-12px_rgba(14,165,233,0.6)]">
                    <p className="text-white text-sm">Do you accept returns? What's your policy?</p>
                  </div>
                </motion.div>

                {/* Bot Message */}
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isChartVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 1.8 }}
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 max-w-[90%] shadow-[0_0_30px_-12px_rgba(255,255,255,0.3)]">
                    <p className="text-white/90 text-sm">Yes! 30-day returns on all items in original condition. Free return shipping with prepaid label.</p>
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="text-left p-6 mt-4">
              <h1 className="text-white text-2xl font-bold mb-2">Instant Responses</h1>
              <p className="text-white/70 text-lg">Trulybot learns your store and answers customer questions instantly, 24/7 without any manual setup.</p>
            </div>
          </div>
        </CardWithEffect>
        <div className="flex flex-col w-full md:w-1/2 gap-5 h-full md:h-[800px]">
          <CardWithEffect>
            <div className="flex flex-col justify-center h-full">
              <LogoBeam />
              <div className="text-left p-6">
                <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">Seamless Integration</h1>
                <p className="text-white/70 text-base sm:text-lg">Works with WordPress and Shopify in minutes through WordPress plugin and Shopify app. No coding required.</p>
              </div>
            </div>
          </CardWithEffect>
          <CardWithEffect>
            <AWSIcon />
          </CardWithEffect>
        </div>
      </div>
    </div>
  );
};


function Bentodemo() {
  return (
    <div className="min-h-[520px] md:h-screen flex items-center justify-center">
      <BentoBox1 />
    </div>
  );
}

export default Bentodemo;
