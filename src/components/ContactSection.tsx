import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PaperPlaneTilt, Phone, EnvelopeSimple, MapPin, GithubLogo, LinkedinLogo } from 'phosphor-react';
import { supabase } from '../lib/supabase';
import ContactForm from './ContactForm';

gsap.registerPlugin(ScrollTrigger);

const ContactSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [contactData, setContactData] = useState({
    title: 'Get In Touch',
    subtitle: "Ready to bring your ideas to life? Let's discuss your next project",
    description: "I'm actively seeking opportunities in IT Support, Software Development, and Security Analysis. If you're looking for a dedicated professional who can troubleshoot complex systems, develop secure applications, or strengthen your cybersecurity posture, let's connect and discuss how I can contribute to your team!"
  });
  const [contactInfo, setContactInfo] = useState<Array<{
    id: string;
    type: string;
    label: string;
    value: string;
    icon?: string;
    is_public: boolean;
    display_order: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      setLoading(true);

      // Load contact section content from localStorage
      const savedContent = localStorage.getItem('contact_section_content');
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        setContactData({
          title: parsedContent.title || 'Get In Touch',
          subtitle: parsedContent.subtitle || "Ready to bring your ideas to life? Let's discuss your next project",
          description: parsedContent.description || "I'm actively seeking opportunities in IT Support, Software Development, and Security Analysis. If you're looking for a dedicated professional who can troubleshoot complex systems, develop secure applications, or strengthen your cybersecurity posture, let's connect and discuss how I can contribute to your team!"
        });
      }

      // Load contact information from existing table structure
      const { data: contactInfoData, error: contactError } = await supabase
        .from('contact_info')
        .select('*');

      if (contactError) {
        console.error('Error loading contact info:', contactError);
        // Set fallback contact info
        setContactInfo([
          { id: '1', type: 'phone', label: 'Phone', value: '+61 424 425 793', icon: '📱', is_public: true, display_order: 1 },
          { id: '2', type: 'email', label: 'Email', value: 'basnetsajal120@gmail.com', icon: '📧', is_public: true, display_order: 2 },
          { id: '3', type: 'address', label: 'Location', value: 'Auburn, Sydney, NSW', icon: '📍', is_public: true, display_order: 3 },
          { id: '4', type: 'github', label: 'GitHub', value: 'https://github.com/Sajal120', icon: '👨‍💻', is_public: true, display_order: 4 },
          { id: '5', type: 'linkedin', label: 'LinkedIn', value: 'https://linkedin.com/in/sajal-basnet-7926aa188', icon: '💼', is_public: true, display_order: 5 }
        ]);
      } else {
        // Transform legacy data structure to expected format
        const transformedData: Array<{
          id: string;
          type: string;
          label: string;
          value: string;
          icon?: string;
          is_public: boolean;
          display_order: number;
        }> = [];
        
        if (contactInfoData && contactInfoData.length > 0) {
          const item = contactInfoData[0]; // Assuming single row
          
          if (item.phone) {
            transformedData.push({
              id: `phone-${item.id}`,
              type: 'phone',
              label: 'Phone',
              value: item.phone,
              icon: '📱',
              is_public: true,
              display_order: 1
            });
          }
          
          if (item.email) {
            transformedData.push({
              id: `email-${item.id}`,
              type: 'email',
              label: 'Email',
              value: item.email,
              icon: '📧',
              is_public: true,
              display_order: 2
            });
          }
          
          if (item.location) {
            transformedData.push({
              id: `location-${item.id}`,
              type: 'address',
              label: 'Location',
              value: item.location,
              icon: '📍',
              is_public: true,
              display_order: 3
            });
          }
          
          if (item.github_url) {
            transformedData.push({
              id: `github-${item.id}`,
              type: 'github',
              label: 'GitHub',
              value: item.github_url,
              icon: '👨‍💻',
              is_public: true,
              display_order: 4
            });
          }
          
          if (item.linkedin_url) {
            transformedData.push({
              id: `linkedin-${item.id}`,
              type: 'linkedin',
              label: 'LinkedIn',
              value: item.linkedin_url,
              icon: '💼',
              is_public: true,
              display_order: 5
            });
          }
        }
        
        setContactInfo(transformedData);
      }

    } catch (error) {
      console.error('Error loading contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set('.contact-item', {
        opacity: 0,
        x: -50
      });

      gsap.set('.form-section', {
        opacity: 0,
        y: 30
      });

      // Animate on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });

      tl.to('.contact-item', {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      })
      .to('.form-section', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4');

    }, sectionRef);

    return () => ctx.revert();
  }, [loading]);

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'phone':
        return <Phone size={24} />;
      case 'email':
        return <EnvelopeSimple size={24} />;
      case 'address':
        return <MapPin size={24} />;
      case 'linkedin':
        return <LinkedinLogo size={24} />;
      case 'github':
        return <GithubLogo size={24} />;
      default:
        return <EnvelopeSimple size={24} />;
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
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <section id="contact" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-white/10 rounded-xl w-96 mx-auto mb-4" />
              <div className="h-6 bg-white/5 rounded-xl w-[500px] mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" ref={sectionRef} className="py-20 pb-10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {contactData.title}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {contactData.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-glow">Let's Connect</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {contactData.description}
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <a
                  key={info.id}
                  href={formatContactValue(info.type, info.value)}
                  className="contact-item flex items-center gap-4 p-4 glass-card rounded-xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {info.icon ? <span className="text-lg">{info.icon}</span> : getContactIcon(info.type)}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{info.label}</div>
                    <div className="font-medium">{info.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="form-section">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;