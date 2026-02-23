import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Sobre nós', href: '#sobre' },
    { name: 'Equipa', href: '#equipa' },
    { name: 'Galeria', href: '#galeria' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contactos', href: '#footer' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[rgb(var(--nav-bg)/0.95)] backdrop-blur-md py-4 shadow-lg border-b border-primary/10' : 'bg-transparent py-8'}`}>
      {/* Dynamic top gradient for visibility on transparent mode */}
      {!scrolled && (
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[rgb(var(--nav-gradient)/0.8)] to-transparent pointer-events-none -z-10"></div>
      )}

      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className={`font-serif text-2xl font-bold tracking-tighter transition-colors duration-300 ${scrolled ? 'text-dark' : 'text-white'}`}>
          TO<span className="text-primary italic">Beauty</span>
        </Link>

        {/* Desktop Links */}
        <div className={`hidden lg:flex items-center gap-10 ${scrolled ? 'text-dark' : 'text-white'}`}>
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-[10px] font-bold uppercase tracking-[0.25em] hover:text-primary transition-all duration-300 drop-shadow-sm"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#agendamento"
            className={`px-6 py-2.5 rounded-custom text-xs font-bold transition-all duration-300 shadow-md flex items-center gap-2 ${
              scrolled 
                ? 'bg-main text-white hover:bg-primary border border-border-main' 
                : 'bg-card text-main border border-border-main hover:bg-primary hover:text-white'
            }`}
          >
            AGENDAR AGORA
          </a>

          <Link
            to="/admin"
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 group ${
              scrolled ? 'text-gray-400 hover:text-dark' : 'text-white/70 hover:text-white'
            }`}
          >
            <div className={`p-2 border border-border-main rounded-full transition-colors ${scrolled ? 'bg-card group-hover:bg-primary group-hover:text-white' : 'bg-main/50 group-hover:bg-primary'}`}>
              <LogIn size={14} />
            </div>
            <span>LOGIN</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`lg:hidden p-2 transition-colors duration-300 ${scrolled ? 'text-dark' : 'text-white'}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border-main overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-8 space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-main font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#agendamento"
                className="btn-dark text-center py-4"
                onClick={() => setIsOpen(false)}
              >
                AGENDAR AGORA
              </a>
              <Link
                to="/admin"
                className="flex items-center justify-center gap-3 py-4 border-t border-border-main text-main font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LogIn size={18} />
                ADMIN LOGIN
              </Link>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
