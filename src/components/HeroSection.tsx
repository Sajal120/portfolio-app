import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'phosphor-react';
import Animated3DBackground from './Animated3DBackground';
import { getHeroContent, HeroContent } from '../lib/supabase';

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLDivElement>(null);
  const [heroData, setHeroData] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load hero content from Supabase
    const loadHeroData = async () => {
      try {
        const { data, error } = await getHeroContent();
        if (!error && data) {
          setHeroData(data);
        }
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroData();
  }, []);

  useEffect(() => {
    if (loading) return; // Don't animate until data is loaded
    const tl = gsap.timeline({ delay: 0.5 });

    // Set initial states
    gsap.set([headlineRef.current, subtitleRef.current, ctaRef.current], {
      opacity: 0,
      y: 50,
      filter: 'blur(10px)'
    });

    gsap.set(splineRef.current, {
      opacity: 0,
      x: 100
    });

    // Animate elements in sequence
    tl.to(headlineRef.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.2,
      ease: 'power3.out'
    })
    .to(subtitleRef.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power3.out'
    }, '-=0.8')
    .to(ctaRef.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power3.out'
    }, '-=0.6')
    .to(splineRef.current, {
      opacity: 1,
      x: 0,
      duration: 1.5,
      ease: 'power3.out'
    }, '-=1.2');

    // Add floating orbs animation
    gsap.to('.floating-orb', {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: {
        each: 0.5,
        from: 'random'
      }
    });

    return () => {
      tl.kill();
    };
  }, [loading]);

  const handleHireMe = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-screen 3D Background */}
      <div className="absolute inset-0 w-full h-full">
        <Animated3DBackground />
      </div>
      
      {/* Dynamic background image if available */}
      {heroData?.background_image && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={heroData.background_image}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Background gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-background/20" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl floating-orb" />
      <div className="absolute top-60 right-20 w-24 h-24 bg-secondary/20 rounded-full blur-xl floating-orb" />
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-accent/10 rounded-full blur-xl floating-orb" />
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-primary/15 rounded-full blur-xl floating-orb" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {loading ? (
              /* Loading skeleton */
              <div className="animate-pulse">
                <div className="h-20 bg-white/10 rounded-xl mb-6" />
                <div className="h-6 bg-white/5 rounded-xl mb-4" />
                <div className="h-6 bg-white/5 rounded-xl mb-8 w-3/4" />
                <div className="h-12 bg-white/10 rounded-xl w-32" />
              </div>
            ) : (
              <>
                <h1 
                  ref={headlineRef}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 text-shadow-lg"
                >
                  <span className="bg-gradient-primary bg-clip-text text-transparent text-glow">
                    {heroData?.title || "Hi, I'm Sajal"}
                  </span>
                  <br />
                  <span className="text-4xl md:text-5xl lg:text-6xl text-muted-foreground">
                    {heroData?.subtitle || "AI & IT Enthusiast"}
                  </span>
                </h1>

                <p 
                  ref={subtitleRef}
                  className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 text-shadow"
                >
                  {heroData?.description || "Developer | Analyst | IT Support Specialist. Leveraging AI tools to enhance development workflows, security analysis, and system optimization. Creating efficient, intelligent solutions."}
                </p>

                <div ref={ctaRef} className="flex justify-center lg:justify-start">
                  <button
                    onClick={handleHireMe}
                    className="btn-glow px-8 py-4 rounded-full text-lg font-semibold text-primary-foreground flex items-center justify-center gap-2 group backdrop-blur-sm"
                  >
                    {heroData?.cta_text || "Hire Me"}
                    <ArrowRight 
                      size={20} 
                      className="transition-transform duration-300 group-hover:translate-x-1" 
                    />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Content - Let 3D background show through */}
          <div ref={splineRef} className="relative">
            {/* This div maintains layout structure but lets background show through */}
            <div className="aspect-square max-w-lg mx-auto opacity-0">
              <div className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;