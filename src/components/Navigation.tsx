import { useState, useEffect } from 'react';
import { List, X, GithubLogo, LinkedinLogo } from 'phosphor-react';
import { gsap } from 'gsap';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/10' : ''
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                SB
              </span>
            </div>

            {/* Desktop Menu - Centered */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="https://github.com/Sajal120"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full glass-card hover:bg-primary/20 transition-all duration-300"
              >
                <GithubLogo size={20} />
              </a>
              <a
                href="https://linkedin.com/in/sajal-basnet-7926aa188"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full glass-card hover:bg-primary/20 transition-all duration-300"
              >
                <LinkedinLogo size={20} />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full glass-card"
            >
              {isOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-8">
            {/* Close button */}
            <button
              onClick={toggleMenu}
              className="absolute top-6 right-6 p-2 rounded-full glass-card"
            >
              <X size={24} />
            </button>

            {/* Menu items */}
            {navItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                onClick={toggleMenu}
                className="text-2xl font-medium hover:text-primary transition-colors duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.name}
              </a>
            ))}

            {/* Mobile Social Links */}
            <div className="flex items-center space-x-6 mt-8">
              <a
                href="https://github.com/Sajal120"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full glass-card hover:bg-primary/20 transition-all duration-300"
              >
                <GithubLogo size={24} />
              </a>
              <a
                href="https://linkedin.com/in/sajal-basnet-7926aa188"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full glass-card hover:bg-primary/20 transition-all duration-300"
              >
                <LinkedinLogo size={24} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;