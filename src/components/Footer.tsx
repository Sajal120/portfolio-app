import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GithubLogo, LinkedinLogo, EnvelopeSimple } from 'phosphor-react';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface FooterContent {
  brand_name: string;
  description: string;
  copyright_text: string;
  location: string;
  phone: string;
  email: string;
}

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerData, setFooterData] = useState<FooterContent>({
    brand_name: 'Sajal Basnet',
    description: 'IT professional specializing in support, security, and development. Dedicated to protecting systems, solving complex problems, and building secure digital solutions. Ready to strengthen your technology infrastructure.',
    copyright_text: '© 2025 Sajal Basnet. All rights reserved.',
    location: 'Auburn, Sydney, NSW',
    phone: '+61 424 425 793',
    email: 'basnetsajal120@gmail.com'
  });
  const [socialLinks, setSocialLinks] = useState<Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>>([]);

  useEffect(() => {
    loadFooterContent();
    loadSocialLinks();
  }, []);

  const loadFooterContent = () => {
    try {
      const savedContent = localStorage.getItem('footer_content');
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        setFooterData(prev => ({
          ...prev,
          ...parsedContent
        }));
      }
    } catch (error) {
      console.error('Error loading footer content:', error);
    }
  };

  const loadSocialLinks = async () => {
    try {
      const { data: contactInfo, error } = await supabase
        .from('contact_info')
        .select('*');

      if (error) {
        console.error('Error loading social links:', error);
        // Fallback to default links
        setDefaultSocialLinks();
        return;
      }

      if (contactInfo && contactInfo.length > 0) {
        // Extract social links from existing table structure
        const socialLinksData = [];
        const item = contactInfo[0]; // Assuming single row
        
        if (item.github_url) {
          socialLinksData.push({
            icon: getSocialIcon('github'),
            href: formatContactValue('github', item.github_url),
            label: 'GitHub'
          });
        }
        
        if (item.linkedin_url) {
          socialLinksData.push({
            icon: getSocialIcon('linkedin'),
            href: formatContactValue('linkedin', item.linkedin_url),
            label: 'LinkedIn'
          });
        }
        
        if (socialLinksData.length > 0) {
          setSocialLinks(socialLinksData);
        } else {
          setDefaultSocialLinks();
        }
      } else {
        setDefaultSocialLinks();
      }
    } catch (error) {
      console.error('Error loading social links:', error);
      setDefaultSocialLinks();
    }
  };

  const setDefaultSocialLinks = () => {
    setSocialLinks([
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
        href: `mailto:${footerData.email}`,
        label: 'Email'
      }
    ]);
  };

  const getSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'github':
        return <GithubLogo size={20} />;
      case 'linkedin':
        return <LinkedinLogo size={20} />;
      case 'twitter':
        return <EnvelopeSimple size={20} />; // Use envelope as fallback
      case 'instagram':
        return <EnvelopeSimple size={20} />; // Use envelope as fallback
      default:
        return <EnvelopeSimple size={20} />;
    }
  };

  const formatContactValue = (type: string, value: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value.replace(/\s/g, '')}`;
      case 'website':
      case 'linkedin':
      case 'github':
      case 'twitter':
      case 'instagram':
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return value;
    }
  };

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

  return (
    <footer ref={footerRef} className="relative py-16 mt-8 overflow-hidden">
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
                  {footerData.brand_name}
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                {footerData.description}
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
                <p>{footerData.location}</p>
                <p>{footerData.phone}</p>
                <p>{footerData.email}</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-muted-foreground text-sm">
                {footerData.copyright_text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;