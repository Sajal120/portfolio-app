import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, GithubLogo, Globe } from 'phosphor-react';
import fertilityAppImage from '../assets/fertility-app-women.jpg';
import moviePlatformImage from '../assets/movie-platform.jpg';
import devopsOptimizerImage from '../assets/devops-optimizer.jpg';
import portfolio3dImage from '../assets/portfolio-3d.jpg';
import marketplaceBiddingImage from '../assets/marketplace-bidding.jpg';
import vrPlatformImage from '../assets/vr-platform.jpg';

gsap.registerPlugin(ScrollTrigger);

const ProjectsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      id: 1,
      title: "Movie Discovery Platform",
      description: "A modern movie platform built with React and TMDB API featuring real-time data, advanced search, and personalized recommendations.",
      image: moviePlatformImage,
      tech: ["React", "JavaScript", "TMDB API", "CSS3"],
      github: "https://github.com/Sajal120",
      live: "#",
      type: "Web Application"
    },
    {
      id: 2,
      title: "DevOps Cost Optimizer",
      description: "Automated AWS cost tracking solution using Terraform and Python, reducing cloud spend by 30% through intelligent resource management.",
      image: devopsOptimizerImage,
      tech: ["Python", "AWS", "Terraform", "Grafana"],
      github: "https://github.com/Sajal120",
      live: "#",
      type: "DevOps Tool"
    },
    {
      id: 3,
      title: "3D Portfolio Website",
      description: "Immersive portfolio experience featuring 3D animations, smooth scrolling, and interactive elements built with cutting-edge web technologies.",
      image: portfolio3dImage,
      tech: ["React", "Three.js", "GSAP", "Spline"],
      github: "https://github.com/Sajal120",
      live: "#",
      type: "Portfolio"
    },
    {
      id: 4,
      title: "Marketplace Bidding System",
      description: "Secure online auction platform with real-time bidding, payment integration, and comprehensive user management system.",
      image: marketplaceBiddingImage,
      tech: ["PHP", "JavaScript", "Ajax", "MySQL"],
      github: "https://github.com/Sajal120",
      live: "#",
      type: "E-commerce"
    },
    {
      id: 5,
      title: "VR Experience Platform",
      description: "Immersive VR experiences using Present4D with panoramic content optimization for multi-device compatibility.",
      image: vrPlatformImage,
      tech: ["VR", "Present4D", "JavaScript", "WebXR"],
      github: "https://github.com/Sajal120",
      live: "#",
      type: "VR Application"
    },
    {
      id: 6,
      title: "Fertility Health App",
      description: "Cross-platform women's health application built with Xamarin featuring cycle tracking, interactive charts and data visualization for informed reproductive health decisions.",
      image: fertilityAppImage,
      tech: ["Xamarin", "C#", "Charts", "Mobile"],
      github: "https://github.com/Sajal120",
      live: "#",
      type: "Mobile App"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set('.project-card', {
        opacity: 0,
        y: 100,
        scale: 0.8
      });

      // Animate cards on scroll
      gsap.to('.project-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: projectsRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });

      // Individual card hover animations
      const cards = document.querySelectorAll('.project-card');
      cards.forEach((card) => {
        const image = card.querySelector('.project-image');
        const overlay = card.querySelector('.project-overlay');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(image, { scale: 1.1, duration: 0.5, ease: 'power2.out' });
          gsap.to(overlay, { opacity: 1, duration: 0.3 });
          gsap.to(card, { y: -10, duration: 0.3, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(image, { scale: 1, duration: 0.5, ease: 'power2.out' });
          gsap.to(overlay, { opacity: 0, duration: 0.3 });
          gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Showcasing innovative solutions built with cutting-edge technologies
          </p>
        </div>

        <div ref={projectsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card glass-card rounded-2xl overflow-hidden group cursor-pointer"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-image w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="project-overlay absolute inset-0 bg-gradient-primary/80 opacity-0 flex items-center justify-center gap-4 transition-opacity duration-300">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GithubLogo size={20} />
                  </a>
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe size={20} />
                  </a>
                </div>

                {/* Project Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
                    {project.type}
                  </span>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted/30 rounded-md text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">View Details</span>
                  <ArrowUpRight 
                    size={20} 
                    className="group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Projects Button */}
        <div className="text-center mt-12">
          <a
            href="https://github.com/Sajal120"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 glass-card hover:bg-white/10 transition-all duration-300 rounded-full border border-white/20 group"
          >
            View All Projects
            <ArrowUpRight 
              size={20} 
              className="group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" 
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;