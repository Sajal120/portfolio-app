import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const DataSeeder: React.FC = () => {
  const [seeding, setSeeding] = useState(false);

  const seedContactInfo = async () => {
    const contactData = [
      {
        type: 'email',
        label: 'Email',
        value: 'basnetsajal120@gmail.com',
        icon: '📧',
        is_public: true,
        display_order: 1
      },
      {
        type: 'phone',
        label: 'Phone',
        value: '+61 424 425 793',
        icon: '📱',
        is_public: true,
        display_order: 2
      },
      {
        type: 'address',
        label: 'Location',
        value: 'Auburn, Sydney, NSW',
        icon: '📍',
        is_public: true,
        display_order: 3
      },
      {
        type: 'github',
        label: 'GitHub',
        value: 'https://github.com/Sajal120',
        icon: '👨‍💻',
        is_public: true,
        display_order: 4
      },
      {
        type: 'linkedin',
        label: 'LinkedIn',
        value: 'https://linkedin.com/in/sajal-basnet-7926aa188',
        icon: '💼',
        is_public: true,
        display_order: 5
      }
    ];

    for (const contact of contactData) {
      await supabase.from('contact_info').upsert({
        ...contact,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const seedSkills = async () => {
    const skillsData = [
      { name: 'React', level: 90, category: 'Frontend', icon: '⚛️' },
      { name: 'TypeScript', level: 85, category: 'Frontend', icon: '📘' },
      { name: 'JavaScript', level: 90, category: 'Frontend', icon: '📜' },
      { name: 'Node.js', level: 80, category: 'Backend', icon: '💚' },
      { name: 'Python', level: 85, category: 'Backend', icon: '🐍' },
      { name: 'PostgreSQL', level: 75, category: 'Database', icon: '🐘' },
      { name: 'MongoDB', level: 70, category: 'Database', icon: '🍃' },
      { name: 'Docker', level: 80, category: 'DevOps', icon: '🐳' },
      { name: 'AWS', level: 75, category: 'DevOps', icon: '☁️' },
      { name: 'Git', level: 90, category: 'Tools', icon: '🌳' },
      { name: 'Figma', level: 70, category: 'Design', icon: '🎨' },
      { name: 'Tailwind CSS', level: 85, category: 'Frontend', icon: '💨' }
    ];

    for (const skill of skillsData) {
      await supabase.from('skills').upsert({
        ...skill,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const seedAboutContent = async () => {
    const aboutData = {
      title: 'About Me',
      subtitle: 'Passionate Developer & IT Specialist',
      description: `I am a dedicated full-stack developer with expertise in modern web technologies and IT infrastructure. 

My passion lies in creating innovative solutions that bridge the gap between complex technical challenges and user-friendly experiences. With a strong background in software development, system administration, and cybersecurity, I bring a comprehensive approach to every project.

I'm actively seeking opportunities in IT Support, Software Development, and Security Analysis where I can contribute to building secure, scalable, and efficient systems.`,
      profile_image: '',
      years_experience: 3,
      projects_completed: 25,
      technical_skills: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await supabase.from('about_content').upsert(aboutData);
  };

  const seedHeroContent = async () => {
    const heroData = {
      name: 'Sajal Basnet',
      title: 'IT Professional & Full-Stack Developer',
      subtitle: 'Specializing in Support, Security, and Development',
      description: 'Dedicated to protecting systems, solving complex problems, and building secure digital solutions. Ready to strengthen your technology infrastructure.',
      cta_text: 'Get In Touch',
      cta_link: '#contact',
      background_image: '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await supabase.from('hero_content').upsert(heroData);
  };

  const seedSampleProjects = async () => {
    const projectsData = [
      {
        title: 'Portfolio Website',
        description: 'A modern, responsive portfolio website built with React, TypeScript, and Supabase. Features a complete CMS for content management.',
        short_description: 'Modern portfolio with CMS',
        technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
        github_url: 'https://github.com/Sajal120/orbital-aura-portfolio',
        live_url: '',
        image_url: '',
        category: 'Web Development',
        is_featured: true,
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'DevOps Automation Tool',
        description: 'An automation tool for streamlining deployment processes and infrastructure management. Includes CI/CD pipeline integration.',
        short_description: 'DevOps automation and CI/CD',
        technologies: ['Python', 'Docker', 'AWS', 'Jenkins'],
        github_url: '',
        live_url: '',
        image_url: '',
        category: 'DevOps',
        is_featured: true,
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'Security Analysis Dashboard',
        description: 'A comprehensive security monitoring dashboard for analyzing system vulnerabilities and threat detection.',
        short_description: 'Security monitoring and analysis',
        technologies: ['Python', 'React', 'PostgreSQL', 'Docker'],
        github_url: '',
        live_url: '',
        image_url: '',
        category: 'Security',
        is_featured: false,
        is_active: true,
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const project of projectsData) {
      await supabase.from('projects').upsert(project);
    }
  };

  const seedSampleMessages = async () => {
    const messagesData = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        subject: 'Project Collaboration Inquiry',
        message: 'Hi Sajal, I came across your portfolio and I\'m impressed with your work in full-stack development. We have an exciting project coming up and would love to discuss potential collaboration. Could we schedule a call?',
        is_read: false,
        is_replied: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@techcorp.com',
        subject: 'IT Support Role',
        message: 'Hello, we have an IT Support position available that seems to match your skillset perfectly. The role involves system administration, troubleshooting, and security implementation. Would you be interested in learning more?',
        is_read: true,
        is_replied: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        name: 'Mike Chen',
        email: 'mike.chen@startup.io',
        subject: 'Security Consultation',
        message: 'We\'re a growing startup looking to strengthen our cybersecurity posture. Your background in security analysis caught our attention. Would you be available for a consultation to discuss our security needs?',
        is_read: false,
        is_replied: false,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
      }
    ];

    for (const message of messagesData) {
      await supabase.from('contact_messages').upsert(message);
    }
  };

  const runFullSeeder = async () => {
    try {
      setSeeding(true);
      
      toast.loading('Seeding database with sample data...');
      
      await seedHeroContent();
      await seedAboutContent();
      await seedContactInfo();
      await seedSkills();
      await seedSampleProjects();
      await seedSampleMessages();
      
      toast.dismiss();
      toast.success('Database seeded successfully! Your portfolio now has sample content.');
      
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.dismiss();
      toast.error('Failed to seed database. Check console for details.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Data Seeder
          </span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Populate your portfolio with sample content and data
        </p>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Initialize Portfolio Content</CardTitle>
          <CardDescription>
            This will populate your database with sample content including hero section, about content, 
            skills, projects, contact information, and sample messages. Perfect for getting started quickly!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">What will be created:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Hero section content</li>
                <li>• About section with profile info</li>
                <li>• 12 technical skills with proficiency levels</li>
                <li>• 3 sample projects</li>
                <li>• Complete contact information</li>
                <li>• 3 sample contact messages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Safe to run:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Uses upsert - won't duplicate data</li>
                <li>• Can be run multiple times safely</li>
                <li>• Only adds missing content</li>
                <li>• Won't overwrite existing data</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={runFullSeeder}
              disabled={seeding}
              className="btn-glow"
              size="lg"
            >
              {seeding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Seeding Database...
                </>
              ) : (
                '🌱 Seed Database with Sample Content'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSeeder;