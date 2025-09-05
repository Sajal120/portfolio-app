import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import LoadingAnimation from '@/components/LoadingAnimation';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ProjectsSection from '@/components/ProjectsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Initialize smooth scrolling behavior
    const initSmoothScroll = () => {
      // Enhanced smooth scrolling for anchor links
      const anchorLinks = document.querySelectorAll('a[href^="#"]');
      
      anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          const target = document.querySelector(href);
          
          if (target) {
            gsap.to(window, {
              duration: 1.5,
              scrollTo: {
                y: target,
                offsetY: 80
              },
              ease: 'power3.inOut'
            });
          }
        });
      });
    };

    if (!isLoading) {
      initSmoothScroll();
    }
  }, [isLoading]);

  const handleLoadingComplete = () => {
    console.log('Loading completed - hiding loading screen');
    setIsLoading(false);
    
    // Delay content appearance for smooth transition
    setTimeout(() => {
      console.log('Showing content');
      setShowContent(true);
    }, 100);
  };

  console.log('Index component rendered - isLoading:', isLoading, 'showContent:', showContent);

  if (isLoading) {
    console.log('Rendering loading animation');
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`portfolio-container ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="overflow-hidden">
        {/* Hero Section */}
        <HeroSection />
        
        {/* About Section */}
        <AboutSection />
        
        {/* Projects Section */}
        <ProjectsSection />
        
        {/* Contact Section */}
        <ContactSection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Scroll to top button */}
      <button
        onClick={() => {
          gsap.to(window, {
            duration: 1.5,
            scrollTo: { y: 0 },
            ease: 'power3.inOut'
          });
        }}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center glass-card hover:scale-110 transition-transform duration-300 z-30 opacity-80 hover:opacity-100"
        aria-label="Scroll to top"
      >
        <span className="text-lg">↑</span>
      </button>
    </div>
  );
};

export default Index;
