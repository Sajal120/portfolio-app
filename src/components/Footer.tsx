import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, GithubLogo, LinkedinLogo, EnvelopeSimple } from 'phosphor-react';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create floating particles
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle absolute w-1 h-1 bg-primary/30 rounded-full';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        footerRef.current?.appendChild(particle);

        gsap.to(particle, {
          y: -20,
          x: Math.random() * 40 - 20,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: Math.random() * 2
        });
      }

      // Animate footer content
      gsap.fromTo('.footer-content', 
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, footerRef);

    return () => ctx.revert();
  }, []);

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' }
  ];

  const socialLinks = [
    {
      icon: <GithubLogo size={20} />,
      href: 'https://github.com/Sajal120',
      label: 'GitHub'
    },
    {
      icon: <LinkedinLogo size={20} />,
      href: 'https://linkedin.com/in/sajal-basnet-7926aa188',
      label: 'LinkedIn'
    },
    {
      icon: <EnvelopeSimple size={20} />,
      href: 'mailto:basnetsajal120@gmail.com',
      label: 'Email'
    }
  ];

  return (
    <footer ref={footerRef} className="relative py-16 mt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="footer-content">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="text-3xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Sajal Basnet
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                IT professional specializing in support, security, and development. Dedicated to 
                protecting systems, solving complex problems, and building secure digital solutions. 
                Ready to strengthen your technology infrastructure.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:bg-primary/20 transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Auburn, Sydney, NSW</p>
                <p>+61 424 425 793</p>
                <p>basnetsajal120@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-muted-foreground text-sm">
                © 2025 Sajal Basnet. All rights reserved.
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Made with <Heart size={16} className="text-red-500 animate-pulse" /> using React & GSAP
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;