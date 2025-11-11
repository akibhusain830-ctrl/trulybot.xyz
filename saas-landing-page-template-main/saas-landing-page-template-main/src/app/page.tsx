import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Results } from "@/components/Results";
import { Features } from "@/components/Features";
import { ProductShowcase } from "@/components/ProductShowcase";
import { FAQs } from "@/components/FAQs";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricingdemo";


export default function Home() {
  return (
    <>
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Results />
      
      <Features />
      
      <ProductShowcase />
      <FAQs />
      <Pricing/>
     
      <CallToAction />
      </div>
      <Footer />
    </>
  );
}
