import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Envelope } from 'phosphor-react';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

// Fallback skills data
const defaultSkills = [
  // AI Tools & Integration
  { name: 'AI Agents', icon: '🤖', level: 92, category: 'AI Tools' },
  { name: 'OpenAI API', icon: '🌟', level: 95, category: 'AI Tools' },
  { name: 'Claude API', icon: '🎭', level: 90, category: 'AI Tools' },
  { name: 'AI Integration', icon: '🔗', level: 88, category: 'AI Tools' },
  { name: 'Prompt Engineering', icon: '🎯', level: 95, category: 'AI Tools' },
  { name: 'AI-Assisted Coding', icon: '💻', level: 92, category: 'AI Tools' },
  { name: 'LangChain', icon: '🔗', level: 85, category: 'AI Tools' },
  { name: 'Hugging Face', icon: '🤗', level: 80, category: 'AI Tools' },
  
  // Core Development Skills
  { name: 'JavaScript', icon: '🟨', level: 95, category: 'Development' },
  { name: 'React', icon: '⚛️', level: 95, category: 'Development' },
  { name: 'TypeScript', icon: '🔷', level: 88, category: 'Development' },
  { name: 'Python', icon: '🐍', level: 88, category: 'Development' },
  { name: 'Node.js', icon: '💚', level: 90, category: 'Development' },
  { name: 'PHP', icon: '🐘', level: 85, category: 'Development' },
  { name: 'C#', icon: '🔵', level: 82, category: 'Development' },
  { name: 'Java', icon: '☕', level: 80, category: 'Development' },
  { name: 'Next.js', icon: '⚡', level: 88, category: 'Development' },
  { name: 'Prisma ORM', icon: '🔺', level: 88, category: 'Development' },
  { name: 'Drizzle ORM', icon: '💧', level: 82, category: 'Development' },
  { name: 'Neon Database', icon: '🟢', level: 85, category: 'Development' },
  { name: 'Payload CMS', icon: '📦', level: 85, category: 'Development' },
  { name: 'Supabase', icon: '⚡', level: 90, category: 'Development' },
  { name: 'Firebase', icon: '🔥', level: 85, category: 'Development' },
  { name: 'MongoDB', icon: '🍃', level: 85, category: 'Development' },
  { name: 'MySQL', icon: '🐬', level: 88, category: 'Development' },
  { name: 'PostgreSQL', icon: '🐘', level: 85, category: 'Development' },
  { name: 'Git/GitHub', icon: '🐙', level: 92, category: 'Development' },
  { name: 'AWS', icon: '☁️', level: 85, category: 'Development' },
  { name: 'Terraform', icon: '🏗️', level: 80, category: 'Development' },
  
  // Security Skills
  { name: 'Vulnerability Assessment', icon: '🔍', level: 85, category: 'Security' },
  { name: 'Risk Management', icon: '⚖️', level: 88, category: 'Security' },
  { name: 'Incident Response', icon: '🚨', level: 85, category: 'Security' },
  { name: 'SIEM (Splunk)', icon: '📊', level: 80, category: 'Security' },
  { name: 'Wireshark', icon: '🦈', level: 82, category: 'Security' },
  { name: 'Nessus', icon: '🔍', level: 80, category: 'Security' },
  { name: 'Burp Suite', icon: '🔧', level: 78, category: 'Security' },
  { name: 'OWASP Top 10', icon: '🛡️', level: 88, category: 'Security' },
  { name: 'Secure Coding', icon: '🔐', level: 90, category: 'Security' },
  { name: 'Active Directory', icon: '🏢', level: 88, category: 'Security' },
  { name: 'IAM Policies', icon: '👤', level: 85, category: 'Security' },
  { name: 'Network Security', icon: '🌐', level: 85, category: 'Security' },
  { name: 'ISO 27001', icon: '📋', level: 78, category: 'Security' },
  { name: 'NIST Framework', icon: '🏛️', level: 80, category: 'Security' },
  
  // IT Support Skills
  { name: 'Help Desk Management', icon: '🎧', level: 95, category: 'IT Support' },
  { name: 'Ticketing Systems', icon: '🎫', level: 92, category: 'IT Support' },
  { name: 'Remote Support', icon: '💻', level: 90, category: 'IT Support' },
  { name: 'Hardware Troubleshooting', icon: '🔧', level: 88, category: 'IT Support' },
  { name: 'Network Diagnostics', icon: '🌐', level: 85, category: 'IT Support' },
  { name: 'User Training', icon: '👥', level: 90, category: 'IT Support' },
  { name: 'System Administration', icon: '⚙️', level: 88, category: 'IT Support' },
  { name: 'Software Installation', icon: '📥', level: 92, category: 'IT Support' },
  { name: 'Windows Administration', icon: '🪟', level: 90, category: 'IT Support' },
  { name: 'macOS Support', icon: '🍎', level: 85, category: 'IT Support' }
];

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [aboutData, setAboutData] = useState<{
    title?: string;
    subtitle?: string;
    description?: string;
    profile_image?: string;
    years_experience?: number;
    projects_completed?: number;
    technical_skills?: number;
  }>({});
  const [skills, setSkills] = useState<Array<{
    name: string;
    icon?: string;
    level: number;
    category: string;
  }>>([]);

  // Load about content and skills from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load about content
        const { data: aboutData, error: aboutError } = await supabase
          .from('about_content')
          .select('*')
          .limit(1)
          .single();

        if (!aboutError && aboutData) {
          console.log('Loaded about data:', aboutData);
          console.log('Profile image URL:', aboutData.profile_image);
          setAboutData(aboutData);
        } else {
          console.log('No about data found or error:', aboutError);
        }

        // Load skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .order('level', { ascending: false });

        if (!skillsError && skillsData && skillsData.length > 0) {
          console.log('✅ Loaded skills from database:', skillsData.length, 'skills');
          console.log('First 3 skills:', skillsData.slice(0, 3));
          setSkills(skillsData);
        } else {
          console.log('❌ No skills found in database, using fallback. Error:', skillsError);
          console.log('Skills data:', skillsData);
          // Keep the hardcoded skills as fallback
          setSkills(defaultSkills);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Keep the hardcoded skills as fallback
        setSkills(defaultSkills);
      }
    };

    loadData();
  }, []);

  // Debug: Log when skills change
  useEffect(() => {
    console.log('🔄 Skills state updated:', skills.length, 'skills');
    if (skills.length > 0) {
      console.log('Categories:', [...new Set(skills.map(s => s.category))]);
    }
  }, [skills]);

  const filterButtons = ['All', 'AI Tools', 'Development', 'Security', 'IT Support'];

  const filteredSkills = activeFilter === 'All' 
    ? skills 
    : skills.filter(skill => skill.category === activeFilter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([imageRef.current, contentRef.current], {
        opacity: 0,
        y: 50
      });

      gsap.set('.skill-item', {
        opacity: 0,
        x: -30
      });

      // Main animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'bottom 30%',
          toggleActions: 'play none none reverse'
        }
      });

      tl.to(imageRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.6')
      .to('.skill-item', {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.4');

      // Skill bar animations
      filteredSkills.forEach((skill, index) => {
        gsap.to(`.skill-bar-${index}`, {
          width: `${skill.level}%`,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: `.skill-item-${index}`,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [filteredSkills]);

  return (
    <section id="about" ref={sectionRef} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {aboutData.title || "About Me"}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {aboutData.subtitle || "Passionate about creating digital solutions that make a difference"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Profile Image */}
          <div ref={imageRef} className="relative">
            <div className="relative w-80 h-80 mx-auto">
              {/* Glowing ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-xl animate-glow-pulse" />
              
              {/* Profile image container */}
              <div className="relative w-full h-full rounded-full overflow-hidden glass-card border-4 border-white/20 group hover:scale-105 transition-transform duration-500">
                <img
                  src={aboutData.profile_image || "/lovable-uploads/7957a48c-b6ce-4e62-a999-09a1565abddb.png"}
                  alt="Sajal Basnet"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  style={{ objectPosition: 'center top' }}
                  onLoad={() => console.log('Image loaded successfully:', aboutData.profile_image || 'default image')}
                  onError={(e) => {
                    console.error('Image failed to load:', aboutData.profile_image);
                    console.error('Error details:', e);
                  }}
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-secondary rounded-full animate-bounce" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold mb-4 text-glow">Developer | Security Analyst | IT Support | AI-Enhanced</h3>
              <div className="text-lg text-muted-foreground leading-relaxed">
                {aboutData.description ? (
                  aboutData.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-6 last:mb-0">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="mb-6">
                      Versatile IT professional with comprehensive expertise across software development, security analysis, and IT support. 
                      Master of Software Development – Swinburne University (Sep 2022 – May 2024) | GPA: 3.688/4.0 | Golden Key International Honour Society – Top 15% 
                      Enhanced by AI tools and modern automation to deliver innovative, efficient solutions.
                    </p>
                    <p>
                      From full-stack development with modern frameworks to implementing enterprise security solutions and providing 
                      comprehensive IT support, I leverage AI tools to enhance every aspect of my work. My experience spans from 
                      developing secure applications with AI-assisted coding to conducting security analysis with intelligent automation, 
                      while managing complex IT infrastructures and delivering exceptional user support through AI-enhanced workflows.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center glass-card p-4 rounded-xl">
                <div className="text-3xl font-bold text-primary">{aboutData.years_experience || 3}+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center glass-card p-4 rounded-xl">
                <div className="text-3xl font-bold text-secondary">{aboutData.technical_skills || 20}+</div>
                <div className="text-sm text-muted-foreground">Technical Skills</div>
              </div>
              <div className="text-center glass-card p-4 rounded-xl">
                <div className="text-3xl font-bold text-accent">{aboutData.projects_completed || 15}+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div ref={skillsRef} className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Core Technical Skills
            </span>
          </h3>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filterButtons.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? 'btn-glow text-primary-foreground'
                    : 'glass-card hover:bg-white/10 border border-white/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Debug info for skills source */}
          <div className="text-center mb-6 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200 text-sm">
            📊 Skills: {skills.length} total | Source: {skills.length === defaultSkills.length ? '🔧 Fallback' : '💾 Database'} | 
            Showing: {filteredSkills.length} {activeFilter === 'All' ? 'all' : activeFilter}
            {skills.length === defaultSkills.length && (
              <button
                onClick={async () => {
                  const testSkills = [
                    { name: 'React', level: 95, category: 'Development', icon: '⚛️' },
                    { name: 'TypeScript', level: 90, category: 'Development', icon: '🔷' },
                    { name: 'Python', level: 88, category: 'Development', icon: '🐍' },
                    { name: 'AI Integration', level: 92, category: 'AI Tools', icon: '🤖' },
                    { name: 'Cybersecurity', level: 85, category: 'Security', icon: '🛡️' }
                  ];
                  try {
                    const { data, error } = await supabase.from('skills').insert(testSkills).select();
                    if (error) throw error;
                    console.log('✅ Added test skills:', data);
                    // Reload skills
                    const { data: newSkills, error: loadError } = await supabase
                      .from('skills')
                      .select('*')
                      .order('level', { ascending: false });
                    if (!loadError && newSkills) {
                      setSkills(newSkills);
                    }
                  } catch (err) {
                    console.error('❌ Error adding test skills:', err);
                  }
                }}
                className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-xs"
              >
                + Add Test Skills
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filteredSkills.map((skill, index) => (
              <div
                key={`${skill.name}-${activeFilter}`}
                className={`skill-item skill-item-${index} glass-card p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">{skill.icon}</span>
                    <span className="font-semibold text-sm">{skill.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{skill.level}%</span>
                </div>
                
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div
                    className={`skill-bar-${index} h-2 bg-gradient-primary rounded-full transition-all duration-1000`}
                    style={{ width: '0%' }}
                  />
                </div>
                
                {/* Category Badge */}
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    skill.category === 'AI Tools' ? 'bg-purple-500/20 text-purple-300' :
                    skill.category === 'Development' ? 'bg-blue-500/20 text-blue-300' :
                    skill.category === 'Security' ? 'bg-red-500/20 text-red-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {skill.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;